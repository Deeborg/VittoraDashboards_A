import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DemandForecasting.css';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  CartesianGrid, BarChart, Bar, Cell, LineChart, Line, ComposedChart, Legend,
  PieChart, Pie, RadarChart, Radar, PolarGrid, PolarAngleAxis, ReferenceLine
} from 'recharts';

// ─── Static Data ─────────────────────────────────────────────────────────────

const machineHealth = [
  { machine: 'CNC-01', status: 'Optimal',  temp: 42, load: 88, uptime: '99.1%', nextPM: '12 days' },
  { machine: 'CNC-02', status: 'Warning',  temp: 85, load: 95, uptime: '91.4%', nextPM: '2 days'  },
  { machine: 'ROB-01', status: 'Offline',  temp: 0,  load: 0,  uptime: '0%',    nextPM: 'Overdue'  },
  { machine: 'ASM-03', status: 'Optimal',  temp: 55, load: 72, uptime: '97.8%', nextPM: '20 days' },
  { machine: 'WLD-02', status: 'Warning',  temp: 78, load: 89, uptime: '88.2%', nextPM: '4 days'  },
];

const capacityUtilization = [
  { week: 'W18', capacity: 5000, actual: 3950, forecast: 4200 },
  { week: 'W19', capacity: 5000, actual: 4300, forecast: 4500 },
  { week: 'W20', capacity: 5000, actual: 4700, forecast: 4800 },
  { week: 'W21', capacity: 5000, actual: 4100, forecast: 4300 },
  { week: 'W22', capacity: 5000, actual: 0,    forecast: 4600 },
  { week: 'W23', capacity: 5000, actual: 0,    forecast: 4900 },
];

const productionFlow = [
  { line: 'Line A', actual: 3950, downtime: 250, target: 4200 },
  { line: 'Line B', actual: 3800, downtime: 0,   target: 4000 },
  { line: 'Line C', actual: 4700, downtime: 300, target: 5000 },
  { line: 'Line D', actual: 2900, downtime: 300, target: 3500 },
];

const shiftData = [
  { name: 'Shift 1', value: 94, output: 1850, defects: 12 },
  { name: 'Shift 2', value: 88, output: 1720, defects: 21 },
  { name: 'Shift 3', value: 76, output: 1480, defects: 38 },
];
const SHIFT_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

const wipOrders = [
  { id: 'WO-992', prod: 'Engine Component', stage: 'Assembly', prog: 75,  priority: 'High',   due: 'Today'    },
  { id: 'WO-993', prod: 'Chassis Frame',    stage: 'Welding',  prog: 40,  priority: 'Medium', due: 'May 02'   },
  { id: 'WO-994', prod: 'Sensor Array',     stage: 'Testing',  prog: 95,  priority: 'High',   due: 'Today'    },
  { id: 'WO-995', prod: 'Brake Assembly',   stage: 'Machining',prog: 20,  priority: 'Low',    due: 'May 05'   },
  { id: 'WO-996', prod: 'Drive Shaft',      stage: 'QC Check', prog: 60,  priority: 'Medium', due: 'May 03'   },
];

const materialReadiness = [
  { name: 'Raw Material A',    pct: 82, status: 'OK'       },
  { name: 'Raw Material B',    pct: 47, status: 'Low'      },
  { name: 'Specialized Bolts', pct: 91, status: 'OK'       },
  { name: 'Steel Sheets',      pct: 23, status: 'Critical' },
  { name: 'Polymer Resin',     pct: 68, status: 'OK'       },
];

const qualityData = [
  { week: 'W16', defectRate: 2.1, rework: 1.2, scrap: 0.9 },
  { week: 'W17', defectRate: 1.8, rework: 1.0, scrap: 0.8 },
  { week: 'W18', defectRate: 2.4, rework: 1.5, scrap: 0.9 },
  { week: 'W19', defectRate: 1.6, rework: 0.9, scrap: 0.7 },
  { week: 'W20', defectRate: 1.9, rework: 1.1, scrap: 0.8 },
];

const bottleneckData = [
  { process: 'Machining', taktTime: 4.2, cycleTime: 5.1 },
  { process: 'Assembly',  taktTime: 4.2, cycleTime: 3.8 },
  { process: 'Welding',   taktTime: 4.2, cycleTime: 6.3 },
  { process: 'Testing',   taktTime: 4.2, cycleTime: 2.9 },
  { process: 'QC',        taktTime: 4.2, cycleTime: 4.0 },
];

const laborData = [
  { dept: 'Machining', allocated: 24, present: 22, efficiency: 88 },
  { dept: 'Assembly',  allocated: 18, present: 18, efficiency: 94 },
  { dept: 'Welding',   allocated: 12, present: 10, efficiency: 76 },
  { dept: 'Testing',   allocated: 8,  present: 8,  efficiency: 97 },
];

const productionSchedule = [
  { time: '06:00', lineA: 'WO-992', lineB: 'WO-993', lineC: 'WO-995', lineD: '-' },
  { time: '10:00', lineA: 'WO-996', lineB: 'WO-993', lineC: 'WO-994', lineD: 'WO-992' },
  { time: '14:00', lineA: 'WO-996', lineB: 'PM',     lineC: 'WO-994', lineD: 'WO-995' },
  { time: '18:00', lineA: '-',      lineB: '-',       lineC: 'WO-996', lineD: 'WO-995' },
];

const alerts = [
  { type: 'critical', msg: 'ROB-01 offline — Line B capacity reduced by 40%',    time: '08:14 AM' },
  { type: 'warning',  msg: 'Steel Sheets inventory below reorder point (23%)',     time: '09:02 AM' },
  { type: 'warning',  msg: 'CNC-02 running at 95% load — overheating risk',        time: '09:45 AM' },
  { type: 'info',     msg: 'WO-994 Sensor Array approaching completion (95%)',      time: '10:20 AM' },
];

const ALERT_COLORS: Record<string, string> = {
  critical: '#ef4444',
  warning:  '#f59e0b',
  info:     '#3b82f6',
};

const radarData = [
  { subject: 'OEE',       A: 92 },
  { subject: 'Quality',   A: 88 },
  { subject: 'Labor Eff', A: 84 },
  { subject: 'Schedule',  A: 79 },
  { subject: 'Material',  A: 71 },
  { subject: 'Capacity',  A: 86 },
];

// ─── Sub-Components ──────────────────────────────────────────────────────────

const KPICard = ({
  title, value, trend, sub, data, unit
}: {
  title: string; value: string; trend: string; sub?: string; data: number[]; unit?: string;
}) => {
  const positive = trend.startsWith('+');
  return (
    <div style={{
      background: '#ffffff',
      padding: '22px 24px',
      borderRadius: '16px',
      border: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '4px', height: '100%',
        background: positive ? '#10b981' : '#ef4444', borderRadius: '16px 0 0 16px'
      }} />
      <div style={{ paddingLeft: '8px' }}>
        <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.07em', color: '#64748b', marginBottom: '6px', fontWeight: 700 }}>{title}</p>
        <h3 style={{ fontSize: '26px', margin: '0 0 4px', color: '#0f172a', fontWeight: 700, lineHeight: 1 }}>{value}</h3>
        <span style={{ fontSize: '12px', color: positive ? '#10b981' : '#ef4444', fontWeight: 600 }}>{trend}</span>
        {sub && <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '8px' }}>{sub}</span>}
      </div>
      <div style={{ width: '80px', height: '40px' }}>
        <ResponsiveContainer>
          <LineChart data={data.map(v => ({ v }))}>
            <Line type="monotone" dataKey="v" stroke={positive ? '#10b981' : '#ef4444'} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const StatusDot = ({ status }: { status: string }) => {
  const color = status === 'Optimal' ? '#10b981' : status === 'Warning' ? '#f59e0b' : '#ef4444';
  return (
    <span style={{
      display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%',
      background: color, marginRight: '8px', boxShadow: `0 0 6px ${color}88`
    }} />
  );
};

const PriorityBadge = ({ priority }: { priority: string }) => {
  const map: Record<string, { bg: string; color: string }> = {
    High:   { bg: '#fee2e2', color: '#dc2626' },
    Medium: { bg: '#fef3c7', color: '#b45309' },
    Low:    { bg: '#dcfce7', color: '#15803d' },
  };
  const s = map[priority] || map['Low'];
  return (
    <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px', background: s.bg, color: s.color }}>
      {priority}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ProductionPlanning: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'quality' | 'labor'>('overview');

  const kpiData = [
    { title: 'Projected Revenue',   value: '$4.2M', trend: '+8.4%', sub: 'vs last week', data: [10,20,15,25,30,40] },
    { title: 'OEE Efficiency',      value: '92.4%', trend: '+2.1%', sub: 'target: 95%',  data: [80,85,82,90,92,92] },
    { title: 'Planned Downtime',    value: '12 hrs',trend: '-1.5%', sub: 'this week',     data: [50,40,30,25,20,12] },
    { title: 'Active Work Orders',  value: '482',   trend: '+5.0%', sub: '18 overdue',    data: [300,350,400,420,450,482] },
    { title: 'On-Time Delivery',    value: '87.3%', trend: '-1.2%', sub: 'target: 95%',  data: [92,90,88,89,87,87] },
    { title: 'Defect Rate',         value: '1.9%',  trend: '+0.3%', sub: 'last 5 weeks',  data: [2.1,1.8,2.4,1.6,1.9,1.9] },
  ];

  const tabs = [
    { key: 'overview',  label: '📊 Overview'          },
    { key: 'schedule',  label: '📅 Schedule'           },
    { key: 'quality',   label: '🔬 Quality & Defects'  },
    { key: 'labor',     label: '👷 Labor Allocation'   },
  ];

  return (
    <div className="demand-dashboard-container">
      {/* ── Header ── */}
      <div className="df-header">
        <button className="df-back-btn" onClick={() => navigate('/modules', {state: { scrollToModule: 'scm' }})}>← Back to SCM</button>
        <h1>Production Planning &amp; Capacity</h1>
        <div className="status-badge" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>● CAPACITY CONSTRAINED</div>
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
      <div style={{ display: 'flex', gap: '8px', margin: '24px 0 16px', borderBottom: '2px solid #e2e8f0', paddingBottom: '0' }}>
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
          {/* Capacity Utilization + Bottleneck */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="chart-card">
              <h3 className="chart-title">Capacity Utilization — Actual vs Forecast vs Max</h3>
              <div style={{ height: '280px' }}>
                <ResponsiveContainer>
                  <ComposedChart data={capacityUtilization}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="week" />
                    <YAxis domain={[0, 6000]} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="capacity" fill="#e0f2fe" stroke="#93c5fd" name="Max Capacity" strokeDasharray="5 5" />
                    <Bar dataKey="actual" fill="#3b82f6" name="Actual Output" radius={[4,4,0,0]} />
                    <Line type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={2} dot name="Forecast" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <h3 className="chart-title">Process Bottleneck — Takt vs Cycle Time</h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '10px' }}>Bars above takt time (orange) are bottlenecks</p>
              <div style={{ height: '240px' }}>
                <ResponsiveContainer>
                  <BarChart data={bottleneckData} layout="vertical" barCategoryGap="25%">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 8]} unit=" min" />
                    <YAxis type="category" dataKey="process" width={70} />
                    <Tooltip />
                    <ReferenceLine x={4.2} stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" label={{ value: 'Takt', fill: '#f59e0b', fontSize: 11 }} />
                    <Bar dataKey="cycleTime" name="Cycle Time" radius={[0,4,4,0]}>
                      {bottleneckData.map((entry, i) => (
                        <Cell key={i} fill={entry.cycleTime > entry.taktTime ? '#ef4444' : '#10b981'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Production Output + WIP */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="chart-card">
              <h3 className="chart-title">Production Output vs Downtime Loss vs Target</h3>
              <div style={{ height: '280px' }}>
                <ResponsiveContainer>
                  <ComposedChart data={productionFlow}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="line" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="actual"   name="Actual Units"  fill="#3b82f6" stackId="a" radius={[4,4,0,0]} />
                    <Bar dataKey="downtime" name="Downtime Loss" fill="#ef444488" stackId="a" />
                    <Line dataKey="target"  name="Target"        stroke="#f59e0b" strokeWidth={2} dot strokeDasharray="4 4" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* WIP Table */}
            <div className="chart-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 className="chart-title" style={{ margin: 0 }}>Active Work-in-Progress (WIP)</h3>
                <span style={{ fontSize: '12px', color: '#3b82f6', fontWeight: 600, cursor: 'pointer' }}>View All →</span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ color: '#64748b', textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>
                    <th style={{ padding: '8px 0', fontWeight: 600 }}>WO ID</th>
                    <th style={{ fontWeight: 600 }}>Product</th>
                    <th style={{ fontWeight: 600 }}>Stage</th>
                    <th style={{ fontWeight: 600 }}>Priority</th>
                    <th style={{ fontWeight: 600 }}>Due</th>
                    <th style={{ fontWeight: 600 }}>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {wipOrders.map(row => (
                    <tr key={row.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '10px 0', fontWeight: 700, color: '#3b82f6' }}>{row.id}</td>
                      <td style={{ color: '#334155' }}>{row.prod}</td>
                      <td style={{ color: '#64748b' }}>{row.stage}</td>
                      <td><PriorityBadge priority={row.priority} /></td>
                      <td style={{ color: row.due === 'Today' ? '#dc2626' : '#64748b', fontWeight: row.due === 'Today' ? 700 : 400, fontSize: '12px' }}>{row.due}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ flex: 1, background: '#e2e8f0', borderRadius: '4px', height: '6px' }}>
                            <div style={{ width: `${row.prog}%`, height: '6px', borderRadius: '4px', background: row.prog >= 80 ? '#10b981' : row.prog >= 50 ? '#3b82f6' : '#f59e0b' }} />
                          </div>
                          <span style={{ fontSize: '11px', color: '#64748b', minWidth: '28px' }}>{row.prog}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Row: Machine Health + Shift Perf + Material + Radar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: '20px' }}>
            {/* Machine Health */}
            <div className="chart-card">
              <h3 className="chart-title">Machine Health &amp; Load</h3>
              <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ color: '#94a3b8', borderBottom: '1px solid #f1f5f9' }}>
                    <th style={{ textAlign: 'left', padding: '6px 0', fontWeight: 600 }}>Machine</th>
                    <th style={{ textAlign: 'right', fontWeight: 600 }}>Load</th>
                    <th style={{ textAlign: 'right', fontWeight: 600 }}>Uptime</th>
                    <th style={{ textAlign: 'right', fontWeight: 600 }}>Next PM</th>
                  </tr>
                </thead>
                <tbody>
                  {machineHealth.map(m => (
                    <tr key={m.machine} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '10px 0' }}>
                        <StatusDot status={m.status} />
                        <span style={{ fontWeight: 600 }}>{m.machine}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 700, color: m.load > 90 ? '#ef4444' : '#334155' }}>{m.load}%</span>
                      </td>
                      <td style={{ textAlign: 'right', color: '#64748b' }}>{m.uptime}</td>
                      <td style={{ textAlign: 'right', fontSize: '11px', color: m.nextPM === 'Overdue' ? '#ef4444' : '#64748b', fontWeight: m.nextPM === 'Overdue' ? 700 : 400 }}>
                        {m.nextPM}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Shift Performance */}
            <div className="chart-card">
              <h3 className="chart-title">Shift Performance</h3>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={shiftData} innerRadius={40} outerRadius={60} dataKey="value" paddingAngle={3}>
                    {shiftData.map((_, i) => <Cell key={i} fill={SHIFT_COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ marginTop: '8px' }}>
                {shiftData.map((s, i) => (
                  <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: SHIFT_COLORS[i], fontWeight: 600 }}>● {s.name}</span>
                    <span style={{ color: '#334155' }}>{s.output} units</span>
                    <span style={{ color: '#94a3b8' }}>{s.defects} defects</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Material Readiness */}
            <div className="chart-card">
              <h3 className="chart-title">Material Readiness</h3>
              {materialReadiness.map(m => {
                const color = m.pct < 30 ? '#ef4444' : m.pct < 60 ? '#f59e0b' : '#10b981';
                return (
                  <div key={m.name} style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ color: '#334155' }}>{m.name}</span>
                      <span style={{ fontWeight: 700, color }}>{m.pct}%</span>
                    </div>
                    <div style={{ background: '#e2e8f0', borderRadius: '4px', height: '6px' }}>
                      <div style={{ width: `${m.pct}%`, background: color, height: '6px', borderRadius: '4px', transition: 'width 0.5s' }} />
                    </div>
                    {m.status !== 'OK' && (
                      <span style={{ fontSize: '10px', color, fontWeight: 700 }}>⚠ {m.status} — Trigger reorder</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Overall Health Radar */}
            <div className="chart-card">
              <h3 className="chart-title">Production Health Score</h3>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Radar dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* ══════════════ SCHEDULE TAB ══════════════ */}
      {activeTab === 'schedule' && (
        <div className="chart-card">
          <h3 className="chart-title">Production Schedule — Today's Gantt View</h3>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>
            Drag-and-drop scheduling would be enabled in live mode. Current view is read-only.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '600px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 700, width: '80px' }}>Time</th>
                  {['Line A', 'Line B', 'Line C', 'Line D'].map(l => (
                    <th key={l} style={{ padding: '12px 16px', textAlign: 'center', color: '#334155', fontWeight: 700 }}>{l}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {productionSchedule.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#64748b' }}>{row.time}</td>
                    {[row.lineA, row.lineB, row.lineC, row.lineD].map((cell, j) => (
                      <td key={j} style={{ padding: '10px 16px', textAlign: 'center' }}>
                        {cell !== '-' ? (
                          <span style={{
                            display: 'inline-block', padding: '5px 14px', borderRadius: '99px', fontSize: '12px', fontWeight: 700,
                            background: cell === 'PM' ? '#fef3c7' : '#eff6ff',
                            color: cell === 'PM' ? '#b45309' : '#1d4ed8',
                            border: `1px solid ${cell === 'PM' ? '#fde68a' : '#bfdbfe'}`
                          }}>{cell}</span>
                        ) : (
                          <span style={{ color: '#cbd5e1', fontSize: '18px' }}>—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '16px', border: '1px solid #bfdbfe' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#1d4ed8', marginBottom: '6px' }}>SCHEDULE ADHERENCE</p>
              <p style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', margin: 0 }}>84%</p>
              <p style={{ fontSize: '12px', color: '#64748b' }}>3 orders delayed today</p>
            </div>
            <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '16px', border: '1px solid #bbf7d0' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#15803d', marginBottom: '6px' }}>ON-SCHEDULE ORDERS</p>
              <p style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', margin: 0 }}>16 / 19</p>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Across all production lines</p>
            </div>
            <div style={{ background: '#fef9c3', borderRadius: '12px', padding: '16px', border: '1px solid #fde68a' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#b45309', marginBottom: '6px' }}>PLANNED MAINTENANCE</p>
              <p style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', margin: 0 }}>2 events</p>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Line B PM @ 14:00 today</p>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ QUALITY TAB ══════════════ */}
      {activeTab === 'quality' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
          <div className="chart-card">
            <h3 className="chart-title">Defect Rate Trend — Rework vs Scrap (5-week)</h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer>
                <AreaChart data={qualityData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="week" />
                  <YAxis unit="%" />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="defectRate" name="Total Defect Rate" stroke="#ef4444" fill="#fef2f2" strokeWidth={2} />
                  <Area type="monotone" dataKey="rework"     name="Rework"            stroke="#f59e0b" fill="#fffbeb"  strokeWidth={2} />
                  <Area type="monotone" dataKey="scrap"      name="Scrap"             stroke="#8b5cf6" fill="#f5f3ff"  strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card">
            <h3 className="chart-title">Quality KPIs</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
              {[
                { label: 'First Pass Yield',      value: '94.2%', color: '#10b981', target: '96%' },
                { label: 'Rework Rate',            value: '1.1%',  color: '#f59e0b', target: '<1%' },
                { label: 'Scrap Rate',             value: '0.8%',  color: '#8b5cf6', target: '<0.5%' },
                { label: 'Customer Returns (MTD)', value: '3',     color: '#ef4444', target: '0'   },
                { label: 'Inspection Pass Rate',   value: '98.7%', color: '#3b82f6', target: '99%' },
              ].map(q => (
                <div key={q.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '10px' }}>
                  <span style={{ fontSize: '13px', color: '#334155' }}>{q.label}</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: q.color }}>{q.value}</span>
                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>Target: {q.target}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ LABOR TAB ══════════════ */}
      {activeTab === 'labor' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="chart-card">
            <h3 className="chart-title">Labor Allocation by Department</h3>
            <div style={{ height: '280px' }}>
              <ResponsiveContainer>
                <BarChart data={laborData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="dept" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="allocated" name="Allocated"  fill="#bfdbfe" radius={[4,4,0,0]} />
                  <Bar dataKey="present"   name="Present"    fill="#3b82f6" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card">
            <h3 className="chart-title">Labor Efficiency &amp; Attendance</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f1f5f9', color: '#64748b' }}>
                  <th style={{ textAlign: 'left', padding: '8px 0', fontWeight: 600 }}>Dept</th>
                  <th style={{ textAlign: 'right', fontWeight: 600 }}>Allocated</th>
                  <th style={{ textAlign: 'right', fontWeight: 600 }}>Present</th>
                  <th style={{ textAlign: 'right', fontWeight: 600 }}>Efficiency</th>
                </tr>
              </thead>
              <tbody>
                {laborData.map(l => (
                  <tr key={l.dept} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '12px 0', fontWeight: 600 }}>{l.dept}</td>
                    <td style={{ textAlign: 'right', color: '#64748b' }}>{l.allocated}</td>
                    <td style={{ textAlign: 'right', color: l.present < l.allocated ? '#ef4444' : '#10b981', fontWeight: 700 }}>{l.present}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span style={{
                        display: 'inline-block', padding: '2px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 700,
                        background: l.efficiency >= 90 ? '#dcfce7' : l.efficiency >= 80 ? '#fef3c7' : '#fee2e2',
                        color:      l.efficiency >= 90 ? '#15803d' : l.efficiency >= 80 ? '#b45309' : '#dc2626',
                      }}>{l.efficiency}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: '20px', padding: '14px', background: '#eff6ff', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#1d4ed8', marginBottom: '4px' }}>📌 Action Required</p>
              <p style={{ fontSize: '12px', color: '#334155', margin: 0 }}>
                ROB-01 offline reduces Welding headcount need — redeploy 2 workers to Assembly to recover WO-992 schedule.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionPlanning;