'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { FiMail, FiUser, FiClock } from 'react-icons/fi';
import { useState } from 'react';

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

export default function InlineResponses({ formId, onBack, email }: { formId?: string; onBack?: () => void; email?: string; }) {
  const [searchFormId, setSearchFormId] = useState('');
  const { data: responses, error, isLoading } = useSWR<Response[]>(
   (email ? `/api/form-responses-email?email=${email}&searchFormId=${searchFormId}`: searchFormId ? `/api/form-responses?form=${searchFormId}`  : `/api/form-responses?form=${formId}`),
    fetcher
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchFormId(e.target.value);
  };

  if (isLoading)
    return <p className="text-sm text-gray-500 px-2">Loading responses...</p>;
  if (error)
    return <p className="text-sm text-red-500 px-2">Error loading responses.</p>;

  return (
    <div className="mt-4 space-y-4">
      {/* Back Button */}
      {!email ? (
        <button onClick={onBack} className="text-sm text-blue-600 hover:underline mb-2">
          ← Back to Forms
        </button>
      ) : null}

      {/* Form ID Search */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          value={searchFormId}
          onChange={handleSearchChange}
          placeholder="Paste Form ID to search"
          className="p-2 border border-gray-300 rounded-md text-sm w-1/2"
        />
      </div>

      {!responses || responses.length === 0 ? (
        <div className="text-sm w-full text-center text-gray-500 px-2">No responses yet.</div>
      ) : (
        responses.map((res: any) => (
          <div key={res._id} className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white">
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
            <div className="text-sm text-gray-800">
              <span className="font-semibold">ID: {email ? res.form :formId}</span>{' '}
            </div>
            <div className="grid sm:grid-cols-2 gap-3 mt-2">
              {res.responses.map((r: any, idx: any) => (
                <div key={idx} className="text-sm text-gray-800">
                  <span className="font-semibold">{r.label}:</span>{' '}
                  {Array.isArray(r.value) ? r.value.join(', ') : r.value || <span className="text-gray-400">No answer</span>}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
