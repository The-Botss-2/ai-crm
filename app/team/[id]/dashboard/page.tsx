'use client';
import useSWR from 'swr';
import { useParams } from 'next/navigation';
import StatCard from '@/components/StatCard';
import { fetcher } from '@/lib/fetcher';
import { MdOutlineTask } from "react-icons/md";


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

  const upcomingMeetings = data?.upcomingMeetings || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-8 py-2">
      <div className="mb-6">
        <p className="text-gray-600">Here's what's happening with your CRM today</p>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Leads"
          value={stats.leadCount}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          }
        />
        <StatCard
          title="Meetings"
          value={stats.meetingCount}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          }
        />
        <StatCard
          title="Complete Tasks"
          value={stats.completedTasks}
          icon={<MdOutlineTask size={24}/>}
        />
        <StatCard
          title="Pending Tasks"
          value={stats.pendingTasks}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
          }
        />
      </div>



      {/* Upcoming Meetings */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Upcoming Meetings</h2>
        {upcomingMeetings.length > 0 ? (
          <ul className="space-y-3">
            {upcomingMeetings.map((m: any, i: number) => (
              <li key={i} className="flex items-start justify-between text-sm text-gray-700 dark:text-gray-200">
                <span>{m.title}</span>
                <span className="text-xs text-gray-400">{new Date(m.startTime).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No upcoming meetings scheduled.</p>
        )}
      </div>
    </div>
  );
}
