import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Meeting from '@/model/Meeting';
import { auth } from '@/auth';
import { checkTeamWritePermission } from '@/lib/checkTeamWritePermission';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing meeting id' }, { status: 400 });

    const meeting = await Meeting.findById(id);
    if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });

    return NextResponse.json(meeting);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = session.user?.id;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing meeting id' }, { status: 400 });

    await connectToDatabase();

    const meeting = await Meeting.findById(id);
    if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });

    const hasWrite = await checkTeamWritePermission(meeting.teamId.toString(), userId);
    if (!hasWrite) return NextResponse.json({ error: 'Read-only access' }, { status: 403 });

    const updates = await req.json();
    const updated = await Meeting.findByIdAndUpdate(id, updates, { new: true });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = session.user?.id;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing meeting id' }, { status: 400 });

    await connectToDatabase();

    const meeting = await Meeting.findById(id);
    if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });

    const hasWrite = await checkTeamWritePermission(meeting.teamId.toString(), userId);
    if (!hasWrite) return NextResponse.json({ error: 'Read-only access' }, { status: 403 });

    await Meeting.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Meeting deleted successfully' });
  } catch (err: any) {
    console.log("ERRRRR", { err })
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
