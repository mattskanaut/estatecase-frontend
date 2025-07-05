'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardCard from '@/components/dashboard/DashboardCard';
import PropertyDetails from '@/components/property/PropertyDetails';
import { 
  apiClient, 
  DealDetailDTO, 
  PropertyDetails as PropertyDetailsType,
  NoteDTO,
  AttachmentDTO,
  PersonDTO,
  CompanyDTO,
  PropertySummaryDTO
} from '@/lib/api/client';

interface ExpandableDescriptionProps {
  description: string;
}

function ExpandableDescription({ description }: ExpandableDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = description.length > 150 || description.split('\n').length > 2;
  
  const truncatedDescription = shouldTruncate 
    ? description.substring(0, 150) + (description.length > 150 ? '...' : '')
    : description;

  if (!shouldTruncate) {
    return <p className="text-gray-300 text-lg max-w-4xl">{description}</p>;
  }

  return (
    <div className="max-w-4xl">
      {isExpanded ? (
        <div className="bg-gray-700 rounded p-4 border border-gray-600">
          <p className="text-gray-300 text-lg whitespace-pre-wrap leading-relaxed">{description}</p>
          <button
            onClick={() => setIsExpanded(false)}
            className="mt-3 text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" />
            </svg>
            Show less
          </button>
        </div>
      ) : (
        <div>
          <p className="text-gray-300 text-lg">{truncatedDescription}</p>
          <button
            onClick={() => setIsExpanded(true)}
            className="mt-2 text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
            Show more
          </button>
        </div>
      )}
    </div>
  );
}

export default function DealDetailPage() {
  const params = useParams();
  const dealId = params.id as string;
  
  const [deal, setDeal] = useState<DealDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<PropertyDetailsType | null>(null);
  const [selectedPropertyUprn, setSelectedPropertyUprn] = useState<string | null>(null);
  const [loadingProperty, setLoadingProperty] = useState(false);
  const [propertyError, setPropertyError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDealDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const dealDetail = await apiClient.getDealDetail(dealId);
        setDeal(dealDetail);
      } catch (err) {
        setError('Failed to load deal details. Please try again.');
        console.error('Deal detail error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (dealId) {
      fetchDealDetail();
    }
  }, [dealId]);

  const handlePropertySelect = async (property: PropertySummaryDTO) => {
    // If clicking the same property, close it
    if (selectedPropertyUprn === property.uprn) {
      setSelectedProperty(null);
      setSelectedPropertyUprn(null);
      return;
    }
    
    setLoadingProperty(true);
    setPropertyError(null);
    setSelectedPropertyUprn(property.uprn);
    
    try {
      const propertyDetails = await apiClient.getProperty(property.uprn);
      setSelectedProperty(propertyDetails);
    } catch (err) {
      setPropertyError('Failed to load property details. Please try again.');
      console.error('Property details error:', err);
      setSelectedPropertyUprn(null);
    } finally {
      setLoadingProperty(false);
    }
  };

  const formatPrice = (price?: number, currency?: string) => {
    if (!price) return 'Price not set';
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency || 'GBP',
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'won': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardCard title="Loading" className="mb-6">
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <div className="mt-2 text-gray-300">Loading deal details...</div>
          </div>
        </DashboardCard>
      </DashboardLayout>
    );
  }

  if (error || !deal) {
    return (
      <DashboardLayout>
        <DashboardCard title="Error" className="mb-6">
          <div className="p-4 bg-red-900 border border-red-700 text-red-300 rounded-lg">
            {error || 'Deal not found'}
          </div>
        </DashboardCard>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-4">
        <div className="mb-3">
          <h1 className="text-lg font-semibold text-gray-100 mb-1">Deal Details</h1>
        </div>
        <div className="bg-gray-800 rounded p-3 border border-gray-600">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-100 mb-2">{deal.name}</h2>
              {deal.background && (
                <ExpandableDescription description={deal.background} />
              )}
            </div>
            <div className="flex flex-col items-end space-y-3 ml-6">
              <span className={`px-4 py-2 rounded text-sm font-bold uppercase tracking-wide ${getStatusColor(deal.status)}`}>
                {deal.status}
              </span>
              {deal.highrise_url && (
                <a 
                  href={deal.highrise_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" />
                    <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" />
                  </svg>
                  View in Highrise
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Deal Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
        <div className="bg-gray-800 rounded p-3 border border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Value</p>
              <p className="text-2xl text-emerald-400">{formatPrice(deal.price, deal.currency)}</p>
              <p className="text-xs text-gray-500">{deal.price_type}</p>
            </div>
            <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded p-3 border border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Notes</p>
              <p className="text-2xl text-blue-400">{deal.total_notes}</p>
            </div>
            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded p-3 border border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">People & Companies</p>
              <p className="text-2xl text-purple-400">{deal.total_parties}</p>
            </div>
            <div className="w-8 h-8 bg-purple-500 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded p-3 border border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Attachments</p>
              <p className="text-2xl text-orange-400">{deal.total_attachments}</p>
            </div>
            <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Key Details */}
      <DashboardCard title="Key Details" className="mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {deal.category && (
              <div className="bg-gray-700 rounded p-3 border border-gray-600">
                <h3 className="text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" />
                  </svg>
                  Category
                </h3>
                <div className="flex items-center gap-3">
                  {deal.category.color && (
                    <div 
                      className="w-3 h-3 rounded" 
                      style={{ backgroundColor: deal.category.color }}
                    />
                  )}
                  <span className="text-gray-200 font-medium">{deal.category.name}</span>
                </div>
              </div>
            )}
            
            <div className="bg-gray-700 rounded p-4 border border-gray-600">
              <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" />
                </svg>
                Created
              </h3>
              <p className="text-gray-200 font-medium">{new Date(deal.created_at).toLocaleDateString()}</p>
              <p className="text-sm text-gray-400">{new Date(deal.created_at).toLocaleTimeString()}</p>
            </div>
            
            <div className="bg-gray-700 rounded p-4 border border-gray-600">
              <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" />
                </svg>
                Last Updated
              </h3>
              <p className="text-gray-200 font-medium">{new Date(deal.updated_at).toLocaleDateString()}</p>
              <p className="text-sm text-gray-400">{new Date(deal.updated_at).toLocaleTimeString()}</p>
            </div>
            
            {deal.status_changed_on && (
              <div className="bg-gray-700 rounded p-3 border border-gray-600">
                <h3 className="text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                  </svg>
                  Status Changed
                </h3>
                <p className="text-gray-200 font-medium text-sm">{new Date(deal.status_changed_on).toLocaleDateString()}</p>
                <p className="text-xs text-gray-400">{new Date(deal.status_changed_on).toLocaleTimeString()}</p>
              </div>
            )}

            {/* Team - Author */}
            {deal.author && (
              <div className="bg-gray-700 rounded p-3 border border-gray-600">
                <h3 className="text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" />
                  </svg>
                  Deal Author
                </h3>
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-5 h-5 bg-emerald-500 rounded flex items-center justify-center">
                    <span className="text-white font-medium text-xs">
                      {deal.author.first_name?.[0]}{deal.author.last_name?.[0]}
                    </span>
                  </div>
                  <span className="text-gray-200 font-medium text-xs">{deal.author.full_name}</span>
                </div>
                {deal.author.email && (
                  <p className="text-xs text-gray-400">{deal.author.email}</p>
                )}
                {deal.author.title && (
                  <p className="text-xs text-gray-500">{deal.author.title}</p>
                )}
              </div>
            )}

            {/* Team - Owner */}
            {deal.owner && (
              <div className="bg-gray-700 rounded p-3 border border-gray-600">
                <h3 className="text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Deal Owner
                </h3>
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-5 h-5 bg-purple-500 rounded flex items-center justify-center">
                    <span className="text-white font-medium text-xs">
                      {deal.owner.first_name?.[0]}{deal.owner.last_name?.[0]}
                    </span>
                  </div>
                  <span className="text-gray-200 font-medium text-xs">{deal.owner.full_name}</span>
                </div>
                {deal.owner.email && (
                  <p className="text-xs text-gray-400">{deal.owner.email}</p>
                )}
                {deal.owner.title && (
                  <p className="text-xs text-gray-500">{deal.owner.title}</p>
                )}
              </div>
            )}

            {/* Parties Summary */}
            {(deal.parties.length > 0 || deal.companies.length > 0) && (
              <div className="bg-gray-700 rounded p-3 border border-gray-600">
                <h3 className="text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                  Parties ({deal.total_parties})
                </h3>
                <div className="space-y-1">
                  {deal.parties.length > 0 && (
                    <>
                      {deal.parties.slice(0, 2).map((person) => (
                        <div key={person.id} className="flex items-center gap-1.5">
                          <div className="w-4 h-4 bg-blue-500 rounded flex items-center justify-center">
                            <span className="text-white font-medium text-xs">
                              {person.first_name?.[0]}{person.last_name?.[0]}
                            </span>
                          </div>
                          <span className="text-gray-300 text-xs">{person.full_name}</span>
                        </div>
                      ))}
                      {deal.parties.length > 2 && (
                        <p className="text-xs text-gray-500 ml-5.5">+{deal.parties.length - 2} more people</p>
                      )}
                    </>
                  )}
                  {deal.companies.length > 0 && (
                    <>
                      {deal.companies.slice(0, 2).map((company) => (
                        <div key={company.id} className="flex items-center gap-1.5">
                          <div className="w-4 h-4 bg-orange-500 rounded flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 8a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1H8a1 1 0 01-1-1v-2z" />
                            </svg>
                          </div>
                          <span className="text-gray-300 text-xs">{company.name}</span>
                        </div>
                      ))}
                      {deal.companies.length > 2 && (
                        <p className="text-xs text-gray-500 ml-5.5">+{deal.companies.length - 2} more companies</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </DashboardCard>

      {/* Properties */}
      {deal.properties.length > 0 && (
        <DashboardCard title={`Linked Properties (${deal.properties.length})`} className="mb-3">
          <div className="space-y-2">
            {deal.properties.map((property) => {
              const getRelationshipColor = (type: string) => {
                switch (type.toLowerCase()) {
                  case 'target': return 'text-red-400';
                  case 'comparable': return 'text-blue-400';
                  case 'related': return 'text-green-400';
                  default: return 'text-gray-400';
                }
              };
              
              return (
                <div key={property.uprn} className="bg-gray-800 rounded p-3 border border-gray-600 hover:bg-gray-700 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-200 text-base mb-1">{property.address}</h3>
                      <p className="text-gray-400 mb-2 font-mono text-sm">{property.postcode}</p>
                      <div className="flex items-center space-x-4 text-sm">
                        {property.classification && (
                          <span className="bg-gray-700 px-2 py-1 rounded text-gray-300 text-xs">
                            {property.classification}
                          </span>
                        )}
                        {property.status && (
                          <span className="bg-gray-700 px-2 py-1 rounded text-gray-400 text-xs">
                            {property.status}
                          </span>
                        )}
                        <span className="text-gray-500 text-xs font-mono">
                          UPRN: {property.uprn}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handlePropertySelect(property)}
                      className={`px-4 py-2 rounded transition-all text-sm font-medium ${
                        selectedPropertyUprn === property.uprn
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {selectedPropertyUprn === property.uprn ? 'Close Details' : 'View Details'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </DashboardCard>
      )}

      {/* Property Details Modal */}
      {selectedProperty && (
        <DashboardCard title="Property Details" className="mb-6">
          <div className="mb-4">
            <button
              onClick={() => setSelectedProperty(null)}
              className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
            >
              Close Property Details
            </button>
          </div>
          <PropertyDetails property={selectedProperty} />
        </DashboardCard>
      )}

      {/* Property Loading */}
      {loadingProperty && (
        <DashboardCard title="Loading Property" className="mb-6">
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <div className="mt-2 text-gray-300">Loading property details...</div>
          </div>
        </DashboardCard>
      )}

      {/* Property Error */}
      {propertyError && (
        <DashboardCard title="Property Error" className="mb-6">
          <div className="p-4 bg-red-900 border border-red-700 text-red-300 rounded-lg">
            {propertyError}
          </div>
        </DashboardCard>
      )}

      {/* Tags */}
      {deal.tags && deal.tags.length > 0 && (
        <DashboardCard title={`Tags (${deal.tags.length})`} className="mb-3">
          <div className="flex flex-wrap gap-2">
            {deal.tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 px-3 py-1 rounded text-sm font-medium bg-gray-700 text-gray-200 border border-gray-600"
                style={tag.color ? { 
                  backgroundColor: `${tag.color}20`,
                  borderColor: tag.color,
                  color: tag.color 
                } : {}}
              >
                {tag.color && (
                  <div 
                    className="w-2 h-2 rounded" 
                    style={{ backgroundColor: tag.color }}
                  />
                )}
                {tag.name}
              </span>
            ))}
          </div>
        </DashboardCard>
      )}


      {/* Notes */}
      <DashboardCard title={`Notes (${deal.total_notes})`} className="mb-3">
        {deal.notes.length > 0 ? (
          <div className="space-y-3">
            {deal.notes.map((note, index) => {
              const getRandomGradient = (index: number) => {
                const gradients = [
                  'from-slate-900/30 to-slate-800/20 border-slate-600/30',
                  'from-gray-900/30 to-gray-800/20 border-gray-600/30',
                  'from-zinc-900/30 to-zinc-800/20 border-zinc-600/30',
                ];
                return gradients[index % gradients.length];
              };
              
              return (
                <div key={note.id} className="bg-gray-800 border border-gray-600 rounded p-3 hover:bg-gray-700 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                        {note.author_name ? (
                          <span className="text-white font-medium text-sm">
                            {note.author_name.split(' ').map(n => n[0]).join('')}
                          </span>
                        ) : (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        {note.author_name && (
                          <div className="font-semibold text-gray-200">{note.author_name}</div>
                        )}
                        <div className="text-sm text-gray-400 flex items-center gap-2">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" />
                          </svg>
                          {new Date(note.created_at).toLocaleDateString()} at {new Date(note.created_at).toLocaleTimeString()}
                          {note.updated_at !== note.created_at && (
                            <span className="ml-2 text-orange-400 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" />
                              </svg>
                              Updated {new Date(note.updated_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {note.attachments.length > 0 && (
                      <div className="bg-orange-500 px-2 py-1 rounded text-white flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" />
                        </svg>
                        <span className="text-xs font-medium">
                          {note.attachments.length} file{note.attachments.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-gray-700 rounded p-4 mb-4">
                    <div className="text-gray-200 whitespace-pre-wrap leading-relaxed">{note.body}</div>
                  </div>
                  
                  {note.attachments.length > 0 && (
                    <div className="border-t border-gray-600 pt-4">
                      <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" />
                        </svg>
                        Attachments
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {note.attachments.map((attachment) => (
                          <div key={attachment.id} className="bg-gray-700 rounded p-3 flex items-center justify-between hover:bg-gray-600 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                                </svg>
                              </div>
                              <div>
                                <div className="text-sm text-gray-200 font-medium">{attachment.filename}</div>
                                <div className="text-xs text-gray-400">
                                  {formatFileSize(attachment.file_size)}
                                </div>
                              </div>
                            </div>
                            {attachment.download_url && (
                              <a
                                href={attachment.download_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors flex items-center gap-1"
                              >
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" />
                                </svg>
                                Download
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-200 mb-1">No notes yet</h3>
            <p className="text-gray-400">Notes and updates will appear here as they&apos;re added to this deal.</p>
          </div>
        )}
      </DashboardCard>
    </DashboardLayout>
  );
}