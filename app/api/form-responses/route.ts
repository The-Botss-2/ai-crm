import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { FormResponse } from '@/model/FormResponse';
import { CustomForm } from '@/model/Forms';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
    await connectToDatabase();

    try {
        const { form, responses } = await req.json();

        // ✅ Required fields check
        if ( !form || !Array.isArray(responses)) {
            return NextResponse.json(
                { error: 'Missing required fields: email, username, form, or responses' },
                { status: 400 }
            );
        }
        const existingForm = await CustomForm.findById(form);
        if (!existingForm) {
            return NextResponse.json({ error: 'Form not found' }, { status: 404 });
        }

        const saved = await FormResponse.create({
           
            form,
            responses,
        });

        return NextResponse.json(saved, { status: 201 });
    } catch (error) {
        console.error('[FORM_RESPONSE_POST_ERROR]', error);
        return NextResponse.json({ error: 'Failed to save form response' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {

    const session = await auth();
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const formId = req.nextUrl.searchParams.get('form');

    if (!formId) {
        return NextResponse.json({ error: 'Form ID is required in query' }, { status: 400 });
    }

    await connectToDatabase();

    try {
        const responses = await FormResponse.find({ form: formId }).sort({ createdAt: -1 });

        return NextResponse.json(responses, { status: 200 });
    } catch (error) {
        console.error('[FORM_RESPONSE_GET_ERROR]', error);
        return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 });
    }
}

