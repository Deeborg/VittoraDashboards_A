import React, { useState } from 'react';
import { mockData } from '../data/mockData';
import AgeingBarChart from '../components/charts/AgeingBarChart';
import DonutChart from '../components/charts/DonutChart';
import LineChartComponent from '../components/charts/LineChart';
import KpiCard from '../components/cards/KpiCard';
import ReceivablesTable from '../components/tables/ReceivablesTable';
import PayablesTable from '../components/tables/PayablesTable';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'receivables' | 'payables' | 'inventory' | 'liabilities' | 'advances'>('overview');

  // Chart data for Donut Charts - Updated with new ageing buckets
  const receivablesDonutData = [
    { name: '1-30 Days', value: mockData.receivables.summary.days30, color: '#4cc9f0' },
    { name: '31-60 Days', value: mockData.receivables.summary.days60, color: '#f39c12' },
    { name: '61-90 Days', value: mockData.receivables.summary.days90, color: '#e67e22' },
    { name: '91-120 Days', value: mockData.receivables.summary.days120, color: '#e74c3c' },
    { name: '121-180 Days', value: mockData.receivables.summary.days180, color: '#c0392b' },
    { name: '181-360 Days', value: mockData.receivables.summary.days360, color: '#8b0000' },
  ];

  const payablesDonutData = [
    { name: '1-30 Days', value: mockData.payables.summary.days30, color: '#4cc9f0' },
    { name: '31-60 Days', value: mockData.payables.summary.days60, color: '#f39c12' },
    { name: '61-90 Days', value: mockData.payables.summary.days90, color: '#e67e22' },
    { name: '91-120 Days', value: mockData.payables.summary.days120, color: '#e74c3c' },
    { name: '121-180 Days', value: mockData.payables.summary.days180, color: '#c0392b' },
    { name: '181-360 Days', value: mockData.payables.summary.days360, color: '#8b0000' },
  ];

  // Trend data for Line Chart
  const trendData = [
    { month: 'Jan', receivables: 2800000, payables: 2200000, workingCapital: 3200000 },
    { month: 'Feb', receivables: 2950000, payables: 2300000, workingCapital: 3400000 },
    { month: 'Mar', receivables: 3100000, payables: 2250000, workingCapital: 3600000 },
    { month: 'Apr', receivables: 3280000, payables: 2380000, workingCapital: 3800000 },
    { month: 'May', receivables: 3400000, payables: 2450000, workingCapital: 3950000 },
    { month: 'Jun', receivables: 3550000, payables: 2550000, workingCapital: 4100000 },
  ];

  const trendLines = [
    { key: 'receivables', name: 'Receivables', color: '#3b82f6' },
    { key: 'payables', name: 'Payables', color: '#10b981' },
    { key: 'workingCapital', name: 'Working Capital', color: '#8b5cf6' },
  ];

  // Inventory ageing data - Updated with new structure
  const inventoryAgeingData = [
    { name: '1-30 Days', value: mockData.inventory.ageingAnalysis.days30, color: '#4cc9f0' },
    { name: '31-60 Days', value: mockData.inventory.ageingAnalysis.days60, color: '#f39c12' },
    { name: '61-90 Days', value: mockData.inventory.ageingAnalysis.days90, color: '#e67e22' },
    { name: '91-120 Days', value: mockData.inventory.ageingAnalysis.days120, color: '#e74c3c' },
    { name: '121-180 Days', value: mockData.inventory.ageingAnalysis.days180, color: '#c0392b' },
    { name: '181-360 Days', value: mockData.inventory.ageingAnalysis.days360, color: '#8b0000' },
  ];

  // Liabilities ageing data
  const liabilitiesDonutData = [
    { name: '1-30 Days', value: mockData.liabilities.summary.days30, color: '#4cc9f0' },
    { name: '31-60 Days', value: mockData.liabilities.summary.days60, color: '#f39c12' },
    { name: '61-90 Days', value: mockData.liabilities.summary.days90, color: '#e67e22' },
    { name: '91-120 Days', value: mockData.liabilities.summary.days120, color: '#e74c3c' },
    { name: '121-180 Days', value: mockData.liabilities.summary.days180, color: '#c0392b' },
    { name: '181-360 Days', value: mockData.liabilities.summary.days360, color: '#8b0000' },
  ];

  // Advances ageing data
  const advancesDonutData = [
    { name: '1-30 Days', value: mockData.advances.summary.days30, color: '#4cc9f0' },
    { name: '31-60 Days', value: mockData.advances.summary.days60, color: '#f39c12' },
    { name: '61-90 Days', value: mockData.advances.summary.days90, color: '#e67e22' },
    { name: '91-120 Days', value: mockData.advances.summary.days120, color: '#e74c3c' },
    { name: '121-180 Days', value: mockData.advances.summary.days180, color: '#c0392b' },
    { name: '181-360 Days', value: mockData.advances.summary.days360, color: '#8b0000' },
  ];

  // Calculate inventory total value
  const inventoryTotalValue = 
    mockData.inventory.rm.reduce((sum, item) => sum + item.value, 0) +
    mockData.inventory.wip.reduce((sum, item) => sum + item.value, 0) +
    mockData.inventory.fg.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="min-h-screen gradient-bg p-4 md:p-6">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Ageing Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Monitor outstanding balances and improve cash flow with visual insights
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
              <span className="text-sm text-gray-600">Last updated: Today</span>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KpiCard
            title="Working Capital"
            value={mockData.workingCapital.workingCapital}
            label="Working Capital"
            status={mockData.workingCapital.workingCapitalRatio > 1.5 ? 'good' : 'warning'}
            change={12.5}
          />
          <KpiCard
            title="Total Receivables"
            value={mockData.receivables.summary.total}
            label="Receivables"
            status={mockData.receivables.overduePercentage > 30 ? 'danger' : 'warning'}
            change={-2.5}
          />
          <KpiCard
            title="Total Payables"
            value={mockData.payables.summary.total}
            label="Payables"
            status={mockData.payables.overduePercentage > 20 ? 'danger' : 'good'}
            change={1.8}
          />
          <KpiCard
            title="Current Ratio"
            value={parseFloat(mockData.workingCapital.workingCapitalRatio.toFixed(2))}
            label="Current Ratio"
            status={mockData.workingCapital.workingCapitalRatio > 1.5 ? 'good' : 'warning'}
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="glass-card rounded-2xl mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              <span>📊 Overview</span>
            </button>
            <button
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'receivables'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('receivables')}
            >
              <span>📄 Receivables</span>
            </button>
            <button
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'payables'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('payables')}
            >
              <span>📋 Payables</span>
            </button>
            <button
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'inventory'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('inventory')}
            >
              <span>📦 Inventory</span>
            </button>
            <button
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'liabilities'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('liabilities')}
            >
              <span>💰 Liabilities</span>
            </button>
            <button
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'advances'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('advances')}
            >
              <span>💳 Advances</span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Top Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <AgeingBarChart
                  data={mockData.receivables.summary}
                  title="Receivables Ageing Analysis"
                  type="receivables"
                />
                <AgeingBarChart
                  data={mockData.payables.summary}
                  title="Payables Ageing Analysis"
                  type="payables"
                />
              </div>

              {/* Donut Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <DonutChart
                  data={receivablesDonutData}
                  title="Receivables Distribution"
                  total={mockData.receivables.summary.total}
                />
                <DonutChart
                  data={payablesDonutData}
                  title="Payables Distribution"
                  total={mockData.payables.summary.total}
                />
                <DonutChart
                  data={inventoryAgeingData}
                  title="Inventory Ageing Distribution"
                  total={inventoryTotalValue}
                />
              </div>

              {/* Trend Chart */}
              <LineChartComponent
                title="6-Month Trend Analysis"
                data={trendData}
                lines={trendLines}
              />
            </div>
          )}

          {activeTab === 'receivables' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <AgeingBarChart
                  data={mockData.receivables.summary}
                  title="Receivables Ageing Analysis"
                  type="receivables"
                />
                <DonutChart
                  data={receivablesDonutData}
                  title="Receivables Distribution"
                  total={mockData.receivables.summary.total}
                />
              </div>
              <ReceivablesTable customers={mockData.receivables.customers} />
            </div>
          )}

          {activeTab === 'payables' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <AgeingBarChart
                  data={mockData.payables.summary}
                  title="Payables Ageing Analysis"
                  type="payables"
                />
                <DonutChart
                  data={payablesDonutData}
                  title="Payables Distribution"
                  total={mockData.payables.summary.total}
                />
              </div>
              <PayablesTable vendors={mockData.payables.vendors} />
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <DonutChart
                  data={inventoryAgeingData}
                  title="Inventory Ageing Distribution"
                  total={inventoryTotalValue}
                />
                <div className="glass-card rounded-2xl p-6 card-hover">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Inventory by Category</h3>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Raw Materials (RM)</span>
                        <span className="text-sm font-bold">
                          {mockData.inventory.rm.reduce((sum, item) => sum + item.value, 0).toLocaleString('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                            maximumFractionDigits: 0,
                          })}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-full bg-blue-500 rounded-full"
                          style={{ 
                            width: `${(mockData.inventory.rm.reduce((sum, item) => sum + item.value, 0) / inventoryTotalValue) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Work in Progress (WIP)</span>
                        <span className="text-sm font-bold">
                          {mockData.inventory.wip.reduce((sum, item) => sum + item.value, 0).toLocaleString('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                            maximumFractionDigits: 0,
                          })}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-full bg-amber-500 rounded-full"
                          style={{ 
                            width: `${(mockData.inventory.wip.reduce((sum, item) => sum + item.value, 0) / inventoryTotalValue) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Finished Goods (FG)</span>
                        <span className="text-sm font-bold">
                          {mockData.inventory.fg.reduce((sum, item) => sum + item.value, 0).toLocaleString('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                            maximumFractionDigits: 0,
                          })}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-full bg-green-500 rounded-full"
                          style={{ 
                            width: `${(mockData.inventory.fg.reduce((sum, item) => sum + item.value, 0) / inventoryTotalValue) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'liabilities' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <AgeingBarChart
                  data={mockData.liabilities.summary}
                  title="Liabilities Ageing Analysis"
                  type="liabilities"
                />
                <DonutChart
                  data={liabilitiesDonutData}
                  title="Liabilities Distribution"
                  total={mockData.liabilities.summary.total}
                />
              </div>
              <div className="glass-card rounded-2xl p-6 card-hover">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Loan Details</h3>
                <div className="space-y-4">
                  {mockData.liabilities.loans.map((loan) => (
                    <div key={loan.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900">{loan.type}</p>
                        <p className="text-sm text-gray-600">Due: {loan.dueDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {loan.amount.toLocaleString('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                            maximumFractionDigits: 0,
                          })}
                        </p>
                        <p className="text-sm text-gray-600">Interest: {loan.interestRate}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'advances' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <AgeingBarChart
                  data={mockData.advances.summary}
                  title="Advances Ageing Analysis"
                  type="advances"
                />
                <DonutChart
                  data={advancesDonutData}
                  title="Advances Distribution"
                  total={mockData.advances.summary.total}
                />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card rounded-2xl p-6 card-hover">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Customer Advances</h3>
                  <div className="space-y-4">
                    {mockData.advances.customerAdvances.map((advance) => (
                      <div key={advance.id} className="p-4 bg-blue-50 rounded-lg">
                        <p className="font-semibold text-gray-900">{advance.partyName}</p>
                        <div className="flex justify-between mt-2">
                          <div>
                            <p className="text-sm text-gray-600">Advance Date</p>
                            <p className="font-medium">{advance.advanceDate}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Balance</p>
                            <p className="font-bold text-green-600">
                              {advance.balance.toLocaleString('en-IN', {
                                style: 'currency',
                                currency: 'INR',
                                maximumFractionDigits: 0,
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="glass-card rounded-2xl p-6 card-hover">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Vendor Advances</h3>
                  <div className="space-y-4">
                    {mockData.advances.vendorAdvances.map((advance) => (
                      <div key={advance.id} className="p-4 bg-green-50 rounded-lg">
                        <p className="font-semibold text-gray-900">{advance.partyName}</p>
                        <div className="flex justify-between mt-2">
                          <div>
                            <p className="text-sm text-gray-600">Advance Date</p>
                            <p className="font-medium">{advance.advanceDate}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Balance</p>
                            <p className="font-bold text-green-600">
                              {advance.balance.toLocaleString('en-IN', {
                                style: 'currency',
                                currency: 'INR',
                                maximumFractionDigits: 0,
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Collection Efficiency</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {mockData.receivables.averageCollectionPeriod} days
              </p>
              <p className="text-sm text-gray-600">Average Collection Period</p>
            </div>
            <div className="text-right">
              <p className={`text-lg font-bold ${mockData.receivables.overduePercentage > 30 ? 'text-red-600' : 'text-amber-600'}`}>
                {mockData.receivables.overduePercentage}%
              </p>
              <p className="text-sm text-gray-600">Overdue</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Payment Efficiency</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {mockData.payables.averagePaymentPeriod} days
              </p>
              <p className="text-sm text-gray-600">Average Payment Period</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-green-600">
                {mockData.payables.overduePercentage}%
              </p>
              <p className="text-sm text-gray-600">Overdue</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Working Capital Health</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {mockData.workingCapital.workingCapitalRatio.toFixed(2)}x
              </p>
              <p className="text-sm text-gray-600">Current Ratio</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-green-600">Healthy</p>
              <p className="text-sm text-gray-600">Status</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;