'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardCard from '@/components/dashboard/DashboardCard';
import StatsWidget from '@/components/dashboard/StatsWidget';
import { 
  BuildingOfficeIcon, 
  ChartBarIcon, 
  CurrencyPoundIcon,
  MapIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Dashboard</h1>
        <p className="text-gray-400 mt-1">Property investment analytics and overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsWidget
          title="Properties Analyzed"
          value="1,247"
          change={{ value: "+12% this month", type: "increase" }}
          icon={<BuildingOfficeIcon className="w-6 h-6 text-blue-400" />}
        />
        <StatsWidget
          title="Active Searches"
          value="23"
          change={{ value: "+3 today", type: "increase" }}
          icon={<MapIcon className="w-6 h-6 text-green-400" />}
        />
        <StatsWidget
          title="Avg. Property Value"
          value="£284k"
          change={{ value: "+5.2% this quarter", type: "increase" }}
          icon={<CurrencyPoundIcon className="w-6 h-6 text-yellow-400" />}
        />
        <StatsWidget
          title="Time Saved"
          value="127h"
          change={{ value: "vs manual research", type: "neutral" }}
          icon={<ClockIcon className="w-6 h-6 text-purple-400" />}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Activity */}
        <DashboardCard title="Recent Activity">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300">Property searched</p>
                <p className="text-xs text-gray-500">1, BEAUMONT ROAD, LONDON • 2 mins ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full mt-2"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300">API health check</p>
                <p className="text-xs text-gray-500">All systems operational • 5 mins ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300">Data enrichment completed</p>
                <p className="text-xs text-gray-500">SE19 postcode area • 12 mins ago</p>
              </div>
            </div>
          </div>
        </DashboardCard>

        {/* Quick Stats */}
        <DashboardCard title="Market Insights">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Avg. Days on Market</span>
              <span className="text-sm text-gray-200">42 days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Price Growth (YoY)</span>
              <span className="text-sm text-green-400">+8.3%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Distressed Properties</span>
              <span className="text-sm text-yellow-400">156 found</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Investment Opportunities</span>
              <span className="text-sm text-blue-400">23 flagged</span>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Chart Placeholder */}
      <DashboardCard 
        title="Property Value Trends"
        action={
          <button className="text-sm text-blue-400 hover:text-blue-300">
            View Details
          </button>
        }
        className="mb-6"
      >
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <ArrowTrendingUpIcon className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <p className="text-sm">Chart visualization coming soon</p>
            <p className="text-xs text-gray-600 mt-1">Property value trends and market analysis</p>
          </div>
        </div>
      </DashboardCard>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardCard title="Quick Search">
          <div className="text-center py-4">
            <MagnifyingGlassIcon className="w-8 h-8 mx-auto mb-2 text-gray-500" />
            <p className="text-sm text-gray-400 mb-3">Find properties by postcode or address</p>
            <a
              href="/properties"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm transition-colors inline-block"
            >
              Start Search
            </a>
          </div>
        </DashboardCard>

        <DashboardCard title="Market Analysis">
          <div className="text-center py-4">
            <ChartBarIcon className="w-8 h-8 mx-auto mb-2 text-gray-500" />
            <p className="text-sm text-gray-400 mb-3">Analyze market trends and opportunities</p>
            <button className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 px-4 rounded-md text-sm transition-colors">
              Coming Soon
            </button>
          </div>
        </DashboardCard>

        <DashboardCard title="Portfolio">
          <div className="text-center py-4">
            <BuildingOfficeIcon className="w-8 h-8 mx-auto mb-2 text-gray-500" />
            <p className="text-sm text-gray-400 mb-3">Manage your property investments</p>
            <button className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 px-4 rounded-md text-sm transition-colors">
              Coming Soon
            </button>
          </div>
        </DashboardCard>
      </div>
    </DashboardLayout>
  );
}