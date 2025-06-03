'use client';

import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { mutate } from 'swr';
import { MdDeleteOutline } from 'react-icons/md';
import { FaArrowRight } from 'react-icons/fa6';
import Link from 'next/link';

export default function TeamCard({ team, userId }: { team: any; userId: string }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const toastId = toast.loading('Deleting team...');
    try {
      await axios.delete(`/api/team?id=${team._id}`, {
        data: { requesterId: userId },
      });
      toast.success('Team deleted', { id: toastId });
      mutate(`/api/team/user?id=${userId}`);
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Failed to delete';
      toast.error(msg, { id: toastId });
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <div
        className="
          relative
          flex-shrink-0
          w-full max-w-xs sm:w-72
          bg-white
          border-l-4 border-blue-400/70
          rounded-2xl
          shadow-md
          p-5
          transition-transform transform
          hover:-translate-y-1 hover:shadow-xl
          space-y-3
          cursor-pointer
          flex flex-col justify-between
        "
        title={team.name}
      >
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 truncate">{team.name}</h2>
            <p className="text-xs text-gray-500">
              {team.members.length} member{team.members.length !== 1 && 's'}
            </p>
          </div>

          <div className="flex gap-2 items-center">
            {team.createdBy === userId && (
              <button
                onClick={() => setConfirmOpen(true)}
                title="Delete Team"
                className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition"
                aria-label="Delete Team"
              >
                <MdDeleteOutline size={16} />
              </button>
            )}
            <Link
              href={`/team/${team._id}/dashboard`}
              title="Go to Dashboard"
              className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full transition"
              aria-label="Go to Dashboard"
            >
              <FaArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Confirm Delete Modal */}
      <Transition appear show={confirmOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setConfirmOpen(false)}>
          {/* Glassmorphic background overlay */}
          <div className="fixed inset-0 bg-white/30 backdrop-blur-md" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="transition duration-300 ease-out"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="transition duration-200 ease-in"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="bg-white rounded-xl p-6 max-w-sm w-full shadow-lg">
                <Dialog.Title className="text-lg font-semibold text-red-600 mb-3">Delete Team</Dialog.Title>
                <p className="text-sm text-gray-700 mt-2">
                  Are you sure you want to delete <strong>{team.name}</strong>? This action cannot be undone.
                </p>

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm font-semibold transition"
                    onClick={() => setConfirmOpen(false)}
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition disabled:opacity-60"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? 'Deleting...' : 'Confirm'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
