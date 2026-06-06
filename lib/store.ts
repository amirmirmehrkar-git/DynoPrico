import { create } from 'zustand';

export type RecommendationStatus = 'pending' | 'approved' | 'rejected';

export interface AIReason {
  icon: 'rain' | 'inventory' | 'clock' | 'event';
  text: string;
}

export interface PublishChannel {
  key: string;
  label: string;
  status: 'ready' | 'publishing' | 'pending';
}

export interface Recommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  product: string;
  inventoryRemaining: number;
  wasteRisk: number; // percentage
  currentPrice: number;
  recommendedPrice: number;
  action: string;
  campaignStart: string;
  campaignEnd: string;
  expectedWasteReduction: number; // percentage
  expectedRevenueRecovery: number; // euros
  confidence: number; // percentage
  reasons: AIReason[];
  status: RecommendationStatus;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

interface StoreState {
  storeName: string;
  storeLocation: string;
  recommendations: Recommendation[];
  publishChannels: PublishChannel[];
  notifications: NotificationItem[];
  approve: (id: string) => void;
  reject: (id: string) => void;
  markNotificationsRead: () => void;
}

const initialRecommendation: Recommendation = {
  id: 'rec-001',
  priority: 'high',
  product: 'Butter Croissant',
  inventoryRemaining: 42,
  wasteRisk: 78,
  currentPrice: 5.5,
  recommendedPrice: 4.9,
  action: 'Bundle Coffee + Croissant',
  campaignStart: '15:30',
  campaignEnd: '18:00',
  expectedWasteReduction: 35,
  expectedRevenueRecovery: 68,
  confidence: 87,
  reasons: [
    { icon: 'rain', text: 'Rain is reducing walk-in traffic' },
    { icon: 'inventory', text: 'Inventory is above expected demand' },
    { icon: 'clock', text: 'Historical sales are lower during afternoon hours' },
    { icon: 'event', text: 'Football event starts later and demand is expected to increase' },
  ],
  status: 'pending',
};

export const useStore = create<StoreState>((set) => ({
  storeName: 'Hamburg Bakery #17',
  storeLocation: 'Sternschanze, Hamburg',
  recommendations: [initialRecommendation],
  publishChannels: [
    { key: 'digital-menu', label: 'Digital Menu', status: 'ready' },
    { key: 'in-store', label: 'In-Store Display', status: 'ready' },
    { key: 'partner', label: 'Partner Network', status: 'ready' },
    { key: 'mobile-app', label: 'Mobile App', status: 'ready' },
  ],
  notifications: [
    {
      id: 'notif-001',
      title: 'High Waste Risk Detected',
      body: 'AI detected high waste risk. New recommendation available.',
      time: 'Just now',
      read: false,
    },
  ],
  approve: (id) =>
    set((state) => ({
      recommendations: state.recommendations.map((r) =>
        r.id === id ? { ...r, status: 'approved' } : r,
      ),
    })),
  reject: (id) =>
    set((state) => ({
      recommendations: state.recommendations.map((r) =>
        r.id === id ? { ...r, status: 'rejected' } : r,
      ),
    })),
  markNotificationsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),
}));
