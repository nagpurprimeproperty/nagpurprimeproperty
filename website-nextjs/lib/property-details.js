import {
  Bed,
  Maximize,
  Sofa,
  Compass,
  Building2,
  Sparkles,
} from 'lucide-react'

export function getDetailsList(p) {
  const details = p.details || {}
  const pricing = p.pricing || {}
  const type = p.propertyType || p.type || ''
  const category = p.listingCategory || p.category || ''

  // 1. Key Overview Highlights
  const highlights = []
  
  // BHK / Bedrooms
  const bhkVal = details.bhk || p.bhk
  if (bhkVal) {
    highlights.push({ icon: Bed, label: 'Bedrooms', value: `${bhkVal} BHK` })
  }

  // Size / Area
  const areaVal = details.superBuiltUpArea || details.builtUpArea || details.carpetArea || details.plotArea || details.plotAreaSqFt || p.sqft || p.area
  if (areaVal) {
    const areaLabel = details.superBuiltUpArea ? 'Super Area' : (details.builtUpArea ? 'Built-up Area' : (details.plotArea || details.plotAreaSqFt ? 'Plot Area' : 'Area'))
    highlights.push({ icon: Maximize, label: areaLabel, value: typeof areaVal === 'number' ? `${areaVal} sqft` : areaVal })
  }

  // Furnishing
  const furnVal = details.furnishing || p.furnishing
  if (furnVal && furnVal !== 'N/A') {
    highlights.push({ icon: Sofa, label: 'Furnishing', value: furnVal })
  }

  // Facing
  const faceVal = details.facing || p.facing
  if (faceVal && faceVal !== 'N/A') {
    highlights.push({ icon: Compass, label: 'Facing', value: faceVal })
  }

  // Property Type
  if (type) {
    highlights.push({ icon: Building2, label: 'Property Type', value: type })
  }

  // Listing Category
  if (category) {
    highlights.push({ icon: Sparkles, label: 'Listing Category', value: category })
  }

  // Age of Property
  const ageVal = details.ageOfProperty || p.ageOfProperty
  if (ageVal) {
    highlights.push({ icon: Sparkles, label: 'Property Age', value: ageVal })
  }

  // Construction Status / Possession Date
  const constStatus = p.constructionStatus || details.constructionStatus
  if (constStatus) {
    highlights.push({ icon: Building2, label: 'Construction', value: constStatus })
  }

  // 2. Comprehensive Details List (Key-Value table)
  const specsTable = []

  // Add details properties
  if (details.bathrooms) specsTable.push({ label: 'Bathrooms', value: details.bathrooms })
  if (details.balconies) specsTable.push({ label: 'Balconies', value: details.balconies })
  if (details.floorNumber !== undefined && details.floorNumber !== null) {
    specsTable.push({ label: 'Floor Level', value: `Floor ${details.floorNumber} of ${details.totalFloors || 'N/A'}` })
  }
  if (details.floorType) specsTable.push({ label: 'Floor Type', value: details.floorType })
  if (details.waterSupply) specsTable.push({ label: 'Water Supply', value: details.waterSupply })
  if (details.electricityStatus) specsTable.push({ label: 'Electricity Status', value: details.electricityStatus })
  if (details.ownershipType) specsTable.push({ label: 'Ownership Type', value: details.ownershipType })
  if (details.plotLength && details.plotWidth) specsTable.push({ label: 'Plot Dimensions', value: `${details.plotLength} × ${details.plotWidth} ft` })
  
  // Commercial specifications
  if (details.cabinCount !== undefined) specsTable.push({ label: 'Cabin Count', value: details.cabinCount })
  if (details.openDesks !== undefined) specsTable.push({ label: 'Open Seats', value: details.openDesks })
  if (details.dgBackup !== undefined) specsTable.push({ label: 'Power Backup', value: details.dgBackup ? 'Yes (DG Backup)' : 'No' })
  if (details.warehouseHeight) specsTable.push({ label: 'Ceiling Height', value: `${details.warehouseHeight} ft` })
  if (details.midc !== undefined) specsTable.push({ label: 'MIDC Approved', value: details.midc ? 'Yes' : 'No' })
  if (details.roadAccess !== undefined) specsTable.push({ label: 'Road Access', value: details.roadAccess ? 'Yes' : 'No' })
  if (details.soilType) specsTable.push({ label: 'Soil Type', value: details.soilType })

  // RERA registration
  if (p.reraRegistered) specsTable.push({ label: 'RERA Registered', value: 'Yes' })
  if (p.reraNumber) specsTable.push({ label: 'RERA Number', value: p.reraNumber })
  if (p.projectName) specsTable.push({ label: 'Project Name', value: p.projectName })
  if (p.builderName) specsTable.push({ label: 'Builder', value: p.builderName })

  // Financial breakdown
  const financeTable = []
  if (category === 'Rental' || type === 'Rental') {
    if (pricing.monthlyRent) financeTable.push({ label: 'Monthly Rent', value: `₹${pricing.monthlyRent.toLocaleString('en-IN')}` })
    if (pricing.securityDeposit) financeTable.push({ label: 'Security Deposit', value: `₹${pricing.securityDeposit.toLocaleString('en-IN')}` })
    if (pricing.maintenance) financeTable.push({ label: 'Maintenance Charges', value: `₹${pricing.maintenance.toLocaleString('en-IN')}/month` })
    if (pricing.leaseDuration) financeTable.push({ label: 'Lease Duration', value: pricing.leaseDuration })
    if (pricing.lockInPeriod) financeTable.push({ label: 'Lock-in Period', value: pricing.lockInPeriod })
    if (pricing.preferredTenants && pricing.preferredTenants.length > 0) {
      financeTable.push({ label: 'Preferred Tenants', value: pricing.preferredTenants.join(', ') })
    }
  } else {
    const salePrice = pricing.totalPrice || pricing.startingPrice || p.price
    if (salePrice) financeTable.push({ label: 'Selling Price', value: `₹${salePrice.toLocaleString('en-IN')}` })
    if (pricing.pricePerSqft) financeTable.push({ label: 'Price per Sqft', value: `₹${pricing.pricePerSqft.toLocaleString('en-IN')}/sqft` })
    if (pricing.bookingAmount) financeTable.push({ label: 'Booking Amount', value: `₹${pricing.bookingAmount.toLocaleString('en-IN')}` })
    if (pricing.gstApplicable !== undefined) financeTable.push({ label: 'GST Applicable', value: pricing.gstApplicable ? 'Yes' : 'No' })
    if (pricing.possessionTimeline) financeTable.push({ label: 'Possession Timeline', value: pricing.possessionTimeline })
  }
  if (pricing.brokerage) financeTable.push({ label: 'Brokerage terms', value: pricing.brokerage })

  return { highlights, specsTable, financeTable }
}
