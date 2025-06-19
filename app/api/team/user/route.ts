import { NextResponse, NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Team from '@/model/Team';
import Profile from '@/model/Profile';

export async function GET(req: NextRequest) {
  await connectToDatabase();

  try {
    const id = req.nextUrl.searchParams.get('id')

    if (!id ) {
        return NextResponse.json({ success: false, error: 'Missing required fields.' }, { status: 400 });
    }
     const teams = await Team.find({ 'members.id': id });
    return NextResponse.json({ success: true, teams });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to fetch teams.' }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const { teamId, requesterId, email, role } = await req.json();

    if (!teamId || !requesterId || !email || !role) {
      return NextResponse.json({ success: false, error: 'Missing required fields.' }, { status: 400 });
    }

    // 1. Validate requester
    const team = await Team.findById(teamId);
    if (!team) {
      return NextResponse.json({ success: false, error: 'Team not found.' }, { status: 404 });
    }

    if (team.createdBy.toString() !== requesterId) {
      return NextResponse.json({ success: false, error: 'Only admin can add members.' }, { status: 403 });
    }

    // 2. Find user by email
    const profile = await Profile.findOne({ email });
    if (!profile) {
      return NextResponse.json({ success: false, error: 'User with this email not found.' }, { status: 404 });
    }

    // 3. Check if already a member
    const alreadyMember = team.members.some((m: { id: { toString: () => any; }; }) => m.id.toString() === profile._id.toString());
    if (alreadyMember) {
      return NextResponse.json({ success: false, error: 'User already a member of this team.' }, { status: 400 });
    }

    // 4. Add new member
    team.members.push({ id: profile._id, role });
    await team.save();

    return NextResponse.json({ success: true, team });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'Failed to add member.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  await connectToDatabase();
  const teamId = req.nextUrl.searchParams.get('id')

  try {
    const { requesterId, email, role } = await req.json();

    if (!requesterId || !email || !role) {
      return NextResponse.json({ success: false, error: 'Missing fields.' }, { status: 400 });
    }

    const team = await Team.findById(teamId);
    if (!team) return NextResponse.json({ success: false, error: 'Team not found.' }, { status: 404 });

    if (team.createdBy.toString() !== requesterId) {
      return NextResponse.json({ success: false, error: 'Only admin can add members.' }, { status: 403 });
    }

    const profile = await Profile.findOne({ email });
    if (!profile) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }

    const already = team.members.some((m: any) => m.id.toString() === profile._id.toString());
    if (already) {
      return NextResponse.json({ success: false, error: 'Already a member.' }, { status: 400 });
    }

    team.members.push({ id: profile._id, role });
    await team.save();

    return NextResponse.json({ success: true, message: 'Member added.' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'Add failed.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  await connectToDatabase();
  const teamId = req.nextUrl.searchParams.get('id')

  try {
    const { requesterId, memberId, role } = await req.json();

    if (!requesterId || !memberId || !role) {
      return NextResponse.json({ success: false, error: 'Missing fields.' }, { status: 400 });
    }

    const team = await Team.findById(teamId);
    if (!team) return NextResponse.json({ success: false, error: 'Team not found.' }, { status: 404 });

    if (team.createdBy.toString() !== requesterId) {
      return NextResponse.json({ success: false, error: 'Only admin can update roles.' }, { status: 403 });
    }

    const member = team.members.find((m: any) => m.id.toString() === memberId);
    if (!member) return NextResponse.json({ success: false, error: 'Member not found.' }, { status: 404 });

    member.role = role;
    await team.save();

    return NextResponse.json({ success: true, message: 'Role updated.' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'Update failed.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  await connectToDatabase();
  const teamId = req.nextUrl.searchParams.get('id')

  try {
    const { requesterId, memberId } = await req.json();

    if (!requesterId || !memberId) {
      return NextResponse.json({ success: false, error: 'Missing fields.' }, { status: 400 });
    }

    const team = await Team.findById(teamId);
    if (!team) return NextResponse.json({ success: false, error: 'Team not found.' }, { status: 404 });

    if (team.createdBy.toString() !== requesterId) {
      return NextResponse.json({ success: false, error: 'Only admin can remove members.' }, { status: 403 });
    }

    const originalLength = team.members.length;
    team.members = team.members.filter((m: any) => m.id.toString() !== memberId);

    if (team.members.length === originalLength) {
      return NextResponse.json({ success: false, error: 'Member not found.' }, { status: 404 });
    }

    await team.save();
    return NextResponse.json({ success: true, message: 'Member removed.' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'Remove failed.' }, { status: 500 });
  }
}

