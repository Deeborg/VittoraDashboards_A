import React from 'react';
import styled from 'styled-components';
import { FaUser, FaShieldAlt, FaDatabase } from 'react-icons/fa';
import { AccessPermission } from '../../types';
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

const PermissionList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
`;

const PermissionTag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: ${theme.colors.primary[50]};
  color: ${theme.colors.primary[700]};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-family: ${theme.typography.fontFamily.mono};
`;

const ComplianceStatus = styled.div<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  background: ${props => {
    switch (props.$status) {
      case 'Compliant': return theme.colors.success[50];
      case 'Non-Compliant': return theme.colors.error[50];
      case 'Review Required': return theme.colors.warning[50];
      default: return theme.colors.gray[100];
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'Compliant': return theme.colors.success[700];
      case 'Non-Compliant': return theme.colors.error[700];
      case 'Review Required': return theme.colors.warning[700];
      default: return theme.colors.gray[700];
    }
  }};
`;

interface AccessPermissionDetailProps {
  permission: AccessPermission;
  onClose: () => void;
}

const AccessPermissionDetail: React.FC<AccessPermissionDetailProps> = ({ permission }) => {
  return (
    <Container>
      <Section>
        <SectionTitle>
          <FaUser color={theme.colors.primary[600]} />
          User Information
        </SectionTitle>
        <Grid>
          <InfoItem>
            <Label>User Name</Label>
            <Value>{permission.userName}</Value>
          </InfoItem>
          <InfoItem>
            <Label>User ID</Label>
            <Value>{permission.userId}</Value>
          </InfoItem>
          <InfoItem>
            <Label>System</Label>
            <Value>{permission.system}</Value>
          </InfoItem>
          <InfoItem>
            <Label>Role</Label>
            <Value>{permission.role}</Value>
          </InfoItem>
        </Grid>
      </Section>

      <Section>
        <SectionTitle>
          <FaShieldAlt color={theme.colors.secondary[600]} />
          Access Details
        </SectionTitle>
        <Grid>
          <InfoItem>
            <Label>Status</Label>
            <Value>
              <StatusBadge status={permission.status} />
            </Value>
          </InfoItem>
          <InfoItem>
            <Label>Compliance Status</Label>
            <Value>
              <ComplianceStatus $status={permission.complianceStatus}>
                {permission.complianceStatus}
              </ComplianceStatus>
            </Value>
          </InfoItem>
          <InfoItem>
            <Label>Grant Date</Label>
            <Value>{new Date(permission.grantDate).toLocaleDateString()}</Value>
          </InfoItem>
          <InfoItem>
            <Label>Expiry Date</Label>
            <Value>{permission.expiryDate ? new Date(permission.expiryDate).toLocaleDateString() : 'Never'}</Value>
          </InfoItem>
          <InfoItem>
            <Label>Last Accessed</Label>
            <Value>{new Date(permission.lastAccessed).toLocaleString()}</Value>
          </InfoItem>
        </Grid>
      </Section>

      <Section>
        <SectionTitle>
          <FaDatabase color={theme.colors.purple[600]} />
          Granted Permissions
        </SectionTitle>
        <PermissionList>
          {permission.permissions.map((perm, index) => (
            <PermissionTag key={index}>{perm}</PermissionTag>
          ))}
        </PermissionList>
      </Section>

      {permission.complianceStatus !== 'Compliant' && (
        <Section>
          <SectionTitle style={{ color: theme.colors.error[600] }}>
            Compliance Issues
          </SectionTitle>
          <div style={{ 
            padding: theme.spacing.md,
            background: theme.colors.error[50],
            borderRadius: theme.borderRadius.lg,
            color: theme.colors.error[700],
            fontSize: theme.typography.fontSize.sm
          }}>
            {permission.complianceStatus === 'Non-Compliant' ? (
              'This user has conflicting permissions that violate segregation of duties policies. Immediate review required.'
            ) : (
              'This access requires review due to recent policy changes or unusual activity patterns.'
            )}
          </div>
        </Section>
      )}
    </Container>
  );
};

export default AccessPermissionDetail;