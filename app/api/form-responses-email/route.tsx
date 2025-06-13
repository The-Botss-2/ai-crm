import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { FormResponse } from '@/model/FormResponse';
import { CustomForm } from '@/model/Forms';
import { auth } from '@/auth';
import Lead from '@/model/Lead';

export async function GET(req: NextRequest) {

    const session = await auth();
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const email = req.nextUrl.searchParams.get('email');

    if (!email) {
        return NextResponse.json({ error: 'email is required in query' }, { status: 400 });
    }

    await connectToDatabase();

    try {
        const responses = await FormResponse.find({ email }).sort({ createdAt: -1 });

        return NextResponse.json(responses, { status: 200 });
    } catch (error) {
        console.error('[FORM_RESPONSE_GET_ERROR]', error);
        return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 });
    }
}

