import { DecisionContext, DecisionWeights, Product } from "./types";

export const mockProducts: Product[] = [
  {
    id: "p1",
    name: "Butter Croissant",
    category: "Bakery",
    currentPrice: 3.5,
    cost: 1.1,
    inventory: 42,
    expectedDemand: 15,
    todaysSales: 23,
    salesTargetToday: 70,
    hoursUntilExpiry: 4,
    historicalSellThroughRate: 0.62,
    marginSensitivity: "medium",
    travelsWell: true
  },
  {
    id: "p2",
    name: "Chicken Sandwich",
    category: "Ready Meal",
    currentPrice: 6.9,
    cost: 2.8,
    inventory: 18,
    expectedDemand: 9,
    todaysSales: 34,
    salesTargetToday: 58,
    hoursUntilExpiry: 5,
    historicalSellThroughRate: 0.55,
    marginSensitivity: "high",
    travelsWell: true
  },
  {
    id: "p3",
    name: "Blueberry Muffin",
    category: "Bakery",
    currentPrice: 2.8,
    cost: 0.9,
    inventory: 14,
    expectedDemand: 10,
    todaysSales: 48,
    salesTargetToday: 65,
    hoursUntilExpiry: 8,
    historicalSellThroughRate: 0.72,
    marginSensitivity: "low",
    travelsWell: true
  },
  {
    id: "p4",
    name: "Greek Salad Bowl",
    category: "Fresh",
    currentPrice: 7.5,
    cost: 3.2,
    inventory: 11,
    expectedDemand: 12,
    todaysSales: 41,
    salesTargetToday: 52,
    hoursUntilExpiry: 10,
    historicalSellThroughRate: 0.81,
    marginSensitivity: "high",
    travelsWell: false
  },
  {
    id: "p5",
    name: "Cinnamon Roll",
    category: "Bakery",
    currentPrice: 3.2,
    cost: 0.95,
    inventory: 31,
    expectedDemand: 13,
    todaysSales: 19,
    salesTargetToday: 55,
    hoursUntilExpiry: 6,
    historicalSellThroughRate: 0.58,
    marginSensitivity: "medium",
    travelsWell: true
  }
];

export const defaultContext: DecisionContext = {
  weather: {
    condition: "rain",
    temperature: 14,
    rainIntensity: "medium"
  },
  traffic: {
    footTraffic: "low",
    areaCongestion: "medium"
  },
  channelDemand: {
    localDemand: "low",
    deliveryDemand: "high",
    partnerDemand: "medium"
  },
  event: {
    type: "football_match",
    name: "HSV Match",
    startTime: "18:30",
    expectedAttendance: 12000,
    distanceKm: 1.5
  },
  dayContext: {
    dayOfWeek: "Saturday",
    timeOfDay: "afternoon",
    isHoliday: false
  }
};

export const defaultWeights: DecisionWeights = {
  inventorySurplus: 0.95,
  expiryUrgency: 0.9,
  historicalDemand: 0.72,
  weather: 0.68,
  traffic: 0.8,
  channelDemand: 0.72,
  event: 0.55,
  dayTime: 0.62,
  salesPace: 0.78,
  marginProtection: 0.85
};
