import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Lead from '@/model/Lead';
import { checkTeamWritePermission } from '@/lib/checkTeamWritePermission';

export async function GET(req: NextRequest) {
  await connectToDatabase();
  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get('team');
  const search = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const order = searchParams.get('order') === 'asc' ? 1 : -1;

  if (!teamId) {
    return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
  }

  const leads = await Lead.find({
    teamId: teamId,
    $or: [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ],
  }).sort({ [sortBy]: order });

  return NextResponse.json(leads);
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
