import React from 'react';
import styled from 'styled-components';
import { FaUser, FaExclamationTriangle, FaShieldAlt, FaClipboardCheck } from 'react-icons/fa';
import { SODViolation } from '../../types';
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

const Description = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[700]};
  line-height: 1.6;
  margin: 0;
  padding: ${theme.spacing.md};
  background: ${theme.colors.gray[50]};
  border-radius: ${theme.borderRadius.lg};
  border-left: 3px solid ${theme.colors.error[500]};
`;

const UserList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
`;

const UserTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: ${theme.colors.primary[50]};
  color: ${theme.colors.primary[700]};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const SystemTag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: ${theme.colors.gray[100]};
  color: ${theme.colors.gray[700]};
  border-radius: ${theme.borderRadius.base};
  font-size: ${theme.typography.fontSize.xs};
`;

const MitigatingControls = styled.div`
  padding: ${theme.spacing.md};
  background: ${theme.colors.info[50]};
  border-radius: ${theme.borderRadius.lg};
  color: ${theme.colors.info[700]};
  font-size: ${theme.typography.fontSize.sm};
  border-left: 3px solid ${theme.colors.info[500]};
`;

interface SODViolationDetailProps {
  violation: SODViolation;
  onClose: () => void;
}

const SODViolationDetail: React.FC<SODViolationDetailProps> = ({ violation}) => {
  return (
    <Container>
      <Section>
        <SectionTitle>
          <FaExclamationTriangle color={theme.colors.error[500]} />
          Violation Details
        </SectionTitle>
        <Description>{violation.description}</Description>
      </Section>

      <Grid>
        <InfoItem>
          <Label>Conflict Type</Label>
          <Value>{violation.conflictType}</Value>
        </InfoItem>
        <InfoItem>
          <Label>Risk Level</Label>
          <Value>
            <RiskBadge level={violation.riskLevel} />
          </Value>
        </InfoItem>
        <InfoItem>
          <Label>Status</Label>
          <Value>
            <StatusBadge status={violation.status} />
          </Value>
        </InfoItem>
        <InfoItem>
          <Label>Detection Date</Label>
          <Value>{new Date(violation.detectionDate).toLocaleDateString()}</Value>
        </InfoItem>
      </Grid>

      <Section>
        <SectionTitle>
          <FaUser color={theme.colors.primary[600]} />
          Affected Users
        </SectionTitle>
        <UserList>
          {violation.users.map((user) => (
            <UserTag key={user}>
              <FaUser size={10} />
              {user}
            </UserTag>
          ))}
        </UserList>
      </Section>

      <Section>
        <SectionTitle>
          <FaShieldAlt color={theme.colors.secondary[600]} />
          Affected Systems
        </SectionTitle>
        <UserList>
          {violation.systems.map((system) => (
            <SystemTag key={system}>{system}</SystemTag>
          ))}
        </UserList>
      </Section>

      {violation.mitigatingControls && (
        <Section>
          <SectionTitle>
            <FaClipboardCheck color={theme.colors.info[600]} />
            Mitigating Controls
          </SectionTitle>
          <MitigatingControls>
            {violation.mitigatingControls}
          </MitigatingControls>
        </Section>
      )}
    </Container>
  );
};

export default SODViolationDetail;