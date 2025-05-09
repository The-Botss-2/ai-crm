"use client";

import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { axiosInstance } from '@/lib/fetcher';
import toast from 'react-hot-toast';
import { mutate } from 'swr';
import { MdDeleteOutline } from "react-icons/md";
import Link from 'next/link';
import { FaArrowRight } from "react-icons/fa6";

export default function TeamCard({
  team,
  userId,
}: {
  team: any;
  userId: string;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const toastId = toast.loading('Deleting team...');

    try {
      await axiosInstance.delete(`/api/team?id=${team._id}`, {
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
      <div className="p-4  rounded-xl w-72  bg-white/50 dark:bg-black/50 border dark:border-gray-700 border-gray-200 hover:shadow-md transition flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">{team.name}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{team.members.length} members</p>
        </div>
        <div className='flex items-center gap-2'>
          {team.createdBy === userId && (
            <button
              onClick={() => setConfirmOpen(true)}
              className="text-red-600  bg-black/10 dark:bg-white/10 p-1 rounded"
            >
              <MdDeleteOutline size={16} />
            </button>
          )}

          <Link href={`/team/${team._id}/dashboard`} className='bg-black/10 dark:bg-white/10 p-1 rounded'><FaArrowRight size={16} /></Link>
        </div>
      </div>

      <Transition show={confirmOpen} as={Fragment}>
        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} className="relative z-50">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="fixed top-1/3 left-1/2 -translate-x-1/2 transform bg-white dark:bg-slate-800 p-6 z-50 rounded-xl shadow-md w-96">
              <Dialog.Title className="text-md font-bold  mb-2 text-red-600">
                Confirm Delete
              </Dialog.Title>
              <p className="text-xs text-gray-700 mb-4 dark:text-white/60">
                Are you sure you want to delete <strong>{team.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  className="px-4 py-2 rounded bg-gray-200 dark:text-black hover:bg-gray-300 hover:font-semibold cursor-pointer text-xs"
                  onClick={() => setConfirmOpen(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  className="px-4 text-xs py-2 rounded  bg-red-100 text-red-800 hover:font-semibold cursor-pointer"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Confirm'}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
}
