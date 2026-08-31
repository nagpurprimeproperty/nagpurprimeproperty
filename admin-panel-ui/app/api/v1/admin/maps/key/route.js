import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_MAPS_KEY ||
    '';

  return NextResponse.json({
    success: true,
    key: apiKey,
    data: { key: apiKey },
  });
}
