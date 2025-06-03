'use client';

import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { mutate } from 'swr';
import { MdDeleteOutline } from 'react-icons/md';
import { FaArrowRight } from 'react-icons/fa6';
import Link from 'next/link';

export default function TeamCard({ teams, userId }: { teams: any[]; userId: string }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!selectedTeam) return;

    setDeleting(true);
    const toastId = toast.loading('Deleting team...');
    try {
      await axios.delete(`/api/team?id=${selectedTeam._id}`, {
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
      setSelectedTeam(null);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg p-6 overflow-x-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Teams</h2>

      <table className="w-full table-auto text-sm text-left border border-gray-200 rounded-lg">
        <thead className="bg-blue-100 text-blue-800 uppercase tracking-wider text-xs font-bold">
          <tr>
            <th className="px-5 py-3">Team Name</th>
            <th className="px-5 py-3">Members</th>
            <th className="px-5 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-700 divide-y divide-gray-200">
          {teams.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center py-6 text-gray-500">
                You don’t have any teams yet.
              </td>
            </tr>
          ) : (
            teams.map((team) => (
              <tr key={team._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4 font-medium truncate">{team.name}</td>
                <td className="px-5 py-4">
                  {team.members.length} member{team.members.length !== 1 && 's'}
                </td>
                <td className="px-5 py-4 flex justify-center gap-2">
                  {team.createdBy === userId && (
                    <button
                      onClick={() => {
                        setSelectedTeam(team);
                        setConfirmOpen(true);
                      }}
                      className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition"
                      title="Delete Team"
                    >
                      <MdDeleteOutline size={16} />
                    </button>
                  )}
                  <Link
                    href={`/team/${team._id}/dashboard`}
                    title="Go to Dashboard"
                    className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full transition"
                  >
                    <FaArrowRight size={14} />
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Delete Confirmation Modal */}
      <Transition appear show={confirmOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setConfirmOpen(false)}>
          <div className="fixed inset-0 bg-black/10 backdrop-blur-sm" aria-hidden="true" />
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
                  Are you sure you want to delete <strong>{selectedTeam?.name}</strong>? This action cannot be undone.
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
    </div>
  );
}
