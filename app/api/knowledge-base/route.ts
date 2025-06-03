import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import KnowledgeBase from '@/model/KnowledgeBase';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const team_id = searchParams.get('team_id');

    if (!team_id) {
        return NextResponse.json({ error: 'Missing team_id' }, { status: 400 });
    }

    await connectToDatabase();
    const entry = await KnowledgeBase.findOne({
        user_id: session.user.id,
        team_id,
    });

    if (!entry) {
        return NextResponse.json(
            {
                error: 'Knowledge base not initialized for this team',
                message: 'No knowledge base entry found. Please create one first.'
            },
            { status: 428 }
        );
    }

    return NextResponse.json(entry);
}

export async function POST(req: NextRequest) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { team_id, text, file } = await req.json();

    if (!team_id) {
        return NextResponse.json({ error: 'Missing Team ID' }, { status: 400 });
    }

    try {
        await connectToDatabase();
        const entry = await KnowledgeBase.create({
            user_id: session.user.id,
            team_id,
            text,
            file,
        });

        return NextResponse.json(entry, { status: 201 });
    } catch (err: any) {
        if (err.code === 11000) {
            return NextResponse.json(
                { error: 'Knowledge already exists for this team' },
                { status: 409 }
            );
        }
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { team_id, text, file } = await req.json();

    if (!team_id) {
        return NextResponse.json({ error: 'Missing team_id' }, { status: 400 });
    }

    await connectToDatabase();
    const updated = await KnowledgeBase.findOneAndUpdate(
        { user_id: session.user.id, team_id },
        { ...(text && { text }), ...(file && { file }) },
        { new: true }
    );

    if (!updated) {
        return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { team_id, url } = await req.json();

    if (!team_id || !url) {
        return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }

    await connectToDatabase();
    const updated = await KnowledgeBase.findOneAndUpdate(
        { user_id: session.user.id, team_id },
        { $pull: { file: { url } } },
        { new: true }
    );

    if (!updated) {
        return NextResponse.json({ error: 'Entry not found or file not present' }, { status: 404 });
    }

    return NextResponse.json({ success: true, updated });
}