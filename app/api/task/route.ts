import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import Task from '@/model/Task';
import { checkTeamWritePermission } from '@/lib/checkTeamWritePermission';

export async function GET(req: NextRequest) {
  await connectToDatabase();
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const task = await Task.findById(id);
  return NextResponse.json(task);
}

export async function PATCH(req: NextRequest) {
  await connectToDatabase();
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const updates = await req.json();
  const teamId = updates.teamId;

  const userId = session.user?.id;
  if (!userId) return NextResponse.json({ error: 'User ID is missing' }, { status: 400 });

  const hasPermission = await checkTeamWritePermission(teamId, userId);
  if (!hasPermission) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const updated = await Task.findByIdAndUpdate(id, updates, { new: true });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  await connectToDatabase();
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const task = await Task.findById(id);
  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

  const userId = session.user?.id;
  if (!userId) return NextResponse.json({ error: 'User ID is missing' }, { status: 400 });

  const hasPermission = await checkTeamWritePermission(task.teamId, userId);
  if (!hasPermission) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await Task.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
