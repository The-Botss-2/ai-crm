// app/api/auth/signup/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Credentials from '@/model/Credentials';
import Profile from '@/model/Profile';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs'; 
export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();
    await connectToDatabase();

    const existing = await Credentials.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await Credentials.create({ email, password: hashedPassword });

    let profile = await Profile.findOne({ email });
    if (!profile) {
      profile = await Profile.create({ email, name });
    }

    return NextResponse.json({ user: profile }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}