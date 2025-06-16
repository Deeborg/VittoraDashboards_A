// Forex.tsx
import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import LineChart from './Forex_linechart';
import MultiLineChart from './Forex_multilinechart';
import KPICard from './Forex_kpi';
import DonutChart from './Forex_donutchart';
import SummaryTable from './Forex_Summarytable';
import DateFilter from './Forex_datefilter';

interface ForexData {
  Date: Date;
  'Actual Price': number;
  'Forecast Price': number;
  'Purchases': number;
  'Sales': number;
  'Sum(Purchases)': number;
  'Sum(Sales)': number;
  'Purchase Hedge Benefit': number;
  'Purchase Unhedged Cost': number;
  'Sales Hedge Benefit':number;
  'Sales Unhedged Cost':number;
  'Hedge Purchases':string;
  'Hedge Sales':string;
  'Purchase Hedge Outcome': string;
  'Sales Hedge Outcome': string;
  'Future Purchase Price': number;
  'Purchase Forward Rate': number;
  'Future Sales Price': number;
  'Sales Forward Rate': number;
  'Lower CI': number;
  'Upper CI': number;
  'Payment Date': Date;
  'Purchase Expiry':string;
  'Receipt Date': Date;
  'Sales Expiry':string;
  [key: string]: any;
}

const Forex: React.FC = () => {
  const [data, setData] = useState<ForexData[]>([]);
  const [filteredData, setFilteredData] = useState<ForexData[]>([]);
  const [dateRange, setDateRange] = useState<[Date, Date]>([new Date(), new Date()]);
  const [minDate, setMinDate] = useState<Date>(new Date());
  const [maxDate, setMaxDate] = useState<Date>(new Date());
  const [sliderRange, setSliderRange] = useState<[number, number]>([0, 100]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/forex.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);

        const parsed = jsonData.map(row => {
          const rawDate = row.Date;
          let date: Date | null = null;

          if (rawDate instanceof Date) {
            date = rawDate;
          } else if (typeof rawDate === 'number') {
            const parsedDate = XLSX.SSF.parse_date_code(rawDate);
            date = parsedDate ? new Date(parsedDate.y, parsedDate.m - 1, parsedDate.d) : null;
          } else if (typeof rawDate === 'string') {
            date = new Date(rawDate);
          }

          return {
            ...row,
            Date: date && !isNaN(date.getTime()) ? date : null,
            'Actual Price': row['Actual Price'] || row['Actual'] || row['Price'] || 0,
            'Forecast Price': row['Forecast Price'] || row['Forecast'] || 0,
          };
        }).filter(row => row.Date !== null) as ForexData[];

        const dates = parsed.map(r => r.Date!.getTime());
        const minD = new Date(Math.min(...dates));
        const maxD = new Date(Math.max(...dates));

        setData(parsed);
        setFilteredData(parsed);
        setMinDate(minD);
        setMaxDate(maxD);
        setDateRange([minD, maxD]);
        setSliderRange([0, 100]);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (dateRange[0] && dateRange[1]) {
      const filtered = data.filter(row =>
        row.Date &&
        row.Date >= dateRange[0] &&
        row.Date <= dateRange[1]
      );
      setFilteredData(filtered);
    }
  }, [dateRange, data]);

  const handleSliderChange = (values: [number, number]) => {
    setSliderRange(values);
    const totalTime = maxDate.getTime() - minDate.getTime();
    const startDate = new Date(minDate.getTime() + (totalTime * values[0] / 100));
    const endDate = new Date(minDate.getTime() + (totalTime * values[1] / 100));
    setDateRange([startDate, endDate]);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
  };

  const calculateKPIs = () => {
  const distinctPurchases = new Set(filteredData.map(d => d['Purchases']).filter(val => typeof val === 'number' && !isNaN(val))).size;
  const totalPurchases = +(filteredData.reduce((sum, d) => sum + (d['Purchases'] || 0), 0) / 1_000_000).toFixed(2);
  const hedgeBenefit = +(filteredData.reduce((sum, d) => sum + (d['Purchase Hedge Benefit'] || 0), 0) / 1_000_000).toFixed(2);
  const unhedgedCost = +(filteredData.reduce((sum, d) => sum + (d['Purchase Unhedged Cost'] || 0), 0) / 1_000_000).toFixed(2);
  const savings = +(hedgeBenefit - unhedgedCost).toFixed(2);

  const distinctSales = new Set(filteredData.map(d => d['Sales']).filter(val => typeof val === 'number' && !isNaN(val))).size;
  const totalSales = +(filteredData.reduce((sum, d) => sum + (d['Sales'] || 0), 0) / 1_000_000).toFixed(2);
  const salesHedgeBenefit = +(filteredData.reduce((sum, d) => sum + (d['Sales Hedge Benefit'] || 0), 0) / 1_000_000).toFixed(2);
  const salesUnhedgedCost = +(filteredData.reduce((sum, d) => sum + (d['Sales Unhedged Cost'] || 0), 0) / 1_000_000).toFixed(2);
  const salesSavings = +(salesHedgeBenefit - salesUnhedgedCost).toFixed(2);


    return {
      distinctPurchases,
      totalPurchases,
      hedgeBenefit,
      unhedgedCost,
      savings,
      distinctSales,
    totalSales,
    salesHedgeBenefit,
    salesUnhedgedCost,
    salesSavings
    };
  };

  const kpis = calculateKPIs();

  
  return (
    <div className="forex-container">
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          padding: "24px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          margin: "32px auto 24px auto",
          // maxWidth: 900,
          width: "100%",
          boxSizing: "border-box"
        }}
      >
        <h2 style={{ margin: 0, fontWeight: 700, fontSize: "2rem", color: "#1a237e", textAlign: "center", flex: 1 }}>
          Forex & Risk Management
        </h2>
        <img
          src="./asset/vittora_grey.png"
          alt="Vittora Logo"
          style={{ height: 48 }}
        />
      </div>
      <DateFilter
  minDate={minDate}
  maxDate={maxDate}
  dateRange={dateRange}
  sliderRange={sliderRange}
  handleSliderChange={handleSliderChange}
  formatDate={formatDate}
/>

{filteredData.length > 0 && (
  <>
    <div style={{ flex: 2, minWidth: '500px', cursor: 'pointer' }}>
      <LineChart data={filteredData} />
    </div>

    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: '500px', cursor: 'pointer' }}>
        <MultiLineChart
          data={filteredData}
          title="Purchases vs Payments"
          fields={[
            { label: 'Purchases', color: '#4bc0c0' },
            { label: 'Sum(Purchases)', color: '#9966ff' },
          ]}
        />

        {/* KPI Cards Section placed only under Purchases vs Payments */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          marginTop: '20px',
        }}>
          <KPICard title="Count of Purchases" value={kpis.distinctPurchases} color="#2563eb" />
          <KPICard title="Purchases (USD)" value={kpis.totalPurchases.toLocaleString() + 'M'} color="#059669" />
          <KPICard title="Purchase Hedge Benefit (INR)" value={kpis.hedgeBenefit.toLocaleString() + 'M'} color="#d97706" />
          <KPICard title="Purchase Unhedged Cost (INR)" value={kpis.unhedgedCost.toLocaleString() + 'M'} color="#dc2626" />
          <KPICard title="Savings on Purchase Hedge (INR)" value={kpis.savings.toLocaleString() + 'M'} color="#7c3aed" />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: '20px' }}>
  <div style={{ flex: 1, display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
    <DonutChart
      title="Purchases Hedge(Yes/No)"
      data={{
        Hedged: filteredData.filter(d => d['Hedge Purchases'] === 'Yes').length,
        Unhedged: filteredData.filter(d => d['Hedge Purchases'] === 'No').length,
      }}
    />
    <DonutChart
      title="Purchases Hedge Outcome"
      data={{
        Good: filteredData.filter(d => d['Purchase Hedge Outcome'] === 'Good').length,
        Bad: filteredData.filter(d => d['Purchase Hedge Outcome'] === 'Bad').length,
      }}
    />
  </div>
</div>

      </div>
      <div style={{ flex: 1, minWidth: '300px', cursor: 'pointer' }}>
  <MultiLineChart
    data={filteredData}
    title="Sales vs Receipts"
    fields={[
      { label: 'Sales', color: '#ff9f40' },
      { label: 'Sum(Sales)', color: '#36a2eb' },
    ]}
  />

  {/* KPI Cards Section under Sales vs Receipts */}
  <div style={{
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: '25px'
  }}>
    <KPICard title="Count of Sales" value={kpis.distinctSales} color="#0ea5e9" />
    <KPICard title="Sales (USD)" value={kpis.totalSales.toLocaleString() + 'M'} color="#14b8a6" />
    <KPICard title="Sales Hedge Benefit (INR)" value={kpis.salesHedgeBenefit.toLocaleString() + 'M'} color="#facc15" />
    <KPICard title="Sales Unhedged Cost (INR)" value={kpis.salesUnhedgedCost.toLocaleString() + 'M'} color="#ef4444" />
    <KPICard title="Savings on Sales Hedge (INR)" value={kpis.salesSavings.toLocaleString() + 'M'} color="#8b5cf6" />
  </div>
   <div style={{ flex: 1, display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' ,marginTop: '35px'}}>
    <DonutChart
      title="Sales Hedged(Yes/No)"
      data={{
        Hedged: filteredData.filter(d => d['Hedge Sales'] === 'Yes').length,
        Unhedged: filteredData.filter(d => d['Hedge Sales'] === 'No').length,
      }}
    />
    <DonutChart
      title="Sales Hedge Outcome"
      data={{
        Good: filteredData.filter(d => d['Sales Hedge Outcome'] === 'Good').length,
        Bad: filteredData.filter(d => d['Sales Hedge Outcome'] === 'Bad').length,
      }}
    />
  </div>
</div>
<SummaryTable
  data={filteredData.slice()
    .sort((a, b) => (a.Date?.getTime() || 0) - (b.Date?.getTime() || 0))
    .map(row => ({
      Date: row.Date?.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }) || '',

      'Forecast Price': row['Forecast Price'] ? Number(row['Forecast Price']).toFixed(2) : '0',
      'Forecast Price on Payment date': row['Future Purchase Price'] ? Number(row['Future Purchase Price']).toFixed(2) : '0',
      'Purchase Forward Rate': row['Purchase Forward Rate'] ? Number(row['Purchase Forward Rate']).toFixed(2) : '0',
      'Hedge Purchases': row['Hedge Purchases'] || 'No',
      'Forecast Price on Receipt date': row['Future Sales Price'] ? Number(row['Future Sales Price']).toFixed(2) : '0',
      'Sales Forward Rate': row['Sales Forward Rate'] ? Number(row['Sales Forward Rate']).toFixed(2) : '0',
      'Hedge Sales': row['Hedge Sales'] || 'No',
    }))}
/>
<SummaryTable
  data={filteredData.slice()
    .sort((a, b) => (a.Date?.getTime() || 0) - (b.Date?.getTime() || 0))
    .map(row => ({
      Date: row.Date?.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }) || '',

      'Actual Price': row['Actual Price'] ? Number(row['Actual Price']).toFixed(2) : '0',
      'Forecast Price': row['Forecast Price'] ? Number(row['Forecast Price']).toFixed(2) : '0',
      'Lower CI': row['Lower CI'] ? Number(row['Lower CI']).toFixed(2) : '0',
      'Upper CI': row['Upper CI'] ? Number(row['Upper CI']).toFixed(2) : '0',
      'Purchases': row['Purchases'] ? Number(row['Purchases']).toFixed(2) : '0',
      'Payment Date': row['Payment Date'] ? new Date(row['Payment Date']).toLocaleDateString('en-GB') : '',
      'Forecast Price on Payment date': row['Future Purchase Price'] ? Number(row['Future Purchase Price']).toFixed(2) : '0',
      'Purchase Forward Rate': row['Purchase Forward Rate'] ? Number(row['Purchase Forward Rate']).toFixed(2) : '0',
      'Hedge Purchases': row['Hedge Purchases'] || 'No',
      'Purchase Expiry': row['Purchase Expiry'] || '',
      'Sales': row['Sales'] ? Number(row['Sales']).toFixed(2) : '0',
      'Receipt Date': row['Receipt Date'] ? new Date(row['Receipt Date']).toLocaleDateString('en-GB') : '',
      'Forecast Price on date of Receipt': row['Future Sales Price'] ? Number(row['Future Sales Price']).toFixed(2) : '0',
      'Sales Forward Rate': row['Sales Forward Rate'] ? Number(row['Sales Forward Rate']).toFixed(2) : '0',
      'Hedge Sales': row['Hedge Sales'] || 'No',
      'Sales Expiry': row['Sales Expiry'] || '',
    }))}
/>


    </div>
    
  </>
)}
</div>
  );
};

export default Forex;
