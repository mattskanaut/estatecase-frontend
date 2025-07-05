'use client';

import { useState } from 'react';
import { apiClient, OSAddressResult } from '@/lib/api/client';

interface PropertySearchProps {
  onPropertySelect?: (address: OSAddressResult) => void;
}

export default function PropertySearch({ onPropertySelect }: PropertySearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<OSAddressResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const searchResults = await apiClient.searchAddresses(query.trim());
      setResults(searchResults);
    } catch (err) {
      setError('Failed to search addresses. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSelectResult = (result: OSAddressResult) => {
    onPropertySelect?.(result);
    setQuery(result.address);
    setResults([]);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative">
        <div className="relative mb-4">
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
              placeholder="Search for any property address in the UK..."
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
          
          {/* Search hints */}
          <div className="mt-2 text-sm text-gray-400">
            Try searching for: &ldquo;10 Downing Street, London&rdquo; or &ldquo;B1 1AA&rdquo; or &ldquo;Birmingham&rdquo;
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900 border border-red-700 text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {results.length > 0 && (
          <div className="absolute z-10 w-full bg-gray-800 border border-gray-600 rounded shadow-xl max-h-80 overflow-y-auto">
            <div className="p-3 bg-gray-700 border-b border-gray-600">
              <div className="text-sm font-medium text-gray-300">
                Found {results.length} matching address{results.length !== 1 ? 'es' : ''}
              </div>
            </div>
            {results.map((result, index) => (
              <div
                key={`${result.uprn}-${index}`}
                onClick={() => handleSelectResult(result)}
                className="p-4 hover:bg-gray-700 cursor-pointer border-b border-gray-600 last:border-b-0 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-gray-200 mb-1">{result.address}</div>
                    <div className="text-sm text-gray-400 space-x-3">
                      <span>{result.postcode}</span>
                      <span>UPRN: {result.uprn}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    {result.match_score && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                        {Math.round(result.match_score * 100)}% match
                      </span>
                    )}
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}