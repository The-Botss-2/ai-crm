import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Lead from '@/model/Lead';
import { checkTeamWritePermission } from '@/lib/checkTeamWritePermission';
import { auth } from '@/auth';
import Team from '@/model/Team';

export async function GET(req: NextRequest) {
  await connectToDatabase();
  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get('team');
  const search = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const order = searchParams.get('order') === 'asc' ? 1 : -1;
try{
   const session = await auth()
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session?.user?.id || ''
  const team = await Team.findById(teamId);

  if (!team) {
    throw new Error('Team not found');
  }

  const member = team.members.find((m: any) => m.id.toString() === userId.toString());

  if (!member) {
    throw new Error('User is not a member of this team');
  }

  if (!teamId) {
    return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
  }

  let leads = await Lead.find({ teamId }).sort({ [sortBy]: order }).populate('assignedTo', '_id name email');
  console.log(leads,'leads');
  
  // Filter leads based on assignedTo or createdBy matching the userId
  leads = leads.filter((lead) => 
    (lead?.assignedTo?._id && lead.assignedTo?._id.toString() === userId.toString()) || (lead.createdBy.toString() === userId.toString())
  );
  return NextResponse.json(leads);
} catch (error) {
  return NextResponse.json({ error: (error as Error).message }, { status: 403 });
  
}
}

export const POST = async (req: NextRequest) => {
  await connectToDatabase();
  const teamId = new URL(req.url).searchParams.get('team');
  const userId = new URL(req.url).searchParams.get('user');

  if (!teamId || !userId) {
    return NextResponse.json({ error: 'Team ID and User ID are required' }, { status: 400 });
  }

  try {
    await checkTeamWritePermission(teamId, userId);
    const { name, email, phone, company, notes, source, status } = await req.json();

    const isAlreadyExist = await Lead.findOne({ email, teamId });
    
    if (isAlreadyExist) {
      return NextResponse.json({ error: 'Lead already exists with this email' }, { status: 400 });
    }

    const payload = {
      teamId,
      name,
      email,
      phone,
      company,
      assignedUserId: userId,
      createdBy: userId,
      notes,
      source,
      status
    }


    const newLead = await Lead.create(payload);
    return NextResponse.json(newLead, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 403 });
  }
};
