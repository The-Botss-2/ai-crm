'use client';

import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { IoClose } from 'react-icons/io5';
import TaskForm from './TaskForm';

interface TaskPanelProps {
  isOpen: boolean;
  onClose: () => void;
  task: any | null;
  teamId: string;
  mutate: () => void;
}

const TaskPanel: React.FC<TaskPanelProps> = ({
  isOpen,
  onClose,
  task,
  teamId,
  mutate,
}) => {
  const isEdit = !!task;

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs" />
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-slate-900 shadow-xl p-6 overflow-y-auto">
          <Dialog.Title className="text-md font-semibold border-b border-gray-200 pb-4 mb-4 flex justify-between items-center">
            {isEdit ? 'Edit Task' : 'Add Task'}
            <button onClick={onClose}><IoClose size={16} /></button>
          </Dialog.Title>

          <TaskForm
            initialValues={{
              _id: task?._id || null,
              title: task?.title || '',
              description: task?.description || '',
              status: task?.status || 'pending',
              priority: task?.priority || 'medium',
              dueDate: task?.dueDate
                ? new Date(task.dueDate).toISOString().slice(0, 16)
                : '',
              assignedTo: task?.assignedTo || '',
              leadId: task?.leadId || '',
              meetingId: task?.meetingId || '',
              teamId,
            }}
            isEdit={isEdit}
            onClose={onClose}
            reload={mutate}
          />
        </div>
      </Dialog>
    </Transition>
  );
};

export default TaskPanel;
