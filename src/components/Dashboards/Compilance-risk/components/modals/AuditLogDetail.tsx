import React from 'react';
import styled from 'styled-components';
import { FaNetworkWired, FaInfoCircle } from 'react-icons/fa';
import { AuditLog } from '../../types';
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

const DetailsBox = styled.div`
  padding: ${theme.spacing.lg};
  background: ${theme.colors.gray[50]};
  border-radius: ${theme.borderRadius.lg};
  border-left: 3px solid ${theme.colors.primary[500]};
  font-family: ${theme.typography.fontFamily.mono};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[700]};
  line-height: 1.6;
  white-space: pre-wrap;
`;

interface AuditLogDetailProps {
  log: AuditLog;
  onClose: () => void;
}

const AuditLogDetail: React.FC<AuditLogDetailProps> = ({ log}) => {
  return (
    <Container>
      <Section>
        <SectionTitle>
          <FaInfoCircle color={theme.colors.primary[600]} />
          Event Details
        </SectionTitle>
        <DetailsBox>
          {log.details}
        </DetailsBox>
      </Section>

      <Grid>
        <InfoItem>
          <Label>Timestamp</Label>
          <Value>
            <div>{new Date(log.timestamp).toLocaleDateString()}</div>
            <div style={{ color: theme.colors.gray[500], fontSize: theme.typography.fontSize.xs }}>
              {new Date(log.timestamp).toLocaleTimeString()}
            </div>
          </Value>
        </InfoItem>
        <InfoItem>
          <Label>Status</Label>
          <Value>
            <StatusBadge status={log.status} />
          </Value>
        </InfoItem>
        <InfoItem>
          <Label>User</Label>
          <Value>{log.user}</Value>
        </InfoItem>
        <InfoItem>
          <Label>Action</Label>
          <Value>{log.action}</Value>
        </InfoItem>
        <InfoItem>
          <Label>Resource</Label>
          <Value>{log.resource}</Value>
        </InfoItem>
        <InfoItem>
          <Label>IP Address</Label>
          <Value>{log.ipAddress}</Value>
        </InfoItem>
      </Grid>

      <Section>
        <SectionTitle>
          <FaNetworkWired color={theme.colors.secondary[600]} />
          Technical Details
        </SectionTitle>
        <Grid>
          <InfoItem>
            <Label>Event ID</Label>
            <Value>{log.id}</Value>
          </InfoItem>
          <InfoItem>
            <Label>User Agent</Label>
            <Value>Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36</Value>
          </InfoItem>
          <InfoItem>
            <Label>Session ID</Label>
            <Value>sess_{Math.random().toString(36).substring(7)}</Value>
          </InfoItem>
          <InfoItem>
            <Label>Device</Label>
            <Value>Desktop - Chrome 120.0</Value>
          </InfoItem>
        </Grid>
      </Section>
    </Container>
  );
};

export default AuditLogDetail;