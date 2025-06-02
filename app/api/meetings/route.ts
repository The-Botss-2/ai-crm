import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Meeting from '@/model/Meeting';
import { checkTeamWritePermission } from '@/lib/checkTeamWritePermission';
import { auth } from '@/auth'; // Adjust path if needed

// GET /api/meetings?team=teamId (optional filtering)
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get('team');

    let meetings;
    if (teamId) {
      meetings = await Meeting.find({ teamId }).sort({ createdAt: -1 });
    } else {
      meetings = await Meeting.find().sort({ createdAt: -1 });
    }

    return NextResponse.json(meetings);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/meetings
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = session.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID is missing' }, { status: 400 });
    }

    const body = await req.json();

    if (!body.teamId) {
      return NextResponse.json({ error: 'teamId is required' }, { status: 400 });
    }

    await connectToDatabase();

    const hasWritePermission = await checkTeamWritePermission(body.teamId, userId);
    if (!hasWritePermission) {
      return NextResponse.json({ error: 'Read-only access. Write permission denied.' }, { status: 403 });
    }

    const meeting = await Meeting.create({
      ...body,
      createdBy: userId,
    });

    return NextResponse.json(meeting, { status: 201 });
  } catch (err: any) {
    console.log("MSLAAA=>", { err })
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
