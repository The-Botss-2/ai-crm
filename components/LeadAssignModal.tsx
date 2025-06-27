import { axiosInstance } from '@/lib/fetcher';
import axios from 'axios';
import { X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';

const LeadAssignModal = ({ isLeadAssignModalOpen, setIsLeadAssignModalOpen, teamData, leads }: any) => {
  const [selectedUser, setSelectedUser] = useState<string | null>(leads?.assignedTo); // Selected user
  const [isLeadSubmitting, setIsLeadSubmitting] = useState(false); // Track submission state
  const handleAssignLead = async () => {
    if (!selectedUser) {
      toast.error('Please select both user and team.');
      return;
    }

    setIsLeadSubmitting(true);
    try {
      const response = await axios.put('/api/assignLead', {
        leadId: leads._id,
        userId: selectedUser,
      });

      if (response.data.success) {
        toast.success('Lead assigned successfully!');
        setIsLeadAssignModalOpen(false); // Close modal after success
      } else {
        toast.error('Failed to assign lead.');
      }
    } catch (error:any) {
      toast.error(error?.response?.data?.error || 'Error assigning lead. Please try again.');
    } finally {
      setIsLeadSubmitting(false);
    }
  };

 
  return (
    <>
      {isLeadAssignModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Assign Lead</h3>
              <button
                onClick={() => setIsLeadAssignModalOpen(false)} // Close modal
                className="text-gray-600 hover:text-gray-900 focus:outline-none"
              >
                <X size={24} />
              </button>
            </div>

            {/* User Select */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select User</label>
              <select
                value={selectedUser || ''}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Assign to</option>
                {teamData?.team?.members?.map((m: any) => (
                  <option key={m.profile?._id} value={m.profile?._id}>
                    {m.profile.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

      

            {/* Assign Button */}
            <div className="text-right">
              <button
                onClick={handleAssignLead}
                className={` text-white px-4 py-2 rounded-md  focus:outline-none ${isLeadSubmitting ? 'opacity-50 cursor-not-allowed' : ''} ${selectedUser  ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed'}`}
                disabled={isLeadSubmitting || !selectedUser }
              >
                {isLeadSubmitting ? 'Assigning...' : 'Assign Lead'}
              </button>
            </div>

            {/* Close Modal */}
            <button
              onClick={() => setIsLeadAssignModalOpen(false)}
              className="mt-4 w-full bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600 focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>
      )}</>
  )
}

export default LeadAssignModal
