import { NextResponse, NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Team from '@/model/Team';
import Profile from '@/model/Profile';
import { auth } from '@/auth';
import axios from 'axios';

export async function GET(req: NextRequest) {
    await connectToDatabase();

    const id = req.nextUrl.searchParams.get('id')
    try {
        const team = await Team.findById(id).populate({
            path: 'members.id',
            model: Profile,
            select: 'name email image',
        });

        if (!team) {
            return NextResponse.json({ success: false, error: 'Team not found.' }, { status: 404 });
        }

        const populatedMembers = team.members.map((m: any) => ({
            profile: m.id,
            role: m.role,
            access: m.access
        }));

        return NextResponse.json({
            success: true,
            team: {
                _id: team._id,
                name: team.name,
                agent: team.agent,
                teamAccess: team?.teamAccess || null,
                logo: team.logo,
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

export async function POST(req: Request) {
    await connectToDatabase();

    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  

    const body = await req.json();
    const { name,teamAccess } = body;
    

    try {
        const team = await Team.create({
            name,
            createdBy: session.user.id,
            teamAccess,
            members: [
                { id: session.user.id, role: 'admin' }
            ]
        });

        const agentResponse = await axios.post(`${process.env.NEXT_PUBLIC_CALLING_AGENT_URL}/api/create-agent`, {
            user_id: session.user.id,
            team_id: team._id.toString()
        });

        const agent = agentResponse.data.agent_id;
        team.agent = agent;
        await team.save();
        const existingBot = await Profile.findOne({ email: `${team._id}@bot.com` });
        if (!existingBot) {
            const botProfile = await Profile.create({
                name: `${name}-Bot`,
                email: `${team._id}@bot.com`,
            });

            team.members.push({ id: botProfile?._id, role: 'bot' });
            await team.save();
        }
        return NextResponse.json({ team }, { status: 201 });
    } catch (err:any) {
        console.error(err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    await connectToDatabase();
    const teamId = req.nextUrl.searchParams.get('id')
    const { requesterId } = await req.json();

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

export async function PATCH(req: NextRequest) {
    await connectToDatabase();

    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teamId = req.nextUrl.searchParams.get('teamId');
    if (!teamId) {
        return NextResponse.json({ error: 'teamId is required' }, { status: 400 });
    }

    try {
        const team = await Team.findById(teamId);
        if (!team) {
            return NextResponse.json({ success: false, error: 'Team not found' }, { status: 404 });
        }

        if (team.createdBy.toString() !== session.user?.id) {
            return NextResponse.json({ success: false, error: 'Only team admin can update team details' }, { status: 403 });
        }

        const body = await req.json();
        const { name, logo } = body;

        if (!name && !logo) {
            return NextResponse.json({ success: false, error: 'At least one field (name or logo) is required' }, { status: 400 });
        }

        // Update fields if provided
        if (name) team.name = name;
        if (logo) team.logo = logo;

        await team.save();

        return NextResponse.json({
            success: true,
            message: 'Team updated successfully',
            team
        });

    } catch (err) {
        console.error('Team update error:', err);
        return NextResponse.json({
            success: false,
            error: 'Failed to update team'
        }, { status: 500 });
    }
}


export async function PUT(req: NextRequest) {
  await connectToDatabase();

  try {
    const { requesterId, teamId, name, access } = await req.json();

    if (!requesterId || !teamId || !name) {
      return NextResponse.json({ success: false, error: 'Missing fields.' }, { status: 400 });
    }

    const team = await Team.findById(teamId);
    if (!team) return NextResponse.json({ success: false, error: 'Team not found.' }, { status: 404 });

    if (team.createdBy.toString() !== requesterId) {
      return NextResponse.json({ success: false, error: 'Only admin can update Teams.' }, { status: 403 });
    }

    team.name = name;
    team.teamAccess = {
      dashboard: access.dashboard || team.teamAccess.dashboard || 'none',
      leads: access.leads || team.teamAccess.leads || 'none',
      meetings: access.meetings || team.teamAccess.meetings || 'none',
      tasks: access.tasks || team.teamAccess.tasks || 'none',
      categories: access.categories || team.teamAccess.categories || 'none',
      products: access.products || team.teamAccess.products || 'none',
      forms: access.forms || team.teamAccess.forms || 'none',
      campaigns: access.campaigns || team.teamAccess.campaigns || 'none',
      teams: access.teams || team.teamAccess.teams || 'none',
      analytics: access.analytics || team.teamAccess.analytics || 'none',
      knowledge_base: access.knowledge_base || team.teamAccess.knowledge_base || 'none',
      widget_snippet: access.widget_snippet || team.teamAccess.widget_snippet || 'none',
    };
    await team.save();

    return NextResponse.json({ success: true, message: 'Team updated.' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'Update failed.' }, { status: 500 });
  }
}