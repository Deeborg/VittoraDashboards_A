import React from 'react';
import styled from 'styled-components';
import { FaArrowLeft } from 'react-icons/fa';
import { theme } from '../../styles/theme_cr';

// ... rest of the component remains the same

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${theme.spacing.xl};
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const Title = styled.h2`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.gray[900]};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const Subtitle = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[500]};
  margin: 0;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'outline' }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;

  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: ${theme.colors.primary[600]};
          color: white;
          &:hover {
            background: ${theme.colors.primary[700]};
          }
        `;
      case 'secondary':
        return `
          background: ${theme.colors.gray[100]};
          color: ${theme.colors.gray[700]};
          &:hover {
            background: ${theme.colors.gray[200]};
          }
        `;
      case 'outline':
        return `
          background: transparent;
          color: ${theme.colors.gray[700]};
          border: 1px solid ${theme.colors.gray[300]};
          &:hover {
            background: ${theme.colors.gray[50]};
          }
        `;
      default:
        return `
          background: ${theme.colors.primary[600]};
          color: white;
          &:hover {
            background: ${theme.colors.primary[700]};
          }
        `;
    }
  }}
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: ${theme.borderRadius.full};
  background: ${theme.colors.gray[100]};
  color: ${theme.colors.gray[600]};
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${theme.colors.gray[200]};
    color: ${theme.colors.gray[900]};
  }
`;

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    icon?: React.ReactNode;
  }>;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showBackButton,
  onBack,
  actions = [],
}) => {
  return (
    <HeaderContainer>
      <TitleSection>
        <Title>
          {showBackButton && (
            <BackButton onClick={onBack}>
              <FaArrowLeft size={14} />
            </BackButton>
          )}
          {title}
        </Title>
        {subtitle && <Subtitle>{subtitle}</Subtitle>}
      </TitleSection>
      <Actions>
        {actions.map((action, index) => (
          <Button
            key={index}
            $variant={action.variant}
            onClick={action.onClick}
          >
            {action.icon}
            {action.label}
          </Button>
        ))}
      </Actions>
    </HeaderContainer>
  );
};

export default PageHeader;