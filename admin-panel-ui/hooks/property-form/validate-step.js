export function validateStep(stepIndex, form) {
  const errors = {};

  switch (stepIndex) {
    case 0:
      if (!form.title.trim()) errors.title = "Title is required";
      if (!form.listingCategory) errors.listingCategory = "Listing category is required";
      if (!form.propertyType) errors.propertyType = "Property type is required";
      if (!form.description.trim()) errors.description = "Description is required";
      if (form.description.trim().length < 10) errors.description = "Description must be at least 10 characters";
      break;
    case 1:
      if (!form.locality.trim()) errors.locality = "Locality is required";
      if (!form.lat || !form.lng) errors.coordinates = "Location coordinates are required";
      break;
    case 2:
       if (!form.propertyListedBy) errors.propertyListedBy = "Property listed by is required";
      if (!form.brokerId) errors.brokerId = "Please select a broker";
      break;
    case 3: {
      const pt = form.propertyType;
      const lc = form.listingCategory;
      const isResale = lc === "Resale";
      const isNew = lc === "New";

      if (["Flat/Apartment", "Builder Floor", "Penthouse"].includes(pt)) {
        if (!form.bhk) errors.bhk = "BHK is required";
        if (!form.bathrooms) errors.bathrooms = "Bathrooms is required";
        if (!form.floorNumber && form.floorNumber !== 0) errors.floorNumber = "Floor Number is required";
        if (!form.totalFloors) errors.totalFloors = "Total Floors is required";
        if (!form.carpetArea) errors.carpetArea = "Carpet Area is required";
        if (!form.furnishing) errors.furnishing = "Furnishing is required";
      }
      if (pt === "Villa/Independent House") {
        if (!form.bhk) errors.bhk = "BHK is required";
        if (!form.bathrooms) errors.bathrooms = "Bathrooms is required";
        if (!form.numberOfFloors) errors.numberOfFloors = "Number of Floors is required";
        if (!form.plotArea) errors.plotArea = "Plot Area is required";
        if (!form.builtUpArea) errors.builtUpArea = "Built-up Area is required";
        if (!form.furnishing) errors.furnishing = "Furnishing is required";
        if (!form.parkingSlots && form.parkingSlots !== 0) errors.parkingSlots = "Parking Slots is required";
      }
      if (pt === "Office Space") {
        if (!form.carpetArea) errors.carpetArea = "Carpet Area is required";
        if (!form.floorNumber && form.floorNumber !== 0) errors.floorNumber = "Floor Number is required";
        if (!form.furnishing) errors.furnishing = "Furnishing is required";
        if (!form.washrooms) errors.washrooms = "Washrooms is required";
      }
      if (pt === "Shop") {
        if (!form.carpetArea) errors.carpetArea = "Carpet Area is required";
        if (!form.shopFloor) errors.shopFloor = "Shop Floor is required";
      }
      if (pt === "Showroom") {
        if (!form.showroomArea) errors.showroomArea = "Showroom Area is required";
        if (form.parkingAvailable !== true && form.parkingAvailable !== false) errors.parkingAvailable = "Parking Available is required";
      }
      if (pt === "Warehouse/Godown") {
        if (!form.warehouseArea) errors.warehouseArea = "Warehouse Area is required";
        if (!form.warehouseHeight) errors.warehouseHeight = "Warehouse Height is required";
        if (form.truckAccess !== true && form.truckAccess !== false) errors.truckAccess = "Truck Access is required";
      }
      if (pt === "Residential Plot") {
        if (!form.plotAreaSqFt) errors.plotAreaSqFt = "Plot Area is required";
      }
      if (pt === "Agricultural Land") {
        if (!form.areaAcres) errors.areaAcres = "Area (Acres) is required";
        if (form.roadAccess !== true && form.roadAccess !== false) errors.roadAccess = "Road Access is required";
        if (!form.ownershipType) errors.ownershipType = "Ownership Type is required";
      }
      if (isNew) {
        // RERA required for all new projects EXCEPT Agricultural Land and Warehouse/Godown
        const requiresRera = ![
          "Agricultural Land",
          "Warehouse/Godown",
        ].includes(pt);

        const fullNewCoreTypes = [
          "Flat/Apartment",
          "Builder Floor",
          "Penthouse",
          "Office Space",
          "Shop",
          "Showroom",
        ];
        if (fullNewCoreTypes.includes(pt)) {
          if (!form.projectName?.trim()) errors.projectName = "Project Name is required";
          if (!form.builderName?.trim()) errors.builderName = "Builder Name is required";
          if (requiresRera) {
            if (!form.reraNumber?.trim()) errors.reraNumber = "RERA Number is required for new projects";
            if (!form.projectReraNumber?.trim()) errors.projectReraNumber = "Project RERA Number is required for new projects";
          }
          if (!form.constructionStatus) errors.constructionStatus = "Construction Status is required";
          if (!form.possessionDate) errors.possessionDate = "Possession Date is required";
        } else if (pt === "Villa/Independent House") {
          if (!form.projectName?.trim()) errors.projectName = "Project Name is required";
          if (!form.builderName?.trim()) errors.builderName = "Builder Name is required";
          if (requiresRera) {
            if (!form.reraNumber?.trim()) errors.reraNumber = "RERA Number is required for new projects";
            if (!form.projectReraNumber?.trim()) errors.projectReraNumber = "Project RERA Number is required for new projects";
          }
          if (!form.constructionStatus) errors.constructionStatus = "Construction Status is required";
          if (!form.possessionDate) errors.possessionDate = "Possession Date is required";
        } else if (pt === "Warehouse/Godown") {
          if (!form.constructionStatus) errors.constructionStatus = "Construction Status is required";
          if (!form.possessionDate) errors.possessionDate = "Possession Date is required";
        } else if (pt === "Residential Plot") {
          if (!form.layoutProjectName?.trim()) errors.layoutProjectName = "Layout Project Name is required";
          if (!form.builderName?.trim()) errors.builderName = "Builder Name is required";
          if (requiresRera) {
            if (!form.reraNumber?.trim()) errors.reraNumber = "RERA Number is required for new projects";
            if (!form.projectReraNumber?.trim()) errors.projectReraNumber = "Project RERA Number is required for new projects";
          }
          if (!form.developmentStatus) errors.developmentStatus = "Development Status is required";
        }
      }
      if (isResale) {
        if (["Flat/Apartment", "Builder Floor", "Penthouse", "Office Space", "Shop", "Showroom", "Warehouse/Godown"].includes(pt) && !form.ownershipType) {
          errors.ownershipType = "Ownership Type is required";
        }
        if (pt === "Villa/Independent House" && !form.ownershipType) {
          errors.ownershipType = "Ownership Type is required";
        }
        if (["Flat/Apartment", "Builder Floor", "Penthouse", "Villa/Independent House"].includes(pt) && form.readyToMove !== true && form.readyToMove !== false) {
          errors.readyToMove = "Ready to Move is required";
        }
      }
      break;
    }
    case 4: {
      const lc = form.listingCategory;
      const isAgri = form.propertyType === "Agricultural Land";
      if (lc === "Resale") {
        if (!form.totalPrice) errors.totalPrice = "Total Price is required";
        if (!form.possessionTimeline) errors.possessionTimeline = "Possession Timeline is required";
      }
      if (lc === "New") {
        if (!form.startingPrice) errors.startingPrice = "Starting Price is required";
        if (!form.possessionDate) errors.possessionDate = "Possession Date is required";
      }
      if (lc === "Rental") {
        if (isAgri) {
          if (!form.annualLease) errors.annualLease = "Annual Lease is required";
        } else if (!form.monthlyRent) {
          errors.monthlyRent = "Monthly Rent is required";
        }
        if (!form.securityDeposit && form.securityDeposit !== 0) errors.securityDeposit = "Security Deposit is required";
        if (!form.availableFrom) errors.availableFrom = "Available From is required";
      }
      break;
    }
    case 5: {
      // Amenities are optional — always passes
      break;
    }
    case 6:
      if (!form.photos || form.photos.length === 0) errors.photos = "At least one photo is required";
      if (form.photos && form.photos.some((p) => !p || p.trim() === "")) errors.photos = "Invalid photo URL detected";
      break;
    default:
      break;
  }

  return errors;
}
