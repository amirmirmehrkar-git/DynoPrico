export type MarginSensitivity = "low" | "medium" | "high";
export type WeatherCondition = "sunny" | "cloudy" | "rain" | "storm";
export type RainIntensity = "none" | "low" | "medium" | "high";
export type SignalLevel = "low" | "medium" | "high";
export type EventType = "none" | "football_match" | "concert" | "festival" | "conference";
export type TimeOfDay = "morning" | "lunch" | "afternoon" | "evening";
export type RiskLevel = "Low" | "Medium" | "High";
export type Channel = "in_store" | "delivery" | "partner_network" | "digital_menu";

export type Product = {
  id: string;
  name: string;
  category: string;
  currentPrice: number;
  cost: number;
  inventory: number;
  expectedDemand: number;
  todaysSales: number;
  salesTargetToday: number;
  hoursUntilExpiry: number;
  historicalSellThroughRate: number;
  marginSensitivity: MarginSensitivity;
  travelsWell?: boolean;
};

export type DecisionContext = {
  weather: {
    condition: WeatherCondition;
    temperature: number;
    rainIntensity: RainIntensity;
  };
  traffic: {
    footTraffic: SignalLevel;
    areaCongestion: SignalLevel;
  };
  channelDemand: {
    localDemand: SignalLevel;
    deliveryDemand: SignalLevel;
    partnerDemand: SignalLevel;
  };
  event: {
    type: EventType;
    name: string;
    startTime: string;
    expectedAttendance: number;
    distanceKm: number;
  };
  dayContext: {
    dayOfWeek: string;
    timeOfDay: TimeOfDay;
    isHoliday: boolean;
  };
};

export type DecisionWeights = {
  inventorySurplus: number;
  expiryUrgency: number;
  historicalDemand: number;
  weather: number;
  traffic: number;
  channelDemand: number;
  event: number;
  dayTime: number;
  salesPace: number;
  marginProtection: number;
};

export type ScoreFactor = {
  key: keyof Omit<DecisionWeights, "marginProtection">;
  label: string;
  rawScore: number;
  weight: number;
  weightedScore: number;
  reason: string;
};

export type RecommendedAction = {
  actionType: "bundle" | "delivery_offer" | "partner_bulk" | "digital_update";
  title: string;
  channel: Channel;
  price: number;
  discountPercent: number;
  status: "Ready" | "Scheduled" | "Published" | "Placeholder integration";
  reason: string;
};

export type Recommendation = {
  productId: string;
  productName: string;
  category: string;
  riskScore: number;
  riskLevel: RiskLevel;
  currentPrice: number;
  recommendedPrice: number;
  discountPercent: number;
  localPrice: number;
  localDiscountPercent: number;
  deliveryPrice: number;
  deliveryDiscountPercent: number;
  localRiskScore: number;
  deliveryRiskScore: number;
  timeWindow: string;
  bestAction: string;
  bestChannel: Channel;
  recommendedActions: RecommendedAction[];
  reasoning: string[];
  numericalReasons: {
    inventorySurplusRatio: number;
    expiryHours: number;
    demandForecastGap: number;
    riskScore: number;
  };
  businessReasons: string[];
  scoreBreakdown: ScoreFactor[];
  marginCheck: {
    cost: number;
    minimumAllowedPrice: number;
    marginThreshold: number;
    adjustedForMargin: boolean;
    grossMarginPercent: number;
  };
  confidence: number;
};
