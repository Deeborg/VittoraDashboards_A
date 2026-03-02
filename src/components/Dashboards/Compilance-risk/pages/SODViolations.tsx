import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { useData } from '../context/DataContext';
import PageHeader from '../components/common/PageHeader';
import FilterBar from '../components/common/FilterBar';
import { DataTable } from '../components/common/DataTable';
import RiskBadge from '../components/common/RiskBadge';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import SODViolationDetail from '../components/modals/SODViolationDetail';
import { BarChart, PieChart } from '../components/charts';
import { theme } from '../styles/theme_cr';
import { usePagination, useSorting, useFilters } from '../hooks';
import { SODViolation } from '../types';

const PageContainer = styled.div`
  padding: ${theme.spacing.xl};
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
  min-height: 500px;

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
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.gray[900]};
  margin-bottom: ${theme.spacing.md};
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

const MetricValue = styled.div<{ $color?: string }>`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${props => props.$color || theme.colors.gray[900]};
  margin-bottom: ${theme.spacing.xs};
`;

const MetricLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[500]};
`;

const MetricSubtext = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.gray[400]};
  margin-top: ${theme.spacing.xs};
`;

const SODViolations: React.FC = () => {
  const { sodViolations } = useData();
  const [selectedViolation, setSelectedViolation] = useState<SODViolation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter configuration
  const filterConfig = [
    {
      key: 'riskLevel',
      label: 'Risk Level',
      type: 'select' as const,
      options: ['High', 'Medium', 'Low'],
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: ['Open', 'In Review', 'Resolved'],
    },
    {
      key: 'conflictType',
      label: 'Conflict Type',
      type: 'select' as const,
      options: [
        'PO Creation & Approval',
        'Vendor Master Creation & Payment Processing',
        'Financial Statement Preparation & Approval',
        'User Administration & Security Configuration',
        'Inventory Management & Goods Receipt',
        'PO Creation & Goods Receipt'
      ],
    },
  ];

  const { filters, filteredData, updateFilter, clearFilters } = useFilters(
    sodViolations,
    filterConfig
  );

  const { sortedData, sortConfig, handleSort } = useSorting(filteredData, {
    key: 'detectionDate',
    direction: 'desc',
  });

  const { paginatedData, pagination } = usePagination(sortedData, 5);

  // Calculate metrics
  const metrics = useMemo(() => {
    return {
      totalViolations: sodViolations.length,
      highRisk: sodViolations.filter(v => v.riskLevel === 'High').length,
      openViolations: sodViolations.filter(v => v.status === 'Open').length,
      avgResolutionDays: 15, // Mocked value
    };
  }, [sodViolations]);

  // Chart data
  const riskLevelData = useMemo(() => {
    const counts = { High: 0, Medium: 0, Low: 0 };
    sodViolations.forEach(v => {
      counts[v.riskLevel]++;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [sodViolations]);

  const conflictTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    sodViolations.forEach(v => {
      counts[v.conflictType] = (counts[v.conflictType] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name: name.substring(0, 30) + '...', value }))
      .slice(0, 5);
  }, [sodViolations]);

  const columns = [
    {
      key: 'conflictType',
      header: 'Conflict Type',
      sortable: true,
      render: (item: SODViolation) => (
        <span style={{ fontWeight: theme.typography.fontWeight.medium }}>
          {item.conflictType}
        </span>
      ),
    },
    {
      key: 'riskLevel',
      header: 'Risk Level',
      sortable: true,
      render: (item: SODViolation) => <RiskBadge level={item.riskLevel} />,
    },
    {
      key: 'users',
      header: 'Affected Users',
      sortable: true,
      render: (item: SODViolation) => item.users.join(', '),
    },
    {
      key: 'detectionDate',
      header: 'Detection Date',
      sortable: true,
      render: (item: SODViolation) => new Date(item.detectionDate).toLocaleDateString(),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item: SODViolation) => <StatusBadge status={item.status} />,
    },
    {
      key: 'systems',
      header: 'Systems',
      render: (item: SODViolation) => item.systems.join(', '),
    },
  ];

  const handleRowClick = (violation: SODViolation) => {
    setSelectedViolation(violation);
    setIsModalOpen(true);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Segregation of Duties Violations"
        subtitle="Monitor and resolve access control conflicts"
        actions={[
          {
            label: 'Export Report',
            onClick: () => console.log('Export report'),
            variant: 'secondary',
          },
          {
            label: 'Run Analysis',
            onClick: () => console.log('Run analysis'),
            variant: 'primary',
          },
        ]}
      />

      <MetricGrid>
        <MetricCard>
          <MetricValue>{metrics.totalViolations}</MetricValue>
          <MetricLabel>Total Violations</MetricLabel>
          <MetricSubtext>+12% from last month</MetricSubtext>
        </MetricCard>
        <MetricCard>
          <MetricValue $color={theme.colors.error[600]}>{metrics.highRisk}</MetricValue>
          <MetricLabel>High Risk</MetricLabel>
          <MetricSubtext>Requires immediate action</MetricSubtext>
        </MetricCard>
        <MetricCard>
          <MetricValue $color={theme.colors.warning[600]}>{metrics.openViolations}</MetricValue>
          <MetricLabel>Open Violations</MetricLabel>
          <MetricSubtext>{((metrics.openViolations / metrics.totalViolations) * 100).toFixed(1)}% of total</MetricSubtext>
        </MetricCard>
        <MetricCard>
          <MetricValue>{metrics.avgResolutionDays}</MetricValue>
          <MetricLabel>Avg Resolution Days</MetricLabel>
          <MetricSubtext>Target: 10 days</MetricSubtext>
        </MetricCard>
      </MetricGrid>

      <GridContainer>
        <ChartCard $colspan={5}>
          <ChartTitle>Violations by Risk Level</ChartTitle>
          <PieChart
            data={riskLevelData}
            colors={[
              theme.colors.error[500],
              theme.colors.warning[500],
              theme.colors.success[500],
            ]}
            height={250}
          />
        </ChartCard>
        <ChartCard $colspan={7}>
          <ChartTitle>Top Conflict Types</ChartTitle>
          <BarChart
            data={conflictTypeData}
            xAxisKey="name"
            series={[{ key: 'value', name: 'Count', color: theme.colors.primary[500] }]}
            height={350}
          />
        </ChartCard>
      </GridContainer>

      <FilterBar
        filters={filters}
        onFilterChange={updateFilter}
        onClearFilters={clearFilters}
        filterConfig={filterConfig}
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
        title="SOD Violation Details"
        size="lg"
      >
        {selectedViolation && (
          <SODViolationDetail
            violation={selectedViolation}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </Modal>
    </PageContainer>
  );
};

export default SODViolations;