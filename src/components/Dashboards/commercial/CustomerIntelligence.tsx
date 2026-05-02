import { useState, useEffect, useRef, type RefObject } from "react";
import { useNavigate } from 'react-router-dom';

/* ─── TYPESCRIPT DECLARATIONS ────────────────────────────────────────────── */
// This solves the "Property 'Chart' does not exist on window" error
declare global {
  interface Window {
    Chart: any;
  }
}

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
  --blue:#2554F4;
  --teal:#09BEAA;
  --amber:#F59E0B;
  --red:#EF4444;
  --purple:#7C3AED;
  --pink:#EC4899;
  --blue-lt:#EBF0FF;
  --teal-lt:#E6FAF8;
  --r:12px;
  --r-sm:8px;
  --sh:0 2px 14px rgba(18,28,80,.07);
  --sh-md:0 4px 28px rgba(18,28,80,.11);
  --fh:'Sora',sans-serif;
  --fb:'DM Sans',sans-serif;
}
*{box-sizing:border-box;margin:0;padding:0}
.ci{font-family:var(--fb);background:var(--bg);min-height:100vh;color:var(--txt);padding-bottom:60px}

/* ── HEADER ── */
.ci-hdr{background:var(--surf);border-bottom:1px solid var(--bd);padding:0 28px;height:58px;display:flex;align-items:center;gap:16px;position:sticky;top:0;z-index:200}
.ci-back{display:flex;align-items:center;gap:7px;font-size:13px;font-weight:500;color:var(--txt2);background:var(--surf2);border:1px solid var(--bd2);border-radius:var(--r-sm);padding:6px 14px;cursor:pointer;transition:background .15s;font-family:var(--fb)}
.ci-back:hover{background:#e4e9f7}
.ci-back svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.ci-mark{width:30px;height:30px;background:var(--blue);border-radius:7px;display:flex;align-items:center;justify-content:center;color:#fff;font-family:var(--fh);font-weight:700;font-size:13px}
.ci-bc{font-size:13px;display:flex;align-items:center;gap:6px}
.ci-bc span{color:var(--muted)}
.ci-bc strong{color:var(--txt);font-weight:500}
.ci-dot-live{display:flex;align-items:center;gap:5px;background:#ECFDF5;color:#065F46;font-size:11px;font-weight:700;padding:4px 11px;border-radius:20px;letter-spacing:.4px;margin-left:auto}
.ci-dot-live i{width:7px;height:7px;border-radius:50%;background:#10B981;animation:plive 2s infinite}
@keyframes plive{0%,100%{opacity:1}50%{opacity:.35}}

/* ── PAGE ── */
.ci-page{padding:24px 28px;max-width:1380px;margin:0 auto;display:flex;flex-direction:column;gap:22px}

/* ── SECTION LABEL ── */
.ci-slabel{font-family:var(--fh);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:var(--muted);margin-bottom:14px;display:flex;align-items:center;gap:10px}
.ci-slabel::after{content:'';flex:1;height:1px;background:var(--bd)}

/* ── CARD ── */
.ci-card{background:var(--surf);border:1px solid var(--bd);border-radius:var(--r);padding:20px 22px;box-shadow:var(--sh)}

/* ── KPI ROW ── */
.ci-kpi-row{display:grid;grid-template-columns:repeat(5,1fr);gap:14px}
.ci-kpi{background:var(--surf);border:1px solid var(--bd);border-radius:var(--r);padding:18px 20px;position:relative;overflow:hidden;transition:box-shadow .15s;cursor:default}
.ci-kpi:hover{box-shadow:var(--sh-md)}
.ci-kpi::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;border-radius:12px 12px 0 0}
.ci-kpi.c-blue::before{background:var(--blue)}
.ci-kpi.c-teal::before{background:var(--teal)}
.ci-kpi.c-amber::before{background:var(--amber)}
.ci-kpi.c-red::before{background:var(--red)}
.ci-kpi.c-purple::before{background:var(--purple)}
.ci-kpi-lbl{font-size:10px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.9px;margin-bottom:9px}
.ci-kpi-val{font-family:var(--fh);font-size:23px;font-weight:700;line-height:1.1;margin-bottom:5px}
.ci-kpi-delta{font-size:12px;font-weight:500;display:flex;align-items:center;gap:3px}
.ci-kpi-delta.up{color:#059669}
.ci-kpi-delta.dn{color:#DC2626}
.ci-kpi-sub{font-size:11px;color:var(--muted);margin-top:2px}

/* ── AI BOX ── */
.ci-ai{background:linear-gradient(110deg,#EBF0FF 0%,#E7FAF7 100%);border:1px solid rgba(37,84,244,.13);border-radius:var(--r);padding:16px 20px;display:flex;gap:14px;align-items:flex-start}
.ci-ai-ico{width:34px;height:34px;background:var(--blue);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
.ci-ai-tag{font-size:9px;font-weight:800;color:var(--blue);text-transform:uppercase;letter-spacing:1.2px;margin-bottom:4px}
.ci-ai-txt{font-size:13px;color:var(--txt2);line-height:1.65}
.ci-ai-txt strong{color:var(--txt)}

/* ── GRID HELPERS ── */
.g2{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:18px}
.g31{display:grid;grid-template-columns:2fr 1.1fr;gap:18px}
.g13{display:grid;grid-template-columns:1.1fr 2fr;gap:18px}

/* ── SECTION CARD TITLE ── */
.ct{font-family:var(--fh);font-size:14px;font-weight:600;color:var(--txt);display:flex;align-items:center;gap:8px;margin-bottom:16px}
.ct .ico{width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0}
.ct-right{margin-left:auto;font-family:var(--fb);font-size:12px;font-weight:400;color:var(--muted)}

/* ── LIFECYCLE ── */
.lifecycle{display:flex;gap:8px}
.lc-stage{flex:1;background:var(--surf2);border:1px solid var(--bd);border-radius:var(--r-sm);padding:14px 10px;text-align:center;position:relative;cursor:pointer;transition:all .15s}
.lc-stage:hover,.lc-stage.act{border-color:var(--blue);background:var(--blue-lt)}
.lc-name{font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.7px;margin-bottom:6px}
.lc-count{font-family:var(--fh);font-size:17px;font-weight:700}
.lc-pct{font-size:11px;color:var(--muted);margin-top:3px}
.lc-arr{position:absolute;right:-9px;top:50%;transform:translateY(-50%);width:18px;height:18px;background:var(--surf);border:1px solid var(--bd);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;color:var(--muted);z-index:1}

/* ── AFFINITY ── */
.aff-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.aff-item{background:var(--surf2);border:1px solid var(--bd);border-radius:var(--r-sm);padding:12px 14px}
.aff-lbl{font-size:12px;color:var(--txt2);margin-bottom:6px;font-weight:500}
.aff-pct{font-family:var(--fh);font-size:17px;font-weight:700;margin-bottom:6px}
.bar{height:6px;background:var(--surf2);border-radius:3px;overflow:hidden;width:100%;border:1px solid var(--bd)}
.bar-fill{height:100%;border-radius:3px;transition:width .6s ease}

/* ── INSIGHTS ── */
.ins-list{display:flex;flex-direction:column;gap:9px}
.ins-item{display:flex;align-items:flex-start;gap:11px;padding:11px 13px;background:var(--surf2);border-radius:var(--r-sm);border-left:3px solid transparent;font-size:13px;line-height:1.55;color:var(--txt2)}
.ins-item.opp{border-left-color:#09BEAA}
.ins-item.warn{border-left-color:#F59E0B}
.ins-item.alrt{border-left-color:#EF4444}
.ins-item.info{border-left-color:#2554F4}
.ins-ico{font-size:14px;flex-shrink:0;margin-top:1px}
.ins-t strong{color:var(--txt);display:block;margin-bottom:2px;font-weight:500}

/* ── SEARCH ── */
.srch-wrap{position:relative;margin-bottom:14px}
.srch{width:100%;font-family:var(--fb);font-size:13px;padding:9px 14px 9px 35px;border:1px solid var(--bd2);border-radius:var(--r-sm);background:var(--surf);color:var(--txt);outline:none;transition:border-color .15s}
.srch:focus{border-color:var(--blue)}
.srch-ico{position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:13px;color:var(--muted);pointer-events:none}
.pills{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:14px}
.pill{font-size:12px;font-weight:500;padding:5px 12px;border-radius:20px;border:1px solid var(--bd2);background:var(--surf2);color:var(--txt2);cursor:pointer;transition:all .15s;font-family:var(--fb)}
.pill.on{background:var(--blue);color:#fff;border-color:var(--blue)}

/* ── TABLE ── */
.tbl{width:100%;border-collapse:collapse;font-size:13px}
.tbl th{text-align:left;font-weight:600;color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.7px;padding:9px 11px;border-bottom:1px solid var(--bd)}
.tbl td{padding:10px 11px;border-bottom:1px solid var(--bd);vertical-align:middle}
.tbl tr:last-child td{border-bottom:none}
.tbl tr:hover td{background:var(--surf2)}
.risk{font-size:11px;font-weight:700;padding:3px 9px;border-radius:20px;display:inline-flex;align-items:center}
.risk.h{background:#FEF2F2;color:#991B1B}
.risk.m{background:#FFFBEB;color:#92400E}
.risk.l{background:#F0FDF4;color:#14532D}
.seg-tag{font-size:11px;font-weight:600;background:var(--surf2);padding:3px 8px;border-radius:10px;color:var(--txt2);border:1px solid var(--bd)}
.btn-sm{font-family:var(--fb);font-size:11px;font-weight:500;padding:5px 11px;border-radius:6px;border:1px solid var(--bd2);background:var(--surf);color:var(--txt);cursor:pointer;transition:background .15s}
.btn-sm:hover{background:var(--surf2)}
.btn-sm.pri{background:var(--blue);color:#fff;border-color:var(--blue)}
.btn-sm.pri:hover{background:#1d43d8}

/* ── 360 PROFILE ── */
.p360-wrap{display:grid;grid-template-columns:1.1fr 1fr 1fr;gap:18px}
.p-hdr{display:flex;align-items:center;gap:13px;margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid var(--bd)}
.ava{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--fh);font-size:14px;font-weight:700;color:#fff;flex-shrink:0}
.p-name{font-family:var(--fh);font-size:14px;font-weight:600}
.p-meta{font-size:11px;color:var(--muted);margin-top:1px}
.hs{margin-left:auto;text-align:center}
.hs-n{font-family:var(--fh);font-size:24px;font-weight:700;line-height:1}
.hs-n.g{color:#059669}.hs-n.w{color:#D97706}.hs-n.b{color:#DC2626}
.hs-l{font-size:10px;color:var(--muted)}
.attr-r{display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--bd);font-size:13px}
.attr-r:last-child{border-bottom:none}
.attr-k{color:var(--muted)}
.attr-v{font-weight:500}
.prod-r{display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--bd);font-size:13px}
.prod-r:last-child{border-bottom:none}
.prod-dot{width:8px;height:8px;border-radius:50%;display:inline-block;flex-shrink:0}

/* ── RISK BARS ── */
.rb{margin-bottom:11px}
.rb-hd{display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px}
.rb-lbl{color:var(--txt2)}

/* ── TIMELINE ── */
.tl{position:relative;padding-left:20px}
.tl::before{content:'';position:absolute;left:7px;top:8px;bottom:8px;width:1px;background:var(--bd)}
.tl-item{position:relative;margin-bottom:13px;font-size:13px}
.tl-dot{position:absolute;left:-16px;top:3px;width:10px;height:10px;border-radius:50%;border:2px solid var(--surf)}
.tl-dot.blue{background:var(--blue)}
.tl-dot.green{background:#10B981}
.tl-dot.amber{background:#F59E0B}
.tl-dot.red{background:#EF4444}
.tl-time{font-size:11px;color:var(--muted);margin-top:2px}

/* ── SEGMENTATION ── */
.seg-card{background:var(--surf);border:1px solid var(--bd);border-radius:var(--r);padding:18px 20px;border-top-width:3px;transition:box-shadow .15s}
.seg-card:hover{box-shadow:var(--sh-md)}
.seg-n{font-family:var(--fh);font-size:14px;font-weight:600;margin-bottom:2px}
.seg-cnt{font-size:12px;color:var(--muted)}
.seg-aum{font-family:var(--fh);font-size:16px;font-weight:700;padding:4px 10px;border-radius:8px}
.seg-act{font-size:13px;margin-bottom:8px}
.seg-opp{font-size:13px;display:flex;align-items:center;gap:7px;padding:8px 12px;background:var(--surf2);border-radius:8px}

/* ── CHURN ── */
.churn-f{margin-bottom:12px}
.churn-f-hd{display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px}
.churn-f-lbl{color:var(--txt2)}

/* ── SCORE BAR larger ── */
.bar7{height:7px;background:var(--surf2);border-radius:4px;overflow:hidden;border:1px solid var(--bd)}

/* ── SPARKLINE ── */
.sp{display:block}

/* ── EMPTY ── */
.empty{text-align:center;padding:36px;color:var(--muted);font-size:13px}

/* ── SELECTED ROW ── */
.tbl tr.sel td{background:#EBF0FF}

@media(max-width:1200px){
  .ci-kpi-row{grid-template-columns:repeat(3,1fr)}
  .g3{grid-template-columns:1fr 1fr}
  .p360-wrap{grid-template-columns:1fr 1fr}
}
@media(max-width:900px){
  .g2,.g31,.g13{grid-template-columns:1fr}
  .ci-kpi-row{grid-template-columns:repeat(2,1fr)}
  .aff-grid{grid-template-columns:1fr 1fr}
  .p360-wrap{grid-template-columns:1fr}
  .ci-page{padding:14px 16px}
}
`;

/* ─── DATA ──────────────────────────────────────────────────────────────────── */
const KPI = [
  { lbl:"Total Customers",     val:"48,320",    delta:"+8.4%",  dir:"up", sub:"vs last quarter",  cls:"c-blue"   },
  { lbl:"Avg. Revenue / Cust.", val:"₹1,24,500", delta:"+12.1%", dir:"up", sub:"monthly ARC",       cls:"c-teal"   },
  { lbl:"Churn Risk Flagged",  val:"1,248",     delta:"+3.2%",  dir:"up", sub:"needs attention",   cls:"c-red"    },
  { lbl:"Upsell Opportunities",val:"6,780",     delta:"+18.5%", dir:"up", sub:"identified by AI",  cls:"c-purple" },
  { lbl:"NPS Score",           val:"74",        delta:"+6 pts", dir:"up", sub:"satisfaction index",cls:"c-amber"  },
];

const SEGS = ["All","HNI","Retail","SME","Corporate","NRI","New (<6m)"];

const CUSTOMERS = [
  { id:"CIF001248", name:"Rajesh Mehta",       seg:"HNI",       aum:"₹4.2 Cr", prod:7, hs:92, risk:"l", trend:[60,70,75,80,92], ava:"#2554F4" },
  { id:"CIF003901", name:"Priya Nair",          seg:"Corporate", aum:"₹8.8 Cr", prod:5, hs:85, risk:"l", trend:[50,60,70,78,85], ava:"#09BEAA" },
  { id:"CIF002210", name:"Arjun Finance Ltd.",  seg:"SME",       aum:"₹1.1 Cr", prod:3, hs:58, risk:"m", trend:[75,70,65,60,58], ava:"#7C3AED" },
  { id:"CIF007744", name:"Sudhir Kumar",        seg:"Retail",    aum:"₹42 L",   prod:2, hs:34, risk:"h", trend:[60,55,45,40,34], ava:"#EF4444" },
  { id:"CIF005520", name:"Nalini Investments",  seg:"HNI",       aum:"₹3.3 Cr", prod:6, hs:78, risk:"l", trend:[60,65,70,74,78], ava:"#F59E0B" },
  { id:"CIF009010", name:"Kiran Deshpande",     seg:"NRI",       aum:"₹2.1 Cr", prod:4, hs:65, risk:"m", trend:[80,75,70,67,65], ava:"#EC4899" },
];

const LIFECYCLE = [
  { stage:"Prospect",  count:"12,410", pct:"25.7%" },
  { stage:"Onboarded", count:"8,930",  pct:"18.5%" },
  { stage:"Active",    count:"22,780", pct:"47.1%" },
  { stage:"Dormant",   count:"2,960",  pct:"6.1%"  },
  { stage:"Churned",   count:"1,240",  pct:"2.6%"  },
];

const AFFINITY = [
  { prod:"Fixed Deposits", pct:82, color:"#2554F4" },
  { prod:"Mutual Funds",   pct:68, color:"#09BEAA" },
  { prod:"Insurance",      pct:54, color:"#7C3AED" },
  { prod:"SIP",            pct:72, color:"#F59E0B" },
  { prod:"Loans",          pct:39, color:"#EF4444" },
  { prod:"NPS",            pct:28, color:"#EC4899" },
];

const INSIGHTS = [
  { type:"opp",  ico:"💡", t:"SIP Upsell — 2,340 customers",      b:"Retail customers with 12+ month FD maturity, age 30–45, show 74% SIP conversion probability."  },
  { type:"warn", ico:"⚠️", t:"Dormancy alert — Q3 spike",          b:"283 HNI customers inactive 60+ days. Likely competing bank offers. Schedule RM outreach."       },
  { type:"alrt", ico:"🔔", t:"Churn risk — 1,248 flagged",         b:"Top risk: SME customers with missed EMIs and no product diversification. Immediate action needed." },
  { type:"info", ico:"📊", t:"Cross-sell signal — Insurance",       b:"Customers with loans + FDs but no insurance show 61% cross-sell readiness. Bundle offer advised." },
];

const SEGS_DETAIL = [
  { name:"HNI Investors",  cnt:8690,  aum:"₹1,820 Cr", act:"Wealth review + NPS",    opp:"₹240 Cr",  color:"#2554F4" },
  { name:"Retail Mass",    cnt:20280, aum:"₹320 Cr",   act:"SIP + Insurance push",   opp:"₹48 Cr",   color:"#09BEAA" },
  { name:"SME Business",   cnt:10620, aum:"₹640 Cr",   act:"Working capital loan",   opp:"₹120 Cr",  color:"#7C3AED" },
  { name:"Corporate",      cnt:5320,  aum:"₹2,400 Cr", act:"Treasury + Trade finance",opp:"₹380 Cr", color:"#F59E0B" },
  { name:"NRI Segment",    cnt:3380,  aum:"₹480 Cr",   act:"Remittance + NRE FD",    opp:"₹95 Cr",   color:"#EF4444" },
];

const CHURN_FACTORS = [
  { lbl:"No product activity 60+ days",    w:34, color:"#EF4444" },
  { lbl:"Missed EMI or SIP payment",       w:28, color:"#F59E0B" },
  { lbl:"Single product holding",          w:18, color:"#7C3AED" },
  { lbl:"No digital channel usage",        w:12, color:"#2554F4" },
  { lbl:"Unresolved service complaints",   w:8,  color:"#09BEAA" },
];

const RETENTION = [
  { type:"alrt", ico:"🔴", t:"High risk — 483 SME accounts",   b:"Assign dedicated RM. Offer loan restructuring within 7 days."       },
  { type:"warn", ico:"🟡", t:"Medium risk — 765 retail",        b:"Auto-trigger personalised SIP continuation email campaign."         },
  { type:"opp",  ico:"🟢", t:"Winback — 240 churned",           b:"Re-engage with FD renewal offer. Combined last AUM: ₹2.1 Cr."      },
  { type:"info", ico:"🔵", t:"Watch list — 312 dormant HNI",    b:"Schedule quarterly wealth review meeting within 15 days."           },
];

const TIMELINE = [
  { txt:"FD maturity processed — ₹18 L renewed for 12 months", time:"Today, 10:32 AM", cls:"green"  },
  { txt:"Support ticket #T-4421 resolved — KYC update",         time:"Yesterday, 3:14 PM",cls:"blue" },
  { txt:"SIP instalment missed — ₹10,000",                      time:"Apr 22",           cls:"amber" },
  { txt:"New mutual fund investment — ₹50,000 lumpsum",         time:"Apr 10",           cls:"green" },
  { txt:"Churn risk flag raised by system",                      time:"Apr 5",            cls:"red"   },
  { txt:"RM call completed — product review discussed",          time:"Mar 28",           cls:"blue"  },
];

const PIE_DATA = [
  { lbl:"HNI",       val:18, color:"#2554F4" },
  { lbl:"Retail",    val:42, color:"#09BEAA" },
  { lbl:"SME",       val:22, color:"#7C3AED" },
  { lbl:"Corporate", val:11, color:"#F59E0B" },
  { lbl:"NRI",       val:7,  color:"#EF4444" },
];

/* ─── HELPERS ───────────────────────────────────────────────────────────────── */
function Sparkline({ data, color="#2554F4", W=60, H=22 }: { data: number[], color?: string, W?: number, H?: number }) {
  const max=Math.max(...data), min=Math.min(...data), r=max-min||1;
  const pts=data.map((v,i)=>`${(i/(data.length-1))*W},${H-((v-min)/r)*(H-4)-2}`).join(" ");
  return <svg className="sp" width={W} height={H}><polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

function ScoreBar({ pct, color, h=6 }: { pct: number, color: string, h?: number }) {
  return <div className="bar" style={{height:h}}><div className="bar-fill" style={{width:`${pct}%`,background:color}}/></div>;
}

// Updated useChart to be more robust
function useChart(ref: RefObject<HTMLCanvasElement>, getConfig: () => any, scriptLoaded: boolean, deps: any[] = []) {
  useEffect(()=>{
    if (!scriptLoaded || !ref.current) return;
    
    let chartInstance: any = null;
    
    const init = () => {
      if (window.Chart) {
        chartInstance = new window.Chart(ref.current!.getContext("2d"), getConfig());
      }
    };

    init();
    return () => {
      if (chartInstance) chartInstance.destroy();
    };
  }, [scriptLoaded, ...deps]);
}

/* ─── SECTIONS ──────────────────────────────────────────────────────────────── */

function KPIRow() {
  return (
    <div className="ci-kpi-row">
      {KPI.map(k=>(
        <div key={k.lbl} className={`ci-kpi ${k.cls}`}>
          <div className="ci-kpi-lbl">{k.lbl}</div>
          <div className="ci-kpi-val">{k.val}</div>
          <div className={`ci-kpi-delta ${k.dir}`}>{k.dir==="up"?"▲":"▼"} {k.delta}</div>
          <div className="ci-kpi-sub">{k.sub}</div>
        </div>
      ))}
    </div>
  );
}

function AISummary() {
  return (
    <div className="ci-ai">
      <div className="ci-ai-ico">🤖</div>
      <div>
        <div className="ci-ai-tag">AI Intelligence Summary</div>
        <div className="ci-ai-txt">
          <strong>Top action this week:</strong> 2,340 retail customers match the SIP upsell profile. HNI segment revenue potential has grown by ₹12.4 Cr. Churn risk in SME is elevated — 483 accounts need RM attention before month-end. Cross-sell readiness for insurance is at a 6-month high.
        </div>
      </div>
    </div>
  );
}

function EngagementRow({ scriptLoaded }: { scriptLoaded: boolean }) {
  const [actStage, setActStage] = useState<string | null>(null);
  const trendRef = useRef<HTMLCanvasElement>(null);
  const pieRef   = useRef<HTMLCanvasElement>(null);

  useChart(trendRef, ()=>({
    type:"line",
    data:{
      labels:["Oct","Nov","Dec","Jan","Feb","Mar"],
      datasets:[
        {label:"Transactions", data:[120,145,160,138,175,190], borderColor:"#2554F4", backgroundColor:"#2554F418", fill:true, tension:.4, pointRadius:3, borderWidth:2},
        {label:"Digital Logins",data:[80,95,105,88,112,130],  borderColor:"#09BEAA", backgroundColor:"#09BEAA18", fill:true, tension:.4, pointRadius:3, borderWidth:2},
      ]
    },
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:"rgba(0,0,0,0.04)"},ticks:{font:{size:11}}},y:{grid:{color:"rgba(0,0,0,0.04)"},ticks:{font:{size:11}}}}}
  }), scriptLoaded);

  useChart(pieRef, ()=>({
    type:"doughnut",
    data:{labels:PIE_DATA.map(d=>d.lbl),datasets:[{data:PIE_DATA.map(d=>d.val),backgroundColor:PIE_DATA.map(d=>d.color),borderWidth:2,borderColor:"#fff"}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},cutout:"68%"}
  }), scriptLoaded);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      <div className="ci-card">
        <div className="ct">
          <span className="ico" style={{background:"#EBF0FF"}}>🔄</span> Customer Lifecycle Funnel
        </div>
        <div className="lifecycle">
          {LIFECYCLE.map((s,i)=>(
            <div key={s.stage} className={`lc-stage${actStage===s.stage?" act":""}`} onClick={()=>setActStage(actStage===s.stage?null:s.stage)}>
              {i<LIFECYCLE.length-1 && <span className="lc-arr">›</span>}
              <div className="lc-name">{s.stage}</div>
              <div className="lc-count">{s.count}</div>
              <div className="lc-pct">{s.pct}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="g2">
        <div className="ci-card">
          <div className="ct"><span className="ico" style={{background:"#E6FAF8"}}>📈</span> Engagement Trends</div>
          <div style={{position:"relative",height:180}}>
            {!scriptLoaded && <div style={{textAlign:'center', padding:40, color:'#999'}}>Loading chart engine...</div>}
            <canvas ref={trendRef}></canvas>
          </div>
        </div>
        <div className="ci-card">
          <div className="ct"><span className="ico" style={{background:"#F3F0FF"}}>🧩</span> Segment Distribution</div>
          <div style={{display:"flex",alignItems:"center",gap:18}}>
            <div style={{position:"relative",height:160,width:160,flexShrink:0}}>
              <canvas ref={pieRef}></canvas>
            </div>
            <div style={{flex:1}}>
              {PIE_DATA.map(d=>(
                <div key={d.lbl} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid var(--bd)",fontSize:13}}>
                  <span style={{display:"flex",alignItems:"center",gap:7}}>
                    <span style={{width:8,height:8,borderRadius:2,background:d.color,display:"inline-block"}}></span>
                    <span style={{color:"var(--txt2)"}}>{d.lbl}</span>
                  </span>
                  <span style={{fontWeight:600}}>{d.val}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductAffinity() {
  return (
    <div className="ci-card">
      <div className="ct">
        <span className="ico" style={{background:"#FFF7ED"}}>🏦</span> Product Affinity Scores
        <span className="ct-right">Based on behavioural & transactional AI analysis</span>
      </div>
      <div className="aff-grid">
        {AFFINITY.map(a=>(
          <div className="aff-item" key={a.prod}>
            <div className="aff-lbl">{a.prod}</div>
            <div className="aff-pct" style={{color:a.color}}>{a.pct}%</div>
            <ScoreBar pct={a.pct} color={a.color}/>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIInsights() {
  return (
    <div className="ci-card">
      <div className="ct"><span className="ico" style={{background:"#EBF0FF"}}>💡</span> AI-Driven Actionable Insights</div>
      <div className="ins-list">
        {INSIGHTS.map((ins,i)=>(
          <div key={i} className={`ins-item ${ins.type}`}>
            <span className="ins-ico">{ins.ico}</span>
            <div className="ins-t"><strong>{ins.t}</strong>{ins.b}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomerList({ onSelect, selected }: { onSelect: (customer: typeof CUSTOMERS[number] | null) => void; selected: typeof CUSTOMERS[number] | null }) {
  const [search, setSearch] = useState("");
  const [seg, setSeg]       = useState("All");
  const filtered = CUSTOMERS.filter(c=>
    (seg==="All"||c.seg===seg) &&
    (c.name.toLowerCase().includes(search.toLowerCase())||c.id.includes(search))
  );
  const hColor = (hs: number) => hs>=70?"#059669":hs>=50?"#D97706":"#DC2626";
  const hBg    = (hs: number) => hs>=70?"#10B981":hs>=50?"#F59E0B":"#EF4444";
  return (
    <div className="ci-card">
      <div className="ct"><span className="ico" style={{background:"#E6FAF8"}}>👥</span> Customer Intelligence List</div>
      <div className="srch-wrap">
        <span className="srch-ico">🔍</span>
        <input className="srch" placeholder="Search by name or CIF ID…" value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>
      <div className="pills">
        {SEGS.map(s=><button key={s} className={`pill${seg===s?" on":""}`} onClick={()=>setSeg(s)}>{s}</button>)}
      </div>
      <table className="tbl">
        <thead>
          <tr>
            <th>CIF ID</th><th>Customer</th><th>Segment</th><th>AUM</th>
            <th>Products</th><th>Health Score</th><th>Risk</th><th>Trend</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(c=>(
            <tr key={c.id} className={selected?.id===c.id?"sel":""}>
              <td><span style={{fontFamily:"monospace",fontSize:11,color:"var(--muted)"}}>{c.id}</span></td>
              <td><strong style={{fontWeight:500}}>{c.name}</strong></td>
              <td><span className="seg-tag">{c.seg}</span></td>
              <td style={{fontWeight:500}}>{c.aum}</td>
              <td style={{textAlign:"center"}}>{c.prod}</td>
              <td>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontWeight:700,fontSize:14,color:hColor(c.hs),minWidth:26}}>{c.hs}</span>
                  <div style={{flex:1,minWidth:46}}><ScoreBar pct={c.hs} color={hBg(c.hs)} h={5}/></div>
                </div>
              </td>
              <td><span className={`risk ${c.risk}`}>{c.risk==="h"?"High":c.risk==="m"?"Medium":"Low"}</span></td>
              <td><Sparkline data={c.trend} color={hBg(c.hs)}/></td>
              <td>
                <button className={`btn-sm${selected?.id===c.id?" pri":""}`} onClick={()=>onSelect(selected?.id===c.id?null:c)}>
                  {selected?.id===c.id?"Viewing":"View 360°"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Profile360({ customer }: { customer: typeof CUSTOMERS[number] | null }) {
  if (!customer) return (
    <div className="ci-card" style={{textAlign:"center",padding:"36px 20px",color:"var(--muted)",fontSize:13}}>
      Select a customer from the list above to view their 360° profile.
    </div>
  );
  const c = customer;
  const hClass = c.hs>=70?"g":c.hs>=50?"w":"b";
  return (
    <div>
      <div className="ci-slabel">360° Customer Profile — {c.name}</div>
      <div className="p360-wrap">
        <div className="ci-card">
          <div className="p-hdr">
            <div className="ava" style={{background:c.ava}}>{c.name.split(" ").map(w=>w[0]).join("").slice(0,2)}</div>
            <div>
              <div className="p-name">{c.name}</div>
              <div className="p-meta">{c.id} · {c.seg}</div>
            </div>
            <div className="hs">
              <div className={`hs-n ${hClass}`}>{c.hs}</div>
              <div className="hs-l">Health</div>
            </div>
          </div>
          {[["AUM",c.aum],["Products",c.prod],["Segment",c.seg],["RM","Asha Verma"]].map(([k,v])=>(
            <div className="attr-r" key={k}><span className="attr-k">{k}</span><span className="attr-v">{v}</span></div>
          ))}
        </div>
        <div className="ci-card">
          <div className="ct"><span className="ico" style={{background:"#FEF2F2"}}>⚡</span> Risk & Behaviour</div>
           {[["Churn Prob.", "35%"], ["Fraud Risk", "Low"], ["Digital Channel", "Mobile App"], ["Support Tks", "2"]].map(([k,v])=>(
            <div className="attr-r" key={k}><span className="attr-k">{k}</span><span className="attr-v">{v}</span></div>
          ))}
        </div>
        <div className="ci-card">
          <div className="ct"><span className="ico" style={{background:"#F3F0FF"}}>🕐</span> Recent Activity</div>
          <div className="tl">
            {TIMELINE.slice(0,3).map((t,i)=>(
              <div className="tl-item" key={i}>
                <div className={`tl-dot ${t.cls}`}></div>
                <div style={{fontWeight:500,color:"var(--txt)"}}>{t.txt}</div>
                <div className="tl-time">{t.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Segmentation() {
  return (
    <div className="g3">
      {SEGS_DETAIL.map(s=>(
        <div className="seg-card" key={s.name} style={{borderTopColor:s.color}}>
          <div className="seg-n">{s.name}</div>
          <div className="seg-cnt">{s.cnt.toLocaleString()} customers</div>
          <div className="seg-aum" style={{background:s.color+"1E",color:s.color, marginTop:10}}>{s.aum}</div>
        </div>
      ))}
    </div>
  );
}

function ChurnRisk() {
  const atRisk = CUSTOMERS.filter(c=>c.hs<70);
  return (
    <div className="ci-card">
      <div className="ct"><span className="ico" style={{background:"#FEF2F2"}}>⚠️</span> At-Risk Customer Watchlist</div>
      <table className="tbl">
        <thead>
          <tr><th>Customer</th><th>Segment</th><th>AUM</th><th>Health</th><th>Action</th></tr>
        </thead>
        <tbody>
          {atRisk.map(c=>(
            <tr key={c.id}>
              <td><strong style={{fontWeight:500}}>{c.name}</strong></td>
              <td><span className="seg-tag">{c.seg}</span></td>
              <td>{c.aum}</td>
              <td><span style={{fontWeight:700,color:c.hs<50?"#DC2626":"#D97706"}}>{c.hs}</span></td>
              <td><button className="btn-sm">Assign RM</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── ROOT ───────────────────────────────────────────────────────────────────── */
export default function CustomerIntelligenceDashboard() {
  const [selected, setSelected] = useState<typeof CUSTOMERS[number] | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if script already exists
    if (window.Chart) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);
  }, []);

  return (
    <>
      <style>{CSS}</style>

      <div className="ci">
        <header className="ci-hdr">
         <button className="ci-back" onClick={() => navigate('/modules', {state: { scrollToModule: 'commercial' }})}>
          <svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg> Back
        </button>
          <div className="ci-mark">CPX</div>
          <div className="ci-bc">
            <span>Customer Pricing &amp; Excellence</span>
            <span style={{color:"var(--muted)"}}>›</span>
            <strong>Customer Intelligence</strong>
          </div>
          <div className="ci-dot-live"><i></i>LIVE</div>
        </header>

        <div className="ci-page">
          <div className="ci-slabel">Key Performance Indicators</div>
          <KPIRow />

          <AISummary />

          <div className="ci-slabel">Customer Engagement &amp; Lifecycle</div>
          <EngagementRow scriptLoaded={scriptLoaded} />

          <div className="ci-slabel">Product Intelligence</div>
          <ProductAffinity />

          <AIInsights />

          <div className="ci-slabel">Customer Intelligence List</div>
          <CustomerList onSelect={setSelected} selected={selected} />

          <Profile360 customer={selected} />

          <div className="ci-slabel">Customer Segmentation</div>
          <Segmentation />

          <div className="ci-slabel">Churn Detection &amp; Risk Management</div>
          <ChurnRisk />
        </div>
      </div>
    </>
  );
}