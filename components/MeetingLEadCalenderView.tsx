'use client';

import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { parseISO } from 'date-fns';
import moment from 'moment';
import MeetingPanel from './MeetingPanel';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { useParams } from 'next/navigation';

// Use moment localizer for broader compatibility
const localizer = momentLocalizer(moment);

interface MeetingEvent {
  _id: string;
  title: string;
  start: Date;
  end: Date;
  description: string;
  teamId: string;
  createdBy: string;
}

const MeetingLEadCalenderView = ({lead_id}: any) => {
  const { id: teamId } = useParams<{ id: string }>();

  const { data: meetings, mutate } = useSWR(`/api/meetingDetail?id=${lead_id}`, fetcher);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingEvent | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectEvent = (event: MeetingEvent) => {
    setSelectedMeeting(event);
    setIsOpen(true);
  };

  const mappedEvents = meetings?.map((m: any) => ({
    ...m,
    start: parseISO(m.startTime),
    end: parseISO(m.endTime),
    title: m.title,
  })) ?? [];

  return (
    <div className="h-[80vh] overflow-hidden rounded shadow bg-white p-2">
      <Calendar
        localizer={localizer}
        events={mappedEvents}
        startAccessor="start"
        endAccessor="end"
        defaultView="month"
        views={['month', 'week', 'day']}
        popup
        style={{ height: '100%', width: '100%' }}
        onSelectEvent={handleSelectEvent}
      />

      <MeetingPanel
        meeting={selectedMeeting}
        isOpen={isOpen}
        mode="edit"
        onClose={() => setIsOpen(false)}
        teamId={selectedMeeting?.teamId ?? ''}
        userId={selectedMeeting?.createdBy ?? ''}
        mutate={mutate}
      />
    </div>
  );
};

export default MeetingLEadCalenderView;
