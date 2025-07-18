'use client';

import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { IoClose } from 'react-icons/io5';
import LeadTaskForm from './LeadTaskForm';


interface TaskPanelProps {
  isOpen: boolean;
  onClose: () => void;
  task: any | null;
  teamId: string;
  mutate: () => void;
  lead_id: string;
  user_id: string
   role: any
    access: any
}

const LeadTaskPanel: React.FC<TaskPanelProps> = ({
  isOpen,
  onClose,
  task,
  teamId,
  mutate,
  lead_id,
  user_id,
  role,
  access
}) => {
  const isEdit = !!task;

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
        {/* Panel */}
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl p-6 overflow-y-auto rounded-l-lg">
          <Dialog.Title className="text-md font-semibold border-b border-gray-300 pb-4 mb-4 flex justify-between items-center text-gray-900">
            {isEdit ? 'Edit Task' : 'Add Task'}
            <button
              onClick={onClose}
              className="text-gray-700 hover:text-gray-900 transition"
              aria-label="Close"
            >
              <IoClose size={20} />
            </button>
          </Dialog.Title>

          <LeadTaskForm
            initialValues={{
              _id: task?._id || null,
              title: task?.title || '',
              description: task?.description || '',
              status: task?.status || 'pending',
              priority: task?.priority || 'medium',
              dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
              assignedTo: task?.assignedTo?._id || '',
              leadId: task?.leadId || lead_id ||'',
              meetingId: task?.meetingId || '',
              teamId,
            }}
            isEdit={isEdit}
            onClose={onClose}
            reload={mutate}
            userID={user_id}
            task={task}
            role={role}
            access={access}
          />
        </div>
      </Dialog>
    </Transition>
  );
};

export default LeadTaskPanel;
