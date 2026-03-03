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
import MetricCard from '../components/common/MetricCard';
import BarChart from '../components/charts/BarChart';
import PieChart from '../components/charts/PieChart';
import { theme } from '../styles/theme_cr';
import { usePagination, useSorting, useFilters } from '../hooks';
import { SODViolation } from '../types';
import { FaExclamationTriangle, FaShieldAlt, FaUsers, FaClock, FaCheckCircle } from 'react-icons/fa';

const PageContainer = styled.div`
  padding: ${theme.spacing.xl};
  height: 100%;
  overflow-y: auto;
  background: ${theme.colors.background.primary};
  
  /* Smooth scrolling */
  scroll-behavior: smooth;
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
    const now = new Date();
    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const lastMonthViolations = sodViolations.filter(v => new Date(v.detectionDate) > monthAgo);
    const previousMonthViolations = sodViolations.filter(v => {
      const violationDate = new Date(v.detectionDate);
      return violationDate <= monthAgo && violationDate > new Date(monthAgo.setMonth(monthAgo.getMonth() - 1));
    });

    const monthlyTrend = previousMonthViolations.length > 0 
      ? ((lastMonthViolations.length - previousMonthViolations.length) / previousMonthViolations.length * 100).toFixed(1)
      : '0';

    return {
      totalViolations: sodViolations.length,
      highRisk: sodViolations.filter(v => v.riskLevel === 'High').length,
      mediumRisk: sodViolations.filter(v => v.riskLevel === 'Medium').length,
      lowRisk: sodViolations.filter(v => v.riskLevel === 'Low').length,
      openViolations: sodViolations.filter(v => v.status === 'Open').length,
      inReviewViolations: sodViolations.filter(v => v.status === 'In Review').length,
      resolvedViolations: sodViolations.filter(v => v.status === 'Resolved').length,
      affectedUsers: new Set(sodViolations.flatMap(v => v.users)).size,
      avgResolutionDays: 15,
      lastMonthViolations: lastMonthViolations.length,
      monthlyTrend: monthlyTrend,
      resolutionRate: sodViolations.length > 0
        ? ((sodViolations.filter(v => v.status === 'Resolved').length / sodViolations.length) * 100).toFixed(1)
        : '0',
    };
  }, [sodViolations]);

  // Chart data
  const riskLevelData = useMemo(() => {
    return [
      { name: 'High', value: metrics.highRisk },
      { name: 'Medium', value: metrics.mediumRisk },
      { name: 'Low', value: metrics.lowRisk },
    ];
  }, [metrics]);

  const statusData = useMemo(() => {
    return [
      { name: 'Open', value: metrics.openViolations },
      { name: 'In Review', value: metrics.inReviewViolations },
      { name: 'Resolved', value: metrics.resolvedViolations },
    ];
  }, [metrics]);

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
        <MetricCard
          label="Total Violations"
          value={metrics.totalViolations}
          icon={<FaExclamationTriangle />}
          trend={{ value: parseFloat(metrics.monthlyTrend), isPositive: parseFloat(metrics.monthlyTrend) >= 0, label: 'vs last month' }}
          color="primary"
        />
        <MetricCard
          label="High Risk"
          value={metrics.highRisk}
          icon={<FaShieldAlt />}
          subtext="Requires immediate action"
          color="error"
        />
        <MetricCard
          label="Affected Users"
          value={metrics.affectedUsers}
          icon={<FaUsers />}
          subtext="Unique users"
          color="warning"
        />
        <MetricCard
          label="Resolution Rate"
          value={`${metrics.resolutionRate}%`}
          icon={<FaCheckCircle />}
          subtext={`${metrics.resolvedViolations} resolved`}
          color="success"
        />
      </MetricGrid>

      <GridContainer>
        <ChartCard $colspan={6}>
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
        <ChartCard $colspan={6}>
          <ChartTitle>Violations by Status</ChartTitle>
          <PieChart
            data={statusData}
            colors={[
              theme.colors.error[500],
              theme.colors.warning[500],
              theme.colors.success[500],
            ]}
            height={250}
          />
        </ChartCard>
        <ChartCard $colspan={12}>
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