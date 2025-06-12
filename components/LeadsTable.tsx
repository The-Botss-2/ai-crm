import React from 'react';
import { Lead } from '@/types/lead';
import { getStatusColor } from '@/utils/lead';
import { MdDeleteOutline, MdOutlineRemoveRedEye } from 'react-icons/md';
import { FiEdit3 } from 'react-icons/fi';
import { useTeamRole } from '@/context/TeamRoleContext';
import { useRouter } from 'next/navigation';
import Loading from './Loading';

interface LeadsTableProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onPreview: (lead: Lead) => void;
  error?: boolean;
}

const LeadsTable: React.FC<LeadsTableProps> = ({ leads, onEdit, onDelete, onPreview, error }) => {
  const { role, loading } = useTeamRole();
  const router = useRouter()
  if (loading) return <Loading />;
  console.log(leads, 'leads');
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border-separate border-spacing-y-2">
        <thead>
          <tr className="text-gray-700">
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Email</th>
            <th className="px-4 py-2 text-left">Phone</th>
            <th className="px-4 py-2 text-left">Source</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Created Date</th>
            <th className="px-4 py-2 text-left">Time</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.length > 0 ? (
            leads.map((lead) => (
              <tr
                key={lead._id}
                className="bg-white shadow-sm hover:shadow-md transition duration-150 rounded-md"
              >
                <td className="px-4 py-2 rounded-l-md bg-blue-50 font-medium text-blue-700 cursor-pointer" onClick={() => router.push(`/team/${lead?.teamId}/leadsdetails/${lead._id}`)}>{lead.name}</td>
                <td className="px-4 py-2 text-gray-800">{lead.email}</td>
                <td className="px-4 py-2 text-gray-800">{lead.phone}</td>
                   <td className="px-4 py-2">
                  <span className={`px-4 py-2 text-gray-800`}>
                    {lead.source || '_'}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <span className={`px-2 capitalize py-1 rounded-full text-xs font-semibold ${getStatusColor(lead.status)}`}>
                    {lead.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-600">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 text-gray-600">
                  {new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="px-4 py-2 rounded-r-md space-x-2">
                  {role !== 'readonly' && (
                    <button
                      onClick={() => onEdit(lead)}
                      className="bg-blue-100 cursor-pointer text-blue-800 p-1 rounded hover:underline"
                    >
                      <FiEdit3 size={16} />
                    </button>
                  )}
                  {role !== 'readonly' && (
                    <button
                      onClick={() => onDelete(lead)}
                      className="bg-red-100 cursor-pointer text-red-800 p-1 rounded hover:underline"
                    >
                      <MdDeleteOutline size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => router.push(`/team/${lead?.teamId}/leadsdetails/${lead._id}`)}
                    className="bg-green-100 text-green-800 cursor-pointer p-1 rounded hover:underline"
                  >
                    <MdOutlineRemoveRedEye size={16} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="text-center py-4 text-gray-500">
                {error ? 'Failed to load leads' : 'No leads found'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LeadsTable;
