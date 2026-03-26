import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { useData } from '../context/DataContext';
import PageHeader from '../components/common/PageHeader';
import FilterBar from '../components/common/FilterBar';
import { DataTable } from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import FilingDetail from '../components/modals/FilingDetail';
import MetricCard from '../components/common/MetricCard';
import BarChart from '../components/charts/BarChart';
import LineChart from '../components/charts/LineChart';
import { theme } from '../styles/theme_cr';
import { usePagination, useSorting, useFilters } from '../hooks';
import { StatutoryFiling } from '../types';
import { FaCalendarCheck, FaDownload, FaExclamationTriangle, FaFileAlt, FaCheckCircle, FaClock } from 'react-icons/fa';
import { isOverdue, getDaysUntil } from '../utils/dateUtils';

const PageContainer = styled.div`
  padding: ${theme.spacing.xl};
  height: 100%;
  width: 940px; 
  overflow-y: auto;
  background: ${theme.colors.background.primary};
  
  /* Smooth scrolling */
  scroll-behavior: smooth;
`;

const TableWrapper = styled.div`
  margin-top: ${theme.spacing.xl};
  background: white;
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.gray[200]};
  overflow: hidden;
  box-shadow: ${theme.shadows.sm};
`;

const FilterSection = styled.div`
  margin-bottom: ${theme.spacing.lg};
  padding: ${theme.spacing.lg};
  background: white;
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.gray[200]};
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

const RegulationBadge = styled.span<{ $type: string }>`
  display: inline-flex;
  align-items: center;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  background: ${props => {
    switch (props.$type) {
      case 'GST': return theme.colors.purple[50];
      case 'MCA': return theme.colors.primary[50];
      case 'SEBI': return theme.colors.success[50];
      case 'Income Tax': return theme.colors.warning[50];
      default: return theme.colors.gray[100];
    }
  }};
  color: ${props => {
    switch (props.$type) {
      case 'GST': return theme.colors.purple[700];
      case 'MCA': return theme.colors.primary[700];
      case 'SEBI': return theme.colors.success[700];
      case 'Income Tax': return theme.colors.warning[700];
      default: return theme.colors.gray[700];
    }
  }};
`;

const DueDateIndicator = styled.div<{ $daysUntil: number }>`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  background: ${props => {
    if (props.$daysUntil < 0) return theme.colors.error[50];
    if (props.$daysUntil <= 7) return theme.colors.warning[50];
    return theme.colors.success[50];
  }};
  color: ${props => {
    if (props.$daysUntil < 0) return theme.colors.error[700];
    if (props.$daysUntil <= 7) return theme.colors.warning[700];
    return theme.colors.success[700];
  }};
`;

const StatutoryFilings: React.FC = () => {
  const { statutoryFilings } = useData();
  const [selectedFiling, setSelectedFiling] = useState<StatutoryFiling | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter configuration
  const filterConfig = [
    {
      key: 'regulationType',
      label: 'Regulation',
      type: 'select' as const,
      options: ['GST', 'MCA', 'SEBI', 'Income Tax'],
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: ['Draft', 'In Progress', 'Submitted', 'Overdue', 'Acknowledged'],
    },
    {
      key: 'assignedTo',
      label: 'Assigned To',
      type: 'text' as const,
      placeholder: 'Search by assignee...',
    },
  ];

  const { filters, filteredData, updateFilter, clearFilters } = useFilters(
    statutoryFilings,
    filterConfig
  );

  const { sortedData, sortConfig, handleSort } = useSorting(filteredData, {
    key: 'dueDate',
    direction: 'asc',
  });

  const { paginatedData, pagination } = usePagination(sortedData, 5);

  // Calculate metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const lastMonthFilings = statutoryFilings.filter(f => new Date(f.dueDate) > monthAgo);
    const previousMonthFilings = statutoryFilings.filter(f => {
      const filingDate = new Date(f.dueDate);
      return filingDate <= monthAgo && filingDate > new Date(monthAgo.setMonth(monthAgo.getMonth() - 1));
    });

    const monthlyTrend = previousMonthFilings.length > 0 
      ? ((lastMonthFilings.length - previousMonthFilings.length) / previousMonthFilings.length * 100).toFixed(1)
      : '0';

    return {
      totalFilings: statutoryFilings.length,
      overdue: statutoryFilings.filter(f => f.status === 'Overdue').length,
      dueThisWeek: statutoryFilings.filter(f => {
        const dueDate = new Date(f.dueDate);
        return dueDate <= nextWeek && dueDate >= now && f.status !== 'Submitted';
      }).length,
      submitted: statutoryFilings.filter(f => f.status === 'Submitted').length,
      inProgress: statutoryFilings.filter(f => f.status === 'In Progress').length,
      draft: statutoryFilings.filter(f => f.status === 'Draft').length,
      acknowledged: statutoryFilings.filter(f => f.status === 'Acknowledged').length,
      totalAmount: statutoryFilings.reduce((sum, f) => sum + (f.amount || 0), 0),
      lastMonthFilings: lastMonthFilings.length,
      monthlyTrend: monthlyTrend,
      complianceRate: ((statutoryFilings.filter(f => f.status === 'Submitted' || f.status === 'Acknowledged').length / statutoryFilings.length) * 100).toFixed(1),
    };
  }, [statutoryFilings]);

  // Chart data - Filings by regulation
  const regulationData = useMemo(() => {
    const counts: Record<string, number> = {};
    statutoryFilings.forEach(f => {
      counts[f.regulationType] = (counts[f.regulationType] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [statutoryFilings]);

  const handleSearch = (value: string) => {
    updateFilter('search', value);
  };

  // Chart data - Status distribution
  const statusData = useMemo(() => {
    return [
      { name: 'Submitted', value: metrics.submitted },
      { name: 'In Progress', value: metrics.inProgress },
      { name: 'Draft', value: metrics.draft },
      { name: 'Overdue', value: metrics.overdue },
      { name: 'Acknowledged', value: metrics.acknowledged },
    ];
  }, [metrics]);

  // Chart data - Due dates timeline
  const dueDateData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => {
      const count = statutoryFilings.filter(f => {
        const dueMonth = new Date(f.dueDate).toLocaleString('en-US', { month: 'short' });
        return dueMonth === month;
      }).length;
      return { month, filings: count };
    });
  }, [statutoryFilings]);

  const columns = [
    {
      key: 'filingName',
      header: 'Filing Name',
      sortable: true,
      render: (item: StatutoryFiling) => (
        <span style={{ fontWeight: theme.typography.fontWeight.medium }}>
          {item.filingName}
        </span>
      ),
    },
    {
      key: 'regulationType',
      header: 'Regulation',
      sortable: true,
      render: (item: StatutoryFiling) => (
        <RegulationBadge $type={item.regulationType}>
          {item.regulationType}
        </RegulationBadge>
      ),
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      sortable: true,
      render: (item: StatutoryFiling) => {
        const daysUntil = getDaysUntil(item.dueDate);
        return (
          <DueDateIndicator $daysUntil={daysUntil}>
            {daysUntil < 0 ? (
              <>
                <FaExclamationTriangle size={10} />
                Overdue by {Math.abs(daysUntil)} days
              </>
            ) : daysUntil === 0 ? (
              'Due today'
            ) : (
              `${daysUntil} days left`
            )}
          </DueDateIndicator>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item: StatutoryFiling) => <StatusBadge status={item.status} />,
    },
    {
      key: 'assignedTo',
      header: 'Assigned To',
      sortable: true,
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      render: (item: StatutoryFiling) => item.amount ? 
        `₹${item.amount.toLocaleString()}` : '-',
    },
    {
      key: 'submissionDate',
      header: 'Submitted On',
      render: (item: StatutoryFiling) => item.submissionDate ? 
        new Date(item.submissionDate).toLocaleDateString() : '-',
    },
  ];

  const handleRowClick = (filing: StatutoryFiling) => {
    setSelectedFiling(filing);
    setIsModalOpen(true);
  };

  const handleBulkDownload = () => {
    console.log('Downloading filing documents...');
  };

  return (
    <PageContainer>
      <PageHeader
        title="Statutory Filings Tracker"
        subtitle="Monitor compliance filings for SEBI, MCA, GST, and Income Tax"
        actions={[
          {
            label: 'Download Documents',
            onClick: handleBulkDownload,
            variant: 'secondary',
            icon: <FaDownload />,
          },
          {
            label: 'Schedule Reminder',
            onClick: () => console.log('Schedule reminder'),
            variant: 'outline',
            icon: <FaCalendarCheck />,
          },
        ]}
      />

      <MetricGrid>
        <MetricCard
          label="Total Filings"
          value={metrics.totalFilings}
          icon={<FaFileAlt />}
          trend={{ value: parseFloat(metrics.monthlyTrend), isPositive: parseFloat(metrics.monthlyTrend) >= 0, label: 'vs last month' }}
          color="primary"
        />
        <MetricCard
          label="Overdue"
          value={metrics.overdue}
          icon={<FaExclamationTriangle />}
          subtext="Requires immediate action"
          color="error"
        />
        <MetricCard
          label="Due This Week"
          value={metrics.dueThisWeek}
          icon={<FaClock />}
          subtext="Upcoming deadlines"
          color="warning"
        />
        <MetricCard
          label="Compliance Rate"
          value={`${metrics.complianceRate}%`}
          icon={<FaCheckCircle />}
          subtext={`${metrics.submitted + metrics.acknowledged} completed`}
          color="success"
        />
      </MetricGrid>

      <GridContainer>
        <ChartCard $colspan={6}>
          <ChartTitle>Filings by Regulation</ChartTitle>
          <BarChart
            data={regulationData}
            xAxisKey="name"
            series={[{ key: 'value', name: 'Count', color: theme.colors.primary[500] }]}
            height={250}
          />
        </ChartCard>
        <ChartCard $colspan={6}>
          <ChartTitle>Status Distribution</ChartTitle>
          <BarChart
            data={statusData}
            xAxisKey="name"
            series={[{ key: 'value', name: 'Filings', color: theme.colors.secondary[500] }]}
            height={250}
          />
        </ChartCard>
        <ChartCard $colspan={6}>
          <ChartTitle>Due Dates Overview</ChartTitle>
          <div style={{ padding: theme.spacing.md }}>
            <div style={{ marginBottom: theme.spacing.md }}>
              <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.gray[600] }}>
                Next Deadline
              </div>
              <div style={{ fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.bold }}>
                {statutoryFilings
                  .filter(f => f.status !== 'Submitted' && !isOverdue(f.dueDate))
                  .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]?.filingName || 'No upcoming'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.gray[600] }}>
                Total Amount
              </div>
              <div style={{ fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.bold }}>
                ₹{(metrics.totalAmount / 10000000).toFixed(2)}Cr
              </div>
            </div>
          </div>
        </ChartCard>

        <ChartCard $colspan={6}>
          <ChartTitle>Due Date Timeline</ChartTitle>
          <LineChart
            data={dueDateData}
            xAxisKey="month"
            series={[{ key: 'filings', name: 'Filings Due', color: theme.colors.warning[500] }]}
            height={250}
          />
        </ChartCard>
      </GridContainer>

      <GridContainer>
        <ChartCard $colspan={12}>
          <FilterBar
            filters={filters}
            onFilterChange={updateFilter}
            onClearFilters={clearFilters}
            filterConfig={filterConfig}
            showSearch={true}
            onSearch={handleSearch}
            searchPlaceholder="Search filings..."
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
            title="Filing Details"
            size="lg"
          >
            {selectedFiling && (
              <FilingDetail
                filing={selectedFiling}
                onClose={() => setIsModalOpen(false)}
              />
            )}
          </Modal>
        </ChartCard>
      </GridContainer>
    </PageContainer>
  );
};

export default StatutoryFilings;