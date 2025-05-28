import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import styles from './RatioAnalysisPage.module.css';
import GaugeChart from './Gaugechart';
import CurvedPath from './curve';


interface RatioData {
  name: string;
  value: number | null;
}

interface ExcelRatioRow {
  'Types of Ratios': string;
  Formula: string;
  'Ideal Ratio': string | number;
  'Actual Value': number;
}

const RatioAnalysisPage: React.FC = () => {
  const [allRatiosData, setAllRatiosData] = useState<RatioData[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCurveCategory, setSelectedCurveCategory] = useState<string | null>(null); // State for curve selection

  const pageSummary =
    "The ratio analysis shows strong capital structure and coverage ratios, indicating financial stability and low risk. Profitability ratios suggest robust operational and gross profit margins, though returns on assets and equity are relatively low. Market value ratios reflect high investor confidence, with significant market price and valuation metrics.";

  const ratioCategoriesConfig = {
    'Capital Structure Ratios': {
      ratios: ['Equity Ratio', 'Debt Ratio', 'Debt to Equity Ratio'],
    },
    'Coverage Ratios': {
      ratios: ['Debt Service Coverage Ratio', 'Interest Coverage Ratio', 'Capital Gearing Ratio'],
    },
    'Return on Sales': {
      ratios: ['Gross Profit', 'Net Profit', 'Operating Profit Margin', 'Pretax Margin'],
    },
    'Return on Investment': {
      ratios: ['Return on Assets', 'Return on Capital Employed', 'Return on Equity'],
    },
    'Market Values': {
      ratios: ['Earnings Per Share', 'Book Value Per Share', 'Market Value Per Share', 'Market/Book Ratio/P/B Ratio', 'Price-Earnings(P/E)Ratio'],
    },
  };

  const handleCurveCategorySelect = (categoryId: string) => {
    setSelectedCurveCategory(categoryId);
    // You might want to update the displayed gauges based on this selection
    setSelectedCategories([categoryId]); // For example, to only show ratios of the selected category
  };

  const ratioColorRanges: Record<string, { start: number; color: string }[]> = {
    'Equity Ratio': [
      { start: 0, color: ' #ef4444' },
      { start: 0.5, color: ' #22c55e' },
    ],
    'Debt Ratio': [
      { start: 0, color: 'rgba(238, 235, 56, 0.93)' },
      { start: 0.3, color: ' #22c55e' },
      { start: 0.6, color: ' #ef4444' },
    ],
    'Debt to Equity Ratio': [
      { start: 0, color: ' #22c55e' },
      { start: 0.5, color: 'rgba(238, 235, 56, 0.93)' },
      { start: 2, color: ' #ef4444' },
    ],
    'Debt Service Coverage Ratio': [
      { start: 0, color: ' #ef4444' },
      { start: 2, color: ' #22c55e' },
    ],
    'Interest Coverage Ratio': [
      { start: 0, color: ' #ef4444' },
      { start: 3, color: ' #22c55e' },
    ],
    'Capital Gearing Ratio': [
      { start: 0, color: ' rgba(238, 235, 56, 0.93)' },
      { start: 0.25, color: ' #22c55e' },
      { start: .5, color: ' #ef4444' },
    ],
    'Gross Profit': [
      { start: 0, color: ' #ef4444' },
      { start: 0.25, color: ' rgba(238, 235, 56, 0.93)' },
      { start: 0.75, color: ' #22c55e' },
    ],
    'Net Profit': [
      { start: 0, color: ' #ef4444' },
      { start: 0.1, color: ' rgba(238, 235, 56, 0.93)' },
      { start: 0.3, color: ' #22c55e' },
    ],
    'Operating Profit Margin': [
      { start: 0, color: ' #ef4444' },
      { start: 0.15, color: ' rgba(238, 235, 56, 0.93)' },
      { start: 0.5, color: ' #22c55e' },
    ],
    'Pretax Margin': [
      { start: 0, color: ' #ef4444' },
      { start: 0.2, color: ' rgba(238, 235, 56, 0.93)' },
      { start: 0.6, color: ' #22c55e' },
    ],
    'Return on Assets': [
      { start: 0, color: ' #ef4444' },
      { start: 0.05, color: ' rgba(238, 235, 56, 0.93)' },
      { start: 0.1, color: ' #22c55e' },
    ],
    'Return on Capital Employed': [
      { start: 0, color: ' #ef4444' },
      { start: 0.12, color: ' rgba(238, 235, 56, 0.93)' },
      { start: 0.2, color: ' #22c55e' },
    ],
    'Return on Equity': [
      { start: 0, color: ' #ef4444' },
      { start: 0.1, color: ' rgba(238, 235, 56, 0.93)' },
      { start: 0.2, color: ' #22c55e' },
    ],
    'Earnings Per Share': [
      { start: 0, color: ' #ef4444' },
      { start: 2, color: ' rgba(238, 235, 56, 0.93)' },
      { start: 6, color: ' #22c55e' },
    ],
    'Book Value Per Share': [
      { start: 0, color: ' #ef4444' },
      { start: 20, color: ' rgba(238, 235, 56, 0.93)' },
      { start: 80, color: ' #22c55e' },
    ],
    'Market Value Per Share': [
      { start: 0, color: ' #ef4444' },
      { start: 250, color: ' rgba(238, 235, 56, 0.93)' },
      { start: 650, color: ' #22c55e' },
    ],
    'Market/Book Ratio/P/B Ratio': [
      { start: 0, color: ' #22c55e' },
      { start: 2, color: ' rgba(238, 235, 56, 0.93)' },
      { start: 7, color: ' #ef4444' },
    ],
    'Price-Earnings(P/E)Ratio': [
      { start: 0, color: ' #22c55e' },
      { start: 20, color: ' rgba(238, 235, 56, 0.93)' },
      { start: 40, color: ' #ef4444' },
    ],
  };


  useEffect(() => {
    const fetchRatioData = async () => {
      try {
        const response = await fetch("/Ratios.xlsx");
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const excelData: ExcelRatioRow[] = XLSX.utils.sheet_to_json(worksheet, { raw: true });

        const formattedData: RatioData[] = excelData
          .filter(row => Object.values(ratioCategoriesConfig).some(cat => cat.ratios.includes(row['Types of Ratios'])))
          .map(row => ({
            name: row['Types of Ratios'],
            value: typeof row['Actual Value'] === 'number' ? row['Actual Value'] : null,
          }));

        setAllRatiosData(formattedData);
      } catch (error) {
        console.error("Error fetching or parsing Ratios Excel:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRatioData();
  }, []);

  const handleCategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const categoryName = event.target.value;
    if (event.target.checked) {
      setSelectedCategories([...selectedCategories, categoryName]);
    } else {
      setSelectedCategories(selectedCategories.filter(name => name !== categoryName));
    }
  };

    const selectedRatios = Object.entries(ratioCategoriesConfig)
    .filter(([categoryName]) => selectedCategories.includes(categoryName))
    .flatMap(([, config]) => config.ratios);

  const filteredRatios = allRatiosData.filter(ratio => selectedRatios.includes(ratio.name));


  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>RATIO ANALYSIS</h1>
      <p className={styles.description}>{pageSummary}</p>

      <div className={styles.contentWrapper}>
        <div className={styles.filterContainer}>
          <h3></h3>
          <div className={styles.curveContainer}>
          <CurvedPath
            categories={Object.entries(ratioCategoriesConfig).map(([key, value]) => ({
              id: key,
              name: key,
              color: 'teal', // Assign a default color or customize as needed
              ratios: value.ratios,
            }))}
            selectedCategory={selectedCurveCategory}
            onSelectCategory={handleCurveCategorySelect}
          />
        </div>
          {/* <div className={styles.categoryList}>
            {Object.entries(ratioCategoriesConfig).map(([category]) => (
              <label key={category} className={styles.categoryLabel}>
                <input
                  type="checkbox"
                  value={category}
                  checked={selectedCategories.includes(category)}
                  onChange={handleCategoryChange}
                />
                {category}
              </label>
            ))}
          </div> */}
        </div>

        <div className={styles.gaugesContainer}>
          {filteredRatios.map((ratio) => {
             let minVal = 0;
            let maxVal = 1500;
            let gaugeTitle = ratio.name;

            if (ratio.name === 'Equity Ratio') {
              gaugeTitle = 'Equity Ratio';
            } else if (ratio.name === 'Debt Ratio') {
              gaugeTitle = 'Debt Ratio';
            } else if (ratio.name === 'Debt to Equity Ratio') {
              gaugeTitle = 'Debt to Equity Ratio';
            } else if (ratio.name === 'Debt Service Coverage Ratio') {
              gaugeTitle = 'Debt Service Coverage Ratio';
            } else if (ratio.name === 'Interest Coverage Ratio') {
              gaugeTitle = 'Interest Coverage Ratio';
            } else if (ratio.name === 'Capital Gearing Ratio') {
              gaugeTitle = 'Capital Gearing Ratio';
            } else if (ratio.name === 'Gross Profit') {
              gaugeTitle = 'Gross Profit';
            } else if (ratio.name === 'Net Profit') {
              gaugeTitle = 'Net Profit';
            } else if (ratio.name === 'Operating Profit Margin') {
              gaugeTitle = 'Operating Profit Margin';
            } else if (ratio.name === 'Pretax Margin') {
              gaugeTitle = 'Pre Tax Margin';
            } else if (ratio.name === 'Return on Assets') {
              gaugeTitle = 'Return on Assets';
            } else if (ratio.name === 'Return on Capital Employed') {
              gaugeTitle = 'Return on Capital Employed';
            } else if (ratio.name === 'Return on Equity') {
              gaugeTitle = 'Return on Equity';
            } else if (ratio.name === 'Earnings Per Share') {
              gaugeTitle = 'Earnings Per Share';
            } else if (ratio.name === 'Book Value Per Share') {
              gaugeTitle = 'Book Value Per Share';
            } else if (ratio.name === 'Market Value Per Share') {
              gaugeTitle = 'Market Price';
            } else if (ratio.name === 'Market/Book Ratio/P/B Ratio') {
              gaugeTitle = 'Price to Book';
            } else if (ratio.name === 'Price-Earnings(P/E)Ratio') {
              gaugeTitle = 'Price Earning Ratio';
            }

            if (ratio.name === 'Equity Ratio' || ratio.name === 'Debt Ratio' || ratio.name === 'Capital Gearing Ratio' || ratio.name === 'Gross Profit' || ratio.name === 'Net Profit' || ratio.name === 'Operating Profit Margin' || ratio.name === 'Pretax Margin' || ratio.name === 'Return on Assets' || ratio.name === 'Return on Capital Employed' || ratio.name === 'Return on Equity') {
              maxVal = 1;
            } else if (ratio.name === 'Debt to Equity Ratio') {
              maxVal = 5;
            } else if (ratio.name === 'Earnings Per Share' || ratio.name === 'Market/Book Ratio/P/B Ratio') {
              maxVal = 20;
            } else if (ratio.name === 'Price-Earnings(P/E)Ratio') {
              maxVal = 100;
            } else if (ratio.name === 'Debt Service Coverage Ratio' || ratio.name === 'Interest Coverage Ratio' || ratio.name === 'Book Value Per Share') {
              maxVal = 200;
            } else if (ratio.name === 'Market Value Per Share') {
              maxVal = 1000;
            }
            return (
              <GaugeChart
                key={ratio.name}
                title={gaugeTitle}
                value={ratio.value ?? 0}
                min={minVal}
                max={maxVal}
                colorRanges={ratioColorRanges[ratio.name] || [
                  { start: minVal, color: '#22c55e' },
                  { start: maxVal * 0.66, color: '#ef4444' }
                ]}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RatioAnalysisPage;
