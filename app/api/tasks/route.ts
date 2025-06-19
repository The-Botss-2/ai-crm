import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import Task from '@/model/Task';
import { checkTeamWritePermission } from '@/lib/checkTeamWritePermission';

export async function GET(req: NextRequest) {
  await connectToDatabase();
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const teamId = req.nextUrl.searchParams.get('teamId');
  if (!teamId) return NextResponse.json({ error: 'teamId is required' }, { status: 400 });

  const tasks = await Task.find( {teamId })
  .populate('assignedTo', '_id name email')
  .sort({ createdAt: -1 });
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  await connectToDatabase();
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user?.id;
  if (!userId) return NextResponse.json({ error: 'User ID is missing' }, { status: 400 });


  const body = await req.json();

  const { teamId } = body;
  if (!teamId) return NextResponse.json({ error: 'teamId is required' }, { status: 400 });

  const hasPermission = await checkTeamWritePermission(teamId, userId);
  if (!hasPermission) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const task = await Task.create({
    ...body,
    createdBy: userId,
  });

  return NextResponse.json(task, { status: 201 });
}
