'use client';

import React, { useMemo, useState } from 'react';
import useSWR from 'swr';
import { format, isAfter, isBefore, parseISO } from 'date-fns';
import MeetingPanel from './MeetingPanel';
import { fetcher } from '@/lib/fetcher';
import { useParams } from 'next/navigation';

const MeetingsListView = () => {
  const { id: teamId } = useParams<{ id: string }>();

  const { data: meetings, mutate } = useSWR(`/api/meetings?team=${teamId}`, fetcher);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedMeeting, setSelectedMeeting] = useState<any | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const now = new Date();

  const filteredMeetings = useMemo(() => {
    if (!meetings) return [];
    return meetings
      .filter((m: any) => {
        const start = parseISO(m.startTime);
        return activeTab === 'upcoming' ? isAfter(start, now) : isBefore(start, now);
      })
      .sort((a: any, b: any) => {
        const sa = parseISO(a.startTime);
        const sb = parseISO(b.startTime);
        return activeTab === 'upcoming' ? sa.getTime() - sb.getTime() : sb.getTime() - sa.getTime();
      });
  }, [meetings, activeTab]);

  return (
    <>
      <div className="flex space-x-4 mb-4 border-b border-gray-300 pb-2">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 rounded-t-md font-medium text-xs ${
            activeTab === 'upcoming' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-4 py-2 rounded-t-md font-medium text-xs ${
            activeTab === 'past' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          Past
        </button>
      </div>

      <div>
        {filteredMeetings.map((m: any) => (
          <div
            key={m._id}
            className="border p-4 rounded-md mb-3 bg-white border-gray-300 cursor-pointer hover:shadow-md transition"
            onClick={() => {
              setSelectedMeeting(m);
              setIsOpen(true);
            }}
          >
            <div className="flex justify-between items-center">
              <div className="font-semibold text-gray-900">{m.title}</div>
              <div className="flex flex-wrap gap-1">
                {m.attendees.slice(0, 3).map((member: string, index: number) => (
                  <span
                    key={index}
                    className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5"
                  >
                    {member}
                  </span>
                ))}

                {m.attendees.length > 3 && (
                  <span className="text-xs bg-gray-200 text-gray-700 rounded-full px-2 py-0.5">
                    +{m.attendees.length - 3}
                  </span>
                )}
              </div>
            </div>

            <div className="text-sm text-gray-600">
              {format(parseISO(m.startTime), 'PPpp')} → {format(parseISO(m.endTime), 'PPpp')}
            </div>

            <div className="text-xs text-gray-500">
              {m.platform?.toUpperCase()} | {m.meetingType}
            </div>
          </div>
        ))}
      </div>

      <MeetingPanel
        meeting={selectedMeeting}
        isOpen={isOpen}
        mode="edit"
        onClose={() => setIsOpen(false)}
        teamId={selectedMeeting?.teamId ?? ''}
        userId={selectedMeeting?.createdBy ?? ''}
        mutate={mutate}
      />
    </>
  );
};

export default MeetingsListView;
