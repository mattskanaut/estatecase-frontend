'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardCard from '@/components/dashboard/DashboardCard';
import { apiClient } from '@/lib/api/client';

export default function SettingsPage() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    // Get current API URL
    setApiUrl(process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000');

    // Check API connectivity
    const checkApiHealth = async () => {
      try {
        await apiClient.healthCheck();
        setApiStatus('connected');
      } catch (err) {
        console.error('API health check failed:', err);
        setApiStatus('error');
      }
    };
    
    checkApiHealth();
    
    // Check API health every 30 seconds
    const interval = setInterval(checkApiHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Settings</h1>
          <p className="text-gray-400 mt-1">System configuration and status</p>
        </div>
      </div>

      {/* API Status Card */}
      <DashboardCard title="API Connection Status" className="mb-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-300">Backend API</h3>
              <p className="text-xs text-gray-500 mt-1">{apiUrl}</p>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
              apiStatus === 'connected' ? 'bg-teal-900/50 text-teal-400 border border-teal-800' :
              apiStatus === 'error' ? 'bg-red-900/50 text-red-400 border border-red-800' :
              'bg-amber-900/50 text-amber-400 border border-amber-800'
            }`}>
              <div className={`h-2 w-2 rounded-full ${
                apiStatus === 'connected' ? 'bg-teal-400' :
                apiStatus === 'error' ? 'bg-red-400' :
                'bg-amber-400 animate-pulse'
              }`}></div>
              {apiStatus === 'connected' ? 'Connected' :
               apiStatus === 'error' ? 'Disconnected' :
               'Checking...'}
            </div>
          </div>
          
          {apiStatus === 'error' && (
            <div className="mt-3 p-3 bg-red-900/20 border border-red-800 rounded-lg">
              <p className="text-xs text-red-400">
                Unable to connect to the backend API. Please ensure the API server is running on {apiUrl}.
              </p>
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t border-gray-800">
            <h4 className="text-xs font-medium text-gray-400 mb-2">Connection Details</h4>
            <div className="space-y-1 text-xs">
              <div>
                <span className="text-gray-500">Status:</span>
                <span className={`ml-2 ${
                  apiStatus === 'connected' ? 'text-teal-400' :
                  apiStatus === 'error' ? 'text-red-400' :
                  'text-amber-400'
                }`}>
                  {apiStatus === 'connected' ? 'Healthy' :
                   apiStatus === 'error' ? 'Offline' :
                   'Checking...'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Last Check:</span>
                <span className="ml-2 text-gray-300">{new Date().toLocaleTimeString()}</span>
              </div>
              <div>
                <span className="text-gray-500">Environment:</span>
                <span className="ml-2 text-gray-300">{process.env.NODE_ENV}</span>
              </div>
            </div>
          </div>
        </div>
      </DashboardCard>
    </DashboardLayout>
  );
}