"use client";

import {
  BadgeEuro,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  CloudRain,
  ChevronDown,
  Gauge,
  RadioTower,
  Store,
  Truck,
  Users
} from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { defaultContext, defaultWeights, mockProducts } from "@/lib/mock-data";
import { generateRecommendations } from "@/lib/recommendation-engine";
import { DecisionContext, DecisionWeights, EventType, RainIntensity, SignalLevel, TimeOfDay, WeatherCondition } from "@/lib/types";

const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

const integrations = [
  ["Lieferando", "Delivery", "Ready"],
  ["Wolt", "Delivery", "Scheduled"],
  ["Uber Eats", "Delivery", "Placeholder integration"],
  ["POS", "Local system", "Published"],
  ["Digital menu", "Local system", "Published"],
  ["In-store display", "Local system", "Ready"],
  ["E-ink price tags", "Local system", "Scheduled"],
  ["Partner network", "Forward system", "Ready"]
];

const weightPresets = [
  { label: "Low", value: 0.35 },
  { label: "Medium", value: 0.65 },
  { label: "High", value: 0.95 }
] as const;

function SelectControl<T extends string>({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option.replaceAll("_", " ")}
          </option>
        ))}
      </select>
    </label>
  );
}

function NumberControl({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  readOnly = false
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  readOnly?: boolean;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        min={min}
        max={max}
        readOnly={readOnly}
        step={step}
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function WeightSelector({
  value,
  onChange
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="weight-selector" role="radiogroup" aria-label="Factor weight">
      {weightPresets.map((preset) => (
        <button
          aria-checked={Math.abs(value - preset.value) < 0.11}
          className={Math.abs(value - preset.value) < 0.11 ? "active" : ""}
          key={preset.label}
          role="radio"
          type="button"
          onClick={() => onChange(preset.value)}
        >
          {preset.label}
        </button>
      ))}
      <input
        aria-label="Exact weight"
        max="1"
        min="0"
        step="0.05"
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

function FactorCard({
  icon,
  title,
  score,
  weight,
  children,
  onWeightChange
}: {
  icon: ReactNode;
  title: string;
  score: number;
  weight: number;
  children: ReactNode;
  onWeightChange: (value: number) => void;
}) {
  return (
    <article className="factor-card">
      <div className="factor-card-head">
        <div>
          {icon}
          <h3>{title}</h3>
        </div>
        <strong>{score}</strong>
      </div>
      <div className="factor-card-body">{children}</div>
      <div className="factor-weight-row">
        <span>Weight</span>
        <WeightSelector value={weight} onChange={onWeightChange} />
      </div>
    </article>
  );
}

function RiskBadge({ level }: { level: string }) {
  return <span className={`risk risk-${level.toLowerCase()}`}>{level}</span>;
}

export default function Dashboard() {
  const [context, setContext] = useState<DecisionContext>(defaultContext);
  const [weights, setWeights] = useState<DecisionWeights>(defaultWeights);
  const [marginThreshold, setMarginThreshold] = useState(0.15);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pricing" | "analysis">("pricing");
  const [expiryOverrides, setExpiryOverrides] = useState<Record<string, number>>({});
  const [salesOverrides, setSalesOverrides] = useState<Record<string, number>>({});
  const [salesTargetOverrides, setSalesTargetOverrides] = useState<Record<string, number>>({});

  const products = useMemo(
    () =>
      mockProducts.map((product) => ({
        ...product,
        hoursUntilExpiry: expiryOverrides[product.id] ?? product.hoursUntilExpiry,
        todaysSales: salesOverrides[product.id] ?? product.todaysSales,
        salesTargetToday: salesTargetOverrides[product.id] ?? product.salesTargetToday
      })),
    [expiryOverrides, salesOverrides, salesTargetOverrides]
  );

  const recommendations = useMemo(
    () => generateRecommendations(products, context, weights, marginThreshold),
    [products, context, weights, marginThreshold]
  );
  const selected = recommendations.find((recommendation) => recommendation.productId === selectedId) ?? recommendations[0];
  const hasSelectedProduct = selectedId !== null;
  const selectedProduct = products.find((product) => product.id === selected.productId)!;
  const factorByKey = Object.fromEntries(selected.scoreBreakdown.map((factor) => [factor.key, factor]));

  const updateContext = <K extends keyof DecisionContext>(section: K, patch: Partial<DecisionContext[K]>) => {
    setContext((current) => ({ ...current, [section]: { ...current[section], ...patch } }));
  };

  return (
    <main>
      <header className="topbar">
        <div>
          <p className="eyebrow">DynoPrice Backend</p>
          <h1>DynoPrice Decision Engine</h1>
          <p className="subtitle">A compact pitch view: factor values, weights, and impact drive local and delivery prices.</p>
        </div>
        <div className="top-metrics">
          <div>
            <span>Risk products</span>
            <strong>{products.length}</strong>
          </div>
          <div>
            <span>Demo risk</span>
            <strong>{selected.riskScore}</strong>
          </div>
          <div>
            <span>Publish targets</span>
            <strong>8</strong>
          </div>
        </div>
      </header>

      <section className="pitch-grid">
        <aside className="panel controls">
          <div className="panel-title">
            <Gauge size={18} />
            <h2>Decision Factors</h2>
          </div>
          <div className="factor-card-stack">
            <FactorCard
              icon={<BadgeEuro size={18} />}
              score={selected.riskScore}
              title="Product & Margin"
              weight={weights.inventorySurplus}
              onWeightChange={(value) => setWeights((current) => ({ ...current, inventorySurplus: value }))}
            >
              <NumberControl label="Expiry hours" value={selectedProduct.hoursUntilExpiry} min={1} max={24} onChange={(value) => setExpiryOverrides((current) => ({ ...current, [selectedProduct.id]: value }))} />
              <SelectControl<TimeOfDay> label="Daypart" value={context.dayContext.timeOfDay} options={["morning", "lunch", "afternoon", "evening"]} onChange={(value) => updateContext("dayContext", { timeOfDay: value })} />
              <NumberControl label="Min margin" value={Math.round(marginThreshold * 100)} min={5} max={35} onChange={(value) => setMarginThreshold(value / 100)} />
              <small>Expiry, surplus, and margin floor are primary drivers because the product is perishable.</small>
            </FactorCard>

            <FactorCard
              icon={<CloudRain size={18} />}
              score={factorByKey.weather?.rawScore ?? 0}
              title="Weather"
              weight={weights.weather}
              onWeightChange={(value) => setWeights((current) => ({ ...current, weather: value }))}
            >
              <SelectControl<WeatherCondition> label="Condition" value={context.weather.condition} options={["sunny", "cloudy", "rain", "storm"]} onChange={(value) => updateContext("weather", { condition: value })} />
              <SelectControl<RainIntensity> label="Rain intensity" value={context.weather.rainIntensity} options={["none", "low", "medium", "high"]} onChange={(value) => updateContext("weather", { rainIntensity: value })} />
              <NumberControl label="Temp API" max={35} min={-5} readOnly value={context.weather.temperature} onChange={() => undefined} />
              <small>Rain increases local discount pressure but can protect delivery price when delivery demand is high.</small>
            </FactorCard>

            <FactorCard
              icon={<Store size={18} />}
              score={factorByKey.traffic?.rawScore ?? 0}
              title="Traffic"
              weight={weights.traffic}
              onWeightChange={(value) => setWeights((current) => ({ ...current, traffic: value }))}
            >
              <SelectControl<SignalLevel> label="Foot traffic" value={context.traffic.footTraffic} options={["low", "medium", "high"]} onChange={(value) => updateContext("traffic", { footTraffic: value })} />
              <SelectControl<SignalLevel> label="Congestion" value={context.traffic.areaCongestion} options={["low", "medium", "high"]} onChange={(value) => updateContext("traffic", { areaCongestion: value })} />
              <small>Foot traffic and congestion shape local conversion and delivery friction.</small>
            </FactorCard>

            <FactorCard
              icon={<Users size={18} />}
              score={factorByKey.channelDemand?.rawScore ?? 0}
              title="Channel Demand"
              weight={weights.channelDemand}
              onWeightChange={(value) => setWeights((current) => ({ ...current, channelDemand: value }))}
            >
              <SelectControl<SignalLevel> label="Local demand" value={context.channelDemand.localDemand} options={["low", "medium", "high"]} onChange={(value) => updateContext("channelDemand", { localDemand: value })} />
              <SelectControl<SignalLevel> label="Delivery demand" value={context.channelDemand.deliveryDemand} options={["low", "medium", "high"]} onChange={(value) => updateContext("channelDemand", { deliveryDemand: value })} />
              <SelectControl<SignalLevel> label="Partner demand" value={context.channelDemand.partnerDemand} options={["low", "medium", "high"]} onChange={(value) => updateContext("channelDemand", { partnerDemand: value })} />
              <small>Low local demand increases local discount; high delivery demand protects delivery price.</small>
            </FactorCard>

            <FactorCard
              icon={<CalendarClock size={18} />}
              score={factorByKey.event?.rawScore ?? 0}
              title="Nearby Event"
              weight={weights.event}
              onWeightChange={(value) => setWeights((current) => ({ ...current, event: value }))}
            >
              <SelectControl<EventType> label="Event type" value={context.event.type} options={["none", "football_match", "concert", "festival", "conference"]} onChange={(value) => updateContext("event", { type: value, name: value === "none" ? "No event" : "HSV Match" })} />
              <NumberControl label="Distance km" value={context.event.distanceKm} min={0} max={20} step={0.5} onChange={(value) => updateContext("event", { distanceKm: value })} />
              <label className="field">
                <span>Start time</span>
                <input value={context.event.startTime} onChange={(event) => updateContext("event", { startTime: event.target.value })} />
              </label>
              <small>Nearby future demand can neutralize over-discounting before the event starts.</small>
            </FactorCard>

            <FactorCard
              icon={<BarChart3 size={18} />}
              score={factorByKey.salesPace?.rawScore ?? 0}
              title="Sales Pace"
              weight={weights.salesPace}
              onWeightChange={(value) => setWeights((current) => ({ ...current, salesPace: value }))}
            >
              <NumberControl label="Sold today" value={selectedProduct.todaysSales} min={0} max={selectedProduct.salesTargetToday} onChange={(value) => setSalesOverrides((current) => ({ ...current, [selectedProduct.id]: value }))} />
              <NumberControl label="Daily target" value={selectedProduct.salesTargetToday} min={1} max={120} onChange={(value) => setSalesTargetOverrides((current) => ({ ...current, [selectedProduct.id]: value }))} />
              <small>This is product-specific, so it updates when a product is selected.</small>
            </FactorCard>

          </div>
        </aside>

        <section className="right-column">
          <div className="view-tabs">
            <button className={activeTab === "pricing" ? "active" : ""} type="button" onClick={() => setActiveTab("pricing")}>
              Pricing
            </button>
            <button
              className={activeTab === "analysis" ? "active" : ""}
              disabled={!hasSelectedProduct}
              type="button"
              onClick={() => setActiveTab("analysis")}
            >
              Analysis
            </button>
          </div>

          {activeTab === "pricing" ? (
          <div className="panel product-panel">
            <div className="panel-title">
              <Store size={18} />
              <h2>Products With Pricing Potential</h2>
            </div>
            <div className="product-list">
              {recommendations.map((item) => (
                <article
                  className={`product-card ${item.productId === selectedId ? "selected-product" : ""}`}
                  key={item.productId}
                >
                  <button
                    className="product-card-toggle"
                    type="button"
                    onClick={() => {
                      setActiveTab("pricing");
                      setSelectedId((current) => (current === item.productId ? null : item.productId));
                    }}
                  >
                    <div className="product-card-main">
                      <div>
                        <strong>{item.productName}</strong>
                      </div>
                      <ChevronDown className={item.productId === selectedId ? "chevron open" : "chevron"} size={18} />
                    </div>
                  </button>
                  {item.productId === selectedId ? (
                    <div className="product-dropdown">
                      <div className="product-meta-row">
                        <span>{item.category}</span>
                        <RiskBadge level={item.riskLevel} />
                      </div>
                      <div className="price-pair">
                        <div>
                          <span>Current</span>
                          <b>{euro.format(item.currentPrice)}</b>
                        </div>
                        <div>
                          <span>Local</span>
                          <b>{euro.format(item.localPrice)}</b>
                        </div>
                        <div>
                          <span>Delivery</span>
                          <b>{euro.format(item.deliveryPrice)}</b>
                        </div>
                      </div>
                      <button
                        className="analysis-link"
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedId(item.productId);
                          setActiveTab("analysis");
                        }}
                      >
                        Open analysis
                      </button>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
          ) : null}

          {activeTab === "analysis" && hasSelectedProduct ? (
          <div className="detail-grid">
            <section className="panel detail-panel">
              <div className="panel-title">
                <BarChart3 size={18} />
                <h2>Selected Product Explanation</h2>
              </div>
              <div className="detail-header">
                <div>
                  <p className="eyebrow">{selected.category}</p>
                  <h3>{selected.productName}</h3>
                </div>
                <div className="price-block">
                  <span>Current {euro.format(selected.currentPrice)}</span>
                  <strong>Local {euro.format(selected.localPrice)}</strong>
                  <small>Delivery {euro.format(selected.deliveryPrice)}</small>
                </div>
              </div>

              <div className="metric-row">
                <div>
                  <span>Inventory</span>
                  <strong>{selectedProduct.inventory}</strong>
                </div>
                <div>
                  <span>Expected demand</span>
                  <strong>{selectedProduct.expectedDemand}</strong>
                </div>
                <div>
                  <span>Sold today</span>
                  <strong>{selectedProduct.todaysSales}/{selectedProduct.salesTargetToday}</strong>
                </div>
                <div>
                  <span>Expiry</span>
                  <strong>{selectedProduct.hoursUntilExpiry}h</strong>
                </div>
                <div>
                  <span>Confidence</span>
                  <strong>{selected.confidence}%</strong>
                </div>
              </div>

              <div className="channel-score-row">
                <div>
                  <span>Local channel risk</span>
                  <strong>{selected.localRiskScore}</strong>
                  <small>{selected.localDiscountPercent}% local discount</small>
                </div>
                <div>
                  <span>Delivery channel risk</span>
                  <strong>{selected.deliveryRiskScore}</strong>
                  <small>{selected.deliveryDiscountPercent}% delivery discount</small>
                </div>
              </div>

              <div className="breakdown compact-breakdown">
                {selected.scoreBreakdown.map((factor) => (
                  <div key={factor.key} className="factor">
                    <div>
                      <span>{factor.label}</span>
                      <b>{factor.rawScore} x {factor.weight.toFixed(2)}</b>
                    </div>
                    <div className="bar">
                      <i style={{ width: `${factor.rawScore}%` }} />
                    </div>
                    <small>{factor.reason}</small>
                  </div>
                ))}
              </div>

              <div className="reason-box">
                <h3>Why this recommendation?</h3>
                <ul>
                  {selected.reasoning.slice(0, 4).map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </div>
            </section>

            <aside className="panel channel-panel">
              <div className="panel-title">
                <RadioTower size={18} />
                <h2>Channel Actions</h2>
              </div>
              <div className="actions">
                {selected.recommendedActions.map((action) => (
                  <article key={`${action.channel}-${action.actionType}`} className="action-card">
                    <div className="action-top">
                      {action.channel === "delivery" ? <Truck size={18} /> : action.channel === "partner_network" ? <Users size={18} /> : <Store size={18} />}
                      <span className="channel-badge">{action.channel.replaceAll("_", " ")}</span>
                    </div>
                    <h3>{action.title}</h3>
                    <div className="action-price">{euro.format(action.price)}</div>
                    <p>{action.reason}</p>
                    <span className={`status ${action.status.toLowerCase().replaceAll(" ", "-")}`}>{action.status}</span>
                  </article>
                ))}
              </div>
            </aside>
          </div>
          ) : null}

          {activeTab === "analysis" && hasSelectedProduct ? (
          <section className="panel api-panel">
            <div className="panel-title">
              <CheckCircle2 size={18} />
              <h2>Publishing Targets</h2>
            </div>
            <div className="integration-grid">
              {integrations.map(([name, group, status]) => (
                <div key={name} className="integration">
                  <CheckCircle2 size={18} />
                  <div>
                    <strong>{name}</strong>
                    <span>{group}</span>
                  </div>
                  <em className={`status ${status.toLowerCase().replaceAll(" ", "-")}`}>{status}</em>
                </div>
              ))}
            </div>
          </section>
          ) : null}
        </section>
      </section>
    </main>
  );
}
