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
  background: ${theme.colors.primary[900]};
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
  border-bottom: 1px solid ${theme.colors.primary[800]};
  flex-shrink: 0;
  background: ${theme.colors.primary[900]};
`;

const Logo = styled.div`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: white;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  
  svg {
    color: ${theme.colors.primary[400]};
    font-size: 28px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  }
`;

const LogoSubtext = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.normal};
  color: rgba(255, 255, 255, 0.6);
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
    background: ${theme.colors.primary[800]};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.primary[500]};
    border-radius: ${theme.borderRadius.full};
    
    &:hover {
      background: ${theme.colors.primary[400]};
    }
  }
`;

const NavItem = styled.div<{ $active: boolean }>`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.xl};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  color: ${props => props.$active ? 'white' : 'rgba(255, 255, 255, 0.8)'};
  background: ${props => props.$active ? theme.colors.primary[700] : 'transparent'};
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: ${props => props.$active ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.normal};
  position: relative;
  border: 1px solid ${props => props.$active ? theme.colors.primary[600] : 'transparent'};
  box-shadow: ${props => props.$active ? '0 4px 8px rgba(0, 0, 0, 0.2)' : 'none'};

  &:hover {
    background: ${theme.colors.primary[700]};
    color: white;
    transform: translateX(6px);
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  /* Left accent bar */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 20%;
    bottom: 20%;
    width: 4px;
    background: ${props => props.$active ? theme.colors.primary[400] : 'transparent'};
    border-radius: 0 ${theme.borderRadius.full} ${theme.borderRadius.full} 0;
    transition: all 0.2s ease;
  }

  &:hover::before {
    background: ${theme.colors.primary[400]};
    top: 10%;
    bottom: 10%;
  }

  svg {
    font-size: 1.25rem;
    color: ${props => props.$active ? 'white' : 'rgba(255, 255, 255, 0.7)'};
    transition: transform 0.2s ease;
  }

  &:hover svg {
    transform: scale(1.1);
    color: white;
  }
`;

const NavLabel = styled.span`
  flex: 1;
  letter-spacing: 0.3px;
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
  font-weight: ${theme.typography.fontWeight.semibold};
  box-shadow: ${theme.shadows.sm};
  min-width: 24px;
  text-align: center;
  transition: all 0.2s ease;

  ${NavItem}:hover & {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
`;

const FooterArea = styled.div`
  padding: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.primary[800]};
  flex-shrink: 0;
  background: ${theme.colors.primary[900]};
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.xl};
  background: ${theme.colors.primary[800]};
  border: 1px solid ${theme.colors.primary[700]};
  transition: all 0.2s ease;

  &:hover {
    background: ${theme.colors.primary[700]};
    border-color: ${theme.colors.primary[600]};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
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
  border: 2px solid ${theme.colors.primary[400]};
  transition: all 0.2s ease;

  ${UserProfile}:hover & {
    border-color: ${theme.colors.primary[300]};
    transform: scale(1.05);
  }
`;

const UserDetails = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: white;
`;

const UserRole = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: rgba(255, 255, 255, 0.7);
`;

const LogoutButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: ${theme.colors.error[700]};
    color: white;
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
`;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleNavigation = (path: string) => {
    navigate(path);
  };
  
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
            onClick={() => handleNavigation(item.path)}
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