import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { CustomForm } from '@/model/Forms';

export async function GET(req: NextRequest) {
    await connectToDatabase();

    const formId = req.nextUrl.searchParams.get('id');

    console.log("FORMFORMFORM", formId);
    if (!formId) {
        return NextResponse.json({ error: 'Form ID is required' }, { status: 400 });
    }

    try {
        const form = await CustomForm.findById(formId);

        if (!form) {
            return NextResponse.json({ error: 'Form not found' }, { status: 404 });
        }
        
        return NextResponse.json(form, { status: 200 });
    } catch (error) {
        console.error('[GET_FORM_BY_ID_ERROR]', error);
        return NextResponse.json({ error: 'Failed to fetch form' }, { status: 500 });
    }
}
