import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import Team from '@/model/Team';

export async function GET(req: NextRequest) {
  await connectToDatabase();
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const teamId = req.nextUrl.searchParams.get('teamId');
  if (!teamId) return NextResponse.json({ error: 'teamId is required' }, { status: 400 });

  const team = await Team.findById(teamId);
  if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });

  return NextResponse.json({ team });
}

export async function PATCH(req: NextRequest) {
  await connectToDatabase();
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { teamId, name } = body;

  if (!teamId || !name) return NextResponse.json({ error: 'teamId and name are required' }, { status: 400 });

  const team = await Team.findById(teamId);
  if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });

  // Optionally, check if session.user.id === team.createdBy for permission

  team.name = name;
  await team.save();

  return NextResponse.json({ team });
}
