// Ratiodashboard.tsx

import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Import Icons for Categories
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StorefrontIcon from '@mui/icons-material/Storefront';
import SpeedIcon from '@mui/icons-material/Speed';

import { CalculatedRatio } from '../Financials/types';
import { RatioChart } from './RatioChart';
import { RatioCategoryCard } from './RatioCategory';
import { RATIO_DESCRIPTIONS } from './RatioDescriptions'; 
import financialBg from '../../Assets/ratio-background.jpg';

const panBackground = keyframes`
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
`;

const AnimatedCategoryGrid = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100%',
  width: '100%',
  padding: theme.spacing(4),
  backgroundImage: `url(${financialBg})`,
  backgroundColor: theme.palette.grey[100],
  backgroundRepeat: 'repeat-x',
  backgroundSize: '200% auto',
  animation: `${panBackground} 40s linear infinite`,
}));

const RATIO_CATEGORIES = {
  'Liquidity': {
    description: 'Measures the ability to meet short-term obligations.',
    icon: <AccountBalanceWalletIcon />,
    ratios: ['Current Ratio', 'Quick Ratio', 'Cash Ratio', 'Basic Defense Ratio'],
  },
  'Profitability': { // Renamed from Efficiency & Profitability for clarity
    description: 'Evaluates how well the company generates earnings.',
    icon: <TrendingUpIcon />,
    ratios: [
      'Gross Profit Margin', 'EBITDA Margin', 'EBIT Margin', 
      'Return on Equity (ROE)', 'Return on Capital Employed (ROCE)', 'Return on Assets (ROA)'
    ],
  },
  'Efficiency': { // NEW CATEGORY
    description: 'Measures how effectively the company uses its assets.',
    icon: <SpeedIcon />,
    ratios: ['Inventory Days', 'Receivable Days', 'Payable Days', 'Asset Turnover'],
  },
  'Solvency & Leverage': {
    description: 'Assesses long-term financial health and debt levels.',
    icon: <AccountBalanceIcon />,
    ratios: ['Debt to Equity Ratio', 'Interest Coverage Ratio', 'Net Debt/EBITDA'],
  },
  'Market Value': {
    description: 'Relates stock price to financial data.',
    icon: <StorefrontIcon />,
    ratios: [
      'Earnings Per Share (EPS)', 'Price-Earnings (P/E) Ratio', 
      'Book Value Per Share', 'Market Cap', 'EV/EBITDA'
    ],
  },
};

type CategoryName = keyof typeof RATIO_CATEGORIES;

interface RatioDashboardProps {
  open: boolean;
  onClose: () => void;
  ratios: CalculatedRatio[];
  periodHeaders: {
    currentPeriod: string;
    previousPeriod: string;
  };
}

export const RatioDashboard: React.FC<RatioDashboardProps> = ({
  open,
  onClose,
  ratios,
  periodHeaders,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryName | null>(null);

  const groupedRatios = useMemo(() => {
    console.log("Available Ratios from Data:", ratios.map(r => r.ratioMeasure));
    const initialGroups: Record<CategoryName, CalculatedRatio[]> = {
    'Liquidity': [],
    'Profitability': [],
    'Efficiency': [],
    'Solvency & Leverage': [],
    'Market Value': [],
};

    ratios.forEach(ratio => {
      for (const category in RATIO_CATEGORIES) {
        if (RATIO_CATEGORIES[category as CategoryName].ratios.includes(ratio.ratioMeasure)) {
          initialGroups[category as CategoryName].push(ratio);
          break;
        }
      }
    });
    return initialGroups;
  }, [ratios]);

  const handleCategoryClick = (category: CategoryName) => {
    setSelectedCategory(category);
  };

  const handleBackClick = () => {
    setSelectedCategory(null);
  };
  
  const handleClose = () => {
    setSelectedCategory(null);
    onClose();
  }

  return (
    <Dialog fullScreen open={open} onClose={handleClose} TransitionProps={{ unmountOnExit: true }}>
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Financial Ratio Dashboard
          </Typography>
          <IconButton edge="end" color="inherit" onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <DialogContent sx={{ p: 0, backgroundColor: 'grey.100' }}>
        {selectedCategory ? (
          <Box sx={{ p: { xs: 2, md: 3 }, minHeight: '100%' }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={handleBackClick}
              sx={{ mb: 2 }}
            >
              Back to Categories
            </Button>
            <Typography variant="h4" gutterBottom fontWeight="700" color="primary.dark">
              {selectedCategory}
            </Typography>
            
            {/* --- ✅ START OF CHANGES --- */}
            <Box
              sx={{
                // Add a max-width and center the grid for a professional look on ultra-wide screens
                maxWidth: '1400px',
                mx: 'auto',
                display: 'grid',
                gap: { xs: 2, md: 3 },
                // This is the key change for layout:
                // - On small screens (xs), use 1 full-width column.
                // - On large screens (lg), force a 2-column layout. This fixes the single chart issue.
                gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
              }}
            >
            {/* --- ✅ END OF CHANGES --- */}

              {groupedRatios[selectedCategory].map((ratio) => {
                const ratioInfo = RATIO_DESCRIPTIONS[ratio.ratioMeasure] || {
                    description: 'No description available.',
                    interpretation: 'neutral',
                };
                return (
                  <RatioChart
                    key={ratio.sNo}
                    ratio={ratio}
                    periodHeaders={periodHeaders}
                    info={ratioInfo}
                  />
                );
              })}
            </Box>
          </Box>
        ) : (
          <AnimatedCategoryGrid>
            <Box
              sx={{
                display: 'grid',
                gap: { xs: 2, md: 4 },
                gridTemplateColumns: {
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                },
                width: '100%',
                maxWidth: '1200px',
              }}
            >
              {(Object.keys(RATIO_CATEGORIES) as CategoryName[]).map((categoryName) => (
                <RatioCategoryCard
                  key={categoryName}
                  title={categoryName}
                  description={RATIO_CATEGORIES[categoryName].description}
                  icon={RATIO_CATEGORIES[categoryName].icon}
                  onClick={() => handleCategoryClick(categoryName)}
                />
              ))}
            </Box>
          </AnimatedCategoryGrid>
        )}
      </DialogContent>
    </Dialog>
  );
};