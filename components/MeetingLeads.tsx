'use client';

import { useParams } from 'next/navigation';
import React, { useState } from 'react';
import { FaRegCalendarAlt, FaRegListAlt } from 'react-icons/fa';
import MeetingLeadsPanel from './MeetingLeadsPanel';
import MeetingLEadCalenderView from './MeetingLEadCalenderView';
import MeetingsLeadListView from './MeetingsLeadListView';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
interface props {
    user_id: string;
    lead_id: string
    team_id: string
}
export default function MeetingLeads({ user_id,lead_id,team_id }: props) {
  const params = useParams<{ id: string }>();
  const { data: meetings, mutate } = useSWR(`/api/meetingDetail?id=${lead_id}`, fetcher);

  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-6 relative bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-100 text-blue-800 px-4 py-2 rounded hover:font-semibold text-xs cursor-pointer transition"
        >
          New Meeting
        </button>
      </div>

      <div className="flex gap-2 justify-end mb-5">
        <button
          onClick={() => setView('calendar')}
          className={`px-4 py-2 rounded-md text-xs font-medium ${
            view === 'calendar'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-white text-gray-800 border border-gray-300'
          } transition`}
        >
          <FaRegCalendarAlt size={16} />
        </button>
        <button
          onClick={() => setView('list')}
          className={`px-4 py-2 rounded-md text-xs font-medium ${
            view === 'list'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-white text-gray-800 border border-gray-300'
          } transition`}
        >
          <FaRegListAlt size={16} />
        </button>
      </div>

      {view === 'calendar' ? <MeetingLEadCalenderView lead_id={lead_id}  meetings={meetings} mutate={mutate}/> : <MeetingsLeadListView lead_id={lead_id} meetings={meetings} mutate={mutate}/>}

      {/* MeetingPanel in Add Mode */}
      <MeetingLeadsPanel
        meeting={null}
        isOpen={isOpen}
        mode="edit"
        onClose={() => setIsOpen(false)}
        teamId={team_id}
        userId={user_id}
        mutate={mutate}
        lead_id={lead_id}
      />
    </div>
  );
}
