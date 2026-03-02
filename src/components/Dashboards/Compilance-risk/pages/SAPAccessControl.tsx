import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { useData } from '../context/DataContext';
import PageHeader from '../components/common/PageHeader';
import FilterBar from '../components/common/FilterBar';
import { DataTable } from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import AccessPermissionDetail from '../components/modals/AccessPermissionDetail';
import PermissionMatrix from '../components/charts/PermissionMatrix';
import BarChart from '../components/charts/BarChart';
import PieChart from '../components/charts/PieChart';
import LineChart from '../components/charts/LineChart';
import { theme } from '../styles/theme_cr';
import { usePagination, useSorting, useFilters } from '../hooks';
import { AccessPermission } from '../types';
import { FaShieldAlt } from 'react-icons/fa';

const PageContainer = styled.div`
  padding: ${theme.spacing.xl};
  height: 100%;

  background: ${theme.colors.gray[50]};
  font-color: ${theme.colors.text.tertiary};
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
`;

const ChartCard = styled.div<{ $colspan?: number }>`
  grid-column: span ${props => props.$colspan || 6};
  background: white;
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.gray[200]};
  padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.sm};
  min-height: 400px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: ${theme.shadows.md};
    transform: translateY(-2px);
  }
`;


const ChartTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.gray[900]};
  margin-bottom: ${theme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
`;

const MetricCard = styled.div`
  background: white;
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.gray[200]};
  padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.sm};
`;
const MetricSubtext = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.gray[400]};
  margin-top: ${theme.spacing.xs};
`;

const MetricValue = styled.div<{ $color?: string }>`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${props => props.$color || theme.colors.gray[900]};
  margin-bottom: ${theme.spacing.xs};
`;

const MetricLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[500]};
`;

const SystemTag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: ${theme.colors.primary[50]};
  color: ${theme.colors.primary[700]};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  margin-right: ${theme.spacing.xs};
`;

const ComplianceStatus = styled.div<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.xs};
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

const SAPAccessControl: React.FC = () => {
  const { accessPermissions } = useData();
  const [selectedPermission, setSelectedPermission] = useState<AccessPermission | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter configuration
  const filterConfig = [
    {
      key: 'system',
      label: 'System',
      type: 'select' as const,
      options: ['SAP ECC', 'SAP S/4HANA', 'SAP GRC', 'SAP Security', 'SAP Fraud Management', 'SAP FICO', 'SAP MM'],
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: ['Active', 'Expired', 'Revoked', 'Pending'],
    },
    {
      key: 'complianceStatus',
      label: 'Compliance',
      type: 'select' as const,
      options: ['Compliant', 'Non-Compliant', 'Review Required'],
    },
    {
      key: 'role',
      label: 'Role',
      type: 'text' as const,
      placeholder: 'Search by role...',
    },
  ];

  const { filters, filteredData, updateFilter, clearFilters } = useFilters(
    accessPermissions,
    filterConfig
  );

  const { sortedData, sortConfig, handleSort } = useSorting(filteredData, {
    key: 'lastAccessed',
    direction: 'desc',
  });

 const { paginatedData, pagination } = usePagination(sortedData, 5);

  // Calculate metrics
  const metrics = useMemo(() => {
    return {
      totalUsers: accessPermissions.length,
      activePermissions: accessPermissions.filter(p => p.status === 'Active').length,
      compliant: accessPermissions.filter(p => p.complianceStatus === 'Compliant').length,
      nonCompliant: accessPermissions.filter(p => p.complianceStatus === 'Non-Compliant').length,
      reviewRequired: accessPermissions.filter(p => p.complianceStatus === 'Review Required').length,
      systems: Array.from(new Set(accessPermissions.map(p => p.system))).length,
      criticalRoles: accessPermissions.filter(p => 
        p.role.includes('Admin') || p.role.includes('Manager')
      ).length,
    };
  }, [accessPermissions]);

  // Chart data - Compliance status distribution
  const complianceData = useMemo(() => {
    return [
      { name: 'Compliant', value: metrics.compliant },
      { name: 'Non-Compliant', value: metrics.nonCompliant },
      { name: 'Review Required', value: metrics.reviewRequired },
    ];
  }, [metrics]);

  // Chart data - Access by system
  const systemData = useMemo(() => {
    const systemCounts: Record<string, number> = {};
    accessPermissions.forEach(p => {
      systemCounts[p.system] = (systemCounts[p.system] || 0) + 1;
    });
    return Object.entries(systemCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [accessPermissions]);

  // Chart data - Role distribution
  const roleData = useMemo(() => {
    const roleCounts: Record<string, number> = {};
    accessPermissions.forEach(p => {
      roleCounts[p.role] = (roleCounts[p.role] || 0) + 1;
    });
    return Object.entries(roleCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [accessPermissions]);

  // Permission matrix data
  const permissionMatrixData = useMemo(() => {
    
    const permissions = ['Create', 'Read', 'Update', 'Delete', 'Approve', 'Export'];
    
    const matrix: Record<string, Record<string, 'full' | 'partial' | 'none'>> = {};
    
    accessPermissions.slice(0, 5).forEach(( index) => {
      const roleId = `role-${index}`;
      matrix[roleId] = {};
      permissions.forEach(permName => {
        // Randomly assign permissions for demo
        const rand = Math.random();
        if (rand < 0.3) matrix[roleId][permName] = 'full';
        else if (rand < 0.6) matrix[roleId][permName] = 'partial';
        else matrix[roleId][permName] = 'none';
      });
    });

    return {
      roles: accessPermissions.slice(0, 5).map((p, index) => ({
        id: `role-${index}`,
        name: p.role,
        description: `Role for ${p.system}`,
      })),
      permissions: permissions.map((p, index) => ({
        id: p,
        name: p,
        category: index < 2 ? 'Basic' : index < 4 ? 'Advanced' : 'Administrative',
      })),
      matrix,
    };
  }, [accessPermissions]);

  const columns = [
    {
      key: 'userName',
      header: 'User',
      sortable: true,
      render: (item: AccessPermission) => (
        <span style={{ fontWeight: theme.typography.fontWeight.medium }}>
          {item.userName}
        </span>
      ),
    },
    {
      key: 'system',
      header: 'System',
      sortable: true,
      render: (item: AccessPermission) => (
        <SystemTag>{item.system}</SystemTag>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
    },
    {
      key: 'permissions',
      header: 'Permissions',
      render: (item: AccessPermission) => (
        <span style={{ color: theme.colors.gray[600] }}>
          {item.permissions.length} permissions
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item: AccessPermission) => <StatusBadge status={item.status} />,
    },
    {
      key: 'complianceStatus',
      header: 'Compliance',
      sortable: true,
      render: (item: AccessPermission) => (
        <ComplianceStatus $status={item.complianceStatus}>
          {item.complianceStatus}
        </ComplianceStatus>
      ),
    },
    {
      key: 'lastAccessed',
      header: 'Last Accessed',
      sortable: true,
      render: (item: AccessPermission) => new Date(item.lastAccessed).toLocaleDateString(),
    },
    {
      key: 'grantDate',
      header: 'Granted On',
      sortable: true,
      render: (item: AccessPermission) => new Date(item.grantDate).toLocaleDateString(),
    },
  ];

  const handleRowClick = (permission: AccessPermission) => {
    setSelectedPermission(permission);
    setIsModalOpen(true);
  };

  return (
    <PageContainer>
      <PageHeader
        title="SAP Access Control Summary"
        subtitle="Monitor user permissions and access compliance across SAP systems"
        actions={[
          {
            label: 'Run Access Review',
            onClick: () => console.log('Run access review'),
            variant: 'primary',
            icon: <FaShieldAlt />,
          },
          {
            label: 'Export Report',
            onClick: () => console.log('Export report'),
            variant: 'secondary',
          },
        ]}
      />

      <MetricGrid>
        <MetricCard>
          <MetricValue>{metrics.totalUsers}</MetricValue>
          <MetricLabel>Total Users</MetricLabel>
          <MetricSubtext>With SAP access</MetricSubtext>
        </MetricCard>
        <MetricCard>
          <MetricValue $color={theme.colors.success[600]}>{metrics.compliant}</MetricValue>
          <MetricLabel>Compliant</MetricLabel>
          <MetricSubtext>{((metrics.compliant / metrics.totalUsers) * 100).toFixed(1)}% of users</MetricSubtext>
        </MetricCard>
        <MetricCard>
          <MetricValue $color={theme.colors.error[600]}>{metrics.nonCompliant}</MetricValue>
          <MetricLabel>Non-Compliant</MetricLabel>
          <MetricSubtext>Requires immediate action</MetricSubtext>
        </MetricCard>
        <MetricCard>
          <MetricValue $color={theme.colors.warning[600]}>{metrics.reviewRequired}</MetricValue>
          <MetricLabel>Review Required</MetricLabel>
          <MetricSubtext>Pending assessment</MetricSubtext>
        </MetricCard>
      </MetricGrid>

      <GridContainer>
        <ChartCard $colspan={12}>
          <ChartTitle>Access by System</ChartTitle>
          <LineChart
            data={systemData}
            xAxisKey="name"
            series={[{ key: 'value', name: 'Users', color: theme.colors.primary[500] }]}
            height={260}
          />
        </ChartCard>
        <ChartCard $colspan={6}>
          <ChartTitle>Compliance Status</ChartTitle>
          <PieChart
            data={complianceData}
            colors={[
              theme.colors.success[500],
              theme.colors.error[500],
              theme.colors.warning[500],
            ]}
            height={220}
          />
        </ChartCard>
        
        <ChartCard $colspan={6}>
          <ChartTitle>Top Roles</ChartTitle>
          <BarChart
            data={roleData}
            xAxisKey="name"
            series={[{ key: 'value', name: 'Users', color: theme.colors.secondary[500] }]}
            height={250}
          />
        </ChartCard>
      </GridContainer>
<GridContainer>
      <ChartCard $colspan={12}>
        <ChartTitle>
          Permission Matrix
          <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.gray[500] }}>
            Showing sample of roles and permissions
          </span>
        </ChartTitle>
        <PermissionMatrix data={permissionMatrixData} />
      </ChartCard>
</GridContainer>
      <FilterBar
        filters={filters}
        onFilterChange={updateFilter}
        onClearFilters={clearFilters}
        filterConfig={filterConfig}
        showSearch={true}
        onSearch={(value) => updateFilter('search', value)}
        searchPlaceholder="Search by user or role..."
      />

      <DataTable
        columns={columns}
        data={paginatedData}
        onRowClick={handleRowClick}
        pagination={pagination}
        sortConfig={{
          key: sortConfig.key,
          direction: sortConfig.direction,
          onSort: handleSort,
        }}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Access Permission Details"
        size="lg"
      >
        {selectedPermission && (
          <AccessPermissionDetail
            permission={selectedPermission}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </Modal>
    </PageContainer>
  );
};

export default SAPAccessControl;