export type MarginSensitivity = 'low' | 'medium' | 'high';

export interface Product {
  id: string;
  name: string;
  category: string;
  currentPrice: number;
  cost: number;
  inventory: number;
  expectedDemand: number;
  hoursUntilExpiry: number;
  historicalSellThroughRate: number; // 0..1
  marginSensitivity: MarginSensitivity;
}

export type WeatherCondition = 'sunny' | 'cloudy' | 'rain' | 'storm';
export type Level = 'low' | 'medium' | 'high';
export type RainIntensity = 'none' | 'light' | 'medium' | 'heavy';
export type EventType = 'none' | 'football_match' | 'concert' | 'festival' | 'conference';
export type TimeOfDay = 'morning' | 'lunch' | 'afternoon' | 'evening';
export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export interface Context {
  weather: {
    condition: WeatherCondition;
    temperature: number;
    rainIntensity: RainIntensity;
  };
  traffic: {
    footTraffic: Level;
    deliveryDemand: Level;
    areaCongestion: Level;
  };
  event: {
    type: EventType;
    name: string;
    startTime: string; // "18:30"
    expectedAttendance: number;
    distanceKm: number;
  };
  dayContext: {
    dayOfWeek: DayOfWeek;
    timeOfDay: TimeOfDay;
    isHoliday: boolean;
  };
  minMarginThreshold: number; // multiplier on cost, e.g. 1.15
}

export interface FactorWeights {
  inventorySurplus: number;
  expiryUrgency: number;
  historicalDemand: number;
  weather: number;
  traffic: number;
  event: number;
  dayTime: number;
  marginProtection: number;
}

export type FactorKey = keyof FactorWeights;

export interface FactorBreakdown {
  key: FactorKey;
  label: string;
  rawScore: number; // 0..100 contribution before weight
  weight: number;
  weighted: number; // rawScore * weight
  detail: string;
}

export type RiskLevel = 'Low' | 'Medium' | 'High';

export type ChannelId =
  | 'in_store'
  | 'delivery'
  | 'partner_network'
  | 'digital_menu';

export type ActionType =
  | 'bundle'
  | 'delivery_offer'
  | 'partner_bulk'
  | 'menu_update'
  | 'discount';

export interface RecommendedAction {
  actionType: ActionType;
  title: string;
  channel: ChannelId;
  price: number;
  reason: string;
}

export type IntegrationStatus = 'Ready' | 'Scheduled' | 'Published' | 'Placeholder integration';

export interface IntegrationTarget {
  name: string;
  group: 'delivery' | 'forward';
  status: IntegrationStatus;
}

export interface Recommendation {
  productId: string;
  productName: string;
  category: string;
  riskScore: number;
  riskLevel: RiskLevel;
  currentPrice: number;
  cost: number;
  recommendedPrice: number;
  discountPercent: number;
  timeWindow: string;
  inventory: number;
  expectedDemand: number;
  hoursUntilExpiry: number;
  surplusRatio: number;
  recommendedActions: RecommendedAction[];
  reasoning: {
    numerical: string[];
    contextual: string[];
    business: string[];
  };
  factors: FactorBreakdown[];
  marginCheck: {
    floor: number; // cost * minMargin
    passed: boolean;
    note: string;
  };
  confidence: number;
}
