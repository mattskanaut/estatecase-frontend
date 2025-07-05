'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PropertyDetails as PropertyDetailsType } from '@/lib/api/client';
import GoogleMapWrapper from '@/components/maps/GoogleMapWrapper';

interface PropertyDetailsProps {
  property: PropertyDetailsType;
}

export default function PropertyDetails({ property }: PropertyDetailsProps) {
  const router = useRouter();
  const [showAllDetails, setShowAllDetails] = useState(false);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  return (
    <div>
      {/* Header */}
      <div className="border-b border-gray-800 pb-3 mb-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-100 mb-1">
              {property.address}
            </h2>
            {property.post_town && property.post_town !== property.address && (
              <p className="text-sm text-gray-400">{property.post_town}</p>
            )}
          </div>
          {property.status && (
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              property.status === 'APPROVED' 
                ? 'bg-teal-900/50 text-teal-400 border border-teal-800' 
                : 'bg-amber-900/50 text-amber-400 border border-amber-800'
            }`}>
              {property.status}
            </span>
          )}
        </div>
        
        {/* Property identifiers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="font-medium text-gray-500">UPRN:</span>
            <span className="ml-1 text-gray-300 font-mono">{property.uprn}</span>
          </div>
          <div>
            <span className="font-medium text-gray-500">Postcode:</span>
            <span className="ml-1 text-gray-300">{property.postcode}</span>
          </div>
          {property.classification && (
            <div>
              <span className="font-medium text-gray-500">Type:</span>
              <span className="ml-1 text-gray-300">{property.classification}</span>
            </div>
          )}
          {property.energy_rating && (
            <div>
              <span className="font-medium text-gray-500">Energy:</span>
              <span className={`ml-1 px-1.5 py-0.5 rounded text-xs font-medium ${
                ['A', 'B'].includes(property.energy_rating) ? 'bg-emerald-900/50 text-emerald-400' :
                ['C', 'D'].includes(property.energy_rating) ? 'bg-amber-900/50 text-amber-400' :
                'bg-red-900/50 text-red-400'
              }`}>
                {property.energy_rating}
              </span>
            </div>
          )}
        </div>
        
        {/* Collapsible Property Details Panel */}
        <div className="mt-3">
          <button
            onClick={() => setShowAllDetails(!showAllDetails)}
            className="w-full flex items-center justify-between p-3 bg-gray-900 hover:bg-gray-850 rounded border border-gray-800 transition-colors"
          >
            <span className="text-xs font-medium text-gray-400">
              {showAllDetails ? 'Hide' : 'Show'} Property Details
            </span>
            <svg 
              className={`w-4 h-4 text-gray-500 transform transition-transform ${showAllDetails ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showAllDetails && (
            <div className="mt-3 p-4 bg-gray-900 rounded border border-gray-800">
              <div className="space-y-3">
                {/* Identifiers */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 mb-2">Unique Identifiers</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs">
                    <div><span className="text-gray-500">UPRN:</span> <span className="text-gray-300">{property.uprn}</span></div>
                    {property.udprn && <div><span className="text-gray-500">UDPRN:</span> <span className="text-gray-300">{property.udprn}</span></div>}
                    {property.parent_uprn && <div><span className="text-gray-500">Parent UPRN:</span> <span className="text-gray-300">{property.parent_uprn}</span></div>}
                    {property.topography_layer_toid && <div><span className="text-gray-500">OS TOID:</span> <span className="text-gray-300">{property.topography_layer_toid}</span></div>}
                  </div>
                </div>

                {/* Full Address Details */}
                <div className="pt-3 border-t border-gray-800">
                  <h4 className="text-xs font-semibold text-gray-400 mb-2">Address Components</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs">
                    {property.organisation_name && <div><span className="text-gray-500">Organization:</span> <span className="text-gray-300">{property.organisation_name}</span></div>}
                    {property.sub_building_name && <div><span className="text-gray-500">Sub Building:</span> <span className="text-gray-300">{property.sub_building_name}</span></div>}
                    {property.building_name && <div><span className="text-gray-500">Building Name:</span> <span className="text-gray-300">{property.building_name}</span></div>}
                    {property.building_number && <div><span className="text-gray-500">Building Number:</span> <span className="text-gray-300">{property.building_number}</span></div>}
                    {property.thoroughfare_name && <div><span className="text-gray-500">Street:</span> <span className="text-gray-300">{property.thoroughfare_name}</span></div>}
                    {property.post_town && <div><span className="text-gray-500">Post Town:</span> <span className="text-gray-300">{property.post_town}</span></div>}
                    <div><span className="text-gray-500">Postcode:</span> <span className="text-gray-300">{property.postcode}</span></div>
                    {property.delivery_point_suffix && <div><span className="text-gray-500">Delivery Suffix:</span> <span className="text-gray-300">{property.delivery_point_suffix}</span></div>}
                  </div>
                </div>

                {/* Administrative Information */}
                <div className="pt-3 border-t border-gray-800">
                  <h4 className="text-xs font-semibold text-gray-400 mb-2">Administrative Boundaries</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs">
                    {property.local_authority && <div><span className="text-gray-500">Local Authority:</span> <span className="text-gray-300">{property.local_authority}</span></div>}
                    {property.local_authority_code && <div><span className="text-gray-500">LA Code:</span> <span className="text-gray-300">{property.local_authority_code}</span></div>}
                    {property.ward_code && <div><span className="text-gray-500">Ward:</span> <span className="text-gray-300">{property.ward_code}</span></div>}
                    {property.parish_code && <div><span className="text-gray-500">Parish:</span> <span className="text-gray-300">{property.parish_code}</span></div>}
                    {property.country && <div><span className="text-gray-500">Country:</span> <span className="text-gray-300">{property.country}</span></div>}
                    {property.country_code && <div><span className="text-gray-500">Country Code:</span> <span className="text-gray-300">{property.country_code}</span></div>}
                  </div>
                </div>

                {/* Classification and Status */}
                <div className="pt-3 border-t border-gray-800">
                  <h4 className="text-xs font-semibold text-gray-400 mb-2">Classification & Status</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs">
                    {property.classification && <div><span className="text-gray-500">Classification:</span> <span className="text-gray-300">{property.classification}</span></div>}
                    {property.classification_code && <div><span className="text-gray-500">Code:</span> <span className="text-gray-300">{property.classification_code}</span></div>}
                    {property.status && <div><span className="text-gray-500">Status:</span> <span className="text-gray-300">{property.status}</span></div>}
                    {property.logical_status_code && <div><span className="text-gray-500">Logical Status:</span> <span className="text-gray-300">{property.logical_status_code}</span></div>}
                    {property.blpu_state_code_description && <div><span className="text-gray-500">BLPU State:</span> <span className="text-gray-300">{property.blpu_state_code_description}</span></div>}
                    {property.blpu_state_date && <div><span className="text-gray-500">State Date:</span> <span className="text-gray-300">{formatDate(property.blpu_state_date)}</span></div>}
                  </div>
                </div>

                {/* Postal Information */}
                {(property.postal_address_code || property.postal_address_code_description) && (
                  <div className="pt-3 border-t border-gray-800">
                    <h4 className="text-xs font-semibold text-gray-400 mb-2">Postal Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs">
                      {property.postal_address_code_description && <div><span className="text-gray-500">Type:</span> <span className="text-gray-300">{property.postal_address_code_description}</span></div>}
                      {property.postal_address_code && <div><span className="text-gray-500">Code:</span> <span className="text-gray-300">{property.postal_address_code}</span></div>}
                    </div>
                  </div>
                )}

                {/* Property Characteristics */}
                {property.property_characteristics && Object.keys(property.property_characteristics).length > 0 && (
                  <div className="pt-3 border-t border-gray-800">
                    <h4 className="text-xs font-semibold text-gray-400 mb-2">Property Characteristics</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs">
                      {property.property_characteristics.floor_area && (
                        <div><span className="text-gray-500">Floor Area:</span> <span className="text-gray-300">{property.property_characteristics.floor_area} sqm</span></div>
                      )}
                      {property.property_characteristics.bedrooms && (
                        <div><span className="text-gray-500">Bedrooms:</span> <span className="text-gray-300">{property.property_characteristics.bedrooms}</span></div>
                      )}
                      {property.property_characteristics.bathrooms && (
                        <div><span className="text-gray-500">Bathrooms:</span> <span className="text-gray-300">{property.property_characteristics.bathrooms}</span></div>
                      )}
                      {property.property_characteristics.year_built && (
                        <div><span className="text-gray-500">Year Built:</span> <span className="text-gray-300">{property.property_characteristics.year_built}</span></div>
                      )}
                      {property.property_characteristics.construction_type && (
                        <div><span className="text-gray-500">Construction:</span> <span className="text-gray-300">{property.property_characteristics.construction_type}</span></div>
                      )}
                      {property.property_characteristics.council_tax_band && (
                        <div><span className="text-gray-500">Council Tax:</span> <span className="text-gray-300">Band {property.property_characteristics.council_tax_band}</span></div>
                      )}
                    </div>
                  </div>
                )}

                {/* Coordinates */}
                <div className="pt-3 border-t border-gray-800">
                  <h4 className="text-xs font-semibold text-gray-400 mb-2">Location Data</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs">
                    <div><span className="text-gray-500">Latitude:</span> <span className="text-gray-300">{property.coordinates.lat.toFixed(6)}</span></div>
                    <div><span className="text-gray-500">Longitude:</span> <span className="text-gray-300">{property.coordinates.lng.toFixed(6)}</span></div>
                    {property.british_national_grid && (
                      <>
                        <div><span className="text-gray-500">BNG Easting:</span> <span className="text-gray-300">{property.british_national_grid.x}</span></div>
                        <div><span className="text-gray-500">BNG Northing:</span> <span className="text-gray-300">{property.british_national_grid.y}</span></div>
                      </>
                    )}
                  </div>
                </div>

                {/* Metadata */}
                <div className="pt-3 border-t border-gray-800">
                  <h4 className="text-xs font-semibold text-gray-400 mb-2">Metadata</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs">
                    {property.entry_date && <div><span className="text-gray-500">Entry Date:</span> <span className="text-gray-300">{formatDate(property.entry_date)}</span></div>}
                    {property.last_updated && <div><span className="text-gray-500">Last Updated:</span> <span className="text-gray-300">{formatDate(property.last_updated)}</span></div>}
                    {property.data_source && <div><span className="text-gray-500">Data Source:</span> <span className="text-gray-300">{property.data_source}</span></div>}
                    {property.language && <div><span className="text-gray-500">Language:</span> <span className="text-gray-300">{property.language}</span></div>}
                    {property.match && <div><span className="text-gray-500">Match Score:</span> <span className="text-gray-300">{property.match.toFixed(2)}%</span></div>}
                    {property.match_description && <div><span className="text-gray-500">Match Type:</span> <span className="text-gray-300">{property.match_description}</span></div>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Lease Information - Full View */}
        {property.lease_data && property.lease_data.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-200 mb-2 flex items-center">
              <span className="mr-2">Lease Information</span>
              <span className="text-xs text-gray-500">({property.lease_data.length})</span>
            </h3>
            <div className="space-y-2">
              {[...property.lease_data]
                .sort((a, b) => {
                  // Sort by end_date (latest expiry first), then by start_date if no end_date
                  const dateA = a.end_date || a.start_date || a.date_of_lease || '';
                  const dateB = b.end_date || b.start_date || b.date_of_lease || '';
                  return new Date(dateB).getTime() - new Date(dateA).getTime();
                })
                .map((lease: any, index: number) => (
                <div key={index} className="bg-gray-900 p-2 rounded border border-gray-800">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-xs font-medium text-gray-400">Lease #{index + 1}</h4>
                    {lease.tenure && (
                      <span className="text-xs px-2 py-0.5 bg-purple-900/50 text-purple-400 rounded border border-purple-800">
                        {lease.tenure}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {lease.date_of_lease && (
                      <div>
                        <span className="font-medium text-gray-500">Lease Date:</span>
                        <span className="ml-1 text-gray-300">{formatDate(lease.date_of_lease)}</span>
                      </div>
                    )}
                    {lease.term && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-gray-500">Term:</span>
                        <span className="ml-1 text-gray-300">{lease.term}</span>
                      </div>
                    )}
                    {lease.start_date && (
                      <div>
                        <span className="font-medium text-gray-500">Start:</span>
                        <span className="ml-1 text-gray-300">{formatDate(lease.start_date)}</span>
                      </div>
                    )}
                    {lease.end_date && (
                      <div>
                        <span className="font-medium text-gray-500">End:</span>
                        <span className="ml-1 text-gray-300">{formatDate(lease.end_date)}</span>
                      </div>
                    )}
                    {(lease.years_remaining || lease.months_remaining) && (
                      <div>
                        <span className="font-medium text-gray-500">Remaining:</span>
                        <span className="ml-1 text-gray-300">
                          {lease.years_remaining && `${lease.years_remaining}y`}
                          {lease.years_remaining && lease.months_remaining && ' '}
                          {lease.months_remaining && `${lease.months_remaining}m`}
                        </span>
                      </div>
                    )}
                    {lease.price_paid && (
                      <div>
                        <span className="font-medium text-gray-500">Price:</span>
                        <span className="ml-1 text-gray-300">{formatPrice(lease.price_paid)}</span>
                      </div>
                    )}
                  </div>
                  
                  {(lease.register_property_description || lease.associated_property_description) && (
                    <div className="mt-2 pt-2 border-t border-gray-800 text-xs text-gray-500">
                      {lease.register_property_description && (
                        <div className="mb-1">{lease.register_property_description}</div>
                      )}
                    </div>
                  )}
                  
                  {lease.alienation_clause_indicator && (
                    <div className="mt-1 text-xs text-gray-600">
                      Alienation Clause: {lease.alienation_clause_indicator}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Price History - Full View */}
        {property.price_history && property.price_history.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-200 mb-2 flex items-center">
              <span className="mr-2">Price History</span>
              <span className="text-xs text-gray-500">({property.price_history.length})</span>
            </h3>
            <div className="space-y-2">
              {[...property.price_history]
                .sort((a, b) => {
                  // Sort by date (newest first)
                  const dateA = a.date || a.date_of_transfer || '';
                  const dateB = b.date || b.date_of_transfer || '';
                  return new Date(dateB).getTime() - new Date(dateA).getTime();
                })
                .map((transaction: any, index: number) => (
                <div key={index} className="bg-gray-900 p-2 rounded border border-gray-800">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <div className="font-semibold text-sm text-cyan-400">
                        {formatPrice(transaction.price)}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {transaction.property_type_description || transaction.property_type} • 
                        {transaction.duration_description || transaction.duration}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-gray-300">
                        {formatDate(transaction.date || transaction.date_of_transfer)}
                      </div>
                      {transaction.old_new && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {transaction.old_new === 'Y' ? 'New Build' : 'Established'}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Address if different from main property */}
                  {(transaction.paon || transaction.saon || transaction.street) && (
                    <div className="text-xs text-gray-600 mt-2">
                      {[transaction.saon, transaction.paon, transaction.street, transaction.locality, transaction.town_city]
                        .filter(Boolean)
                        .join(', ')}
                    </div>
                  )}
                  
                  {transaction.ppd_category_description && transaction.ppd_category_description !== 'Standard Price Paid' && (
                    <div className="text-xs text-amber-500 mt-1">
                      {transaction.ppd_category_description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Linked Deals */}
      {property.deals && property.deals.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-800">
          <h3 className="text-sm font-semibold text-gray-200 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" />
              <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
            </svg>
            Linked Deals ({property.deals.length})
          </h3>
          <div className="space-y-3">
            {property.deals.map((deal) => (
              <div 
                key={deal.id} 
                className="bg-gray-800 border border-gray-600 rounded p-4 hover:bg-gray-700 transition-all cursor-pointer"
                onClick={() => router.push(`/deals/${deal.id}`)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-200 text-lg mb-1 hover:text-blue-300 transition-colors">
                      {deal.name}
                    </h4>
                    {deal.background && (
                      <p className="text-gray-400 text-sm mb-2">{deal.background}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        deal.status === 'won' ? 'bg-green-100 text-green-800' :
                        deal.status === 'lost' ? 'bg-red-100 text-red-800' :
                        deal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {deal.status}
                      </span>
                      {deal.price && (
                        <span className="text-emerald-400 font-medium">
                          {new Intl.NumberFormat('en-GB', {
                            style: 'currency',
                            currency: deal.currency || 'GBP',
                          }).format(deal.price)}
                        </span>
                      )}
                      <span className="text-gray-500 text-xs">
                        Created: {new Date(deal.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Location with Map and Street View */}
      <div className="mt-6 pt-6 border-t border-gray-800">
        <h3 className="text-sm font-semibold text-gray-200 mb-3">Location</h3>
        <GoogleMapWrapper 
          coordinates={property.coordinates}
          address={property.address}
          className="mb-4"
        />
      </div>
    </div>
  );
}