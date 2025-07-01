'use client';

import { PropertyDetails as PropertyDetailsType } from '@/lib/api/client';
import GoogleMapWrapper from '@/components/maps/GoogleMapWrapper';

interface PropertyDetailsProps {
  property: PropertyDetailsType;
}

export default function PropertyDetails({ property }: PropertyDetailsProps) {
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
      <div className="border-b border-gray-700 pb-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-100 mb-2">
              {property.address}
            </h2>
            {property.post_town && property.post_town !== property.address && (
              <p className="text-lg text-gray-300 mb-2">{property.post_town}</p>
            )}
          </div>
          {property.status && (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              property.status === 'APPROVED' 
                ? 'bg-green-900 text-green-300 border border-green-700' 
                : 'bg-yellow-900 text-yellow-300 border border-yellow-700'
            }`}>
              {property.status}
            </span>
          )}
        </div>
        
        {/* Property identifiers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-400">UPRN:</span>
            <span className="ml-2 text-gray-200 font-mono">{property.uprn}</span>
          </div>
          <div>
            <span className="font-medium text-gray-400">Postcode:</span>
            <span className="ml-2 text-gray-200">{property.postcode}</span>
          </div>
          {property.classification && (
            <div>
              <span className="font-medium text-gray-400">Type:</span>
              <span className="ml-2 text-gray-200">{property.classification}</span>
            </div>
          )}
          {property.energy_rating && (
            <div>
              <span className="font-medium text-gray-700">Energy:</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                ['A', 'B'].includes(property.energy_rating) ? 'bg-green-100 text-green-800' :
                ['C', 'D'].includes(property.energy_rating) ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {property.energy_rating}
              </span>
            </div>
          )}
        </div>
        
        {/* Administrative info */}
        {(property.local_authority || property.country) && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
              {property.local_authority && (
                <span>Local Authority: {property.local_authority}</span>
              )}
              {property.country && (
                <span>Country: {property.country}</span>
              )}
              {property.last_updated && (
                <span>Updated: {formatDate(property.last_updated)}</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lease Information */}
        {property.lease_data && property.lease_data.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Lease Information</h3>
            <div className="space-y-3">
              {property.lease_data.map((lease, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {lease.lease_type && (
                      <div>
                        <span className="font-medium text-gray-700">Type:</span>
                        <span className="ml-2 text-gray-900">{lease.lease_type}</span>
                      </div>
                    )}
                    {lease.tenure && (
                      <div>
                        <span className="font-medium text-gray-700">Tenure:</span>
                        <span className="ml-2 text-gray-900">{lease.tenure}</span>
                      </div>
                    )}
                    {lease.registration_date && (
                      <div>
                        <span className="font-medium text-gray-700">Registered:</span>
                        <span className="ml-2 text-gray-900">{formatDate(lease.registration_date)}</span>
                      </div>
                    )}
                    {lease.remaining_years && (
                      <div>
                        <span className="font-medium text-gray-700">Years Remaining:</span>
                        <span className="ml-2 text-gray-900">{lease.remaining_years}</span>
                      </div>
                    )}
                  </div>
                  {(lease.lessor_name || lease.lessee_name) && (
                    <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
                      {lease.lessor_name && <div>Lessor: {lease.lessor_name}</div>}
                      {lease.lessee_name && <div>Lessee: {lease.lessee_name}</div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Price History */}
        {property.price_history && property.price_history.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Price History</h3>
            <div className="space-y-3">
              {property.price_history.map((transaction, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-lg text-gray-900">
                        {transaction.price ? formatPrice(transaction.price) : 'Price not disclosed'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {transaction.transaction_type || 'Sale'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.date ? formatDate(transaction.date) : 'Date unknown'}
                      </div>
                      {transaction.tenure_type && (
                        <div className="text-xs text-gray-500 mt-1">
                          {transaction.tenure_type}
                        </div>
                      )}
                    </div>
                  </div>
                  {transaction.property_type && (
                    <div className="text-xs text-gray-600">
                      Property Type: {transaction.property_type}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Property Characteristics */}
      {property.property_characteristics && Object.keys(property.property_characteristics).length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Property Characteristics</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {Object.entries(property.property_characteristics).map(([key, value]) => (
                <div key={key}>
                  <span className="font-medium text-gray-700 capitalize">
                    {key.replace(/_/g, ' ')}:
                  </span>
                  <span className="ml-2 text-gray-900">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Location with Map and Street View */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <h3 className="text-lg font-semibold text-gray-200 mb-3">Location</h3>
        <GoogleMapWrapper 
          coordinates={property.coordinates}
          address={property.address}
          className="mb-4"
        />
        <div className="text-xs text-gray-400 text-center">
          Coordinates: {property.coordinates.lat}, {property.coordinates.lng}
        </div>
      </div>
    </div>
  );
}