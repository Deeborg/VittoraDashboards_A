import React from 'react';
import styled from 'styled-components';
import { FaClipboardCheck, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { AuditFinding } from '../../types';
import RiskBadge from '../common/RiskBadge';
import StatusBadge from '../common/StatusBadge';
import { theme } from '../../styles/theme_cr';

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
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[700]};
  line-height: 1.6;
`;

const ActionBox = styled.div`
  padding: ${theme.spacing.lg};
  background: ${theme.colors.info[50]};
  border-radius: ${theme.borderRadius.lg};
  border-left: 3px solid ${theme.colors.info[500]};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[700]};
`;

const RootCauseBox = styled.div`
  padding: ${theme.spacing.lg};
  background: ${theme.colors.warning[50]};
  border-radius: ${theme.borderRadius.lg};
  border-left: 3px solid ${theme.colors.warning[500]};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[700]};
`;

const DepartmentTag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: ${theme.colors.primary[50]};
  color: ${theme.colors.primary[700]};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
`;

interface AuditFindingDetailProps {
  finding: AuditFinding;
  onClose: () => void;
}

const AuditFindingDetail: React.FC<AuditFindingDetailProps> = ({ finding}) => {
  const isOverdue = finding.status !== 'Closed' && new Date(finding.targetClosureDate) < new Date();

  return (
    <Container>
      <Section>
        <SectionTitle>
          <FaClipboardCheck color={theme.colors.primary[600]} />
          Finding Details
        </SectionTitle>
        <DescriptionBox>
          <div style={{ fontWeight: theme.typography.fontWeight.bold, marginBottom: theme.spacing.sm }}>
            {finding.findingTitle}
          </div>
          {finding.description}
        </DescriptionBox>
      </Section>

      <Grid>
        <InfoItem>
          <Label>Severity</Label>
          <Value>
            <RiskBadge level={finding.severity} />
          </Value>
        </InfoItem>
        <InfoItem>
          <Label>Status</Label>
          <Value>
            <StatusBadge status={finding.status} />
          </Value>
        </InfoItem>
        <InfoItem>
          <Label>Department</Label>
          <Value>
            <DepartmentTag>{finding.department}</DepartmentTag>
          </Value>
        </InfoItem>
        <InfoItem>
          <Label>Owner</Label>
          <Value>{finding.owner}</Value>
        </InfoItem>
        <InfoItem>
          <Label>Audit Date</Label>
          <Value>{new Date(finding.auditDate).toLocaleDateString()}</Value>
        </InfoItem>
        <InfoItem>
          <Label>Target Closure</Label>
          <Value style={{ color: isOverdue ? theme.colors.error[600] : theme.colors.gray[900] }}>
            {new Date(finding.targetClosureDate).toLocaleDateString()}
            {isOverdue && ' ⚠️ Overdue'}
          </Value>
        </InfoItem>
        {finding.actualClosureDate && (
          <InfoItem>
            <Label>Actual Closure</Label>
            <Value>{new Date(finding.actualClosureDate).toLocaleDateString()}</Value>
          </InfoItem>
        )}
      </Grid>

      {finding.rootCause && (
        <Section>
          <SectionTitle>
            <FaExclamationTriangle color={theme.colors.warning[600]} />
            Root Cause Analysis
          </SectionTitle>
          <RootCauseBox>
            {finding.rootCause}
          </RootCauseBox>
        </Section>
      )}

      {finding.correctiveAction && (
        <Section>
          <SectionTitle>
            <FaCheckCircle color={theme.colors.success[600]} />
            Corrective Action
          </SectionTitle>
          <ActionBox>
            {finding.correctiveAction}
          </ActionBox>
        </Section>
      )}

      <Section>
        <SectionTitle>Resolution Timeline</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
            <div style={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              background: theme.colors.success[500] 
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium }}>
                Finding Identified
              </div>
              <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.gray[500] }}>
                {new Date(finding.auditDate).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
            <div style={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              background: finding.status === 'Closed' ? theme.colors.success[500] : theme.colors.warning[500] 
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium }}>
                {finding.status === 'Closed' ? 'Resolved' : 'In Progress'}
              </div>
              <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.gray[500] }}>
                {finding.actualClosureDate ? new Date(finding.actualClosureDate).toLocaleDateString() : 'Pending'}
              </div>
            </div>
          </div>
        </div>
      </Section>
    </Container>
  );
};

export default AuditFindingDetail;