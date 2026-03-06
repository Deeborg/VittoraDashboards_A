import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { useData } from '../context/DataContext';
import PageHeader from '../components/common/PageHeader';
import FilterBar from '../components/common/FilterBar';
import { DataTable } from '../components/common/DataTable';
import RiskBadge from '../components/common/RiskBadge';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import AuditFindingDetail from '../components/modals/AuditFindingDetail';
import MetricCard from '../components/common/MetricCard';
import BarChart from '../components/charts/BarChart';
import PieChart from '../components/charts/PieChart';
import { theme } from '../styles/theme_cr';
import { usePagination, useSorting, useFilters } from '../hooks';
import { AuditFinding } from '../types';
import { FaClipboardCheck, FaUserCheck, FaDownload, FaChartLine, FaExclamationTriangle, FaClock, FaCheckCircle } from 'react-icons/fa';

const PageContainer = styled.div`
  padding: ${theme.spacing.xl};
  height: 100%;
  width: 850px;
  overflow-y: auto;
  background: ${theme.colors.gray[50]};
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
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

const ChartHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${theme.spacing.lg};
  flex-shrink: 0;
`;

const ChartTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.gray[900]};
  margin: 0;
`;

const ChartBody = styled.div`
  flex: 1;
  min-height: 250px;
  position: relative;
`;

const DepartmentTag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: ${theme.colors.primary[50]};
  color: ${theme.colors.primary[700]};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const ProgressBar = styled.div<{ $percentage: number }>`
  width: 100%;
  height: 8px;
  background: ${theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.full};
  position: relative;
  overflow: hidden;
  margin: ${theme.spacing.sm} 0;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.$percentage}%;
    background: ${theme.colors.success[500]};
    border-radius: ${theme.borderRadius.full};
    transition: width 0.3s ease;
  }
`;

const LegendContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.lg};
  padding: ${theme.spacing.md};
  background: ${theme.colors.gray[50]};
  border-radius: ${theme.borderRadius.lg};
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.xs} 0;
`;

const LegendLabel = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const LegendColor = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: ${theme.borderRadius.sm};
  background: ${props => props.$color};
`;

const LegendValue = styled.span`
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.gray[900]};
`;

const LegendPercentage = styled.span`
  color: ${theme.colors.gray[500]};
  font-size: ${theme.typography.fontSize.sm};
  margin-left: ${theme.spacing.xs};
`;

const SummaryCard = styled.div`
  background: ${theme.colors.gray[50]};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const SummaryItem = styled.div`
  margin-bottom: ${theme.spacing.lg};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SummaryLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[600]};
  margin-bottom: ${theme.spacing.xs};
`;

const SummaryValue = styled.div`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.gray[900]};
`;

const FindingItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm};
  background: ${theme.colors.gray[50]};
  border-radius: ${theme.borderRadius.base};
  margin-bottom: ${theme.spacing.xs};
  transition: all 0.2s ease;

  &:hover {
    background: ${theme.colors.gray[100]};
    transform: translateX(4px);
  }
`;

const FilterSection = styled.div`
  margin-bottom: ${theme.spacing.lg};
`;

const InternalAuditPoints: React.FC = () => {
  const { auditFindings } = useData();
  const [selectedFinding, setSelectedFinding] = useState<AuditFinding | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter configuration
  const filterConfig = [
    {
      key: 'severity',
      label: 'Severity',
      type: 'select' as const,
      options: ['Critical', 'High', 'Medium', 'Low'],
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: ['Open', 'In Progress', 'Closed', 'Reopened'],
    },
    {
      key: 'department',
      label: 'Department',
      type: 'select' as const,
      options: ['IT Security', 'Procurement', 'Finance', 'Tax', 'IT'],
    },
    {
      key: 'owner',
      label: 'Owner',
      type: 'text' as const,
      placeholder: 'Search by owner...',
    },
  ];

  const { filters, filteredData, updateFilter, clearFilters } = useFilters(
    auditFindings,
    filterConfig
  );

  const { sortedData, sortConfig, handleSort } = useSorting(filteredData, {
    key: 'auditDate',
    direction: 'desc',
  });

  const { paginatedData, pagination } = usePagination(sortedData, 10);

  // Calculate metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const lastMonthFindings = auditFindings.filter(f => new Date(f.auditDate) > monthAgo);
    const previousMonthFindings = auditFindings.filter(f => {
      const findingDate = new Date(f.auditDate);
      return findingDate <= monthAgo && findingDate > new Date(monthAgo.setMonth(monthAgo.getMonth() - 1));
    });

    const monthlyTrend = previousMonthFindings.length > 0 
      ? ((lastMonthFindings.length - previousMonthFindings.length) / previousMonthFindings.length * 100).toFixed(1)
      : '0';

    return {
      totalFindings: auditFindings.length,
      openFindings: auditFindings.filter(f => f.status === 'Open').length,
      inProgressFindings: auditFindings.filter(f => f.status === 'In Progress').length,
      closedFindings: auditFindings.filter(f => f.status === 'Closed').length,
      reopenedFindings: auditFindings.filter(f => f.status === 'Reopened').length,
      criticalFindings: auditFindings.filter(f => f.severity === 'Critical').length,
      highFindings: auditFindings.filter(f => f.severity === 'High').length,
      mediumFindings: auditFindings.filter(f => f.severity === 'Medium').length,
      lowFindings: auditFindings.filter(f => f.severity === 'Low').length,
      overdueFindings: auditFindings.filter(f => {
        return f.status !== 'Closed' && new Date(f.targetClosureDate) < now;
      }).length,
      avgClosureDays: 18,
      departments: Array.from(new Set(auditFindings.map(f => f.department))).length,
      lastMonthFindings: lastMonthFindings.length,
      monthlyTrend: monthlyTrend,
    };
  }, [auditFindings]);

  // Chart data - Findings by severity
  const severityData = useMemo(() => {
    return [
      { name: 'Critical', value: metrics.criticalFindings },
      { name: 'High', value: metrics.highFindings },
      { name: 'Medium', value: metrics.mediumFindings },
      { name: 'Low', value: metrics.lowFindings },
    ];
  }, [metrics]);

  // Chart data - Findings by status
  const statusData = useMemo(() => {
    return [
      { name: 'Open', value: metrics.openFindings },
      { name: 'In Progress', value: metrics.inProgressFindings },
      { name: 'Closed', value: metrics.closedFindings },
      { name: 'Reopened', value: metrics.reopenedFindings },
    ];
  }, [metrics]);

  // Chart data - Findings by department
  const departmentData = useMemo(() => {
    const deptCounts: Record<string, number> = {};
    auditFindings.forEach(f => {
      deptCounts[f.department] = (deptCounts[f.department] || 0) + 1;
    });
    return Object.entries(deptCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [auditFindings]);

  // Calculate closure rate
  const closureRate = useMemo(() => {
    return ((metrics.closedFindings / metrics.totalFindings) * 100).toFixed(1);
  }, [metrics]);

  const columns = [
    {
      key: 'findingTitle',
      header: 'Finding',
      sortable: true,
      render: (item: AuditFinding) => (
        <div>
          <div style={{ fontWeight: theme.typography.fontWeight.medium }}>
            {item.findingTitle}
          </div>
          <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.gray[500] }}>
            {item.description.substring(0, 40)}...
          </div>
        </div>
      ),
    },
    {
      key: 'severity',
      header: 'Severity',
      sortable: true,
      render: (item: AuditFinding) => <RiskBadge level={item.severity} />,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item: AuditFinding) => <StatusBadge status={item.status} />,
    },
    {
      key: 'department',
      header: 'Department',
      sortable: true,
      render: (item: AuditFinding) => (
        <DepartmentTag>{item.department}</DepartmentTag>
      ),
    },
    {
      key: 'owner',
      header: 'Owner',
      sortable: true,
    },
    {
      key: 'auditDate',
      header: 'Audit Date',
      sortable: true,
      render: (item: AuditFinding) => new Date(item.auditDate).toLocaleDateString(),
    },
    {
      key: 'targetClosureDate',
      header: 'Target Date',
      sortable: true,
      render: (item: AuditFinding) => {
        const isOverdue = item.status !== 'Closed' && new Date(item.targetClosureDate) < new Date();
        return (
          <span style={{ color: isOverdue ? theme.colors.error[600] : theme.colors.gray[700] }}>
            {new Date(item.targetClosureDate).toLocaleDateString()}
            {isOverdue && ' ⚠️'}
          </span>
        );
      },
    },
    {
      key: 'actualClosureDate',
      header: 'Closed On',
      render: (item: AuditFinding) => item.actualClosureDate ? 
        new Date(item.actualClosureDate).toLocaleDateString() : '-',
    },
  ];

  const handleRowClick = (finding: AuditFinding) => {
    setSelectedFinding(finding);
    setIsModalOpen(true);
  };

  const handleSearch = (value: string) => {
    updateFilter('search', value);
  };

  const handleExport = () => {
    console.log('Exporting audit findings...');
  };

  return (
    <PageContainer>
      <PageHeader
        title="Internal Audit Points"
        subtitle="Track and manage audit findings and resolutions across departments"
        actions={[
          {
            label: 'Export Report',
            onClick: handleExport,
            variant: 'secondary',
            icon: <FaDownload />,
          },
          {
            label: 'Analytics',
            onClick: () => console.log('View analytics'),
            variant: 'outline',
            icon: <FaChartLine />,
          },
          {
            label: 'Assign Owners',
            onClick: () => console.log('Assign owners'),
            variant: 'primary',
            icon: <FaUserCheck />,
          },
        ]}
      />

      <MetricGrid>
        <MetricCard
          label="Total Findings"
          value={metrics.totalFindings}
          icon={<FaClipboardCheck />}
          trend={{ value: parseFloat(metrics.monthlyTrend), isPositive: parseFloat(metrics.monthlyTrend) >= 0, label: 'vs last month' }}
          color="primary"
        />
        <MetricCard
          label="Open Findings"
          value={metrics.openFindings}
          icon={<FaExclamationTriangle />}
          subtext={`${metrics.criticalFindings} critical`}
          color="error"
        />
        <MetricCard
          label="Overdue"
          value={metrics.overdueFindings}
          icon={<FaClock />}
          subtext="Past target date"
          color="warning"
        />
        <MetricCard
          label="Closure Rate"
          value={`${closureRate}%`}
          icon={<FaCheckCircle />}
          subtext={`${metrics.closedFindings} closed`}
          color="success"
        />
      </MetricGrid>

      <GridContainer>
        <ChartCard $colspan={6}>
          <ChartHeader>
            <ChartTitle>Findings by Severity</ChartTitle>
          </ChartHeader>
          <ChartBody>
            <PieChart
              data={severityData}
              colors={[
                theme.colors.error[500],
                theme.colors.error[400],
                theme.colors.warning[500],
                theme.colors.success[500],
              ]}
              height={250}
            />
          </ChartBody>
          <LegendContainer>
            {severityData.map((item, index) => {
              const colors = [
                theme.colors.error[500],
                theme.colors.error[400],
                theme.colors.warning[500],
                theme.colors.success[500],
              ];
              const total = severityData.reduce((sum, i) => sum + i.value, 0);
              const percentage = total > 0 ? ((item.value / total) * 100).toFixed(0) : '0';
              return (
                <LegendItem key={item.name}>
                  <LegendLabel>
                    <LegendColor $color={colors[index]} />
                    <span>{item.name}</span>
                  </LegendLabel>
                  <div>
                    <LegendValue>{item.value}</LegendValue>
                    <LegendPercentage>({percentage}%)</LegendPercentage>
                  </div>
                </LegendItem>
              );
            })}
          </LegendContainer>
        </ChartCard>

        <ChartCard $colspan={6}>
          <ChartHeader>
            <ChartTitle>Status Distribution</ChartTitle>
          </ChartHeader>
          <ChartBody>
            <PieChart
              data={statusData}
              colors={[
                theme.colors.error[500],
                theme.colors.warning[500],
                theme.colors.success[500],
                theme.colors.purple[500],
              ]}
              height={250}
            />
          </ChartBody>
          <LegendContainer>
            {statusData.map((item, index) => {
              const colors = [
                theme.colors.error[500],
                theme.colors.warning[500],
                theme.colors.success[500],
                theme.colors.purple[500],
              ];
              const total = statusData.reduce((sum, i) => sum + i.value, 0);
              const percentage = total > 0 ? ((item.value / total) * 100).toFixed(0) : '0';
              return (
                <LegendItem key={item.name}>
                  <LegendLabel>
                    <LegendColor $color={colors[index]} />
                    <span>{item.name}</span>
                  </LegendLabel>
                  <div>
                    <LegendValue>{item.value}</LegendValue>
                    <LegendPercentage>({percentage}%)</LegendPercentage>
                  </div>
                </LegendItem>
              );
            })}
          </LegendContainer>
        </ChartCard>
      </GridContainer>

      <GridContainer>
        <ChartCard $colspan={6}>
          <ChartHeader>
            <ChartTitle>Top Departments</ChartTitle>
          </ChartHeader>
          <ChartBody>
            <BarChart
              data={departmentData}
              xAxisKey="name"
              series={[{ key: 'value', name: 'Findings', color: theme.colors.primary[500] }]}
              height={250}
            />
          </ChartBody>
        </ChartCard>

        <ChartCard $colspan={6}>
          <ChartHeader>
            <ChartTitle>Resolution Summary</ChartTitle>
          </ChartHeader>
          <ChartBody>
            <SummaryCard>
              <SummaryItem>
                <SummaryLabel>Overall Completion</SummaryLabel>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <SummaryValue>{closureRate}%</SummaryValue>
                  <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.gray[500] }}>
                    {metrics.closedFindings}/{metrics.totalFindings} closed
                  </span>
                </div>
                <ProgressBar $percentage={parseFloat(closureRate)} />
              </SummaryItem>
              
              <SummaryItem>
                <SummaryLabel>Average Closure Time</SummaryLabel>
                <SummaryValue>{metrics.avgClosureDays} days</SummaryValue>
              </SummaryItem>
              
              <SummaryItem>
                <SummaryLabel>Departments Involved</SummaryLabel>
                <SummaryValue>{metrics.departments}</SummaryValue>
              </SummaryItem>

              <SummaryItem>
                <SummaryLabel>Top Critical Findings</SummaryLabel>
                {auditFindings.filter(f => f.severity === 'Critical').slice(0, 3).map((finding) => (
                  <FindingItem key={finding.id}>
                    <RiskBadge level={finding.severity} />
                    <span style={{ fontSize: theme.typography.fontSize.sm }}>
                      {finding.findingTitle}
                    </span>
                  </FindingItem>
                ))}
              </SummaryItem>
            </SummaryCard>
          </ChartBody>
        </ChartCard>
      </GridContainer>

      <FilterSection>
        <FilterBar
          filters={filters}
          onFilterChange={updateFilter}
          onClearFilters={clearFilters}
          filterConfig={filterConfig}
          showSearch={true}
          onSearch={handleSearch}
          searchPlaceholder="Search audit findings by title or description..."
        />
      </FilterSection>

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
        title="Audit Finding Details"
        size="lg"
      >
        {selectedFinding && (
          <AuditFindingDetail
            finding={selectedFinding}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </Modal>
    </PageContainer>
  );
};

export default InternalAuditPoints;