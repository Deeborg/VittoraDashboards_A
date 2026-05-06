import { useState } from "react";
import { useNavigate } from 'react-router-dom';

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

  :root {
    --pa-bg:           #f4f6fb;
    --pa-surface:      #ffffff;
    --pa-surface-2:    #f8f9fc;
    --pa-border:       #e4e8f0;
    --pa-border-light: #edf0f7;
    --pa-text-1:       #111827;
    --pa-text-2:       #4b5563;
    --pa-text-3:       #9ca3af;
    --pa-blue:         #1d4ed8;
    --pa-blue-light:   #eff6ff;
    --pa-blue-mid:     #3b82f6;
    --pa-green:        #16a34a;
    --pa-green-light:  #f0fdf4;
    --pa-amber:        #b45309;
    --pa-amber-light:  #fffbeb;
    --pa-red:          #dc2626;
    --pa-red-light:    #fef2f2;
    --pa-purple:       #7c3aed;
    --pa-purple-light: #f5f3ff;
    --pa-teal-mid:     #14b8a6;
    --pa-radius:       10px;
    --pa-radius-lg:    14px;
    --pa-font:         'DM Sans', system-ui, sans-serif;
    --pa-mono:         'DM Mono', monospace;
  }

  .pa-root * { box-sizing: border-box; margin: 0; padding: 0; }
  .pa-root {
    font-family: var(--pa-font);
    background: var(--pa-bg);
    min-height: 100vh;
    color: var(--pa-text-1);
    font-size: 14px;
  }

  .pa-layout { display: flex; flex-direction: column; min-height: 100vh; }
  .pa-main   { flex: 1; min-width: 0; display: flex; flex-direction: column; }

  .pa-header {
    background: #ffffff;
    border-bottom: 1px solid #e4e8f0;
    position: sticky;
    top: 0;
    z-index: 20;
  }

  /* Top strip: back + breadcrumb + meta */
  .pa-header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 32px;
    border-bottom: 1px solid #edf0f7;
  }
  .pa-header-top-left { display: flex; align-items: center; gap: 10px; }

  .pa-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 7px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    background: #f1f5f9;
    color: #374151;
    border: 1px solid #e4e8f0;
    transition: all .15s;
    font-family: var(--pa-font);
    letter-spacing: 0.01em;
  }
  .pa-back-btn:hover {
    background: #e5eaf5;
    color: #111827;
    border-color: rgba(255,255,255,0.35);
  }
  .pa-back-arrow { font-size: 13px; line-height: 1; }

  .pa-breadcrumb {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: #9ca3af;
  }
  .pa-breadcrumb-sep { font-size: 10px; opacity: 0.4; }
  .pa-breadcrumb-cur { color: #111827; font-weight: 500; }

  .pa-header-top-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .pa-header-meta-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 500;
    background: rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.65);
    border: 1px solid rgba(255,255,255,0.12);
  }
  .pa-live-dot {
    width: 6px; height: 6px;
    background: #4ade80;
    border-radius: 50%;
    animation: pulse 1.8s infinite;
    flex-shrink: 0;
  }
  @keyframes pulse {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:.5; transform:scale(.8); }
  }
  .pa-avatar {
    width: 30px; height: 30px;
    border-radius: 50%;
    background: rgba(255,255,255,0.12);
    border: 1.5px solid rgba(255,255,255,0.25);
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    letter-spacing: 0.02em;
  }

  /* Main header row: title + stats strip */
  .pa-header-body {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 32px 18px;
    gap: 24px;
  }
  .pa-header-title-block { display: flex; align-items: center; gap: 14px; }
  .pa-header-icon {
    width: 42px; height: 42px;
    border-radius: 11px;
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.2);
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
  }
  .pa-header-title {
    font-size: 20px;
    font-weight: 700;
    color: #111827;
    letter-spacing: -0.3px;
    line-height: 1.2;
  }
  .pa-header-subtitle {
    font-size: 12px;
    color: #6b7280;
    margin-top: 3px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .pa-header-subtitle-dot {
    width: 3px; height: 3px;
    border-radius: 50%;
    background: rgba(255,255,255,0.3);
    display: inline-block;
  }

  /* Quick-stat pills in header */
  .pa-header-stats {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .pa-hstat {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 18px;
    border-radius: 10px;
    background: #f8fafc;
    border: 1px solid #e4e8f0;
    min-width: 80px;
    gap: 2px;
  }
  .pa-hstat-val {
    font-size: 17px;
    font-weight: 700;
    color: #111827;
    font-family: var(--pa-mono);
    line-height: 1;
  }
  .pa-hstat-lbl {
    font-size: 10px;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    white-space: nowrap;
  }
  .pa-hstat-delta {
    font-size: 10px;
    font-weight: 600;
    margin-top: 2px;
    display: flex;
    align-items: center;
    gap: 2px;
  }
  .pa-hstat-delta.up   { color: #4ade80; }
  .pa-hstat-delta.down { color: #f87171; }

  /* Tab bar inside header */
  .pa-header-tabs {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 0 32px
    background: #ffffff;
    border-top: 1px solid #edf0f7;
    overflow-x: auto;
  }
  .pa-htab {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    font-size: 12px;
    font-weight: 400;
    color: #6b7280;
    cursor: default;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    white-space: nowrap;
    transition: color 0.15s;
    letter-spacing: 0.01em;
  }
  .pa-htab.active {
    color: #1d4ed8;
  border-bottom: 2px solid #1d4ed8;
    font-weight: 500;
  }
  .pa-htab-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.6;
  }

  /* Page content */
  .pa-content { padding: 24px 32px; flex: 1; }

  /* Section divider */
  .pa-divider { display: flex; align-items: center; gap: 12px; margin: 28px 0 16px; }
  .pa-divider-line  { flex: 1; height: 1px; background: var(--pa-border); }
  .pa-divider-label {
    font-size: 11px; font-weight: 600; color: var(--pa-text-3);
    text-transform: uppercase; letter-spacing: .08em; white-space: nowrap;
  }

  /* KPI grid */
  .pa-kpi-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 22px; }
  .pa-kpi-card { background: var(--pa-surface); border: 1px solid var(--pa-border); border-radius: var(--pa-radius-lg); padding: 18px 20px; }
  .pa-kpi-lbl  { font-size: 11px; font-weight: 500; color: var(--pa-text-3); text-transform: uppercase; letter-spacing: .07em; margin-bottom: 8px; }
  .pa-kpi-val  { font-size: 26px; font-weight: 600; line-height: 1; margin-bottom: 8px; font-family: var(--pa-mono); }
  .pa-kpi-meta { display: flex; align-items: center; gap: 6px; }
  .pa-delta    { display: inline-flex; align-items: center; gap: 3px; font-size: 12px; font-weight: 500; padding: 2px 7px; border-radius: 20px; }
  .pa-delta.up   { background: var(--pa-green-light); color: var(--pa-green); }
  .pa-delta.down { background: var(--pa-red-light);   color: var(--pa-red);   }
  .pa-kpi-per  { font-size: 11px; color: var(--pa-text-3); }
  .pa-kpi-acc  { height: 3px; border-radius: 2px; margin-top: 14px; }

  /* Cards */
  .pa-card { background: var(--pa-surface); border: 1px solid var(--pa-border); border-radius: var(--pa-radius-lg); padding: 20px; }
  .pa-card-hdr { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; }
  .pa-card-ttl { font-size: 14px; font-weight: 600; }
  .pa-card-sub { font-size: 12px; color: var(--pa-text-3); margin-top: 2px; }

  /* Grids */
  .pa-row-2  { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 22px; }
  .pa-row-3  { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; margin-bottom: 22px; }
  .pa-row-15 { display: grid; grid-template-columns: 1.5fr 1fr; gap: 14px; margin-bottom: 22px; }

  /* Horizontal bars */
  .pa-bars { display: flex; flex-direction: column; gap: 12px; }
  .pa-bar-row { display: flex; flex-direction: column; gap: 4px; }
  .pa-bar-top { display: flex; justify-content: space-between; }
  .pa-bar-nm  { font-size: 12px; color: var(--pa-text-2); }
  .pa-bar-vl  { font-size: 12px; font-weight: 500; font-family: var(--pa-mono); }
  .pa-bar-track { height: 8px; background: var(--pa-border-light); border-radius: 4px; overflow: hidden; }
  .pa-bar-fill  { height: 100%; border-radius: 4px; transition: width .7s cubic-bezier(.16,1,.3,1); }

  /* Donut */
  .pa-donut-wrap   { display: flex; flex-direction: column; align-items: center; }
  .pa-donut-svg    { width: 140px; height: 140px; }
  .pa-donut-legend { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 18px; margin-top: 14px; width: 100%; }
  .pa-leg-item { display: flex; align-items: center; gap: 7px; }
  .pa-leg-dot  { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
  .pa-leg-txt  { font-size: 11px; color: var(--pa-text-2); }
  .pa-leg-pct  { font-size: 11px; font-weight: 500; font-family: var(--pa-mono); margin-left: auto; }

  /* Table */
  .pa-tbl-wrap { overflow-x: auto; }
  table.pa-tbl { width: 100%; border-collapse: collapse; }
  table.pa-tbl th { font-size: 11px; font-weight: 500; color: var(--pa-text-3); text-transform: uppercase; letter-spacing: .06em; padding: 10px 14px; text-align: left; border-bottom: 1px solid var(--pa-border); background: var(--pa-surface-2); }
  table.pa-tbl td { padding: 12px 14px; font-size: 13px; border-bottom: 1px solid var(--pa-border-light); vertical-align: middle; }
  table.pa-tbl tr:last-child td { border-bottom: none; }
  table.pa-tbl tr:hover td { background: var(--pa-surface-2); }
  .pa-pill { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 500; }
  .pa-pill.active { background: var(--pa-green-light); color: var(--pa-green); }
  .pa-pill.ended  { background: var(--pa-border-light); color: var(--pa-text-3); }
  .pa-pill.draft  { background: var(--pa-amber-light);  color: var(--pa-amber); }
  .pa-pill.paused { background: var(--pa-red-light);    color: var(--pa-red); }
  .pa-pill.high   { background: var(--pa-green-light);  color: var(--pa-green); }
  .pa-pill.medium { background: var(--pa-amber-light);  color: var(--pa-amber); }
  .pa-pill.low    { background: var(--pa-border-light); color: var(--pa-text-3); }

  /* Filters */
  .pa-filter-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
  .pa-flbl { font-size: 11px; color: var(--pa-text-3); font-weight: 500; }
  .pa-chip { display: inline-flex; align-items: center; padding: 5px 12px; border-radius: 20px; font-size: 12px; cursor: pointer; border: 1px solid var(--pa-border); background: var(--pa-surface); color: var(--pa-text-2); transition: all .15s; }
  .pa-chip:hover  { border-color: var(--pa-blue-mid); color: var(--pa-blue); }
  .pa-chip.active { background: var(--pa-blue-light); border-color: var(--pa-blue-mid); color: var(--pa-blue); font-weight: 500; }
  .pa-fsel { padding: 5px 10px; border-radius: 8px; border: 1px solid var(--pa-border); font-size: 12px; color: var(--pa-text-2); background: var(--pa-surface); cursor: pointer; font-family: var(--pa-font); }

  /* Heatmap */
  .pa-hm-hdr  { display: flex; gap: 4px; padding-left: 40px; margin-bottom: 2px; }
  .pa-hm-hlbl { flex: 1; font-size: 10px; color: var(--pa-text-3); text-align: center; }
  .pa-hm-row  { display: flex; align-items: center; gap: 4px; margin-bottom: 4px; }
  .pa-hm-rlbl { font-size: 10px; color: var(--pa-text-3); width: 36px; flex-shrink: 0; }
  .pa-hm-cell { flex: 1; height: 24px; border-radius: 4px; }

  /* Progress rows */
  .pa-prog { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--pa-border-light); }
  .pa-prog:last-child { border-bottom: none; }
  .pa-prog-info { flex: 1; min-width: 0; }
  .pa-prog-nm   { font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .pa-prog-sub  { font-size: 11px; color: var(--pa-text-3); margin-top: 1px; }
  .pa-prog-bar  { flex: 1; }
  .pa-prog-track { height: 6px; background: var(--pa-border-light); border-radius: 3px; overflow: hidden; }
  .pa-prog-fill  { height: 100%; border-radius: 3px; }
  .pa-prog-num   { font-size: 12px; font-weight: 500; font-family: var(--pa-mono); min-width: 28px; text-align: right; color: var(--pa-text-2); }

  /* Score ring */
  .pa-ring-wrap { display: flex; justify-content: center; padding: 10px 0; }
  .pa-ring      { position: relative; width: 110px; height: 110px; }
  .pa-ring-ctr  { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .pa-ring-num  { font-size: 24px; font-weight: 600; font-family: var(--pa-mono); }
  .pa-ring-max  { font-size: 10px; color: var(--pa-text-3); }

  /* Insight */
  .pa-insight { display: flex; gap: 12px; padding: 14px; background: var(--pa-surface-2); border-radius: var(--pa-radius); border: 1px solid var(--pa-border-light); margin-bottom: 10px; }
  .pa-insight:last-child { margin-bottom: 0; }
  .pa-ins-icon { width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 16px; }
  .pa-ins-tag  { font-size: 10px; font-weight: 600; color: var(--pa-text-3); text-transform: uppercase; letter-spacing: .06em; }
  .pa-ins-txt  { font-size: 13px; line-height: 1.55; margin-top: 3px; }

  /* Timeline */
  .pa-tl-item { display: flex; gap: 14px; padding-bottom: 18px; }
  .pa-tl-item:last-child { padding-bottom: 0; }
  .pa-tl-left  { display: flex; flex-direction: column; align-items: center; width: 28px; flex-shrink: 0; }
  .pa-tl-dot   { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; margin-top: 3px; }
  .pa-tl-line  { flex: 1; width: 1px; background: var(--pa-border); margin-top: 4px; }
  .pa-tl-item:last-child .pa-tl-line { display: none; }
  .pa-tl-txt   { font-size: 13px; line-height: 1.5; }
  .pa-tl-time  { font-size: 11px; color: var(--pa-text-3); }

  /* Tag chip */
  .pa-tag { display: inline-block; font-size: 11px; background: var(--pa-surface-2); color: var(--pa-text-2); padding: 3px 8px; border-radius: 20px; border: 1px solid var(--pa-border-light); }

  .pa-header-simple {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 28px;
  background: #ffffff;
  border-bottom: 1px solid #e4e8f0;
  position: sticky;
  top: 0;
  z-index: 50;
}

/* Back button */
.pa-header-simple .pa-back-btn {
  padding: 6px 14px;
  font-size: 13px;
  background: #f1f5f9;
  border: 1px solid #e4e8f0;
  border-radius: 8px;
  cursor: pointer;
}

/* CPX badge */
.pa-header-mark {
  width: 30px;
  height: 30px;
  background: #1d4ed8;
  color: #fff;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
}

/* Breadcrumb */
.pa-header-breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.pa-header-breadcrumb span {
  color: #9ca3af;
}

.pa-header-breadcrumb strong {
  color: #111827;
  font-weight: 500;
}

.pa-header-breadcrumb .sep {
  opacity: 0.5;
}

/* Live badge */
.pa-header-live {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #1d4ed8;
  background: #eff6ff;
  padding: 4px 10px;
  border-radius: 20px;
}

.pa-header-live .dot {
  width: 6px;
  height: 6px;
  background: #1d4ed8;
  border-radius: 50%;
  animation: pulse 1.6s infinite;
}

@keyframes pulse {
  0%,100% { opacity: 1; }
  50% { opacity: 0.4; }
}

  /* Responsive */
  @media (max-width: 1100px) {
    .pa-kpi-grid { grid-template-columns: repeat(2,1fr); }
    .pa-row-15, .pa-row-2 { grid-template-columns: 1fr; }
    .pa-row-3 { grid-template-columns: 1fr 1fr; }
    .pa-header-body { flex-direction: column; align-items: flex-start; gap: 16px; }
    .pa-header-stats { justify-content: flex-start; }
  }
  @media (max-width: 700px) {
    .pa-kpi-grid { grid-template-columns: 1fr 1fr; }
    .pa-row-3 { grid-template-columns: 1fr; }
    .pa-content { padding: 16px; }
    .pa-header-body { padding: 14px 16px 16px; }
    .pa-header-top  { padding: 8px 16px; }
    .pa-header-tabs { padding: 0 16px; }
    .pa-header-stats { gap: 6px; }
    .pa-hstat { padding: 7px 12px; min-width: 64px; }
    .pa-hstat-val { font-size: 14px; }
  }
`;

// ─── Types ────────────────────────────────────────────────────────────────────
interface KpiItem   { lbl:string; val:string; delta:string; dir:"up"|"down"; per:string; c1:string; c2:string; }
interface Promo     { name:string; rev:number; roi:number; red:number; status:string; type:string; seg:string; ch:string; sc:number; }
interface ChannelItem { name:string; pct:number; color:string; }
interface SegmentItem { name:string; pct:number; rev:number; color:string; avg:string; rep:string; ltv:string; resp:string; promos:string[]; }
interface TrendPoint  { m:string; r:number; }
interface InsightItem { icon:string; bg:string; tag:string; txt:string; }
interface TimelineItem{ dot:string; txt:string; time:string; }

// ─── Data ─────────────────────────────────────────────────────────────────────
const KPI_DATA: KpiItem[] = [
  { lbl:"Total Promotions", val:"124",    delta:"+12",   dir:"up", per:"vs last quarter", c1:"#3b82f6", c2:"#1d4ed8" },
  { lbl:"Avg ROI",          val:"3.4x",   delta:"+0.6x", dir:"up", per:"vs last quarter", c1:"#22c55e", c2:"#16a34a" },
  { lbl:"Revenue Lifted",   val:"₹48.2L", delta:"+18%",  dir:"up", per:"YoY",             c1:"#8b5cf6", c2:"#7c3aed" },
  { lbl:"Promo Cost Ratio", val:"11.3%",  delta:"-1.2%", dir:"up", per:"lower is better", c1:"#f59e0b", c2:"#b45309" },
];

const PROMOS: Promo[] = [
  { name:"Flat 10% on Smartphones",   rev:22.5, roi:3.9, red:5200, status:"active", type:"discount",  seg:"Mass",    ch:"App",    sc:90 },
  { name:"₹2000 Cashback on Laptops", rev:18.2, roi:3.2, red:3400, status:"active", type:"cashback",  seg:"Premium", ch:"Web",    sc:82 },
  { name:"Buy TV + Soundbar Bundle",  rev:14.7, roi:4.4, red:2100, status:"ended",  type:"bundle",    seg:"HNI",     ch:"Branch", sc:93 },
  { name:"Exchange Offer on Mobiles", rev:19.3, roi:4.8, red:6100, status:"active", type:"exchange",  seg:"Mass",    ch:"App",    sc:95 },
  { name:"No-Cost EMI on Appliances", rev:11.5, roi:2.1, red:1500, status:"paused", type:"financing", seg:"Mass",    ch:"Web",    sc:55 },
  { name:"Loyalty Points on Gadgets", rev:13.6, roi:3.5, red:4800, status:"active", type:"loyalty",   seg:"Premium", ch:"App",    sc:85 },
  { name:"Festive Electronics Sale",  rev:16.8, roi:3.0, red:2900, status:"draft",  type:"seasonal",  seg:"Mass",    ch:"Email",  sc:70 },
];

const CHANNELS: ChannelItem[] = [
  { name:"Mobile App", pct:42, color:"#3b82f6" },
  { name:"Web Portal", pct:28, color:"#8b5cf6" },
  { name:"Branch",     pct:16, color:"#14b8a6" },
  { name:"Email",      pct:9,  color:"#f59e0b" },
  { name:"SMS/IVR",    pct:5,  color:"#ef4444" },
];

const SEGMENTS: SegmentItem[] = [
  { 
    name:"Mass Retail",   
    pct:42, 
    rev:28.5, 
    color:"#3b82f6", 
    avg:"₹18,500",  
    rep:"29%", 
    ltv:"₹65,000",   
    resp:"High",   
    promos:["Festive Discounts","Cashback Offers","Exchange Deals"] 
  },
  { 
    name:"Premium",       
    pct:27, 
    rev:24.2, 
    color:"#8b5cf6", 
    avg:"₹52,000", 
    rep:"41%", 
    ltv:"₹1,85,000",   
    resp:"Medium", 
    promos:["Bundle Offers","Extended Warranty","Upgrade Programs"] 
  },
  { 
    name:"HNI",           
    pct:16, 
    rev:18.7, 
    color:"#14b8a6", 
    avg:"₹1,25,000", 
    rep:"55%", 
    ltv:"₹4,20,000", 
    resp:"Low",    
    promos:["Exclusive Launch Access","Premium Bundles","Concierge Services"] 
  },
  { 
    name:"SME/Corporate", 
    pct:15, 
    rev:14.6,  
    color:"#f59e0b", 
    avg:"₹75,000", 
    rep:"33%", 
    ltv:"₹2,10,000",   
    resp:"Medium", 
    promos:["Bulk Purchase Discounts","Leasing Options","Corporate Deals"] 
  },
];

const TREND: TrendPoint[] = [
  { m:"Aug '25", r:20.5 },
  { m:"Sep '25", r:24.8 },
  { m:"Oct '25", r:27.3 },
  { m:"Nov '25", r:30.1 },
  { m:"Dec '25", r:34.6 },
  { m:"Jan '26", r:29.2 },
  { m:"Feb '26", r:33.8 },
  { m:"Mar '26", r:41.5 },
  { m:"Apr '26", r:48.2 },
];

const HM = {
  days:  ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
  hours: ["6am","9am","12pm","3pm","6pm","9pm"],
  vals: [
    [12,34,67,45,28,15,8],[18,52,88,71,43,22,11],[22,61,95,82,56,31,16],
    [19,48,79,68,41,24,13],[25,58,91,77,49,29,18],[31,72,84,63,38,27,21],
  ],
};

const INSIGHTS: InsightItem[] = [
  {
    icon:"📱",
    bg:"#f0fdf4",
    tag:"Top Performer",
    txt:"Exchange Offer on Mobiles is delivering 4.8x ROI with 6,100 redemptions. This indicates strong upgrade demand. Recommendation: Increase budget allocation by 20% and expand to mid-range smartphone categories."
  },
  {
    icon:"⚠️",
    bg:"#fef2f2",
    tag:"Margin Risk",
    txt:"No-Cost EMI on Appliances is underperforming at 2.1x ROI with high financing cost. Margin leakage risk is high. Recommendation: Restrict EMI eligibility to products above ₹30,000 or introduce partial interest sharing."
  },
  {
    icon:"📺",
    bg:"#eff6ff",
    tag:"Bundle Opportunity",
    txt:"TV + Soundbar bundle shows 4.4x ROI despite lower volume. Customers prefer value bundles in premium electronics. Recommendation: Introduce similar bundles for laptops + accessories and gaming consoles."
  },
  {
    icon:"🛍️",
    bg:"#f5f3ff",
    tag:"Channel Optimization",
    txt:"Mobile App contributes 40%+ of total redemptions with highest conversion rates. Recommendation: Shift 15% of Web campaign budget to App and push app-exclusive flash deals during peak hours."
  },
  {
    icon:"🎯",
    bg:"#fffbeb",
    tag:"Segment Opportunity",
    txt:"SME/Corporate segment shows low engagement in electronics promotions. Recommendation: Launch bulk purchase discounts and B2B device bundles to increase penetration in this segment."
  },
];

const TIMELINE: TimelineItem[] = [
  { dot:"#22c55e", txt:"Festive Sale (Smartphones) crossed 5,200 redemptions", time:"Today, 11:20am" },
  { dot:"#3b82f6", txt:"New Laptop Exchange Offer launched on App channel",     time:"Today, 9:40am" },
  { dot:"#f59e0b", txt:"0% EMI Offer paused due to budget threshold breach",    time:"Yesterday, 5:10pm" },
  { dot:"#8b5cf6", txt:"BOGO Headphones campaign closed — final ROI: 4.3x",      time:"May 03, 11:59pm" },
  { dot:"#ef4444", txt:"High discount override detected in Corporate segment",  time:"May 02, 2:30pm" },
];

// Header quick-stats
const HEADER_STATS = [
  { val:"124",    lbl:"Promotions",  delta:"+12",   dir:"up"  as const },
  { val:"3.4x",   lbl:"Avg ROI",     delta:"+0.6x", dir:"up"  as const },
  { val:"₹48.2L", lbl:"Rev Lifted",  delta:"+18%",  dir:"up"  as const },
  { val:"11.3%",  lbl:"Cost Ratio",  delta:"-1.2%", dir:"up"  as const },
];

// ─── Visuals ──────────────────────────────────────────────────────────────────
function Divider({ icon, label }: { icon:string; label:string }) {
  return (
    <div className="pa-divider">
      <div className="pa-divider-line" />
      <div className="pa-divider-label">{icon}&nbsp; {label}</div>
      <div className="pa-divider-line" />
    </div>
  );
}

function TrendChart({ data }: { data:TrendPoint[] }) {
  const mx = Math.max(...data.map(d => d.r));
  const W=480,H=155,PL=36,PR=12,PT=10,PB=26;
  const iw=W-PL-PR, ih=H-PT-PB;
  const pts = data.map((d,i) => ({ x:PL+(i/(data.length-1))*iw, y:PT+ih-(d.r/mx)*ih, d }));
  const line = pts.map((p,i) => `${i===0?"M":"L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length-1].x.toFixed(1)},${PT+ih} L${pts[0].x.toFixed(1)},${PT+ih} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",overflow:"visible"}}>
      <defs>
        <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#3b82f6" stopOpacity=".14"/>
          <stop offset="100%" stopColor="#3b82f6" stopOpacity=".01"/>
        </linearGradient>
      </defs>
      {[0,.25,.5,.75,1].map((t,i) => (
        <g key={i}>
          <line x1={PL} x2={PL+iw} y1={PT+ih*t} y2={PT+ih*t} stroke="#e4e8f0" strokeWidth=".5"/>
          <text x={PL-4} y={PT+ih*t+4} textAnchor="end" fontSize="9" fill="#9ca3af">{Math.round(mx*(1-t))}L</text>
        </g>
      ))}
      {pts.map((p,i) => (
        <text key={i} x={p.x} y={PT+ih+16} textAnchor="middle" fontSize="9" fill="#9ca3af">{p.d.m}</text>
      ))}
      <path d={area} fill="url(#tg)"/>
      <path d={line}  fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {pts.map((p,i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#fff" stroke="#3b82f6" strokeWidth="2"/>
      ))}
    </svg>
  );
}

function DonutChart({ data }: { data:ChannelItem[] }) {
  const r=50,cx=60,cy=60,circ=2*Math.PI*r;
  let off=0;
  const slices = data.map(d => {
    const dash=(d.pct/100)*circ;
    const s={dash,gap:circ-dash,off,color:d.color}; off+=dash; return s;
  });
  return (
    <div className="pa-donut-wrap">
      <svg className="pa-donut-svg" viewBox="0 0 120 120">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth="18"/>
        {slices.map((s,i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth="18"
            strokeDasharray={`${s.dash} ${s.gap}`} strokeDashoffset={-s.off}
            style={{transform:"rotate(-90deg)",transformOrigin:"60px 60px"}}/>
        ))}
        <text x={cx} y={cy-4} textAnchor="middle" fontSize="9" fill="#9ca3af">Channel</text>
        <text x={cx} y={cy+8} textAnchor="middle" fontSize="9" fill="#9ca3af">Mix</text>
      </svg>
      <div className="pa-donut-legend">
        {data.map((d,i) => (
          <div className="pa-leg-item" key={i}>
            <span className="pa-leg-dot" style={{background:d.color}}/>
            <span className="pa-leg-txt">{d.name}</span>
            <span className="pa-leg-pct">{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Heatmap() {
  const mx = Math.max(...HM.vals.flat());
  const col = (v:number):string => {
    const t=v/mx;
    return t>.8?"#1d4ed8":t>.6?"#3b82f6":t>.4?"#93c5fd":t>.2?"#dbeafe":"#f1f5f9";
  };
  return (
    <div>
      <div className="pa-hm-hdr">{HM.days.map(d=><div className="pa-hm-hlbl" key={d}>{d}</div>)}</div>
      {HM.hours.map((h,hi) => (
        <div className="pa-hm-row" key={h}>
          <span className="pa-hm-rlbl">{h}</span>
          {HM.vals[hi].map((v,di) => (
            <div key={di} className="pa-hm-cell" style={{background:col(v)}}
              title={`${h} ${HM.days[di]}: ${v} redemptions`}/>
          ))}
        </div>
      ))}
      <div style={{display:"flex",alignItems:"center",gap:5,marginTop:10,justifyContent:"flex-end"}}>
        <span style={{fontSize:10,color:"#9ca3af"}}>Low</span>
        {["#f1f5f9","#dbeafe","#93c5fd","#3b82f6","#1d4ed8"].map((c,i)=>(
          <div key={i} style={{width:14,height:14,background:c,borderRadius:3}}/>
        ))}
        <span style={{fontSize:10,color:"#9ca3af"}}>High</span>
      </div>
    </div>
  );
}

function ScoreRing({ score, color }: { score:number; color:string }) {
  const r=42, circ=2*Math.PI*r;
  return (
    <div className="pa-ring">
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e4e8f0" strokeWidth="10"/>
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${(score/100)*circ} ${circ-(score/100)*circ}`}
          strokeLinecap="round"
          style={{transform:"rotate(-90deg)",transformOrigin:"50px 50px"}}/>
      </svg>
      <div className="pa-ring-ctr">
        <span className="pa-ring-num" style={{color}}>{score}</span>
        <span className="pa-ring-max">/100</span>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function PromotionAnalyticsDashboard() {
  const [statFil, setStatFil] = useState<string>("all");
  const [chFil,   setChFil]   = useState<string>("all");
  const [typFil,  setTypFil]  = useState<string>("all");
  const navigate = useNavigate();

  const filtered = PROMOS.filter(p => {
    if (statFil !== "all" && p.status !== statFil) return false;
    if (chFil   !== "all" && p.ch     !== chFil)   return false;
    if (typFil  !== "all" && p.type   !== typFil)  return false;
    return true;
  });

  const best      = PROMOS.find(p => p.sc === 95);
  const worst     = PROMOS.find(p => p.sc === 52);
  const maxSegRev = Math.max(...SEGMENTS.map(s => s.rev));

  return (
    <>
      <style>{CSS}</style>
      <div className="pa-root">
        <div className="pa-layout">
          <main className="pa-main">

            {/* ══════════════════════════════════════════
                HEADER
            ══════════════════════════════════════════ */}
<header className="pa-header-simple">
  <button
    className="pa-back-btn"
    onClick={() => navigate('/modules', { state: { scrollToModule: 'commercial' } })}
  >
    ← Back
  </button>

  <div className="pa-header-mark">CPX</div>

  <div className="pa-header-breadcrumb">
    <span>Customer Pricing</span>
    <span className="sep">›</span>
    <span>Excellence</span>
    <span className="sep">›</span>
    <strong>Promotion Analytics</strong>
  </div>

  <div className="pa-header-live">
    <span className="dot"></span>
    LIVE
  </div>
</header>
            {/* ══ END HEADER ══ */}

            {/* ══ PAGE CONTENT ══ */}
            <div className="pa-content">

              {/* 1 · KPIs */}
              <Divider icon="📊" label="Key Performance Indicators" />
              <div className="pa-kpi-grid">
                {KPI_DATA.map((k, i) => (
                  <div className="pa-kpi-card" key={i}>
                    <div className="pa-kpi-lbl">{k.lbl}</div>
                    <div className="pa-kpi-val">{k.val}</div>
                    <div className="pa-kpi-meta">
                      <span className={`pa-delta ${k.dir}`}>{k.dir==="up"?"▲":"▼"} {k.delta}</span>
                      <span className="pa-kpi-per">{k.per}</span>
                    </div>
                    <div className="pa-kpi-acc" style={{background:`linear-gradient(90deg,${k.c1},${k.c2})`}}/>
                  </div>
                ))}
              </div>

              {/* 2 · Revenue + Channel */}
              <Divider icon="📈" label="Revenue & Channel Overview" />
              <div className="pa-row-15">
                <div className="pa-card">
                  <div className="pa-card-hdr">
                    <div>
                      <div className="pa-card-ttl">Revenue Lift Trend</div>
                      <div className="pa-card-sub">Monthly promotion-attributed revenue (₹ Lakh)</div>
                    </div>
                  </div>
                  <TrendChart data={TREND}/>
                </div>
                <div className="pa-card">
                  <div className="pa-card-hdr">
                    <div>
                      <div className="pa-card-ttl">Channel Distribution</div>
                      <div className="pa-card-sub">By redemption volume</div>
                    </div>
                  </div>
                  <DonutChart data={CHANNELS}/>
                </div>
              </div>

              {/* 3 · Promotion table */}
              <Divider icon="🗂️" label="Promotion Performance" />
              <div className="pa-card" style={{marginBottom:22}}>
                <div className="pa-card-hdr">
                  <div>
                    <div className="pa-card-ttl">All Promotions</div>
                    <div className="pa-card-sub">{filtered.length} promotions matched</div>
                  </div>
                </div>
                <div className="pa-filter-bar">
                  <span className="pa-flbl">Status:</span>
                  {["all","active","ended","paused","draft"].map(s => (
                    <div key={s} className={`pa-chip${statFil===s?" active":""}`} onClick={() => setStatFil(s)}>
                      {s==="all"?"All":s.charAt(0).toUpperCase()+s.slice(1)}
                    </div>
                  ))}
                  <span className="pa-flbl" style={{marginLeft:8}}>Channel:</span>
                  <select className="pa-fsel" value={chFil} onChange={e => setChFil(e.target.value)}>
                    <option value="all">All Channels</option>
                    {["App","Web","Branch","Email","SMS/IVR"].map(c => <option key={c}>{c}</option>)}
                  </select>
                  <span className="pa-flbl">Type:</span>
                  <select className="pa-fsel" value={typFil} onChange={e => setTypFil(e.target.value)}>
                    <option value="all">All Types</option>
                    {["discount","cashback","bundle","exchange","financing","loyalty","seasonal"].map(t => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="pa-tbl-wrap">
                  <table className="pa-tbl">
                    <thead>
                      <tr>
                        <th>Promotion</th><th>Type</th><th>Segment</th><th>Channel</th>
                        <th>Revenue (₹L)</th><th>ROI</th><th>Redemptions</th><th>Health</th><th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((p, i) => (
                        <tr key={i}>
                          <td style={{fontWeight:500}}>{p.name}</td>
                          <td style={{textTransform:"capitalize",color:"#6b7280"}}>{p.type}</td>
                          <td>{p.seg}</td>
                          <td>{p.ch}</td>
                          <td style={{fontFamily:"var(--pa-mono)"}}>{p.rev.toFixed(1)}</td>
                          <td>
                            <span style={{fontFamily:"var(--pa-mono)",fontWeight:600,
                              color:p.roi>=4?"#16a34a":p.roi>=2.5?"#1d4ed8":"#dc2626"}}>
                              {p.roi.toFixed(1)}x
                            </span>
                          </td>
                          <td style={{fontFamily:"var(--pa-mono)"}}>{p.red.toLocaleString()}</td>
                          <td>
                            <div style={{display:"flex",alignItems:"center",gap:7}}>
                              <div style={{flex:1,height:5,background:"#e4e8f0",borderRadius:3,minWidth:50}}>
                                <div style={{height:"100%",borderRadius:3,width:`${p.sc}%`,
                                  background:p.sc>=80?"#22c55e":p.sc>=60?"#3b82f6":"#f59e0b"}}/>
                              </div>
                              <span style={{fontSize:11,fontFamily:"var(--pa-mono)",color:"#6b7280",minWidth:22}}>{p.sc}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`pa-pill ${p.status}`}>
                              {p.status==="active"?"● ":p.status==="draft"?"○ ":"✕ "}{p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4 · Heatmap + Health */}
              <Divider icon="🔥" label="Redemption Patterns & Health Scores" />
              <div className="pa-row-2">
                <div className="pa-card">
                  <div className="pa-card-hdr">
                    <div>
                      <div className="pa-card-ttl">Redemption Heatmap</div>
                      <div className="pa-card-sub">By day &amp; hour — all active promotions</div>
                    </div>
                  </div>
                  <Heatmap/>
                </div>
                <div className="pa-card">
                  <div className="pa-card-hdr">
                    <div>
                      <div className="pa-card-ttl">Promotion Health Scores</div>
                      <div className="pa-card-sub">Composite: ROI × reach × margin efficiency</div>
                    </div>
                  </div>
                  {PROMOS.filter(p => p.status !== "draft").map((p, i) => (
                    <div className="pa-prog" key={i}>
                      <div className="pa-prog-info">
                        <div className="pa-prog-nm">{p.name}</div>
                        <div className="pa-prog-sub">{p.ch} · {p.seg}</div>
                      </div>
                      <div className="pa-prog-bar">
                        <div className="pa-prog-track">
                          <div className="pa-prog-fill" style={{width:`${p.sc}%`,
                            background:p.sc>=80?"#22c55e":p.sc>=60?"#3b82f6":"#f59e0b"}}/>
                        </div>
                      </div>
                      <div className="pa-prog-num">{p.sc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5 · AI Insights + Timeline */}
              <Divider icon="🤖" label="AI Insights & Activity" />
              <div className="pa-row-2">
                <div className="pa-card">
                  <div className="pa-card-hdr">
                    <div>
                      <div className="pa-card-ttl">AI-Generated Recommendations</div>
                      <div className="pa-card-sub">Auto-refreshed every 6 hours from live data</div>
                    </div>
                  </div>
                  {INSIGHTS.map((ins, i) => (
                    <div className="pa-insight" key={i}>
                      <div className="pa-ins-icon" style={{background:ins.bg}}>{ins.icon}</div>
                      <div>
                        <div className="pa-ins-tag">{ins.tag}</div>
                        <div className="pa-ins-txt">{ins.txt}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pa-card">
                  <div className="pa-card-hdr">
                    <div>
                      <div className="pa-card-ttl">Activity Timeline</div>
                      <div className="pa-card-sub">Recent promotion events &amp; system alerts</div>
                    </div>
                  </div>
                  <div style={{marginTop:6}}>
                    {TIMELINE.map((t, i) => (
                      <div className="pa-tl-item" key={i}>
                        <div className="pa-tl-left">
                          <div className="pa-tl-dot" style={{background:t.dot}}/>
                          <div className="pa-tl-line"/>
                        </div>
                        <div>
                          <div className="pa-tl-txt">{t.txt}</div>
                          <div className="pa-tl-time">{t.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 6 · Score rings */}
              <Divider icon="🎯" label="Top vs Bottom Performer" />
              <div className="pa-row-3" style={{marginBottom:22}}>
                {[
                  { lbl:"Top Performer",    p:best,  sc:best?.sc ?? 0,  color:"#22c55e" },
                  { lbl:"Portfolio Average",p:{name:"Portfolio Average",ch:"All Channels"}, sc:78, color:"#3b82f6" },
                  { lbl:"Needs Attention",  p:worst, sc:worst?.sc ?? 0, color:"#f59e0b" },
                ].map((item, i) => (
                  <div className="pa-card" key={i} style={{textAlign:"center"}}>
                    <div className="pa-kpi-lbl" style={{textAlign:"center"}}>{item.lbl}</div>
                    <div className="pa-ring-wrap"><ScoreRing score={item.sc} color={item.color}/></div>
                    <div style={{fontSize:13,fontWeight:500,marginTop:8}}>{item.p?.name}</div>
                    <div style={{fontSize:11,color:"#9ca3af",marginTop:3}}>{item.p?.ch}</div>
                  </div>
                ))}
              </div>

              {/* 7 · Segment table */}
              <Divider icon="👥" label="Customer Segment Intelligence" />
              <div className="pa-card" style={{marginBottom:22}}>
                <div className="pa-card-hdr">
                  <div>
                    <div className="pa-card-ttl">Segment Breakdown &amp; Recommended Promotion Mix</div>
                    <div className="pa-card-sub">Responsiveness, LTV &amp; promo fit by customer segment</div>
                  </div>
                </div>
                <div className="pa-tbl-wrap">
                  <table className="pa-tbl">
                    <thead>
                      <tr>
                        <th>Segment</th><th>Avg Order</th><th>Repeat Rate</th><th>LTV</th>
                        <th>Responsiveness</th><th>Revenue Share</th><th>Recommended Promos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SEGMENTS.map((s, i) => (
                        <tr key={i}>
                          <td>
                            <div style={{display:"flex",alignItems:"center",gap:8}}>
                              <div style={{width:8,height:8,borderRadius:"50%",background:s.color,flexShrink:0}}/>
                              <span style={{fontWeight:500}}>{s.name}</span>
                            </div>
                          </td>
                          <td style={{fontFamily:"var(--pa-mono)"}}>{s.avg}</td>
                          <td style={{fontFamily:"var(--pa-mono)"}}>{s.rep}</td>
                          <td style={{fontFamily:"var(--pa-mono)"}}>{s.ltv}</td>
                          <td><span className={`pa-pill ${s.resp.toLowerCase()}`}>{s.resp}</span></td>
                          <td>
                            <div style={{display:"flex",alignItems:"center",gap:8}}>
                              <div style={{flex:1,height:6,background:"#e4e8f0",borderRadius:3}}>
                                <div style={{height:"100%",borderRadius:3,background:s.color,width:`${s.pct}%`}}/>
                              </div>
                              <span style={{fontSize:11,fontFamily:"var(--pa-mono)",color:"#6b7280"}}>{s.pct}%</span>
                            </div>
                          </td>
                          <td>
                            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                              {s.promos.map((pr, j) => <span className="pa-tag" key={j}>{pr}</span>)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 8 · Revenue bars */}
              <div className="pa-row-2">
                <div className="pa-card">
                  <div className="pa-card-hdr">
                    <div>
                      <div className="pa-card-ttl">Revenue by Segment</div>
                      <div className="pa-card-sub">Promo-attributed revenue this quarter</div>
                    </div>
                  </div>
                  <div className="pa-bars" style={{marginTop:4}}>
                    {SEGMENTS.map((s, i) => (
                      <div className="pa-bar-row" key={i}>
                        <div className="pa-bar-top">
                          <span className="pa-bar-nm">{s.name}</span>
                          <span className="pa-bar-vl">₹{s.rev}L</span>
                        </div>
                        <div className="pa-bar-track">
                          <div className="pa-bar-fill" style={{width:`${(s.rev/maxSegRev)*100}%`,background:s.color}}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pa-card">
                  <div className="pa-card-hdr">
                    <div>
                      <div className="pa-card-ttl">Revenue by Channel</div>
                      <div className="pa-card-sub">Promo-attributed revenue by distribution channel</div>
                    </div>
                  </div>
                  <div className="pa-bars" style={{marginTop:4}}>
                    {CHANNELS.map((c, i) => (
                      <div className="pa-bar-row" key={i}>
                        <div className="pa-bar-top">
                          <span className="pa-bar-nm">{c.name}</span>
                          <span className="pa-bar-vl">{c.pct}%</span>
                        </div>
                        <div className="pa-bar-track">
                          <div className="pa-bar-fill" style={{width:`${c.pct}%`,background:c.color}}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>{/* /pa-content */}
          </main>
        </div>
      </div>
    </>
  );
}