import { create } from 'zustand';
import { DEFAULT_CONTEXT, DEFAULT_WEIGHTS, PRODUCTS } from './data';
import { computeAll } from './engine';
import type { Context, FactorWeights, Product, Recommendation } from './types';

interface EngineState {
  products: Product[];
  context: Context;
  weights: FactorWeights;
  recommendations: Recommendation[];
  selectedProductId: string | null;

  setContext: (patch: Partial<Context>) => void;
  setWeather: (patch: Partial<Context['weather']>) => void;
  setTraffic: (patch: Partial<Context['traffic']>) => void;
  setEvent: (patch: Partial<Context['event']>) => void;
  setDayContext: (patch: Partial<Context['dayContext']>) => void;
  setMinMargin: (v: number) => void;
  setWeight: (key: keyof FactorWeights, value: number) => void;
  resetWeights: () => void;
  resetScenario: () => void;
  selectProduct: (id: string | null) => void;
  recompute: () => void;
}

function recomputeWith(state: Pick<EngineState, 'products' | 'context' | 'weights'>) {
  return computeAll(state.products, state.context, state.weights);
}

export const useEngineStore = create<EngineState>((set, get) => ({
  products: PRODUCTS,
  context: DEFAULT_CONTEXT,
  weights: DEFAULT_WEIGHTS,
  recommendations: computeAll(PRODUCTS, DEFAULT_CONTEXT, DEFAULT_WEIGHTS),
  selectedProductId: PRODUCTS[0]?.id ?? null,

  recompute: () => {
    const { products, context, weights } = get();
    set({ recommendations: recomputeWith({ products, context, weights }) });
  },

  setContext: (patch) => {
    set((s) => ({ context: { ...s.context, ...patch } }));
    get().recompute();
  },
  setWeather: (patch) => {
    set((s) => ({ context: { ...s.context, weather: { ...s.context.weather, ...patch } } }));
    get().recompute();
  },
  setTraffic: (patch) => {
    set((s) => ({ context: { ...s.context, traffic: { ...s.context.traffic, ...patch } } }));
    get().recompute();
  },
  setEvent: (patch) => {
    set((s) => ({ context: { ...s.context, event: { ...s.context.event, ...patch } } }));
    get().recompute();
  },
  setDayContext: (patch) => {
    set((s) => ({
      context: { ...s.context, dayContext: { ...s.context.dayContext, ...patch } },
    }));
    get().recompute();
  },
  setMinMargin: (v) => {
    set((s) => ({ context: { ...s.context, minMarginThreshold: v } }));
    get().recompute();
  },
  setWeight: (key, value) => {
    set((s) => ({ weights: { ...s.weights, [key]: value } }));
    get().recompute();
  },
  resetWeights: () => {
    set({ weights: { ...DEFAULT_WEIGHTS } });
    get().recompute();
  },
  resetScenario: () => {
    set({ context: { ...DEFAULT_CONTEXT } });
    get().recompute();
  },
  selectProduct: (id) => set({ selectedProductId: id }),
}));
