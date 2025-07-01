const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Log the API URL on startup (development only)
if (process.env.NODE_ENV === 'development') {
  console.log(`🌐 API Base URL: ${API_BASE_URL}`);
}

// Types matching the backend DTOs
export interface OSAddressResult {
  uprn: string;
  address: string;
  postcode: string;
  coordinates?: { lat: number; lng: number };
  match_score?: number;
}

export interface PropertyDetails {
  // Core identifiers
  uprn: string;
  udprn?: string;
  
  // Address components
  address: string;
  sub_building_name?: string;
  building_name?: string;
  building_number?: string;
  thoroughfare_name?: string;
  post_town?: string;
  postcode: string;
  organisation_name?: string;
  
  // Geographic coordinates
  coordinates: { lat: number; lng: number };
  british_national_grid?: { x: number; y: number };
  
  // Property classification and status
  classification_code?: string;
  classification?: string;
  status?: string;
  logical_status_code?: string;
  
  // Administrative information
  local_authority?: string;
  local_authority_code?: number;
  country?: string;
  country_code?: string;
  
  // Property characteristics
  property_characteristics?: Record<string, any>;
  energy_rating?: string;
  
  // Relationship data
  lease_data?: Array<Record<string, any>>;
  price_history?: Array<Record<string, any>>;
  
  // Metadata
  last_updated?: string;
  data_source?: string;
}

export interface PropertySearchResponse {
  properties: PropertyDetails[];
  has_next: boolean;
  total_count?: number;
  next_cursor?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 API Request: ${options.method || 'GET'} ${url}`);
    }
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (process.env.NODE_ENV === 'development') {
        console.log(`📡 API Response: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API Error Response:`, errorText);
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ API Success:`, data);
      }
      return data;
    } catch (error) {
      console.error(`💥 API Request Error:`, error);
      throw error;
    }
  }

  // Property search methods
  async searchAddresses(query: string, limit: number = 10): Promise<OSAddressResult[]> {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
    });
    return this.request<OSAddressResult[]>(`/api/properties/search/address?${params}`);
  }

  async searchProperties(postcode: string, radiusKm: number = 5, limit: number = 50, afterId?: string): Promise<PropertySearchResponse> {
    const params = new URLSearchParams({
      postcode,
      radius_km: radiusKm.toString(),
      limit: limit.toString(),
    });
    if (afterId) {
      params.append('after_id', afterId);
    }
    return this.request<PropertySearchResponse>(`/api/properties/search?${params}`);
  }

  async getProperty(uprn: string, enrich: boolean = true): Promise<PropertyDetails> {
    const params = new URLSearchParams({
      enrich: enrich.toString(),
    });
    return this.request<PropertyDetails>(`/api/properties/${uprn}?${params}`);
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health');
  }
}

export const apiClient = new ApiClient();
export default apiClient;