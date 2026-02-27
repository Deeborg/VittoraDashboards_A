import React from 'react';
import styled from 'styled-components';
import { FaExclamationTriangle, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';
import { theme } from '../../styles/theme';

const Badge = styled.span<{ $level: string }>`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  line-height: 1;
  white-space: nowrap;

  ${props => {
    switch (props.$level) {
      case 'High':
      case 'Critical':
        return `
          background: ${theme.colors.error[50]};
          color: ${theme.colors.error[700]};
        `;
      case 'Medium':
        return `
          background: ${theme.colors.warning[50]};
          color: ${theme.colors.warning[700]};
        `;
      case 'Low':
        return `
          background: ${theme.colors.success[50]};
          color: ${theme.colors.success[700]};
        `;
      default:
        return `
          background: ${theme.colors.gray[100]};
          color: ${theme.colors.gray[700]};
        `;
    }
  }}
`;

interface RiskBadgeProps {
  level: 'High' | 'Medium' | 'Low' | 'Critical';
}

const RiskBadge: React.FC<RiskBadgeProps> = ({ level }) => {
  const getIcon = () => {
    switch (level) {
      case 'Critical':
      case 'High':
        return <FaExclamationCircle size={12} />;
      case 'Medium':
        return <FaExclamationTriangle size={12} />;
      case 'Low':
        return <FaInfoCircle size={12} />;
      default:
        return null;
    }
  };

  return (
    <Badge $level={level}>
      {getIcon()}
      {level}
    </Badge>
  );
};

export default RiskBadge;