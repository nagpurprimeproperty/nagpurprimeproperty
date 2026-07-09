export interface PropertyBrokerInfo {
  mobile?: string;
  phone?: string;
  phoneFull?: string;
}

export interface PropertyDetailsInfo {
  bhk?: number | string;
  carpetArea?: number | string;
  builtUpArea?: number | string;
  superBuiltUpArea?: number | string;
  plotAreaSqFt?: number | string;
  gatedLayout?: boolean;
  security?: string;
  bathrooms?: number | string;
  cabinCount?: number;
  openDesks?: number;
  dgBackup?: boolean;
  shopFloor?: number | string;
  cornerShop?: boolean;
  showroomArea?: number | string;
  numberOfShowroomFloors?: number | string;
  parkingAvailable?: boolean;
  warehouseArea?: number | string;
  warehouseHeight?: number | string;
  midc?: boolean;
  plotLength?: number | string;
  plotWidth?: number | string;
  areaAcres?: number | string;
  soilType?: string;
  roadAccess?: boolean;
  gatedSociety?: boolean;
  furnishing?: string;
  verified?: boolean;
  plotArea?: number | string;
}

export interface PropertyPricingInfo {
  priceNegotiable?: boolean;
  rentNegotiable?: boolean;
}

export interface PropertyCardItem {
  _id?: string;
  id?: string;
  title: string;
  price: number | string;
  location: string | { name?: string; [key: string]: any };
  propertyType?: string;
  type?: string;
  image?: string;
  images?: string[];
  badge?: string;
  badges?: string[];
  isSaved?: boolean;
  isLiked?: boolean;
  updatedAt?: string;
  priceNegotiable?: boolean;
  rentNegotiable?: boolean;
  pricing?: PropertyPricingInfo;
  details?: PropertyDetailsInfo;
  bedrooms?: number | string;
  bathrooms?: number | string;
  area?: string;
  sqft?: number | string;
  status?: string;
  verified?: boolean;
  featured?: boolean;
  listingCategory?: string;
  videos?: string[];
  video?: string;
  broker?: PropertyBrokerInfo;
  description?: string;
  gatedSociety?: boolean;
  gatedLayout?: boolean;
}
