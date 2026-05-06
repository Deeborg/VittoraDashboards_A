import React, { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './PricingOptimization.css';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ComposedChart,
  Area,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceLine,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────

type PriceStrategy = 'current' | 'optimised' | 'aggressive' | 'premium';
type SegmentFilter = 'all' | 'enterprise' | 'mid' | 'smb';
type InsightType   = 'warn' | 'danger' | 'info' | 'ok';

interface PricingTier {
  id: string;
  name: string;
  currentPrice: number;
  aiOptimalPrice: number;
  elasticity: number;
  margin: number;
  volume: number;
  competitors: number;
  recommendation: 'Increase' | 'Hold' | 'Decrease' | 'Bundle';
  revenueImpact: number;
}

interface CompetitorPrice {
  product: string;
  ourPrice: number;
  compA: number;
  compB: number;
  compC: number;
  position: 'Below' | 'Parity' | 'Premium';
}

interface POInsight {
  type: InsightType;
  title: string;
  desc: string;
  impact: string;
  action?: string;
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const PRICING_TIERS: PricingTier[] = [
  {
    id: 'SKU-MOB-01',
    name: 'Apple iPhone 14 (128GB)',
    currentPrice: 70000,
    aiOptimalPrice: 75000,
    elasticity: -0.5,
    margin: 32,
    volume: 980,
    competitors: 73000,
    recommendation: 'Increase',
    revenueImpact: 8500000,
  },
  {
    id: 'SKU-MOB-02',
    name: 'Redmi Note 12',
    currentPrice: 15000,
    aiOptimalPrice: 14500,
    elasticity: -2.2,
    margin: 18,
    volume: 4200,
    competitors: 14000,
    recommendation: 'Decrease',
    revenueImpact: 3200000,
  },
  {
    id: 'SKU-LAP-01',
    name: 'Dell Inspiron 15',
    currentPrice: 60000,
    aiOptimalPrice: 62000,
    elasticity: -0.9,
    margin: 28,
    volume: 760,
    competitors: 61000,
    recommendation: 'Increase',
    revenueImpact: 4100000,
  },
  {
    id: 'SKU-TV-01',
    name: 'Sony Bravia 55" Smart TV',
    currentPrice: 85000,
    aiOptimalPrice: 85000,
    elasticity: -1.8,
    margin: 22,
    volume: 540,
    competitors: 83000,
    recommendation: 'Hold',
    revenueImpact: 0,
  },
  {
    id: 'SKU-ACC-01',
    name: 'Boat Rockerz 450 Headphones',
    currentPrice: 2000,
    aiOptimalPrice: 2200,
    elasticity: -1.1,
    margin: 35,
    volume: 5200,
    competitors: 2100,
    recommendation: 'Increase',
    revenueImpact: 1800000,
  },
  {
    id: 'SKU-ACC-02',
    name: 'JBL Tune 510BT + Warranty Bundle',
    currentPrice: 4000,
    aiOptimalPrice: 4500,
    elasticity: -0.6,
    margin: 42,
    volume: 1900,
    competitors: 4200,
    recommendation: 'Bundle',
    revenueImpact: 2600000,
  },
];

const COMPETITOR_PRICES: CompetitorPrice[] = [
  {
    product: 'Apple iPhone 14 (128GB)',
    ourPrice: 70000,
    compA: 73000,   // Samsung Store / Premium reseller
    compB: 69000,   // Amazon
    compC: 72000,   // Flipkart
    position: 'Below'
  },
  {
    product: 'Redmi Note 12',
    ourPrice: 15000,
    compA: 14000,
    compB: 15500,
    compC: 14800,
    position: 'Premium'
  },
  {
    product: 'Dell Inspiron 15',
    ourPrice: 60000,
    compA: 61000,
    compB: 59000,
    compC: 60500,
    position: 'Parity'
  },
  {
    product: 'Sony Bravia 55" Smart TV',
    ourPrice: 85000,
    compA: 83000,
    compB: 87000,
    compC: 86000,
    position: 'Premium'
  },
  {
    product: 'Boat Rockerz 450 Headphones',
    ourPrice: 2000,
    compA: 2100,
    compB: 1950,
    compC: 2050,
    position: 'Parity'
  },
];

const MARGIN_TREND = [
  { month: "Aug '25", gross: 62, net: 38, target: 70 },
  { month: "Sep '25", gross: 64, net: 40, target: 70 },
  { month: "Oct '25", gross: 66, net: 41, target: 70 },
  { month: "Nov '25", gross: 68, net: 43, target: 70 },
  { month: "Dec '25", gross: 70, net: 45, target: 70 },
  { month: "Jan '26", gross: 72, net: 47, target: 70 },
  { month: "Feb '26", gross: 71, net: 46, target: 70 },
  { month: "Mar '26", gross: 73, net: 48, target: 70 },
  { month: "Apr '26", gross: 75, net: 50, target: 70 },
];

const ELASTICITY_DATA = [
  { price: 50,  demand: 5200 }, { price: 79,  demand: 3820 },
  { price: 100, demand: 3100 }, { price: 149, demand: 2400 },
  { price: 199, demand: 1850 }, { price: 249, demand: 1420 },
  { price: 299, demand: 1240 }, { price: 349, demand: 980  },
  { price: 399, demand: 760  }, { price: 499, demand: 520  },
];

const DISCOUNT_DATA = [
  { band: '0–5%',   deals: 420, avgMargin: 74, winRate: 68 },
  { band: '5–10%',  deals: 310, avgMargin: 66, winRate: 72 },
  { band: '10–20%', deals: 218, avgMargin: 57, winRate: 78 },
  { band: '20–30%', deals: 142, avgMargin: 44, winRate: 82 },
  { band: '30%+',   deals: 64,  avgMargin: 28, winRate: 88 },
];

const REVENUE_WATERFALL = [
  { label: 'Current Revenue',            value: 6320, type: 'base'  },

  { label: 'iPhone 14 Price ↑',          value: 85,   type: 'gain'  },
  { label: 'Laptop Price Optimisation',  value: 41,   type: 'gain'  },
  { label: 'Accessories Price ↑',        value: 18,   type: 'gain'  },
  { label: 'Warranty Bundle Sales',      value: 26,   type: 'gain'  },
  { label: 'Redmi Price ↓',              value: -32,  type: 'loss'  },
  { label: 'Post-season Demand Drop',    value: -14,  type: 'loss'  },
  { label: 'Optimised Revenue',          value: 6444, type: 'total' },
];

const RADAR_DATA = [
  { metric: 'Price competitiveness', current: 62, optimised: 82 },
  { metric: 'Margin health',         current: 68, optimised: 86 },
  { metric: 'Discount discipline',   current: 54, optimised: 78 },
  { metric: 'Segment alignment',     current: 70, optimised: 88 },
  { metric: 'Win rate',              current: 74, optimised: 80 },
  { metric: 'Volume growth',         current: 58, optimised: 74 },
];

const STRATEGY_CONFIG: Record<PriceStrategy, { label: string; revMult: number; marginMult: number; volumeMult: number; color: string }> = {
  current:    { label: 'Current pricing',       revMult: 1.00, marginMult: 1.00, volumeMult: 1.00, color: '#64748b' },
  optimised:  { label: 'AI-optimised (rec.)',   revMult: 1.15, marginMult: 1.18, volumeMult: 0.97, color: '#1D9E75' },
  aggressive: { label: 'Aggressive growth',     revMult: 1.08, marginMult: 0.92, volumeMult: 1.22, color: '#185FA5' },
  premium:    { label: 'Premium positioning',   revMult: 1.24, marginMult: 1.31, volumeMult: 0.88, color: '#BA7517' },
};

const PO_INSIGHTS: POInsight[] = [
  {
    type: 'ok',
    title: 'iPhone 14 underpriced vs market — increase price to ₹75,000',
    desc: 'Elasticity of −0.5 shows low price sensitivity. A 7% price increase will reduce demand slightly but increase overall revenue significantly.',
    impact: '+₹85L revenue',
    action: 'Increase iPhone 14 price gradually across online and retail channels',
  },
  {
    type: 'ok',
    title: 'Dell Inspiron demand is stable — optimise price to ₹62,000',
    desc: 'Moderate elasticity (−0.9) indicates controlled demand impact. Slight price increase improves margin without affecting sales significantly.',
    impact: '+₹41L revenue',
    action: 'Apply price optimisation for mid-range laptops',
  },
  {
    type: 'warn',
    title: 'Redmi Note 12 overpriced vs competitors',
    desc: 'High elasticity (−2.2) means customers are highly price-sensitive. Current price is above competitors, causing volume drop.',
    impact: 'Sales drop risk: −15%',
    action: 'Reduce price to ₹14,500 to regain market share',
  },
  {
    type: 'danger',
    title: 'High discounting (>25%) impacting margins in accessories',
    desc: 'Frequent discounting on headphones and accessories is reducing margins below 30%.',
    impact: 'Margin loss: −₹30L',
    action: 'Limit discounts to below 20% and introduce bundle offers instead',
  },
  {
    type: 'info',
    title: 'Warranty bundle increasing attach rate significantly',
    desc: 'Customers buying headphones and TVs are opting for extended warranty bundles, improving overall profitability.',
    impact: '+₹26L revenue',
    action: 'Promote bundle offers at checkout and retail stores',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const POTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="po-tooltip">
      <p className="po-tooltip-label">{label}</p>
      {payload.map((p: any, i: number) =>
        p.value != null && (
          <p key={i} style={{ color: p.color ?? p.fill }}>
            {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
          </p>
        )
      )}
    </div>
  );
};

const InsightIcon: React.FC<{ type: InsightType }> = ({ type }) => {
  const colors: Record<string, string> = { danger: '#E24B4A', warn: '#BA7517', info: '#185FA5', ok: '#1D9E75' };
  const c = colors[type];
  if (type === 'ok') return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M3 8.5L6.5 12L13 5" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
  if (type === 'info') return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke={c} strokeWidth="1.5" />
      <line x1="8" y1="7" x2="8" y2="11" stroke={c} strokeWidth="1.5" />
      <circle cx="8" cy="5.5" r=".7" fill={c} />
    </svg>
  );
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M8 2L14 13H2L8 2Z" stroke={c} strokeWidth="1.5" fill="none" />
      <line x1="8" y1="7" x2="8" y2="10" stroke={c} strokeWidth="1.5" />
      <circle cx="8" cy="12" r=".7" fill={c} />
    </svg>
  );
};

const RecBadge: React.FC<{ rec: PricingTier['recommendation'] }> = ({ rec }) => {
  const map: Record<string, string> = {
    Increase: 'po-badge-increase',
    Decrease: 'po-badge-decrease',
    Hold:     'po-badge-hold',
    Bundle:   'po-badge-bundle',
  };
  return <span className={`po-badge ${map[rec]}`}>{rec}</span>;
};

const PosBadge: React.FC<{ pos: CompetitorPrice['position'] }> = ({ pos }) => {
  const map: Record<string, string> = {
    Below:   'po-badge-decrease',
    Parity:  'po-badge-hold',
    Premium: 'po-badge-increase',
  };
  return <span className={`po-badge ${map[pos]}`}>{pos}</span>;
};

// ─── Main Component ───────────────────────────────────────────────────────────

const PricingOptimization: React.FC = () => {
  const navigate = useNavigate();
  const [activeStrategy, setActiveStrategy] = useState<PriceStrategy>('optimised');
  const [expandedInsight, setExpandedInsight]   = useState<number | null>(null);
  const [selectedTier, setSelectedTier]         = useState<PricingTier | null>(null);

  // ── Scenario outputs ──
  const scenarioOutputs = useMemo(() => {
    const cfg = STRATEGY_CONFIG[activeStrategy];
    const baseRev    = 6320000;
    const baseMargin = 68.4;
    const baseVol    = 6866;
    return {
      revenue:  (baseRev    * cfg.revMult    / 1000000).toFixed(2),
      margin:   (baseMargin * cfg.marginMult).toFixed(1),
      volume:   Math.round(baseVol * cfg.volumeMult).toLocaleString(),
      uplift:   ((cfg.revMult - 1) * 100).toFixed(1),
    };
  }, [activeStrategy]);

  const handleInsightClick = useCallback((i: number) => {
    setExpandedInsight(prev => prev === i ? null : i);
  }, []);

  // ── Waterfall cumulative ──
  const waterfallData = useMemo(() => {
    let running = 0;
    return REVENUE_WATERFALL.map((d) => {
      if (d.type === 'base') { running = d.value; return { ...d, base: 0, bar: d.value }; }
      if (d.type === 'total') return { ...d, base: 0, bar: d.value };
      const base = running;
      running += d.value;
      return { ...d, base: d.value > 0 ? base : running, bar: Math.abs(d.value) };
    });
  }, []);

  return (
    <div className="demand-dashboard-container">

      {/* ── Header ── */}
      <div className="df-header">
        <button className="df-back-btn" onClick={() => navigate('/modules', {state: { scrollToModule: 'commercial' }})}>← Back</button>
        <div className="df-header-center">
          <div className="po-module-tag">Commercial & pricing excellence</div>
          <h1>Pricing optimisation</h1>
          {/* <p className="df-header-sub">AI-driven price intelligence · margin management · competitive positioning</p> */}
        </div>
        <div className="df-header-right">
          <span className="status-badge" style={{ background: '#fef3c7', color: '#92400e' }}>● 6 price actions pending</span>
          <span className="df-updated">Updated 4 min ago</span>
        </div>
      </div>

      {/* ── How it works ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="df-flow-strip"
      >
        <p className="df-section-label">How pricing optimisation works</p>
        <div className="df-flow-row">
          {[
            { step: '1 — Analyse',  desc: 'Market prices, elasticity, win/loss data and margin by product are ingested continuously.' },
            { step: '2 — Model',    desc: 'AI calculates optimal price per SKU balancing margin, volume and competitive position.' },
            { step: '3 — Simulate', desc: 'Pricing strategies are stress-tested across segments before any change is applied.' },
            { step: '4 — Execute',  desc: 'Approved price changes push to CRM and CPQ — margin and win rate improve.' },
          ].map((item, i) => (
            <React.Fragment key={item.step}>
              <div className={`df-flow-step${i === 3 ? ' df-flow-step--success' : ''}`}>
                <span className="df-flow-step-num">{item.step}</span>
                <span className="df-flow-step-desc">{item.desc}</span>
              </div>
              {i < 3 && <span className="df-flow-arrow">→</span>}
            </React.Fragment>
          ))}
        </div>
      </motion.div>

      {/* ── KPI Grid ── */}
      <p className="df-section-label" style={{ marginTop: '1.5rem' }}>Pricing performance at a glance</p>
      <div className="df-kpi-grid">
        {[
          { title: 'Portfolio gross margin',  value: '73.2%',  delta: '↑ 4.8pp from baseline',   positive: true,  tip: 'Blended gross margin across all active SKUs after COGS.',          spark: [62, 64, 67, 69, 71, 73] },
          { title: 'AI pricing uplift (YTD)', value: '+$621K', delta: '↑ vs static pricing',     positive: true,  tip: 'Incremental revenue generated by AI-recommended price moves YTD.',  spark: [80, 180, 290, 390, 510, 621] },
          { title: 'Avg deal discount',       value: '11.4%',  delta: '↓ 3.2pp improvement',     positive: true,  tip: 'Average discount applied across all closed deals this quarter.',    spark: [16, 15, 14, 13, 12, 11.4] },
          { title: 'Price realisation',       value: '91.8%',  delta: '↑ 2.1pp vs last quarter', positive: true,  tip: 'Percentage of list price actually collected. 100% = no discounts.', spark: [86, 87, 88, 90, 91, 92] },
          { title: 'Win rate at list price',  value: '58.4%',  delta: '↑ 5pp improvement',       positive: true,  tip: 'Percentage of deals won without any discount applied.',             spark: [48, 50, 52, 54, 56, 58] },
          { title: 'Price actions pending',   value: '6',      delta: '↑ 2 new AI recs',         positive: false, tip: 'SKUs where AI recommends a price change that is not yet approved.',  spark: [2, 3, 4, 5, 4, 6] },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            whileHover={{ y: -4, transition: { duration: 0.18 } }}
            className="df-kpi-card"
            title={kpi.tip}
          >
            <div className="df-kpi-left">
              <p className="df-kpi-label">{kpi.title}</p>
              <h3 className="df-kpi-value">{kpi.value}</h3>
              <span className={`df-kpi-delta ${kpi.positive ? 'positive' : 'negative'}`}>{kpi.delta}</span>
            </div>
            <div style={{ width: 52, height: 26 }}>
              <ResponsiveContainer>
                <LineChart data={kpi.spark.map(v => ({ v }))}>
                  <Line type="monotone" dataKey="v" stroke={kpi.positive ? '#1D9E75' : '#E24B4A'} strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Impact banner ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="df-profit-banner"
      >
        <div className="df-profit-banner-label">Annual margin impact from AI pricing optimisation</div>
        <div className="df-profit-banner-items">
          {[
            { label: 'Price increase captures',  value: '+$621K revenue'  },
            { label: 'Discount discipline',       value: '+$310K margin'   },
            { label: 'Bundle revenue unlocked',   value: '+$148K ARR'      },
            { label: 'Competitive repositioning', value: '+$84K win value' },
          ].map(item => (
            <div key={item.label} className="df-profit-item">
              <span className="df-profit-item-label">{item.label}</span>
              <span className="df-profit-item-value">{item.value}</span>
            </div>
          ))}
          <div className="df-profit-item df-profit-item--total">
            <span className="df-profit-item-label">Total annual impact</span>
            <span className="df-profit-item-total">+$1.16M</span>
          </div>
        </div>
      </motion.div>

      {/* ── SKU Pricing Table ── */}
      <div className="chart-card">
        <div className="df-chart-header">
          <div>
            <h3 className="chart-title">SKU pricing intelligence — AI optimal vs current</h3>
            <p className="df-chart-desc">
              The AI compares your list price against demand elasticity, competitor benchmarks, and
              margin targets to recommend the optimal price per SKU. Click any row to see the detail.
            </p>
          </div>
        </div>
        <div className="po-table-wrap">
          <table className="po-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Current price</th>
                <th>AI optimal</th>
                <th>Δ Price</th>
                <th>Elasticity</th>
                <th>Gross margin</th>
                <th>Volume / mo</th>
                <th>Competitor avg</th>
                <th>Recommendation</th>
                <th>Rev impact</th>
              </tr>
            </thead>
            <tbody>
              {PRICING_TIERS.map(tier => {
                const delta = tier.aiOptimalPrice - tier.currentPrice;
                const deltaPct = ((delta / tier.currentPrice) * 100).toFixed(1);
                return (
                  <tr
                    key={tier.id}
                    className={`po-tr${selectedTier?.id === tier.id ? ' po-tr-selected' : ''}${tier.recommendation === 'Decrease' ? ' po-tr-warn' : ''}`}
                    onClick={() => setSelectedTier(prev => prev?.id === tier.id ? null : tier)}
                  >
                    <td>
                      <div className="po-product-name">{tier.name}</div>
                      <div className="po-product-id">{tier.id}</div>
                    </td>
                    <td className="po-td-num">${tier.currentPrice.toLocaleString()}</td>
                    <td className="po-td-num po-td-optimal">${tier.aiOptimalPrice.toLocaleString()}</td>
                    <td className={`po-td-num ${delta > 0 ? 'po-green' : delta < 0 ? 'po-red' : 'po-muted'}`}>
                      {delta > 0 ? '+' : ''}{delta !== 0 ? `$${delta}` : '—'} ({delta >= 0 ? '+' : ''}{deltaPct}%)
                    </td>
                    <td className="po-td-num po-muted">{tier.elasticity}</td>
                    <td>
                      <div className="po-margin-wrap">
                        <div className="po-margin-track">
                          <div className="po-margin-fill" style={{
                            width: `${tier.margin}%`,
                            background: tier.margin >= 70 ? '#1D9E75' : tier.margin >= 50 ? '#BA7517' : '#E24B4A',
                          }} />
                        </div>
                        <span className="po-margin-label">{tier.margin}%</span>
                      </div>
                    </td>
                    <td className="po-td-num">{tier.volume.toLocaleString()}</td>
                    <td className="po-td-num po-muted">${tier.competitors.toLocaleString()}</td>
                    <td><RecBadge rec={tier.recommendation} /></td>
                    <td className={`po-td-num ${tier.revenueImpact > 0 ? 'po-green' : tier.revenueImpact < 0 ? 'po-red' : 'po-muted'}`}>
                      {tier.revenueImpact > 0 ? '+' : ''}{tier.revenueImpact !== 0 ? `$${(tier.revenueImpact / 1000).toFixed(0)}K` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Expanded SKU detail panel */}
        <AnimatePresence>
          {selectedTier && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="po-detail-panel"
            >
              <div className="po-detail-header">
                <div>
                  <div className="po-detail-name">{selectedTier.name}</div>
                  <div className="po-detail-sub">{selectedTier.id} · Recommendation: <strong>{selectedTier.recommendation}</strong></div>
                </div>
                <button className="po-detail-close" onClick={() => setSelectedTier(null)}>✕</button>
              </div>
              <div className="po-detail-grid">
                <div className="po-detail-stat">
                  <span className="po-detail-label">Current price</span>
                  <span className="po-detail-val">${selectedTier.currentPrice.toLocaleString()}</span>
                </div>
                <div className="po-detail-stat">
                  <span className="po-detail-label">AI optimal price</span>
                  <span className="po-detail-val po-green">${selectedTier.aiOptimalPrice.toLocaleString()}</span>
                </div>
                <div className="po-detail-stat">
                  <span className="po-detail-label">Gross margin</span>
                  <span className="po-detail-val">{selectedTier.margin}%</span>
                </div>
                <div className="po-detail-stat">
                  <span className="po-detail-label">Price elasticity</span>
                  <span className="po-detail-val">{selectedTier.elasticity}</span>
                </div>
                <div className="po-detail-stat">
                  <span className="po-detail-label">Monthly volume</span>
                  <span className="po-detail-val">{selectedTier.volume.toLocaleString()} units</span>
                </div>
                <div className="po-detail-stat">
                  <span className="po-detail-label">Revenue impact</span>
                  <span className="po-detail-val po-green">+${(selectedTier.revenueImpact / 1000).toFixed(0)}K ARR</span>
                </div>
              </div>
              <div className="po-detail-advice">
                {selectedTier.recommendation === 'Increase' &&
                  `Price elasticity of ${selectedTier.elasticity} means a ${(((selectedTier.aiOptimalPrice - selectedTier.currentPrice) / selectedTier.currentPrice) * 100).toFixed(0)}% price increase causes only ~${Math.abs(Math.round(selectedTier.elasticity * ((selectedTier.aiOptimalPrice - selectedTier.currentPrice) / selectedTier.currentPrice) * 100))}% volume loss — a net revenue gain of +$${(selectedTier.revenueImpact / 1000).toFixed(0)}K. Recommend piloting with new customers first.`}
                {selectedTier.recommendation === 'Decrease' &&
                  `At $${selectedTier.currentPrice} you are $${selectedTier.currentPrice - selectedTier.competitors} above the competitor average. High elasticity of ${selectedTier.elasticity} means each 1% price drop recovers significant volume. Reducing to $${selectedTier.aiOptimalPrice} is projected to improve win rate by 8–12pp.`}
                {selectedTier.recommendation === 'Hold' &&
                  `Current price is aligned with market and elasticity is high. Any increase would lose disproportionate volume. Hold and focus on cost reduction to improve margin instead.`}
                {selectedTier.recommendation === 'Bundle' &&
                  `Standalone win rate is low. Bundle with Enterprise Platform to increase attach rate from 34% → 78% and improve effective margin to 91%.`}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Margin trend + Elasticity curve ── */}
      <div className="df-grid-2">
        <div className="chart-card">
          <h3 className="chart-title">Gross & net margin trend</h3>
          <p className="df-chart-desc">
            Gross margin above target (70%) means pricing is healthy. When gross and net diverge, check
            for rising COGS or discount over-use in the same period.
          </p>
          <div className="df-legend">
            <span><span className="df-legend-dot" style={{ background: '#185FA5' }} />Gross margin</span>
            <span><span className="df-legend-dot" style={{ background: '#1D9E75' }} />Net margin</span>
            <span><span className="df-legend-dot" style={{ background: '#E24B4A', opacity: 0.5, border: '1px dashed #E24B4A' }} />Target 70%</span>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={MARGIN_TREND} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="grossGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#185FA5" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#185FA5" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.12} />
                <XAxis dataKey="month" fontSize={10} tick={{ fill: '#888' }} tickLine={false} axisLine={false} />
                <YAxis fontSize={10} tick={{ fill: '#888' }} tickLine={false} axisLine={false} unit="%" domain={[30, 80]} width={36} />
                <Tooltip content={<POTooltip />} />
                <ReferenceLine y={70} stroke="#E24B4A" strokeDasharray="4 3" label={{ value: 'Target', fontSize: 9, fill: '#E24B4A', position: 'insideTopRight' }} />
                <Area type="monotone" dataKey="gross" name="Gross margin" stroke="#185FA5" fill="url(#grossGrad)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="net"   name="Net margin"   stroke="#1D9E75" strokeWidth={2} dot={false} strokeDasharray="5 3" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Demand elasticity curve — Starter Pack</h3>
          <p className="df-chart-desc">
            Shows how volume changes as price increases. The steeper the curve, the more elastic (price-sensitive)
            the product. Use this to find the revenue-maximising price point.
          </p>
          <div className="po-elastic-note">
            Current price <strong>$79</strong> · Revenue-max point <strong>~$149</strong>
          </div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={ELASTICITY_DATA} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="elastGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#BA7517" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#BA7517" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.12} />
                <XAxis dataKey="price" fontSize={10} tick={{ fill: '#888' }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} label={{ value: 'Price ($)', fontSize: 10, fill: '#888', position: 'insideBottom', offset: -2 }} />
                <YAxis fontSize={10} tick={{ fill: '#888' }} tickLine={false} axisLine={false} width={40} tickFormatter={v => `${(v / 1000).toFixed(1)}K`} />
                <Tooltip content={<POTooltip />} />
                <ReferenceLine x={79}  stroke="#185FA5" strokeDasharray="4 3" label={{ value: 'Current', fontSize: 9, fill: '#185FA5', position: 'top' }} />
                <ReferenceLine x={149} stroke="#1D9E75" strokeDasharray="4 3" label={{ value: 'Optimal', fontSize: 9, fill: '#1D9E75', position: 'top' }} />
                <Area type="monotone" dataKey="demand" name="Demand (units)" stroke="#BA7517" fill="url(#elastGrad)" strokeWidth={2.5} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Competitor benchmarking + Discount analysis ── */}
      <div className="df-grid-2">
        <div className="chart-card">
          <h3 className="chart-title">Competitive price benchmarking</h3>
          <p className="df-chart-desc">
            How your prices compare to three main competitors per product. "Below" = opportunity to raise.
            "Premium" = must justify with clear value differentiation.
          </p>
          <div className="po-competitor-table">
            <div className="po-comp-header">
              <span>Product</span>
              <span>Our price</span>
              <span>Comp A</span>
              <span>Comp B</span>
              <span>Comp C</span>
              <span>Position</span>
            </div>
            {COMPETITOR_PRICES.map(row => (
              <div key={row.product} className="po-comp-row">
                <span className="po-comp-product">{row.product}</span>
                <span className="po-comp-our">${row.ourPrice.toLocaleString()}</span>
                <span className={`po-comp-val ${row.ourPrice < row.compA ? 'po-green' : row.ourPrice > row.compA ? 'po-red' : ''}`}>${row.compA.toLocaleString()}</span>
                <span className={`po-comp-val ${row.ourPrice < row.compB ? 'po-green' : row.ourPrice > row.compB ? 'po-red' : ''}`}>${row.compB.toLocaleString()}</span>
                <span className={`po-comp-val ${row.ourPrice < row.compC ? 'po-green' : row.ourPrice > row.compC ? 'po-red' : ''}`}>${row.compC.toLocaleString()}</span>
                <span><PosBadge pos={row.position} /></span>
              </div>
            ))}
          </div>
          <div className="po-comp-legend">
            <span className="po-green">↓ Below competitor</span>
            <span className="po-red">↑ Above competitor</span>
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Discount band analysis — margin vs win rate</h3>
          <p className="df-chart-desc">
            Higher discounts win more deals but destroy margin. The 10–20% band is the sweet spot —
            strong win rate without eroding below the 40% margin floor.
          </p>
          <div style={{ height: 230 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={DISCOUNT_DATA} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.12} />
                <XAxis dataKey="band" fontSize={10} tick={{ fill: '#888' }} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left"  fontSize={10} tick={{ fill: '#888' }} tickLine={false} axisLine={false} width={32} />
                <YAxis yAxisId="right" orientation="right" fontSize={10} tick={{ fill: '#888' }} tickLine={false} axisLine={false} width={32} unit="%" />
                <Tooltip content={<POTooltip />} />
                <ReferenceLine yAxisId="left" y={40} stroke="#E24B4A" strokeDasharray="4 3" label={{ value: 'Margin floor', fontSize: 9, fill: '#E24B4A', position: 'insideTopRight' }} />
                <Bar yAxisId="left"  dataKey="avgMargin" name="Avg margin %"  fill="#185FA5" radius={[4,4,0,0]} barSize={28}>
                  {DISCOUNT_DATA.map((d, i) => (
                    <Cell key={i} fill={d.avgMargin < 40 ? '#E24B4A' : d.avgMargin < 55 ? '#BA7517' : '#185FA5'} />
                  ))}
                </Bar>
                <Line yAxisId="right" type="monotone" dataKey="winRate" name="Win rate %" stroke="#1D9E75" strokeWidth={2} dot={{ r: 4, fill: '#1D9E75', strokeWidth: 0 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Revenue waterfall + Radar ── */}
      <div className="df-grid-2">
        <div className="chart-card">
          <h3 className="chart-title">Revenue uplift waterfall — AI pricing actions</h3>
          <p className="df-chart-desc">
            Each bar shows the ARR impact of a single pricing action. Green = gain, red = offset.
            Net result: +$97K ARR if all recommendations are implemented.
          </p>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterfallData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.12} />
                <XAxis dataKey="label" fontSize={9} tick={{ fill: '#888' }} tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={40} />
                <YAxis fontSize={10} tick={{ fill: '#888' }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}K`} width={48} />
                <Tooltip content={<POTooltip />} />
                <Bar dataKey="bar" name="Value ($K)" radius={[4,4,0,0]} barSize={32}>
                  {waterfallData.map((d, i) => (
                    <Cell
                      key={i}
                      fill={d.type === 'base' ? '#64748b' : d.type === 'total' ? '#185FA5' : d.type === 'gain' ? '#1D9E75' : '#E24B4A'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Pricing maturity radar — current vs optimised</h3>
          <p className="df-chart-desc">
            Measures pricing capability across 6 dimensions. The gap between current (red) and
            optimised (green) is the opportunity. Discount discipline and segment alignment have
            the largest room to improve.
          </p>
          <div className="df-legend">
            <span><span className="df-legend-dot" style={{ background: '#1D9E75' }} />Optimised state</span>
            <span><span className="df-legend-dot" style={{ background: '#E24B4A' }} />Current state</span>
          </div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={RADAR_DATA} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
                <PolarGrid gridType="polygon" stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fill: '#64748b' }} />
                <Radar name="Optimised" dataKey="optimised" stroke="#1D9E75" fill="#1D9E75" fillOpacity={0.18} strokeWidth={2} />
                <Radar name="Current"   dataKey="current"   stroke="#E24B4A" fill="#E24B4A" fillOpacity={0.12} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Scenario planner ── */}
      <div className="chart-card">
        <div className="df-chart-header">
          <div>
            <h3 className="chart-title">Pricing strategy scenario planner</h3>
            <p className="df-chart-desc">
              Compare four pricing strategies across revenue, margin and volume before committing.
              AI-optimised is recommended — it maximises margin without sacrificing meaningful volume.
            </p>
          </div>
        </div>
        <div className="df-scenario-tabs">
          {(Object.keys(STRATEGY_CONFIG) as PriceStrategy[]).map(key => (
            <button
              key={key}
              className={`df-scenario-tab${activeStrategy === key ? ' active' : ''}`}
              style={activeStrategy === key ? { borderColor: STRATEGY_CONFIG[key].color, color: STRATEGY_CONFIG[key].color } : {}}
              onClick={() => setActiveStrategy(key)}
            >
              {STRATEGY_CONFIG[key].label}
            </button>
          ))}
        </div>
        <div className="df-scenario-outputs">
          <div className="df-kpi-card" style={{ cursor: 'default' }}>
            <div className="df-kpi-left">
              <p className="df-kpi-label">Projected ARR</p>
              <h3 className="df-kpi-value">${scenarioOutputs.revenue}M</h3>
            </div>
          </div>
          <div className="df-kpi-card" style={{ cursor: 'default' }}>
            <div className="df-kpi-left">
              <p className="df-kpi-label">Blended margin</p>
              <h3 className="df-kpi-value">{scenarioOutputs.margin}%</h3>
            </div>
          </div>
          <div className="df-kpi-card" style={{ cursor: 'default' }}>
            <div className="df-kpi-left">
              <p className="df-kpi-label">Est. volume</p>
              <h3 className="df-kpi-value">{scenarioOutputs.volume}</h3>
            </div>
          </div>
          <div className="df-kpi-card" style={{ cursor: 'default' }}>
            <div className="df-kpi-left">
              <p className="df-kpi-label">Revenue uplift</p>
              <h3 className="df-kpi-value"
                style={{ color: Number(scenarioOutputs.uplift) >= 0 ? '#1D9E75' : '#E24B4A' }}>
                {Number(scenarioOutputs.uplift) >= 0 ? '+' : ''}{scenarioOutputs.uplift}%
              </h3>
            </div>
          </div>
        </div>
        <div className="df-scenario-advice">
          {activeStrategy === 'current'    && 'Current pricing leaves $621K in annual revenue unrealised. 6 SKUs are mispriced relative to market and elasticity data.'}
          {activeStrategy === 'optimised'  && 'AI-recommended: captures full margin opportunity with minimal volume impact. Best risk-adjusted outcome across all segments.'}
          {activeStrategy === 'aggressive' && 'Volume-led growth strategy. Sacrifices 8pp margin to drive 22% more units. Best for market share goals, not profitability.'}
          {activeStrategy === 'premium'    && 'Premium repositioning captures maximum margin but risks 12% volume loss. Only viable if brand perception and NPS support it.'}
        </div>
      </div>

      {/* ── AI Insights ── */}
      <div className="chart-card">
        <h3 className="chart-title">AI-generated pricing insights & recommended actions</h3>
        <p className="df-chart-desc" style={{ marginBottom: 14 }}>
          The pricing engine monitors market data, win/loss signals, and margin performance 24/7.
          Each insight has a quantified revenue impact. Click to reveal the recommended action.
        </p>
        {PO_INSIGHTS.map((insight, i) => (
          <motion.div
            key={insight.title}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`df-insight-row df-insight-row--${insight.type}`}
            onClick={() => handleInsightClick(i)}
            style={{ cursor: insight.action ? 'pointer' : 'default' }}
          >
            <div className={`df-insight-icon df-insight-icon--${insight.type}`}>
              <InsightIcon type={insight.type} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
                <div className="df-insight-title">{insight.title}</div>
                <span className="po-impact-tag">{insight.impact}</span>
              </div>
              <div className="df-insight-desc">{insight.desc}</div>
              <AnimatePresence>
                {expandedInsight === i && insight.action && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="df-insight-action"
                  >
                    Recommended action: <strong>{insight.action}</strong>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {insight.action && (
              <span className="df-insight-expand">{expandedInsight === i ? '▲' : '▼'}</span>
            )}
          </motion.div>
        ))}
      </div>

    </div>
  );
};

export default PricingOptimization;