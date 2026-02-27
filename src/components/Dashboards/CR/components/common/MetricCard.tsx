import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

interface MetricCardNewProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  subtext?: string;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'purple';
  onClick?: () => void;
}

const colorMap = {
  primary: theme.colors.primary[500],
  success: theme.colors.success[500],
  warning: theme.colors.warning[500],
  error: theme.colors.error[500],
  info: theme.colors.info[500],
  purple: theme.colors.purple[500],
};

const Card = styled.div<{ $color: string }>`
  background: ${theme.colors.background.card};
  border-radius: ${theme.borderRadius['2xl']};
  padding: ${theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  transition: ${theme.transitions.smooth};
  position: relative;
  overflow: hidden;
  box-shadow: ${theme.shadows.card};
  border: 1px solid ${theme.colors.border.medium};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.$color};
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${theme.shadows['card-hover']};
    background: ${theme.colors.background.hover};
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${theme.spacing.xs};
`;

const Label = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.tertiary};
  font-weight: ${theme.typography.fontWeight.medium};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const IconWrapper = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.xl};
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  font-size: 1.25rem;
`;

const Value = styled.div`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  line-height: 1.2;
  margin-bottom: ${theme.spacing.xs};
`;

const Trend = styled.div<{ $positive?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${props => props.$positive ? theme.colors.success[400] : theme.colors.error[400]};
  background: ${props => props.$positive ? theme.colors.success[900] : theme.colors.error[900]};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
  width: fit-content;
  border: 1px solid ${props => props.$positive ? theme.colors.success[700] : theme.colors.error[700]};
`;

const Subtext = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.muted};
  margin-top: ${theme.spacing.xs};
`;

const MetricCard: React.FC<MetricCardNewProps> = ({
  label,
  value,
  icon,
  trend,
  subtext,
  color = 'primary',
  onClick,
}) => {
  return (
    <Card $color={colorMap[color]} onClick={onClick}>
      <Header>
        <Label>{label}</Label>
        {icon && <IconWrapper $color={colorMap[color]}>{icon}</IconWrapper>}
      </Header>
      <Value>{value}</Value>
      {trend && (
        <Trend $positive={trend.isPositive}>
          {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
        </Trend>
      )}
      {subtext && <Subtext>{subtext}</Subtext>}
    </Card>
  );
};

export default MetricCard;