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
import BarChart from '../components/charts/BarChart';
import PieChart from '../components/charts/PieChart';
import { theme } from '../styles/theme';
import { usePagination, useSorting, useFilters } from '../hooks';
import { AuditFinding } from '../types';
import { FaClipboardCheck, FaUserCheck } from 'react-icons/fa';

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

const MetricSubtext = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.gray[400]};
  margin-top: ${theme.spacing.xs};
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
  height: 4px;
  background: ${theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.full};
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.$percentage}%;
    background: ${theme.colors.success[500]};
    border-radius: ${theme.borderRadius.full};
  }
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

  const { paginatedData, pagination } = usePagination(sortedData, 5);
  // Calculate metrics
  const metrics = useMemo(() => {
    const now = new Date();
    
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
      avgClosureDays: 18, // Mocked value
      departments: Array.from(new Set(auditFindings.map(f => f.department))).length,
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
      .sort((a, b) => b.value - a.value);
  }, [auditFindings]);

  // Chart data - Monthly trend
  const monthlyTrendData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => {
      const opened = Math.floor(Math.random() * 8) + 2;
      const closed = Math.floor(Math.random() * 6) + 1;
      return { month, opened, closed };
    });
  }, []);

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

  return (
    <PageContainer>
      <PageHeader
        title="Internal Audit Points"
        subtitle="Track and manage audit findings and resolutions"
        actions={[
          {
            label: 'Generate Report',
            onClick: () => console.log('Generate report'),
            variant: 'primary',
            icon: <FaClipboardCheck />,
          },
          {
            label: 'Assign Owners',
            onClick: () => console.log('Assign owners'),
            variant: 'secondary',
            icon: <FaUserCheck />,
          },
        ]}
      />

      <MetricGrid>
        <MetricCard>
          <MetricValue>{metrics.totalFindings}</MetricValue>
          <MetricLabel>Total Findings</MetricLabel>
          <MetricSubtext>YTD</MetricSubtext>
        </MetricCard>
        <MetricCard>
          <MetricValue $color={theme.colors.error[600]}>{metrics.openFindings}</MetricValue>
          <MetricLabel>Open</MetricLabel>
          <MetricSubtext>{metrics.criticalFindings} critical</MetricSubtext>
        </MetricCard>
        <MetricCard>
          <MetricValue $color={theme.colors.warning[600]}>{metrics.overdueFindings}</MetricValue>
          <MetricLabel>Overdue</MetricLabel>
          <MetricSubtext>Past target date</MetricSubtext>
        </MetricCard>
        <MetricCard>
          <MetricValue $color={theme.colors.success[600]}>{closureRate}%</MetricValue>
          <MetricLabel>Closure Rate</MetricLabel>
          <MetricSubtext>{metrics.closedFindings} closed</MetricSubtext>
        </MetricCard>
      </MetricGrid>

      <GridContainer>
        <ChartCard $colspan={6}>
          <ChartTitle>Findings by Severity</ChartTitle>
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
        </ChartCard>
        <ChartCard $colspan={6}>
          <ChartTitle>Status Distribution</ChartTitle>
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
        </ChartCard>
        <ChartCard $colspan={6}>
          <ChartTitle>By Department</ChartTitle>
          <BarChart
            data={departmentData.slice(0, 5)}
            xAxisKey="name"
            series={[{ key: 'value', name: 'Findings', color: theme.colors.primary[500] }]}
            height={250}
          />
        </ChartCard>
        <ChartCard $colspan={6}>
          <ChartTitle>Resolution Progress</ChartTitle>
          <div style={{ padding: theme.spacing.md }}>
            <div style={{ marginBottom: theme.spacing.lg }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: theme.spacing.xs }}>
                <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.gray[600] }}>
                  Overall Completion
                </span>
                <span style={{ fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium }}>
                  {closureRate}%
                </span>
              </div>
              <ProgressBar $percentage={parseFloat(closureRate)} />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.lg }}>
              <div>
                <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.gray[600], marginBottom: theme.spacing.xs }}>
                  Average Closure Time
                </div>
                <div style={{ fontSize: theme.typography.fontSize.xl, fontWeight: theme.typography.fontWeight.bold }}>
                  {metrics.avgClosureDays} days
                </div>
              </div>
              <div>
                <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.gray[600], marginBottom: theme.spacing.xs }}>
                  Departments Involved
                </div>
                <div style={{ fontSize: theme.typography.fontSize.xl, fontWeight: theme.typography.fontWeight.bold }}>
                  {metrics.departments}
                </div>
              </div>
            </div>

            <div style={{ marginTop: theme.spacing.lg }}>
              <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.gray[600], marginBottom: theme.spacing.sm }}>
                Top Findings
              </div>
              {auditFindings.slice(0, 3).map((finding) => (
                <div key={finding.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: theme.spacing.sm,
                  padding: theme.spacing.sm,
                  background: theme.colors.gray[50],
                  borderRadius: theme.borderRadius.base,
                  marginBottom: theme.spacing.xs
                }}>
                  <RiskBadge level={finding.severity} />
                  <span style={{ fontSize: theme.typography.fontSize.sm }}>
                    {finding.findingTitle}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </GridContainer>

      <GridContainer>
        <ChartCard $colspan={12}>
          <ChartTitle>
            Monthly Trend
            <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.gray[500] }}>
              Opened vs Closed
            </span>
          </ChartTitle>
          <BarChart
            data={monthlyTrendData}
            xAxisKey="month"
            series={[
              { key: 'opened', name: 'Opened', color: theme.colors.warning[500] },
              { key: 'closed', name: 'Closed', color: theme.colors.success[500] },
            ]}
            height={250}
          />
        </ChartCard>
        
      </GridContainer>

      <FilterBar
        filters={filters}
        onFilterChange={updateFilter}
        onClearFilters={clearFilters}
        filterConfig={filterConfig}
        showSearch={true}
        onSearch={(value) => updateFilter('search', value)}
        searchPlaceholder="Search audit findings..."
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