import { NextResponse, NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Team from '@/model/Team';
import Profile from '@/model/Profile';

// GET /api/team?id=[id] — return team info with populated members
export async function GET(req: NextRequest) {
    await connectToDatabase();

    const id = req.nextUrl.searchParams.get('id')
    try {
        const team = await Team.findById(id).populate({
            path: 'members.id',
            model: Profile,
            select: 'name email image', // you can add more fields if needed
        });

        if (!team) {
            return NextResponse.json({ success: false, error: 'Team not found.' }, { status: 404 });
        }

        // Convert members to include both profile and role
        const populatedMembers = team.members.map((m: any) => ({
            profile: m.id,
            role: m.role,
        }));

        return NextResponse.json({
            success: true,
            team: {
                _id: team._id,
                name: team.name,
                createdBy: team.createdBy,
                members: populatedMembers,
                createdAt: team.createdAt,
                updatedAt: team.updatedAt,
            },
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ success: false, error: 'Failed to fetch team.' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    await connectToDatabase();
    try {
        const { name, adminId } = await req.json();
        if (!name || !adminId) {
            return NextResponse.json({ error: 'Missing Name or Admin ID' }, { status: 404 });
        }

        const newTeam = await Team.create({
            name,
            createdBy: adminId,
            members: [{ id: adminId, role: 'admin' }]
        });

        return NextResponse.json({ success: true, team: newTeam });
    } catch (err) {
        return NextResponse.json({ success: false, error: 'Team creation failed.' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    await connectToDatabase();
    const teamId = req.nextUrl.searchParams.get('id')
    const { requesterId } = await req.json(); // You must pass requesterId in DELETE body

    if (!teamId || !requesterId) {
        return NextResponse.json({ success: false, error: 'Missing teamId or requesterId' }, { status: 400 });
    }

    try {
        const team = await Team.findById(teamId);

        if (!team) {
            return NextResponse.json({ success: false, error: 'Team not found' }, { status: 404 });
        }

        if (team.createdBy.toString() !== requesterId) {
            return NextResponse.json({ success: false, error: 'Only the admin can delete this team' }, { status: 403 });
        }

        await Team.findByIdAndDelete(teamId);

        return NextResponse.json({ success: true, message: 'Team deleted successfully' });
    } catch (err) {
        return NextResponse.json({ success: false, error: 'Failed to delete team' }, { status: 500 });
    }
}
