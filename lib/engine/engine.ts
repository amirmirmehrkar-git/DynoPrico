import type {
  ChannelId,
  Context,
  FactorBreakdown,
  FactorWeights,
  IntegrationTarget,
  Product,
  Recommendation,
  RecommendedAction,
  RiskLevel,
} from './types';

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));

const levelToNum = (l: 'low' | 'medium' | 'high') =>
  l === 'low' ? 0 : l === 'medium' ? 0.5 : 1;

/** Round to attractive psychological price points (€x.90 / €x.50). */
function roundAttractive(price: number): number {
  if (price <= 0) return 0;
  const floorInt = Math.floor(price);
  const candidates = [
    floorInt - 0.1, // x.90 below
    floorInt + 0.5, // x.50
    floorInt + 0.9, // x.90
  ].filter((c) => c > 0);
  // pick the candidate closest to price but not above it where possible
  let best = candidates[0];
  let bestDist = Infinity;
  for (const c of candidates) {
    const dist = Math.abs(c - price);
    if (dist < bestDist) {
      bestDist = dist;
      best = c;
    }
  }
  return Math.round(best * 100) / 100;
}

function riskLevelFor(score: number): RiskLevel {
  if (score >= 70) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
}

interface FactorResult {
  raw: number;
  detail: string;
}

function computeFactors(
  product: Product,
  ctx: Context,
): Record<keyof FactorWeights, FactorResult> {
  const surplusRatio = product.inventory / Math.max(product.expectedDemand, 1);

  // 1. Inventory surplus — ratio of 1 = balanced (0), 3x = saturated (100)
  const inventorySurplus: FactorResult = {
    raw: clamp((surplusRatio - 1) * 50),
    detail: `Inventory is ${surplusRatio.toFixed(1)}x expected demand.`,
  };

  // 2. Expiry urgency — fewer hours = higher. 0h=100, 12h+=0
  const expiryUrgency: FactorResult = {
    raw: clamp(((12 - product.hoursUntilExpiry) / 12) * 100),
    detail: `${product.hoursUntilExpiry}h until expiry.`,
  };

  // 3. Historical demand weakness — lower sell-through = higher risk
  const historicalDemand: FactorResult = {
    raw: clamp((1 - product.historicalSellThroughRate) * 100),
    detail: `Sell-through ${(product.historicalSellThroughRate * 100).toFixed(0)}%.`,
  };

  // 4. Weather — rain/storm raises in-store waste risk
  const weatherMap = { sunny: -10, cloudy: 10, rain: 65, storm: 80 } as const;
  const weatherRaw = clamp(
    weatherMap[ctx.weather.condition] +
      (ctx.weather.rainIntensity === 'heavy' ? 15 : ctx.weather.rainIntensity === 'medium' ? 8 : 0),
  );
  const weather: FactorResult = {
    raw: weatherRaw,
    detail: `${ctx.weather.condition} reduces walk-in demand.`,
  };

  // 5. Traffic — low foot traffic raises in-store risk
  const traffic: FactorResult = {
    raw: clamp((1 - levelToNum(ctx.traffic.footTraffic)) * 100),
    detail: `${ctx.traffic.footTraffic} foot traffic.`,
  };

  // 6. Event — a later nearby event reduces urgency to discount now (negative)
  let eventRaw = 0;
  let eventDetail = 'No nearby event.';
  if (ctx.event.type !== 'none') {
    const startHour = parseInt(ctx.event.startTime.split(':')[0] ?? '0', 10);
    const isLater = startHour >= 17;
    const proximity = ctx.event.distanceKm <= 2 ? 1 : ctx.event.distanceKm <= 5 ? 0.5 : 0.2;
    eventRaw = isLater ? -40 * proximity : 25 * proximity;
    eventDetail = isLater
      ? `${ctx.event.name} at ${ctx.event.startTime} may lift later demand.`
      : `${ctx.event.name} nearby is raising current demand.`;
  }
  const event: FactorResult = { raw: eventRaw, detail: eventDetail };

  // 7. Day/time — afternoon slowdown raises bakery waste risk
  const timeMap = { morning: 10, lunch: 0, afternoon: 55, evening: 35 } as const;
  const dayTime: FactorResult = {
    raw: clamp(timeMap[ctx.dayContext.timeOfDay]),
    detail: `${ctx.dayContext.timeOfDay} demand pattern.`,
  };

  // 8. Margin protection — limits aggressive discounting (raises "caution")
  const sensMap = { low: 20, medium: 50, high: 80 } as const;
  const marginProtection: FactorResult = {
    raw: sensMap[product.marginSensitivity],
    detail: `${product.marginSensitivity} margin sensitivity.`,
  };

  return {
    inventorySurplus,
    expiryUrgency,
    historicalDemand,
    weather,
    traffic,
    event,
    dayTime,
    marginProtection,
  };
}

const FACTOR_LABELS: Record<keyof FactorWeights, string> = {
  inventorySurplus: 'Inventory Surplus',
  expiryUrgency: 'Expiry Urgency',
  historicalDemand: 'Historical Demand',
  weather: 'Weather',
  traffic: 'Traffic / Footfall',
  event: 'Event Impact',
  dayTime: 'Day / Time',
  marginProtection: 'Margin Protection',
};

// Factors that push toward MORE discounting (margin protection pulls the other way).
const RISK_FACTORS: (keyof FactorWeights)[] = [
  'inventorySurplus',
  'expiryUrgency',
  'historicalDemand',
  'weather',
  'traffic',
  'event',
  'dayTime',
];

function discountForRisk(score: number, hoursUntilExpiry: number): number {
  let pct: number;
  if (score >= 70) pct = 0.2 + ((score - 70) / 30) * 0.1; // 20–30%
  else if (score >= 40) pct = 0.1 + ((score - 40) / 30) * 0.05; // 10–15%
  else pct = (score / 40) * 0.05; // 0–5%
  // critical expiry escalation
  if (hoursUntilExpiry <= 3) pct = Math.max(pct, 0.4);
  return pct;
}

export function computeRecommendation(
  product: Product,
  ctx: Context,
  weights: FactorWeights,
): Recommendation {
  const results = computeFactors(product, ctx);

  const factors: FactorBreakdown[] = (Object.keys(results) as (keyof FactorWeights)[]).map(
    (key) => {
      const r = results[key];
      const weight = weights[key];
      // margin protection lowers net risk, so it contributes negatively to risk score
      const sign = key === 'marginProtection' ? -1 : 1;
      return {
        key,
        label: FACTOR_LABELS[key],
        rawScore: Math.round(r.raw),
        weight,
        weighted: Math.round(r.raw * weight * sign),
        detail: r.detail,
      };
    },
  );

  // Weighted average over risk factors, then margin protection dampens it.
  let weightSum = 0;
  let weighted = 0;
  for (const key of RISK_FACTORS) {
    weighted += results[key].raw * weights[key];
    weightSum += weights[key];
  }
  let score = weightSum > 0 ? weighted / weightSum : 0;
  // margin protection reduces final score proportionally
  const marginDamp = (results.marginProtection.raw / 100) * weights.marginProtection * 0.25;
  score = clamp(score * (1 - marginDamp));
  const riskScore = Math.round(score);
  const riskLevel = riskLevelFor(riskScore);

  // Pricing
  const discountPct = discountForRisk(riskScore, product.hoursUntilExpiry);
  const floor = product.cost * ctx.minMarginThreshold;
  let recommendedPrice = product.currentPrice * (1 - discountPct);
  recommendedPrice = roundAttractive(recommendedPrice);
  let marginNote = 'Within margin threshold.';
  if (recommendedPrice < floor) {
    recommendedPrice = roundAttractive(floor + 0.4);
    if (recommendedPrice < floor) recommendedPrice = Math.round(floor * 100) / 100;
    marginNote = `Clamped to margin floor (cost x${ctx.minMarginThreshold}).`;
  }
  if (recommendedPrice > product.currentPrice) recommendedPrice = product.currentPrice;
  const effectiveDiscount = Math.round(
    (1 - recommendedPrice / product.currentPrice) * 100,
  );

  const surplusRatio = product.inventory / Math.max(product.expectedDemand, 1);

  const recommendedActions = buildActions(product, ctx, recommendedPrice);
  const reasoning = buildReasoning(product, ctx, riskScore, surplusRatio);

  // confidence: more signal (extreme scores, fresh context) -> higher
  const confidence = clamp(
    72 +
      Math.round(Math.abs(riskScore - 50) / 4) +
      (ctx.event.type !== 'none' ? 5 : 0),
    50,
    97,
  );

  return {
    productId: product.id,
    productName: product.name,
    category: product.category,
    riskScore,
    riskLevel,
    currentPrice: product.currentPrice,
    cost: product.cost,
    recommendedPrice,
    discountPercent: effectiveDiscount,
    timeWindow: '15:30–18:00',
    inventory: product.inventory,
    expectedDemand: product.expectedDemand,
    hoursUntilExpiry: product.hoursUntilExpiry,
    surplusRatio: Math.round(surplusRatio * 10) / 10,
    recommendedActions,
    reasoning,
    factors,
    marginCheck: {
      floor: Math.round(floor * 100) / 100,
      passed: recommendedPrice >= floor,
      note: marginNote,
    },
    confidence,
  };
}

function buildActions(
  product: Product,
  ctx: Context,
  recommendedPrice: number,
): RecommendedAction[] {
  const actions: RecommendedAction[] = [];
  const rainy = ctx.weather.condition === 'rain' || ctx.weather.condition === 'storm';

  // In-store bundle
  actions.push({
    actionType: 'bundle',
    title: product.category === 'Bakery' ? 'Bundle with Coffee' : 'Combo Deal',
    channel: 'in_store',
    price: roundAttractivePublic(recommendedPrice + 1.4),
    reason:
      ctx.traffic.footTraffic === 'low'
        ? 'In-store walk-ins are weak, but bundling can lift conversion.'
        : 'Bundling drives impulse purchases for in-store traffic.',
  });

  // Delivery
  actions.push({
    actionType: 'delivery_offer',
    title: rainy ? 'Delivery Add-on' : 'Delivery Discount',
    channel: 'delivery',
    price: rainy
      ? roundAttractivePublic(product.currentPrice * 0.92)
      : roundAttractivePublic(recommendedPrice),
    reason: rainy
      ? 'Rain may increase delivery demand, so avoid excessive discount.'
      : 'Standard delivery promotion to move inventory.',
  });

  // Partner bulk when surplus is high
  const surplus = product.inventory / Math.max(product.expectedDemand, 1);
  if (surplus >= 1.8) {
    const units = Math.max(10, Math.round(product.inventory * 0.5));
    actions.push({
      actionType: 'partner_bulk',
      title: `Office Bundle (${units} units)`,
      channel: 'partner_network',
      price: roundAttractivePublic(product.cost * units * 1.25),
      reason: 'High surplus can be cleared through nearby office partners.',
    });
  }

  // Digital menu update
  actions.push({
    actionType: 'menu_update',
    title: 'Update Menu Price',
    channel: 'digital_menu',
    price: recommendedPrice,
    reason: `Push €${product.currentPrice.toFixed(2)} → €${recommendedPrice.toFixed(
      2,
    )} for the campaign window.`,
  });

  return actions;
}

function roundAttractivePublic(price: number): number {
  const floorInt = Math.floor(price);
  const candidates = [floorInt - 0.1, floorInt + 0.5, floorInt + 0.9].filter((c) => c > 0);
  let best = candidates[0] ?? price;
  let bestDist = Infinity;
  for (const c of candidates) {
    const d = Math.abs(c - price);
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return Math.round(best * 100) / 100;
}

function buildReasoning(
  product: Product,
  ctx: Context,
  riskScore: number,
  surplusRatio: number,
) {
  const numerical = [
    `Inventory is ${surplusRatio.toFixed(1)}x expected demand (${product.inventory} vs ${product.expectedDemand}).`,
    `${product.hoursUntilExpiry} hours remain before expiry.`,
    `Demand forecast gap of ${Math.max(0, product.inventory - product.expectedDemand)} units.`,
    `Computed risk score: ${riskScore}/100.`,
  ];

  const contextual: string[] = [];
  if (ctx.weather.condition === 'rain' || ctx.weather.condition === 'storm') {
    contextual.push('Rain is reducing in-store foot traffic.');
    contextual.push('Delivery demand is likely to increase because of the weather.');
  } else {
    contextual.push(`Weather is ${ctx.weather.condition} (${ctx.weather.temperature}°C).`);
  }
  contextual.push(`Foot traffic is ${ctx.traffic.footTraffic}.`);
  if (ctx.event.type !== 'none') {
    contextual.push(
      `${ctx.event.name} at ${ctx.event.startTime} (${ctx.event.distanceKm}km) may raise evening demand, so the discount window is limited.`,
    );
  }
  contextual.push(`It is ${ctx.dayContext.timeOfDay} on ${ctx.dayContext.dayOfWeek}.`);

  const business = [
    'Reduce waste by moving surplus before expiry.',
    `Protect margin: never price below cost €${product.cost.toFixed(2)} × ${ctx.minMarginThreshold}.`,
    'Recover revenue with targeted, channel-specific offers.',
    'Choose the best channel per current demand conditions.',
  ];

  return { numerical, contextual, business };
}

export function computeAll(
  products: Product[],
  ctx: Context,
  weights: FactorWeights,
): Recommendation[] {
  return products.map((p) => computeRecommendation(p, ctx, weights));
}

export function buildIntegrationTargets(rec: Recommendation): IntegrationTarget[] {
  const hasDelivery = rec.recommendedActions.some((a) => a.channel === 'delivery');
  const hasPartner = rec.recommendedActions.some((a) => a.channel === 'partner_network');
  return [
    { name: 'Lieferando', group: 'delivery', status: hasDelivery ? 'Scheduled' : 'Ready' },
    { name: 'Wolt', group: 'delivery', status: hasDelivery ? 'Scheduled' : 'Ready' },
    { name: 'Uber Eats', group: 'delivery', status: 'Placeholder integration' },
    { name: 'POS', group: 'forward', status: 'Published' },
    { name: 'Digital Menu', group: 'forward', status: 'Published' },
    { name: 'In-Store Display', group: 'forward', status: 'Published' },
    { name: 'E-ink Price Tags', group: 'forward', status: 'Scheduled' },
    {
      name: 'Partner Network',
      group: 'forward',
      status: hasPartner ? 'Ready' : 'Placeholder integration',
    },
  ];
}

export const CHANNEL_LABELS: Record<ChannelId, string> = {
  in_store: 'In-Store',
  delivery: 'Delivery',
  partner_network: 'Partner Network',
  digital_menu: 'Digital Menu / POS',
};
