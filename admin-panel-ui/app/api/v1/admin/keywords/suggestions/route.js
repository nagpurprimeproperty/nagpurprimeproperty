import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import Keyword from '@/server/src/models/keyword.model.js';
import { requireAuth, requirePermission } from '@/server/src/middlewares/auth.next.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

// Nagpur-specific smart keyword templates
const KEYWORD_TEMPLATES = [
  // Property Types
  { keyword: 'Flats in Nagpur', redirectUrl: '/properties?type=apartment', category: 'Property Type' },
  { keyword: 'Plots in Nagpur', redirectUrl: '/properties?type=plot', category: 'Property Type' },
  { keyword: 'Villas in Nagpur', redirectUrl: '/properties?type=villa', category: 'Property Type' },
  { keyword: '2 BHK in Nagpur', redirectUrl: '/properties?bhk=2', category: 'Property Type' },
  { keyword: '3 BHK in Nagpur', redirectUrl: '/properties?bhk=3', category: 'Property Type' },
  { keyword: '1 BHK Flat in Nagpur', redirectUrl: '/properties?bhk=1&type=apartment', category: 'Property Type' },
  { keyword: 'Independent House Nagpur', redirectUrl: '/properties?type=house', category: 'Property Type' },
  { keyword: 'Commercial Property Nagpur', redirectUrl: '/properties?type=commercial', category: 'Property Type' },
  // Budget
  { keyword: 'Property Under 20 Lakh Nagpur', redirectUrl: '/properties?maxPrice=2000000', category: 'Budget' },
  { keyword: 'Property Under 50 Lakh Nagpur', redirectUrl: '/properties?maxPrice=5000000', category: 'Budget' },
  { keyword: 'Property Under 1 Crore Nagpur', redirectUrl: '/properties?maxPrice=10000000', category: 'Budget' },
  { keyword: 'Affordable Flats Nagpur', redirectUrl: '/properties?maxPrice=3000000&type=apartment', category: 'Budget' },
  { keyword: 'Luxury Villas Nagpur', redirectUrl: '/properties?type=villa&minPrice=10000000', category: 'Budget' },
  // Intent
  { keyword: 'Buy Property in Nagpur', redirectUrl: '/properties?purpose=sale', category: 'Intent' },
  { keyword: 'Rent Flat in Nagpur', redirectUrl: '/properties?purpose=rent', category: 'Intent' },
  { keyword: 'Invest in Nagpur Real Estate', redirectUrl: '/properties', category: 'Intent' },
  { keyword: 'New Projects in Nagpur', redirectUrl: '/properties?status=new', category: 'Intent' },
  { keyword: 'Ready to Move Flats Nagpur', redirectUrl: '/properties?status=ready', category: 'Intent' },
  // Areas (top localities)
  { keyword: 'Property in MIHAN Nagpur', redirectUrl: '/areas/mihan', category: 'Area' },
  { keyword: 'Wardha Road Property', redirectUrl: '/areas/wardha-road', category: 'Area' },
  { keyword: 'Dighori Property Nagpur', redirectUrl: '/areas/dighori', category: 'Area' },
  { keyword: 'Manish Nagar Property', redirectUrl: '/areas/manish-nagar', category: 'Area' },
  { keyword: 'Besa Property Nagpur', redirectUrl: '/areas/besa', category: 'Area' },
  { keyword: 'Kalamna Property Nagpur', redirectUrl: '/areas/kalamna', category: 'Area' },
  { keyword: 'Hingna Property Nagpur', redirectUrl: '/areas/hingna', category: 'Area' },
  { keyword: 'Wathoda Property Nagpur', redirectUrl: '/areas/wathoda', category: 'Area' },
];

/**
 * GET /api/v1/admin/keywords/suggestions
 * Returns smart keyword suggestions that don't already exist in the DB
 */
export async function GET(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'GET', 'keywords');
    if (permErr) return permErr;

    await connectDB();

    // Fetch existing keywords to exclude duplicates
    const existing = await Keyword.find({}, 'keyword').lean();
    const existingSet = new Set(existing.map((k) => k.keyword.toLowerCase().trim()));

    const suggestions = KEYWORD_TEMPLATES.filter(
      (t) => !existingSet.has(t.keyword.toLowerCase().trim())
    );

    return NextResponse.json({ success: true, data: suggestions });
  } catch (err) {
    return handleApiError(err);
  }
}
