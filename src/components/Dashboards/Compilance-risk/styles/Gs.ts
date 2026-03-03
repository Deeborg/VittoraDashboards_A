import { createGlobalStyle } from 'styled-components';
import { theme } from './theme_cr';

const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    height: 100%;
    overflow: hidden;
  }

  body {
    font-family: ${theme.typography.fontFamily.sans};
    color: ${theme.colors.gray[900]};
    background-color: ${theme.colors.gray[50]};
    line-height: 1.5;
    height: 100%;
    overflow: hidden;
  }

  #root {
    height: 100vh;
    display: flex;
    overflow: hidden;
  }

  /* Scrollbar Styling - Light Mode */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${theme.colors.gray[100]};
    border-radius: ${theme.borderRadius.full};
  }

  ::-webkit-scrollbar-thumb {
    background: ${theme.colors.primary[400]};
    border-radius: ${theme.borderRadius.full};
    
    &:hover {
      background: ${theme.colors.primary[500]};
    }
  }

  /* Chart Container Styles - Light Mode */
  .recharts-wrapper {
    width: 100% !important;
    height: 100% !important;
  }

  .recharts-surface {
    overflow: visible;
  }

  .recharts-text {
    font-family: ${theme.typography.fontFamily.sans};
    font-size: 11px;
    fill: ${theme.colors.gray[600]} !important;
  }

  .recharts-legend-wrapper {
    position: relative !important;
    width: 100% !important;
    bottom: 0 !important;
    padding-top: ${theme.spacing.md} !important;
  }

  .recharts-legend-item {
    margin-right: ${theme.spacing.md} !important;
  }

  .recharts-legend-item-text {
    font-size: 12px !important;
    color: ${theme.colors.gray[700]} !important;
  }

  .recharts-tooltip-wrapper {
    z-index: 1000;
  }

  .recharts-default-tooltip {
    background-color: white !important;
    border: 1px solid ${theme.colors.gray[200]} !important;
    border-radius: ${theme.borderRadius.lg} !important;
    box-shadow: ${theme.shadows.lg} !important;
    padding: ${theme.spacing.sm} ${theme.spacing.md} !important;
  }

  .recharts-tooltip-label {
    color: ${theme.colors.gray[900]} !important;
    font-weight: ${theme.typography.fontWeight.medium} !important;
  }

  .recharts-tooltip-item {
    color: ${theme.colors.gray[700]} !important;
  }

  .recharts-cartesian-grid-horizontal line,
  .recharts-cartesian-grid-vertical line {
    stroke: ${theme.colors.gray[200]} !important;
    stroke-opacity: 0.5;
  }

  .recharts-xAxis line,
  .recharts-yAxis line {
    stroke: ${theme.colors.gray[300]} !important;
  }

  /* Animations */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .fade-in {
    animation: fadeIn 0.3s ease;
  }

  /* Card Styles - Light Mode */
  .gradient-card {
    background: white;
    border-radius: ${theme.borderRadius['2xl']};
    border: 1px solid ${theme.colors.gray[200]};
    box-shadow: ${theme.shadows.card};
    transition: ${theme.transitions.smooth};
    
    &:hover {
      box-shadow: ${theme.shadows['card-hover']};
      transform: translateY(-2px);
    }
  }

  /* Table Styles - Light Mode */
  .table-container {
    background: white;
    border-radius: ${theme.borderRadius['2xl']};
    border: 1px solid ${theme.colors.gray[200]};
    overflow: hidden;
    box-shadow: ${theme.shadows.sm};
  }

  .table {
    width: 100%;
    border-collapse: collapse;
    
    th {
      background: ${theme.colors.gray[50]};
      color: ${theme.colors.gray[700]};
      font-weight: ${theme.typography.fontWeight.medium};
      padding: ${theme.spacing.md} ${theme.spacing.lg};
      text-align: left;
      border-bottom: 1px solid ${theme.colors.gray[200]};
      font-size: ${theme.typography.fontSize.sm};
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    td {
      padding: ${theme.spacing.md} ${theme.spacing.lg};
      color: ${theme.colors.gray[700]};
      border-bottom: 1px solid ${theme.colors.gray[100]};
      background: white;
    }
    
    tr:hover td {
      background: ${theme.colors.gray[50]};
    }
    
    tr:last-child td {
      border-bottom: none;
    }
  }

  /* Input Styles - Light Mode */
  input, select, textarea {
    background: white;
    border: 1px solid ${theme.colors.gray[300]};
    color: ${theme.colors.gray[900]};
    border-radius: ${theme.borderRadius.lg};
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    font-size: ${theme.typography.fontSize.sm};
    transition: all 0.2s ease;
    
    &:focus {
      outline: none;
      border-color: ${theme.colors.primary[500]};
      box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
    }
    
    &::placeholder {
      color: ${theme.colors.gray[400]};
    }
  }

  /* Badge Styles - Light Mode */
  .badge {
    display: inline-flex;
    align-items: center;
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    border-radius: ${theme.borderRadius.full};
    font-size: ${theme.typography.fontSize.xs};
    font-weight: ${theme.typography.fontWeight.medium};
    
    &-success {
      background: ${theme.colors.success[50]};
      color: ${theme.colors.success[700]};
    }
    
    &-warning {
      background: ${theme.colors.warning[50]};
      color: ${theme.colors.warning[700]};
    }
    
    &-error {
      background: ${theme.colors.error[50]};
      color: ${theme.colors.error[700]};
    }
    
    &-info {
      background: ${theme.colors.info[50]};
      color: ${theme.colors.info[700]};
    }
  }
`;


export default GlobalStyles;