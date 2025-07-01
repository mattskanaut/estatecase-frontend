# EstateCase Frontend Design Document

## Project Overview
Modern web frontend for property investment platform specializing in distressed property deals. Replaces legacy Highrise CRM with modern UI featuring LLM search, Google Maps integration, and mobile field capabilities.

## Domain Understanding
Based on backend models in `/home/mattc/Repos/estatecase/src/shared`:

### Core Entities
- **Properties**: UPRN-identified properties with geospatial data, OS classifications
- **Deals**: Investment opportunities with status tracking, financial data
- **People/Companies**: Contact management with addresses and relationship tracking  
- **Ownership Records**: Lease agreements, price paid history
- **Documentation**: Notes and attachments (photos) linked to any entity

### Business Process
1. **Discovery**: Find distressed properties via databases, councils, probate
2. **Investigation**: Research property details, ownership, financial history
3. **Deal Creation**: Convert interesting properties to tracked deals
4. **Enrichment**: Add lease data, price history, credit data
5. **Decision Making**: LLM-assisted scoring and prioritization

## User Types & Primary Workflows

### Property Investigators
- Search any address for instant property data
- View properties on map with street view
- Add notes and photos during site visits
- Convert properties to deals

### Deal Managers  
- Manage deal pipeline (pending/won/lost)
- Track financial details and parties
- Monitor deal progress and documentation
- Prioritize deals based on scoring

### Field Users
- Mobile-optimized property lookup
- GPS-based property discovery
- Camera integration for site photos
- Offline-capable core features

## Technical Architecture

### Framework Recommendation: **Next.js 14** 
**Rationale:**
- **Full-stack capability**: API routes for backend integration
- **Mobile-first**: Excellent mobile performance with App Router
- **Modern DX**: TypeScript, Tailwind CSS, built-in optimizations
- **PWA ready**: Service workers for offline field use
- **Google Maps**: Excellent integration ecosystem

### Alternative Considerations:
- **Expo/React Native**: If native mobile app becomes priority
- **SvelteKit**: If bundle size is critical for field use

### Key Dependencies
```json
{
  "core": ["next@14", "react@18", "typescript"],
  "ui": ["tailwindcss", "@headlessui/react", "lucide-react"],
  "maps": ["@googlemaps/js-api-loader", "@googlemaps/react-wrapper"],
  "data": ["@tanstack/react-query", "axios", "zod"],
  "auth": ["next-auth", "@auth/mongodb-adapter"],
  "mobile": ["workbox-webpack-plugin", "next-pwa"],
  "ai": ["@ai-sdk/openai", "ai"]
}
```

## Application Structure

### Core Views

#### 1. **Property Search & Discovery** (`/properties`)
- **Map View**: Properties plotted with clustering
- **List View**: Paginated property results  
- **Search**: Address/postcode search with filters
- **Street View**: Integrated Google Street View
- **Quick Actions**: Add note, create deal, save property

#### 2. **Deal Pipeline** (`/deals`)
- **Kanban Board**: Deals by status (pending/won/lost)
- **Deal Details**: Financial info, parties, related properties
- **Timeline**: Deal activity and status changes
- **Scoring**: LLM-generated deal scores and insights

#### 3. **Property Details** (`/properties/[uprn]`)
- **Overview**: Address, classification, physical details
- **History**: Price paid records, lease information
- **Map & Street View**: Location context
- **Related Deals**: Associated investment opportunities
- **Notes & Photos**: Documentation timeline
- **Data Sources**: Links to government records

#### 4. **LLM Search** (`/search`)
- **Natural Language**: "Find 3-bed houses under £200k in Birmingham"
- **Results**: Mixed property/deal results with explanations
- **Follow-up**: Contextual next questions
- **Integration**: MongoDB Atlas Vector Search

#### 5. **Mobile Field App** (PWA optimized)
- **Quick Lookup**: Address scan → property data
- **Photo Notes**: Camera integration with location
- **Offline Mode**: Cached recent searches
- **GPS Discovery**: Nearby properties of interest

## Technical Implementation

### Data Layer
```typescript
// Type-safe backend integration
interface Property {
  uprn: string;
  address: Address;
  location: GeoPoint;
  osClassification: string;
  // Match backend Pydantic models
}

// React Query for caching
const useProperty = (uprn: string) =>
  useQuery(['property', uprn], () => api.getProperty(uprn));
```

### Authentication
- **Next-Auth** with multiple providers:
  - Google OAuth (primary)
  - Email/password fallback
  - MongoDB session storage

### Maps Integration
```typescript
// Google Maps with Street View
const PropertyMap = ({ property }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <GoogleMap center={property.location} />
    <StreetViewPanorama position={property.location} />
  </div>
);
```

### Mobile Strategy
**Progressive Web App (PWA):**
- Service worker for offline property cache
- Camera API for photo capture
- Geolocation for field discovery
- App-like install experience

**Responsive Breakpoints:**
- Mobile: Essential data, large touch targets
- Tablet: Split views, more data density  
- Desktop: Full feature set, multiple panels

### LLM Integration
```typescript
// AI SDK for property search
const searchProperties = async (query: string) => {
  const { text } = await generateText({
    model: openai('gpt-4'),
    system: 'You are a property search assistant...',
    prompt: query,
    tools: { searchMongoDB: mongoSearchTool }
  });
};
```

## Development Phases

### Phase 1: Core Foundation (2-3 weeks)
- [ ] Next.js setup with TypeScript
- [ ] Authentication system
- [ ] Basic property search and display
- [ ] Google Maps integration
- [ ] Backend API integration

### Phase 2: Deal Management (2 weeks)  
- [ ] Deal pipeline views
- [ ] Property-to-deal conversion
- [ ] Notes and photo upload
- [ ] Contact management

### Phase 3: Mobile & PWA (1-2 weeks)
- [ ] Mobile optimization
- [ ] Camera integration
- [ ] Offline capabilities
- [ ] GPS-based discovery

### Phase 4: LLM Features (1-2 weeks)
- [ ] Natural language search
- [ ] Deal scoring
- [ ] Automated insights
- [ ] Recommendation engine

## File Structure
```
src/
├── app/                 # Next.js App Router
│   ├── properties/      # Property views
│   ├── deals/          # Deal management
│   ├── search/         # LLM search
│   └── api/            # Backend integration
├── components/         # Reusable UI components
│   ├── maps/          # Google Maps components
│   ├── property/      # Property-specific UI
│   └── ui/            # Design system
├── lib/               # Utilities and services
│   ├── api.ts         # Backend API client
│   ├── auth.ts        # Authentication config
│   └── types.ts       # TypeScript definitions
└── public/            # Static assets
```

## Success Metrics
- **User Adoption**: Migration from Highrise usage
- **Field Efficiency**: Time from site visit to deal creation
- **Search Accuracy**: LLM query success rate
- **Mobile Performance**: Core Web Vitals on mobile
- **Data Quality**: Photo/note completion rates

## Next Steps
1. Confirm framework choice (Next.js recommended)
2. Set up development environment
3. Create symlinks to backend models
4. Implement basic property search
5. Google Maps API setup and testing