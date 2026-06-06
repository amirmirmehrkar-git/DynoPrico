import {
  Channel,
  DecisionContext,
  DecisionWeights,
  Product,
  Recommendation,
  RecommendedAction,
  RiskLevel,
  ScoreFactor
} from "./types";

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const money = (value: number) => Number(value.toFixed(2));
const pct = (value: number) => Math.round(value);

function levelScore(level: "low" | "medium" | "high", low: number, medium: number, high: number) {
  return { low, medium, high }[level];
}

function weatherRisk(context: DecisionContext) {
  if (context.weather.condition === "storm") return 88;
  if (context.weather.condition === "rain") {
    return context.weather.rainIntensity === "high" ? 82 : context.weather.rainIntensity === "medium" ? 72 : 62;
  }
  if (context.weather.condition === "sunny") return 18;
  return 38;
}

function eventAdjustment(product: Product, context: DecisionContext) {
  if (context.event.type === "none") return 45;
  const nearby = context.event.distanceKm <= 2 ? 1 : context.event.distanceKm <= 5 ? 0.65 : 0.25;
  const attendanceLift = Math.min(context.event.expectedAttendance / 15000, 1);
  const bakeryEarlyCaution = product.category === "Bakery" && context.dayContext.timeOfDay === "afternoon" ? -18 : 0;
  return clamp(58 - nearby * attendanceLift * 34 + bakeryEarlyCaution, 12, 70);
}

function dayTimeRisk(product: Product, context: DecisionContext) {
  const base = {
    morning: product.category === "Bakery" ? 24 : 38,
    lunch: product.category === "Ready Meal" || product.category === "Fresh" ? 24 : 40,
    afternoon: product.category === "Bakery" ? 70 : 52,
    evening: product.category === "Ready Meal" ? 48 : 66
  }[context.dayContext.timeOfDay];
  return context.dayContext.isHoliday ? clamp(base + 10) : base;
}

function channelDemandRisk(context: DecisionContext) {
  const localRisk = levelScore(context.channelDemand.localDemand, 78, 48, 18);
  const deliveryRisk = levelScore(context.channelDemand.deliveryDemand, 72, 46, 16);
  const partnerRisk = levelScore(context.channelDemand.partnerDemand, 58, 42, 24);
  return Math.round(localRisk * 0.45 + deliveryRisk * 0.35 + partnerRisk * 0.2);
}

function attractivePrice(target: number, minAllowed: number, currentPrice: number) {
  const endings = [0, 0.5, 0.9];
  const candidates: number[] = [];
  for (let whole = 1; whole <= Math.ceil(currentPrice) + 1; whole += 1) {
    endings.forEach((ending) => candidates.push(money(whole + ending)));
  }
  const valid = candidates.filter((candidate) => candidate >= minAllowed && candidate <= currentPrice);
  if (!valid.length) return money(Math.min(currentPrice, Math.max(minAllowed, target)));
  return valid.reduce((best, candidate) =>
    Math.abs(candidate - target) < Math.abs(best - target) ? candidate : best
  );
}

function riskLevel(score: number): RiskLevel {
  if (score >= 70) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

function baseDiscount(score: number, product: Product) {
  let discount = score < 40 ? 3 + score * 0.11 : score < 70 ? 12 + (score - 40) * 0.32 : 24 + (score - 70) * 0.42;
  if (product.hoursUntilExpiry <= 3) discount += 8;
  if (product.hoursUntilExpiry <= 1) discount += 8;
  if (product.marginSensitivity === "high") discount -= 4;
  if (product.marginSensitivity === "low") discount += 2;
  return clamp(discount, 0, 40);
}

function priceFromScore(product: Product, score: number, minAllowed: number) {
  const discount = baseDiscount(score, product);
  const targetPrice = product.currentPrice * (1 - discount / 100);
  const roundedPrice = attractivePrice(targetPrice, minAllowed, product.currentPrice);
  const price = Math.max(roundedPrice, minAllowed);
  return {
    price: money(price),
    discountPercent: pct((1 - price / product.currentPrice) * 100)
  };
}

function timeWindow(context: DecisionContext, product: Product) {
  if (product.hoursUntilExpiry <= 4) return "Now-18:00";
  if (context.dayContext.timeOfDay === "afternoon") return "15:30-18:00";
  if (context.dayContext.timeOfDay === "lunch") return "12:00-14:30";
  if (context.dayContext.timeOfDay === "evening") return "18:00-20:30";
  return "08:00-11:00";
}

function channelPrice(product: Product, basePrice: number, channel: Channel, context: DecisionContext, minAllowed: number) {
  let modifier = 1;
  if (channel === "in_store" && context.traffic.footTraffic === "low") modifier = 0.94;
  if (channel === "delivery" && context.weather.condition === "rain" && context.channelDemand.deliveryDemand === "high") modifier = 1.06;
  if (channel === "partner_network") modifier = 0.88;
  if (channel === "digital_menu") modifier = 1;
  return attractivePrice(basePrice * modifier, minAllowed, product.currentPrice);
}

function channelRiskScores(
  baseScore: number,
  context: DecisionContext,
  weights: DecisionWeights,
  factorScores: {
    weatherRiskScore: number;
    trafficRiskScore: number;
    channelDemandScore: number;
    eventAdjustmentScore: number;
    dailySalesScore: number;
  }
) {
  const localDemandPressure = levelScore(context.channelDemand.localDemand, 12, 0, -10) * weights.channelDemand;
  const deliveryDemandPressure = levelScore(context.channelDemand.deliveryDemand, 10, 0, -14) * weights.channelDemand;
  const partnerDemandRelief = levelScore(context.channelDemand.partnerDemand, 0, 3, 8) * weights.channelDemand;
  const rainDeliveryRelief =
    context.weather.condition === "rain" || context.weather.condition === "storm" ? 9 * weights.weather : 0;
  const eventDemandRelief =
    context.event.type === "none" ? 0 : Math.max(0, 50 - factorScores.eventAdjustmentScore) * weights.event * 0.18;

  const localRiskScore = clamp(
    baseScore +
      (factorScores.weatherRiskScore - 50) * weights.weather * 0.5 +
      (factorScores.trafficRiskScore - 50) * weights.traffic * 0.16 +
      localDemandPressure -
      partnerDemandRelief * 0.2 +
      (factorScores.dailySalesScore - 50) * weights.salesPace * 0.1 +
      (factorScores.eventAdjustmentScore - 50) * weights.event * 0.08
  );

  const deliveryRiskScore = clamp(
    baseScore -
      rainDeliveryRelief -
      eventDemandRelief +
      deliveryDemandPressure -
      partnerDemandRelief * 0.25 +
      (factorScores.dailySalesScore - 50) * weights.salesPace * 0.08 +
      (context.traffic.areaCongestion === "high" ? 7 : context.traffic.areaCongestion === "medium" ? 3 : 0)
  );

  return {
    localRiskScore: Math.round(localRiskScore),
    deliveryRiskScore: Math.round(deliveryRiskScore)
  };
}

function buildActions(
  product: Product,
  recommendationPrice: number,
  discountPercent: number,
  context: DecisionContext,
  score: number,
  minAllowed: number
): RecommendedAction[] {
  const inStorePrice = channelPrice(product, recommendationPrice, "in_store", context, minAllowed);
  const deliveryPrice = channelPrice(product, recommendationPrice, "delivery", context, minAllowed);
  const partnerUnits = Math.min(product.inventory, product.category === "Bakery" ? 20 : 10);
  const partnerPrice = money(Math.max(minAllowed * partnerUnits, recommendationPrice * partnerUnits * 0.82));
  const displayPrice = channelPrice(product, recommendationPrice, "digital_menu", context, minAllowed);

  return [
    {
      actionType: "bundle",
      title: product.category === "Bakery" ? "Bundle with Coffee" : "Meal Deal Push",
      channel: "in_store",
      price: product.category === "Bakery" ? money(inStorePrice + 2) : money(inStorePrice + 1.5),
      discountPercent: pct((1 - inStorePrice / product.currentPrice) * 100),
      status: score >= 45 ? "Ready" : "Scheduled",
      reason:
        context.traffic.footTraffic === "low"
          ? "In-store walk-ins are weak, so the display should create an impulse purchase with a stronger local offer."
          : "Walk-in traffic can support a lighter discount paired with a visible bundle."
    },
    {
      actionType: "delivery_offer",
      title: context.weather.condition === "rain" ? "Delivery Add-on" : "Delivery Feature Slot",
      channel: "delivery",
      price: deliveryPrice,
      discountPercent: pct((1 - deliveryPrice / product.currentPrice) * 100),
      status: context.channelDemand.deliveryDemand === "high" ? "Ready" : "Placeholder integration",
      reason:
        context.weather.condition === "rain" && context.channelDemand.deliveryDemand === "high"
          ? "Rain is lifting delivery demand, so protect margin and use a small price move or add-on instead of a deep cut."
          : "Delivery can clear inventory gradually when demand is steady and the product travels well."
    },
    {
      actionType: "partner_bulk",
      title: product.category === "Bakery" ? "Office Bakery Box" : "Team Lunch Pack",
      channel: "partner_network",
      price: partnerPrice,
      discountPercent: pct((1 - partnerPrice / (product.currentPrice * partnerUnits)) * 100),
      status: score >= 70 ? "Ready" : "Scheduled",
      reason:
        product.inventory / product.expectedDemand > 2
          ? "High surplus can be cleared through nearby office or partner channels before expiry."
          : "Partner network remains a fallback if normal channels underperform."
    },
    {
      actionType: "digital_update",
      title: "POS and Display Price Update",
      channel: "digital_menu",
      price: displayPrice,
      discountPercent,
      status: "Published",
      reason: `Update menu price from EUR ${product.currentPrice.toFixed(2)} to EUR ${displayPrice.toFixed(2)} during the active decision window.`
    }
  ];
}

export function generateRecommendations(
  products: Product[],
  context: DecisionContext,
  weights: DecisionWeights,
  marginThreshold: number
): Recommendation[] {
  return products.map((product) => {
    const surplusRatio = product.inventory / Math.max(product.expectedDemand, 1);
    const demandGap = product.inventory - product.expectedDemand;
    const inventorySurplusScore = clamp((surplusRatio - 1) * 45);
    const expiryUrgencyScore = clamp(100 - product.hoursUntilExpiry * 8.5);
    const historicalDemandScore = clamp((1 - product.historicalSellThroughRate) * 100);
    const weatherRiskScore = weatherRisk(context);
    const trafficRiskScore = levelScore(context.traffic.footTraffic, 78, 48, 18);
    const channelDemandScore = channelDemandRisk(context);
    const eventAdjustmentScore = eventAdjustment(product, context);
    const dayTimeScore = dayTimeRisk(product, context);
    const dailySalesRatio = product.todaysSales / Math.max(product.salesTargetToday, 1);
    const dailySalesScore = clamp((1 - dailySalesRatio) * 100);

    const factors: ScoreFactor[] = [
      {
        key: "inventorySurplus",
        label: "Inventory surplus",
        rawScore: inventorySurplusScore,
        weight: weights.inventorySurplus,
        weightedScore: inventorySurplusScore * weights.inventorySurplus,
        reason: `${surplusRatio.toFixed(1)}x inventory versus expected demand`
      },
      {
        key: "expiryUrgency",
        label: "Expiry urgency",
        rawScore: expiryUrgencyScore,
        weight: weights.expiryUrgency,
        weightedScore: expiryUrgencyScore * weights.expiryUrgency,
        reason: `${product.hoursUntilExpiry} hours until expiry`
      },
      {
        key: "historicalDemand",
        label: "Historical demand",
        rawScore: historicalDemandScore,
        weight: weights.historicalDemand,
        weightedScore: historicalDemandScore * weights.historicalDemand,
        reason: `${Math.round(product.historicalSellThroughRate * 100)}% historical sell-through`
      },
      {
        key: "weather",
        label: "Weather",
        rawScore: weatherRiskScore,
        weight: weights.weather,
        weightedScore: weatherRiskScore * weights.weather,
        reason: `${context.weather.condition} conditions affect channel demand`
      },
      {
        key: "traffic",
        label: "Traffic",
        rawScore: trafficRiskScore,
        weight: weights.traffic,
        weightedScore: trafficRiskScore * weights.traffic,
        reason: `${context.traffic.footTraffic} foot traffic and ${context.traffic.areaCongestion} congestion`
      },
      {
        key: "channelDemand",
        label: "Channel demand",
        rawScore: channelDemandScore,
        weight: weights.channelDemand,
        weightedScore: channelDemandScore * weights.channelDemand,
        reason: `${context.channelDemand.localDemand} local, ${context.channelDemand.deliveryDemand} delivery, ${context.channelDemand.partnerDemand} partner`
      },
      {
        key: "event",
        label: "Event",
        rawScore: eventAdjustmentScore,
        weight: weights.event,
        weightedScore: eventAdjustmentScore * weights.event,
        reason:
          context.event.type === "none"
            ? "No nearby event demand lift"
            : `${context.event.name} starts at ${context.event.startTime}, ${context.event.distanceKm}km away`
      },
      {
        key: "dayTime",
        label: "Day/time",
        rawScore: dayTimeScore,
        weight: weights.dayTime,
        weightedScore: dayTimeScore * weights.dayTime,
        reason: `${context.dayContext.dayOfWeek} ${context.dayContext.timeOfDay} demand pattern`
      },
      {
        key: "salesPace",
        label: "Today's sales pace",
        rawScore: dailySalesScore,
        weight: weights.salesPace,
        weightedScore: dailySalesScore * weights.salesPace,
        reason: `${product.todaysSales}/${product.salesTargetToday} sold today`
      }
    ];

    const totalWeight = factors.reduce((sum, factor) => sum + factor.weight, 0) || 1;
    const score = Math.round(clamp(factors.reduce((sum, factor) => sum + factor.weightedScore, 0) / totalWeight));
    const minimumAllowedPrice = money(product.cost * (1 + marginThreshold));
    const { localRiskScore, deliveryRiskScore } = channelRiskScores(score, context, weights, {
      weatherRiskScore,
      trafficRiskScore,
      channelDemandScore,
      eventAdjustmentScore,
      dailySalesScore
    });
    const localDecision = priceFromScore(product, localRiskScore, minimumAllowedPrice);
    const deliveryDecision = priceFromScore(product, deliveryRiskScore, minimumAllowedPrice);
    const overallDecision = localDecision.discountPercent >= deliveryDecision.discountPercent ? localDecision : deliveryDecision;
    const recommendedPrice = overallDecision.price;
    const finalDiscount = overallDecision.discountPercent;
    const actions = buildActions(product, recommendedPrice, finalDiscount, context, score, minimumAllowedPrice);
    const bestAction = score >= 70 ? actions[2] : context.weather.condition === "rain" && product.travelsWell ? actions[1] : actions[0];

    const reasoning = [
      `Inventory is ${surplusRatio.toFixed(1)}x expected demand with ${demandGap > 0 ? demandGap : 0} units at risk.`,
      `${product.hoursUntilExpiry} hours remain before expiry.`,
      `Historical sell-through is ${Math.round(product.historicalSellThroughRate * 100)}%, which ${product.historicalSellThroughRate < 0.65 ? "raises" : "reduces"} demand risk.`,
      `Today's sales pace is ${Math.round(dailySalesRatio * 100)}% of target, so slow daily sales pressure is included.`,
      `${context.weather.condition === "rain" || context.weather.condition === "storm" ? "Bad weather is reducing in-store walk-ins." : "Weather supports steadier walk-in demand."}`,
      `${context.channelDemand.deliveryDemand === "high" ? "Delivery demand is likely to increase, so delivery pricing stays closer to normal." : "Delivery demand is not strong enough to carry the full surplus."}`,
      `${context.channelDemand.partnerDemand === "high" ? "Partner demand can absorb bulk surplus if normal channels underperform." : "Partner demand remains a secondary liquidation path."}`,
      context.event.type === "none"
        ? "No local event is expected to lift demand later today."
        : `The ${context.event.name} later today may lift demand, so the discount window is controlled instead of permanent.`
    ];

    const grossMarginPercent = Math.round(((recommendedPrice - product.cost) / recommendedPrice) * 100);
    const confidence = Math.round(
      clamp(68 + Math.abs(score - 50) * 0.35 + (product.historicalSellThroughRate > 0.7 ? 7 : 0) + (surplusRatio > 2 ? 6 : 0))
    );

    return {
      productId: product.id,
      productName: product.name,
      category: product.category,
      riskScore: score,
      riskLevel: riskLevel(score),
      currentPrice: product.currentPrice,
      recommendedPrice: money(recommendedPrice),
      discountPercent: finalDiscount,
      localPrice: localDecision.price,
      localDiscountPercent: localDecision.discountPercent,
      deliveryPrice: deliveryDecision.price,
      deliveryDiscountPercent: deliveryDecision.discountPercent,
      localRiskScore,
      deliveryRiskScore,
      timeWindow: timeWindow(context, product),
      bestAction: bestAction.title,
      bestChannel: bestAction.channel,
      recommendedActions: actions,
      reasoning,
      numericalReasons: {
        inventorySurplusRatio: Number(surplusRatio.toFixed(2)),
        expiryHours: product.hoursUntilExpiry,
        demandForecastGap: demandGap,
        riskScore: score
      },
      businessReasons: [
        "Reduce avoidable waste before expiry.",
        "Recover revenue while respecting margin protection.",
        "Choose the channel where demand is most likely to convert."
      ],
      scoreBreakdown: factors.map((factor) => ({
        ...factor,
        rawScore: Math.round(factor.rawScore),
        weightedScore: Math.round(factor.weightedScore)
      })),
      marginCheck: {
        cost: product.cost,
        minimumAllowedPrice,
        marginThreshold,
        adjustedForMargin: recommendedPrice <= minimumAllowedPrice,
        grossMarginPercent
      },
      confidence
    };
  });
}
