import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Organization from '@/model/Organization';
import { auth } from '@/auth';

// GET: Fetch organizations for the authenticated user
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Fetch organizations created by the logged-in user
    const organizations = await Organization.find({ userId: session.user.id }).sort({ createdAt: -1 });

    return NextResponse.json(organizations);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Create a new organization
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    if (!body.name || !body.description || !body.address || !body.contactEmail || !body.contactPhone) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    await connectToDatabase();
    const alreadyExist = await Organization.findOne({ contactEmail: body.contactEmail });
    if (alreadyExist) {
      return NextResponse.json({ error: 'Organization already exist with this email' }, { status: 400 });
    }
    const newOrganization = new Organization({
      ...body,
      userId: session.user.id,
      createdBy: session.user.id,
    });

    await newOrganization.save();

    return NextResponse.json(newOrganization, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


