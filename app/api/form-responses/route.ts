import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { FormResponse } from '@/model/FormResponse';
import { CustomForm } from '@/model/Forms';
import { auth } from '@/auth';
import Lead from '@/model/Lead';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
    await connectToDatabase();

    try {
        const { email, username, form, category,team_id:teamId,responses } = await req.json();

        // ✅ Required fields check
        if ( !email || !username || !form || !Array.isArray(responses)) {
            return NextResponse.json(
                { error: 'Missing required fields: email, username, form, or responses' },
                { status: 400 }
            );
        }
        if (category == 'lead') {
            const isLead = await Lead.findOne({ email });
            if (!isLead) {
                await Lead.create({ email, name:username,teamId });
            }
        }
        const existingForm = await CustomForm.findById(form);
        if (!existingForm) {
            return NextResponse.json({ error: 'Form not found' }, { status: 404 });
        }

        const saved = await FormResponse.create({
           email, username,
            form,
            category,
            responses,
        });

        return NextResponse.json(saved, { status: 201 });
    } catch (error) {
        console.error('[FORM_RESPONSE_POST_ERROR]', error);
        return NextResponse.json({ error: 'Failed to save form response' }, { status: 500 });
    }
}
interface Query {
    form?: ObjectId; // form should be of type ObjectId
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
   const query: Query = { };

    if (formId) {
        // Ensure that searchFormId is converted to ObjectId if valid
        if (ObjectId.isValid(formId)) {
            query.form = new ObjectId(formId);  // Force form to be an ObjectId
        } else {
            return NextResponse.json([], { status: 200 });
        }
    }
    await connectToDatabase();

    try {
        const responses = await FormResponse.find(query).sort({ createdAt: -1 });

        return NextResponse.json(responses, { status: 200 });
    } catch (error) {
        console.error('[FORM_RESPONSE_GET_ERROR]', error);
        return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 });
    }
}

