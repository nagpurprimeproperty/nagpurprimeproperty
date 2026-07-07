'use client'
import React, { memo } from 'react'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'

export const propertyTypes = [
  'Flat/Apartment',
  'Villa/Independent House',
  'Builder Floor',
  'Penthouse',
  'Office Space',
  'Shop',
  'Showroom',
  'Warehouse/Godown',
  'Residential Plot',
  'Agricultural Land',
]
export const bhkOptions = [1, 2, 3, 4]
export const amenitiesList = [
  'Parking (4-wheeler)',
  'Parking (2-wheeler)',
  'Lift/Elevator',
  '24x7 Security',
  'CCTV Surveillance',
  'Power Backup',
  'Gym/Fitness Centre',
  'Swimming Pool',
  'Garden/Park',
]
export const listingCategories = ['Resale', 'Rental', 'New']

// ── Chip Helper ───────────────────────────────────────────────────────────────
function Chip({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-background hover:border-primary hover:text-primary'
      }`}
    >
      {children}
    </button>
  )
}

export const PropertyFilters = memo(function PropertyFilters({
  budget,
  handleBudget,
  listingCategory,
  handleListingCategory,
  type,
  handleType,
  bhk,
  handleBhk,
  area,
  handleArea,
  areas = [],
  selectedAmenities,
  handleAmenities,
  reset,
}) {
  return (
    <div className="space-y-6">
      {/* Budget */}
      <div>
        <label className="text-sm font-semibold">Budget</label>
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>₹{budget[0]}L</span>
          <span>{budget[1] >= 200 ? '₹200L+' : `₹${budget[1]}L`}</span>
        </div>
        <Slider
          min={0}
          max={200}
          step={5}
          value={budget}
          onValueChange={handleBudget}
          className="mt-3"
        />
      </div>

      {/* Listing Type */}
      <div>
        <label className="text-sm font-semibold">Listing Type</label>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {listingCategories.map((cat) => (
            <Chip
              key={cat}
              active={listingCategory === cat}
              onClick={() => handleListingCategory(listingCategory === cat ? null : cat)}
            >
              {cat}
            </Chip>
          ))}
        </div>
      </div>

      {/* Property Type */}
      <div>
        <label className="text-sm font-semibold">Property Type</label>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {propertyTypes.map((t) => (
            <Chip
              key={t}
              active={type === t}
              onClick={() => handleType(type === t ? null : t)}
            >
              {t}
            </Chip>
          ))}
        </div>
      </div>

      {/* BHK */}
      <div>
        <label className="text-sm font-semibold">BHK</label>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {bhkOptions.map((b) => (
            <Chip
              key={b}
              active={bhk === b}
              onClick={() => handleBhk(bhk === b ? null : b)}
            >
              {b} BHK
            </Chip>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="text-sm font-semibold">Location</label>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {areas.map((a) => (
            <Chip
              key={a.slug}
              active={area === a.slug}
              onClick={() => handleArea(area === a.slug ? null : a.slug)}
            >
              {a.name}
            </Chip>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div>
        <label className="text-sm font-semibold">Amenities</label>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {amenitiesList.map((amenity) => {
            const active = selectedAmenities.includes(amenity)
            return (
              <Chip
                key={amenity}
                active={active}
                onClick={() =>
                  handleAmenities(
                    active
                      ? selectedAmenities.filter((x) => x !== amenity)
                      : [...selectedAmenities, amenity]
                  )
                }
              >
                {amenity}
              </Chip>
            )
          })}
        </div>
      </div>

      <Button variant="outline" className="w-full cursor-pointer" onClick={reset}>
        Reset Filters
      </Button>
    </div>
  )
})
