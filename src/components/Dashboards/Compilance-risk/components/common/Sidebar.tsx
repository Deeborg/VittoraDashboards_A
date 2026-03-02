import React from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaChartLine,
  FaHistory,
  FaUsers,
  FaExclamationTriangle,
  FaShieldAlt,
  FaFileAlt,
  FaClipboardCheck,
  FaSignOutAlt,
} from 'react-icons/fa';
import { theme } from '../../styles/theme_cr';

const SidebarContainer = styled.aside`
  width: 275px;
  background: ${theme.colors.background.card};
  border-right: 1px solid ${theme.colors.border.medium};
  height: 93vh;
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
 
  box-shadow: ${theme.shadows.lg};
`;

const LogoArea = styled.div`
  padding: ${theme.spacing.xl};
  border-bottom: 1px solid ${theme.colors.border.medium};
  flex-shrink: 0;
  background: ${theme.colors.background.secondary};
`;

const Logo = styled.div`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  
  svg {
    color: ${theme.colors.primary[400]};
    font-size: 28px;
  }
`;

const LogoSubtext = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.normal};
  color: ${theme.colors.text.tertiary};
  margin-left: ${theme.spacing.xs};
`;

const NavList = styled.nav`
  flex: 1;
  padding: ${theme.spacing.lg} ${theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${theme.colors.background.secondary};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.primary[600]};
    border-radius: ${theme.borderRadius.full};
    
    &:hover {
      background: ${theme.colors.primary[500]};
    }
  }
`;

const NavItem = styled.div<{ $active: boolean }>`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.xl};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  color: ${props => props.$active ? theme.colors.text.primary : theme.colors.text.secondary};
  background: ${props => props.$active ? theme.colors.background.hover : 'transparent'};
  cursor: pointer;
  transition: ${theme.transitions.base};
  font-weight: ${props => props.$active ? theme.typography.fontWeight.medium : theme.typography.fontWeight.normal};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: ${props => props.$active ? theme.colors.primary[500] : 'transparent'};
    border-radius: 0 ${theme.borderRadius.full} ${theme.borderRadius.full} 0;
  }

  &:hover {
    background: ${theme.colors.background.hover};
    color: ${theme.colors.text.primary};
    transform: translateX(4px);
  }

  svg {
    font-size: 1.25rem;
    color: ${props => props.$active ? theme.colors.primary[400] : theme.colors.text.tertiary};
  }
`;

const NavLabel = styled.span`
  flex: 1;
`;

const Badge = styled.span<{ $variant?: 'error' | 'warning' | 'success' }>`
  background: ${props => {
    switch (props.$variant) {
      case 'error': return theme.colors.error[500];
      case 'warning': return theme.colors.warning[500];
      case 'success': return theme.colors.success[500];
      default: return theme.colors.primary[500];
    }
  }};
  color: white;
  font-size: ${theme.typography.fontSize.xs};
  padding: 0.25rem 0.5rem;
  border-radius: ${theme.borderRadius.full};
  font-weight: ${theme.typography.fontWeight.medium};
  box-shadow: ${theme.shadows.sm};
`;

const FooterArea = styled.div`
  padding: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.border.medium};
  flex-shrink: 0;
  background: ${theme.colors.background.secondary};
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.xl};
  background: ${theme.colors.background.card};
  border: 1px solid ${theme.colors.border.medium};
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.xl};
  background: ${theme.colors.primary[600]};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: ${theme.typography.fontWeight.bold};
  font-size: ${theme.typography.fontSize.lg};
`;

const UserDetails = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
`;

const UserRole = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.tertiary};
`;

const LogoutButton = styled.button`
  background: transparent;
  border: none;
  color: ${theme.colors.text.tertiary};
  cursor: pointer;
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: ${theme.transitions.base};

  &:hover {
    background: ${theme.colors.error[900]};
    color: ${theme.colors.error[400]};
    transform: scale(1.1);
  }
`;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    { path: '/analytics/risk/', label: 'Dashboard', icon: <FaChartLine /> },
    { path: 'audit-trail', label: 'Audit Trail', icon: <FaHistory /> },
    { path: 'sod-violations', label: 'SOD Violations', icon: <FaUsers />, badge: '12', badgeVariant: 'error' as const },
    { path: 'fraud-detection', label: 'Fraud Detection', icon: <FaExclamationTriangle />, badge: '5', badgeVariant: 'warning' as const },
    { path: 'sap-access', label: 'SAP Access Control', icon: <FaShieldAlt /> },
    { path: 'statutory-filings', label: 'Statutory Filings', icon: <FaFileAlt />, badge: '3', badgeVariant: 'warning' as const },
    { path: 'audit-points', label: 'Audit Points', icon: <FaClipboardCheck />, badge: '8', badgeVariant: 'error' as const },
  ];

  return (
    <SidebarContainer>
      <LogoArea>
        <Logo>
          <FaShieldAlt />
          Compliance and Risk Management
          <LogoSubtext></LogoSubtext>
        </Logo>
      </LogoArea>

      <NavList>
        {navItems.map((item) => (
          <NavItem
            key={item.path}
            $active={location.pathname === item.path}
            onClick={() => navigate(item.path)}
          >
            {item.icon}
            <NavLabel>{item.label}</NavLabel>
            {item.badge && (
              <Badge $variant={item.badgeVariant}>{item.badge}</Badge>
            )}
          </NavItem>
        ))}
      </NavList>

     
    </SidebarContainer>
  );
};

export default Sidebar;