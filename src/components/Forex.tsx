import React, { useEffect, useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Box, Paper, Typography, Tabs, Tab, Stack, Divider } from '@mui/material';
import LineChart from './Forex_linechart';
import MultiLineChart from './Forex_multilinechart';
import KPICard from './Forex_kpi';
import DonutChart from './Forex_donutchart';
import SummaryTable from './Forex_Summarytable';
import DateFilter from './Forex_datefilter';

// Interface matching your EXACT Excel columns
interface ForexData {
  Date: Date;
  'Actual Price': number;
  'Forecast Price': number;
  'Lower CI': number;       // Fix for LineChart error
  'Upper CI': number;       // Fix for LineChart error
  'Purchases': number;
  'Sales': number;
  'Hedge Purchases': string;
  'Hedge Sales': string;
  'Purchase Forward Rate': number;
  'Sales Forward Rate': number;
  'Purchase Hedge Benefit': number;
  'Purchase Unhedged Cost': number;
  'Sales Hedge Benefit': number;
  'Sales Unhedged Cost': number;
  'Purchase Hedge Outcome': string;
  'Sales Hedge Outcome': string;
  'Purchase Decision': string; // Fix for Index error
  'Sales Decision': string;
  'Purchase Expiry': string;
  'Sales Expiry': string;
  'Future Purchase Price': number;
  'Future Sales Price': number;
  'Sum(Purchases)': number;
  'Sum(Sales)': number;
  // Internal logic keys
  mtmValue: number;
  tenorDays: number;
}

const Forex: React.FC = () => {
  const [data, setData] = useState<ForexData[]>([]);
  const [filteredData, setFilteredData] = useState<ForexData[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState<[Date, Date]>([new Date(), new Date()]);
  const [minDate, setMinDate] = useState<Date>(new Date());
  const [maxDate, setMaxDate] = useState<Date>(new Date());
  const [sliderRange, setSliderRange] = useState<[number, number]>([0, 100]);

  const formatValue = (val: number) => {
    const absVal = Math.abs(val);
    if (absVal >= 10000000) return (val / 10000000).toFixed(2) + ' Cr';
    if (absVal >= 100000) return (val / 100000).toFixed(2) + ' L';
    return val.toLocaleString('en-IN');
  };

  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/forex.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);

        const parsed = jsonData.map(row => {
  const date = typeof row.Date === 'number' ? 
    new Date((row.Date - 25569) * 86400 * 1000) : new Date(row.Date);
  const actual = Number(row['Actual Price']) || 0;
  const pForward = Number(row['Purchase Forward Rate']) || 0;
  const sForward = Number(row['Sales Forward Rate']) || 0;
  const pVolume = Number(row['Purchases']) || 0;
  const sVolume = Number(row['Sales']) || 0;

  // MTM Logic:
  // If we buy: Gain if Forward < Actual (we locked a low price)
  // If we sell: Gain if Forward > Actual (we locked a high price)
  const pMTM = (actual - pForward) * pVolume; 
  const sMTM = (sForward - actual) * sVolume;

  const expDate = new Date(row['Sales Expiry'] || row['Purchase Expiry'] || new Date());
  const tenor = Math.ceil((expDate.getTime() - date.getTime()) / (1000 * 3600 * 24));


          return {
    ...row,
    Date: date,
    // Ensure numeric defaults so charts don't crash
    'Lower CI': row['Lower CI'] || 0,
    'Upper CI': row['Upper CI'] || 0,
    'Actual Price': actual,
    'Purchase Forward Rate': pForward,
    'Sales Forward Rate': sForward,
    'Forecast Price': row['Forecast Price'] || 0,
    'Purchase Decision': row['Purchase Decision'] || 'No Decision',
    mtmValue: pMTM + sMTM, // Total Unrealized Gain/Loss
    tenorDays: tenor > 0 ? tenor : 0
  };
}).filter(d => !isNaN(d.Date.getTime())) as ForexData[];

        setData(parsed);
        setFilteredData(parsed);
        const times = parsed.map(d => d.Date.getTime());
        setMinDate(new Date(Math.min(...times)));
        setMaxDate(new Date(Math.max(...times)));
        setDateRange([new Date(Math.min(...times)), new Date(Math.max(...times))]);
      } catch (e) { console.error("Data error", e); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = data.filter(row => row.Date >= dateRange[0] && row.Date <= dateRange[1]);
    setFilteredData(filtered);
  }, [dateRange, data]);

  const stats = useMemo(() => {
    const totalMTM = filteredData.reduce((s, d) => s + d.mtmValue, 0);
    const realizedCount = filteredData.filter(d => d['Sales Hedge Outcome'] === 'Good').length;
    const unrealizedCount = filteredData.filter(d => d['Sales Hedge Outcome'] !== 'Good').length;
    const hedgedExposure = filteredData.filter(d => d['Hedge Purchases'] === 'Yes').length;
    const totalSales = filteredData.reduce((s, d) => s + (d.Sales || 0), 0);
    const totalPurchases = filteredData.reduce((s, d) => s + (d.Purchases || 0), 0);
    const pSavings = filteredData.reduce((s, d) => s + (d['Purchase Hedge Benefit'] || 0) - (d['Purchase Unhedged Cost'] || 0), 0);
    const sSavings = filteredData.reduce((s, d) => s + (d['Sales Hedge Benefit'] || 0) - (d['Sales Unhedged Cost'] || 0), 0);

    return { totalMTM, realizedCount, unrealizedCount, hedgedExposure,totalSales, 
      totalPurchases, 
      netSavings: pSavings + sSavings };
  }, [filteredData]);

  const handleSliderChange = (values: [number, number]) => {
    setSliderRange(values);
    const totalTime = maxDate.getTime() - minDate.getTime();
    setDateRange([
        new Date(minDate.getTime() + (totalTime * values[0] / 100)),
        new Date(minDate.getTime() + (totalTime * values[1] / 100))
    ]);
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#f4f7f9', minHeight: '100vh' }}>
      {/* PROFESSIONAL HEADER */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #eef2f6' }}>
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a237e', letterSpacing: '-0.5px' }}>Forex & Risk Management</Typography>
            <Typography variant="body2" color="text.secondary"></Typography>
        </Box>
        <img src="./asset/vittora_grey.png" alt="Logo" style={{ height: 40 }} />
      </Paper>

      {/* FILTER STACK */}
      <Box sx={{ mb: 4 }}>
        <DateFilter minDate={minDate} maxDate={maxDate} dateRange={dateRange} sliderRange={sliderRange} handleSliderChange={handleSliderChange} formatDate={d => d.toLocaleDateString()} />
      </Box>

      {/* NAVIGATION TABS */}
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3, bgcolor: '#fff', borderRadius: '8px', p: 0.5 }}>
        <Tab label="Receivables & realization" sx={{ fontWeight: 'bold' }} />
        <Tab label="Hedging & MTM Performance" sx={{ fontWeight: 'bold' }} />
        <Tab label="Payables & Liabilities" sx={{ fontWeight: 'bold' }} />
      </Tabs>

      {/* TAB 1: RECEIVABLES (REQ 11.1 / 11.3) */}
      {activeTab === 0 && (
        <Stack spacing={3}>
           <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: '200px' }}><KPICard title="Realized Exports" value={stats.realizedCount} color="#2e7d32" /></Box>
              <Box sx={{ flex: 1, minWidth: '200px' }}><KPICard title="Unrealized Bills" value={stats.unrealizedCount} color="#d32f2f" /></Box>
              <Box sx={{ flex: 1, minWidth: '200px' }}><KPICard title="Open Sales Orders" value={filteredData.length} color="#ed6c02" /></Box>
           </Box>
           
           <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
              <Paper sx={{ flex: 2, p: 2, borderRadius: '12px' }}><LineChart data={filteredData} /></Paper>
              <Paper sx={{ flex: 1, p: 2, borderRadius: '12px' }}>
                <DonutChart title="Hedge Outcome Status" data={{ Good: stats.realizedCount, Bad: stats.unrealizedCount }} />
              </Paper>
           </Box>

           <SummaryTable data={filteredData.map(d => ({
              Date: d.Date.toLocaleDateString(),
              'Invoice Amt': d.Sales.toLocaleString(),
              'Outcome': d['Sales Hedge Outcome'],
              'Receipt Target': d['Sales Expiry']
           }))} />
        </Stack>
      )}

      {/* TAB 2: HEDGING DASHBOARD (REQ 11.2) */}
      {activeTab === 1 && (
        <Stack spacing={3}>
           <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: '250px' }}><KPICard title="MTM Gain/Loss" value={`₹ ${formatValue(stats.totalMTM)}`} color={stats.totalMTM >=0 ? 'green' : 'red'} /></Box>
              <Box sx={{ flex: 1, minWidth: '250px' }}><KPICard title="Hedged Contracts" value={stats.hedgedExposure} color="#673ab7" /></Box>
              <Box sx={{ flex: 1, minWidth: '250px' }}><KPICard title="Portfolio Tenor (Avg Days)" value={(filteredData.reduce((s,d)=>s+d.tenorDays,0)/filteredData.length).toFixed(0)} color="#009688" /></Box>
           </Box>

           <Paper sx={{ p: 3, borderRadius: '12px' }}>
              <Typography variant="h6" gutterBottom>Exposure by Forecast vs Forward Rate</Typography>
              <MultiLineChart title="Forecast vs Forward Rates"
           data={filteredData} 
           fields={[
             { label: 'Forecast Price', color: '#ffa726' },
             { label: 'Purchase Forward Rate', color: '#f44336' },
             { label: 'Sales Forward Rate', color: '#4caf50' },
             { label: 'Actual Price', color: '#1a237e' }
           ]} 
         />
           </Paper>
        </Stack>
      )}

      {/* TAB 3: PAYABLES & LIABILITIES (REQ 11.4 / 11.5) */}
      {activeTab === 2 && (
        <Stack spacing={3}>
           <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: '250px' }}><KPICard title="Import Repayment Due" value={`₹ ${formatValue(filteredData.reduce((s, d) => s + (d.Purchases || 0), 0))}`} 
 color="#1a237e" /></Box>
              <Box sx={{ flex: 1, minWidth: '250px' }}><KPICard title="Hedge Coverage (Imports)" value={((stats.hedgedExposure/filteredData.length)*100).toFixed(1) + '%'} color="#7b1fa2" /></Box>
           </Box>

           <SummaryTable data={filteredData.filter(d=>d.Purchases > 0).map(d => ({
              'Liability Due Date': d['Purchase Expiry'],
              'Repayment Amt': d.Purchases.toLocaleString(),
              'Forward Rate': d['Purchase Forward Rate'],
              'Outcome': d['Purchase Hedge Outcome'],
              'Decision': d['Purchase Decision']
           }))} />
        </Stack>
      )}
    </Box>
  );
};

export default Forex;