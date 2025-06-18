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
import MeetingLeadsPanel from './MeetingLeadsPanel';

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
interface props {
  lead_id: string;
  meetings: any;
  mutate: () => void;
  userId: string
}

const MeetingLEadCalenderView = ({lead_id, userId,meetings,mutate}: props) => {
  const { id: teamId } = useParams<{ id: string }>();

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

      <MeetingLeadsPanel
        meeting={selectedMeeting}
        isOpen={isOpen}
        mode="edit"
        onClose={() => setIsOpen(false)}
        teamId={selectedMeeting?.teamId ?? ''}
        userId={userId}
        mutate={mutate}
        lead_id={lead_id}
      />
    </div>
  );
};

export default MeetingLEadCalenderView;
