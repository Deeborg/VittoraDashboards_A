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

interface ManualKPIData {
    title: string;
    value: string | null;
    comparison: string;
    isPositive?: boolean;
    icon?: React.ReactNode;
}

interface GLAccountRow {
    'Level 1 Desc': string;
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
                .reduce((sum, row) => sum + getNum(row['Mapped amount Q1FY23']), 0);

            const directCost = result
                .filter(row => row['Level 1 Desc'] === 'Cost of Goods Sold' || row['Level 1 Desc'] === 'Cost of Consumption')
                .reduce((sum, row) => sum + getNum(row['Mapped amount Q1FY23']), 0);

            const indirectCost = result
                .filter(row => row['Level 1 Desc'] === 'Selling & Marketing Expenses' || row['Level 1 Desc'] === 'General & Administrative Expenses')
                .reduce((sum, row) => sum + getNum(row['Mapped amount Q1FY23']), 0);

            const financialExpenses = result
                .filter(row => row['Level 1 Desc'] === 'Total Non Operating Expenses')
                .reduce((sum, row) => sum + getNum(row['Mapped amount Q1FY23']), 0);

            const netProfit = totalRevenue - directCost - indirectCost - financialExpenses;
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

    if (loading) return <div>Loading...</div>;

    return (
        <div className={styles.summaryContainer}>
            <div className={styles.summaryHeader}>
                <DashboardPage />
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
                        title="Explore Modules" // Added tooltip for Explore Modules button
                    >
                        {React.createElement(FaThLarge as React.FC<any>, { size: 30 })}
                    </button>
                </div>
            </div>

            <div className={styles.chartLayout}>
                <div className={styles.chartContainer}>
                    <h3 style={{ textAlign: "center", marginBottom: "10px" }}>Balance Sheet</h3>
                    <WaterfallChart id="balancesheet" data={waterfallData} totalLabel="Owners Equity" />
                </div>
                <div className={styles.chartContainer}>
                    <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>Profit and Loss</h3>
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