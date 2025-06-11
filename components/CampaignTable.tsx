'use client';

import React, { useState } from 'react';
import { Campaign } from './OutBoundCalls';
import { format } from 'date-fns';
import { FiEdit3 } from 'react-icons/fi';
import { MdDeleteOutline } from 'react-icons/md';
import { HiStop } from 'react-icons/hi';
import { FaEye } from 'react-icons/fa';
import { IoIosCall } from 'react-icons/io';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface TableProps {
  campaigns: Campaign[];
  onEdit: (c: Campaign) => void;
  onDelete: (id: string) => void;
  onStop: (id: string) => void;
  campaignLoading: boolean;
  teamId: string
}

const CampaignTable: React.FC<TableProps> = ({ campaigns, onEdit, onDelete, onStop,campaignLoading ,teamId}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const Api_BASE_URL = 'https://callingagent.thebotss.com/api'
  const router = useRouter()
  const totalPages = Math.ceil(campaigns.length / itemsPerPage);
  const paginatedCampaigns = campaigns.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };
  const CallAgent = async (c: any) => {
  try {
    const payload = {
      crm_user_id: c.crm_user_id,
      agent_id: c.agent_id,
      lead_id: c.lead_id,
      to_number: c.source_number,
      from_number: '03282637313', // You can replace with dynamic value if needed
    };

    const { data } = await axios.post(`${Api_BASE_URL}/api/outbound-single-call`, payload);

    console.log('Call initiated:', data);
    alert('Call initiated successfully');
  } catch (error: any) {
    console.error('Error initiating call:', error);
    toast.error(error?.response?.data?.message || 'Failed to initiate call');
  }
};

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
          {paginatedCampaigns.length > 0 ? (
            paginatedCampaigns.map((c) => (
              <tr
                key={c.id}
                className="bg-white shadow-sm hover:shadow-md transition duration-150 rounded-md"
              >
                <td className="px-4 py-2 bg-blue-50 font-medium text-blue-700">{c.agent_name}</td>
                <td className="px-4 py-2 text-gray-800">{c.source_number}</td>
                <td className="px-4 py-2 text-gray-600">
                  {c.scheduled_at ? format(c.scheduled_at, 'yyyy-MM-dd HH:mm') : '—'}
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
                <td className="px-4 py-2 text-gray-800"> {c.contacts_file ? c.contacts_file.split('/').pop() : '—'}</td>
                <td className="px-4 py-2 space-x-2">
                   <button
                    onClick={() => router.push(`/team/${teamId}/outboundcalls/${c?.id}`)}
                    className="bg-blue-100 text-blue-800 p-1 rounded hover:bg-blue-200"
                  >
                    <FaEye size={16} />
                  </button>
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
          ) : campaignLoading ? <tr><td colSpan={6} className="text-center py-4 text-gray-500">Loading...</td></tr> : (
            <tr>
              <td colSpan={6} className="text-center py-4 text-gray-500">
                No campaigns found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center mt-4 gap-2 text-sm">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CampaignTable;
