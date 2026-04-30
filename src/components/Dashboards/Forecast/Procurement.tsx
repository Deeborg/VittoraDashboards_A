import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DemandForecasting.css';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  CartesianGrid, LineChart, Line, PieChart, Pie, Cell,
  ComposedChart, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts';

// ─── Static Data ─────────────────────────────────────────────────────────────

const supplierPerformance = [
  { supplier: 'TechParts Co.',     cost: 450, leadTime: 12, reliability: 96, defectRate: 1.2, spend: 1200000 },
  { supplier: 'Global Steel',      cost: 890, leadTime: 22, reliability: 81, defectRate: 3.8, spend: 3100000 },
  { supplier: 'Fast Electronics',  cost: 320, leadTime: 8,  reliability: 98, defectRate: 0.6, spend: 980000  },
  { supplier: 'PrecisionMach',     cost: 610, leadTime: 15, reliability: 89, defectRate: 2.1, spend: 1850000 },
  { supplier: 'CoreMetals Ltd.',   cost: 730, leadTime: 18, reliability: 93, defectRate: 1.7, spend: 2400000 },
];

const spendTrend = [
  { month: 'Jul', spend: 850000,  budget: 900000  },
  { month: 'Aug', spend: 920000,  budget: 900000  },
  { month: 'Sep', spend: 1100000, budget: 1000000 },
  { month: 'Oct', spend: 980000,  budget: 1000000 },
  { month: 'Nov', spend: 870000,  budget: 950000  },
  { month: 'Dec', spend: 1050000, budget: 1000000 },
  { month: 'Jan', spend: 1200000, budget: 1100000 },
  { month: 'Feb', spend: 940000,  budget: 1000000 },
];

const spendByCategory = [
  { category: 'Raw Materials',  spend: 4200000 },
  { category: 'Components',     spend: 3100000 },
  { category: 'Packaging',      spend: 1400000 },
  { category: 'MRO',            spend: 980000  },
  { category: 'Services',       spend: 720000  },
];

const riskData = [
  { name: 'Single Source', value: 35 },
  { name: 'Multi Source',  value: 65 },
];

const pieData = [
  { name: 'Received',   value: 65 },
  { name: 'In-Transit', value: 25 },
  { name: 'Pending',    value: 10 },
];
const PO_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

const openPOs = [
  { poId: 'PO-4401', supplier: 'Global Steel',     item: 'Steel Sheets',     qty: 5000, value: '$42,000', eta: 'May 02', status: 'In-Transit', risk: 'High'   },
  { poId: 'PO-4402', supplier: 'TechParts Co.',    item: 'Circuit Boards',   qty: 200,  value: '$18,400', eta: 'May 04', status: 'Pending',    risk: 'Medium' },
  { poId: 'PO-4403', supplier: 'Fast Electronics', item: 'Sensor Modules',   qty: 500,  value: '$9,800',  eta: 'Apr 30', status: 'In-Transit', risk: 'Low'    },
  { poId: 'PO-4404', supplier: 'CoreMetals Ltd.',  item: 'Aluminum Ingots',  qty: 3000, value: '$31,500', eta: 'May 07', status: 'Pending',    risk: 'Medium' },
  { poId: 'PO-4405', supplier: 'PrecisionMach',    item: 'CNC Parts',        qty: 150,  value: '$22,100', eta: 'May 01', status: 'Delayed',    risk: 'High'   },
];

const cycleTimeSteps = [
  { label: 'Requisition Approval', time: 2.1, target: 1.5 },
  { label: 'PO Processing',        time: 0.5, target: 0.5 },
  { label: 'Supplier Confirmation',time: 1.8, target: 1.0 },
  { label: 'Goods-in-Transit',     time: 8.4, target: 7.0 },
  { label: 'Goods Receipt & GRN',  time: 1.2, target: 1.0 },
  { label: 'Invoice Matching',     time: 1.4, target: 1.0 },
];

const contractData = [
  { supplier: 'TechParts Co.',    expiry: 'Aug 2025', coverage: 88, status: 'Active'   },
  { supplier: 'Global Steel',     expiry: 'May 2025', coverage: 62, status: 'Expiring' },
  { supplier: 'Fast Electronics', expiry: 'Mar 2026', coverage: 95, status: 'Active'   },
  { supplier: 'PrecisionMach',    expiry: 'Jun 2025', coverage: 74, status: 'Expiring' },
  { supplier: 'CoreMetals Ltd.',  expiry: 'Jan 2026', coverage: 91, status: 'Active'   },
];

const savingsData = [
  { quarter: 'Q1', negotiated: 120000, realized: 98000  },
  { quarter: 'Q2', negotiated: 145000, realized: 131000 },
  { quarter: 'Q3', negotiated: 98000,  realized: 88000  },
  { quarter: 'Q4', negotiated: 160000, realized: 142000 },
];

const radarData = [
  { subject: 'Cost',        A: 82 },
  { subject: 'Lead Time',   A: 76 },
  { subject: 'Quality',     A: 91 },
  { subject: 'Reliability', A: 88 },
  { subject: 'Compliance',  A: 79 },
  { subject: 'Risk Mgmt',   A: 68 },
];

const alerts = [
  { type: 'critical', msg: 'PO-4405 (CNC Parts) is delayed — production impact on WO-992',       time: '08:30 AM' },
  { type: 'warning',  msg: 'Global Steel contract expiring in 28 days — renewal action needed',   time: '09:00 AM' },
  { type: 'warning',  msg: 'Steel Sheets stock at 23% — reorder threshold breached',              time: '09:45 AM' },
  { type: 'info',     msg: 'PO-4403 Sensor Modules arriving tomorrow — GRN team notified',        time: '10:15 AM' },
];

const ALERT_COLORS: Record<string, string> = {
  critical: '#ef4444',
  warning:  '#f59e0b',
  info:     '#3b82f6',
};

// ─── Sub-Components ──────────────────────────────────────────────────────────

const KPICard = ({
  title, value, trend, sub, positive
}: {
  title: string; value: string; trend: string; sub?: string; positive: boolean;
}) => (
  <div style={{
    background: '#ffffff', padding: '22px 24px', borderRadius: '16px',
    border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
  }}>
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '4px', height: '100%',
      background: positive ? '#10b981' : '#ef4444', borderRadius: '16px 0 0 16px'
    }} />
    <div style={{ paddingLeft: '8px' }}>
      <p style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.07em', marginBottom: '8px' }}>{title}</p>
      <h3 style={{ fontSize: '26px', margin: '0 0 4px', color: '#0f172a', fontWeight: 700, lineHeight: 1 }}>{value}</h3>
      <span style={{ fontSize: '12px', fontWeight: 600, color: positive ? '#10b981' : '#ef4444' }}>{trend}</span>
      {sub && <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '8px' }}>{sub}</span>}
    </div>
  </div>
);

const RiskBadge = ({ risk }: { risk: string }) => {
  const map: Record<string, { bg: string; color: string }> = {
    High:   { bg: '#fee2e2', color: '#dc2626' },
    Medium: { bg: '#fef3c7', color: '#b45309' },
    Low:    { bg: '#dcfce7', color: '#15803d' },
  };
  const s = map[risk] || map['Low'];
  return (
    <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px', background: s.bg, color: s.color }}>
      {risk}
    </span>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { bg: string; color: string }> = {
    'In-Transit': { bg: '#eff6ff', color: '#1d4ed8' },
    'Pending':    { bg: '#fef3c7', color: '#b45309' },
    'Delayed':    { bg: '#fee2e2', color: '#dc2626' },
    'Received':   { bg: '#dcfce7', color: '#15803d' },
    'Active':     { bg: '#dcfce7', color: '#15803d' },
    'Expiring':   { bg: '#fef3c7', color: '#b45309' },
  };
  const s = map[status] || { bg: '#f1f5f9', color: '#64748b' };
  return (
    <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '99px', background: s.bg, color: s.color }}>
      {status}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ProcurementPlanning: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'suppliers' | 'orders' | 'contracts'>('overview');

  const kpiData = [
    { title: 'Total Spend (YTD)',      value: '$12.4M', trend: '-2.4%', sub: 'vs last year',    positive: true  },
    { title: 'PO Lead Time (Avg)',     value: '14 Days',trend: '-2 Days', sub: 'target: 12 days', positive: true  },
    { title: 'Supplier Reliability',   value: '94.2%',  trend: '+1.5%', sub: 'last 90 days',    positive: true  },
    { title: 'Cost Variance',          value: '-3.2%',  trend: '+0.5%', sub: 'vs budget',        positive: true  },
    { title: 'Open Purchase Orders',   value: '38',     trend: '+4',    sub: '5 delayed',         positive: false },
    { title: 'Negotiated Savings YTD', value: '$459K',  trend: '+12%',  sub: 'vs target $400K',  positive: true  },
  ];

  const tabs = [
    { key: 'overview',   label: '📊 Overview'           },
    { key: 'suppliers',  label: '🏭 Supplier Analysis'   },
    { key: 'orders',     label: '📦 Purchase Orders'     },
    { key: 'contracts',  label: '📄 Contracts & Savings' },
  ];

  return (
    <div className="demand-dashboard-container">

      {/* ── Header ── */}
      <div className="df-header">
        <button className="df-back-btn" onClick={() => navigate('/modules', { state: { scrollToModule: 'scm' } })}>← Back to SCM</button>
        <h1>Procurement Planning</h1>
        <div className="status-badge" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>● PROCUREMENT OPTIMIZED</div>
      </div>

      {/* ── Alerts Strip ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
        {alerts.map((a, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            background: '#ffffff', border: `1px solid ${ALERT_COLORS[a.type]}33`,
            borderLeft: `4px solid ${ALERT_COLORS[a.type]}`,
            borderRadius: '10px', padding: '10px 16px', fontSize: '13px'
          }}>
            <span style={{ color: ALERT_COLORS[a.type], fontWeight: 700, minWidth: '60px', textTransform: 'capitalize' }}>{a.type}</span>
            <span style={{ flex: 1, color: '#334155' }}>{a.msg}</span>
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>{a.time}</span>
          </div>
        ))}
      </div>

      {/* ── KPI Grid ── */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {kpiData.map((k, i) => <KPICard key={i} {...k} />)}
      </div>

      {/* ── Tab Navigation ── */}
      <div style={{ display: 'flex', gap: '8px', margin: '24px 0 16px', borderBottom: '2px solid #e2e8f0' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key as any)} style={{
            padding: '10px 18px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer',
            borderRadius: '10px 10px 0 0', transition: 'all 0.2s',
            background: activeTab === t.key ? '#3b82f6' : 'transparent',
            color: activeTab === t.key ? '#ffffff' : '#64748b',
            borderBottom: activeTab === t.key ? '2px solid #3b82f6' : '2px solid transparent',
            marginBottom: '-2px'
          }}>{t.label}</button>
        ))}
      </div>

      {/* ══════════════ OVERVIEW TAB ══════════════ */}
      {activeTab === 'overview' && (
        <>
          {/* Spend vs Budget + PO Status + Category Spend */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="chart-card">
              <h3 className="chart-title">Monthly Spend vs Budget</h3>
              <div style={{ height: '280px' }}>
                <ResponsiveContainer>
                  <ComposedChart data={spendTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: number) => [`$${(v / 1000).toFixed(0)}K`]} />
                    <Legend />
                    <Bar dataKey="spend"  name="Actual Spend" fill="#3b82f6" radius={[4,4,0,0]} />
                    <Line dataKey="budget" name="Budget"       stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <h3 className="chart-title">Purchase Order Status</h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} innerRadius={55} outerRadius={80} dataKey="value" stroke="none" paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={PO_COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '8px' }}>
                {[{ label: 'Received', val: '65%', color: '#10b981' }, { label: 'In-Transit', val: '25%', color: '#f59e0b' }, { label: 'Pending', val: '10%', color: '#ef4444' }].map(s => (
                  <div key={s.label} style={{ textAlign: 'center', padding: '8px', background: '#f8fafc', borderRadius: '8px' }}>
                    <p style={{ fontSize: '16px', fontWeight: 700, color: s.color, margin: 0 }}>{s.val}</p>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Spend by Category + Cycle Time + Risk + Radar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', gap: '20px' }}>
            <div className="chart-card">
              <h3 className="chart-title">Spend by Category</h3>
              <div style={{ height: '240px' }}>
                <ResponsiveContainer>
                  <BarChart data={spendByCategory} layout="vertical" barCategoryGap="25%">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                    <YAxis type="category" dataKey="category" width={100} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => [`$${(v / 1000).toFixed(0)}K`]} />
                    <Bar dataKey="spend" fill="#8b5cf6" radius={[0,4,4,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <h3 className="chart-title">Procurement Cycle Time</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                {cycleTimeSteps.map(s => {
                  const over = s.time > s.target;
                  return (
                    <div key={s.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
                        <span style={{ color: '#475569' }}>{s.label}</span>
                        <span style={{ fontWeight: 700, color: over ? '#ef4444' : '#10b981' }}>{s.time}d</span>
                      </div>
                      <div style={{ background: '#e2e8f0', borderRadius: '4px', height: '5px' }}>
                        <div style={{ width: `${Math.min((s.time / 10) * 100, 100)}%`, background: over ? '#ef4444' : '#10b981', height: '5px', borderRadius: '4px' }} />
                      </div>
                      <p style={{ fontSize: '10px', color: '#94a3b8', margin: '2px 0 0' }}>Target: {s.target}d</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="chart-card">
              <h3 className="chart-title">Supply Chain Risk</h3>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={riskData} innerRadius={40} outerRadius={58} dataKey="value" paddingAngle={5}>
                    <Cell fill="#ef4444" />
                    <Cell fill="#10b981" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <p style={{ fontSize: '12px', textAlign: 'center', color: '#64748b', marginTop: '4px' }}>
                <span style={{ color: '#ef4444', fontWeight: 700 }}>35%</span> single-sourced items
              </p>
              <div style={{ marginTop: '10px', padding: '8px 10px', background: '#fee2e2', borderRadius: '8px', fontSize: '11px', color: '#991b1b' }}>
                ⚠ 12 critical parts have no backup supplier. Action recommended.
              </div>
            </div>

            <div className="chart-card">
              <h3 className="chart-title">Procurement Health Score</h3>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Radar dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* ══════════════ SUPPLIER ANALYSIS TAB ══════════════ */}
      {activeTab === 'suppliers' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="chart-card">
              <h3 className="chart-title">Supplier Performance — Cost vs Lead Time</h3>
              <div style={{ height: '280px' }}>
                <ResponsiveContainer>
                  <ComposedChart data={supplierPerformance} margin={{ top: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="supplier" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" unit=" d" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left"  dataKey="cost"     name="Avg Unit Cost ($)" fill="#3b82f6" radius={[4,4,0,0]} />
                    <Line yAxisId="right" dataKey="leadTime" name="Lead Time (days)"  stroke="#ef4444" strokeWidth={2} dot />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <h3 className="chart-title">Supplier Scorecard</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f1f5f9', color: '#64748b' }}>
                    <th style={{ textAlign: 'left', padding: '8px 0', fontWeight: 600 }}>Supplier</th>
                    <th style={{ textAlign: 'right', fontWeight: 600 }}>Reliability</th>
                    <th style={{ textAlign: 'right', fontWeight: 600 }}>Defect %</th>
                    <th style={{ textAlign: 'right', fontWeight: 600 }}>Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {supplierPerformance.map(s => (
                    <tr key={s.supplier} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '10px 0', fontWeight: 600, color: '#334155' }}>{s.supplier}</td>
                      <td style={{ textAlign: 'right', color: s.reliability >= 95 ? '#10b981' : s.reliability >= 85 ? '#f59e0b' : '#ef4444', fontWeight: 700 }}>
                        {s.reliability}%
                      </td>
                      <td style={{ textAlign: 'right', color: s.defectRate > 2 ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                        {s.defectRate}%
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <RiskBadge risk={s.reliability >= 92 ? 'Low' : s.reliability >= 85 ? 'Medium' : 'High'} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="chart-card">
              <h3 className="chart-title">Spend Concentration by Supplier</h3>
              <div style={{ height: '240px' }}>
                <ResponsiveContainer>
                  <BarChart data={supplierPerformance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                    <YAxis type="category" dataKey="supplier" width={110} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => [`$${(v / 1000).toFixed(0)}K`]} />
                    <Bar dataKey="spend" name="Annual Spend" fill="#8b5cf6" radius={[0,4,4,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <h3 className="chart-title">Supplier Development Actions</h3>
              {[
                { supplier: 'Global Steel',    action: 'Initiate dual-source qualification for Steel Sheets', urgency: 'High'   },
                { supplier: 'PrecisionMach',   action: 'Review SLA terms — lead time SLA breached Q4',        urgency: 'Medium' },
                { supplier: 'TechParts Co.',   action: 'Contract renewal negotiation due Aug 2025',            urgency: 'Medium' },
                { supplier: 'Fast Electronics',action: 'Increase volume allocation — best reliability score',  urgency: 'Low'    },
              ].map((a, i) => (
                <div key={i} style={{
                  padding: '12px 14px', borderRadius: '10px', marginBottom: '10px',
                  background: a.urgency === 'High' ? '#fef2f2' : a.urgency === 'Medium' ? '#fffbeb' : '#f0fdf4',
                  border: `1px solid ${a.urgency === 'High' ? '#fecaca' : a.urgency === 'Medium' ? '#fde68a' : '#bbf7d0'}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>{a.supplier}</span>
                    <RiskBadge risk={a.urgency} />
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>{a.action}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ══════════════ PURCHASE ORDERS TAB ══════════════ */}
      {activeTab === 'orders' && (
        <div className="chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="chart-title" style={{ margin: 0 }}>Open Purchase Orders</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ fontSize: '12px', padding: '5px 12px', borderRadius: '8px', background: '#eff6ff', color: '#1d4ed8', fontWeight: 600 }}>Total: 38 POs</span>
              <span style={{ fontSize: '12px', padding: '5px 12px', borderRadius: '8px', background: '#fee2e2', color: '#dc2626', fontWeight: 600 }}>5 Delayed</span>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                {['PO ID', 'Supplier', 'Item', 'Qty', 'Value', 'ETA', 'Status', 'Risk'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', color: '#64748b', fontWeight: 700, fontSize: '12px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {openPOs.map(row => (
                <tr key={row.poId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: '#3b82f6' }}>{row.poId}</td>
                  <td style={{ color: '#334155' }}>{row.supplier}</td>
                  <td style={{ color: '#475569' }}>{row.item}</td>
                  <td style={{ color: '#64748b' }}>{row.qty.toLocaleString()}</td>
                  <td style={{ fontWeight: 600, color: '#334155' }}>{row.value}</td>
                  <td style={{ color: row.status === 'Delayed' ? '#dc2626' : '#64748b', fontWeight: row.status === 'Delayed' ? 700 : 400 }}>{row.eta}</td>
                  <td><StatusBadge status={row.status} /></td>
                  <td><RiskBadge risk={row.risk} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '24px' }}>
            {[
              { label: 'Avg PO Value',       val: '$24,760', color: '#3b82f6' },
              { label: 'On-Time Delivery %', val: '87%',      color: '#10b981' },
              { label: 'Delayed POs',         val: '5',        color: '#ef4444' },
              { label: 'Total PO Value',      val: '$940K',    color: '#8b5cf6' },
            ].map(m => (
              <div key={m.label} style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>{m.label}</p>
                <p style={{ fontSize: '24px', fontWeight: 700, color: m.color, margin: 0 }}>{m.val}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════ CONTRACTS & SAVINGS TAB ══════════════ */}
      {activeTab === 'contracts' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="chart-card">
              <h3 className="chart-title">Negotiated vs Realized Savings (Quarterly)</h3>
              <div style={{ height: '260px' }}>
                <ResponsiveContainer>
                  <BarChart data={savingsData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="quarter" />
                    <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: number) => [`$${(v / 1000).toFixed(0)}K`]} />
                    <Legend />
                    <Bar dataKey="negotiated" name="Negotiated Target" fill="#bfdbfe" radius={[4,4,0,0]} />
                    <Bar dataKey="realized"   name="Realized Savings"  fill="#3b82f6" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <h3 className="chart-title">Contract Status &amp; Compliance</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f1f5f9', color: '#64748b' }}>
                    <th style={{ textAlign: 'left', padding: '8px 0', fontWeight: 600 }}>Supplier</th>
                    <th style={{ textAlign: 'right', fontWeight: 600 }}>Expiry</th>
                    <th style={{ textAlign: 'right', fontWeight: 600 }}>Coverage</th>
                    <th style={{ textAlign: 'right', fontWeight: 600 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {contractData.map(c => (
                    <tr key={c.supplier} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '10px 0', fontWeight: 600, color: '#334155' }}>{c.supplier}</td>
                      <td style={{ textAlign: 'right', color: c.status === 'Expiring' ? '#dc2626' : '#64748b', fontWeight: c.status === 'Expiring' ? 700 : 400 }}>{c.expiry}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          <div style={{ width: '60px', background: '#e2e8f0', borderRadius: '4px', height: '5px' }}>
                            <div style={{ width: `${c.coverage}%`, background: c.coverage >= 85 ? '#10b981' : '#f59e0b', height: '5px', borderRadius: '4px' }} />
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: 600 }}>{c.coverage}%</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}><StatusBadge status={c.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginTop: '16px', padding: '12px 14px', background: '#fef3c7', borderRadius: '10px', border: '1px solid #fde68a' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#b45309', marginBottom: '4px' }}>📌 Action Required</p>
                <p style={{ fontSize: '12px', color: '#334155', margin: 0 }}>
                  2 contracts expiring within 60 days. Initiate renewal negotiations for Global Steel and PrecisionMach to avoid spot purchasing at premium rates.
                </p>
              </div>
            </div>
          </div>

          {/* Savings Summary Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {[
              { label: 'YTD Realized Savings', val: '$459K',  color: '#10b981', note: 'vs $400K target' },
              { label: 'Savings Realization %', val: '88.6%', color: '#3b82f6', note: 'of negotiated'    },
              { label: 'Contracts Expiring',    val: '2',     color: '#f59e0b', note: 'within 60 days'   },
              { label: 'Maverick Spend',        val: '4.2%',  color: '#ef4444', note: 'target: <2%'      },
            ].map(m => (
              <div key={m.label} style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
                <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{m.label}</p>
                <p style={{ fontSize: '28px', fontWeight: 700, color: m.color, margin: '0 0 4px' }}>{m.val}</p>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>{m.note}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProcurementPlanning;