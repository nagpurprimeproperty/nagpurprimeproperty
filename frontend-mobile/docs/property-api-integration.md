# Property API Integration Guide

This document explains how to integrate the backend `properties` APIs into the frontend app.
It uses the current frontend architecture and existing API/client patterns.

## Overview

- Base URL: `https://nagpur-prime-property.onrender.com/api/v1`
- Frontend API client file: `frontend/api/apiClient.ts`
- Existing hooks:
  - `frontend/hooks/useApiQuery.ts`
  - `frontend/hooks/useApiMutation.ts`
- React Query provider is already set up in `frontend/app/_layout.tsx`
- Auth token is attached automatically by `apiClient` from `authStore` when available

## Existing frontend API pattern

### `frontend/api/apiClient.ts`

- Uses Axios with `baseURL` from `EXPO_PUBLIC_API_URL` or fallback to the live API
- Automatically sets `Content-Type: application/json`
- Removes `Content-Type` when sending `FormData`
- Adds `Authorization: Bearer <token>` if user is authenticated
- Logs out on `401` responses

### `frontend/hooks/useApiQuery.ts`

- `useApiQuery(key, url, config, enabled)` for GETs
- `useApiMutation(url, method, queryKeyToInvalidate)` for POST/PATCH/PUT/DELETE

Example usage:

```ts
const { data, isLoading, error } = useApiQuery(
  ["properties", queryParams],
  "/properties",
  { params: queryParams },
  true,
);
```

```ts
const saveToggleMutation = useApiMutation(
  `/properties/${propertyId}/save-toggle`,
  "post",
  ["properties"],
);
```

## Property API endpoints

All endpoints are mounted under `/properties`.

### 1. Get All Properties

- Endpoint: `GET /properties`
- Query params supported:
  - `search`
  - `listingCategory`
  - `propertyType`
  - `locality`
  - `featured`
  - `isRecommended`
  - `isRelevanceSorted`
  - `priceSort` (`low_to_high`)
  - `budgetFrom`
  - `budgetTo`
  - `amenities[0]`, `amenities[1]`, ...
  - `isSaved`
  - `bhk`
  - `page`
  - `limit`

#### Response shape

```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "...",
      "location": "...",
      "totalPrice": "...",
      "sqft": "...",
      "listingCategory": "...",
      "propertyType": "...",
      "featured": false,
      "photos": ["..."],
      "video": "...",
      "isSaved": false,
      "bhk": 0,
      "recommendationScore": 0
    }
  ],
  "total": 34,
  "page": 1,
  "limit": 10,
  "totalPages": 4
}
```

#### Notes for frontend

- The response item uses `_id`. Convert or normalize this to `id` for component keys and routing.
- Use `photos[0]` or `image` fallback for thumbnails.
- `totalPrice`, `listingCategory`, `propertyType`, `isSaved`, and `bhk` are the most useful fields for cards.

### 2. Get Property Detail

- Endpoint: `GET /properties/:id`

#### Response shape

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "...",
    "listingCategory": "...",
    "propertyType": "...",
    "description": "...",
    "location": {
      "city": "...",
      "locality": "...",
      "subLocality": "...",
      "coordinates": {
        "type": "Point",
        "coordinates": [79.08711, 21.142992]
      }
    },
    "details": { ... },
    "pricing": { ... },
    "photos": [ ... ],
    "video": "...",
    "amenities": [ ... ],
    "otherAmenities": [ ... ],
    "brokerId": { "name": "..." },
    "status": "Active",
    "featured": false,
    "views": 0,
    "inquiries": 0,
    "createdAt": "...",
    "updatedAt": "...",
    "totalPrice": "...",
    "image": "...",
    "isSaved": false,
    "recommendationScore": 0
  }
}
```

#### Notes for frontend

- `location` is a nested object with `city`, `locality`, `subLocality`, and GeoJSON `coordinates`.
- `pricing` contains `monthlyRent`, `securityDeposit`, `availableFrom`, `preferredTenants`, and `rentNegotiable`.
- `details` contains property-specific flags such as `washrooms`, `dgBackup`, `centralAC`, etc.
- `photos` is the best source for the image carousel.
- In `frontend/app/propertyDetail/[id].tsx`, replace static mock data with this API call.

### 3. Get Similar Properties

- Endpoint: `GET /properties/:id/similar-properties`
- Query params supported: `page`, `limit`

#### Response
Same object structure as Get All Properties.

### 4. Save Property Toggle

- Endpoint: `POST /properties/:id/save-toggle`
- Authorization required: Bearer token or `Cookie: userToken`

#### Response
```json
{
  "message": "Property unsaved",
  "success": true
}
```

#### Notes
- Use this mutation on property cards or detail screens.
- Invalidate the property list query after success so saved state refreshes.

### 5. Get Popular Localities Count

- Endpoint: `GET /properties/get-popular-localities-count`

#### Response shape

```json
{
  "success": true,
  "data": [
    { "locality": "Dighori", "count": 4 },
    { "locality": "Bhilgaon", "count": 3 }
  ]
}
```

### 6. Create Enquiry

- Endpoint: `POST /properties/:id/create-enquiry`
- Body JSON:

```json
{
  "phone": "8668569733",
  "customerName": "gopal",
  "propertyType": "Office Space",
  "area": "sadar",
  "budget": "40L",
  "notes": "test notes"
}
```

#### Response shape

```json
{
  "success": true,
  "data": {
    "customerName": "gopal",
    "phone": "8668569733",
    "propertyType": "Office Space",
    "area": "sadar",
    "budget": "40L",
    "notes": "test notes",
    "status": "New",
    "brokerId": "...",
    "userId": "...",
    "propertyId": "..."
  }
}
```

## Recommended frontend integration

### 1. Create a property service file

Create `frontend/services/propertyService.ts` with helpers like:

```ts
import { apiClient } from "@/api/apiClient";

export const getProperties = async (params?: Record<string, unknown>) => {
  const response = await apiClient.get("/properties", { params });
  return response.data;
};

export const getPropertyById = async (id: string) => {
  const response = await apiClient.get(`/properties/${id}`);
  return response.data;
};

export const getSimilarProperties = async (id: string, params?: Record<string, unknown>) => {
  const response = await apiClient.get(`/properties/${id}/similar-properties`, { params });
  return response.data;
};

export const togglePropertySave = async (id: string) => {
  const response = await apiClient.post(`/properties/${id}/save-toggle`);
  return response.data;
};

export const createPropertyEnquiry = async (id: string, body: Record<string, any>) => {
  const response = await apiClient.post(`/properties/${id}/create-enquiry`, body);
  return response.data;
};
```

### 2. Use React Query hooks

#### Fetch property list

```ts
const { data, isLoading, error } = useApiQuery(
  ["properties", queryParams],
  "/properties",
  { params: queryParams },
);
```

#### Fetch property detail

```ts
const { id } = useLocalSearchParams();
const { data, isLoading, error } = useApiQuery(
  ["property", id],
  `/properties/${id}`,
);
```

#### Fetch similar properties

```ts
const { data } = useApiQuery(
  ["property", id, "similar"],
  `/properties/${id}/similar-properties`,
);
```

#### Toggle save

```ts
const saveMutation = useApiMutation(
  `/properties/${id}/save-toggle`,
  "post",
  ["properties", ["property", id]],
);
```

#### Create enquiry

```ts
const enquiryMutation = useApiMutation(
  `/properties/${id}/create-enquiry`,
  "post",
);
```

### 3. Normalize API data for components

Because backend items use `_id`, normalize before rendering:

```ts
const normalizeProperty = (item: any) => ({
  ...item,
  id: item.id ?? item._id,
  image: item.image ?? item.photos?.[0] ?? "",
  photos: item.photos ?? [],
});
```

Use this pattern before passing data to `PropertyCard` or `PropertyList`.

### 4. Replace mock data in `frontend/app/propertyDetail/[id].tsx`

That screen currently renders static mock data. Replace its static `PROPERTY` object with a query to `/properties/:id`.

### 5. Use `PropertyList` for lists

The existing `PropertyList` component is already suitable for rendering fetched property arrays.

- For home/feed pages: use `horizontal` or `fullSize`
- For property list pages: use the default vertical list

### 6. Filter support

Map UI filter values into query params exactly as backend expects.

Example mapping:

- `search` → `search`
- `listingCategory` → `listingCategory`
- `propertyType` → `propertyType`
- `locality` → `locality`
- `featured` → `featured`
- `isSaved` → `isSaved`
- `budgetFrom` / `budgetTo`
- `amenities[]` → `amenities[0]`, `amenities[1]`, ...
- `page` / `limit`

## Example property list hook

```ts
import { useApiQuery } from "@/hooks/useApiQuery";

export const useProperties = (filters: Record<string, unknown>) => {
  return useApiQuery(
    ["properties", filters],
    "/properties",
    { params: filters },
  );
};
```

## Example property detail usage

```tsx
import { useLocalSearchParams } from "expo-router";
import { useApiQuery } from "@/hooks/useApiQuery";

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams();
  const { data, isLoading, error } = useApiQuery(
    ["property", id],
    `/properties/${id}`,
    undefined,
    Boolean(id),
  );

  if (isLoading) return <Loading />;
  if (error || !data?.data) return <ErrorView message={error?.message} />;

  const property = normalizeProperty(data.data);

  return <PropertyDetail property={property} />;
}
```

## Home / Search / Saved section integration

The app currently uses the same property card design across several sections. All of these should come from the same API endpoint: `GET /properties`.

### Use one query for all card sections

The following home sections can be implemented using query params sent to `/properties`:

- `Featured` → `featured=true`
- `Near You` → `locality=<userLocality>` or `city=<userCity>` if supported
- `Recommended` → `isRecommended=true`
- `All properties` / normal feed → no special filter or `isRelevanceSorted=true`
- `Saved properties` → `isSaved=true`

### Recommended query mapping for current sections

1. Featured carousel (`FeaturedCarousel`)
   - Query: `/properties`
   - Params: `{ featured: true, limit: 10 }`
   - Data: use the returned list for the card carousel

2. Near You (`NearYouSection`)
   - Query: `/properties`
   - Params: `{ locality: userLocality, limit: 10 }`
   - If you want broader city results, also pass `{ city: userCity }`

3. Recommended section (`RecommendedSection`)
   - Query: `/properties`
   - Params: `{ isRecommended: true, limit: 10 }`

4. Normal home feed (main home list)
   - Query: `/properties`
   - Params: `{ page: 1, limit: 10, isRelevanceSorted: true }`
   - This is the generic feed and can be reused for the home list below the featured sections.

5. Saved screen (`SavedScreen`)
   - Query: `/properties`
   - Params: `{ isSaved: true, limit: 20 }`
   - Must be authenticated; `apiClient` will attach auth automatically.

### Search page filters and sort

The search tab should also use `GET /properties` with dynamic query params from the filter UI.

Common filter mapping:

- Search text → `search`
- Category tab / property type → `listingCategory` or `propertyType`
- Locality/location input → `locality`
- Featured toggle → `featured=true`
- Recommended toggle → `isRecommended=true`
- Price low-to-high sort → `priceSort=low_to_high`
- Budget min/max → `budgetFrom`, `budgetTo`
- BHK value → `bhk`
- Amenities → `amenities[0]=Water Storage`, `amenities[1]=Water Supply` (or array syntax if your axios serializer supports it)
- Pagination → `page`, `limit`

Example search query params object:

```ts
const queryParams = {
  search: searchText,
  listingCategory: selectedCategory,
  propertyType: selectedPropertyType,
  locality: selectedLocality,
  featured: showFeatured ? true : undefined,
  isRecommended: showRecommended ? true : undefined,
  priceSort: sortByPriceLowToHigh ? "low_to_high" : undefined,
  budgetFrom: minBudget,
  budgetTo: maxBudget,
  bhk: selectedBhk,
  page: currentPage,
  limit: 14,
};
```

Dispatch this through `useApiQuery`:

```ts
const { data } = useApiQuery(
  ["properties", queryParams],
  "/properties",
  { params: queryParams },
  true,
);
```

### Saved properties section

Use the same `/properties` endpoint with:

```ts
const savedQueryParams = { isSaved: true, limit: 20 };
```

Then render the returned items with `PropertyCard` and pass `isLiked={true}`.

### Suggested implementation approach

1. Create a shared service hook or `propertyService` that uses `getProperties(params)`.
2. Normalize `_id` → `id` before passing data to `PropertyCard`.
3. Keep a single function for home section requests:

```ts
export const getProperties = async (params?: Record<string, unknown>) => {
  const response = await apiClient.get("/properties", { params });
  return response.data;
};
```

4. For each home section, call the same service with a different `params` object.
5. Use React Query keys like `[{ section: "featured" }, params]` or `["properties", params]`.

### Example home section props

```ts
const featuredParams = { featured: true, limit: 8 };
const nearYouParams = { locality: "Besa", limit: 8 };
const recommendedParams = { isRecommended: true, limit: 8 };
const feedParams = { isRelevanceSorted: true, page: 1, limit: 10 };
```

### Notes on current UI

- `Home.tsx` currently renders mock `properties` data in `FeaturedCarousel`, `NearYouSection`, `RecommendedSection`, and the main list.
- `search.tsx` currently renders mock `MOCK_PROPERTIES` and should be replaced with live fetched data.
- `saved.tsx` currently renders mock `SAVED_PROPERTIES`; replace with `/properties?isSaved=true`.

## Important notes

- Use the existing `apiClient` to keep auth and base URL behavior consistent.
- In React Query hooks, use the query key to avoid stale property list data.
- If a route uses `item.id`, ensure `_id` is mapped to `id`.
- `save-toggle` requires logged-in user context.
- The `create-enquiry` endpoint expects raw JSON in the request body.

---

This guide is designed to help frontend developers wire the backend property APIs into the current app structure with minimal changes.
