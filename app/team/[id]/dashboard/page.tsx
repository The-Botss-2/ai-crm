'use client';
import { useState } from 'react';
import StatCard from '@/components/StatCard';
export default function Page() {

  const [stats, setStats] = useState({
    leadCount: 0,
    callCount: 0,
    meetingCount: 0,
    pendingTasks: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Leads"
          value={stats.leadCount}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          }
        />
        <StatCard
          title="Phone Calls"
          value={stats.callCount}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
            </svg>
          }
        />
        <StatCard
          title="Meetings"
          value={stats.meetingCount}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          }
        />
        <StatCard
          title="Pending Tasks"
          value={stats.pendingTasks}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
          }
        />
      </div>

      {/* Recent Activities */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
        <div className="space-y-4">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity: any) => (
              <div
                key={activity.id}
                className="border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-start">
                  <div className="mr-4 mt-1">
                    {/* <ActivityIcon type={activity.type} /> */}
                  </div>
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{activity.description}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No recent activities found.</p>
          )}
        </div>
      </div>

      {/* Upcoming Meetings */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Upcoming Meetings</h2>
        {/* Meetings will be implemented here */}
        <p className="text-gray-500 dark:text-gray-400">No upcoming meetings scheduled.</p>
      </div>
    </div>
  )
}
