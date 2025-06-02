import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Lead } from '@/types/lead';
import toast from 'react-hot-toast';

interface ConfirmDeleteModalProps {
  lead: Lead | null;
  onClose: () => void;
  teamId: string;
  userId: string;
  mutate: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ lead, onClose, teamId, userId, mutate }) => {
  const handleDelete = async () => {
    if (!lead) return;
    const toastId = toast.loading('Deleting...');
    try {
      const res = await fetch(`/api/lead?id=${lead._id}&team-id=${teamId}&user-id=${userId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error();
      toast.success('Lead deleted', { id: toastId });
      mutate();
      onClose();
    } catch {
      toast.error('Failed to delete', { id: toastId });
    }
  };

  return (
    <Transition show={!!lead} as={React.Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded p-6 max-w-sm mx-auto">
            <Dialog.Title className="text-lg font-semibold mb-2">Confirm Delete</Dialog.Title>
            <p className="mb-4">
              Are you sure you want to delete <b>{lead?.name}</b>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 hover:font-semibold cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded bg-red-100 text-red-800 hover:font-semibold cursor-pointer text-xs"
              >
                Delete
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ConfirmDeleteModal;
