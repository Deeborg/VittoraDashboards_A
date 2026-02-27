import React from 'react';
import styled from 'styled-components';
import { FaBell, FaUserCircle, FaCog, FaSearch, FaShieldAlt } from 'react-icons/fa';
import { useData } from '../../context/DataContext';
import { theme } from '../../styles/theme';

const HeaderContainer = styled.header`
  background: ${theme.colors.background.card};
  border-bottom: 1px solid ${theme.colors.border.medium};
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: ${theme.shadows.md};
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${theme.spacing.md};
`;

const BottomRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  
  svg {
    color: ${theme.colors.primary[400]};
  }
`;

const LogoSubtext = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.normal};
  color: ${theme.colors.text.tertiary};
  margin-left: ${theme.spacing.xs};
`;

const Title = styled.h1`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin: 0;
  background: linear-gradient(135deg, #60a5fa 0%, #c084fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const UserActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const IconButton = styled.button`
  background: ${theme.colors.background.secondary};
  border: 1px solid ${theme.colors.border.medium};
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.xl};
  color: ${theme.colors.text.secondary};
  cursor: pointer;
  transition: ${theme.transitions.base};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 40px;
  height: 40px;

  &:hover {
    background: ${theme.colors.background.hover};
    color: ${theme.colors.text.primary};
    border-color: ${theme.colors.primary[600]};
    transform: scale(1.05);
  }
`;

const Badge = styled.span`
  position: absolute;
  top: 4px;
  right: 4px;
  background: ${theme.colors.error[500]};
  color: white;
  font-size: ${theme.typography.fontSize.xs};
  padding: 0.125rem 0.375rem;
  border-radius: ${theme.borderRadius.full};
  min-width: 1.25rem;
  text-align: center;
  font-weight: ${theme.typography.fontWeight.medium};
  box-shadow: ${theme.shadows.sm};
  border: 2px solid ${theme.colors.background.card};
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.xs} ${theme.spacing.sm} ${theme.spacing.xs} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.xl};
  cursor: pointer;
  transition: ${theme.transitions.base};
  background: ${theme.colors.background.secondary};
  border: 1px solid ${theme.colors.border.medium};

  &:hover {
    background: ${theme.colors.background.hover};
    border-color: ${theme.colors.primary[600]};
  }
`;

const UserName = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
`;

const MetricCards = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  flex-wrap: wrap;
`;

const MetricCard = styled.div<{ $color: string }>`
  background: ${theme.colors.background.secondary};
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.xl};
  border: 1px solid ${theme.colors.border.medium};
  min-width: 120px;
  text-align: center;
  position: relative;
  overflow: hidden;
  box-shadow: ${theme.shadows.sm};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => props.$color};
  }
`;

const MetricLabel = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.tertiary};
  margin-bottom: ${theme.spacing.xs};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const MetricValue = styled.div<{ $textColor: string }>`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${props => props.$textColor};
`;

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  max-width: 400px;
  width: 100%;
`;

const SearchInput = styled.input`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  padding-left: 2.5rem;
  border: 1px solid ${theme.colors.border.medium};
  border-radius: ${theme.borderRadius.xl};
  width: 100%;
  font-size: ${theme.typography.fontSize.sm};
  transition: ${theme.transitions.base};
  height: 40px;
  background: ${theme.colors.background.secondary};
  color: ${theme.colors.text.primary};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    background: ${theme.colors.background.hover};
  }

  &::placeholder {
    color: ${theme.colors.text.muted};
  }
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: ${theme.spacing.sm};
  color: ${theme.colors.text.muted};
  pointer-events: none;
`;

interface HeaderProps {
  pageTitle: string;
}

const Header: React.FC<HeaderProps> = ({ pageTitle }) => {
  const { 
    sodViolations, 
    fraudAlerts, 
    auditFindings, 
    statutoryFilings 
  } = useData();

  const openViolations = sodViolations.filter(v => v.status === 'Open').length;
  const criticalAlerts = fraudAlerts.filter(a => a.severity === 'Critical' && a.status === 'New').length;
  const overdueFilings = statutoryFilings.filter(f => f.status === 'Overdue').length;
  const openFindings = auditFindings.filter(f => f.status === 'Open').length;

  return (
    <HeaderContainer>
      <TopRow>
        <Logo>
          <FaShieldAlt size={24} />
          Compliance and Risk Management
          <LogoSubtext></LogoSubtext>
        </Logo>
        <UserActions>
          <IconButton>
            <FaBell size={18} />
            <Badge>5</Badge>
          </IconButton>
          <IconButton>
            <FaCog size={18} />
          </IconButton>
          
        </UserActions>
      </TopRow>
      
      <BottomRow>
        <Title>{pageTitle}</Title>
        <SearchContainer>
          <SearchIcon size={16} />
          <SearchInput placeholder="Search compliance data..." />
        </SearchContainer>
      </BottomRow>
<span style={{ marginBottom: theme.spacing.md }}></span>
      <MetricCards>
        <MetricCard $color={theme.colors.error[500]}>
          <MetricLabel>SOD Violations</MetricLabel>
          <MetricValue $textColor={theme.colors.error[400]}>{openViolations}</MetricValue>
        </MetricCard>
        <MetricCard $color={theme.colors.error[500]}>
          <MetricLabel>Critical Alerts</MetricLabel>
          <MetricValue $textColor={theme.colors.error[400]}>{criticalAlerts}</MetricValue>
        </MetricCard>
        <MetricCard $color={theme.colors.warning[500]}>
          <MetricLabel>Overdue Filings</MetricLabel>
          <MetricValue $textColor={theme.colors.warning[400]}>{overdueFilings}</MetricValue>
        </MetricCard>
        <MetricCard $color={theme.colors.info[500]}>
          <MetricLabel>Open Findings</MetricLabel>
          <MetricValue $textColor={theme.colors.info[400]}>{openFindings}</MetricValue>
        </MetricCard>
      </MetricCards>
    </HeaderContainer>
  );
};

export default Header;