import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { useData } from '../context/DataContext';
import PageHeader from '../components/common/PageHeader';
import FilterBar from '../components/common/FilterBar';
import { DataTable } from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import AuditLogDetail from '../components/modals/AuditLogDetail';
import MetricCard from '../components/common/MetricCard';
import BarChart from '../components/charts/BarChart';
import { theme } from '../styles/theme_cr';
import { usePagination, useSorting, useFilters } from '../hooks';
import { AuditLog } from '../types';
import { FaDownload, FaChartLine, FaHistory, FaUsers, FaExclamationTriangle, FaCalendarCheck } from 'react-icons/fa';

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
  min-height: 500px;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: ${theme.shadows.md};
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
  color: ${theme.colors.primary[900]};
  margin: 0;
`;

const ChartBody = styled.div`
  flex: 1;
  min-height: 250px;
  position: relative;
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

const AuditTrail: React.FC = () => {
  const { auditLogs } = useData();
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter configuration
  const filterConfig = [
    {
      key: 'user',
      label: 'User',
      type: 'text' as const,
      placeholder: 'Search by user...',
    },
    {
      key: 'action',
      label: 'Action',
      type: 'select' as const,
      options: ['USER_LOGIN', 'SYSTEM_CONFIG', 'DATA_EXPORT', 'PERMISSION_CHANGE', 'USER_LOGOUT'],
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: ['success', 'failure', 'warning'],
    },
    {
      key: 'dateRange',
      label: 'Date Range',
      type: 'dateRange' as const,
    },
  ];

  const { filters, filteredData, updateFilter, clearFilters } = useFilters(
    auditLogs,
    filterConfig
  );

  const { sortedData, sortConfig, handleSort } = useSorting(filteredData, {
    key: 'timestamp',
    direction: 'desc',
  });

  const { paginatedData, pagination } = usePagination(sortedData, 10);

  // Calculate metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const lastWeekLogs = auditLogs.filter(log => new Date(log.timestamp) > weekAgo);
    const previousWeekLogs = auditLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate <= weekAgo && logDate > new Date(weekAgo.setDate(weekAgo.getDate() - 7));
    });

    const weeklyTrend = previousWeekLogs.length > 0 
      ? ((lastWeekLogs.length - previousWeekLogs.length) / previousWeekLogs.length * 100).toFixed(1)
      : '0';

    return {
      totalEvents: auditLogs.length,
      todayEvents: auditLogs.filter(log => log.timestamp.startsWith(today)).length,
      uniqueUsers: Array.from(new Set(auditLogs.map(log => log.user))).length,
      failedEvents: auditLogs.filter(log => log.status === 'failure').length,
      weeklyAverage: Math.round(auditLogs.filter(log => new Date(log.timestamp) > weekAgo).length / 7),
      lastWeekEvents: lastWeekLogs.length,
      weeklyTrend: weeklyTrend,
      successRate: auditLogs.length > 0 
        ? ((auditLogs.filter(log => log.status === 'success').length / auditLogs.length) * 100).toFixed(1)
        : '0',
    };
  }, [auditLogs]);

  // Chart data - Hourly activity
  const hourlyActivityData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return hours.map(hour => {
      const count = auditLogs.filter(log => {
        const logHour = new Date(log.timestamp).getHours();
        return logHour === hour;
      }).length;
      return { hour: `${hour}:00`, count };
    });
  }, [auditLogs]);

  // Chart data - Top actions
  const topActionsData = useMemo(() => {
    const actionCounts: Record<string, number> = {};
    auditLogs.forEach(log => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    });
    return Object.entries(actionCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [auditLogs]);

  const columns = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      sortable: true,
      render: (item: AuditLog) => new Date(item.timestamp).toLocaleString(),
    },
    {
      key: 'user',
      header: 'User',
      sortable: true,
      render: (item: AuditLog) => (
        <span style={{ fontWeight: theme.typography.fontWeight.medium }}>
          {item.user}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      sortable: true,
    },
    {
      key: 'resource',
      header: 'Resource',
      sortable: true,
    },
    {
      key: 'details',
      header: 'Details',
      render: (item: AuditLog) => (
        <span style={{ color: theme.colors.gray[600] }}>
          {item.details.substring(0, 40)}...
        </span>
      ),
    },
    {
      key: 'ipAddress',
      header: 'IP Address',
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item: AuditLog) => <StatusBadge status={item.status} />,
    },
  ];

  const handleSearch = (value: string) => {
    updateFilter('search', value);
  };

  const handleRowClick = (log: AuditLog) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const handleExport = () => {
    console.log('Exporting audit logs...');
  };

  return (
    <PageContainer>
      <PageHeader
        title="Audit Trail"
        subtitle="Complete history of system events and user activities"
        actions={[
          {
            label: 'Export Logs',
            onClick: handleExport,
            variant: 'secondary',
            icon: <FaDownload />,
          },
          {
            label: 'View Analytics',
            onClick: () => console.log('View analytics'),
            variant: 'outline',
            icon: <FaChartLine />,
          },
        ]}
      />

      <MetricGrid>
        <MetricCard
          label="Total Events"
          value={metrics.totalEvents}
          icon={<FaHistory />}
          subtext="All time"
          color="primary"
        />
        <MetricCard
          label="Today's Events"
          value={metrics.todayEvents}
          icon={<FaCalendarCheck />}
          trend={{ value: parseFloat(metrics.weeklyTrend), isPositive: parseFloat(metrics.weeklyTrend) >= 0, label: 'vs last week' }}
          color="info"
        />
        <MetricCard
          label="Active Users"
          value={metrics.uniqueUsers}
          icon={<FaUsers />}
          subtext="Unique users"
          color="success"
        />
        <MetricCard
          label="Failed Events"
          value={metrics.failedEvents}
          icon={<FaExclamationTriangle />}
          subtext={`${metrics.successRate}% success rate`}
          color="error"
        />
      </MetricGrid>

      <GridContainer>
        <ChartCard $colspan={12}>
          <ChartHeader>
            <ChartTitle>Hourly Activity (24h)</ChartTitle>
          </ChartHeader>
          <ChartBody>
            <BarChart
              data={hourlyActivityData}
              xAxisKey="hour"
              series={[{ key: 'count', name: 'Events', color: theme.colors.primary[500] }]}
              height={350}
            />
          </ChartBody>
        </ChartCard>
      </GridContainer>

      <GridContainer>
        <ChartCard $colspan={6}>
          <ChartHeader>
            <ChartTitle>Top Actions</ChartTitle>
          </ChartHeader>
          <ChartBody>
            <BarChart
              data={topActionsData}
              xAxisKey="name"
              series={[{ key: 'value', name: 'Count', color: theme.colors.success[500] }]}
              height={350}
            />
          </ChartBody>
        </ChartCard>
        <ChartCard $colspan={6}>
          <ChartHeader>
            <ChartTitle>Activity Summary</ChartTitle>
          </ChartHeader>
          <ChartBody>
            <SummaryCard>
              <SummaryItem>
                <SummaryLabel>Average daily events</SummaryLabel>
                <SummaryValue>{metrics.weeklyAverage}</SummaryValue>
              </SummaryItem>
              <SummaryItem>
                <SummaryLabel>Peak activity hour</SummaryLabel>
                <SummaryValue>
                  {hourlyActivityData.reduce((max, item) => 
                    item.count > max.count ? item : max
                  ).hour}
                </SummaryValue>
              </SummaryItem>
              <SummaryItem>
                <SummaryLabel>Success rate</SummaryLabel>
                <SummaryValue style={{ color: theme.colors.success[600] }}>
                  {metrics.successRate}%
                </SummaryValue>
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
          searchPlaceholder="Search audit logs..."
        />
      </FilterSection>

      <TableWrapper>
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
      </TableWrapper>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Audit Log Details"
        size="lg"
      >
        {selectedLog && (
          <AuditLogDetail
            log={selectedLog}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </Modal>
    </PageContainer>
  );
};

export default AuditTrail;