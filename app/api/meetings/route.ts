import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Meeting from '@/model/Meeting';
import { checkTeamWritePermission } from '@/lib/checkTeamWritePermission';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get('team');

    if (!teamId) {
      return NextResponse.json({ error: 'teamId is required' }, { status: 400 });
    }

    await connectToDatabase();

    const meetings = await Meeting.find({
      teamId,
      createdBy: session.user.id,
    }).sort({ createdAt: -1 });

    return NextResponse.json(meetings);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


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
