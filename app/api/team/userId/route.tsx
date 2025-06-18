import { NextResponse, NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Team from '@/model/Team';

export async function GET(req: NextRequest) {
  await connectToDatabase();

  try {
    const userId = req.nextUrl.searchParams.get('userId')

    if (!userId) {
        return NextResponse.json({ success: false, error: 'Missing required fields.' }, { status: 400 });
    }
    const teams = await Team.find({createdBy : userId});
    return NextResponse.json({ success: true, teams });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to fetch teams.' }, { status: 500 });
  }
}
