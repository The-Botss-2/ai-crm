'use client';

import { Dialog } from '@headlessui/react';
import { IoIosClose } from 'react-icons/io';

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

export default function ResponseDialog({
  response,
  onClose,
}: {
  response: Response;
  onClose: () => void;
}) {
  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white dark:bg-slate-950 p-6 rounded-lg shadow-lg">
          <Dialog.Title className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">Response Details</span>
              <span className="text-[10px] px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-white/10 dark:text-white/70">
                {new Date(response.submittedAt).toLocaleString()}
              </span>
            </div>

            <button onClick={onClose}>
              <IoIosClose size={24} />
            </button>
          </Dialog.Title>

          <div className="text-sm space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500">Name</p>
                <p>{response.username}</p>
              </div>
              <div>
                <p className="text-gray-500">Email</p>
                <p>{response.email}</p>
              </div>
           
            </div>

            <hr className="my-2" />

            <div className="mt-4">
              <table className="w-full text-sm border border-white/10 rounded overflow-hidden">
                <thead>
                  <tr className="bg-gray-100 dark:bg-white/10 text-left">
                    <th className="px-3 py-2 font-medium">Field</th>
                    <th className="px-3 py-2 font-medium">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {response.responses.map((field, index) => (
                    <tr key={index} className="border-t border-white/5 hover:bg-white/5">
                      <td className="px-3 py-2 font-medium text-gray-700 dark:text-white">
                        {field.label}
                      </td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                        {Array.isArray(field.value) ? field.value.join(', ') : field.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
