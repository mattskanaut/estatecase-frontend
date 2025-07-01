'use client';

import { useState, useEffect } from 'react';
import PropertySearch from '@/components/property/PropertySearch';
import PropertyDetails from '@/components/property/PropertyDetails';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardCard from '@/components/dashboard/DashboardCard';
import { OSAddressResult, PropertyDetails as PropertyDetailsType, apiClient } from '@/lib/api/client';

export default function PropertiesPage() {
  const [selectedProperty, setSelectedProperty] = useState<PropertyDetailsType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  // Check API connectivity on page load
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('🏥 Checking API health...');
        }
        await apiClient.healthCheck();
        setApiStatus('connected');
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ API is healthy');
        }
      } catch (err) {
        console.error('💔 API health check failed:', err);
        setApiStatus('error');
      }
    };
    
    checkApiHealth();
  }, []);

  const handlePropertySelect = async (addressResult: OSAddressResult) => {
    setLoading(true);
    setError(null);
    
    try {
      const propertyDetails = await apiClient.getProperty(addressResult.uprn);
      setSelectedProperty(propertyDetails);
    } catch (err) {
      setError('Failed to load property details. Please try again.');
      console.error('Property details error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Property Search</h1>
            <p className="text-gray-400 mt-1">Search and analyze UK property data</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            apiStatus === 'connected' ? 'bg-green-900 text-green-300 border border-green-700' :
            apiStatus === 'error' ? 'bg-red-900 text-red-300 border border-red-700' :
            'bg-yellow-900 text-yellow-300 border border-yellow-700'
          }`}>
            {apiStatus === 'connected' ? '● API Connected' :
             apiStatus === 'error' ? '● API Offline' :
             '● Connecting...'}
          </div>
        </div>
      </div>

      {/* Search Card */}
      <DashboardCard title="Search Properties" className="mb-6">
        <PropertySearch onPropertySelect={handlePropertySelect} />
      </DashboardCard>

      {/* Loading State */}
      {loading && (
        <DashboardCard title="Loading" className="mb-6">
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <div className="mt-2 text-gray-300">Loading property details...</div>
          </div>
        </DashboardCard>
      )}

      {/* Error State */}
      {error && (
        <DashboardCard title="Error" className="mb-6">
          <div className="p-4 bg-red-900 border border-red-700 text-red-300 rounded-lg">
            {error}
          </div>
        </DashboardCard>
      )}

      {/* Property Details */}
      {selectedProperty && !loading && (
        <DashboardCard title="Property Details" className="mb-6">
          <PropertyDetails property={selectedProperty} />
        </DashboardCard>
      )}

      {/* Empty State */}
      {!selectedProperty && !loading && !error && (
        <DashboardCard title="Getting Started" className="mb-6">
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-200 mb-1">
              Search for a property
            </h3>
            <p className="text-gray-400">
              Enter an address above to get started with property analysis.
            </p>
          </div>
        </DashboardCard>
      )}
    </DashboardLayout>
  );
}