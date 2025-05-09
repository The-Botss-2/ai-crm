"use client";

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { axiosInstance } from '@/lib/fetcher';

export default function AddMemberDialog({ teamId, requesterId, mutate }: any) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('agent');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!email || !role) return;
    const toastId = toast.loading('Adding member...');
    setLoading(true);

    try {
      await axiosInstance.put(`/api/team/user?id=${teamId}`, {
        requesterId,
        email,
        role,
      });

      toast.success('Member added', { id: toastId });
      setEmail('');
      setRole('agent');
      setIsOpen(false);
      mutate();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to add', { id: toastId });
      setEmail('');
      setRole('agent');
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs">
        + Add Member
      </button>

      <Transition show={isOpen} as={Fragment}>
        <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
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
            <Dialog.Panel className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 p-6 z-[9999] rounded-xl shadow-md w-96">
              <Dialog.Title className="text-lg font-semibold mb-4">Add Member</Dialog.Title>
              <input
                type="email"
                placeholder="User email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-2 w-full mb-2 rounded text-sm dark:border-gray-700 border-gray-200"
                disabled={loading}
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="border p-2 w-full mb-2 rounded text-sm dark:border-gray-700 border-gray-200"
                disabled={loading}
              >
                <option value="manager">Manager</option>
                <option value="agent">Agent</option>
                <option value="readonly">Read-only</option>
              </select>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded text-xs dark:text-black"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 bg-blue-600 text-white rounded text-xs"
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add'}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
}
