import { apiClient } from "@/api/apiClient";

export type PropertyListResponse = {
  success: boolean;
  data: PropertyApiItem[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
};

export type PropertyDetailResponse = {
  success: boolean;
  data: PropertyApiDetail;
};

export type PropertyApiItem = {
  _id?: string;
  id?: string;
  title?: string;
  location?: string | Record<string, unknown>;
  totalPrice?: string | number;
  sqft?: string | number;
  listingCategory?: string;
  propertyType?: string;
  featured?: boolean;
  photos?: string[];
  image?: string;
  video?: string;
  isSaved?: boolean;
  bhk?: number | string;
  recommendationScore?: number;
  isRecommended?: boolean;
  [key: string]: unknown;
};

export type PropertyApiDetail = PropertyApiItem & {
  description?: string;
  details?: Record<string, unknown>;
  pricing?: Record<string, unknown>;
  amenities?: string[];
  otherAmenities?: string[];
  brokerId?: {
    name?: string;
    firm?: string;
    experience?: string;
    phone?: string;
    phoneFull?: string;
    [key: string]: unknown;
  };
  status?: string;
  views?: number;
  inquiries?: number;
  createdAt?: string;
  updatedAt?: string;
};

export const getProperties = async (params?: Record<string, unknown>) => {
  const response = await apiClient.get<PropertyListResponse>("/properties", {
    params,
  });

  return response.data;
};

export const getPropertyById = async (id: string) => {
  const response = await apiClient.get<PropertyDetailResponse>(`/properties/${id}`);
  return response.data;
};

export const getSimilarProperties = async (
  id: string,
  params?: Record<string, unknown>,
) => {
  const response = await apiClient.get<PropertyListResponse>(
    `/properties/${id}/similar-properties`,
    {
      params,
    },
  );

  return response.data;
};

export const togglePropertySave = async (id: string) => {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    `/properties/${id}/save-toggle`,
  );

  return response.data;
};

export const createPropertyEnquiry = async (
  id: string,
  body: Record<string, unknown>,
) => {
  const response = await apiClient.post<{ success: boolean; data: unknown }>(
    `/properties/${id}/create-enquiry`,
    body,
  );

  return response.data;
};

export type CallEnquiryResponse = {
  success: boolean;
  data: {
    _id: string;
    customerName: string;
    phone: string;
    propertyType: string;
    area: string;
    status: string;
    brokerId: string;
    userId: string;
    propertyId: string;
    isOpened: boolean;
    createdAt: string;
    updatedAt: string;
    brokerDetails?: {
      _id: string;
      name: string;
      mobile: string;
      city: string;
      area: string;
      avatar?: string;
    };
  };
};

export const createCallEnquiry = async (id: string): Promise<CallEnquiryResponse> => {
  const response = await apiClient.post<CallEnquiryResponse>(
    `/properties/${id}/create-call-enquiry`,
  );
  return response.data;
};

export const normalizePropertyItem = (item: PropertyApiItem) => {
  const normalizedLocation =
    typeof item.location === "string"
      ? item.location
      : (item.location as Record<string, unknown>)?.locality ||
        (item.location as Record<string, unknown>)?.city ||
        (item.location as Record<string, unknown>)?.subLocality ||
        "Nagpur";

  const photos = Array.isArray(item.photos) ? item.photos : [];
  const image = item.image ?? photos[0] ?? "";
  const recommendationScore =
    typeof item.recommendationScore === "number"
      ? item.recommendationScore
      : Number(item.recommendationScore ?? 0);
  const isRecommended = Boolean(item.isRecommended || recommendationScore > 0);

  return {
    ...item,
    id: item.id ?? item._id ?? "",
    title: item.title ?? "Untitled Property",
    location: normalizedLocation,
    price: item.totalPrice ?? item.price ?? "N/A",
    image,
    images: photos.length > 0 ? photos : image ? [image] : [],
    bedrooms: item.bhk ?? item.bedrooms ?? 0,
    area: item.sqft
      ? item.propertyType === "Agricultural Land"
        ? `${item.sqft} Acres`
        : `${item.sqft} sqft`
      : item.area
        ? String(item.area)
        : "",
    featured: Boolean(item.featured),
    badge: item.featured
      ? "Featured"
      : isRecommended
        ? "Recommended"
        : undefined,
    type: item.propertyType ?? item.listingCategory ?? "Property",
    isLiked: Boolean(item.isSaved),
    recommendationScore,
  };
};

export const normalizePropertyDetail = (item: PropertyApiDetail) => {
  const normalizedLocation =
    typeof item.location === "string"
      ? item.location
      : [
          (item.location as Record<string, unknown>)?.locality,
          (item.location as Record<string, unknown>)?.subLocality,
          (item.location as Record<string, unknown>)?.city,
        ]
          .filter(Boolean)
          .join(", ") || "Nagpur";

  const photos = Array.isArray(item.photos) ? item.photos : [];
  const image = item.image ?? photos[0] ?? "";
  const amenities = Array.isArray(item.amenities)
    ? item.amenities
    : Array.isArray(item.otherAmenities)
      ? item.otherAmenities
      : [];

  const details = (item.details as Record<string, unknown>) || {};
  let formattedArea = "";
  const areaVal =
    item.sqft ||
    details.carpetArea ||
    details.builtUpArea ||
    details.superBuiltUpArea ||
    details.plotAreaSqFt ||
    details.plotArea ||
    details.showroomArea ||
    details.warehouseArea ||
    details.areaAcres ||
    "";

  if (areaVal) {
    if (item.propertyType === "Agricultural Land" || details.areaAcres) {
      formattedArea = `${areaVal} Acres`;
    } else {
      formattedArea = `${areaVal} sqft`;
    }
  } else {
    formattedArea = "N/A";
  }

  const bhkValue = Number(item.bhk ?? details.bhk ?? 0);
  const bathroomsValue = details.bathrooms !== undefined && details.bathrooms !== null ? String(details.bathrooms) : undefined;
  const balconiesValue = details.balconies !== undefined && details.balconies !== null ? String(details.balconies) : undefined;
  const floorNumberValue = details.floorNumber !== undefined && details.floorNumber !== null ? String(details.floorNumber) : undefined;
  const totalFloorsValue = details.totalFloors !== undefined && details.totalFloors !== null ? String(details.totalFloors) : undefined;
  const facingValue = String(details.facing ?? "N/A");
  const furnishingValue = String(details.furnishing ?? "Semi-Furnished");
  const parkingValue = String(details.parking ?? "Available");

  return {
    ...item,
    id: item.id ?? item._id ?? "",
    images: photos.length > 0 ? photos : image ? [image] : [],
    image,
    title: item.title ?? "Untitled Property",
    address: normalizedLocation,
    price: item.totalPrice ?? "N/A",
    pricePerSqft: typeof item.pricing === "object" && item.pricing
      ? String((item.pricing as Record<string, unknown>).pricePerSqft ?? "")
      : "",
    type: item.propertyType ?? item.listingCategory ?? "Property",
    bedrooms: bhkValue,
    area: formattedArea,
    facing: facingValue,
    furnishing: furnishingValue,
    parking: parkingValue,
    bathrooms: bathroomsValue,
    balconies: balconiesValue,
    floorNumber: floorNumberValue,
    totalFloors: totalFloorsValue,
    featured: Boolean(item.featured),
    verified: item.status === "Active" || Boolean(details.verified),
    description: item.description ?? "No description available.",
    amenities: amenities.map((amenity) => ({
      label: amenity,
      icon: amenity.toLowerCase().includes("pool")
        ? "Droplets"
        : amenity.toLowerCase().includes("gym")
          ? "Dumbbell"
          : amenity.toLowerCase().includes("parking") || amenity.toLowerCase().includes("car")
            ? "Car"
            : amenity.toLowerCase().includes("lift")
              ? "Layers"
              : amenity.toLowerCase().includes("security") || amenity.toLowerCase().includes("backup")
                ? "Shield"
                : "Layers",
    })),
    broker: {
      name: item.brokerId?.name ?? "Listed Broker",
      firm: item.brokerId?.firm ?? "Nagpur Prime Property",
      experience: item.brokerId?.experience ?? "Verified broker",
      phone: (item.brokerId?.phone ?? item.brokerId?.mobile ?? "") as string,
      phoneFull: (item.brokerId?.phoneFull ?? item.brokerId?.phone ?? item.brokerId?.mobile ?? "") as string,
    },
    isSaved: Boolean(item.isSaved),
  };
};

export const getMyProperties = async (params?: Record<string, unknown>) => {
  const response = await apiClient.get<PropertyListResponse>("/properties/me", {
    params,
  });
  return response.data;
};

export const deleteMyProperty = async (id: string) => {
  const response = await apiClient.delete<{ success: boolean }>(`/properties/me/${id}`);
  return response.data;
};

export const toggleFeaturedMyProperty = async (id: string) => {
  const response = await apiClient.post<PropertyDetailResponse>(`/properties/me/${id}/toggle-featured`);
  return response.data;
};

export const updateMyProperty = async (id: string, payload: Record<string, unknown>) => {
  const response = await apiClient.put<PropertyDetailResponse>(`/properties/me/${id}`, payload);
  return response.data;
};

export const createMyProperty = async (payload: Record<string, unknown>) => {
  const response = await apiClient.post<PropertyDetailResponse>("/properties/me", payload);
  return response.data;
};

export const updateMyPropertyStatus = async (id: string, status: string) => {
  const response = await apiClient.patch<{ success: boolean; data: unknown }>(
    `/properties/me/${id}/update-status`,
    { status }
  );
  return response.data;
};

export type SearchSuggestion = {
  type: "keyword" | "locality" | "google_map" | "property" | "filter";
  title: string;
  subtitle: string;
  placeId?: string;
  description?: string;
  latitude?: number | null;
  longitude?: number | null;
  propertyId?: string;
  params?: Record<string, any>;
};

export const getSearchSuggestions = async (query: string, limit = 10) => {
  const response = await apiClient.get<{ success: boolean; data: SearchSuggestion[] }>(
    "/properties/search/suggestions",
    {
      params: { query, limit },
    }
  );
  return response.data;
};
