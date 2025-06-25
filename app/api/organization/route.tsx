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

    if (!body.name || !body.contactPhone || !body.Number_of_Employees) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    await connectToDatabase();
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

// PATCH: Update an existing organization
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    const body = await req.json();
    const {  name, description, address, contactPhone, Number_of_Employees , country, website} = body;

    if (!id) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    // Find the organization and ensure it belongs to the user
    const organization = await Organization.findOne({ _id: id, userId: session.user.id });
    if (!organization) {
      return NextResponse.json({ error: 'Organization not found or unauthorized' }, { status: 404 });
    }

    // Update fields if they are provided
    if (name !== undefined) organization.name = name;
    if (description !== undefined) organization.description = description;
    if (address !== undefined) organization.address = address;
    if (contactPhone !== undefined) organization.contactPhone = contactPhone;
    if (Number_of_Employees !== undefined) organization.Number_of_Employees = Number_of_Employees;
    if (country !== undefined) organization.country = country;
    if (website !== undefined) organization.website = website;

    await organization.save();

    return NextResponse.json(organization);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


