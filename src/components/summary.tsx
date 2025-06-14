import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faDollarSign, faFileInvoiceDollar, faBuilding, faMoneyBillWave,
    faCubes, faArchive, faHandHoldingUsd, faCoins, faChartLine
} from '@fortawesome/free-solid-svg-icons';
import { FaHome, FaThLarge } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import styles from './Summary.module.css';
import RatioAnalysisPage from "./ratio";
import WaterfallChart from './waterfall';
import SankeyChart from './Sankey';
import DashboardPage from "./DashboardPage";
import { GiProfit,GiReceiveMoney,GiCash } from "react-icons/gi";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { GiPrisoner } from "react-icons/gi";
import { FcCustomerSupport } from "react-icons/fc";




import KpiCard from './KpiCard';
import RadialChartCard from './RadialChartCard';
import '../Style/DashboardPage.css'; // Import the CSS

import LoadingMobiusStrip from './LoadingMobiusStrip';

// Import some icons from react-icons
import {
  FiTrendingUp,
  FiDollarSign,
  FiHome,
  FiClipboard,
  FiFileText,
  FiAlertOctagon,
  FiArchive,
  FiLayers, // For the radial chart center
  
} from 'react-icons/fi'; // Example icons, choose what fits

import { IoPersonAdd, IoPersonRemove  } from 'react-icons/io5';

import { IconBaseProps } from "react-icons";



interface ManualKPIData {
    title: string;
    value: string | null;
    comparison: string;
    isPositive?: boolean;
    icon?: React.ReactNode;
}

interface GLAccountRow {
    'Level 1 Desc': string;
    'Level 3 Desc' : string
    'Exception Amount 2022'?: number;
    'Exception Amount 2023'?: number;
    'Mapped amount Q1FY23'?: number;
    'Mapped amount Q1FY22'?: number;
}

const Summary: React.FC = () => {
    const [glAccounts, setGlAccounts] = useState<GLAccountRow[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [kpis, setKpis] = useState<ManualKPIData[]>([]);
    const [waterfallData, setWaterfallData] = useState<any[]>([]);
    const [stackedChartData, setStackedChartData] = useState<any[]>([]);
    const[waterfallprofit , setWaterfallprofit] = useState<any[]>([])
    const salesSparkline = [
        { name: 'Jan', value: 2336 }, { name: 'Feb', value: 3513 }, { name: 'Mar', value: 4154 },
        { name: 'Apr', value: 2345 }, { name: 'May', value: 1443 }, { name: 'Jun', value: 2643 },
        { name: 'Jul', value: 3134 }, { name: 'Aug', value: 4251 }, { name: 'Sept', value: 3557 },
        { name: 'Oct', value: 5732 }, { name: 'Nov', value: 4522 }, { name: 'Dec', value: 4340 },

    ];
    const revenueSparkline = [
        { name: 'Jan', value: 15 }, { name: 'Feb', value: 18 }, { name: 'Mar', value: 21 },
        { name: 'Apr', value: 16 }, { name: 'May', value: 19 }, { name: 'Jun', value: 23 },
        { name: 'Jul', value: 25 }, { name: 'Aug', value: 21 }, { name: 'Sept', value: 27 },
        { name: 'Oct', value: 29 }, { name: 'Nov', value: 27 }, { name: 'Dec', value: 31 },
        
    ];

    const cashBalanceSparkline = [
        { name: 'Jan', value: 2.15 }, { name: 'Feb', value: 1.87 }, { name: 'Mar', value: 2.63 },
        { name: 'Apr', value: 1.42 }, { name: 'May', value: 1.78 }, { name: 'Jun', value: 1.95 },
        { name: 'Jul', value: 2.34 }, { name: 'Aug', value: 2.01 }, { name: 'Sept', value: 1.68 },
        { name: 'Oct', value: 1.89 }, { name: 'Nov', value: 2.01 }, { name: 'Dec', value: 2.02 },
    ];    
    const lossDueToFraudSparkline = [
        { name: 'Jan', value: 1.2 }, { name: 'Feb', value: 2.8 }, { name: 'Mar', value: 0.5 },
        { name: 'Apr', value: 3.7 }, { name: 'May', value: 1.9 }, { name: 'Jun', value: 4.3 },
        { name: 'Jul', value: 2.1 }, { name: 'Aug', value: 0.9 }, { name: 'Sept', value: 3.5 },
        { name: 'Oct', value: 2.6 }, { name: 'Nov', value: 1.4 }, { name: 'Dec', value: 2.3 },
    ];    

    const churnSparkLine = [
        { name: 'Jan', value: 10.34 }, { name: 'Feb', value: 11.52 }, { name: 'Mar', value: 13.43 },
        { name: 'Apr', value: 3.56 }, { name: 'May', value: 5.64 }, { name: 'Jun', value: 21.34 },
        { name: 'Jul', value: 9.34 }, { name: 'Aug', value: 8.45 }, { name: 'Sept', value: 12.45 },
        { name: 'Oct', value: 15.56 }, { name: 'Nov', value: 7.45 }, { name: 'Dec', value: 12.34 },
    ];    
    const customerSatisfactionSparkline = [
        { name: 'Jan', value: 84.2 }, { name: 'Feb', value: 91.5 }, { name: 'Mar', value: 77.8 },
        { name: 'Apr', value: 88.3 }, { name: 'May', value: 94.1 }, { name: 'Jun', value: 79.6 },
        { name: 'Jul', value: 97.2 }, { name: 'Aug', value: 85.7 }, { name: 'Sept', value: 90.4 },
        { name: 'Oct', value: 97.1 }, { name: 'Nov', value: 74.9 }, { name: 'Dec', value: 82.3 },
    ];
    const customerAcquisitionCostSparkline = [
        { name: 'Jan', value: 2400.5 },
        { name: 'Feb', value: 2200.3 },
        { name: 'Mar', value: 2100.7 },
        { name: 'Apr', value: 1800.2 },
        { name: 'May', value: 1950.8 },   
        { name: 'Jun', value: 1700.4 },
        { name: 'Jul', value: 1600.9 },
        { name: 'Aug', value: 900.2 },    
        { name: 'Sept', value: 1300.6 },  
        { name: 'Oct', value: 1100.1 },
        { name: 'Nov', value: 950.7 },
        { name: 'Dec', value: 721.3 }
    ];    

    const defaultSparkline = [
        { name: 'M1', value: 5 }, { name: 'M2', value: 6 }, { name: 'M3', value: 5 },
        { name: 'M4', value: 7 }, { name: 'M5', value: 6 }, { name: 'M6', value: 8 },
    ];
    const [profitType, setProfitType] = useState<'gross' | 'net'>('net');
    const radialValue = profitType === 'gross' ? 76 : 17;

    const profitSparkline = revenueSparkline.map((data, index) => ({
        name: data.name,
        value: (data.value * radialValue) / 100
    }));


    const navigate = useNavigate();

    const baseKPIs: ManualKPIData[] = [
        { title: "Cash from Operations", value: "3.617 billion", comparison: "vs previous", icon: <FontAwesomeIcon icon={faArchive} /> },
        { title: "Cash from Investments", value: "46.07 Crs", comparison: "N/A", icon: <FontAwesomeIcon icon={faHandHoldingUsd} /> },
        { title: "Cash from Financing", value: "-5.113 billion", comparison: "N/A", icon: <FontAwesomeIcon icon={faCoins} /> },
        { title: "Net change in cash", value: "-1.06 billion", comparison: "N/A", icon: <FontAwesomeIcon icon={faCoins} /> },
        { title: "Total Revenue", value: null, comparison: "vs previous", icon: <FontAwesomeIcon icon={faDollarSign} /> },
        { title: "Direct Cost", value: null, comparison: "vs previous", icon: <FontAwesomeIcon icon={faFileInvoiceDollar} /> },
        { title: "Indirect Cost", value: null, comparison: "vs previous", icon: <FontAwesomeIcon icon={faFileInvoiceDollar} /> },
        { title: "Financial Expenses", value: "Static", comparison: "N/A", icon: <FontAwesomeIcon icon={faHandHoldingUsd} /> },
        { title: "Net Profit", value: null, comparison: "vs previous", icon: <FontAwesomeIcon icon={faChartLine} /> },
    ];

    const formatNumber = (value: number | undefined | null, format: 'crores' | 'billions' | 'percentage'): string => {
        if (value === undefined || value === null) {
            return "";
        }
        if (format === 'crores') {
            const crores = value / 10000000;
            return `${crores.toFixed(2)} Crs`;
        } else if (format === 'billions') {
            const billions = value / 1000000000;
            return `${billions.toFixed(2)} billion`;
        } else {
            return `${value.toFixed(1)}%`;
        }
    };

    const getNum = (v: any) => (typeof v === 'number' ? v : isNaN(Number(v)) ? 0 : Number(v));

    const [totalRevenue, setTotalRevenue] = useState<number>(0);
    const[cashBank, setCashBank] = useState<number>(0);

    const calculateKPIs = (data: GLAccountRow[]): ManualKPIData[] => {
        const calculateYearData = (year: '2023' | '2022', data: GLAccountRow[]) => {
            const totalRevenue = data
                .filter(row => row['Level 1 Desc'] === 'Total Revenue')
                .reduce((sum, row) => sum + getNum(row[`Mapped amount Q1FY${year.slice(2)}` as keyof GLAccountRow]), 0);

            const directCost = data
                .filter(row => row['Level 1 Desc'] === 'Cost of Goods Sold' || row['Level 1 Desc'] === 'Cost of Consumption')
                .reduce((sum, row) => sum + getNum(row[`Mapped amount Q1FY${year.slice(2)}` as keyof GLAccountRow]), 0);

            const indirectCost = data
                .filter(row => row['Level 1 Desc'] === 'Selling & Marketing Expenses' || row['Level 1 Desc'] === 'General & Administrative Expenses')
                .reduce((sum, row) => sum + getNum(row[`Mapped amount Q1FY${year.slice(2)}` as keyof GLAccountRow]), 0);

            const financialExpenses = data
                .filter(row => row['Level 1 Desc'] === 'Total Non Operating Expenses')
                .reduce((sum, row) => sum + getNum(row[`Mapped amount Q1FY${year.slice(2)}` as keyof GLAccountRow]), 0);

            const netProfit = totalRevenue - directCost - indirectCost - financialExpenses;
            const netProfitMargin = totalRevenue !== 0 ? (netProfit / totalRevenue) * 100 : 0;

            return {
                'Total Revenue': totalRevenue,
                'Direct Cost': -directCost,
                'Indirect Cost': -indirectCost,
                'Financial Expenses': -financialExpenses,
                'Net Profit': netProfit,
                'Net Profit Margin': netProfitMargin,
            };
        };

        const data2023 = calculateYearData('2023', data);
        const data2022 = calculateYearData('2022', data);

        const chartData = [
            {
                year: '2023',
                ...data2023,
            },
            {
                year: '2022',
                ...data2022,
            },
        ];
        setStackedChartData(chartData);

        const totalRevenue2023 = data2023['Total Revenue'];
        const directCost2023 = Math.abs(data2023['Direct Cost']);
        const indirectCost2023 = Math.abs(data2023['Indirect Cost']);
        const financialExpenses2023 = Math.abs(data2023['Financial Expenses']);
        const netProfit2023 = data2023['Net Profit'];

        return [
            { title: "Total Revenue", value: formatNumber(totalRevenue2023, 'billions'), comparison: "vs previous", isPositive: totalRevenue2023 >= 0, icon: <FontAwesomeIcon icon={faDollarSign} /> },
            { title: "Direct Cost", value: formatNumber(directCost2023, 'billions'), comparison: "vs previous", isPositive: data2023['Direct Cost'] <= 0, icon: <FontAwesomeIcon icon={faFileInvoiceDollar} /> },
            { title: "Indirect Cost", value: formatNumber(indirectCost2023, 'billions'), comparison: "vs previous", isPositive: data2023['Indirect Cost'] <= 0, icon: <FontAwesomeIcon icon={faFileInvoiceDollar} /> },
            { title: "Financial Expenses", value: formatNumber(financialExpenses2023, 'crores'), comparison: "vs previous", isPositive: data2023['Financial Expenses'] <= 0, icon: <FontAwesomeIcon icon={faMoneyBillWave} /> },
            { title: "Net Profit", value: formatNumber(netProfit2023, 'billions'), comparison: "vs previous", isPositive: netProfit2023 >= 0, icon: <FontAwesomeIcon icon={faChartLine} /> },
        ];
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);            
            try {
                const response = await fetch("/Accounts.xlsx");
                const arrayBuffer = await response.arrayBuffer();
                const workbook = XLSX.read(arrayBuffer, { type: "array" });
                const worksheet = workbook.Sheets[(workbook.SheetNames as string[])?.[0]];
                const result: GLAccountRow[] = XLSX.utils.sheet_to_json(worksheet, { raw: true });
                setGlAccounts(result);
                const calculatedKPIs = calculateKPIs(result);
                const mergedKPIs = baseKPIs.map(base => {
                    const match = calculatedKPIs.find(kpi => kpi.title === base.title);
                    return match ? { ...base, ...match } : base;
                });
                setKpis(mergedKPIs);

                const currentAssets = result
                    .filter(row => row['Level 1 Desc'] === 'Total Current Assets')
                    .reduce((sum, row) => sum + getNum(row['Mapped amount Q1FY23']), 0);

                const nonCurrentAssets = result
                    .filter(row => row['Level 1 Desc'] === 'Total Non Current Assets')
                    .reduce((sum, row) => sum + getNum(row['Mapped amount Q1FY23']), 0);

                const currentLiabilities = result
                    .filter(row => row['Level 1 Desc'] === 'Total Current Liabilities')
                    .reduce((sum, row) => sum + getNum(row['Mapped amount Q1FY23']), 0);

                const nonCurrentLiabilities = result
                    .filter(row => row['Level 1 Desc'] === 'Total Non Current Liabilities')
                    .reduce((sum, row) => sum + getNum(row['Mapped amount Q1FY23']), 0);

                setWaterfallData([
                    { category: 'Current Assets', value: currentAssets },
                    { category: 'Non-Current Assets', value: nonCurrentAssets },
                    { category: 'Current Liabilities', value: currentLiabilities },
                    { category: 'Non-Current Liabilities', value: nonCurrentLiabilities },
                ]);

                const totalRevenue = result
                .filter(row => row['Level 1 Desc'] === 'Total Revenue')
                .reduce((sum, row) => sum + getNum(row['Mapped amount Q1FY23']), 0)*4;

                const directCost = result
                    .filter(row => row['Level 1 Desc'] === 'Cost of Goods Sold' || row['Level 1 Desc'] === 'Cost of Consumption')
                    .reduce((sum, row) => sum + getNum(row['Mapped amount Q1FY23']), 0)*4;

                const indirectCost = result
                    .filter(row => row['Level 1 Desc'] === 'Selling & Marketing Expenses' || row['Level 1 Desc'] === 'General & Administrative Expenses')
                    .reduce((sum, row) => sum + getNum(row['Mapped amount Q1FY23']), 0)*4;
                const cashBank = result
                    .filter(row => row['Level 3 Desc'].trim() === 'Bank Balance' || row['Level 3 Desc'].trim() === 'Bank Balance-Misc')
                    .reduce((sum, row) => sum + getNum(row['Mapped amount Q1FY23']), 0);
                setCashBank(cashBank);

                const financialExpenses = result
                    .filter(row => row['Level 1 Desc'] === 'Total Non Operating Expenses')
                    .reduce((sum, row) => sum + getNum(row['Mapped amount Q1FY23']), 0)*4;

                const netProfit = totalRevenue - directCost - indirectCost - financialExpenses;
                setTotalRevenue(totalRevenue);
                setWaterfallprofit([
                        { category: 'Total Revenue', value: -totalRevenue },
                        { category: 'Direct Cost', value: -directCost },
                        { category: 'Indirect Cost', value: -indirectCost },
                        { category: 'Financial Expenses', value: -financialExpenses },
                    ]);


            } catch (error) {
                console.error("Error fetching or parsing Excel:", error);
                setKpis(baseKPIs);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleGoHome = () => {
        navigate('/');
    };

    const handleExploreModulesClick = () => {
        console.log("Explore Modules button clicked!");
        navigate('/modules'); // Example: Navigate to a '/modules' route
    };

    function abbreviateNumber(value: number): string {
        if (value >= 1_000_000_000) {
            return (value / 1_000_000_000).toFixed(2) + " B";
        } else if (value >= 1_000_000) {
            return (value / 1_000_000).toFixed(2) + " M";
        } else {
            return value.toLocaleString();
        }
    }    

    if (loading) {
        return <LoadingMobiusStrip />;
    }    

    return (
        <div className={styles.summaryContainer}>
            <div className={styles.summaryHeader}>
                <h2 className={styles.financialSummaryHeading}>Snapshot of Financials</h2>
                
                <div className={styles.headerButtons}>
                    <button
                        className={styles.homeIconButton}
                        onClick={handleGoHome}
                        title="Go to Home" // Added tooltip for Home button
                    >
                        {React.createElement(FaHome as React.FC<any>, { size: 35 })}
                    </button>
                    <button
                        className={styles.exploreModulesButton}
                        onClick={handleExploreModulesClick}
                        title="Explore Modules"
                    >
                        <span className={styles.exploreModulesContent}>
                            <img
                                src="/asset/modules.png" // Make sure this path is correct and accessible
                                alt="Explore Modules"
                                className={styles.exploreModulesIcon}
                            />
                            <span className={styles.exploreModulesText}>Explore Modules</span>
                        </span>
                    </button>
                </div>
                <img
                    src="/asset/vittora_grey.png"
                    alt="Vittora Logo"
                    className={styles.headerLogoRight}
                />                    

                <p style={{ textAlign: 'center', margin: '12px 0 0 0', color: 'black', fontSize: '1.08rem' }}>
                    A quick overview of your company’s key financial metrics and performance indicators.<br />
                
                </p>                
            </div>
            <div className="dashboard-grid">
                {/* KPI Cards - Column 1 */}
                <KpiCard
                title="# New Customers"
                value="4340"
                icon={IoPersonAdd as React.ComponentType<IconBaseProps>}
                sparklineData={salesSparkline}
                trend="up"
                iconBgColor="rgba(52, 211, 153, 0.15)" // Greenish icon bg
                iconColor="#34d399"

                />
                <KpiCard
                title="Customer Churn Rate"
                value="12.34%"
                icon={IoPersonRemove as React.ComponentType<IconBaseProps>}
                sparklineData={churnSparkLine} // Scale down for display
                trend="down"
                iconBgColor="rgba(248, 113, 113, 0.15)" // Reddish icon bg
                iconColor="#f87171"
                />
                {/* Radial Chart Section - Modified */}
                <div
                    className="radial-chart-card-wrapper radial-chart-card-wrapper-prominent"
                    style={{
                        gridColumn: "3 / span 1",
                        gridRow: "1 / span 2",
                        zIndex: 2,
                        display: 'flex', 
                        flexDirection: 'column',

                    }}
                >
                    {/* Container for Profit Type Buttons */}
                    <div className={styles.profitButtonContainer}>
                        <button
                            onClick={() => setProfitType('gross')}
                            className={`${styles.profitButton} ${profitType === 'gross' ? styles.activeProfitButton : ''}`}
                        >
                            Gross Profit
                        </button>
                        <button
                            onClick={() => setProfitType('net')}
                            className={`${styles.profitButton} ${profitType === 'net' ? styles.activeProfitButton : ''}`}
                        >
                            Net Profit
                        </button>
                    </div>

                    {/* Container for the Radial Chart to manage its flex behavior */}
                    <div className={styles.radialChartContent}>
                        <RadialChartCard
                            percentage={radialValue}
                            label={profitType === 'gross' ? "Gross Profit Ratio" : "Net Profit Ratio"}
                            icon={GiProfit as React.ComponentType<IconBaseProps>}
                            pathColor="#38bdf8" 
                        />
                    </div>
                </div>                {/* KPI Cards - Column 2 (or part of general flow) */}
                <KpiCard
                title="₹ Sales"
                value= {abbreviateNumber(Math.abs(totalRevenue))}
                icon={FaMoneyBillTransfer as React.ComponentType<IconBaseProps>}
                sparklineData={revenueSparkline}
                trend="up"
                iconBgColor="rgba(52, 211, 153, 0.15)"
                iconColor="#34d399"
                />
                <KpiCard
                title={profitType === 'gross' ? "₹ Gross Profit" : "₹ Net Profit"}
                value={abbreviateNumber((Math.abs(totalRevenue)*radialValue/100))}
                icon={GiReceiveMoney as React.ComponentType<IconBaseProps>}
                sparklineData={profitSparkline} // Example of different trend
                trend="up" // Assuming lower is better
                iconBgColor="rgba(251, 146, 60, 0.15)" // Orange icon bg
                iconColor="#fb923c"
                />
                
                {/* Radial Chart - This can be placed to span more if needed via CSS */}


                {/* KPI Cards - Column 3 */}
                <KpiCard
                title="Customer Satisfaction"
                value="84.83%"
                icon={FcCustomerSupport as React.ComponentType<IconBaseProps>}
                sparklineData={customerSatisfactionSparkline}
                trend="neutral"
                />
                <KpiCard
                title="₹ CAC"
                value="721"
                icon={FiFileText as React.ComponentType<IconBaseProps>}
                sparklineData={customerAcquisitionCostSparkline}
                trend="up"
                />
                <KpiCard
                title="₹ Cash and  Bank"
                value={abbreviateNumber(cashBank)}
                icon={GiCash as React.ComponentType<IconBaseProps>}
                sparklineData={cashBalanceSparkline} 
                trend="up" // Assuming lower is better
                // iconBgColor="rgba(248, 113, 113, 0.15)" // Reddish icon bg
                // iconColor="#f87171"
                />
                <KpiCard
                title="₹ Loss due to Fraud"
                value="2.3 M"
                icon={GiPrisoner as React.ComponentType<IconBaseProps>}
                sparklineData={lossDueToFraudSparkline}
                trend="down"
                iconBgColor="rgba(248, 113, 113, 0.15)"
                iconColor="#f87171"
                />
            </div>            

            <div className={styles.chartLayout}>
                <div className={styles.chartContainer}>
                    <h3 style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '0.1rem', color: "black", fontSize:26 }}>Balance Sheet</h3>
                    <WaterfallChart id="balancesheet" data={waterfallData} totalLabel="Owners Equity" />
                </div>
                <div className={styles.chartContainer}>
                    <h3 style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '0.1rem', color: "black", fontSize:26 }}>Profit and Loss</h3>
                    <WaterfallChart id="profit&loss" data={waterfallprofit} totalLabel="Net Profit" />
                </div>
            </div>
            <div>
                <SankeyChart />
            </div>
            <div className={styles.ratioSection}>
                <RatioAnalysisPage />
            </div>
        </div>
    );
};
export default Summary;