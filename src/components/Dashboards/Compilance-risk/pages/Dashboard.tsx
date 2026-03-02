import React, { useMemo } from 'react';
import styled from 'styled-components';
import { useData } from '../context/DataContext';
import MetricCard from '../components/common/MetricCard';
import LineChart from '../components/charts/LineChart';
import BarChart from '../components/charts/BarChart';
import PieChart from '../components/charts/PieChart';
import { ScrollableTable } from '../components/common/ScrollableTable';
import StatusBadge from '../components/common/StatusBadge';
import RiskBadge from '../components/common/RiskBadge';
import { theme } from '../styles/theme';

import { 
  FaExclamationTriangle, 
  FaShieldAlt, 
  FaFileAlt, 
  FaClipboardCheck,
  FaChartLine,
  FaBell,
  
} from 'react-icons/fa';

const PageContainer = styled.div`
  padding: ${theme.spacing.xl};
  height: 100%;
 width: 850px;
  background: ${theme.colors.gray[50]};
  font-color: ${theme.colors.text.tertiary};
`;

const WelcomeSection = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const WelcomeTitle = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.gray[900]};
  margin-bottom: ${theme.spacing.xs};
  font-color: ${theme.colors.text.tertiary};
`;

const WelcomeSubtitle = styled.p`
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.gray[500]};
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
  color: ${theme.colors.text.tertiary};
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
  font-color: ${theme.colors.text.tertiary};
  margin: 0;
`;

const ViewAllLink = styled.a`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.primary[600]};
  cursor: pointer;
  font-weight: ${theme.typography.fontWeight.normal};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  transition: all 0.2s ease;

  &:hover {
    color: ${theme.colors.primary[700]};
    transform: translateX(4px);
  }
`;

const ChartBody = styled.div`
  flex: 1;
  min-height: 250px;
  position: relative;
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

const AlertList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  max-height: 350px;
  overflow-y: auto;
  padding-right: ${theme.spacing.xs};
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${theme.colors.gray[100]};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.gray[400]};
    border-radius: ${theme.borderRadius.full};
  }
`;

const AlertItem = styled.div<{ $severity: string }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  background: ${props => {
    switch (props.$severity) {
      case 'Critical': return theme.colors.error[50];
      case 'High': return theme.colors.error[50];
      case 'Medium': return theme.colors.warning[50];
      default: return theme.colors.info[50];
    }
  }};
  border-radius: ${theme.borderRadius.lg};
  border-left: 4px solid ${props => {
    switch (props.$severity) {
      case 'Critical': return theme.colors.error[500];
      case 'High': return theme.colors.error[500];
      case 'Medium': return theme.colors.warning[500];
      default: return theme.colors.info[500];
    }
  }};
  transition: all 0.2s ease;

  &:hover {
    transform: translateX(4px);
    box-shadow: ${theme.shadows.sm};
  }
`;

const AlertContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const AlertTitle = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.gray[900]};
  margin-bottom: ${theme.spacing.xs};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const AlertMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.gray[500]};
  flex-wrap: wrap;
`;

const QuickActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${theme.spacing.lg};
  margin-top: ${theme.spacing.xl};
`;

const QuickActionCard = styled.div`
  background: white;
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.gray[200]};
  padding: ${theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${theme.shadows.lg};
    border-color: ${theme.colors.primary[300]};
  }
`;

const QuickActionIcon = styled.div<{ $bgColor: string }>`
  width: 56px;
  height: 56px;
  border-radius: ${theme.borderRadius.lg};
  background: ${props => props.$bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  flex-shrink: 0;
`;

const QuickActionContent = styled.div`
  flex: 1;
`;

const QuickActionTitle = styled.div`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.gray[900]};
  margin-bottom: ${theme.spacing.xs};
`;

const QuickActionDescription = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[500]};
`;

const Dashboard: React.FC = () => {
  const { 
    sodViolations, 
    fraudAlerts, 
    statutoryFilings, 
    auditFindings,
    auditLogs 
  } = useData();

  // Calculate metrics
  const metrics = useMemo(() => {
    return {
      totalViolations: sodViolations.length,
      highRiskViolations: sodViolations.filter(v => v.riskLevel === 'High').length,
      criticalAlerts: fraudAlerts.filter(a => a.severity === 'Critical' && a.status === 'New').length,
      overdueFilings: statutoryFilings.filter(f => f.status === 'Overdue').length,
      openFindings: auditFindings.filter(f => f.status === 'Open').length,
      complianceScore: 87,
      weeklyAuditEvents: auditLogs.filter(log => {
        const logDate = new Date(log.timestamp);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return logDate > weekAgo;
      }).length,
    };
  }, [sodViolations, fraudAlerts, statutoryFilings, auditFindings, auditLogs]);

  // Chart data
  const weeklyActivityData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      audits: Math.floor(Math.random() * 20) + 5,
      alerts: Math.floor(Math.random() * 10) + 1,
      violations: Math.floor(Math.random() * 8) + 1,
    }));
  }, []);

  const violationTrendData = useMemo(() => {
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(month => ({
      month,
      'SOD Violations': Math.floor(Math.random() * 15) + 5,
      'Fraud Alerts': Math.floor(Math.random() * 12) + 3,
      'Audit Findings': Math.floor(Math.random() * 10) + 2,
    }));
  }, []);

  const riskDistributionData = useMemo(() => {
    const high = sodViolations.filter(v => v.riskLevel === 'High').length;
    const medium = sodViolations.filter(v => v.riskLevel === 'Medium').length;
    const low = sodViolations.filter(v => v.riskLevel === 'Low').length;
    
    return [
      { name: 'High', value: high },
      { name: 'Medium', value: medium },
      { name: 'Low', value: low },
    ];
  }, [sodViolations]);

  const filingStatusData = useMemo(() => {
    const submitted = statutoryFilings.filter(f => f.status === 'Submitted').length;
    const inProgress = statutoryFilings.filter(f => f.status === 'In Progress').length;
    const draft = statutoryFilings.filter(f => f.status === 'Draft').length;
    const overdue = statutoryFilings.filter(f => f.status === 'Overdue').length;

    return [
      { name: 'Submitted', value: submitted },
      { name: 'In Progress', value: inProgress },
      { name: 'Draft', value: draft },
      { name: 'Overdue', value: overdue },
    ];
  }, [statutoryFilings]);

  // Recent alerts
  const recentAlerts = useMemo(() => {
    return fraudAlerts
      .filter(a => a.status === 'New' || a.status === 'Investigating')
      .slice(0, 5);
  }, [fraudAlerts]);

  // Recent audit logs columns
  const auditColumns = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (item: any) => new Date(item.timestamp).toLocaleString(),
    },
    {
      key: 'user',
      header: 'User',
    },
    {
      key: 'action',
      header: 'Action',
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: any) => <StatusBadge status={item.status} />,
    },
  ];

  const quickActions = [
    {
      icon: <FaExclamationTriangle />,
      title: 'Review SOD Violations',
      description: `${metrics.highRiskViolations} high risk violations need attention`,
      bgColor: theme.colors.error[500],
      onClick: () => console.log('Navigate to SOD'),
    },
    {
      icon: <FaBell />,
      title: 'Investigate Fraud Alerts',
      description: `${metrics.criticalAlerts} critical alerts require immediate action`,
      bgColor: theme.colors.warning[500],
      onClick: () => console.log('Navigate to Fraud'),
    },
    {
      icon: <FaFileAlt />,
      title: 'File Statutory Returns',
      description: `${metrics.overdueFilings} filings overdue`,
      bgColor: theme.colors.info[500],
      onClick: () => console.log('Navigate to Filings'),
    },
    {
      icon: <FaClipboardCheck />,
      title: 'Address Audit Findings',
      description: `${metrics.openFindings} open findings pending closure`,
      bgColor: theme.colors.purple[500],
      onClick: () => console.log('Navigate to Audit'),
    },
  ];

  return (
    <PageContainer>
      <WelcomeSection>
        <WelcomeTitle>Good morning</WelcomeTitle>
        <WelcomeSubtitle>
          Here's your compliance overview for today, {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </WelcomeSubtitle>
      </WelcomeSection>

     
<MetricGrid>
  <MetricCard
    label="Compliance Score"
    value="87%"
    icon={<FaShieldAlt />}
    trend={{ value: 5, isPositive: true, label: 'vs last month' }}
    color="success"
  />
  <MetricCard
    label="Open Violations"
    value={metrics.totalViolations}
    icon={<FaExclamationTriangle />}
    subtext={`${metrics.highRiskViolations} high risk`}
    color="error"
  />
  <MetricCard
    label="Active Alerts"
    value={metrics.criticalAlerts}
    icon={<FaBell />}
    subtext="Critical severity"
    color="warning"
  />
  <MetricCard
    label="Weekly Events"
    value={metrics.weeklyAuditEvents}
    icon={<FaChartLine />}
    trend={{ value: 12, isPositive: false, label: 'vs last week' }}
    color="info"
  />
</MetricGrid>
      <GridContainer>
  <ChartCard $colspan={12}>
    <ChartHeader>
      <ChartTitle>Risk Trends</ChartTitle>
      <ViewAllLink>View detailed report →</ViewAllLink>
    </ChartHeader>
    <ChartBody>
      <LineChart
        data={violationTrendData}
        xAxisKey="month"
        series={[
          { key: 'SOD Violations', name: 'SOD Violations', color: theme.colors.error[500] },
          { key: 'Fraud Alerts', name: 'Fraud Alerts', color: theme.colors.warning[500] },
          { key: 'Audit Findings', name: 'Audit Findings', color: theme.colors.info[500] },
        ]}
        height={280}
      />
    </ChartBody>
  </ChartCard>

  <ChartCard $colspan={6}>
    <ChartHeader>
      <ChartTitle>Risk Distribution</ChartTitle>
    </ChartHeader>
    <ChartBody>
      <PieChart
        data={riskDistributionData}
        colors={[
          theme.colors.error[500],
          theme.colors.warning[500],
          theme.colors.success[500],
        ]}
        height={220}
      />
    </ChartBody>
    <LegendContainer>
      {riskDistributionData.map((item, index) => {
        const colors = [
          theme.colors.error[500],
          theme.colors.warning[500],
          theme.colors.success[500],
        ];
        const total = riskDistributionData.reduce((sum, i) => sum + i.value, 0);
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
      <ChartTitle>Filing Status</ChartTitle>
    </ChartHeader>
    <ChartBody>
      <PieChart
        data={filingStatusData}
        colors={[
          theme.colors.success[500],
          theme.colors.info[500],
          theme.colors.gray[400],
          theme.colors.error[500],
        ]}
        height={220}
      />
    </ChartBody>
  </ChartCard>

  <ChartCard $colspan={7}>
    <ChartHeader>
      <ChartTitle>Weekly Activity</ChartTitle>
      <ViewAllLink>View all activity →</ViewAllLink>
    </ChartHeader>
    <ChartBody>
      <BarChart
        data={weeklyActivityData}
        xAxisKey="day"
        series={[
          { key: 'audits', name: 'Audit Events', color: theme.colors.primary[500] },
          { key: 'alerts', name: 'Fraud Alerts', color: theme.colors.warning[500] },
          { key: 'violations', name: 'Violations', color: theme.colors.error[500] },
        ]}
        height={280}
      />
    </ChartBody>
  </ChartCard>
  <ChartCard $colspan={5}>
    <ChartHeader>
      <ChartTitle>Recent Alerts</ChartTitle>
      <ViewAllLink>View all →</ViewAllLink>
    </ChartHeader>
    <AlertList>
      {recentAlerts.map((alert) => (
        <AlertItem key={alert.id} $severity={alert.severity}>
          <AlertContent>
            <AlertTitle>{alert.alertType}</AlertTitle>
            <AlertMeta>
              <RiskBadge level={alert.severity as any} />
              <span>•</span>
              <span>{new Date(alert.timestamp).toLocaleDateString()}</span>
              <span>•</span>
              <StatusBadge status={alert.status} showDot={false} />
            </AlertMeta>
          </AlertContent>
        </AlertItem>
      ))}
    </AlertList>
  </ChartCard>

  <ChartCard $colspan={12}>
    <ChartHeader>
      <ChartTitle>Recent Audit Activity</ChartTitle>
      <ViewAllLink>View full audit trail →</ViewAllLink>
    </ChartHeader>
    <ScrollableTable
      columns={auditColumns}
      data={auditLogs.slice(0, 5)}
    />
  </ChartCard>
</GridContainer>

      
    </PageContainer>
  );
};

export default Dashboard;