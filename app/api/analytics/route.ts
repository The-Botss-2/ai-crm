import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Lead from '@/model/Lead';
import Task from '@/model/Task';
import Meeting from '@/model/Meeting';
import { auth } from '@/auth'; // ✅ using your auth()

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) {
        return NextResponse.json({ error: 'Missing teamId' }, { status: 400 });
    }

    try {
        // Leads
        await connectToDatabase();
        const totalLeads = await Lead.countDocuments({ teamId });

        // Tasks by status
        const pendingTasks = await Task.countDocuments({ teamId, status: 'pending' });
        const completedTasks = await Task.countDocuments({ teamId, status: 'completed' });


        const upcomingMeetings = await Meeting.find({
            teamId,
            createdBy: session.user.id, // ✅ match string in array
            startTime: { $gte: new Date() },
        })
            .select('title startTime')
            .sort({ startTime: 1 })
            .lean();

        return NextResponse.json({
            totalLeads,
            pendingTasks,
            completedTasks,
            upcomingMeetings,
        });
    } catch (err) {
        console.error('Analytics error:', err);
        return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 });
    }
}
