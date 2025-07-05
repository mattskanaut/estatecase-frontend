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
  
  // BLPU (Basic Land and Property Unit) information
  blpu_state_code?: string;
  blpu_state_code_description?: string;
  blpu_state_date?: string;
  
  // Postal address information
  postal_address_code?: string;
  postal_address_code_description?: string;
  delivery_point_suffix?: string;
  
  // Geographic and administrative boundaries
  topography_layer_toid?: string;
  ward_code?: string;
  parish_code?: string;
  parent_uprn?: string;
  
  // Date information
  entry_date?: string;
  
  // Language and matching information
  language?: string;
  match?: number;
  match_description?: string;
  
  // Property characteristics
  property_characteristics?: Record<string, any>;
  energy_rating?: string;
  
  // Relationship data
  lease_data?: Array<Record<string, any>>;
  price_history?: Array<Record<string, any>>;
  deals?: Deal[];
  
  // Metadata
  last_updated?: string;
  data_source?: string;
  
  // Search-specific
  search_score?: number;
}

export interface PropertySearchResponse {
  properties: PropertyDetails[];
  has_next: boolean;
  total_count?: number;
  next_cursor?: string;
}

// Search types matching the backend models
export interface SearchHighlight {
  field: string;
  texts: string[];
}

export interface Deal {
  id: string;
  name: string;
  background?: string;
  status: string;
  price?: number;
  currency: string;
  category?: string;
  tags: string[];
  author_name?: string;
  owner_name?: string;
  party_names: string[];
  created_at: string;
  updated_at: string;
}

export interface EnrichedEntity {
  entity_type: string;
  entity_id: string;
  score: number;
  deal?: Deal;
  property?: PropertyDetails;
  notes: any[];
  tags: any[];
  people: any[];
  companies: any[];
  deals: Deal[];
  properties: PropertyDetails[];
  updated_at: string;
  created_at: string;
  highlights: SearchHighlight[];
}

export interface SearchResponse {
  results: EnrichedEntity[];
  total_count: number;
  query: string;
  filters_applied: Record<string, any>;
  execution_time_ms: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface SearchParams {
  q: string;
  limit?: number;
  offset?: number;
  entity_types?: string;
  updated_after?: string;
  updated_before?: string;
  status?: string;
  price_min?: number;
  price_max?: number;
  postcode?: string;
  author_id?: string;
  owner_id?: string;
}

// Deal detail types
export interface AttachmentDTO {
  id: string;
  filename: string;
  content_type: string;
  file_size: number;
  uploaded_at: string;
  blob_name?: string;
  download_url?: string;
}

export interface NoteDTO {
  id: string;
  body: string;
  author_id?: string;
  author_name?: string;
  created_at: string;
  updated_at: string;
  attachments: AttachmentDTO[];
}

export interface PersonDTO {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email?: string;
  phone_work?: string;
  phone_mobile?: string;
  company_id?: string;
  company_name?: string;
  title?: string;
}

export interface CompanyDTO {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
}

export interface PropertySummaryDTO {
  uprn: string;
  address: string;
  postcode: string;
  relationship_type: string;
  classification?: string;
  status?: string;
}

export interface DealCategoryDTO {
  id: string;
  name: string;
  color?: string;
}

export interface TagDTO {
  id: string;
  name: string;
  slug: string;
  color?: string;
  description?: string;
}

export interface DealDetailDTO {
  id: string;
  name: string;
  background?: string;
  status: string;
  currency: string;
  price?: number;
  price_type: string;
  created_at: string;
  updated_at: string;
  status_changed_on?: string;
  category?: DealCategoryDTO;
  author?: PersonDTO;
  owner?: PersonDTO;
  parties: PersonDTO[];
  companies: CompanyDTO[];
  notes: NoteDTO[];
  properties: PropertySummaryDTO[];
  tags: TagDTO[];
  total_notes: number;
  total_attachments: number;
  total_parties: number;
  highrise_id?: number;
  highrise_url?: string;
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

  // Unified search method
  async search(params: SearchParams): Promise<SearchResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append('q', params.q);
    
    if (params.limit !== undefined) searchParams.append('limit', params.limit.toString());
    if (params.offset !== undefined) searchParams.append('offset', params.offset.toString());
    if (params.entity_types) searchParams.append('entity_types', params.entity_types);
    if (params.updated_after) searchParams.append('updated_after', params.updated_after);
    if (params.updated_before) searchParams.append('updated_before', params.updated_before);
    if (params.status) searchParams.append('status', params.status);
    if (params.price_min !== undefined) searchParams.append('price_min', params.price_min.toString());
    if (params.price_max !== undefined) searchParams.append('price_max', params.price_max.toString());
    if (params.postcode) searchParams.append('postcode', params.postcode);
    if (params.author_id) searchParams.append('author_id', params.author_id);
    if (params.owner_id) searchParams.append('owner_id', params.owner_id);
    
    return this.request<SearchResponse>(`/api/search?${searchParams}`);
  }

  // Deal detail method
  async getDealDetail(dealId: string): Promise<DealDetailDTO> {
    return this.request<DealDetailDTO>(`/api/deals/${dealId}`);
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health');
  }
}

export const apiClient = new ApiClient();
export default apiClient;