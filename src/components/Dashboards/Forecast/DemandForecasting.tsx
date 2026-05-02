import React, { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './DemandForecasting.css';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
  ComposedChart,
  ReferenceLine,
  Legend,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────

type RiskLevel = 'Critical' | 'Watch' | 'On track' | 'Overstock';
type ScenarioKey = 'pessimistic' | 'base' | 'optimistic';
type RegionalViewKey = 'forecast' | 'historical';
type CapacityViewKey = 'forecast' | 'historical';
type ProductKey =
  | 'headset'
  | 'laptop'
  | 'monitor'
  | 'keyboard'
  | 'webcam'
  | 'dock';

interface ProductConfig {
  key: ProductKey;
  label: string;       // Short pill label
  fullName: string;    // Full product name shown in chart header
  base: number;        // Baseline monthly demand
  amp: number;         // Seasonal amplitude
  noise: number;       // Actual-demand noise factor
  seed: number;        // Deterministic random seed
}

interface RegionalDataPoint {
  name: string;
  demand: number;     // Forecast value
  historical: number; // Prior-year actual
  growth: string;     // YoY growth label
}

interface SKU {
  id: string;
  name: string;
  daysLeft: number;
  region: string;
  trend: string;
  risk: RiskLevel;
  unitsAtRisk: string;
}

interface Insight {
  type: 'warn' | 'danger' | 'info' | 'ok';
  title: string;
  desc: string;
  action?: string;
}

interface KPIItem {
  title: string;
  value: string;
  delta: string;
  positive: boolean;
  tooltip: string;
  sparkData: number[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTH_LABELS: string[] = Array.from({ length: 42 }, (_, i) => {
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const year = 2023 + Math.floor(i / 12);
  return `${names[i % 12]} '${String(year).slice(-2)}`;
});

const PRODUCTS: ProductConfig[] = [
  {
    key: 'headset',
    label: 'Wireless headset',
    fullName: 'Wireless Headset Pro',
    base: 1200, amp: 180, noise: 120, seed: 11,
  },
  {
    key: 'laptop',
    label: '15" laptop',
    fullName: '15" Business Laptop',
    base: 980,  amp: 130, noise: 90,  seed: 22,
  },
  {
    key: 'monitor',
    label: '4K display',
    fullName: '4K Display 27"',
    base: 760,  amp: 110, noise: 80,  seed: 33,
  },
  {
    key: 'keyboard',
    label: 'Mech keyboard',
    fullName: 'Mechanical Keyboard TKL',
    base: 640,  amp: 90,  noise: 60,  seed: 44,
  },
  {
    key: 'webcam',
    label: 'HD webcam',
    fullName: 'HD Webcam 4K',
    base: 520,  amp: 75,  noise: 50,  seed: 55,
  },
  {
    key: 'dock',
    label: 'USB-C dock',
    fullName: 'USB-C Docking Station',
    base: 430,  amp: 60,  noise: 40,  seed: 66,
  },
];

const REGIONAL_DATA: RegionalDataPoint[] = [
  { name: 'Asia Pacific',  demand: 22000, historical: 18400, growth: '+19.6% YoY' },
  { name: 'North America', demand: 18000, historical: 16200, growth: '+11.1% YoY' },
  { name: 'Europe',        demand: 15500, historical: 15100, growth: '+2.6% YoY'  },
  { name: 'LATAM',         demand: 8000,  historical: 6300,  growth: '+27.0% YoY' },
];

const CAPACITY_HISTORICAL_DATA = [
  { month: "Jan '23", demand: 3100, stockLimit: 5500 },
  { month: "Feb '23", demand: 3250, stockLimit: 5500 },
  { month: "Mar '23", demand: 3400, stockLimit: 5500 },
  { month: "Apr '23", demand: 3600, stockLimit: 5500 },
  { month: "May '23", demand: 3750, stockLimit: 5500 },
  { month: "Jun '23", demand: 3900, stockLimit: 5500 },
  { month: "Jul '23", demand: 4100, stockLimit: 5500 },
  { month: "Aug '23", demand: 3800, stockLimit: 5500 },
  { month: "Sep '23", demand: 3950, stockLimit: 5500 },
  { month: "Oct '23", demand: 4300, stockLimit: 5500 },
  { month: "Nov '23", demand: 4600, stockLimit: 5500 },
  { month: "Dec '23", demand: 5100, stockLimit: 5500 },
  { month: "Jan '24", demand: 3200, stockLimit: 5500 },
  { month: "Feb '24", demand: 3350, stockLimit: 5500 },
  { month: "Mar '24", demand: 3550, stockLimit: 5500 },
  { month: "Apr '24", demand: 3800, stockLimit: 5500 },
  { month: "May '24", demand: 4050, stockLimit: 5500 },
  { month: "Jun '24", demand: 4200, stockLimit: 5500 },
  { month: "Jul '24", demand: 4400, stockLimit: 5500 },
  { month: "Aug '24", demand: 4150, stockLimit: 5500 },
  { month: "Sep '24", demand: 4350, stockLimit: 5500 },
  { month: "Oct '24", demand: 4700, stockLimit: 5500 },
  { month: "Nov '24", demand: 5050, stockLimit: 5500 },
  { month: "Dec '24", demand: 5600, stockLimit: 5500 }, // ← breached
  { month: "Jan '25", demand: 3500, stockLimit: 5500 },
  { month: "Feb '25", demand: 3700, stockLimit: 5500 },
  { month: "Mar '25", demand: 3900, stockLimit: 5500 },
  { month: "Apr '25", demand: 4100, stockLimit: 5500 },
  { month: "May '25", demand: 4300, stockLimit: 5500 },
  { month: "Jun '25", demand: 4500, stockLimit: 5500 },
  { month: "Jul '25", demand: 4700, stockLimit: 5500 },
  { month: "Aug '25", demand: 4500, stockLimit: 5500 },
  { month: "Sep '25", demand: 4750, stockLimit: 5500 },
  { month: "Oct '25", demand: 5100, stockLimit: 5500 },
  { month: "Nov '25", demand: 5400, stockLimit: 5500 },
  { month: "Dec '25", demand: 5800, stockLimit: 5500 }, // ← breached
  { month: "Jan '26", demand: 3800, stockLimit: 5500 },
  { month: "Feb '26", demand: 4000, stockLimit: 5500 },
  { month: "Mar '26", demand: 4200, stockLimit: 5500 }, // ← last historical month
];

const CAPACITY_FORECAST_DATA = [
  { month: "Apr '26", demand: 4500, stockLimit: 5500 },
  { month: "May '26", demand: 4800, stockLimit: 5500 },
  { month: "Jun '26", demand: 5200, stockLimit: 5500 },
  { month: "Jul '26", demand: 5500, stockLimit: 5500 },
  { month: "Aug '26", demand: 5900, stockLimit: 5500 }, // ← breached
  { month: "Sep '26", demand: 5700, stockLimit: 5500 }, // ← breached
  { month: "Oct '26", demand: 6300, stockLimit: 5500 }, // ← breached
  { month: "Nov '26", demand: 6100, stockLimit: 5500 }, // ← breached
  { month: "Dec '26", demand: 5800, stockLimit: 5500 }, // ← breached
];

const BUFFER_DATA = [
  { month: 'Jul', forecast: 4500, stockLimit: 5500, critical: 3500 },
  { month: 'Aug', forecast: 4800, stockLimit: 5500, critical: 3500 },
  { month: 'Sep', forecast: 5200, stockLimit: 5500, critical: 3500 },
  { month: 'Oct', forecast: 5900, stockLimit: 5500, critical: 3500 },
  { month: 'Nov', forecast: 6300, stockLimit: 5500, critical: 3500 },
  { month: 'Dec', forecast: 6100, stockLimit: 5500, critical: 3500 },
];

// const REGIONAL_DATA = [
//   { name: 'Asia Pacific', demand: 22000 },
//   { name: 'North America', demand: 18000 },
//   { name: 'Europe', demand: 15500 },
//   { name: 'LATAM', demand: 8000 },
// ];

const SKUS: SKU[] = [
  { id: 'SKU-8829', name: 'Wireless Headset Pro', daysLeft: 3,  region: 'APAC', trend: '↑ 22%', risk: 'Critical',  unitsAtRisk: '~$62K' },
  { id: 'SKU-2201', name: 'Yoga Mat XL',          daysLeft: 8,  region: 'EMEA', trend: '↑ 9%',  risk: 'Critical',  unitsAtRisk: '~$31K' },
  { id: 'SKU-1029', name: 'LED Desk Lamp',         daysLeft: 11, region: 'NA',   trend: 'Stable', risk: 'Watch',     unitsAtRisk: '~$18K' },
  { id: 'SKU-3304', name: 'Running Shoes M10',     daysLeft: 18, region: 'NA',   trend: '↑ 4%',  risk: 'Watch',     unitsAtRisk: '~$9K'  },
  { id: 'SKU-4410', name: 'Smart Thermostat',      daysLeft: 26, region: 'NA',   trend: 'Seasonal peak', risk: 'On track',  unitsAtRisk: '—' },
  { id: 'SKU-5503', name: 'Bluetooth Speaker',     daysLeft: 34, region: 'APAC', trend: '↓ 6%',  risk: 'Overstock', unitsAtRisk: '$4.2K/wk' },
];

const INSIGHTS: Insight[] = [
  {
    type: 'danger',
    title: 'Capacity breach expected in Oct & Nov',
    desc: 'Forecasted demand (5,900–6,300 units) exceeds stock limit of 5,500. Profit at risk: ~$180K in lost sales.',
    action: 'Pre-position inventory by Sep 15',
  },
  {
    type: 'danger',
    title: 'SKU-8829 will stock out in 3 days',
    desc: 'APAC demand up 22% above forecast. Emergency replenishment or inter-region transfer needed. Revenue at risk: $62K.',
    action: 'Raise emergency PO today',
  },
  {
    type: 'info',
    title: 'SKU-5503 building overstock (34 days cover)',
    desc: 'Holding cost accruing at ~$4.2K/week. Promotional push or price reduction recommended before next replenishment cycle.',
    action: 'Launch clearance promo',
  },
  {
    type: 'ok',
    title: 'Forecast accuracy improved 2.1pp month-on-month',
    desc: 'New seasonal decomposition model incorporated. Annualised savings from improved accuracy: $2.18M vs $1.9M last quarter.',
  },
];

const SCENARIO_CONFIG: Record<ScenarioKey, { label: string; mult: number; color: string }> = {
  pessimistic: { label: 'Pessimistic (−15%)', mult: 0.85, color: '#E24B4A' },
  base:        { label: 'Base case',           mult: 1.00, color: '#185FA5' },
  optimistic:  { label: 'Optimistic (+20%)',   mult: 1.20, color: '#1D9E75' },
};

// const CATEGORY_OFFSETS: Record(CategoryKey, { base: number; amp: number }> = {
//   all:         { base: 3100, amp: 500 },
//   electronics: { base: 1180, amp: 190 },
//   apparel:     { base: 820,  amp: 130 },
//   home:        { base: 640,  amp: 100 },
// };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateSeries(base: number, amp: number, withNoise = false) {
  return Array.from({ length: 42 }, (_, i) => {
    const noise = withNoise ? Math.random() * 300 - 150 : 0;
    return Math.round(base + i * 55 + Math.sin(i / 2) * amp + noise);
  });
}

function useChartData(product: ProductConfig) {
  return useMemo(() => {
    const { base, amp } = product;
    const forecast = generateSeries(base, amp);
    const actual   = generateSeries(base, amp, true).map((v, i) => (i < 36 ? v : null));
    const upper    = forecast.map(v => Math.round(v * 1.12));
    const lower    = forecast.map(v => Math.round(v * 0.88));
    return MONTH_LABELS.map((label, i) => ({
      label,
      actual:   actual[i],
      forecast: forecast[i],
      upper:    upper[i],
      lower:    lower[i],
    }));
  }, [product]);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const Sparkline: React.FC<{ data: number[]; positive: boolean }> = ({ data, positive }) => (
  <div style={{ width: 56, height: 28 }}>
    <ResponsiveContainer>
      <LineChart data={data.map(v => ({ v }))}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={positive ? '#1D9E75' : '#E24B4A'}
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const KPICard: React.FC<{ kpi: KPIItem; index: number }> = ({ kpi, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.06, duration: 0.35 }}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    className="df-kpi-card"
    title={kpi.tooltip}
  >
    <div className="df-kpi-left">
      <p className="df-kpi-label">{kpi.title}</p>
      <h3 className="df-kpi-value">{kpi.value}</h3>
      <span className={`df-kpi-delta ${kpi.positive ? 'positive' : 'negative'}`}>
        {kpi.delta}
      </span>
    </div>
    <Sparkline data={kpi.sparkData} positive={kpi.positive} />
  </motion.div>
);

const RiskBadge: React.FC<{ risk: RiskLevel }> = ({ risk }) => {
  const map: Record<RiskLevel, string> = {
    Critical:  'df-badge-danger',
    Watch:     'df-badge-warn',
    'On track':'df-badge-ok',
    Overstock: 'df-badge-info',
  };
  return <span className={`df-badge ${map[risk]}`}>{risk}</span>;
};

const InsightIcon: React.FC<{ type: Insight['type'] }> = ({ type }) => {
  const colors: Record<string, string> = {
    danger: '#E24B4A', warn: '#BA7517', info: '#185FA5', ok: '#1D9E75',
  };
  const c = colors[type];
  if (type === 'ok') {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M3 8.5L6.5 12L13 5" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === 'info') {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6" stroke={c} strokeWidth="1.5" />
        <line x1="8" y1="7" x2="8" y2="11" stroke={c} strokeWidth="1.5" />
        <circle cx="8" cy="5.5" r=".7" fill={c} />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M8 2L14 13H2L8 2Z" stroke={c} strokeWidth="1.5" fill="none" />
      <line x1="8" y1="7" x2="8" y2="10" stroke={c} strokeWidth="1.5" />
      <circle cx="8" cy="12" r=".7" fill={c} />
    </svg>
  );
};

// Custom tooltip for main trend chart
const TrendTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="df-tooltip">
      <p className="df-tooltip-label">{label}</p>
      {payload
        .filter((p: any) => !['upper', 'lower'].includes(p.dataKey) && p.value != null)
        .map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color }}>
            {p.name}: {Number(p.value).toLocaleString()}
          </p>
        ))}
    </div>
  );
};

const RegionalTooltip: React.FC<any> = ({ active, payload, label, view }: any) => {
  if (!active || !payload?.length) return null;
  const row = REGIONAL_DATA.find(r => r.name === label);
  return (
    <div className="df-tooltip">
      <p className="df-tooltip-label">{label}</p>
      <p style={{ color: view === 'forecast' ? '#185FA5' : '#BA7517' }}>
        {view === 'forecast' ? 'Forecast (next 12 mo)' : 'Historical (prior 12 mo)'}:{' '}
        {Number(payload[0].value).toLocaleString()} units
      </p>
      {view === 'forecast' && row && (
        <p style={{ color: '#1D9E75', fontSize: 11, marginTop: 2 }}>{row.growth} vs prior year</p>
      )}
    </div>
  );
};

interface RegionalViewToggleProps {
  view: RegionalViewKey;
  onChange: (v: RegionalViewKey) => void;
}

const RegionalViewToggle: React.FC<{ view: RegionalViewKey; onChange: (v: RegionalViewKey) => void }> = ({ view, onChange }) => {
  const base: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 500,
    padding: '5px 14px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.15s, color 0.15s',
    lineHeight: 1.4,
    outline: 'none',
  };
  const active: React.CSSProperties   = { background: '#185FA5', color: '#fff' };
  const inactive: React.CSSProperties = { background: '#F1F5F9', color: '#555' };

  return (
    <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid #E2E8F0', flexShrink: 0 }}>
      <button
        style={{ ...base, ...(view === 'forecast' ? active : inactive), borderRadius: '7px 0 0 7px' }}
        onClick={() => onChange('forecast')}
        aria-pressed={view === 'forecast'}
      >
        Forecast
      </button>
      <button
        style={{ ...base, ...(view === 'historical' ? { background: '#BA7517', color: '#fff' } : inactive), borderRadius: '0 7px 7px 0' }}
        onClick={() => onChange('historical')}
        aria-pressed={view === 'historical'}
      >
        Historical
      </button>
    </div>
  );
};


// Custom buffer chart bar to colour over-capacity bars red
const BufferBar: React.FC<any> = (props) => {
  const { x, y, width, height, value } = props;
  const isOver = value > 5500;
  return (
    <rect
      x={x} y={y} width={width} height={height}
      fill={isOver ? '#E24B4A' : '#185FA5'}
      rx={3}
    />
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const DemandForecasting: React.FC = () => {
  const navigate = useNavigate();

  const [activeProduct, setActiveProduct] = useState<ProductConfig>(PRODUCTS[0]);  
  const [activeScenario, setActiveScenario] = useState<ScenarioKey>('base');
  const [demandShift, setDemandShift]       = useState<number>(0);
  const [expandedInsight, setExpandedInsight] = useState<number | null>(null);
  const [regionalView, setRegionalView]       = useState<RegionalViewKey>('forecast');
  const [capacityView, setCapacityView] = useState<CapacityViewKey>('forecast');

  const chartData = useChartData(activeProduct);

  const regionalDataKey: keyof RegionalDataPoint = regionalView === 'forecast' ? 'demand' : 'historical';
  const regionalColor  = regionalView === 'forecast' ? '#185FA5' : '#BA7517';
  const regionalMuted  = regionalView === 'forecast' ? '#C8D6E5' : '#DDD0B3';

  // ── KPI Data ──
  const kpiData: KPIItem[] = useMemo(() => [
    {
      title: 'Forecast accuracy',
      value: '96.8%',
      delta: '↑ 1.2pp vs last month',
      positive: true,
      tooltip: 'Mean Absolute Percentage Error (MAPE) = 3.2%. Industry benchmark is <5%.',
      sparkData: [80, 83, 85, 88, 92, 94, 97],
    },
    {
      title: 'Revenue at risk saved',
      value: '$1.4M',
      delta: '↑ stockout prevention',
      positive: true,
      tooltip: 'Revenue that would have been lost to stockouts, recovered by proactive replenishment signals.',
      sparkData: [600, 750, 900, 1000, 1150, 1300, 1400],
    },
    {
      title: 'Overstock cost avoided',
      value: '$380K',
      delta: '↓ holding cost saved',
      positive: true,
      tooltip: 'Inventory holding cost avoided by reducing excess safety stock across all SKUs.',
      sparkData: [100, 160, 200, 260, 310, 360, 380],
    },
    {
      title: 'Inventory coverage',
      value: '42 days',
      delta: '↓ 3d (leaner = better)',
      positive: true,
      tooltip: 'Days of stock on hand. Tighter coverage means less capital locked in inventory.',
      sparkData: [55, 52, 50, 48, 46, 44, 42],
    },
    {
      title: 'Gross margin lift',
      value: '+3.6%',
      delta: 'vs no-forecast baseline',
      positive: true,
      tooltip: 'Margin improvement attributable to better procurement timing and fewer markdowns.',
      sparkData: [0.5, 1.2, 1.8, 2.4, 2.9, 3.3, 3.6],
    },
    {
      title: 'Anomalies detected',
      value: '3',
      delta: '↓ 1 vs prior week',
      positive: true,
      tooltip: 'Demand spikes or drops detected by the AI model that deviate >2σ from forecast.',
      sparkData: [10, 8, 7, 5, 4, 4, 3],
    },
  ], []);

  // ── Scenario Calculator ──
  const scenarioOutputs = useMemo(() => {
    const mult = SCENARIO_CONFIG[activeScenario].mult * (1 + demandShift / 100);
    const revenue     = (4.2  * mult).toFixed(2);
    const units       = Math.round(42180 * mult).toLocaleString();
    const days        = Math.round(42   * mult);
    const marginDelta = Math.round((4200000 * mult - 4200000) * 0.38);
    let advice = '';
    const pct = Math.round((mult - 1) * 100);
    if (pct > 15)       advice = `Demand surge (+${pct}%) — pre-order stock now to avoid stockouts. Expected margin gain: +$${Math.abs(marginDelta).toLocaleString()}.`;
    else if (pct > 5)   advice = 'Moderate growth — review safety stock levels and lead time buffers.';
    else if (pct < -15) advice = `Demand drop (${pct}%) — delay procurement and activate promotions to clear stock.`;
    else if (pct < -5)  advice = `Softening demand — reduce next procurement order by ~${Math.abs(pct)}% to avoid overstock.`;
    else                advice = 'Base case — forecast aligned with current procurement plan. No immediate action needed.';
    return { revenue, units, days, marginDelta, advice };
  }, [activeScenario, demandShift]);

  const handleDemandShift = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDemandShift(Number(e.target.value));
  }, []);

  // ── Categories ──
  // const categories: { key: CategoryKey; label: string }[] = [
  //   { key: 'all',         label: 'All categories' },
  //   { key: 'electronics', label: 'Electronics'    },
  //   { key: 'apparel',     label: 'Apparel'        },
  //   { key: 'home',        label: 'Home & garden'  },
  // ];

  return (
    <div className="demand-dashboard-container">

      {/* ── Header ── */}
      <div className="df-header">
        <button className="df-back-btn" onClick={() => navigate('/modules', {state: { scrollToModule: 'scm' }})}>
          ← Back to SCM
        </button>
        <div className="df-header-center">
          <h1>Demand forecasting analytics</h1>
          <p className="df-header-sub">Supply chain intelligence module</p>
        </div>
        <div className="df-header-right">
          <span className="status-badge status-live">● AI model v4.2 live</span>
          <span className="df-updated">Updated 2 min ago</span>
        </div>
      </div>

      {/* ── What is demand forecasting? ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="df-flow-strip"
      >
        <p className="df-section-label">How it works</p>
        <div className="df-flow-row">
          {[
            { step: '1 — Collect', desc: 'Historical sales, seasonality & market signals are ingested automatically.' },
            { step: '2 — Model',   desc: 'AI predicts future demand per SKU and region using time-series models.' },
            { step: '3 — Act',     desc: 'Procurement, logistics and pricing decisions are guided by the forecast.' },
            { step: '4 — Profit',  desc: 'Reduced waste, fewer stockouts and higher gross margin result.' },
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
      <p className="df-section-label" style={{ marginTop: '1.5rem' }}>Business impact at a glance</p>
      <div className="df-kpi-grid">
        {kpiData.map((kpi, i) => (
          <KPICard key={kpi.title} kpi={kpi} index={i} />
        ))}
      </div>

      {/* ── Profit Impact Banner ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="df-profit-banner"
      >
        <div className="df-profit-banner-label">Annual profit impact from AI forecasting</div>
        <div className="df-profit-banner-items">
          {[
            { label: 'Stockout revenue saved', value: '+$1.40M' },
            { label: 'Holding cost reduced',   value: '−$380K'  },
            { label: 'Rush order premiums cut', value: '−$210K' },
            { label: 'Markdown reduction',      value: '+$190K' },
          ].map(item => (
            <div key={item.label} className="df-profit-item">
              <span className="df-profit-item-label">{item.label}</span>
              <span className="df-profit-item-value">{item.value}</span>
            </div>
          ))}
          <div className="df-profit-item df-profit-item--total">
            <span className="df-profit-item-label">Total annual impact</span>
            <span className="df-profit-item-total">+$2.18M</span>
          </div>
        </div>
      </motion.div>

      {/* ── Trend Chart ── */}
      <div className="chart-card">
        <div className="df-chart-header">
          <div>
            <h3 className="chart-title">Forecast vs actual demand </h3>
            <p className="df-chart-desc">
              The shaded band is the model's confidence range. When actual demand stays inside it, the AI
              is performing correctly. Gaps are anomalies worth investigating.
            </p>
          </div>
          <div className="df-pills">
            {PRODUCTS.map(product => (
              <button
                key={product.key}
                className={`df-pill${activeProduct === product ? ' df-pill--active' : ''}`}
                onClick={() => setActiveProduct(product)}
              >
                {product.label}
              </button>
            ))}
          </div>
        </div>

        <div className="df-legend">
          <span><span className="df-legend-dot" style={{ background: '#185FA5' }} />Actual demand</span>
          <span><span className="df-legend-dot" style={{ background: '#1D9E75', border: '1px dashed #1D9E75' }} />Forecast</span>
          <span><span className="df-legend-dot" style={{ background: '#E24B4A', opacity: 0.3 }} />Confidence band</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeProduct.key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ height: 280 }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E24B4A" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#E24B4A" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis
                  dataKey="label"
                  fontSize={10}
                  tick={{ fill: '#888' }}
                  interval={5}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  fontSize={10}
                  tick={{ fill: '#888' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => v.toLocaleString()}
                  width={55}
                />
                <Tooltip content={<TrendTooltip />} />
                <Area
                  type="monotone"
                  dataKey="upper"
                  stroke="none"
                  fill="url(#bandGrad)"
                  name="upper"
                  legendType="none"
                />
                <Area
                  type="monotone"
                  dataKey="lower"
                  stroke="none"
                  fill="#ffffff"
                  fillOpacity={1}
                  name="lower"
                  legendType="none"
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#1D9E75"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={false}
                  name="Forecast"
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#185FA5"
                  strokeWidth={2.5}
                  dot={false}
                  name="Actual demand"
                  connectNulls={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Regional + Profit Breakdown ── */}
      <div className="df-grid-2">
        <div className="chart-card">

          {/* Header row: title left, toggle right */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
            <div>
              <h3 className="chart-title" style={{ marginBottom: 4 }}>Regional demand split</h3>
              <p className="df-chart-desc" style={{ maxWidth: 280 }}>
                {regionalView === 'forecast'
                  ? ' Prioritise replenishment accordingly.'
                  : 'Actual units sold in the prior 12 months, by region.'}
              </p>
            </div>
            <RegionalViewToggle view={regionalView} onChange={setRegionalView} />
          </div>

          {/* Period pill */}
          <div style={{ marginBottom: 8 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
              background: regionalView === 'forecast' ? '#EBF3FD' : '#FDF3E3',
              color:      regionalView === 'forecast' ? '#185FA5' : '#BA7517',
              border:     regionalView === 'forecast' ? '1px solid #BDD4F0' : '1px solid #F0D9A8',
            }}>
              <span style={{ fontSize: 13 }}>{regionalView === 'forecast' ? '📈' : '🕐'}</span>
              {regionalView === 'forecast' ? 'Forecast ' : 'Historical'}
            </span>
          </div>

          {/* Animated bar chart */}
          <AnimatePresence mode="wait">
            <motion.div
              key={regionalView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{ height: 190 }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={REGIONAL_DATA} barSize={38} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                  <XAxis dataKey="name" fontSize={11} tick={{ fill: '#888' }} tickLine={false} axisLine={false} />
                  <YAxis fontSize={11} tick={{ fill: '#888' }} tickLine={false} axisLine={false} tickFormatter={v => `${v / 1000}K`} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} content={<RegionalTooltip view={regionalView} />} />
                  <Bar dataKey={regionalDataKey as string} radius={[5, 5, 0, 0]}>
                    {REGIONAL_DATA.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? regionalColor : regionalMuted} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </AnimatePresence>

          {/* YoY growth chips — only in forecast view */}
          {/* <AnimatePresence>
            {regionalView === 'forecast' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}
              >
                {REGIONAL_DATA.map(r => (
                  <div key={r.name} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    background: '#F0FBF6', border: '1px solid #C6ECD9',
                    borderRadius: 8, padding: '4px 10px', minWidth: 64,
                  }}>
                    <span style={{ fontSize: 10, color: '#888', fontWeight: 500 }}>
                      {r.name === 'Asia Pacific' ? 'APAC' : r.name === 'North America' ? 'NA' : r.name === 'Europe' ? 'EU' : 'LATAM'}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1D9E75' }}>{r.growth}</span>
                    <span style={{ fontSize: 9, color: '#aaa' }}>YoY</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence> */}
        </div>

        <div className="chart-card">
          <h3 className="chart-title">How forecast accuracy drives profit</h3>
          <p className="df-chart-desc">Each accuracy gain translates directly to measurable margin improvement:</p>
          <div className="df-profit-table">
            {[
              { label: 'Stockout reduction',        value: '+$1.4M revenue saved',  pos: true  },
              { label: 'Lower safety stock',         value: '−$380K holding cost',   pos: true  },
              { label: 'Better procurement timing',  value: '−$210K rush premiums',  pos: true  },
              { label: 'Markdown reduction',         value: '+$190K margin',         pos: true  },
            ].map(row => (
              <div key={row.label} className="df-profit-row">
                <span className="df-profit-row-label">{row.label}</span>
                <span className="df-profit-row-value positive">{row.value}</span>
              </div>
            ))}
            <div className="df-profit-row df-profit-row--total">
              <span style={{ fontWeight: 500 }}>Total impact (annual)</span>
              <span className="df-profit-total-val">+$2.18M</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Scenario Planner ── */}
      <div className="chart-card">
        <div className="df-chart-header">
          <div>
            <h3 className="chart-title">Scenario planner — what if demand shifts?</h3>
            <p className="df-chart-desc">
              Select a scenario and adjust the fine-tuning slider to stress-test your supply plan
              before committing to procurement orders.
            </p>
          </div>
        </div>

        <div className="df-scenario-tabs">
          {(Object.keys(SCENARIO_CONFIG) as ScenarioKey[]).map(key => (
            <button
              key={key}
              className={`df-scenario-tab${activeScenario === key ? ' active' : ''}`}
              style={activeScenario === key ? { borderColor: SCENARIO_CONFIG[key].color, color: SCENARIO_CONFIG[key].color } : {}}
              onClick={() => setActiveScenario(key)}
            >
              {SCENARIO_CONFIG[key].label}
            </button>
          ))}
        </div>

        <div className="df-slider-row">
          <span className="df-slider-label">Fine-tune demand shift</span>
          <input
            type="range"
            min={-30}
            max={30}
            step={1}
            value={demandShift}
            onChange={handleDemandShift}
            style={{ flex: 1 }}
          />
          <span className="df-slider-val">
            {demandShift > 0 ? '+' : ''}{demandShift}%
          </span>
        </div>

        <div className="df-scenario-outputs">
          <div className="df-kpi-card" style={{ cursor: 'default' }}>
            <div className="df-kpi-left">
              <p className="df-kpi-label">Projected revenue</p>
              <h3 className="df-kpi-value">${scenarioOutputs.revenue}M</h3>
            </div>
          </div>
          <div className="df-kpi-card" style={{ cursor: 'default' }}>
            <div className="df-kpi-left">
              <p className="df-kpi-label">Units to procure</p>
              <h3 className="df-kpi-value">{scenarioOutputs.units}</h3>
            </div>
          </div>
          <div className="df-kpi-card" style={{ cursor: 'default' }}>
            <div className="df-kpi-left">
              <p className="df-kpi-label">Stock needed (days)</p>
              <h3 className="df-kpi-value">{scenarioOutputs.days}d</h3>
            </div>
          </div>
          <div className="df-kpi-card" style={{ cursor: 'default' }}>
            <div className="df-kpi-left">
              <p className="df-kpi-label">Margin impact</p>
              <h3
                className="df-kpi-value"
                style={{ color: scenarioOutputs.marginDelta >= 0 ? '#1D9E75' : '#E24B4A' }}
              >
                {scenarioOutputs.marginDelta >= 0 ? '+' : ''}$
                {Math.abs(scenarioOutputs.marginDelta).toLocaleString()}
              </h3>
            </div>
          </div>
        </div>

        <div className="df-scenario-advice">
          {scenarioOutputs.advice}
        </div>
      </div>

      {/* ── Capacity vs Demand + SKU Watchlist ── */}
      <div className="df-grid-2">
        {/* ── Capacity vs Demand ── */}
<div className="chart-card">
  {/* Header row */}
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
    <div>
      <h3 className="chart-title">Capacity vs demand outlook</h3>
      <p className="df-chart-desc" style={{ maxWidth: 300 }}>
        {capacityView === 'forecast'
          ? 'Red bars exceed the 5,500-unit fulfillment limit.'
          : 'Red bars are historical breaches.'}
      </p>
    </div>

    {/* Toggle — same pattern as RegionalViewToggle */}
    <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid #E2E8F0', flexShrink: 0 }}>
      <button
        style={{
          fontSize: 12, fontWeight: 500, padding: '5px 14px',
          border: 'none', cursor: 'pointer', lineHeight: 1.4, outline: 'none',
          borderRadius: '7px 0 0 7px',
          background: capacityView === 'forecast' ? '#185FA5' : '#F1F5F9',
          color:      capacityView === 'forecast' ? '#fff'    : '#555',
          transition: 'background 0.15s, color 0.15s',
        }}
        onClick={() => setCapacityView('forecast')}
        aria-pressed={capacityView === 'forecast'}
      >
        Forecast
      </button>
      <button
        style={{
          fontSize: 12, fontWeight: 500, padding: '5px 14px',
          border: 'none', cursor: 'pointer', lineHeight: 1.4, outline: 'none',
          borderRadius: '0 7px 7px 0',
          background: capacityView === 'historical' ? '#BA7517' : '#F1F5F9',
          color:      capacityView === 'historical' ? '#fff'    : '#555',
          transition: 'background 0.15s, color 0.15s',
        }}
        onClick={() => setCapacityView('historical')}
        aria-pressed={capacityView === 'historical'}
      >
        Historical
      </button>
    </div>
  </div>

  {/* Period pill */}
  <div style={{ marginBottom: 8 }}>
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
      background: capacityView === 'forecast' ? '#EBF3FD' : '#FDF3E3',
      color:      capacityView === 'forecast' ? '#185FA5' : '#BA7517',
      border:     capacityView === 'forecast' ? '1px solid #BDD4F0' : '1px solid #F0D9A8',
    }}>
      {capacityView === 'forecast' ? '📈 Forecast' : '🕐 Historical'}
    </span>
  </div>

  <div className="df-legend">
    <span>
      <span className="df-legend-dot" style={{ background: '#185FA5' }} />
      Within capacity
    </span>
    <span>
      <span className="df-legend-dot" style={{ background: '#E24B4A' }} />
      Over capacity
    </span>
  </div>

  <AnimatePresence mode="wait">
    <motion.div
      key={capacityView}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      style={{ height: 240 }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={capacityView === 'forecast' ? CAPACITY_FORECAST_DATA : CAPACITY_HISTORICAL_DATA}
          margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
          <XAxis
            dataKey="month"
            fontSize={capacityView === 'historical' ? 9 : 11}
            tick={{ fill: '#888' }}
            tickLine={false}
            axisLine={false}
            interval={capacityView === 'historical' ? 2 : 0} // skip labels when dense
          />
          <YAxis
            fontSize={11}
            tick={{ fill: '#888' }}
            tickLine={false}
            axisLine={false}
            domain={[2500, 7000]}
            tickFormatter={v => `${v / 1000}K`}
            width={40}
          />
          <Tooltip formatter={(v: number) => [v.toLocaleString() + ' units', 'Demand']} />
          <Bar
            dataKey="demand"
            name="Demand"
            barSize={capacityView === 'historical' ? 10 : 36}
            shape={<BufferBar />}
            radius={[4, 4, 0, 0]}
          />
          <ReferenceLine
            y={5500}
            stroke="#888"
            strokeDasharray="4 3"
            label={{
              value: 'Capacity limit 5.5K',
              fontSize: 10,
              fill: '#888',
              position: 'insideTopRight',
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </motion.div>
  </AnimatePresence>

  {/* Historical summary chips — only visible in historical view */}
  <AnimatePresence>
    {capacityView === 'historical' && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
        style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}
      >
        {/* {[
          { label: 'Breach months',  value: '3',     color: '#E24B4A', bg: '#FCEBEB', border: '#F7C1C1' },
          { label: 'Worst month',    value: 'Dec',   color: '#E24B4A', bg: '#FCEBEB', border: '#F7C1C1' },
          { label: 'Avg demand',     value: '4,311', color: '#185FA5', bg: '#EBF3FD', border: '#BDD4F0' },
          { label: 'Peak (Dec \'25)', value: '5,800', color: '#BA7517', bg: '#FDF3E3', border: '#F0D9A8' },
        ].map(chip => (
          <div key={chip.label} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            background: chip.bg, border: `1px solid ${chip.border}`,
            borderRadius: 8, padding: '4px 12px', minWidth: 70,
          }}>
            <span style={{ fontSize: 10, color: '#888', fontWeight: 500 }}>{chip.label}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: chip.color }}>{chip.value}</span>
          </div>
        ))} */}
      </motion.div>
    )}
  </AnimatePresence>
</div>

        <div className="chart-card">
          <div className="df-chart-header" style={{ marginBottom: 8 }}>
            <h3 className="chart-title" style={{ margin: 0 }}>SKU health & risk watchlist</h3>
          </div>
          <p className="df-chart-desc" style={{ marginBottom: 12 }}>
            AI-flagged SKUs needing attention. Act before stock reaches zero.
          </p>
          {SKUS.map(sku => (
            <div key={sku.id} className="df-sku-row">
              <div className="df-sku-info">
                <span className="df-sku-name">{sku.id} — {sku.name}</span>
                <span className="df-sku-meta">
                  {sku.daysLeft}d left · {sku.region} · Demand {sku.trend}
                  {sku.unitsAtRisk !== '—' && ` · Risk: ${sku.unitsAtRisk}`}
                </span>
              </div>
              <RiskBadge risk={sku.risk} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Model Performance ── */}
      <div className="chart-card">
        <h3 className="chart-title">AI model performance — why you can trust this forecast</h3>
        <p className="df-chart-desc" style={{ marginBottom: 16 }}>
          These three metrics measure forecast reliability. Lower error means better decisions,
          less waste, and higher profit margin.
        </p>
        <div className="df-model-grid">
          {[
            {
              metric: 'MAPE — Mean absolute % error',
              value: '3.2%',
              fill: 3.2,
              max: 10,
              color: '#1D9E75',
              label: 'Excellent — target is below 5%',
              labelColor: '#1D9E75',
              desc: 'How far off (on average) each forecast is from actual demand, in percentage terms.',
            },
            {
              metric: 'Bias — systematic over/under forecast',
              value: '+0.4%',
              fill: 4,
              max: 20,
              color: '#1D9E75',
              label: 'Slight overforecast — acceptable',
              labelColor: '#1D9E75',
              desc: 'Whether the model consistently over- or under-predicts. Near zero means balanced.',
            },
            {
              metric: 'RMSE — Root mean squared error',
              value: '148 units',
              fill: 30,
              max: 100,
              color: '#BA7517',
              label: 'Monitor — influenced by spike events',
              labelColor: '#BA7517',
              desc: 'Penalises large misses heavily. Higher values indicate occasional big forecast errors.',
            },
          ].map(m => (
            <div key={m.metric} className="df-model-item">
              <p className="df-model-metric">{m.metric}</p>
              <p className="df-model-desc">{m.desc}</p>
              <p className="df-model-value">{m.value}</p>
              <div className="df-model-bar">
                <div
                  className="df-model-bar-fill"
                  style={{ width: `${(m.fill / m.max) * 100}%`, background: m.color }}
                />
              </div>
              <p className="df-model-status" style={{ color: m.labelColor }}>{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── AI Insights ── */}
      <div className="chart-card">
        <h3 className="chart-title">AI-generated insights & recommended actions</h3>
        <p className="df-chart-desc" style={{ marginBottom: 12 }}>
          The model surfaces the most important supply chain risks and opportunities. Each insight
          includes a recommended action with estimated financial impact.
        </p>
        {INSIGHTS.map((insight, i) => (
          <motion.div
            key={insight.title}
            className={`df-insight-row df-insight-row--${insight.type}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            onClick={() => setExpandedInsight(expandedInsight === i ? null : i)}
            style={{ cursor: 'pointer' }}
          >
            <div className={`df-insight-icon df-insight-icon--${insight.type}`}>
              <InsightIcon type={insight.type} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="df-insight-title">{insight.title}</div>
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
              <span className="df-insight-expand">
                {expandedInsight === i ? '▲' : '▼'}
              </span>
            )}
          </motion.div>
        ))}
      </div>

    </div>
  );
};

export default DemandForecasting;