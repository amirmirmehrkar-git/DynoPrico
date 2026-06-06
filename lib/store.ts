import { create } from 'zustand';

export type RecommendationStatus = 'pending' | 'approved' | 'rejected';
export type ActionStatus = 'pending' | 'accepted' | 'rejected';
export type AlertSeverity = 'high' | 'medium' | 'low';

export type ChannelKey =
  | 'in-store'
  | 'delivery'
  | 'mobile-app'
  | 'digital-menu'
  | 'partner'
  | 'in-store-display';

export interface ChannelMeta {
  key: ChannelKey;
  label: string;
  icon: 'store' | 'delivery' | 'mobile' | 'menu' | 'partner' | 'display';
}

export const CHANNELS: Record<ChannelKey, ChannelMeta> = {
  'in-store': { key: 'in-store', label: 'In-Store', icon: 'store' },
  delivery: { key: 'delivery', label: 'Delivery', icon: 'delivery' },
  'mobile-app': { key: 'mobile-app', label: 'Mobile App', icon: 'mobile' },
  'digital-menu': { key: 'digital-menu', label: 'Digital Menu', icon: 'menu' },
  partner: { key: 'partner', label: 'Partner Network', icon: 'partner' },
  'in-store-display': { key: 'in-store-display', label: 'In-Store Display', icon: 'display' },
};

export interface AIReason {
  icon: 'rain' | 'inventory' | 'clock' | 'event';
  text: string;
}

export interface RecommendedAction {
  id: string;
  title: string;
  description: string;
  priceLabel: string; // e.g. "€4.90" or "15% off"
  channels: ChannelKey[];
  status: ActionStatus;
}

export interface ChannelStrategy {
  channel: ChannelKey;
  insight: string;
  action: string;
}

export type PublishStatus = 'published' | 'scheduled' | 'ready' | 'pending';

export interface PublishChannel {
  key: ChannelKey;
  label: string;
  status: PublishStatus;
}

export interface Recommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  product: string;
  inventoryRemaining: number;
  wasteRisk: number; // percentage
  currentPrice: number;
  recommendedPrice: number;
  managerPrice: number | null; // manager-adjusted price overrides recommended
  campaignStart: string;
  campaignEnd: string;
  expectedWasteReduction: number; // percentage
  expectedRevenueRecovery: number; // euros
  confidence: number; // percentage
  reasons: AIReason[];
  actions: RecommendedAction[];
  channelStrategy: ChannelStrategy[];
  status: RecommendationStatus;
}

export interface AlertItem {
  id: string;
  type:
    | 'food-waste'
    | 'weather'
    | 'delivery-demand'
    | 'local-event'
    | 'inventory'
    | 'channel';
  title: string;
  body: string;
  time: string;
  severity: AlertSeverity;
  recommendationId: string | null;
  read: boolean;
}

interface StoreState {
  storeName: string;
  storeLocation: string;
  weather: string;
  traffic: string;
  event: string;
  currentTime: string;
  recommendations: Recommendation[];
  publishChannels: PublishChannel[];
  alerts: AlertItem[];
  setManagerPrice: (id: string, price: number | null) => void;
  setActionStatus: (recId: string, actionId: string, status: ActionStatus) => void;
  approve: (id: string) => void;
  reject: (id: string) => void;
  markAlertsRead: () => void;
}

const initialRecommendation: Recommendation = {
  id: 'rec-001',
  priority: 'high',
  product: 'Butter Croissant',
  inventoryRemaining: 42,
  wasteRisk: 78,
  currentPrice: 3.5,
  recommendedPrice: 2.9,
  managerPrice: null,
  campaignStart: '15:30',
  campaignEnd: '18:00',
  expectedWasteReduction: 35,
  expectedRevenueRecovery: 68,
  confidence: 87,
  reasons: [
    { icon: 'rain', text: 'Rain is reducing walk-in traffic' },
    { icon: 'inventory', text: 'Inventory is 2.3x above expected demand' },
    { icon: 'clock', text: 'Historical sales are lower during afternoon hours' },
    { icon: 'event', text: 'HSV match at 18:30 — evening demand expected to increase' },
  ],
  actions: [
    {
      id: 'act-bundle',
      title: 'Bundle with Coffee',
      description: 'Coffee + Croissant combo',
      priceLabel: '€4.90',
      channels: ['in-store', 'mobile-app'],
      status: 'pending',
    },
    {
      id: 'act-discount',
      title: 'Apply Local Discount',
      description: '15% off in-store only',
      priceLabel: '15% off',
      channels: ['digital-menu', 'in-store-display'],
      status: 'pending',
    },
    {
      id: 'act-delivery',
      title: 'Delivery Promotion',
      description: '10% off delivery order',
      priceLabel: '10% off',
      channels: ['delivery'],
      status: 'pending',
    },
    {
      id: 'act-partner',
      title: 'Partner Push',
      description: 'Send offer to nearby offices & coworking spaces',
      priceLabel: '20-unit bundle',
      channels: ['partner'],
      status: 'pending',
    },
  ],
  channelStrategy: [
    {
      channel: 'in-store',
      insight: 'Walk-in traffic low because of rain.',
      action: 'Coffee + Croissant bundle at €4.90',
    },
    {
      channel: 'delivery',
      insight: 'Delivery demand likely to increase because of rain.',
      action: 'Keep price higher, offer free add-on instead of discount.',
    },
    {
      channel: 'partner',
      insight: 'Push remaining croissants to nearby coworking spaces.',
      action: '20-unit office bundle.',
    },
  ],
  status: 'pending',
};

export const useStore = create<StoreState>((set) => ({
  storeName: 'Nur Hier',
  storeLocation: 'Sternschanze, Hamburg',
  weather: 'Rainy, 14°C',
  traffic: 'Low foot traffic',
  event: 'HSV match at 18:30',
  currentTime: '15:30',
  recommendations: [initialRecommendation],
  publishChannels: [
    { key: 'in-store-display', label: 'In-Store Display', status: 'published' },
    { key: 'digital-menu', label: 'Digital Menu', status: 'published' },
    { key: 'delivery', label: 'Delivery', status: 'scheduled' },
    { key: 'partner', label: 'Partner Network', status: 'ready' },
  ],
  alerts: [
    {
      id: 'alert-waste',
      type: 'food-waste',
      title: 'Food Waste Alert',
      body: 'High waste risk detected for croissants. 42 units remaining.',
      time: 'Just now',
      severity: 'high',
      recommendationId: 'rec-001',
      read: false,
    },
    {
      id: 'alert-weather',
      type: 'weather',
      title: 'Weather Alert',
      body: 'Rain expected for the next 3 hours. Walk-in traffic may decrease.',
      time: '5 min ago',
      severity: 'medium',
      recommendationId: 'rec-001',
      read: false,
    },
    {
      id: 'alert-delivery',
      type: 'delivery-demand',
      title: 'Delivery Demand Alert',
      body: 'Rain may increase delivery demand. Consider delivery-specific promotion.',
      time: '8 min ago',
      severity: 'medium',
      recommendationId: 'rec-001',
      read: false,
    },
    {
      id: 'alert-event',
      type: 'local-event',
      title: 'Local Event Alert',
      body: 'HSV match starts at 18:30. Evening demand may increase near the stadium.',
      time: '20 min ago',
      severity: 'low',
      recommendationId: 'rec-001',
      read: true,
    },
    {
      id: 'alert-inventory',
      type: 'inventory',
      title: 'Inventory Alert',
      body: 'Croissant inventory is 2.3x higher than expected demand.',
      time: '35 min ago',
      severity: 'high',
      recommendationId: 'rec-001',
      read: true,
    },
    {
      id: 'alert-channel',
      type: 'channel',
      title: 'Channel Alert',
      body: 'In-store sales are expected to drop, but delivery channels may perform better.',
      time: '40 min ago',
      severity: 'low',
      recommendationId: 'rec-001',
      read: true,
    },
  ],
  setManagerPrice: (id, price) =>
    set((state) => ({
      recommendations: state.recommendations.map((r) =>
        r.id === id ? { ...r, managerPrice: price } : r,
      ),
    })),
  setActionStatus: (recId, actionId, status) =>
    set((state) => ({
      recommendations: state.recommendations.map((r) =>
        r.id === recId
          ? {
              ...r,
              actions: r.actions.map((a) =>
                a.id === actionId ? { ...a, status } : a,
              ),
            }
          : r,
      ),
    })),
  approve: (id) =>
    set((state) => ({
      recommendations: state.recommendations.map((r) =>
        r.id === id ? { ...r, status: 'approved' } : r,
      ),
    })),
  reject: (id) =>
    set((state) => ({
      recommendations: state.recommendations.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'rejected',
              actions: r.actions.map((a) => ({ ...a, status: 'rejected' as const })),
            }
          : r,
      ),
    })),
  markAlertsRead: () =>
    set((state) => ({
      alerts: state.alerts.map((n) => ({ ...n, read: true })),
    })),
}));
