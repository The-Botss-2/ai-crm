'use client';
import React, { useState } from 'react';
import { Lead } from '@/types/lead';
import { getStatusColor } from '@/utils/lead';
import { useTeamRole } from '@/context/TeamRoleContext';
import { useRouter } from 'next/navigation';
import MeetingsPage from '@/components/Meetingspage';
import TasksPage from '@/app/team/[id]/tasks/page';
import MeetingLeads from './MeetingLeads';
import LeadTasks from './LeadTasks';

interface LeadsTableProps {
  leads: Lead | null;
  error?: boolean;
  userID: string;
}

const LeadsDetailsTable: React.FC<LeadsTableProps> = ({ leads, error, userID }) => {
  const { role, loading } = useTeamRole();
  const [activeTab, setActiveTab] = useState<'tasks' | 'meetings' | 'emails' | 'outbound'>('tasks');

  if (loading) return <p>Loading ...</p>;

  if (error || !leads) {
    return (
      <div className="text-center text-gray-500 py-6">
        {error ? 'Failed to load lead' : 'No lead found'}
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Lead Info */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex items-center mb-6 space-x-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold">
            {leads.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">{leads.name}</h2>
            <p className="text-sm text-gray-500">{leads.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <span className="font-medium">Phone:</span> {leads.phone}
          </div>
          <div>
            <span className="font-medium">Status:</span>
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(leads.status)}`}>
              {leads.status.replace('_', ' ')}
            </span>
          </div>
          <div>
            <span className="font-medium">Created:</span> {new Date(leads.createdAt).toLocaleString()}
          </div>
          <div>
            <span className="font-medium">Notes:</span> {leads.notes || 'No notes available'}
          </div>
        </div>
      </div>


      {/* Tab Buttons */}
      {/* Tab Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { key: 'tasks', label: 'Tasks' },
          { key: 'meetings', label: 'Meetings' },
          { key: 'emails', label: 'Emails' },
          { key: 'outbound', label: 'Outbound Campaign' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition border ${activeTab === tab.key
                ? 'bg-blue-600 text-white border-blue-600 shadow'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>


      {/* Tab Content */}
      {/* Tab Content */}
      <div className="bg-white shadow p-4 rounded-md mt-2">
        {activeTab === 'tasks' && (
          <LeadTasks user_id={userID} lead_id={leads._id} team_id={leads.teamId} />
        )}
        {activeTab === 'meetings' && (
          <MeetingLeads user_id={userID} lead_id={leads._id} team_id={leads.teamId} />
        )}
        {activeTab === 'emails' && (
          <p className="text-gray-500 italic">Emails content goes here...</p> // Replace with real component
        )}
        {activeTab === 'outbound' && (
          <p className="text-gray-500 italic">Outbound campaign content goes here...</p> // Replace with real component
        )}
      </div>

    </div>
  );
};

export default LeadsDetailsTable;
