"use client"

/**
 * usePropertyForm
 *
 * Manages property form state for the create and edit flows.
 * Media (photos/video) is handled as plain URL strings because
 * the PhotoUploader component uploads/deletes files immediately on change.
 *
 * On submit, buildPayload() returns a plain JSON object ready for
 * POST /api/v1/admin/properties or PUT /api/v1/admin/properties/:id
 */
import { useCallback, useState } from "react";
import { buildDetails } from "@/lib/utils/property-details-builder";
import { buildPricing } from "@/lib/utils/property-pricing-builder";
import { DEFAULT_STATE } from "@/hooks/property-form/default-state";
import { validateStep } from "@/hooks/property-form/validate-step";
import { showsPreferredTenants } from "@/lib/api/property.api";
// ─── Helper: convert string to number or undefined ────────────────────────────
function num(v) {
    if (!v || v.trim() === "")
        return undefined;
    const n = Number(v);
    return isNaN(n) ? undefined : n;
}
// ─── Helper: string to string or undefined ────────────────────────────────────
function str(v) {
    return v.trim() === "" ? undefined : v.trim();
}
// ─── Build property details object ─────────────────────────────────────────────
function buildPropertyDetails(form) {
    const details = {};
    const pt = form.propertyType;
    const lc = form.listingCategory;
    const isResale = lc === "Resale";
    const isNew = lc === "New";
    const isFlat = pt === "Flat/Apartment";
    const isBuilderFloor = pt === "Builder Floor";
    const isPenthouse = pt === "Penthouse";
    const isVilla = pt === "Villa/Independent House";
    const isOffice = pt === "Office Space";
    const isShop = pt === "Shop";
    const isShowroom = pt === "Showroom";
    const isWarehouse = pt === "Warehouse/Godown";
    const isResPlot = pt === "Residential Plot";
    const isAgri = pt === "Agricultural Land";
    // Shop/Showroom
    if (isShop || isShowroom) {
        if (form.carpetArea)
            details.carpetArea = num(form.carpetArea);
        if (form.builtUpArea)
            details.builtUpArea = num(form.builtUpArea);
        if (form.furnishing)
            details.furnishing = form.furnishing;
        if (form.frontage)
            details.frontage = num(form.frontage);
        if (form.ceilingHeight)
            details.ceilingHeight = num(form.ceilingHeight);
        if (form.ageOfProperty)
            details.ageOfProperty = form.ageOfProperty;
        details.glassFront = form.glassFront;
        details.parkingAvailable = form.parkingAvailable;
        details.acInstalled = form.acInstalled;
        details.mainRoadFacing = form.mainRoadFacing;
        if (isResale && form.ownershipType)
            details.ownershipType = form.ownershipType;
    }
    // Warehouse
    if (isWarehouse) {
        if (form.warehouseArea)
            details.warehouseArea = num(form.warehouseArea);
        if (form.warehouseHeight)
            details.warehouseHeight = num(form.warehouseHeight);
        if (form.numberOfDocks)
            details.numberOfDocks = num(form.numberOfDocks);
        if (form.floorLoadCapacity)
            details.floorLoadCapacity = form.floorLoadCapacity;
        if (form.openYardArea)
            details.openYardArea = num(form.openYardArea);
        if (form.powerLoad)
            details.powerLoad = num(form.powerLoad);
        if (form.ageOfProperty)
            details.ageOfProperty = form.ageOfProperty;
        details.truckAccess = form.truckAccess;
        details.waterSupplyWarehouse = form.waterSupplyWarehouse;
        details.officeSpaceInside = form.officeSpaceInside;
        details.midc = form.midc;
        if (isResale && form.ownershipType)
            details.ownershipType = form.ownershipType;
        if (isNew) {
            if (form.projectName)
                details.projectName = form.projectName;
            if (form.builderName)
                details.builderName = form.builderName;
            if (form.constructionStatus)
                details.constructionStatus = form.constructionStatus;
            if (form.possessionDate)
                details.possessionDate = form.possessionDate;
        }
    }
    // Residential Plot
    if (isResPlot) {
        if (form.plotAreaSqFt)
            details.plotAreaSqFt = num(form.plotAreaSqFt);
        if (form.plotLength)
            details.plotLength = num(form.plotLength);
        if (form.plotWidth)
            details.plotWidth = num(form.plotWidth);
        if (form.facing)
            details.facing = form.facing;
        if (form.zoneType)
            details.zoneType = form.zoneType;
        if (form.roadWidth)
            details.roadWidth = num(form.roadWidth);
        if (form.fsiAvailable)
            details.fsiAvailable = num(form.fsiAvailable);
        if (form.approvedBy.length)
            details.approvedBy = form.approvedBy;
        details.boundaryWall = form.boundaryWall;
        details.gatedLayout = form.gatedLayout;
        details.cornerPlot = form.cornerPlot;
        if (isResale && form.ownershipType)
            details.ownershipType = form.ownershipType;
        if (isNew) {
            if (form.layoutProjectName)
                details.layoutProjectName = form.layoutProjectName;
            if (form.builderName)
                details.builderName = form.builderName;
            details.reraNumber = form.reraNumber || "";
            details.projectReraNumber = form.projectReraNumber || "";
            if (form.totalPlotsInLayout)
                details.totalPlotsInLayout = num(form.totalPlotsInLayout);
            if (form.plotsAvailable)
                details.plotsAvailable = num(form.plotsAvailable);
            if (form.developmentStatus)
                details.developmentStatus = form.developmentStatus;
        }
    }
    // Agricultural Land
    if (isAgri) {
        if (form.areaAcres)
            details.areaAcres = num(form.areaAcres);
        if (form.areaHectares)
            details.areaHectares = num(form.areaHectares);
        if (form.distanceFromCity)
            details.distanceFromCity = num(form.distanceFromCity);
        if (form.roadType)
            details.roadType = form.roadType;
        if (form.irrigationType)
            details.irrigationType = form.irrigationType;
        if (form.soilType)
            details.soilType = form.soilType;
        if (form.ownershipType)
            details.ownershipType = form.ownershipType;
        if (form.waterSource.length)
            details.waterSource = form.waterSource;
        if (form.treesPlantation)
            details.treesPlantation = form.treesPlantation;
        details.roadAccess = form.roadAccess;
        details.fencing = form.fencing;
        details.electricityLand = form.electricityLand;
        details.sevenTwelveExtract = form.sevenTwelveExtract;
    }
    // New project core — villa (separate unit fields)
    if (isNew && isVilla) {
        if (form.projectName)
            details.projectName = form.projectName;
        if (form.builderName)
            details.builderName = form.builderName;
        details.reraNumber = form.reraNumber || "";
        details.projectReraNumber = form.projectReraNumber || "";
        if (form.reraValidityDate)
            details.reraValidityDate = form.reraValidityDate;
        if (form.constructionStatus)
            details.constructionStatus = form.constructionStatus;
        if (form.possessionDate)
            details.possessionDate = form.possessionDate;
        if (form.totalVillasInProject)
            details.totalVillasInProject = num(form.totalVillasInProject);
        if (form.unitsAvailable)
            details.unitsAvailable = num(form.unitsAvailable);
        if (form.towerWing)
            details.towerWing = form.towerWing;
    }
    // New project core (for types that use full newProjectDetails)
    if (isNew && (isFlat || isBuilderFloor || isPenthouse || isOffice || isShop || isShowroom)) {
        if (form.projectName)
            details.projectName = form.projectName;
        if (form.builderName)
            details.builderName = form.builderName;
        details.reraNumber = form.reraNumber || "";
        details.projectReraNumber = form.projectReraNumber || "";
        if (form.reraValidityDate)
            details.reraValidityDate = form.reraValidityDate;
        if (form.constructionStatus)
            details.constructionStatus = form.constructionStatus;
        if (form.possessionDate)
            details.possessionDate = form.possessionDate;
        if (form.totalUnitsInProject)
            details.totalUnitsInProject = num(form.totalUnitsInProject);
        if (form.unitsAvailable)
            details.unitsAvailable = num(form.unitsAvailable);
        if (form.towerWing)
            details.towerWing = form.towerWing;
        if (form.approvedBanks)
            details.approvedBanks = form.approvedBanks;
        if (form.ccOcReceived)
            details.ccOcReceived = form.ccOcReceived;
    }
    return details;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function usePropertyForm() {
    const [form, setForm] = useState(DEFAULT_STATE);
    const [errors, setErrors] = useState({});
    // Generic field setter
    const set = useCallback((key, value) => {
        setForm((prev) => {
            const next = { ...prev, [key]: value };
            if (key === "propertyType" && !showsPreferredTenants(value)) {
                next.preferredTenants = [];
            }
            return next;
        });
        setErrors((prev) => { const e = { ...prev }; delete e[key]; return e; });
    }, []);
    // Amenity toggle
    const toggleAmenity = useCallback((amenity) => {
        setForm((prev) => {
            const removing = prev.amenities.includes(amenity);
            const amenities = removing
                ? prev.amenities.filter((a) => a !== amenity)
                : [...prev.amenities, amenity];
            return { ...prev, amenities };
        });
    }, []);
    const setAmenities = useCallback((amenities) => {
        setForm((prev) => ({ ...prev, amenities }));
    }, []);
    // Validate a specific step and store errors
    const validateStepAndSet = useCallback((stepIndex) => {
        const stepErrors = validateStep(stepIndex, form);
        setErrors(stepErrors);
        return Object.keys(stepErrors).length === 0;
    }, [form]);
    // Full-form validation guard (called before final submit)
    const validate = useCallback(() => {
        if (!form.title.trim())
            return "Title is required";
        if (!form.listingCategory)
            return "Listing category is required";
        if (!form.propertyType)
            return "Property type is required";
        if (!form.propertyListedBy)
            return "Property listed by is required";
        if (!form.description.trim())
            return "Description is required";
        if (!form.locality.trim())
            return "Locality is required";
        if (!form.brokerId)
            return "Please select a broker";
        if (form.photos.length === 0)
            return "At least one photo is required";
        return null;
    }, [form]);
    /**
     * Build the JSON payload for create/update API calls.
     * Returns a plain object with URL string arrays — no FormData.
     */
    const buildPayload = useCallback(() => {
        const lat = parseFloat(form.lat);
        const lng = parseFloat(form.lng);
        return {
            title: form.title.trim(),
            listingCategory: form.listingCategory,
            propertyType: form.propertyType,
            propertyListedBy: form.propertyListedBy,
            description: form.description.trim(),
            brokerId: form.brokerId,
            location: {
                locality: form.locality,
                subLocality: str(form.subLocality),
                landmark: str(form.landmark),
                pinCode: str(form.pinCode),
                coordinates: {
                    type: "Point",
                    coordinates: [isNaN(lng) ? 79.0882 : lng, isNaN(lat) ? 21.1458 : lat],
                },
            },
            details: { ...buildDetails(form), ...buildPropertyDetails(form) },
            pricing: buildPricing(form),
            amenities: form.amenities,
            photos: form.photos,
            video: form.videoUrl,
        };
    }, [form]);
    /**
     * Seed the form from an existing property record (edit flow).
     */
    const seedFromRecord = useCallback((record) => {
        const d = record.details ?? {};
        const p = record.pricing ?? {};
        const coords = record.location?.coordinates?.coordinates ?? [79.0882, 21.1458];
        setForm({
            ...DEFAULT_STATE,
            title: record.title ?? "",
            listingCategory: record.listingCategory ?? "",
            propertyType: record.propertyType ?? "",
            propertyListedBy: record.propertyListedBy ?? "",
            description: record.description ?? "",
            locality: record.location?.locality ?? "",
            subLocality: record.location?.subLocality ?? "",
            landmark: record.location?.landmark ?? "",
            pinCode: record.location?.pinCode ?? "",
            lat: String(coords[1] ?? ""),
            lng: String(coords[0] ?? ""),
            brokerId: record.brokerId?._id ?? record.brokerId ?? "",
            brokerName: record.brokerId?.name ?? "",
            amenities: record.amenities ?? [],
            photos: record.photos ?? [],
            videoUrl: record.video ?? null,
            // Seed detail fields
            bhk: String(d.bhk ?? ""),
            bathrooms: String(d.bathrooms ?? ""),
            balconies: String(d.balconies ?? ""),
            floorNumber: String(d.floorNumber ?? ""),
            totalFloors: String(d.totalFloors ?? ""),
            carpetArea: String(d.carpetArea ?? ""),
            builtUpArea: String(d.builtUpArea ?? ""),
            superBuiltUpArea: String(d.superBuiltUpArea ?? ""),
            furnishing: d.furnishing ?? "",
            facing: d.facing ?? "",
            ageOfProperty: d.ageOfProperty ?? "",
            floorType: d.floorType ?? "",
            waterSupply: d.waterSupply ?? "",
            electricityStatus: d.electricityStatus ?? "",
            ownershipType: d.ownershipType ?? "",
            readyToMove: !!d.readyToMove,
            petFriendly: !!d.petFriendly,
            nonVegAllowed: !!d.nonVegAllowed,
            reraRegistered: !!d.reraRegistered,
            reraNumber: d.reraNumber ?? "",
            projectReraNumber: d.projectReraNumber ?? "",
            reraValidityDate: d.reraValidityDate ? new Date(d.reraValidityDate).toISOString().split("T")[0] : "",
            numberOfFloors: d.numberOfFloors ?? "",
            plotArea: String(d.plotArea ?? ""),
            parkingSlots: String(d.parkingSlots ?? ""),
            hasGarden: !!d.hasGarden,
            cornerProperty: !!d.cornerProperty,
            gatedSociety: !!d.gatedSociety,
            independentEntry: !!d.independentEntry,
            roadWidth: String(d.roadWidth ?? ""),
            terraceArea: String(d.terraceArea ?? ""),
            privateLift: !!d.privateLift,
            isDuplex: !!d.isDuplex,
            servantRoom: !!d.servantRoom,
            privatePool: !!d.privatePool,
            totalUnitsInBuilding: String(d.totalUnitsInBuilding ?? ""),
            floorOwnershipType: d.floorOwnershipType ?? "",
            stiltParking: !!d.stiltParking,
            cabinCount: String(d.cabinCount ?? ""),
            openDesks: String(d.openDesks ?? ""),
            washrooms: String(d.washrooms ?? ""),
            hasPantry: !!d.hasPantry,
            itReady: !!d.itReady,
            conferenceRoom: !!d.conferenceRoom,
            receptionArea: !!d.receptionArea,
            centralAC: !!d.centralAC,
            officeFireSafety: !!d.officeFireSafety,
            dgBackup: !!d.dgBackup,
            shopFloor: d.shopFloor ?? "",
            frontage: String(d.frontage ?? ""),
            depth: String(d.depth ?? ""),
            ceilingHeight: String(d.ceilingHeight ?? ""),
            mainRoadFacing: !!d.mainRoadFacing,
            cornerShop: !!d.cornerShop,
            mezzanineFloor: !!d.mezzanineFloor,
            hasWashroom: !!d.hasWashroom,
            footfallRating: d.footfallRating ?? "",
            suitableFor: d.suitableFor ?? [],
            showroomArea: String(d.showroomArea ?? ""),
            numberOfShowroomFloors: String(d.numberOfShowroomFloors ?? ""),
            glassFront: !!d.glassFront,
            parkingAvailable: !!d.parkingAvailable,
            acInstalled: !!d.acInstalled,
            warehouseArea: String(d.warehouseArea ?? ""),
            warehouseHeight: String(d.warehouseHeight ?? ""),
            truckAccess: !!d.truckAccess,
            numberOfDocks: String(d.numberOfDocks ?? ""),
            floorLoadCapacity: d.floorLoadCapacity ?? "",
            openYardArea: String(d.openYardArea ?? ""),
            powerLoad: String(d.powerLoad ?? ""),
            waterSupplyWarehouse: !!d.waterSupplyWarehouse,
            officeSpaceInside: !!d.officeSpaceInside,
            midc: !!d.midc,
            plotAreaSqFt: String(d.plotAreaSqFt ?? ""),
            plotLength: String(d.plotLength ?? ""),
            plotWidth: String(d.plotWidth ?? ""),
            boundaryWall: !!d.boundaryWall,
            gatedLayout: !!d.gatedLayout,
            cornerPlot: !!d.cornerPlot,
            approvedBy: d.approvedBy ?? [],
            zoneType: d.zoneType ?? "",
            fsiAvailable: String(d.fsiAvailable ?? ""),
            areaAcres: String(d.areaAcres ?? ""),
            areaHectares: String(d.areaHectares ?? ""),
            waterSource: d.waterSource ?? [],
            roadAccess: !!d.roadAccess,
            roadType: d.roadType ?? "",
            fencing: !!d.fencing,
            treesPlantation: d.treesPlantation ?? "",
            irrigationType: d.irrigationType ?? "",
            electricityLand: !!d.electricityLand,
            distanceFromCity: String(d.distanceFromCity ?? ""),
            sevenTwelveExtract: !!d.sevenTwelveExtract,
            soilType: d.soilType ?? "",
            naOrderStatus: d.naOrderStatus ?? "",
            naOrderNumber: d.naOrderNumber ?? "",
            projectName: d.projectName ?? "",
            builderName: d.builderName ?? "",
            constructionStatus: d.constructionStatus ?? "",
            possessionDate: d.possessionDate ? new Date(d.possessionDate).toISOString().split("T")[0] : "",
            totalUnitsInProject: String(d.totalUnitsInProject ?? ""),
            unitsAvailable: String(d.unitsAvailable ?? ""),
            towerWing: d.towerWing ?? "",
            approvedBanks: d.approvedBanks ?? "",
            ccOcReceived: d.ccOcReceived ?? "",
            totalVillasInProject: String(d.totalVillasInProject ?? ""),
            layoutProjectName: d.layoutProjectName ?? "",
            totalPlotsInLayout: String(d.totalPlotsInLayout ?? ""),
            plotsAvailable: String(d.plotsAvailable ?? ""),
            developmentStatus: d.developmentStatus ?? "",
            // Pricing
            totalPrice: String(p.totalPrice ?? ""),
            pricePerSqft: String(p.pricePerSqft ?? ""),
            priceNegotiable: !!p.priceNegotiable,
            possessionTimeline: p.possessionTimeline ?? "",
            brokerage: p.brokerage ?? "",
            startingPrice: String(p.startingPrice ?? ""),
            priceRange: p.priceRange ?? "",
            bookingAmount: String(p.bookingAmount ?? ""),
            gstApplicable: !!p.gstApplicable,
            monthlyRent: String(p.monthlyRent ?? ""),
            annualLease: String(p.annualLease ?? ""),
            securityDeposit: String(p.securityDeposit ?? ""),
            maintenance: String(p.maintenance ?? ""),
            availableFrom: p.availableFrom ? new Date(p.availableFrom).toISOString().split("T")[0] : "",
            preferredTenants: p.preferredTenants ?? [],
            leaseDuration: p.leaseDuration ?? "",
            lockInPeriod: p.lockInPeriod ?? "",
            rentNegotiable: !!p.rentNegotiable,
        });
        setErrors({});
    }, []);
    const reset = useCallback(() => {
        setForm(DEFAULT_STATE);
        setErrors({});
    }, []);
    return {
        form,
        errors,
        set,
        toggleAmenity,
        setAmenities,
        validateStepAndSet,
        validate,
        buildPayload,
        seedFromRecord,
        reset,
    };
}
