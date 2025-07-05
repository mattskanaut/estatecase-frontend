'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardCard from '@/components/dashboard/DashboardCard';
import { 
  apiClient, 
  SearchResponse, 
  EnrichedEntity,
  SearchParams 
} from '@/lib/api/client';

export default function DealsPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const searchParams: SearchParams = {
        q: query.trim(),
        entity_types: 'deal',
        limit: 20
      };

      // Add date filters if provided
      if (fromDate) {
        searchParams.updated_after = fromDate;
      }
      if (toDate) {
        searchParams.updated_before = toDate;
      }
      
      const searchResults = await apiClient.search(searchParams);
      setResults(searchResults);
    } catch (err) {
      setError('Failed to search deals. Please try again.');
      console.error('Deal search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
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

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Deal Search</h1>
          <p className="text-gray-400 mt-1">Search and analyze deal data</p>
        </div>
      </div>

      {/* Search Card */}
      <DashboardCard title="Search Deals" className="mb-6">
        <div className="w-full max-w-4xl mx-auto">
          <div className="space-y-4">
            {/* Main search input */}
            <div className="relative">
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Search for deals... Try 'luxury apartments' or 'deceased estate'"
                  className="w-full pl-10 pr-24 py-3 text-lg border border-gray-600 bg-gray-700 text-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm placeholder:text-gray-400"
                />
                <button
                  onClick={handleSearch}
                  disabled={loading || !query.trim()}
                  className="absolute inset-y-0 right-0 flex items-center px-6 text-white bg-blue-600 rounded-r hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Search'
                  )}
                </button>
              </div>
            </div>

            {/* Date filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fromDate" className="block text-sm font-medium text-gray-300 mb-2">
                  Updated From
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" />
                    </svg>
                  </div>
                  <input
                    type="date"
                    id="fromDate"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="toDate" className="block text-sm font-medium text-gray-300 mb-2">
                  Updated To
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" />
                    </svg>
                  </div>
                  <input
                    type="date"
                    id="toDate"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Clear filters */}
            {(fromDate || toDate) && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  {fromDate && toDate && `Filtering deals updated between ${fromDate} and ${toDate}`}
                  {fromDate && !toDate && `Filtering deals updated after ${fromDate}`}
                  {!fromDate && toDate && `Filtering deals updated before ${toDate}`}
                </div>
                <button
                  onClick={() => {
                    setFromDate('');
                    setToDate('');
                  }}
                  className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
                  </svg>
                  Clear dates
                </button>
              </div>
            )}
            
            {/* Search hints */}
            <div className="text-sm text-gray-400">
              Try searching for: &ldquo;luxury apartments&rdquo; or &ldquo;deceased estate&rdquo; or &ldquo;London investment&rdquo;
            </div>
          </div>
        </div>
      </DashboardCard>

      {/* Error State */}
      {error && (
        <DashboardCard title="Error" className="mb-6">
          <div className="p-4 bg-red-900 border border-red-700 text-red-300 rounded">
            {error}
          </div>
        </DashboardCard>
      )}

      {/* Search Results */}
      {results && !loading && (
        <DashboardCard title={`Search Results (${results.total_count} found)`} className="mb-6">
          <div className="space-y-4">
            {results.results.map((result: EnrichedEntity, index: number) => {
              const deal = result.deal;
              if (!deal) return null;

              return (
                <div 
                  key={`${result.entity_id}-${index}`} 
                  className="border border-gray-600 rounded p-4 hover:bg-gray-800 transition-colors cursor-pointer"
                  onClick={() => router.push(`/deals/${result.entity_id}`)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-200 text-lg mb-1 hover:text-blue-300 transition-colors">
                        {deal.name}
                      </h3>
                      {deal.background && (
                        <p className="text-gray-400 text-sm mb-2">{deal.background}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(deal.status)}`}>
                        {deal.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        Score: {Math.round(result.score * 100)}%
                      </span>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Price:</span>
                      <div className="text-gray-200 font-medium">{formatPrice(deal.price, deal.currency)}</div>
                    </div>
                    
                    {deal.category && (
                      <div>
                        <span className="text-gray-400">Category:</span>
                        <div className="text-gray-200">{deal.category}</div>
                      </div>
                    )}
                    
                    {deal.author_name && (
                      <div>
                        <span className="text-gray-400">Author:</span>
                        <div className="text-gray-200">{deal.author_name}</div>
                      </div>
                    )}
                    
                    {deal.owner_name && (
                      <div>
                        <span className="text-gray-400">Owner:</span>
                        <div className="text-gray-200">{deal.owner_name}</div>
                      </div>
                    )}
                    
                    <div>
                      <span className="text-gray-400">Created:</span>
                      <div className="text-gray-200">{new Date(deal.created_at).toLocaleDateString()}</div>
                    </div>
                    
                    <div>
                      <span className="text-gray-400">Updated:</span>
                      <div className="text-gray-200">{new Date(deal.updated_at).toLocaleDateString()}</div>
                    </div>
                  </div>

                  {/* Tags */}
                  {deal.tags && deal.tags.length > 0 && (
                    <div className="mt-3">
                      <span className="text-gray-400 text-sm">Tags:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {deal.tags.map((tag, tagIndex) => (
                          <span key={tagIndex} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Related entities count */}
                  <div className="mt-3 flex space-x-4 text-xs text-gray-400">
                    {result.properties.length > 0 && (
                      <span>{result.properties.length} related properties</span>
                    )}
                    {result.notes.length > 0 && (
                      <span>{result.notes.length} notes</span>
                    )}
                    {result.people.length > 0 && (
                      <span>{result.people.length} people</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination info */}
          <div className="mt-6 text-sm text-gray-400 text-center">
            Showing {results.results.length} of {results.total_count} results
            {results.has_more && (
              <span className="ml-2">(More results available)</span>
            )}
          </div>
        </DashboardCard>
      )}

      {/* Loading State */}
      {loading && (
        <DashboardCard title="Loading" className="mb-6">
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <div className="mt-2 text-gray-300">Searching deals...</div>
          </div>
        </DashboardCard>
      )}

      {/* Empty State */}
      {!results && !loading && !error && (
        <DashboardCard title="Getting Started" className="mb-6">
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-200 mb-1">
              Search for deals
            </h3>
            <p className="text-gray-400">
              Enter a search query above to find deals in your system.
            </p>
          </div>
        </DashboardCard>
      )}
    </DashboardLayout>
  );
}