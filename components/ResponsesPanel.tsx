'use client';

import { Dialog } from '@headlessui/react';
import { useState } from 'react';
import { IoIosClose } from 'react-icons/io';
import useSWR from 'swr';
import ResponseDialog from './ResponseDialog';
import { fetcher } from '@/lib/fetcher';

type Response = {
  _id: string;
  email: string;
  username: string;
  submittedAt: string;
  responses: {
    label: string;
    value: string | string[];
  }[];
};

export default function ResponsesPanel({
  isOpen,
  onClose,
  formId,
}: {
  isOpen: boolean;
  onClose: () => void;
  formId: string;
}) {
  const [selected, setSelected] = useState<Response | null>(null);

  const { data: responses, error, isLoading } = useSWR<Response[]>(
    isOpen ? `/api/form-responses?form=${formId}` : null,
    fetcher
  );

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-slate-950 p-6 shadow-lg overflow-y-auto">
          <Dialog.Title className="flex items-center justify-between border-b border-white/10 pb-4">
            <span className="text-lg font-semibold">
              Responses {responses?.length ? `(${responses.length})` : ''}
            </span>
            <button onClick={onClose} className="rounded-lg bg-white/5 p-1">
              <IoIosClose size={24} />
            </button>
          </Dialog.Title>

          <div className="space-y-4 mt-4">
            {isLoading && <p className="text-sm text-gray-400">Loading responses...</p>}
            {error && <p className="text-sm text-red-500">Failed to load responses</p>}
            {!isLoading && responses?.length === 0 && (
              <p className="text-sm text-gray-400">No responses submitted yet.</p>
            )}

            {responses?.map((res) => (
              <div
                key={res._id}
                onClick={() => setSelected(res)}
                className="border dark:border-white/10 p-3 rounded cursor-pointer hover:bg-white/10 transition"
              >
                <p className="text-sm font-medium">{res.username}</p>
                <p className="text-xs text-gray-500">{res.email}</p>
                <p className="text-[10px] text-gray-400">
                  {new Date(res.submittedAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Dialog>

      {/* Response Detail Dialog */}
      {selected && (
        <ResponseDialog
          response={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
