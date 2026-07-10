import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import Waitlist from '@/server/src/models/waitlist.model.js';

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, source } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email address is required' },
        { status: 400 }
      );
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Check if email already exists
    const existing = await Waitlist.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { success: true, message: 'Email already registered', data: existing }
      );
    }

    const subscriber = await Waitlist.create({
      email: email.toLowerCase(),
      source: source || 'coming-soon'
    });

    return NextResponse.json(
      { success: true, message: 'Thank you! You have been added to the waitlist.', data: subscriber },
      { status: 201 }
    );
  } catch (err) {
    console.error('[API Waitlist] Error registering subscriber:', err.message);
    return NextResponse.json(
      { success: false, message: 'Registration failed. Please try again later.' },
      { status: 500 }
    );
  }
}
