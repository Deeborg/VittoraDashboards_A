import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme_cr';

const Badge = styled.span<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  line-height: 1;
  white-space: nowrap;

  ${props => {
    const status = props.$status.toLowerCase();
    switch (status) {
      case 'open':
      case 'new':
        return `
          background: ${theme.colors.error[50]};
          color: ${theme.colors.error[700]};
        `;
      case 'in progress':
      case 'in review':
      case 'investigating':
        return `
          background: ${theme.colors.warning[50]};
          color: ${theme.colors.warning[700]};
        `;
      case 'closed':
      case 'resolved':
      case 'submitted':
      case 'active':
      case 'success':
        return `
          background: ${theme.colors.success[50]};
          color: ${theme.colors.success[700]};
        `;
      case 'draft':
      case 'pending':
        return `
          background: ${theme.colors.gray[100]};
          color: ${theme.colors.gray[700]};
        `;
      case 'overdue':
      case 'expired':
      case 'critical':
        return `
          background: ${theme.colors.error[50]};
          color: ${theme.colors.error[700]};
        `;
      case 'compliant':
        return `
          background: ${theme.colors.success[50]};
          color: ${theme.colors.success[700]};
        `;
      case 'non-compliant':
        return `
          background: ${theme.colors.error[50]};
          color: ${theme.colors.error[700]};
        `;
      case 'review required':
        return `
          background: ${theme.colors.purple[50]};
          color: ${theme.colors.purple[700]};
        `;
      case 'confirmed':
        return `
          background: ${theme.colors.error[50]};
          color: ${theme.colors.error[700]};
        `;
      case 'false positive':
        return `
          background: ${theme.colors.gray[100]};
          color: ${theme.colors.gray[700]};
        `;
      default:
        return `
          background: ${theme.colors.gray[100]};
          color: ${theme.colors.gray[700]};
        `;
    }
  }}
`;

const Dot = styled.span<{ $status: string }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: ${theme.spacing.xs};
  
  ${props => {
    const status = props.$status.toLowerCase();
    switch (status) {
      case 'open':
      case 'new':
      case 'critical':
      case 'non-compliant':
      case 'overdue':
      case 'confirmed':
        return `background: ${theme.colors.error[500]};`;
      case 'in progress':
      case 'in review':
      case 'investigating':
        return `background: ${theme.colors.warning[500]};`;
      case 'closed':
      case 'resolved':
      case 'submitted':
      case 'active':
      case 'compliant':
        return `background: ${theme.colors.success[500]};`;
      case 'review required':
        return `background: ${theme.colors.purple[500]};`;
      default:
        return `background: ${theme.colors.gray[500]};`;
    }
  }}
`;

interface StatusBadgeProps {
  status: string;
  showDot?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showDot = true }) => {
  return (
    <Badge $status={status}>
      {showDot && <Dot $status={status} />}
      {status}
    </Badge>
  );
};

export default StatusBadge;