import React from 'react';
import styled from 'styled-components';
import { FaFileAlt, FaPaperclip } from 'react-icons/fa';
import { StatutoryFiling } from '../../types';
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

const NotesBox = styled.div`
  padding: ${theme.spacing.lg};
  background: ${theme.colors.gray[50]};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[700]};
  line-height: 1.6;
  border-left: 3px solid ${theme.colors.info[500]};
`;

const AttachmentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const AttachmentItem = styled.a`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.colors.gray[50]};
  border-radius: ${theme.borderRadius.lg};
  text-decoration: none;
  color: ${theme.colors.gray[700]};
  transition: all 0.2s ease;

  &:hover {
    background: ${theme.colors.gray[100]};
  }
`;

const AttachmentIcon = styled.div`
  color: ${theme.colors.primary[600]};
`;

const AttachmentInfo = styled.div`
  flex: 1;
`;

const AttachmentName = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const AttachmentSize = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.gray[500]};
`;

const RegulationBadge = styled.span<{ $type: string }>`
  display: inline-flex;
  align-items: center;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  background: ${props => {
    switch (props.$type) {
      case 'GST': return theme.colors.purple[50];
      case 'MCA': return theme.colors.blue[50];
      case 'SEBI': return theme.colors.primary[50];
      case 'Income Tax': return theme.colors.warning[50];
      default: return theme.colors.gray[100];
    }
  }};
  color: ${props => {
    switch (props.$type) {
      case 'GST': return theme.colors.purple[700];
      case 'MCA': return theme.colors.blue[700];
      case 'SEBI': return theme.colors.primary[700];
      case 'Income Tax': return theme.colors.warning[700];
      default: return theme.colors.gray[700];
    }
  }};
`;

interface FilingDetailProps {
  filing: StatutoryFiling;
  onClose: () => void;
}

const FilingDetail: React.FC<FilingDetailProps> = ({ filing}) => {
  // Mock attachments
  const attachments = [
    { name: 'GSTR-3B_January_2024.pdf', size: '2.4 MB' },
    { name: 'Payment_Receipt_IT12345.pdf', size: '456 KB' },
    { name: 'Annexure_A_Supporting.xlsx', size: '1.1 MB' },
  ];

  return (
    <Container>
      <Section>
        <SectionTitle>
          <FaFileAlt color={theme.colors.primary[600]} />
          Filing Information
        </SectionTitle>
        <Grid>
          <InfoItem>
            <Label>Filing Name</Label>
            <Value>{filing.filingName}</Value>
          </InfoItem>
          <InfoItem>
            <Label>Regulation</Label>
            <Value>
              <RegulationBadge $type={filing.regulationType}>
                {filing.regulationType}
              </RegulationBadge>
            </Value>
          </InfoItem>
          <InfoItem>
            <Label>Status</Label>
            <Value>
              <StatusBadge status={filing.status} />
            </Value>
          </InfoItem>
          <InfoItem>
            <Label>Assigned To</Label>
            <Value>{filing.assignedTo}</Value>
          </InfoItem>
          <InfoItem>
            <Label>Due Date</Label>
            <Value>{new Date(filing.dueDate).toLocaleDateString()}</Value>
          </InfoItem>
          {filing.submissionDate && (
            <InfoItem>
              <Label>Submitted On</Label>
              <Value>{new Date(filing.submissionDate).toLocaleDateString()}</Value>
            </InfoItem>
          )}
          {filing.amount && (
            <InfoItem>
              <Label>Amount</Label>
              <Value style={{ color: theme.colors.success[600], fontWeight: theme.typography.fontWeight.bold }}>
                ₹{filing.amount.toLocaleString()}
              </Value>
            </InfoItem>
          )}
        </Grid>
      </Section>

      {filing.notes && (
        <Section>
          <SectionTitle>Notes</SectionTitle>
          <NotesBox>{filing.notes}</NotesBox>
        </Section>
      )}

      <Section>
        <SectionTitle>
          <FaPaperclip color={theme.colors.secondary[600]} />
          Attachments
        </SectionTitle>
        <AttachmentList>
          {attachments.map((file, index) => (
            <AttachmentItem key={index} href="#">
              <AttachmentIcon>
                <FaFileAlt size={20} />
              </AttachmentIcon>
              <AttachmentInfo>
                <AttachmentName>{file.name}</AttachmentName>
                <AttachmentSize>{file.size}</AttachmentSize>
              </AttachmentInfo>
            </AttachmentItem>
          ))}
        </AttachmentList>
      </Section>

      <Section>
        <SectionTitle>Timeline</SectionTitle>
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
                Filing Created
              </div>
              <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.gray[500] }}>
                {new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
            <div style={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              background: filing.status === 'Submitted' ? theme.colors.success[500] : theme.colors.warning[500] 
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium }}>
                {filing.status === 'Submitted' ? 'Filed' : 'In Progress'}
              </div>
              <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.gray[500] }}>
                {filing.submissionDate ? new Date(filing.submissionDate).toLocaleDateString() : 'Pending'}
              </div>
            </div>
          </div>
        </div>
      </Section>
    </Container>
  );
};

export default FilingDetail;