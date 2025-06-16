import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { FormResponse } from '@/model/FormResponse';
import { auth } from '@/auth';
import { ObjectId } from 'mongodb';

interface Query {
    email: string;
    form?: ObjectId; // form should be of type ObjectId
}

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = req.nextUrl.searchParams.get('email');
    const searchFormId = req.nextUrl.searchParams.get('searchFormId');

    if (!email) {
        return NextResponse.json({ error: 'email is required in query' }, { status: 400 });
    }

    const query: Query = { email };

    if (searchFormId) {
        // Ensure that searchFormId is converted to ObjectId if valid
        if (ObjectId.isValid(searchFormId)) {
            query.form = new ObjectId(searchFormId);  // Force form to be an ObjectId
        } else {
            return NextResponse.json([], { status: 200 });
        }
    }

    await connectToDatabase();

    try {
        const responses = await FormResponse.find(query).sort({ createdAt: -1 });
        if (responses.length === 0) {
            return NextResponse.json([], { status: 200 });
        }
        return NextResponse.json(responses, { status: 200 });
    } catch (error) {
        console.error('[FORM_RESPONSE_GET_ERROR]', error);
        return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 });
    }
}
