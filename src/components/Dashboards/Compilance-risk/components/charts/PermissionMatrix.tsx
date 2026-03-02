import React from 'react';
import styled from 'styled-components';
import { FaCheck, FaTimes, FaMinus } from 'react-icons/fa';
import { theme } from '../../styles/theme_cr';

const MatrixContainer = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const Matrix = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: ${theme.typography.fontSize.sm};
`;

const Th = styled.th`
  padding: ${theme.spacing.md} ${theme.spacing.sm};
  background: ${theme.colors.gray[50]};
  color: ${theme.colors.gray[700]};
  font-weight: ${theme.typography.fontWeight.medium};
  text-align: left;
  border-bottom: 1px solid ${theme.colors.gray[200]};
`;

const Td = styled.td`
  padding: ${theme.spacing.md} ${theme.spacing.sm};
  border-bottom: 1px solid ${theme.colors.gray[200]};
`;

const PermissionIcon = styled.div<{ $hasAccess: boolean; $partial?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: ${theme.borderRadius.full};
  background: ${props => {
    if (props.$hasAccess) return theme.colors.success[50];
    if (props.$partial) return theme.colors.warning[50];
    return theme.colors.error[50];
  }};
  color: ${props => {
    if (props.$hasAccess) return theme.colors.success[600];
    if (props.$partial) return theme.colors.warning[600];
    return theme.colors.error[600];
  }};
`;

const RoleCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const RoleName = styled.span`
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.gray[900]};
`;

const RoleDescription = styled.span`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.gray[500]};
`;

interface PermissionMatrixProps {
  data: {
    roles: Array<{
      id: string;
      name: string;
      description: string;
    }>;
    permissions: Array<{
      id: string;
      name: string;
      category: string;
    }>;
    matrix: Record<string, Record<string, 'full' | 'partial' | 'none'>>;
  };
}

const PermissionMatrix: React.FC<PermissionMatrixProps> = ({ data }) => {
  const getPermissionIcon = (access: 'full' | 'partial' | 'none') => {
    switch (access) {
      case 'full':
        return (
          <PermissionIcon $hasAccess={true}>
            <FaCheck size={12} />
          </PermissionIcon>
        );
      case 'partial':
        return (
          <PermissionIcon $hasAccess={false} $partial={true}>
            <FaMinus size={12} />
          </PermissionIcon>
        );
      case 'none':
        return (
          <PermissionIcon $hasAccess={false}>
            <FaTimes size={12} />
          </PermissionIcon>
        );
    }
  };

  // Group permissions by category
  const groupedPermissions = data.permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, typeof data.permissions>);

  return (
    <MatrixContainer>
      <Matrix>
        <thead>
          <tr>
            <Th>Permissions</Th>
            {data.roles.map((role) => (
              <Th key={role.id}>
                <RoleCell>
                  <RoleName>{role.name}</RoleName>
                  <RoleDescription>{role.description}</RoleDescription>
                </RoleCell>
              </Th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(groupedPermissions).map(([category, permissions]) => (
            <React.Fragment key={category}>
              <tr>
                <Td colSpan={data.roles.length + 1} style={{ background: theme.colors.gray[50] }}>
                  <strong>{category}</strong>
                </Td>
              </tr>
              {permissions.map((permission) => (
                <tr key={permission.id}>
                  <Td>{permission.name}</Td>
                  {data.roles.map((role) => (
                    <Td key={role.id}>
                      {getPermissionIcon(data.matrix[role.id]?.[permission.id] || 'none')}
                    </Td>
                  ))}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </Matrix>
    </MatrixContainer>
  );
};

export default PermissionMatrix;