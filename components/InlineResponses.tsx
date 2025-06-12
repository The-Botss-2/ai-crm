'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { FiMail, FiUser, FiClock } from 'react-icons/fi';

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

export default function InlineResponses({ formId }: { formId: string }) {
  const { data: responses, error, isLoading } = useSWR<Response[]>(
    `/api/form-responses?form=${formId}`,
    fetcher
  );

  if (isLoading)
    return <p className="text-sm text-gray-500 px-2">Loading responses...</p>;
  if (error)
    return <p className="text-sm text-red-500 px-2">Error loading responses.</p>;
  if (!responses || responses.length === 0)
    return <p className="text-sm text-gray-500 px-2">No responses yet.</p>;

  return (
    <div className="mt-4 space-y-4">
      {responses.map((res) => (
        <div
          key={res._id}
          className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white"
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <FiUser className="text-gray-500" />
              <span>{res.username}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <FiMail className="text-gray-500" />
              <span>{res.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1 sm:mt-0">
              <FiClock className="text-gray-400" />
              <span>{new Date(res.submittedAt).toLocaleString()}</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mt-2">
            {res.responses.map((r, idx) => (
              <div key={idx} className="text-sm text-gray-800">
                <span className="font-semibold">{r.label}:</span>{' '}
                {Array.isArray(r.value)
                  ? r.value.join(', ')
                  : r.value || <span className="text-gray-400">No answer</span>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
