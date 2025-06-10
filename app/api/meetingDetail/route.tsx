import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Meeting from '@/model/Meeting';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id'); // expecting a leadId

    if (!id) {
      return NextResponse.json({ error: 'Missing lead id' }, { status: 400 });
    }
    console.log('id', id);
    const meetings = await Meeting.find({ leadId: id }); // fix: use find, not findById
    return NextResponse.json(meetings);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
