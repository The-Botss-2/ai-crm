import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Lead from '@/model/Lead';
import { checkTeamWritePermission } from '@/lib/checkTeamWritePermission';

export async function GET(req: NextRequest) {
    await connectToDatabase();
    const id = new URL(req.url).searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });

    const lead = await Lead.findById(id);
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

    return NextResponse.json(lead);
}

export const DELETE = async (req: NextRequest) => {
    await connectToDatabase();
    const teamId = req.nextUrl.searchParams.get('team-id')
    const userId = req.nextUrl.searchParams.get('user-id')

    if (!teamId || !userId) {
        return NextResponse.json({ error: 'Team ID and User ID are required' }, { status: 400 });
    }

    try {
        await checkTeamWritePermission(teamId, userId);
    } catch (error) {
        return NextResponse.json({ error: (error instanceof Error ? error.message : 'An unknown error occurred') }, { status: 403 });
    }

    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });

    await Lead.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Lead deleted' });
};

export const PATCH = async (req: NextRequest) => {

    const teamId = new URL(req.url).searchParams.get('team');
    const userId = new URL(req.url).searchParams.get('user');

  

    if (!teamId || !userId) {
        return NextResponse.json({ error: 'Team ID and User ID are required' }, { status: 400 });
    }

    try {
        await checkTeamWritePermission(teamId, userId);
    } catch (error) {
        return NextResponse.json({ error: (error instanceof Error ? error.message : 'An unknown error occurred') }, { status: 403 });
    }
    await connectToDatabase();
    const { _id, name, email, phone, company, status, source, notes } = await req.json();



    if (!_id) return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });

    const updated = await Lead.findByIdAndUpdate(_id, {
        _id, name, email, phone, company, status, source, notes
    }, { new: true });

    return NextResponse.json(updated);
};
