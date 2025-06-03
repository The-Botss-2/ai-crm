import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import Profile from '@/model/Profile';

export async function GET(req: NextRequest) {
  await connectToDatabase();
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await Profile.findById(session?.user?.id,).select('name email');
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest) {
  await connectToDatabase();
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { name } = body;

  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  const updatedUser = await Profile.findByIdAndUpdate(session?.user?.id, { name }, { new: true });
  if (!updatedUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  return NextResponse.json({ user: updatedUser });
}
