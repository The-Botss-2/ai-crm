'use client';

import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { IoClose } from 'react-icons/io5';
import MeetingsLeadsForm from './MeetingsLeadsForm';

interface MeetingPanelProps {
  meeting: any | null;
  isOpen: boolean;
  mode: 'edit' | 'preview';
  onClose: () => void;
  teamId: string;
  userId: string;
  mutate: () => void;
  lead_id: string
}

const MeetingLeadsPanel: React.FC<MeetingPanelProps> = ({
  meeting,
  isOpen,
  mode,
  onClose,
  teamId,
  userId,
  mutate,
  lead_id
}) => {
  const isPreview = mode === 'preview';
  const isEdit = mode === 'edit' && !!meeting;

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs" />
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl p-6 overflow-y-auto">
          <Dialog.Title className="text-md font-semibold border-b border-gray-200 pb-4 mb-4 flex justify-between items-center text-gray-900">
            {isPreview ? 'Preview Meeting' : isEdit ? 'Edit Meeting' : 'Add New Meeting'}
            <button
              onClick={onClose}
              aria-label="Close panel"
              className="text-gray-600 hover:text-gray-900 transition"
            >
              <IoClose size={16} />
            </button>
          </Dialog.Title>

          {(meeting || !isEdit) && (
            <MeetingsLeadsForm
              initialValues={{
                _id: meeting?._id || '',
                title: meeting?.title || '',
                description: meeting?.description || '',
                startTime: meeting?.startTime || '',
                endTime: meeting?.endTime || '',
                platform: meeting?.platform || 'zoom',
                link: meeting?.link || '',
                meetingType: meeting?.meetingType || 'online',
                followUpStatus: meeting?.followUpStatus || '',
                notes: meeting?.notes || '',
                transcript: meeting?.transcript || '',
                recordingUrl: meeting?.recordingUrl || '',
                aiSummary: meeting?.aiSummary || '',
                attendees: meeting?.attendees || [],
                teamId,
                createdBy: meeting?.createdBy || '',
                leadId: meeting?.leadId || lead_id || null,
              }}
              isEdit={isEdit}
              isPreview={isPreview}
              onClose={onClose}
              reload={mutate}
              userId={userId}
              meeting={meeting}
            />
          )}
        </div>
      </Dialog>
    </Transition>
  );
};

export default MeetingLeadsPanel;
