'use client';

import { useParams } from 'next/navigation';
import React, { useState } from 'react';
import MeetingsCalendarView from './MeetingsCalendarView';
import MeetingsListView from './MeetingsListView';
import MeetingPanel from './MeetingPanel';
import { FaRegCalendarAlt, FaRegListAlt } from 'react-icons/fa';
import { useTeamRole } from '@/context/TeamRoleContext';

export default function Meetings({ user_id }: { user_id: string }) {
  const params = useParams<{ id: string }>();
  const {role , access} = useTeamRole();
  const team_id = params.id;

  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-6 relative bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
       {role == 'admin' || access?.meetings?.includes('write') ? ( <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-100 text-blue-800 px-4 py-2 rounded hover:font-semibold text-xs cursor-pointer transition"
        >
          New Meeting
        </button>):null}
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

      {view === 'calendar' ? <MeetingsCalendarView /> : <MeetingsListView />}

      {/* MeetingPanel in Add Mode */}
      <MeetingPanel
        meeting={null}
        isOpen={isOpen}
        mode="edit"
        onClose={() => setIsOpen(false)}
        teamId={team_id}
        userId={user_id}
        mutate={() => {}}
        
      />
    </div>
  );
}
