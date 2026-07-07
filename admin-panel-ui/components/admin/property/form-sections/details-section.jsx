"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FLOOR_OWNERSHIP_TYPES,
  FURNISHING_OPTIONS,
  FACING_OPTIONS,
  FLOOR_TYPE,
  WATER_SUPPLY,
  ELECTRICITY_STATUS,
  AGE_OF_PROPERTY,
  SHOP_FLOOR_OPTIONS,
  FOOTFALL_RATING_OPTIONS,
  SUITABLE_FOR_OPTIONS,
  ROAD_TYPES,
  IRRIGATION_TYPES,
  SOIL_TYPES,
  NA_ORDER_STATUS_OPTIONS,
  WATER_SOURCE_OPTIONS,
  APPROVED_BY_OPTIONS,
  ZONE_TYPES,
  CONSTRUCTION_STATUS_OPTIONS,
  CC_OC_OPTIONS,
  DEVELOPMENT_STATUS_OPTIONS,
} from "@/lib/api/property.api";
import {
  Field,
  FieldError,
  MultiCheckbox,
  NumInput,
  Sel,
  ToggleRow,
} from "@/components/admin/property/form-sections/shared-fields";

// ---------------------------------------------------------------------------
// Shared / reusable field groups
// ---------------------------------------------------------------------------

function ResidentialBaseFields({ form, set, errors, disabled }) {
  return (
    <>
      <Field label="BHK" required error={errors.bhk}>
        <NumInput value={form.bhk} onChange={(v) => set("bhk", v)} placeholder="3" min={0} max={8} disabled={disabled} error={!!errors.bhk} />
      </Field>
      <Field label="Bathrooms" required error={errors.bathrooms}>
        <NumInput value={form.bathrooms} onChange={(v) => set("bathrooms", v)} placeholder="2" min={0} max={15} disabled={disabled} error={!!errors.bathrooms} />
      </Field>
      <Field label="Balconies" error={errors.balconies}>
        <NumInput value={form.balconies} onChange={(v) => set("balconies", v)} placeholder="1" min={0} max={10} disabled={disabled} error={!!errors.balconies} />
      </Field>
      <Field label="Floor Number" required error={errors.floorNumber}>
        <NumInput value={form.floorNumber} onChange={(v) => set("floorNumber", v)} placeholder="3" min={0} max={99} disabled={disabled} error={!!errors.floorNumber} />
      </Field>
      <Field label="Total Floors" required error={errors.totalFloors}>
        <NumInput value={form.totalFloors} onChange={(v) => set("totalFloors", v)} placeholder="10" min={1} max={99} disabled={disabled} error={!!errors.totalFloors} />
      </Field>
      <Field label="Carpet Area (sq.ft)" required error={errors.carpetArea}>
        <NumInput value={form.carpetArea} onChange={(v) => set("carpetArea", v)} placeholder="1200" min={1} disabled={disabled} error={!!errors.carpetArea} />
      </Field>
      <Field label="Built-up Area (sq.ft)" error={errors.builtUpArea}>
        <NumInput value={form.builtUpArea} onChange={(v) => set("builtUpArea", v)} placeholder="1400" min={1} disabled={disabled} />
      </Field>
      <Field label="Super Built-up Area (sq.ft)" error={errors.superBuiltUpArea}>
        <NumInput value={form.superBuiltUpArea} onChange={(v) => set("superBuiltUpArea", v)} placeholder="1600" min={1} disabled={disabled} />
      </Field>
      <Sel label="Furnishing" required value={form.furnishing} onChange={(v) => set("furnishing", v)} options={FURNISHING_OPTIONS} disabled={disabled} error={errors.furnishing} />
      <Sel label="Facing" value={form.facing} onChange={(v) => set("facing", v)} options={FACING_OPTIONS} disabled={disabled} />
      <Sel label="Age of Property" value={form.ageOfProperty} onChange={(v) => set("ageOfProperty", v)} options={AGE_OF_PROPERTY} disabled={disabled} />
      <Sel label="Floor Type" value={form.floorType} onChange={(v) => set("floorType", v)} options={FLOOR_TYPE} disabled={disabled} />
      <Sel label="Water Supply" value={form.waterSupply} onChange={(v) => set("waterSupply", v)} options={WATER_SUPPLY} disabled={disabled} />
      <Sel label="Electricity Status" value={form.electricityStatus} onChange={(v) => set("electricityStatus", v)} options={ELECTRICITY_STATUS} disabled={disabled} />
    </>
  );
}

function ReraOptionalFields({ form, set, disabled }) {
  return (
    <>
      <ToggleRow label="RERA Registered" checked={form.reraRegistered} onChange={(v) => set("reraRegistered", v)} disabled={disabled} />
      {form.reraRegistered && (
        <Field label="RERA Number">
          <Input value={form.reraNumber} onChange={(e) => set("reraNumber", e.target.value)} placeholder="P52100123456" disabled={disabled} />
        </Field>
      )}
    </>
  );
}

function NewProjectCoreFields({ form, set, errors, disabled, hideUnits = false }) {
  return (
    <>
      <Field label="Project Name" required error={errors.projectName}>
        <Input value={form.projectName} onChange={(e) => set("projectName", e.target.value)} placeholder="Green Valley Heights" maxLength={100} disabled={disabled} className={errors.projectName ? "border-destructive focus-visible:ring-destructive" : ""} />
      </Field>
      <Field label="Builder Name" required error={errors.builderName}>
        <Input value={form.builderName} onChange={(e) => set("builderName", e.target.value)} placeholder="ABC Constructions" maxLength={100} disabled={disabled} className={errors.builderName ? "border-destructive focus-visible:ring-destructive" : ""} />
      </Field>
      <Field label="RERA Number" required error={errors.reraNumber}>
        <Input value={form.reraNumber} onChange={(e) => set("reraNumber", e.target.value)} placeholder="P52100123456" disabled={disabled} className={errors.reraNumber ? "border-destructive focus-visible:ring-destructive" : ""} />
      </Field>
      <Field label="Project RERA Number" required error={errors.projectReraNumber}>
        <Input value={form.projectReraNumber} onChange={(e) => set("projectReraNumber", e.target.value)} placeholder="Project RERA Number" disabled={disabled} className={errors.projectReraNumber ? "border-destructive focus-visible:ring-destructive" : ""} />
      </Field>
      <Field label="RERA Validity Date">
        <Input type="date" value={form.reraValidityDate} onChange={(e) => set("reraValidityDate", e.target.value)} disabled={disabled} />
      </Field>
      <Sel label="Construction Status" required value={form.constructionStatus} onChange={(v) => set("constructionStatus", v)} options={CONSTRUCTION_STATUS_OPTIONS} disabled={disabled} error={errors.constructionStatus} />
      <Field label="Possession Date" required error={errors.possessionDate}>
        <Input type="date" value={form.possessionDate} onChange={(e) => set("possessionDate", e.target.value)} disabled={disabled} className={errors.possessionDate ? "border-destructive focus-visible:ring-destructive" : ""} />
      </Field>
      {!hideUnits && (
        <>
          <Field label="Total Units in Project" error={errors.totalUnitsInProject}>
            <NumInput value={form.totalUnitsInProject} onChange={(v) => set("totalUnitsInProject", v)} placeholder="100" min={1} disabled={disabled} />
          </Field>
          <Field label="Units Available" error={errors.unitsAvailable}>
            <NumInput value={form.unitsAvailable} onChange={(v) => set("unitsAvailable", v)} placeholder="25" min={0} disabled={disabled} />
          </Field>
          <Field label="Tower / Wing">
            <Input value={form.towerWing} onChange={(e) => set("towerWing", e.target.value)} placeholder="Tower A" maxLength={50} disabled={disabled} />
          </Field>
        </>
      )}
      <Field label="Approved Banks">
        <Input value={form.approvedBanks} onChange={(e) => set("approvedBanks", e.target.value)} placeholder="HDFC, SBI, ICICI" maxLength={200} disabled={disabled} />
      </Field>
      <Sel label="CC/OC Status" value={form.ccOcReceived} onChange={(v) => set("ccOcReceived", v)} options={CC_OC_OPTIONS} disabled={disabled} />
    </>
  );
}

function ResaleResidentialExtraFields({ form, set, errors, disabled, ownershipOptions = ["Freehold", "Leasehold", "Co-operative Society", "Power of Attorney"] }) {
  return (
    <>
      <Sel label="Ownership Type" required value={form.ownershipType} onChange={(v) => set("ownershipType", v)} options={ownershipOptions} disabled={disabled} error={errors.ownershipType} />
      <ToggleRow label="Ready to Move" checked={form.readyToMove} onChange={(v) => set("readyToMove", v)} disabled={disabled} />
    </>
  );
}

function PetDietFields({ form, set, disabled }) {
  return (
    <>
      <ToggleRow label="Pet Friendly" checked={form.petFriendly} onChange={(v) => set("petFriendly", v)} disabled={disabled} />
      <ToggleRow label="Non-Veg Allowed" checked={form.nonVegAllowed} onChange={(v) => set("nonVegAllowed", v)} disabled={disabled} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Property-type sections
// ---------------------------------------------------------------------------

function FlatFields({ form, set, errors, disabled, isNew, isResale, isRental }) {
  return (
    <>
      <ResidentialBaseFields form={form} set={set} errors={errors} disabled={disabled} />
      {isNew && <NewProjectCoreFields form={form} set={set} errors={errors} disabled={disabled} />}
      {isResale && <ResaleResidentialExtraFields form={form} set={set} errors={errors} disabled={disabled} />}
      {isRental && <PetDietFields form={form} set={set} disabled={disabled} />}
    </>
  );
}

function BuilderFloorFields({ form, set, errors, disabled, isNew, isResale, isRental }) {
  return (
    <>
      <ResidentialBaseFields form={form} set={set} errors={errors} disabled={disabled} />
      <Field label="Total Units in Building" error={errors.totalUnitsInBuilding}>
        <NumInput value={form.totalUnitsInBuilding} onChange={(v) => set("totalUnitsInBuilding", v)} placeholder="4" min={1} disabled={disabled} />
      </Field>
      <Sel label="Floor Ownership Type" value={form.floorOwnershipType} onChange={(v) => set("floorOwnershipType", v)} options={FLOOR_OWNERSHIP_TYPES} disabled={disabled} />
      <ToggleRow label="Stilt Parking" checked={form.stiltParking} onChange={(v) => set("stiltParking", v)} disabled={disabled} />
      {isNew && <NewProjectCoreFields form={form} set={set} errors={errors} disabled={disabled} />}
      {isResale && <ResaleResidentialExtraFields form={form} set={set} errors={errors} disabled={disabled} />}
      {isRental && <PetDietFields form={form} set={set} disabled={disabled} />}
    </>
  );
}

function PenthouseFields({ form, set, errors, disabled, isNew, isResale, isRental }) {
  return (
    <>
      <ResidentialBaseFields form={form} set={set} errors={errors} disabled={disabled} />
      <Field label="Terrace Area (sq.ft)" error={errors.terraceArea}>
        <NumInput value={form.terraceArea} onChange={(v) => set("terraceArea", v)} placeholder="500" min={1} disabled={disabled} />
      </Field>
      <ToggleRow label="Private Lift" checked={form.privateLift} onChange={(v) => set("privateLift", v)} disabled={disabled} />
      <ToggleRow label="Duplex" checked={form.isDuplex} onChange={(v) => set("isDuplex", v)} disabled={disabled} />
      <ToggleRow label="Servant Room" checked={form.servantRoom} onChange={(v) => set("servantRoom", v)} disabled={disabled} />
      <ToggleRow label="Private Pool" checked={form.privatePool} onChange={(v) => set("privatePool", v)} disabled={disabled} />
      {isNew && <NewProjectCoreFields form={form} set={set} errors={errors} disabled={disabled} />}
      {isResale && <ResaleResidentialExtraFields form={form} set={set} errors={errors} disabled={disabled} />}
      {isRental && <PetDietFields form={form} set={set} disabled={disabled} />}
    </>
  );
}

const NUMBER_OF_FLOORS_OPTIONS = ["1", "1.5", "2", "2.5", "3", "3.5", "4+"];

function VillaFields({ form, set, errors, disabled, isNew, isResale, isRental }) {
  return (
    <>
      <Field label="BHK" required error={errors.bhk}>
        <NumInput value={form.bhk} onChange={(v) => set("bhk", v)} placeholder="3" min={0} max={8} disabled={disabled} error={!!errors.bhk} />
      </Field>
      <Field label="Bathrooms" required error={errors.bathrooms}>
        <NumInput value={form.bathrooms} onChange={(v) => set("bathrooms", v)} placeholder="2" min={0} max={15} disabled={disabled} error={!!errors.bathrooms} />
      </Field>
      <Field label="Number of Floors" required error={errors.numberOfFloors}>
        <Select value={form.numberOfFloors} onValueChange={(v) => set("numberOfFloors", v)} disabled={disabled}>
          <SelectTrigger className={errors.numberOfFloors ? "border-destructive" : ""}>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {NUMBER_OF_FLOORS_OPTIONS.map((o) => (
              <SelectItem key={o} value={o}>{o}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError message={errors.numberOfFloors} />
      </Field>
      <Field label="Plot Area (sq.ft)" required error={errors.plotArea}>
        <NumInput value={form.plotArea} onChange={(v) => set("plotArea", v)} placeholder="2000" min={1} disabled={disabled} error={!!errors.plotArea} />
      </Field>
      <Field label="Built-up Area (sq.ft)" required error={errors.builtUpArea}>
        <NumInput value={form.builtUpArea} onChange={(v) => set("builtUpArea", v)} placeholder="1800" min={1} disabled={disabled} error={!!errors.builtUpArea} />
      </Field>
      <Field label="Carpet Area (sq.ft)" error={errors.carpetArea}>
        <NumInput value={form.carpetArea} onChange={(v) => set("carpetArea", v)} placeholder="1600" min={1} disabled={disabled} />
      </Field>
      <Sel label="Furnishing" required value={form.furnishing} onChange={(v) => set("furnishing", v)} options={FURNISHING_OPTIONS} disabled={disabled} error={errors.furnishing} />
      <Sel label="Facing" value={form.facing} onChange={(v) => set("facing", v)} options={FACING_OPTIONS} disabled={disabled} />
      <Field label="Parking Slots" required error={errors.parkingSlots}>
        <NumInput value={form.parkingSlots} onChange={(v) => set("parkingSlots", v)} placeholder="2" min={0} max={10} disabled={disabled} error={!!errors.parkingSlots} />
      </Field>
      <Field label="Road Width (ft)" error={errors.roadWidth}>
        <NumInput value={form.roadWidth} onChange={(v) => set("roadWidth", v)} placeholder="20" min={1} disabled={disabled} />
      </Field>
      <Sel label="Water Supply" value={form.waterSupply} onChange={(v) => set("waterSupply", v)} options={WATER_SUPPLY} disabled={disabled} />
      <Sel label="Floor Type" value={form.floorType} onChange={(v) => set("floorType", v)} options={FLOOR_TYPE} disabled={disabled} />
      <Sel label="Age of Property" value={form.ageOfProperty} onChange={(v) => set("ageOfProperty", v)} options={AGE_OF_PROPERTY} disabled={disabled} />
      <ToggleRow label="Has Garden" checked={form.hasGarden} onChange={(v) => set("hasGarden", v)} disabled={disabled} />
      <ToggleRow label="Corner Property" checked={form.cornerProperty} onChange={(v) => set("cornerProperty", v)} disabled={disabled} />
      <ToggleRow label="Gated Society" checked={form.gatedSociety} onChange={(v) => set("gatedSociety", v)} disabled={disabled} />
      {(isResale || isRental) && (
        <Sel label="Ownership Type" required={isResale} value={form.ownershipType} onChange={(v) => set("ownershipType", v)} options={["Freehold", "Leasehold", "Power of Attorney"]} disabled={disabled} error={isResale ? errors.ownershipType : undefined} />
      )}
      {isResale && (
        <ToggleRow label="Ready to Move" checked={form.readyToMove} onChange={(v) => set("readyToMove", v)} disabled={disabled} />
      )}
      {isNew && (
        <>
          <Field label="Project Name" required error={errors.projectName}>
            <Input value={form.projectName} onChange={(e) => set("projectName", e.target.value)} placeholder="Green Valley Villas" maxLength={100} disabled={disabled} className={errors.projectName ? "border-destructive focus-visible:ring-destructive" : ""} />
          </Field>
          <Field label="Builder Name" required error={errors.builderName}>
            <Input value={form.builderName} onChange={(e) => set("builderName", e.target.value)} placeholder="ABC Constructions" maxLength={100} disabled={disabled} className={errors.builderName ? "border-destructive focus-visible:ring-destructive" : ""} />
          </Field>
          <Field label="RERA Number" required error={errors.reraNumber}>
            <Input value={form.reraNumber} onChange={(e) => set("reraNumber", e.target.value)} placeholder="P52100123456" disabled={disabled} className={errors.reraNumber ? "border-destructive focus-visible:ring-destructive" : ""} />
          </Field>
          <Field label="Project RERA Number" required error={errors.projectReraNumber}>
            <Input value={form.projectReraNumber} onChange={(e) => set("projectReraNumber", e.target.value)} placeholder="Project RERA Number" disabled={disabled} className={errors.projectReraNumber ? "border-destructive focus-visible:ring-destructive" : ""} />
          </Field>
          <Field label="RERA Validity Date">
            <Input type="date" value={form.reraValidityDate} onChange={(e) => set("reraValidityDate", e.target.value)} disabled={disabled} />
          </Field>
          <Sel label="Construction Status" required value={form.constructionStatus} onChange={(v) => set("constructionStatus", v)} options={CONSTRUCTION_STATUS_OPTIONS} disabled={disabled} error={errors.constructionStatus} />
          <Field label="Possession Date" required error={errors.possessionDate}>
            <Input type="date" value={form.possessionDate} onChange={(e) => set("possessionDate", e.target.value)} disabled={disabled} className={errors.possessionDate ? "border-destructive focus-visible:ring-destructive" : ""} />
          </Field>
          <Field label="Total Villas in Project" error={errors.totalVillasInProject}>
            <NumInput value={form.totalVillasInProject} onChange={(v) => set("totalVillasInProject", v)} placeholder="50" min={1} disabled={disabled} />
          </Field>
          <Field label="Units Available" error={errors.unitsAvailable}>
            <NumInput value={form.unitsAvailable} onChange={(v) => set("unitsAvailable", v)} placeholder="10" min={0} disabled={disabled} />
          </Field>
          <Field label="Tower / Wing">
            <Input value={form.towerWing} onChange={(e) => set("towerWing", e.target.value)} placeholder="Block A" maxLength={50} disabled={disabled} />
          </Field>
        </>
      )}
    </>
  );
}

function OfficeFields({ form, set, errors, disabled, isNew, isResale, isRental }) {
  return (
    <>
      <Field label="Carpet Area (sq.ft)" required error={errors.carpetArea}>
        <NumInput value={form.carpetArea} onChange={(v) => set("carpetArea", v)} placeholder="1000" min={1} disabled={disabled} error={!!errors.carpetArea} />
      </Field>
      <Field label="Built-up Area (sq.ft)" error={errors.builtUpArea}>
        <NumInput value={form.builtUpArea} onChange={(v) => set("builtUpArea", v)} placeholder="1200" min={1} disabled={disabled} />
      </Field>
      <Field label="Super Built-up Area (sq.ft)" error={errors.superBuiltUpArea}>
        <NumInput value={form.superBuiltUpArea} onChange={(v) => set("superBuiltUpArea", v)} placeholder="1400" min={1} disabled={disabled} />
      </Field>
      <Field label="Floor Number" required error={errors.floorNumber}>
        <NumInput value={form.floorNumber} onChange={(v) => set("floorNumber", v)} placeholder="2" min={0} max={99} disabled={disabled} error={!!errors.floorNumber} />
      </Field>
      <Field label="Total Floors" error={errors.totalFloors}>
        <NumInput value={form.totalFloors} onChange={(v) => set("totalFloors", v)} placeholder="10" min={1} max={99} disabled={disabled} />
      </Field>
      <Sel label="Furnishing" required value={form.furnishing} onChange={(v) => set("furnishing", v)} options={FURNISHING_OPTIONS} disabled={disabled} error={errors.furnishing} />
      <Field label="Washrooms" required error={errors.washrooms}>
        <NumInput value={form.washrooms} onChange={(v) => set("washrooms", v)} placeholder="2" min={1} max={10} disabled={disabled} error={!!errors.washrooms} />
      </Field>
      <Field label="Cabin Count" error={errors.cabinCount}>
        <NumInput value={form.cabinCount} onChange={(v) => set("cabinCount", v)} placeholder="3" min={0} max={50} disabled={disabled} />
      </Field>
      <Field label="Open Desks" error={errors.openDesks}>
        <NumInput value={form.openDesks} onChange={(v) => set("openDesks", v)} placeholder="10" min={0} max={200} disabled={disabled} />
      </Field>
      <Sel label="Age of Property" value={form.ageOfProperty} onChange={(v) => set("ageOfProperty", v)} options={AGE_OF_PROPERTY} disabled={disabled} />
      <ToggleRow label="Has Pantry" checked={form.hasPantry} onChange={(v) => set("hasPantry", v)} disabled={disabled} />
      <ToggleRow label="IT Ready" checked={form.itReady} onChange={(v) => set("itReady", v)} disabled={disabled} />
      <ToggleRow label="Conference Room" checked={form.conferenceRoom} onChange={(v) => set("conferenceRoom", v)} disabled={disabled} />
      <ToggleRow label="Reception Area" checked={form.receptionArea} onChange={(v) => set("receptionArea", v)} disabled={disabled} />
      <ToggleRow label="Central AC" checked={form.centralAC} onChange={(v) => set("centralAC", v)} disabled={disabled} />
      <ToggleRow label="Fire Safety" checked={form.officeFireSafety} onChange={(v) => set("officeFireSafety", v)} disabled={disabled} />
      <ToggleRow label="DG Backup" checked={form.dgBackup} onChange={(v) => set("dgBackup", v)} disabled={disabled} />
      {(isResale || isRental) && (
        <Sel
          label="Ownership Type"
          required={isResale}
          value={form.ownershipType}
          onChange={(v) => set("ownershipType", v)}
          options={["Freehold", "Leasehold"]}
          disabled={disabled}
          error={isResale ? errors.ownershipType : undefined}
        />
      )}
      {isNew && <NewProjectCoreFields form={form} set={set} errors={errors} disabled={disabled} hideUnits />}
    </>
  );
}

function ShopFields({ form, set, errors, disabled, isNew, isResale }) {
  return (
    <>
      <Field label="Carpet Area (sq.ft)" required error={errors.carpetArea}>
        <NumInput value={form.carpetArea} onChange={(v) => set("carpetArea", v)} placeholder="500" min={1} disabled={disabled} error={!!errors.carpetArea} />
      </Field>
      <Field label="Built-up Area (sq.ft)" error={errors.builtUpArea}>
        <NumInput value={form.builtUpArea} onChange={(v) => set("builtUpArea", v)} placeholder="600" min={1} disabled={disabled} />
      </Field>
      <Sel label="Furnishing" value={form.furnishing} onChange={(v) => set("furnishing", v)} options={FURNISHING_OPTIONS} disabled={disabled} />
      <Sel label="Shop Floor" required value={form.shopFloor} onChange={(v) => set("shopFloor", v)} options={SHOP_FLOOR_OPTIONS} disabled={disabled} error={errors.shopFloor} />
      <Field label="Frontage (ft)" error={errors.frontage}>
        <NumInput value={form.frontage} onChange={(v) => set("frontage", v)} placeholder="20" min={1} disabled={disabled} />
      </Field>
      <Field label="Depth (ft)" error={errors.depth}>
        <NumInput value={form.depth} onChange={(v) => set("depth", v)} placeholder="50" min={1} disabled={disabled} />
      </Field>
      <Field label="Ceiling Height (ft)" error={errors.ceilingHeight}>
        <NumInput value={form.ceilingHeight} onChange={(v) => set("ceilingHeight", v)} placeholder="12" min={1} disabled={disabled} />
      </Field>
      <Sel label="Footfall Rating" value={form.footfallRating} onChange={(v) => set("footfallRating", v)} options={FOOTFALL_RATING_OPTIONS} disabled={disabled} />
      <Sel label="Age of Property" value={form.ageOfProperty} onChange={(v) => set("ageOfProperty", v)} options={AGE_OF_PROPERTY} disabled={disabled} />
      <ToggleRow label="Main Road Facing" checked={form.mainRoadFacing} onChange={(v) => set("mainRoadFacing", v)} disabled={disabled} />
      <ToggleRow label="Corner Shop" checked={form.cornerShop} onChange={(v) => set("cornerShop", v)} disabled={disabled} />
      <ToggleRow label="Mezzanine Floor" checked={form.mezzanineFloor} onChange={(v) => set("mezzanineFloor", v)} disabled={disabled} />
      <ToggleRow label="Has Washroom" checked={form.hasWashroom} onChange={(v) => set("hasWashroom", v)} disabled={disabled} />
      <div className="sm:col-span-2 lg:col-span-3">
        <MultiCheckbox label="Suitable For" options={SUITABLE_FOR_OPTIONS} selected={form.suitableFor} onChange={(v) => set("suitableFor", v)} disabled={disabled} />
      </div>
      {isResale && (
        <Sel label="Ownership Type" required value={form.ownershipType} onChange={(v) => set("ownershipType", v)} options={["Freehold", "Leasehold"]} disabled={disabled} error={errors.ownershipType} />
      )}
      {isNew && <NewProjectCoreFields form={form} set={set} errors={errors} disabled={disabled} hideUnits />}
    </>
  );
}

function ShowroomFields({ form, set, errors, disabled, isNew, isResale }) {
  return (
    <>
      <Field label="Showroom Area (sq.ft)" required error={errors.showroomArea}>
        <NumInput value={form.showroomArea} onChange={(v) => set("showroomArea", v)} placeholder="2000" min={1} disabled={disabled} error={!!errors.showroomArea} />
      </Field>
      <Field label="Number of Showroom Floors" error={errors.numberOfShowroomFloors}>
        <NumInput value={form.numberOfShowroomFloors} onChange={(v) => set("numberOfShowroomFloors", v)} placeholder="1" min={1} max={5} disabled={disabled} />
      </Field>
      <Field label="Frontage (ft)" error={errors.frontage}>
        <NumInput value={form.frontage} onChange={(v) => set("frontage", v)} placeholder="30" min={1} disabled={disabled} />
      </Field>
      <Field label="Ceiling Height (ft)" error={errors.ceilingHeight}>
        <NumInput value={form.ceilingHeight} onChange={(v) => set("ceilingHeight", v)} placeholder="15" min={1} disabled={disabled} />
      </Field>
      <Sel label="Age of Property" value={form.ageOfProperty} onChange={(v) => set("ageOfProperty", v)} options={AGE_OF_PROPERTY} disabled={disabled} />
      <ToggleRow label="Glass Front" checked={form.glassFront} onChange={(v) => set("glassFront", v)} disabled={disabled} />
      <ToggleRow label="Parking Available" checked={form.parkingAvailable} onChange={(v) => set("parkingAvailable", v)} disabled={disabled} />
      <ToggleRow label="AC Installed" checked={form.acInstalled} onChange={(v) => set("acInstalled", v)} disabled={disabled} />
      <ToggleRow label="Main Road Facing" checked={form.mainRoadFacing} onChange={(v) => set("mainRoadFacing", v)} disabled={disabled} />
      {isResale && (
        <Sel label="Ownership Type" required value={form.ownershipType} onChange={(v) => set("ownershipType", v)} options={["Freehold", "Leasehold"]} disabled={disabled} error={errors.ownershipType} />
      )}
      {isNew && <NewProjectCoreFields form={form} set={set} errors={errors} disabled={disabled} hideUnits />}
    </>
  );
}

function WarehouseFields({ form, set, errors, disabled, isNew, isResale }) {
  return (
    <>
      <Field label="Warehouse Area (sq.ft)" required error={errors.warehouseArea}>
        <NumInput value={form.warehouseArea} onChange={(v) => set("warehouseArea", v)} placeholder="5000" min={1} disabled={disabled} error={!!errors.warehouseArea} />
      </Field>
      <Field label="Warehouse Height (ft)" required error={errors.warehouseHeight}>
        <NumInput value={form.warehouseHeight} onChange={(v) => set("warehouseHeight", v)} placeholder="20" min={1} disabled={disabled} error={!!errors.warehouseHeight} />
      </Field>
      <Field label="Number of Docks" error={errors.numberOfDocks}>
        <NumInput value={form.numberOfDocks} onChange={(v) => set("numberOfDocks", v)} placeholder="2" min={0} max={20} disabled={disabled} />
      </Field>
      <Field label="Floor Load Capacity" hint="Max 50 characters">
        <Input value={form.floorLoadCapacity} onChange={(e) => set("floorLoadCapacity", e.target.value)} placeholder="e.g. 2 tons/sqft" maxLength={50} disabled={disabled} />
      </Field>
      <Field label="Open Yard Area (sq.ft)" error={errors.openYardArea}>
        <NumInput value={form.openYardArea} onChange={(v) => set("openYardArea", v)} placeholder="1000" min={1} disabled={disabled} />
      </Field>
      <Field label="Power Load (KW)" error={errors.powerLoad}>
        <NumInput value={form.powerLoad} onChange={(v) => set("powerLoad", v)} placeholder="50" min={1} disabled={disabled} />
      </Field>
      <Sel label="Age of Property" value={form.ageOfProperty} onChange={(v) => set("ageOfProperty", v)} options={AGE_OF_PROPERTY} disabled={disabled} />
      <ToggleRow label="Truck Access" checked={form.truckAccess} onChange={(v) => set("truckAccess", v)} disabled={disabled} />
      <ToggleRow label="Water Supply" checked={form.waterSupplyWarehouse} onChange={(v) => set("waterSupplyWarehouse", v)} disabled={disabled} />
      <ToggleRow label="Office Space Inside" checked={form.officeSpaceInside} onChange={(v) => set("officeSpaceInside", v)} disabled={disabled} />
      <ToggleRow label="MIDC" checked={form.midc} onChange={(v) => set("midc", v)} disabled={disabled} />
      {isResale && (
        <Sel label="Ownership Type" required value={form.ownershipType} onChange={(v) => set("ownershipType", v)} options={["Freehold", "Leasehold"]} disabled={disabled} error={errors.ownershipType} />
      )}
      {isNew && (
        <>
          <Field label="Project Name">
            <Input value={form.projectName} onChange={(e) => set("projectName", e.target.value)} placeholder="Industrial Park" maxLength={100} disabled={disabled} />
          </Field>
          <Field label="Builder Name">
            <Input value={form.builderName} onChange={(e) => set("builderName", e.target.value)} placeholder="XYZ Developers" maxLength={100} disabled={disabled} />
          </Field>
          <Sel label="Construction Status" required value={form.constructionStatus} onChange={(v) => set("constructionStatus", v)} options={["Under Construction", "Ready"]} disabled={disabled} error={errors.constructionStatus} />
          <Field label="Possession Date" required error={errors.possessionDate}>
            <Input type="date" value={form.possessionDate} onChange={(e) => set("possessionDate", e.target.value)} disabled={disabled} className={errors.possessionDate ? "border-destructive focus-visible:ring-destructive" : ""} />
          </Field>
        </>
      )}
    </>
  );
}

function ResidentialPlotFields({ form, set, errors, disabled, isNew, isResale }) {
  return (
    <>
      <Field label="Plot Area (sq.ft)" required error={errors.plotAreaSqFt}>
        <NumInput value={form.plotAreaSqFt} onChange={(v) => set("plotAreaSqFt", v)} placeholder="1200" min={1} disabled={disabled} error={!!errors.plotAreaSqFt} />
      </Field>
      <Field label="Plot Length (ft)">
        <NumInput value={form.plotLength} onChange={(v) => set("plotLength", v)} placeholder="40" min={1} disabled={disabled} />
      </Field>
      <Field label="Plot Width (ft)">
        <NumInput value={form.plotWidth} onChange={(v) => set("plotWidth", v)} placeholder="30" min={1} disabled={disabled} />
      </Field>
      <Sel label="Facing" value={form.facing} onChange={(v) => set("facing", v)} options={FACING_OPTIONS} disabled={disabled} />
      <Sel label="Zone Type" value={form.zoneType} onChange={(v) => set("zoneType", v)} options={["Residential", "Mixed Use"]} disabled={disabled} />
      <Field label="Road Width (ft)">
        <NumInput value={form.roadWidth} onChange={(v) => set("roadWidth", v)} placeholder="30" min={1} disabled={disabled} />
      </Field>
      <Field label="FSI Available">
        <NumInput value={form.fsiAvailable} onChange={(v) => set("fsiAvailable", v)} placeholder="1.5" min={0} step="0.01" disabled={disabled} />
      </Field>
      <div className="sm:col-span-2 lg:col-span-3">
        <MultiCheckbox label="Approved By" options={APPROVED_BY_OPTIONS} selected={form.approvedBy} onChange={(v) => set("approvedBy", v)} disabled={disabled} />
      </div>
      <ToggleRow label="Boundary Wall" checked={form.boundaryWall} onChange={(v) => set("boundaryWall", v)} disabled={disabled} />
      <ToggleRow label="Gated Layout" checked={form.gatedLayout} onChange={(v) => set("gatedLayout", v)} disabled={disabled} />
      <ToggleRow label="Corner Plot" checked={form.cornerPlot} onChange={(v) => set("cornerPlot", v)} disabled={disabled} />
      {isResale && (
        <Sel label="Ownership Type" required value={form.ownershipType} onChange={(v) => set("ownershipType", v)} options={["Freehold", "Leasehold"]} disabled={disabled} error={errors.ownershipType} />
      )}
      {isNew && (
        <>
          <Field label="Layout Project Name" required error={errors.layoutProjectName}>
            <Input value={form.layoutProjectName} onChange={(e) => set("layoutProjectName", e.target.value)} placeholder="Green Meadows Layout" maxLength={100} disabled={disabled} className={errors.layoutProjectName ? "border-destructive focus-visible:ring-destructive" : ""} />
          </Field>
          <Field label="Builder Name" required error={errors.builderName}>
            <Input value={form.builderName} onChange={(e) => set("builderName", e.target.value)} placeholder="ABC Developers" maxLength={100} disabled={disabled} className={errors.builderName ? "border-destructive focus-visible:ring-destructive" : ""} />
          </Field>
          <Field label="RERA Number" required error={errors.reraNumber}>
            <Input value={form.reraNumber} onChange={(e) => set("reraNumber", e.target.value)} placeholder="P52100123456" disabled={disabled} className={errors.reraNumber ? "border-destructive focus-visible:ring-destructive" : ""} />
          </Field>
          <Field label="Project RERA Number" required error={errors.projectReraNumber}>
            <Input value={form.projectReraNumber} onChange={(e) => set("projectReraNumber", e.target.value)} placeholder="Project RERA (optional)" disabled={disabled} className={errors.projectReraNumber ? "border-destructive focus-visible:ring-destructive" : ""} />
          </Field>
          <Field label="Total Plots in Layout">
            <NumInput value={form.totalPlotsInLayout} onChange={(v) => set("totalPlotsInLayout", v)} placeholder="200" min={1} disabled={disabled} />
          </Field>
          <Field label="Plots Available">
            <NumInput value={form.plotsAvailable} onChange={(v) => set("plotsAvailable", v)} placeholder="50" min={0} disabled={disabled} />
          </Field>
          <Sel label="Development Status" required value={form.developmentStatus} onChange={(v) => set("developmentStatus", v)} options={DEVELOPMENT_STATUS_OPTIONS} disabled={disabled} error={errors.developmentStatus} />
        </>
      )}
    </>
  );
}

function AgriculturalLandFields({ form, set, errors, disabled }) {
  return (
    <>
      <Field label="Area (Acres)" required error={errors.areaAcres}>
        <NumInput value={form.areaAcres} onChange={(v) => set("areaAcres", v)} placeholder="5" min={0.01} step="0.01" disabled={disabled} error={!!errors.areaAcres} />
      </Field>
      <Field label="Area (Hectares)" hint="Auto-calculated">
        <NumInput value={form.areaHectares} onChange={(v) => set("areaHectares", v)} placeholder="2.02" min={0.01} step="0.01" disabled={disabled} />
      </Field>
      <Field label="Distance from City (km)">
        <NumInput value={form.distanceFromCity} onChange={(v) => set("distanceFromCity", v)} placeholder="10" min={0} disabled={disabled} />
      </Field>
      <Sel label="Road Type" value={form.roadType} onChange={(v) => set("roadType", v)} options={ROAD_TYPES} disabled={disabled} />
      <Sel label="Irrigation Type" value={form.irrigationType} onChange={(v) => set("irrigationType", v)} options={IRRIGATION_TYPES} disabled={disabled} />
      <Sel label="Soil Type" value={form.soilType} onChange={(v) => set("soilType", v)} options={SOIL_TYPES} disabled={disabled} />
      <Sel label="Ownership Type" required value={form.ownershipType} onChange={(v) => set("ownershipType", v)} options={["Individual", "Joint", "Family"]} disabled={disabled} error={errors.ownershipType} />
      <div className="sm:col-span-2 lg:col-span-3">
        <MultiCheckbox label="Water Source" options={WATER_SOURCE_OPTIONS} selected={form.waterSource} onChange={(v) => set("waterSource", v)} disabled={disabled} />
      </div>
      <Field label="Trees / Plantation" hint="Max 100 characters">
        <Input value={form.treesPlantation} onChange={(e) => set("treesPlantation", e.target.value)} placeholder="e.g. Mango, Teak" maxLength={100} disabled={disabled} />
      </Field>
      <ToggleRow label="Road Access" checked={form.roadAccess} onChange={(v) => set("roadAccess", v)} disabled={disabled} />
      <ToggleRow label="Fencing" checked={form.fencing} onChange={(v) => set("fencing", v)} disabled={disabled} />
      <ToggleRow label="Electricity" checked={form.electricityLand} onChange={(v) => set("electricityLand", v)} disabled={disabled} />
      <ToggleRow label="7/12 Extract Available" checked={form.sevenTwelveExtract} onChange={(v) => set("sevenTwelveExtract", v)} disabled={disabled} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function DetailsSection({ form, set, errors = {}, disabled }) {
  const lc = form.listingCategory;
  const pt = form.propertyType;

  if (!lc || !pt) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Property Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Select listing category and property type above.</p>
        </CardContent>
      </Card>
    );
  }

  const isResale = lc === "Resale";
  const isRental = lc === "Rental";
  const isNew = lc === "New";

  const sharedProps = { form, set, errors, disabled, isNew, isResale, isRental };

  const fieldsByType = {
    "Flat/Apartment":              <FlatFields {...sharedProps} />,
    "Builder Floor":               <BuilderFloorFields {...sharedProps} />,
    "Penthouse":                   <PenthouseFields {...sharedProps} />,
    "Villa/Independent House":     <VillaFields {...sharedProps} />,
    "Office Space":                <OfficeFields {...sharedProps} />,
    "Shop":                        <ShopFields {...sharedProps} />,
    "Showroom":                    <ShowroomFields {...sharedProps} />,
    "Warehouse/Godown":            <WarehouseFields {...sharedProps} />,
    "Residential Plot":            <ResidentialPlotFields {...sharedProps} />,
    "Agricultural Land":           <AgriculturalLandFields form={form} set={set} errors={errors} disabled={disabled} />,
  };

  const fields = fieldsByType[pt] ?? null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Property Details
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            {pt} · {lc}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {fields}
        </div>
      </CardContent>
    </Card>
  );
}