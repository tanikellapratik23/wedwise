# Vendor API Integration Guide

## Current Status
Vivaha currently uses Google Maps search links for vendor discovery. Each vendor card links directly to a Google Maps search for that specific vendor type in the user's city.

## Real API Integration (Optional Enhancement)

### Option 1: Yelp Fusion API (Recommended)
1. Sign up at https://www.yelp.com/developers/v3/manage_app
2. Create a new app to get your API key
3. Create `/client/.env` file:
   ```
   VITE_YELP_API_KEY=your_api_key_here
   ```
4. The code is already set up in `/client/src/utils/vendorApi.ts`
5. Update VendorSearch.tsx to use `searchYelpVendors()` instead of `generateVendorsForCity()`

### Option 2: Google Places API
1. Get API key from Google Cloud Console
2. Enable Places API
3. Add to `/client/.env`:
   ```
   VITE_GOOGLE_PLACES_API_KEY=your_api_key_here
   ```
4. Use `searchGooglePlaces()` from vendorApi.ts

### Current Implementation Benefits
- ✅ No API keys required
- ✅ No rate limits or costs
- ✅ Links to real Google Maps searches
- ✅ Shows actual vendors in user's city
- ✅ Users can browse, call, and get directions
- ✅ Works immediately without setup

### Why Google Maps Links Work Well
- Users get real, up-to-date vendor information
- Includes reviews, photos, hours, contact info
- Free for unlimited searches
- No maintenance or API key management
- Direct "Get Directions" functionality

## To Upgrade to Real APIs Later
Simply uncomment the API integration code in VendorSearch.tsx and add your API keys to .env file.
