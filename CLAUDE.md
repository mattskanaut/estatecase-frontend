# EstateCase Frontend Project

## Project Overview
This is a modern web frontend for the EstateCase application. The backend models and shared code are located in `/home/mattc/Repos/estatecase/src/shared`.

## Rules and Guidelines

### File Access Rules
- **Frontend repo (`/home/mattc/Repos/estatecase-frontend`)**: Full read/write access for development
- **Backend repo (`/home/mattc/Repos/estatecase`)**: READ ONLY - require explicit permission before making any changes

### Development Guidelines
- Framework: Next.js 14 with TypeScript
- Target: Both mobile and desktop clients
- Design: Modern look and feel, minimal navigation
- Features: LLM-powered search functionality

### Naming Conventions
- **NEVER use "estatecase" in code**: Application name may change - use generic terms like "app", "platform", or descriptive names
- **NO version strings in REST API paths**: Don't use /v1, /api/v1 etc. in URL paths

## Commands
- Development: `npm run dev`
- Build: `npm run build`
- Start: `npm start`
- Lint: `npm run lint`
- Typecheck: `npm run type-check`

## Setup Instructions

### Environment Variables
1. Copy `.env.local` and add your Google Maps API key:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

### Google Maps Setup
- Enable Google Maps JavaScript API
- Enable Street View Static API  
- Add your domain to API key restrictions

### Backend Integration
- Backend API specification: `BACKEND_API_SPEC.md`
- Backend team implements endpoints in `api_service`
- Frontend connects to `http://localhost:8000`

## Current Status
✅ **Complete Features:**
- Property search with real backend integration
- Rich property details with lease & price history
- Google Maps with Street View integration
- Responsive design with modern UI
- Header navigation and layout system

## Architecture
- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Backend**: FastAPI with MongoDB (via symlinked api_service)
- **Maps**: Google Maps JavaScript API with Street View
- **Styling**: Modern design system with responsive breakpoints

## Notes  
- Backend models are in `/home/mattc/Repos/estatecase/src/shared`
- API service symlinked at `./api_service`
- Real API endpoints implemented and ready
- Frontend matches backend DTOs exactly