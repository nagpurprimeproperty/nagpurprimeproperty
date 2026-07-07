/**
 * Utility functions to build property details object from form state
 * Extracted from usePropertyForm hook for better maintainability
 */

/**
 * Convert string to number or undefined
 */
function num(value) {
  // Accept numeric zero as valid value
  if (value == null) return undefined;
  
  // Only trim if it's actually a string
  const trimmedValue = typeof value === 'string' ? value.trim() : value;
  if (trimmedValue === '') return undefined;
  
  const parsed = Number(trimmedValue);
  return Number.isNaN(parsed) ? undefined : parsed;
}

/**
 * Build details object for residential properties based on property type
 */
export function buildResidentialDetails(form) {
  const pt = form.propertyType;
  const lc = form.listingCategory;
  const details = {};
  const isFlat = pt === "Flat/Apartment";
  const isVilla = pt === "Villa/Independent House";
  const isBuilderFloor = pt === "Builder Floor";
  const isPenthouse = pt === "Penthouse";
  const isNew = lc === "New";
  const isResale = lc === "Resale";
  const isRental = lc === "Rental";
  const isRentalOrResale = isResale || isRental;

  // Residential base fields
  if (isFlat || isBuilderFloor || isPenthouse) {
    if (form.bhk != null) details.bhk = num(form.bhk);
    if (form.bathrooms != null) details.bathrooms = num(form.bathrooms);
    if (form.balconies != null) details.balconies = num(form.balconies);
    if (form.floorNumber != null) details.floorNumber = num(form.floorNumber);
    if (form.totalFloors != null) details.totalFloors = num(form.totalFloors);
    if (form.carpetArea != null) details.carpetArea = num(form.carpetArea);
    if (form.builtUpArea != null) details.builtUpArea = num(form.builtUpArea);
    if (form.superBuiltUpArea != null) details.superBuiltUpArea = num(form.superBuiltUpArea);
    if (form.furnishing) details.furnishing = form.furnishing;
    if (form.facing) details.facing = form.facing;
    if (form.ageOfProperty) details.ageOfProperty = form.ageOfProperty;
    if (form.floorType) details.floorType = form.floorType;
    if (form.waterSupply) details.waterSupply = form.waterSupply;
    if (form.electricityStatus) details.electricityStatus = form.electricityStatus;
    
    if (isNew) {
      details.reraRegistered = form.reraRegistered;
      details.reraNumber = form.reraNumber || "";
      details.projectReraNumber = form.projectReraNumber || "";
      if (form.reraValidityDate) details.reraValidityDate = form.reraValidityDate;
    }
    
    if (isResale) {
      details.reraRegistered = form.reraRegistered;
      if (form.reraNumber) details.reraNumber = form.reraNumber;
      if (form.ownershipType) details.ownershipType = form.ownershipType;
      details.readyToMove = form.readyToMove;
    }
    
    if (isRental) {
      details.petFriendly = form.petFriendly;
      details.nonVegAllowed = form.nonVegAllowed;
    }
  }

  // Builder Floor extras
  if (isBuilderFloor) {
    if (form.totalUnitsInBuilding) details.totalUnitsInBuilding = num(form.totalUnitsInBuilding);
    if (form.floorOwnershipType) details.floorOwnershipType = form.floorOwnershipType;
    details.stiltParking = form.stiltParking;
  }

  // Penthouse extras
  if (isPenthouse) {
    if (form.terraceArea) details.terraceArea = num(form.terraceArea);
    details.privateLift = form.privateLift;
    details.isDuplex = form.isDuplex;
    details.servantRoom = form.servantRoom;
    details.privatePool = form.privatePool;
  }

  // Villa
  if (isVilla) {
    if (form.bhk != null) details.bhk = num(form.bhk);
    if (form.bathrooms != null) details.bathrooms = num(form.bathrooms);
    if (form.numberOfFloors != null) details.numberOfFloors = num(form.numberOfFloors);
    if (form.plotArea != null) details.plotArea = num(form.plotArea);
    if (form.builtUpArea != null) details.builtUpArea = num(form.builtUpArea);
    if (form.carpetArea != null) details.carpetArea = num(form.carpetArea);
    if (form.parkingSlots != null) details.parkingSlots = num(form.parkingSlots);
    if (form.furnishing) details.furnishing = form.furnishing;
    if (form.facing) details.facing = form.facing;
    if (form.waterSupply) details.waterSupply = form.waterSupply;
    if (form.floorType) details.floorType = form.floorType;
    if (form.ageOfProperty) details.ageOfProperty = form.ageOfProperty;
    if (form.hasGarden) details.hasGarden = form.hasGarden;
    if (form.cornerProperty) details.cornerProperty = form.cornerProperty;
    if (form.gatedSociety) details.gatedSociety = form.gatedSociety;
    if (form.roadWidth) details.roadWidth = num(form.roadWidth);
    // Ownership Type applies to Resale and Rental
    if (isRentalOrResale && form.ownershipType) details.ownershipType = form.ownershipType;
    // Ready to Move applies to Resale
    if (isResale) details.readyToMove = form.readyToMove;
  }

  return details;
}

/**
 * Build details object for commercial properties
 */
export function buildCommercialDetails(form) {
  const pt = form.propertyType;
  const lc = form.listingCategory;
  const details = {};
  const isOffice = pt === "Office Space";
  const isShop = pt === "Shop";
  const isShowroom = pt === "Showroom";
  const isWarehouse = pt === "Warehouse/Godown";
  const isResale = lc === "Resale";

  // Office Space
  if (isOffice) {
    if (form.cabinCount) details.cabinCount = num(form.cabinCount);
    if (form.openDesks) details.openDesks = num(form.openDesks);
    if (form.washrooms) details.washrooms = num(form.washrooms);
    if (form.hasPantry) details.hasPantry = form.hasPantry;
    details.itReady = form.itReady;
    details.conferenceRoom = form.conferenceRoom;
    details.receptionArea = form.receptionArea;
    details.centralAC = form.centralAC;
    details.officeFireSafety = form.officeFireSafety;
    details.dgBackup = form.dgBackup;
  }

  // Shop
  if (isShop) {
    if (form.carpetArea != null) details.carpetArea = num(form.carpetArea);
    if (form.builtUpArea != null) details.builtUpArea = num(form.builtUpArea);
    if (form.furnishing) details.furnishing = form.furnishing;
    if (form.shopFloor) details.shopFloor = form.shopFloor;
    if (form.frontage) details.frontage = num(form.frontage);
    if (form.depth) details.depth = num(form.depth);
    if (form.ceilingHeight) details.ceilingHeight = num(form.ceilingHeight);
    details.mainRoadFacing = form.mainRoadFacing;
    details.cornerShop = form.cornerShop;
    details.mezzanineFloor = form.mezzanineFloor;
    if (form.hasWashroom) details.hasWashroom = form.hasWashroom;
    if (form.footfallRating) details.footfallRating = form.footfallRating;
    if (form.suitableFor) details.suitableFor = form.suitableFor;
    if (isResale && form.ownershipType) details.ownershipType = form.ownershipType;
    if (form.ageOfProperty) details.ageOfProperty = form.ageOfProperty;
  }

  // Showroom
  if (isShowroom) {
    if (form.showroomArea) details.showroomArea = num(form.showroomArea);
    if (form.numberOfShowroomFloors) details.numberOfShowroomFloors = num(form.numberOfShowroomFloors);
    details.glassFront = form.glassFront;
    if (form.parkingAvailable) details.parkingAvailable = form.parkingAvailable;
    details.acInstalled = form.acInstalled;
  }

  // Warehouse/Godown
  if (isWarehouse) {
    if (form.warehouseArea) details.warehouseArea = num(form.warehouseArea);
    if (form.warehouseHeight) details.warehouseHeight = num(form.warehouseHeight);
    if (form.truckAccess) details.truckAccess = form.truckAccess;
    if (form.numberOfDocks) details.numberOfDocks = num(form.numberOfDocks);
    if (form.floorLoadCapacity) details.floorLoadCapacity = form.floorLoadCapacity;
    if (form.openYardArea) details.openYardArea = num(form.openYardArea);
    if (form.powerLoad) details.powerLoad = num(form.powerLoad);
    if (form.waterSupplyWarehouse) details.waterSupplyWarehouse = form.waterSupplyWarehouse;
    if (form.officeSpaceInside) details.officeSpaceInside = form.officeSpaceInside;
    details.midc = form.midc;
  }

  return details;
}

/**
 * Build details object for land properties
 */
export function buildLandDetails(form) {
  const pt = form.propertyType;
  const details = {};
  const isResPlot = pt === "Residential Plot";
  const isAgri = pt === "Agricultural Land";
  // Residential Plot
  if (isResPlot) {
    if (form.plotAreaSqFt) details.plotAreaSqFt = num(form.plotAreaSqFt);
    if (form.plotLength) details.plotLength = num(form.plotLength);
    if (form.plotWidth) details.plotWidth = num(form.plotWidth);
    if (form.boundaryWall) details.boundaryWall = form.boundaryWall;
    if (form.gatedLayout) details.gatedLayout = form.gatedLayout;
    if (form.cornerPlot) details.cornerPlot = form.cornerPlot;
    if (form.approvedBy) details.approvedBy = form.approvedBy;
    if (form.zoneType) details.zoneType = form.zoneType;
    if (form.fsiAvailable) details.fsiAvailable = num(form.fsiAvailable);
  }

  // Agricultural Land
  if (isAgri) {
    if (form.areaAcres) details.areaAcres = num(form.areaAcres);
    if (form.areaHectares) details.areaHectares = num(form.areaHectares);
    if (form.roadAccess) details.roadAccess = form.roadAccess;
    if (form.roadType) details.roadType = form.roadType;
    if (form.fencing) details.fencing = form.fencing;
    if (form.treesPlantation) details.treesPlantation = form.treesPlantation;
    if (form.irrigationType) details.irrigationType = form.irrigationType;
    if (form.electricityLand) details.electricityLand = form.electricityLand;
    if (form.distanceFromCity) details.distanceFromCity = num(form.distanceFromCity);
    details.sevenTwelveExtract = form.sevenTwelveExtract;
    if (form.soilType) details.soilType = form.soilType;
  }

  return details;
}


/**
 * Main buildDetails function that delegates to specific builders
 */
export function buildDetails(form) {
  const pt = form.propertyType;
  const lc = form.listingCategory;
  
  // Land properties
  if (pt === "Residential Plot" || pt === "Agricultural Land") {
    return buildLandDetails(form);
  }
  
  // Commercial properties
  if (pt === "Office Space" || pt === "Shop" || pt === "Showroom" || pt === "Warehouse/Godown") {
    return buildCommercialDetails(form);
  }
  
  // Residential properties and New Projects
  return buildResidentialDetails(form);
}
