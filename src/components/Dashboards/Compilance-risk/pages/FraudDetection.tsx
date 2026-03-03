import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { useData } from '../context/DataContext';
import PageHeader from '../components/common/PageHeader';
import FilterBar from '../components/common/FilterBar';
import { DataTable } from '../components/common/DataTable';
import RiskBadge from '../components/common/RiskBadge';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import FraudAlertDetail from '../components/modals/FraudAlertDetail';
import MetricCard from '../components/common/MetricCard';
import BarChart from '../components/charts/BarChart';
import PieChart from '../components/charts/PieChart';
import { theme } from '../styles/theme_cr';
import { usePagination, useSorting, useFilters } from '../hooks';
import { FraudAlert } from '../types';
import { FaExclamationTriangle, FaChartLine, FaShieldAlt, FaRupeeSign, FaClock, FaCheckCircle } from 'react-icons/fa';

const PageContainer = styled.div`
  padding: ${theme.spacing.xl};
  height: 100%;
  overflow-y: auto;
  background: ${theme.colors.background.primary};
  
  /* Smooth scrolling */
  scroll-behavior: smooth;
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
  min-height: 480px;
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
  color: ${theme.colors.gray[900]};
  margin: 0;
`;

const ChartBody = styled.div`
  flex: 1;
  min-height: 250px;
  position: relative;
`;

const AlertTypeTag = styled.span<{ $severity: string }>`
  display: inline-flex;
  align-items: center;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  background: ${props => {
    switch (props.$severity) {
      case 'Critical': return theme.colors.error[50];
      case 'High': return theme.colors.error[50];
      case 'Medium': return theme.colors.warning[50];
      default: return theme.colors.info[50];
    }
  }};
  color: ${props => {
    switch (props.$severity) {
      case 'Critical': return theme.colors.error[700];
      case 'High': return theme.colors.error[700];
      case 'Medium': return theme.colors.warning[700];
      default: return theme.colors.info[700];
    }
  }};
`;

const ConfidenceBar = styled.div<{ $confidence: number }>`
  height: 4px;
  background: ${theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.full};
  margin-top: ${theme.spacing.xs};
  position: relative;
  overflow: hidden;
  width: 80px;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.$confidence}%;
    background: ${props => {
      if (props.$confidence >= 80) return theme.colors.success[500];
      if (props.$confidence >= 50) return theme.colors.warning[500];
      return theme.colors.error[500];
    }};
    border-radius: ${theme.borderRadius.full};
  }
`;

const FraudDetection: React.FC = () => {
  const { fraudAlerts } = useData();
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null);
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
      options: ['New', 'Investigating', 'Confirmed', 'False Positive'],
    },
    {
      key: 'alertType',
      label: 'Alert Type',
      type: 'select' as const,
      options: ['Duplicate Payment', 'Vendor Account Takeover', 'Unusual Commission Pattern', 
                'Phishing Campaign', 'Rapid Payment Sequence'],
    },
    {
      key: 'minConfidence',
      label: 'Min Confidence',
      type: 'text' as const,
      placeholder: 'Enter minimum confidence %',
    },
  ];

  const { filters, filteredData, updateFilter, clearFilters } = useFilters(
    fraudAlerts,
    filterConfig
  );

  const { sortedData, sortConfig, handleSort } = useSorting(filteredData, {
    key: 'timestamp',
    direction: 'desc',
  });

  const { paginatedData, pagination } = usePagination(sortedData, 5);

  // Calculate metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const lastWeekAlerts = fraudAlerts.filter(a => new Date(a.timestamp) > weekAgo);
    const previousWeekAlerts = fraudAlerts.filter(a => {
      const alertDate = new Date(a.timestamp);
      return alertDate <= weekAgo && alertDate > new Date(weekAgo.setDate(weekAgo.getDate() - 7));
    });

    const weeklyTrend = previousWeekAlerts.length > 0 
      ? ((lastWeekAlerts.length - previousWeekAlerts.length) / previousWeekAlerts.length * 100).toFixed(1)
      : '0';

    return {
      totalAlerts: fraudAlerts.length,
      criticalAlerts: fraudAlerts.filter(a => a.severity === 'Critical').length,
      highAlerts: fraudAlerts.filter(a => a.severity === 'High').length,
      mediumAlerts: fraudAlerts.filter(a => a.severity === 'Medium').length,
      lowAlerts: fraudAlerts.filter(a => a.severity === 'Low').length,
      newAlerts: fraudAlerts.filter(a => a.status === 'New').length,
      investigatingAlerts: fraudAlerts.filter(a => a.status === 'Investigating').length,
      confirmedAlerts: fraudAlerts.filter(a => a.status === 'Confirmed').length,
      falsePositiveAlerts: fraudAlerts.filter(a => a.status === 'False Positive').length,
      averageConfidence: fraudAlerts.length > 0 
        ? Math.round(fraudAlerts.reduce((sum, a) => sum + a.confidence, 0) / fraudAlerts.length)
        : 0,
      totalAmount: fraudAlerts.reduce((sum, a) => sum + (a.amount || 0), 0),
      lastWeekAlerts: lastWeekAlerts.length,
      weeklyTrend: weeklyTrend,
      detectionRate: fraudAlerts.length > 0
        ? ((fraudAlerts.filter(a => a.status === 'Confirmed').length / fraudAlerts.length) * 100).toFixed(1)
        : '0',
    };
  }, [fraudAlerts]);

  // Chart data - Alerts by severity
  const severityData = useMemo(() => {
    return [
      { name: 'Critical', value: metrics.criticalAlerts },
      { name: 'High', value: metrics.highAlerts },
      { name: 'Medium', value: metrics.mediumAlerts },
      { name: 'Low', value: metrics.lowAlerts },
    ];
  }, [metrics]);

  // Chart data - Alert types distribution
  const alertTypeData = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    fraudAlerts.forEach(alert => {
      typeCounts[alert.alertType] = (typeCounts[alert.alertType] || 0) + 1;
    });
    return Object.entries(typeCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [fraudAlerts]);

  // Chart data - Status distribution
  const statusData = useMemo(() => {
    return [
      { name: 'New', value: metrics.newAlerts },
      { name: 'Investigating', value: metrics.investigatingAlerts },
      { name: 'Confirmed', value: metrics.confirmedAlerts },
      { name: 'False Positive', value: metrics.falsePositiveAlerts },
    ];
  }, [metrics]);

  const columns = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      sortable: true,
      render: (item: FraudAlert) => new Date(item.timestamp).toLocaleString(),
    },
    {
      key: 'alertType',
      header: 'Alert Type',
      sortable: true,
      render: (item: FraudAlert) => (
        <AlertTypeTag $severity={item.severity}>
          {item.alertType}
        </AlertTypeTag>
      ),
    },
    {
      key: 'severity',
      header: 'Severity',
      sortable: true,
      render: (item: FraudAlert) => <RiskBadge level={item.severity as any} />,
    },
    {
      key: 'description',
      header: 'Description',
      render: (item: FraudAlert) => (
        <span style={{ color: theme.colors.gray[600] }}>
          {item.description.substring(0, 40)}...
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      render: (item: FraudAlert) => item.amount ? 
        `₹${item.amount.toLocaleString()}` : '-',
    },
    {
      key: 'confidence',
      header: 'Confidence',
      sortable: true,
      render: (item: FraudAlert) => (
        <div>
          <span style={{ 
            color: item.confidence >= 80 ? theme.colors.success[600] :
                   item.confidence >= 50 ? theme.colors.warning[600] :
                   theme.colors.error[600],
            fontWeight: theme.typography.fontWeight.medium
          }}>
            {item.confidence}%
          </span>
          <ConfidenceBar $confidence={item.confidence} />
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item: FraudAlert) => <StatusBadge status={item.status} />,
    },
  ];

  const handleRowClick = (alert: FraudAlert) => {
    setSelectedAlert(alert);
    setIsModalOpen(true);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Fraud Detection Alerts"
        subtitle="Real-time monitoring of suspicious activities and patterns"
        actions={[
          {
            label: 'Run Analysis',
            onClick: () => console.log('Run analysis'),
            variant: 'primary',
            icon: <FaChartLine />,
          },
          {
            label: 'Investigate All',
            onClick: () => console.log('Investigate all'),
            variant: 'secondary',
            icon: <FaExclamationTriangle />,
          },
        ]}
      />

      <MetricGrid>
        <MetricCard
          label="Total Alerts"
          value={metrics.totalAlerts}
          icon={<FaExclamationTriangle />}
          trend={{ value: parseFloat(metrics.weeklyTrend), isPositive: parseFloat(metrics.weeklyTrend) >= 0, label: 'vs last week' }}
          color="primary"
        />
        <MetricCard
          label="Critical Alerts"
          value={metrics.criticalAlerts}
          icon={<FaShieldAlt />}
          subtext="Requires immediate action"
          color="error"
        />
        <MetricCard
          label="Amount at Risk"
          value={`₹${(metrics.totalAmount / 100000).toFixed(1)}L`}
          icon={<FaRupeeSign />}
          subtext="Across all alerts"
          color="warning"
        />
        <MetricCard
          label="Detection Rate"
          value={`${metrics.detectionRate}%`}
          icon={<FaCheckCircle />}
          subtext={`${metrics.confirmedAlerts} confirmed`}
          color="success"
        />
      </MetricGrid>

      <GridContainer>
        <ChartCard $colspan={6}>
          <ChartHeader>
            <ChartTitle>Alerts by Severity</ChartTitle>
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
              height={220}
            />
          </ChartBody>
        </ChartCard>
        <ChartCard $colspan={6}>
          <ChartHeader>
            <ChartTitle>Alert Status</ChartTitle>
          </ChartHeader>
          <ChartBody>
            <PieChart
              data={statusData}
              colors={[
                theme.colors.error[500],
                theme.colors.warning[500],
                theme.colors.success[500],
                theme.colors.gray[400],
              ]}
              height={220}
            />
          </ChartBody>
        </ChartCard>
        <ChartCard $colspan={12}>
          <ChartHeader>
            <ChartTitle>Top Alert Types</ChartTitle>
          </ChartHeader>
          <ChartBody>
            <BarChart
              data={alertTypeData}
              xAxisKey="name"
              series={[{ key: 'value', name: 'Count', color: theme.colors.primary[500] }]}
              height={300}
            />
          </ChartBody>
        </ChartCard>
      </GridContainer>
      
      <GridContainer style={{ marginTop: theme.spacing.xl }}>
        <ChartCard $colspan={12}>
          <FilterBar
            filters={filters}
            onFilterChange={updateFilter}
            onClearFilters={clearFilters}
            filterConfig={filterConfig}
            showSearch={true}
            onSearch={(value) => updateFilter('search', value)}
            searchPlaceholder="Search fraud alerts..."
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
            title="Fraud Alert Details"
            size="lg"
          >
            {selectedAlert && (
              <FraudAlertDetail
                alert={selectedAlert}
                onClose={() => setIsModalOpen(false)}
              />
            )}
          </Modal>
        </ChartCard>
      </GridContainer>
    </PageContainer>
  );
};

export default FraudDetection;