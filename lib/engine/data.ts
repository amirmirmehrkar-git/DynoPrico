import type {
  Context,
  DayOfWeek,
  EventType,
  FactorWeights,
  Product,
} from './types';

export const DEFAULT_WEIGHTS: FactorWeights = {
  inventorySurplus: 0.9,
  expiryUrgency: 0.85,
  historicalDemand: 0.5,
  weather: 0.6,
  traffic: 0.55,
  event: 0.45,
  dayTime: 0.4,
  marginProtection: 0.7,
};

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Butter Croissant',
    category: 'Bakery',
    currentPrice: 3.5,
    cost: 1.1,
    inventory: 42,
    expectedDemand: 15,
    hoursUntilExpiry: 4,
    historicalSellThroughRate: 0.62,
    marginSensitivity: 'medium',
  },
  {
    id: 'p2',
    name: 'Chicken Sandwich',
    category: 'Ready Meal',
    currentPrice: 6.9,
    cost: 2.8,
    inventory: 18,
    expectedDemand: 9,
    hoursUntilExpiry: 5,
    historicalSellThroughRate: 0.55,
    marginSensitivity: 'high',
  },
  {
    id: 'p3',
    name: 'Blueberry Muffin',
    category: 'Bakery',
    currentPrice: 2.8,
    cost: 0.9,
    inventory: 14,
    expectedDemand: 10,
    hoursUntilExpiry: 8,
    historicalSellThroughRate: 0.72,
    marginSensitivity: 'low',
  },
];

export const DEFAULT_CONTEXT: Context = {
  weather: {
    condition: 'rain',
    temperature: 14,
    rainIntensity: 'medium',
  },
  traffic: {
    footTraffic: 'low',
    deliveryDemand: 'high',
    areaCongestion: 'medium',
  },
  event: {
    type: 'football_match',
    name: 'HSV Match',
    startTime: '18:30',
    expectedAttendance: 12000,
    distanceKm: 1.5,
  },
  dayContext: {
    dayOfWeek: 'Saturday',
    timeOfDay: 'afternoon',
    isHoliday: false,
  },
  minMarginThreshold: 1.15,
};

export const EVENT_LABELS: Record<EventType, string> = {
  none: 'None',
  football_match: 'Football Match',
  concert: 'Concert',
  festival: 'Festival',
  conference: 'Conference',
};

export const DAYS: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];
