import { useState, useEffect, useRef, type RefObject } from "react";
import { useNavigate } from 'react-router-dom';

/* ─── GOOGLE FONTS ─────────────────────────────────────────────────────────── */
if (typeof document !== "undefined") {
  const lnk = document.createElement("link");
  lnk.rel = "stylesheet";
  lnk.href =
    "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&family=Sora:wght@500;600;700&display=swap";
  document.head.appendChild(lnk);
}

/* ─── CSS ──────────────────────────────────────────────────────────────────── */
const CSS = `
:root{
  --bg:#F2F5FC;
  --surf:#fff;
  --surf2:#EEF2FA;
  --bd:rgba(24,36,100,.09);
  --bd2:rgba(24,36,100,.17);
  --txt:#13172A;
  --txt2:#464D72;
  --muted:#8A91B2;
  --indigo:#6366F1;
  --teal:#09BEAA;
  --amber:#F59E0B;
  --red:#EF4444;
  --blue:#2554F4;
  --r:12px;
  --r-sm:8px;
  --sh:0 2px 14px rgba(18,28,80,.07);
  --fh:'Sora',sans-serif;
  --fb:'DM Sans',sans-serif;
}
*{box-sizing:border-box;margin:0;padding:0}
.ds{font-family:var(--fb);background:var(--bg);min-height:100vh;color:var(--txt);padding-bottom:60px}

/* ── HEADER ── */
.ds-hdr{background:var(--surf);border-bottom:1px solid var(--bd);padding:0 28px;height:58px;display:flex;align-items:center;gap:16px;position:sticky;top:0;z-index:200}
.ds-back{display:flex;align-items:center;gap:7px;font-size:13px;font-weight:500;color:var(--txt2);background:var(--surf2);border:1px solid var(--bd2);border-radius:var(--r-sm);padding:6px 14px;cursor:pointer;transition:background .15s}
.ds-back:hover{background:#e4e9f7}
.ds-back svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.ds-mark{width:30px;height:30px;background:var(--indigo);border-radius:7px;display:flex;align-items:center;justify-content:center;color:#fff;font-family:var(--fh);font-weight:700;font-size:13px}
.ds-bc{font-size:13px;display:flex;align-items:center;gap:6px}
.ds-bc span{color:var(--muted)}
.ds-bc strong{color:var(--txt);font-weight:500}

.ds-dot-live{display:flex;align-items:center;gap:5px;background:#EEF2FF;color:var(--indigo);font-size:11px;font-weight:700;padding:4px 11px;border-radius:20px;letter-spacing:.4px;margin-left:auto}
.ds-dot-live i{width:7px;height:7px;border-radius:50%;background:var(--indigo);animation:plive 2s infinite}
@keyframes plive{0%,100%{opacity:1}50%{opacity:.35}}

/* ── PAGE ── */
.ds-page{padding:24px 28px;max-width:1380px;margin:0 auto;display:flex;flex-direction:column;gap:22px}

/* ── SECTION LABEL ── */
.ds-slabel{font-family:var(--fh);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:var(--muted);margin-bottom:14px;display:flex;align-items:center;gap:10px}
.ds-slabel::after{content:'';flex:1;height:1px;background:var(--bd)}

/* ── CARD ── */
.card{background:var(--surf);border:1px solid var(--bd);border-radius:var(--r);padding:20px 22px;box-shadow:var(--sh)}

/* ── KPI ── */
.kpi-row{display:grid;grid-template-columns:repeat(5,1fr);gap:14px}
.kpi{background:var(--surf);border:1px solid var(--bd);border-radius:var(--r);padding:18px 20px;border-top:3px solid var(--indigo)}
.kpi-lbl{font-size:10px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.9px;margin-bottom:9px}
.kpi-val{font-family:var(--fh);font-size:23px;font-weight:700;line-height:1.1;margin-bottom:5px}
.kpi-delta{font-size:11px;font-weight:500;display:flex;align-items:center;gap:3px}
.kpi-delta.up{color:#059669}
.kpi-delta.dn{color:var(--red)}

/* ── AI BOX ── */
.ai-box{background:linear-gradient(110deg,#F5F7FF 0%,#F0FDFA 100%);border:1px solid rgba(99,102,241,.13);border-radius:var(--r);padding:16px 20px;display:flex;gap:14px;align-items:flex-start}
.ai-ico{width:34px;height:34px;background:var(--indigo);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
.ai-tag{font-size:9px;font-weight:800;color:var(--indigo);text-transform:uppercase;letter-spacing:1.2px;margin-bottom:4px}
.ai-txt{font-size:13px;color:var(--txt2);line-height:1.65}
.ai-txt strong{color:var(--txt)}

/* ── TABLE ── */
.tbl-wrap{overflow-x:auto}
.tbl{width:100%;border-collapse:collapse;font-size:13px}
.tbl th{text-align:left;font-weight:600;color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.7px;padding:9px 11px;border-bottom:1px solid var(--bd)}
.tbl td{padding:12px 11px;border-bottom:1px solid var(--bd);vertical-align:middle}
.tbl tr:hover td{background:var(--surf2)}

/* ── MATRIX ── */
.matrix-grid{display:grid;grid-template-columns:80px repeat(6,1fr);gap:8px}
.matrix-cell{background:var(--surf2);border-radius:6px;padding:12px 8px;text-align:center;font-family:var(--fb);font-weight:600;font-size:12px}
.matrix-head{font-size:10px;font-weight:700;color:var(--muted);text-align:center;text-transform:uppercase;padding:8px 0}
.matrix-row-lbl{font-size:12px;font-weight:600;color:var(--txt2);display:flex;align-items:center}

/* ── SIMULATOR ── */
.sim-box{background:var(--surf2);padding:20px;border-radius:var(--r);border:1px solid var(--bd)}
.sim-row{display:flex;justify-content:space-between;margin-bottom:12px;font-size:13px}
.sim-row strong{font-family:var(--fh);font-size:16px;color:var(--indigo)}
input[type=range]{width:100%;margin-top:8px;accent-color:var(--indigo)}

/* ── UTILS ── */
.g2{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.g31{display:grid;grid-template-columns:2fr 1.1fr;gap:18px}
.tag{font-size:11px;font-weight:600;padding:3px 8px;border-radius:12px}
.tag-leak{background:#FEF2F2;color:var(--red)}
.tag-strat{background:#F0FDF4;color:#166534}

.bar-bg{height:6px;background:var(--surf2);border-radius:3px;overflow:hidden;margin-top:8px}
.bar-fill{height:100%;background:var(--indigo);transition:width .6s ease}

@media(max-width:900px){ .kpi-row{grid-template-columns:repeat(2,1fr)} .g2,.g31{grid-template-columns:1fr} }
`;

/* ─── DATA ──────────────────────────────────────────────────────────────────── */
const KPI = [
  { lbl: "Discount Utilization", val: "64.2%", delta: "-2.1%", dir: "dn", sub: "budget used" },
  { lbl: "Avg. Concession", val: "0.78%", delta: "-12bps", dir: "dn", sub: "strategic avg" },
  { lbl: "Est. Margin Leakage", val: "₹84.5 L", delta: "+8.4%", dir: "up", sub: "unapproved avg" },
  { lbl: "Win Rate w/ Disc.", val: "72.4%", delta: "+4.1%", dir: "up", sub: "conversion lift" },
  { lbl: "Break-even Efficacy", val: "1.42x", delta: "+0.2x", dir: "up", sub: "vol vs margin" },
];

const DISCOUNTS = [
  { id: "ORD-9910", rm: "Arjun Mehta", client: "Reliance Digital", segment: "Retail Chain", discount: "12%", impact: "₹18.5L", status: "High Leakage" },
  { id: "ORD-8821", rm: "Saira Khan", client: "Croma Stores", segment: "Corporate", discount: "5%", impact: "₹4.2L", status: "Strategic" },
  { id: "ORD-7732", rm: "Vikram Raj", client: "Flipkart Seller Hub", segment: "E-commerce", discount: "8%", impact: "₹12.1L", status: "Strategic" },
  { id: "ORD-6643", rm: "Anjali Singh", client: "Amazon Bulk Orders", segment: "E-commerce", discount: "18%", impact: "₹45.0L", status: "High Leakage" },
];

const MATRIX_SEGMENTS = ["HNI", "Corporate", "SME", "Retail", "NRI"];
const MATRIX_PRODUCTS = [
  "Laptops",
  "Smartphones",
  "Accessories",
  "Smart Devices",
  "Software Licenses",
  "Support Plans"
];
const MATRIX_VALS = [
  [0.80, 1.25, 0.40, 0.60, 0.50, 0.90],
  [0.95, 2.00, 0.35, 0.50, 0.45, 1.50],
  [0.70, 1.10, 0.30, 0.40, 0.35, 0.80],
  [0.45, 0.90, 0.20, 0.30, 0.25, 0.50],
  [0.60, 1.00, 0.25, 0.35, 0.30, 0.70],
];

/* ─── HELPERS ───────────────────────────────────────────────────────────────── */
function useChart(ref: RefObject<HTMLCanvasElement>, getConfig: () => any, scriptLoaded: boolean, deps: any[] = []) {
  useEffect(() => {
    if (!scriptLoaded || !ref.current) return;
    let chartInstance: any = null;
    const init = () => {
      if ((window as any).Chart) {
        chartInstance = new (window as any).Chart(ref.current!.getContext("2d"), getConfig());
      }
    };
    init();
    return () => { if (chartInstance) chartInstance.destroy(); };
  }, [scriptLoaded, ...deps]);
}

/* ─── SECTIONS ──────────────────────────────────────────────────────────────── */

function KPIStrip() {
  return (
    <div className="kpi-row">
      {KPI.map(k => (
        <div key={k.lbl} className="kpi">
          <div className="kpi-lbl">{k.lbl}</div>
          <div className="kpi-val">{k.val}</div>
          <div className={`kpi-delta ${k.dir}`}>{k.dir === "up" ? "▲" : "▼"} {k.delta}</div>
        </div>
      ))}
    </div>
  );
}

function AIIntelligence() {
  return (
    <div className="ai-box">
      <div className="ai-ico">🤖</div>
      <div>
        <div className="ai-tag">Discount Intelligence Insight</div>
        <div className="ai-txt">
          <strong>Margin Leakage Alert:</strong> Retail and Online channels are showing a 14% increase in unapproved discounts on <strong>Smartphones</strong> and <strong>Smart TVs</strong>. Analysis indicates that discounts above 10% are not improving conversion rates. Recommendation: Standardize discount ceilings at <strong>9% for Smartphones</strong> and <strong>12% for TVs</strong> to recover approx ₹42L in annual margin without impacting sales volume.
        </div>
      </div>
    </div>
  );
}

function EfficacyChart({ scriptLoaded }: { scriptLoaded: boolean }) {
  const chartRef = useRef<HTMLCanvasElement>(null);

  useChart(chartRef, () => ({
    type: 'bar',
    data: {
      labels: ['Premium Buyers', 'Corporate Bulk', 'SME Resellers', 'Retail Customers', 'Online Buyers'],
      datasets: [
        {
          label: 'Avg Discount %',
          data: [5, 12, 10, 4, 6],
          backgroundColor: '#6366F1',
          borderRadius: 6,
        },
        {
          label: 'Conversion Rate %',
          data: [78, 62, 85, 48, 70],
          type: 'line',
          borderColor: '#09BEAA',
          backgroundColor: '#09BEAA',
          tension: 0.4,
          yAxisID: 'y1',
          pointRadius: 4,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { font: { size: 11 } }
        },
        tooltip: {
          callbacks: {
            label: function (context: any) {
              return context.dataset.label + ': ' + context.raw + '%';
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false }
        },
        y: {
          grid: { color: '#f0f0f0' },
          title: {
            display: true,
            text: 'Discount (%)',
            font: { size: 11 }
          }
        },
        y1: {
          position: 'right',
          grid: { display: false },
          title: {
            display: true,
            text: 'Conversion Rate (%)',
            font: { size: 11 }
          }
        }
      }
    }
  }), scriptLoaded);

  return (
    <div className="card" style={{ height: '350px' }}>
      <div className="ds-slabel">Discount Effectiveness by Customer Segment</div>
      <div style={{ position: 'relative', height: '280px' }}>
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
}

function DiscountSimulator() {
  const [val, setVal] = useState(0.75);
  const breakeven = (val / (5.0 - val) * 100).toFixed(1);

  return (
    <div className="card">
      <div className="ds-slabel">Concession Impact Simulator</div>
      <div className="sim-box">
        <div className="sim-row">
          <span>Proposed Discount Rate</span>
          <strong>{val}%</strong>
        </div>
        <input type="range" min="0.1" max="2.0" step="0.05" value={val} onChange={e => setVal(parseFloat(e.target.value))} />
        
        <div className="sim-row" style={{ marginTop: '24px', borderTop: '1px solid #ddd', paddingTop: '16px' }}>
          <span>Volume Increase Required to Break-even</span>
          <span style={{ fontWeight: 800, color: 'var(--indigo)', fontSize: '20px' }}>+{breakeven}%</span>
        </div>
        <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '8px' }}>
          *Assumes a base product margin of 5.0%. Higher discounts require exponential volume growth to maintain Net Interest Margin (NIM).
        </p>
      </div>
    </div>
  );
}

function DiscountMatrix() {
  return (
    <div className="card">
      <div className="ds-slabel">Standard Discount Policy Matrix (Ceilings)</div>
      <div className="matrix-grid">
        <div className="matrix-head"></div>
        {MATRIX_PRODUCTS.map(p => <div key={p} className="matrix-head">{p}</div>)}
        {MATRIX_SEGMENTS.map((seg, i) => (
          <>
            <div key={seg} className="matrix-row-lbl">{seg}</div>
            {MATRIX_VALS[i].map((v, j) => (
              <div key={j} className="matrix-cell" style={{ 
                color: v > 1.2 ? 'var(--red)' : v > 0.8 ? 'var(--amber)' : '#059669',
                background: v > 1.2 ? '#FEF2F2' : v > 0.8 ? '#FFFBEB' : '#F0FDF4'
              }}>
                {v}%
              </div>
            ))}
          </>
        ))}
      </div>
    </div>
  );
}

function RecentConcessions() {
  return (
    <div className="card">
      <div className="ds-slabel">Recent High-Concession Approvals</div>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>ID</th><th>Client</th><th>RM</th><th>Segment</th><th>Discount</th><th>Impact</th><th>Type</th>
            </tr>
          </thead>
          <tbody>
            {DISCOUNTS.map(d => (
              <tr key={d.id}>
                <td style={{ fontFamily: 'monospace', color: 'var(--muted)' }}>{d.id}</td>
                <td><strong>{d.client}</strong></td>
                <td>{d.rm}</td>
                <td>{d.segment}</td>
                <td style={{ color: 'var(--red)', fontWeight: 700 }}>{d.discount}</td>
                <td style={{ fontWeight: 600 }}>{d.impact}</td>
                <td>
                  <span className={`tag ${d.status === 'Strategic' ? 'tag-strat' : 'tag-leak'}`}>
                    {d.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── ROOT ───────────────────────────────────────────────────────────────────── */
export default function DiscountStrategyDashboard() {
  const navigate = useNavigate();
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if ((window as any).Chart) { setScriptLoaded(true); return; }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <div className="ds">
        {/* Header */}
        <header className="ds-hdr">
          <button className="ds-back" onClick={() => navigate(-1)}>
            <svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg> Back
          </button>
          <div className="ds-mark">CPX</div>
          <div className="ds-bc">
            <span>Commercial Pricing</span>
            <span style={{ color: "var(--muted)" }}>›</span>
            <strong>Discount Strategy</strong>
          </div>
          <div className="ds-dot-live"><i></i>POLICY LIVE</div>
        </header>

        <div className="ds-page">
          {/* 1. KPIs */}
          <div className="ds-slabel">Key Performance Indicators</div>
          <KPIStrip />

          {/* 2. AI Intelligence */}
          <AIIntelligence />

          {/* 3. Charts & Simulator */}
          <div className="g31">
            <EfficacyChart scriptLoaded={scriptLoaded} />
            <DiscountSimulator />
          </div>

          {/* 4. Policy Matrix */}
          <div className="ds-slabel">Discount Policy Management</div>
          <DiscountMatrix />

          {/* 5. Recent Activity */}
          <RecentConcessions />

          {/* Analysis Rows */}
          <div className="g2">
            <div className="card">
               <div className="ds-slabel">Governance & Leakage Control</div>
               {[
                 { lbl: "Approval SLA Compliance", pct: 88 },
                 { lbl: "Policy Exception Frequency", pct: 14 },
                 { lbl: "Revenue Leakage Recovery", pct: 62 },
               ].map(r => (
                 <div key={r.lbl} style={{ marginBottom: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span>{r.lbl}</span>
                      <span style={{ fontWeight: 700 }}>{r.pct}%</span>
                    </div>
                    <div className="bar-bg">
                      <div className="bar-fill" style={{ width: `${r.pct}%` }}></div>
                    </div>
                 </div>
               ))}
            </div>
            <div className="card">
  <div className="ds-slabel">Efficacy Insights</div>
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
    
    <div style={{ padding: '12px', background: '#F0FDF4', borderRadius: '8px', fontSize: '13px', color: '#166534' }}>
      <strong>Top Efficacy:</strong> SME Buyers. ~1.2% discount on mid-range electronics (e.g., accessories, add-ons) drives highest conversion (82%). These customers are price-sensitive but respond well to small incentives.
    </div>

    <div style={{ padding: '12px', background: '#FEF2F2', borderRadius: '8px', fontSize: '13px', color: '#991B1B' }}>
      <strong>Low Efficacy:</strong> Retail Consumers. Discounts show minimal improvement in purchase decisions. Brand value and product features matter more than price — reduce discount levels and protect margin.
    </div>

    <div style={{ padding: '12px', background: '#EEF2FF', borderRadius: '8px', fontSize: '13px', color: '#3730A3' }}>
      <strong>Opportunity:</strong> Corporate Bulk Buyers. Slight discounts (~1.5%) combined with bundle offers (devices + warranty/support) significantly improve deal closure and long-term revenue.
    </div>

  </div>
</div>
          </div>

        </div>
      </div>
    </>
  );
}