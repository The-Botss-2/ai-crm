import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Category from '@/model/Category';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
  await connectToDatabase();
  const session = await auth();
  if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
  const { name, description, teamId, createdBy } = body;

  if (!name || !teamId) {
    return NextResponse.json({ error: 'Name and Team ID are required' }, { status: 400 });
  }

  const category = await Category.create({ name, description, teamId, createdBy });

  return NextResponse.json(category, { status: 201 });
}

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
        await connectToDatabase();
  const teamId = req.nextUrl.searchParams.get('teamId');
  if (!teamId) return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });

  const categories = await Category.find({ teamId });

  return NextResponse.json(categories);
}
