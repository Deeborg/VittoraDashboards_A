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
type CategoryKey = 'all' | 'electronics' | 'apparel' | 'home';

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

const BUFFER_DATA = [
  { month: 'Jul', forecast: 4500, stockLimit: 5500, critical: 3500 },
  { month: 'Aug', forecast: 4800, stockLimit: 5500, critical: 3500 },
  { month: 'Sep', forecast: 5200, stockLimit: 5500, critical: 3500 },
  { month: 'Oct', forecast: 5900, stockLimit: 5500, critical: 3500 },
  { month: 'Nov', forecast: 6300, stockLimit: 5500, critical: 3500 },
  { month: 'Dec', forecast: 6100, stockLimit: 5500, critical: 3500 },
];

const REGIONAL_DATA = [
  { name: 'Asia Pacific', demand: 22000 },
  { name: 'North America', demand: 18000 },
  { name: 'Europe', demand: 15500 },
  { name: 'LATAM', demand: 8000 },
];

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

const CATEGORY_OFFSETS: Record<CategoryKey, { base: number; amp: number }> = {
  all:         { base: 3100, amp: 500 },
  electronics: { base: 1180, amp: 190 },
  apparel:     { base: 820,  amp: 130 },
  home:        { base: 640,  amp: 100 },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateSeries(base: number, amp: number, withNoise = false) {
  return Array.from({ length: 42 }, (_, i) => {
    const noise = withNoise ? Math.random() * 300 - 150 : 0;
    return Math.round(base + i * 55 + Math.sin(i / 2) * amp + noise);
  });
}

function useChartData(category: CategoryKey) {
  return useMemo(() => {
    const { base, amp } = CATEGORY_OFFSETS[category];
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
  }, [category]);
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

  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all');
  const [activeScenario, setActiveScenario] = useState<ScenarioKey>('base');
  const [demandShift, setDemandShift]       = useState<number>(0);
  const [expandedInsight, setExpandedInsight] = useState<number | null>(null);

  const chartData = useChartData(activeCategory);

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
  const categories: { key: CategoryKey; label: string }[] = [
    { key: 'all',         label: 'All categories' },
    { key: 'electronics', label: 'Electronics'    },
    { key: 'apparel',     label: 'Apparel'        },
    { key: 'home',        label: 'Home & garden'  },
  ];

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
            {categories.map(cat => (
              <button
                key={cat.key}
                className={`df-pill${activeCategory === cat.key ? ' df-pill--active' : ''}`}
                onClick={() => setActiveCategory(cat.key)}
              >
                {cat.label}
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
            key={activeCategory}
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
          <h3 className="chart-title">Regional demand split</h3>
          <p className="df-chart-desc">Which markets drive volume? Use this to prioritise replenishment and logistics investment.</p>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REGIONAL_DATA} barSize={42} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="name" fontSize={11} tick={{ fill: '#888' }} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tick={{ fill: '#888' }} tickLine={false} axisLine={false} tickFormatter={v => `${v / 1000}K`} />
                <Tooltip
                  cursor={{ fill: '#f1f5f9' }}
                  formatter={(v: number) => [v.toLocaleString() + ' units', 'Demand']}
                />
                <Bar dataKey="demand" radius={[5, 5, 0, 0]}>
                  {REGIONAL_DATA.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? '#185FA5' : '#B4B2A9'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
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
        <div className="chart-card">
          <h3 className="chart-title">Capacity vs demand outlook</h3>
          <p className="df-chart-desc">
            Red bars show months where forecast exceeds fulfillment capacity — a direct profit risk
            requiring early action.
          </p>
          <div className="df-legend">
            <span><span className="df-legend-dot" style={{ background: '#185FA5' }} />Within capacity</span>
            <span><span className="df-legend-dot" style={{ background: '#E24B4A' }} />Over capacity</span>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={BUFFER_DATA} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="month" fontSize={11} tick={{ fill: '#888' }} tickLine={false} axisLine={false} />
                <YAxis
                  fontSize={11}
                  tick={{ fill: '#888' }}
                  tickLine={false}
                  axisLine={false}
                  domain={[3000, 7000]}
                  tickFormatter={v => `${v / 1000}K`}
                  width={40}
                />
                <Tooltip formatter={(v: number) => v.toLocaleString()} />
                <Bar dataKey="forecast" name="Forecast demand" barSize={36} shape={<BufferBar />} radius={[4, 4, 0, 0]} />
                <ReferenceLine
                  y={5500}
                  stroke="#888"
                  strokeDasharray="4 3"
                  label={{ value: 'Stock limit 5.5K', fontSize: 10, fill: '#888', position: 'insideTopRight' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
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