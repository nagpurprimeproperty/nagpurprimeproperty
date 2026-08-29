export interface PropertyBrokerInfo {
  mobile?: string;
  phone?: string;
  phoneFull?: string;
}

export interface PropertyDetailsInfo {
  bhk?: number | string;
  minBhk?: number | string;
  maxBhk?: number | string;
  carpetArea?: number | string;
  minCarpetArea?: number | string;
  maxCarpetArea?: number | string;
  builtUpArea?: number | string;
  minBuiltUpArea?: number | string;
  maxBuiltUpArea?: number | string;
  superBuiltUpArea?: number | string;
  minSuperBuiltUpArea?: number | string;
  maxSuperBuiltUpArea?: number | string;
  plotAreaSqFt?: number | string;
  minPlotAreaSqFt?: number | string;
  maxPlotAreaSqFt?: number | string;
  gatedLayout?: boolean;
  security?: string;
  bathrooms?: number | string;
  cabinCount?: number;
  openDesks?: number;
  dgBackup?: boolean;
  shopFloor?: number | string;
  cornerShop?: boolean;
  showroomArea?: number | string;
  minShowroomArea?: number | string;
  maxShowroomArea?: number | string;
  numberOfShowroomFloors?: number | string;
  parkingAvailable?: boolean;
  warehouseArea?: number | string;
  minWarehouseArea?: number | string;
  maxWarehouseArea?: number | string;
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
  minPlotArea?: number | string;
  maxPlotArea?: number | string;
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
  brochure?: string | null;
  broker?: PropertyBrokerInfo;
  description?: string;
  gatedSociety?: boolean;
  gatedLayout?: boolean;
}
