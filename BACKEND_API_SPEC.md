# Backend API Specification for Frontend

## Overview
This document specifies the API endpoints needed for the frontend property search functionality. The backend team should implement these endpoints in the `api_service` module.

## Base Configuration
- **Base URL**: `http://localhost:8000`
- **CORS**: Allow origin `http://localhost:3000` (Next.js dev server)
- **Content-Type**: `application/json`

## Required Endpoints

### 1. Property Address Search
**Endpoint**: `GET /api/properties/search/address`

**Purpose**: Search for addresses using OS API, return ranked results with UPRNs

**Query Parameters**:
- `q` (required): Address search query string
- `limit` (optional, default=10): Maximum number of results

**Response Model**:
```json
{
  "results": [
    {
      "uprn": "12345678",
      "address": "123 Main Street, Birmingham, B1 1AA",
      "postcode": "B1 1AA",
      "coordinates": {
        "lat": 52.4862,
        "lng": -1.8904
      },
      "match_score": 0.95
    }
  ]
}
```

**Implementation Notes**:
- Wrap existing OS API integration
- Return results sorted by match score (highest first)
- Include UPRN for property lookup
- Include coordinates for mapping

### 2. Property Details
**Endpoint**: `GET /api/properties/{uprn}`

**Purpose**: Get detailed property information, create/enrich if not in database

**Path Parameters**:
- `uprn` (required): Unique Property Reference Number

**Query Parameters**:
- `enrich` (optional, default=true): Whether to fetch external enrichment data

**Response Model**:
```json
{
  "uprn": "12345678",
  "address": "123 Main Street, Birmingham, B1 1AA",
  "postcode": "B1 1AA",
  "coordinates": {
    "lat": 52.4862,
    "lng": -1.8904
  },
  "classification": "Residential - Detached House",
  "lease_data": [
    {
      "lease_type": "Freehold",
      "tenure": "Freehold",
      "registration_date": "2020-01-15",
      "remaining_years": null
    }
  ],
  "price_history": [
    {
      "price": 250000,
      "date": "2020-01-15",
      "transaction_type": "Sale"
    }
  ],
  "energy_rating": "C",
  "related_deals": [
    {
      "id": "deal_123",
      "name": "Birmingham Investment",
      "status": "pending"
    }
  ]
}
```

**Implementation Notes**:
- If property doesn't exist in DB, create it
- If `enrich=true`, fetch latest lease and price data
- Include any related deals from the Deal collection
- Use existing Property, Lease, and PricePaid models

### 3. Database Property Search
**Endpoint**: `GET /api/properties/search`

**Purpose**: Search existing properties in database by location

**Query Parameters**:
- `postcode` (required): Postcode to search around
- `radius_km` (optional, default=5.0): Search radius in kilometers
- `limit` (optional, default=50): Maximum number of results

**Response Model**:
```json
{
  "results": [
    {
      "uprn": "12345678",
      "address": "123 Main Street, Birmingham, B1 1AA",
      "postcode": "B1 1AA",
      "coordinates": {
        "lat": 52.4862,
        "lng": -1.8904
      },
      "classification": "Residential",
      "has_deals": true,
      "deal_count": 2,
      "last_updated": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Implementation Notes**:
- Use geospatial queries on Property collection
- Include summary info (deal count, last update)
- Order by distance from postcode center

### 4. Health Check
**Endpoint**: `GET /health`

**Response**: `{"status": "healthy"}`

## Implementation Priority
1. Health check endpoint
2. Property details endpoint (with mock data initially)
3. Address search endpoint (OS API integration)
4. Database property search endpoint

## Error Handling
- Return appropriate HTTP status codes
- Include error messages in response body:
```json
{
  "error": "Property not found",
  "detail": "No property found with UPRN 12345678"
}
```

## Dependencies
- FastAPI
- Existing shared models (Property, Lease, PricePaid, Deal)
- OS API integration (existing)
- MongoDB connection (existing)

## Notes
- Frontend expects JSON responses
- All coordinates should be in WGS84 format (lat/lng)
- Dates should be in ISO format
- Price values should be integers (pence) or floats (pounds)