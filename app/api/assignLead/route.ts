import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Lead from '@/model/Lead';

export async function PUT(req: NextRequest) {
  await connectToDatabase();

  // Extract query parameters
  const { leadId, userId } = await req.json();
  // Validate if parameters are provided
  if (!leadId || !userId) {
    return NextResponse.json({ error: 'Lead ID, Team ID, and User ID are required' }, { status: 400 });
  }

  try {
    // Find the lead by ID
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found', success: false }, { status: 404 });
    }

    // Update the lead with the assigned user and team
    lead.assignedTo = userId;  // Assign user
    await lead.save();

    return NextResponse.json({ message: 'Lead successfully assigned', lead, success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({success: false, error: (error as Error).message }, { status: 403 });
  }
}
