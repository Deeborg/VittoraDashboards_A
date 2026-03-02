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
    color: ${theme.colors.text.primary};
    background-color: ${theme.colors.background.primary};
    line-height: 1.5;
    height: 100%;
    overflow: hidden;
  }

  #root {
    height: 100vh;
    display: flex;
    overflow: hidden;
  }

  /* Scrollbar Styling - Dark Mode */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${theme.colors.background.secondary};
    border-radius: ${theme.borderRadius.full};
  }

  ::-webkit-scrollbar-thumb {
    background: ${theme.colors.primary[600]};
    border-radius: ${theme.borderRadius.full};
    
    &:hover {
      background: ${theme.colors.primary[500]};
    }
  }

  /* Chart Container Styles - Dark Mode */
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
    fill: ${theme.colors.text.secondary} !important;
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
    color: ${theme.colors.text.secondary} !important;
  }

  .recharts-tooltip-wrapper {
    z-index: 1000;
  }

  .recharts-default-tooltip {
    background-color: ${theme.colors.background.card} !important;
    border: 1px solid ${theme.colors.border.medium} !important;
    border-radius: ${theme.borderRadius.lg} !important;
    box-shadow: ${theme.shadows.lg} !important;
    padding: ${theme.spacing.sm} ${theme.spacing.md} !important;
  }

  .recharts-tooltip-label {
    color: ${theme.colors.text.primary} !important;
    font-weight: ${theme.typography.fontWeight.medium} !important;
  }

  .recharts-tooltip-item {
    color: ${theme.colors.text.secondary} !important;
  }

  .recharts-cartesian-grid-horizontal line,
  .recharts-cartesian-grid-vertical line {
    stroke: ${theme.colors.border.light} !important;
    stroke-opacity: 0.3;
  }

  .recharts-xAxis line,
  .recharts-yAxis line {
    stroke: ${theme.colors.border.medium} !important;
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

  /* Card Styles - Dark Mode */
  .gradient-card {
    background: ${theme.colors.background.card};
    border-radius: ${theme.borderRadius['2xl']};
    border: 1px solid ${theme.colors.border.medium};
    box-shadow: ${theme.shadows.card};
    transition: ${theme.transitions.smooth};
    
    &:hover {
      box-shadow: ${theme.shadows['card-hover']};
      transform: translateY(-2px);
      background: ${theme.colors.background.hover};
    }
  }

  /* Table Styles - Dark Mode */
  .table-container {
    background: ${theme.colors.background.card};
    border-radius: ${theme.borderRadius['2xl']};
    border: 1px solid ${theme.colors.border.medium};
    overflow: hidden;
  }

  .table {
    width: 100%;
    border-collapse: collapse;
    
    th {
      background: ${theme.colors.background.secondary};
      color: ${theme.colors.text.primary};
      font-weight: ${theme.typography.fontWeight.medium};
      padding: ${theme.spacing.md} ${theme.spacing.lg};
      text-align: left;
      border-bottom: 1px solid ${theme.colors.border.medium};
    }
    
    td {
      padding: ${theme.spacing.md} ${theme.spacing.lg};
      color: ${theme.colors.text.secondary};
      border-bottom: 1px solid ${theme.colors.border.light};
    }
    
    tr:hover td {
      background: ${theme.colors.background.hover};
    }
  }

  /* Input Styles - Dark Mode */
  input, select, textarea {
    background: ${theme.colors.background.secondary};
    border: 1px solid ${theme.colors.border.medium};
    color: ${theme.colors.text.primary};
    border-radius: ${theme.borderRadius.lg};
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    
    &:focus {
      outline: none;
      border-color: ${theme.colors.primary[500]};
      box-shadow: 0 0 0 3px ${theme.colors.primary[900]};
    }
    
    &::placeholder {
      color: ${theme.colors.text.muted};
    }
  }

  /* Badge Styles - Dark Mode */
  .badge {
    display: inline-flex;
    align-items: center;
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    border-radius: ${theme.borderRadius.full};
    font-size: ${theme.typography.fontSize.xs};
    font-weight: ${theme.typography.fontWeight.medium};
    
    &-success {
      background: ${theme.colors.success[900]};
      color: ${theme.colors.success[300]};
    }
    
    &-warning {
      background: ${theme.colors.warning[900]};
      color: ${theme.colors.warning[300]};
    }
    
    &-error {
      background: ${theme.colors.error[900]};
      color: ${theme.colors.error[300]};
    }
    
    &-info {
      background: ${theme.colors.info[900]};
      color: ${theme.colors.info[300]};
    }
  }
`;

export default GlobalStyles;