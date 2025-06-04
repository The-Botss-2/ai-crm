// components/CampaignTable.tsx
'use client';

import React from 'react';
import { Campaign } from './OutBoundCalls';
import { format } from 'date-fns';
import { FiEdit3 } from 'react-icons/fi';
import { MdDeleteOutline } from 'react-icons/md';
import { HiStop } from 'react-icons/hi';

interface TableProps {
  campaigns: Campaign[];
  onEdit: (c: Campaign) => void;
  onDelete: (id: string) => void;
  onStop: (id: string) => void;
}

const CampaignTable: React.FC<TableProps> = ({ campaigns, onEdit, onDelete, onStop }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border-separate border-spacing-y-2">
        <thead>
          <tr className="text-gray-700">
            <th className="px-4 py-2 text-left">Agent</th>
            <th className="px-4 py-2 text-left">Phone #</th>
            <th className="px-4 py-2 text-left">Scheduled At</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Contacts File</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.length > 0 ? (
            campaigns.map((c) => (
              <tr key={c.id} className="bg-white shadow-sm hover:shadow-md transition duration-150 rounded-md">
                <td className="px-4 py-2 bg-blue-50 font-medium text-blue-700">{c.agentName}</td>
                <td className="px-4 py-2 text-gray-800">{c.phoneNumber}</td>
                <td className="px-4 py-2 text-gray-600">
                  {c.scheduledAt
                    ? format(c.scheduledAt, 'yyyy-MM-dd HH:mm')
                    : '—'}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      c.status === 'running'
                        ? 'bg-green-100 text-green-700'
                        : c.status === 'scheduled'
                        ? 'bg-yellow-100 text-yellow-700'
                        : c.status === 'stopped'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    } capitalize`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-800">{c.contactsFileName || '—'}</td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => onEdit(c)}
                    className="bg-blue-100 text-blue-800 p-1 rounded hover:bg-blue-200"
                  >
                    <FiEdit3 size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(c.id)}
                    className="bg-red-100 text-red-800 p-1 rounded hover:bg-red-200"
                  >
                    <MdDeleteOutline size={16} />
                  </button>
                  {(c.status === 'running' || c.status === 'scheduled') && (
                    <button
                      onClick={() => onStop(c.id)}
                      className="bg-red-100 text-red-800 p-1 rounded hover:bg-red-200"
                    >
                      <HiStop size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center py-4 text-gray-500">
                No campaigns found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CampaignTable;
