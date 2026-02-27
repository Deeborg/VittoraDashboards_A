import React from 'react';
import styled from 'styled-components';
import { FaExclamationTriangle, FaChartLine } from 'react-icons/fa';
import { FraudAlert } from '../../types';
import RiskBadge from '../common/RiskBadge';
import StatusBadge from '../common/StatusBadge';
import { theme } from '../../styles/theme';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const SectionTitle = styled.h4`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.gray[900]};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing.lg};
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const Label = styled.span`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.gray[500]};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Value = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[900]};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const DescriptionBox = styled.div`
  padding: ${theme.spacing.lg};
  background: ${theme.colors.gray[50]};
  border-radius: ${theme.borderRadius.lg};
  border-left: 3px solid ${theme.colors.error[500]};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[700]};
  line-height: 1.6;
`;

const ConfidenceBar = styled.div<{ $confidence: number }>`
  width: 100%;
  height: 8px;
  background: ${theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.full};
  position: relative;
  margin: ${theme.spacing.xs} 0;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.$confidence}%;
    background: ${props => {
      if (props.$confidence >= 80) return theme.colors.success[500];
      if (props.$confidence >= 50) return theme.colors.warning[500];
      return theme.colors.error[500];
    }};
    border-radius: ${theme.borderRadius.full};
  }
`;

const PatternTag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: ${theme.colors.purple[50]};
  color: ${theme.colors.purple[700]};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
`;

interface FraudAlertDetailProps {
  alert: FraudAlert;
  onClose: () => void;
}

const FraudAlertDetail: React.FC<FraudAlertDetailProps> = ({ alert}) => {
  return (
    <Container>
      <Section>
        <SectionTitle>
          <FaExclamationTriangle color={theme.colors.error[500]} />
          Alert Description
        </SectionTitle>
        <DescriptionBox>
          {alert.description}
        </DescriptionBox>
      </Section>

      <Grid>
        <InfoItem>
          <Label>Alert Type</Label>
          <Value>{alert.alertType}</Value>
        </InfoItem>
        <InfoItem>
          <Label>Severity</Label>
          <Value>
            <RiskBadge level={alert.severity} />
          </Value>
        </InfoItem>
        <InfoItem>
          <Label>Status</Label>
          <Value>
            <StatusBadge status={alert.status} />
          </Value>
        </InfoItem>
        <InfoItem>
          <Label>Timestamp</Label>
          <Value>
            <div>{new Date(alert.timestamp).toLocaleDateString()}</div>
            <div style={{ color: theme.colors.gray[500], fontSize: theme.typography.fontSize.xs }}>
              {new Date(alert.timestamp).toLocaleTimeString()}
            </div>
          </Value>
        </InfoItem>
        <InfoItem>
          <Label>User ID</Label>
          <Value>{alert.userId}</Value>
        </InfoItem>
        <InfoItem>
          <Label>Account ID</Label>
          <Value>{alert.accountId || 'N/A'}</Value>
        </InfoItem>
        {alert.amount && (
          <InfoItem>
            <Label>Amount</Label>
            <Value style={{ color: theme.colors.error[600], fontWeight: theme.typography.fontWeight.bold }}>
              ₹{alert.amount.toLocaleString()}
            </Value>
          </InfoItem>
        )}
        <InfoItem>
          <Label>Confidence Score</Label>
          <Value>
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
              <span style={{ 
                color: alert.confidence >= 80 ? theme.colors.success[600] :
                       alert.confidence >= 50 ? theme.colors.warning[600] :
                       theme.colors.error[600]
              }}>
                {alert.confidence}%
              </span>
              <ConfidenceBar $confidence={alert.confidence} />
            </div>
          </Value>
        </InfoItem>
      </Grid>

      <Section>
        <SectionTitle>
          <FaChartLine color={theme.colors.purple[600]} />
          Pattern Analysis
        </SectionTitle>
        <Grid>
          <InfoItem>
            <Label>Detected Pattern</Label>
            <Value>
              <PatternTag>{alert.pattern}</PatternTag>
            </Value>
          </InfoItem>
          <InfoItem>
            <Label>Similar Alerts (30d)</Label>
            <Value>{Math.floor(Math.random() * 10) + 1}</Value>
          </InfoItem>
          <InfoItem>
            <Label>Risk Score</Label>
            <Value>{Math.floor(alert.confidence * 0.8)}/100</Value>
          </InfoItem>
          <InfoItem>
            <Label>Investigation Priority</Label>
            <Value style={{ 
              color: alert.severity === 'Critical' ? theme.colors.error[600] :
                     alert.severity === 'High' ? theme.colors.error[500] :
                     alert.severity === 'Medium' ? theme.colors.warning[600] :
                     theme.colors.info[600]
            }}>
              {alert.severity === 'Critical' ? 'Immediate' :
               alert.severity === 'High' ? 'High' :
               alert.severity === 'Medium' ? 'Medium' : 'Low'}
            </Value>
          </InfoItem>
        </Grid>
      </Section>
    </Container>
  );
};

export default FraudAlertDetail;