'use client';
import useSWR from 'swr';
import { useParams } from 'next/navigation';
import StatCard from '@/components/StatCard';
import { fetcher } from '@/lib/fetcher';
import { MdOutlineTask } from "react-icons/md";
import DashboardChart from '@/components/DashboardChart';


export default function Page() {
    const params = useParams<{ id: string }>();
    const teamId = params.id;

    const { data, error, isLoading } = useSWR(
        teamId ? `/api/analytics?teamId=${teamId}` : null,
        fetcher
    );

    const stats = {
        leadCount: data?.totalLeads || 0,
        meetingCount: data?.upcomingMeetings?.length || 0,
        pendingTasks: data?.pendingTasks || 0,
        completedTasks: data?.completedTasks || 0,
    };

    const taskChartData = {
        labels: ['Completed', 'Pending'],
        datasets: [
            {
                label: 'Tasks',
                data: [stats.completedTasks, stats.pendingTasks],
                backgroundColor: ['#4ade80', '#f87171'],
            },
        ],
    };

    const leadsChartData = {
        labels: ['Leads'],
        datasets: [
            {
                label: 'Leads Over Time',
                data: [stats.leadCount],
                backgroundColor: ['#60a5fa'],
            },
        ],
    };


    const upcomingMeetings = data?.upcomingMeetings || [];
    const meetingChartData = {
        labels: upcomingMeetings.map((m: any) => new Date(m.startTime).toLocaleDateString()),
        datasets: [
            {
                label: 'Upcoming Meetings',
                data: upcomingMeetings.map(() => 1),
                backgroundColor: '#fbbf24',
            },
        ],
    };
    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="mx-auto px-8 py-2">
            <div className="mb-6">
                <p className="text-gray-600">Here's what's happening with your CRM today</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 my-10">
                <DashboardChart title="Task Distribution" type="pie" data={taskChartData} />
                <DashboardChart title="Lead Trends" type="bar" data={leadsChartData} />
                <DashboardChart title="Meetings by Day" type="line" data={meetingChartData} />


            </div>


        </div>
    );
}
