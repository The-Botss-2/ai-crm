import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { CustomForm } from '@/model/Forms';
import { checkTeamWritePermission } from '@/lib/checkTeamWritePermission';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const userId = session.user.id;

    const { title, description, fields, category, teamId, isTemplate } = await req.json();

    if (!title || typeof title !== 'string' || title.trim() === '') {
        return NextResponse.json({ error: 'Form title is required' }, { status: 400 });
    }

    if (!teamId || typeof teamId !== 'string') {
        return NextResponse.json({ error: 'teamId is required' }, { status: 400 });
    }

    if (!Array.isArray(fields) || fields.length === 0) {
        return NextResponse.json({ error: 'Form must contain at least one field' }, { status: 400 });
    }


    await checkTeamWritePermission(teamId, userId);

    try {
        const form = await CustomForm.create({
            title,
            description,
            fields,
            category,
            teamId,
            isTemplate,
            createdBy: userId,
        });

        return NextResponse.json(form, { status: 201 });
    } catch (error) {
        console.error('[FORM CREATE ERROR]', error);
        return NextResponse.json({ error: 'Failed to create form' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


    const teamId = req.nextUrl.searchParams.get('teamId');

    if (!teamId) {
        return NextResponse.json({ error: 'teamId is required' }, { status: 400 });
    }

    try {
        await connectToDatabase();
        const forms = await CustomForm.find({ teamId });
        return NextResponse.json(forms);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch forms' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const session = await auth();
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formId = req.nextUrl.searchParams.get('id');
    const body = await req.json();
    const userId = session.user.id;
    if (!body.teamId || typeof body.teamId !== 'string') {
        return NextResponse.json({ error: 'teamId is required' }, { status: 400 });
    }

    try {
        await connectToDatabase();
        await checkTeamWritePermission(body.teamId, userId);

        const existingForm = await CustomForm.findById(formId);
        if (!existingForm) {
            return NextResponse.json({ error: 'Form not found' }, { status: 404 });
        }

        // Basic validation
        if (body.title && typeof body.title !== 'string') {
            return NextResponse.json({ error: 'Invalid title' }, { status: 400 });
        }

        if (body.fields && (!Array.isArray(body.fields) || body.fields.length === 0)) {
            return NextResponse.json({ error: 'Fields must be a non-empty array' }, { status: 400 });
        }

        // Update the form
        const updatedForm = await CustomForm.findByIdAndUpdate(formId, body, { new: true });
        return NextResponse.json(updatedForm, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const session = await auth();
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formId = req.nextUrl.searchParams.get('id');
    try {
        await connectToDatabase();

        const deletedForm = await CustomForm.findByIdAndDelete(formId);
        if (!deletedForm) {
            return NextResponse.json({ error: 'Form not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Form deleted successfully' }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

