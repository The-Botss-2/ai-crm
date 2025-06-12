'use client';
import React, { useState } from 'react';
import { Lead } from '@/types/lead';
import { useTeamRole } from '@/context/TeamRoleContext';
import MeetingLeads from './MeetingLeads';
import LeadTasks from './LeadTasks';
import OutBoundCalls from './OutBoundCalls';
import Loading from './Loading';
import { PhoneCall, UserIcon } from 'lucide-react';
import ConversationCom from './Conversation';
import toast from 'react-hot-toast';
import axios from 'axios';
import LeadEmail from './LeadEmail';

interface LeadsTableProps {
  leads?: Lead;
  error?: boolean;
  userID: string;
  mutateConversation: any;
  Conversation: any
}


const LeadsDetailsTable: React.FC<LeadsTableProps> = ({ leads, error, userID, mutateConversation, Conversation }) => {
  const { role, loading } = useTeamRole();
  const [activeTab, setActiveTab] = useState<'tasks' | 'meetings' | 'emails' | 'outbound' | 'conversation'>('tasks');


  // Loading state for role
  if (loading) return <Loading />;
  if (error || !leads) {
    return (
      <div className="text-center text-gray-500 py-6">
        {error ? 'Failed to load lead' : 'No lead found'}
      </div>
    );
  }
  const handleCall = async () => {
    if (!leads) return;

    const payload = {
      crm_user_id: userID,
      agent_id: 'agent_01jxfjbbxvfhf9mng76nq6pe7n',
      lead_id: leads._id,
      to_number: leads.phone,
      from_number: '+14348383256',
    };

    const toastId = toast.loading('Calling agent...');
    try {
      const res = await axios.post('https://callingagent.thebotss.com/api/outbound-single-call', payload);

      if (res.data && res.data.success) {
        mutateConversation();
        toast.success('Call initiated successfully!', { id: toastId });
      } else {
        toast.error('Call failed or no response received.', { id: toastId });
      }
    } catch (error) {
      toast.error('Call failed. Please try again.', { id: toastId });
      console.error('Call error:', error);
    }
  };
  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Lead Info */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
        <h2 className="flex items-center text-xl font-semibold mb-4 gap-2">
          <UserIcon className="w-6 h-6 text-green-600" />
          Lead Information
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
          <div><strong>Name:</strong> {leads?.name}</div>
          <div><strong>Phone:</strong> {leads?.phone}</div>
          <div><strong>Email:</strong> {leads?.email}</div>
          <div><strong>Status:</strong> {leads?.status}</div>
          <div className="col-span-2">
            <strong>Notes:</strong> {leads?.notes || 'No notes available'}
          </div>
        </div>
      </div>
      {/* Call Button */}
      <div className="text-right">
        <button
          onClick={handleCall}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow transition"
        >
          <PhoneCall className="w-5 h-5" />
          Call Agent
        </button>
      </div>
      {/* Tab Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { key: 'tasks', label: 'Tasks' },
          { key: 'meetings', label: 'Meetings' },
          { key: 'outbound', label: 'Outbound Campaign' },
          { key: 'emails', label: 'Emails' },
          ...(Conversation && Conversation?.conversations?.length > 0 ? [{ key: 'conversation', label: 'Conversation' }] : [])
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition border ${activeTab === tab.key
              ? 'bg-blue-600 text-white border-blue-600 shadow'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow p-4 rounded-md mt-2">
        {activeTab === 'tasks' && (
          <LeadTasks user_id={userID} lead_id={leads._id} team_id={leads.teamId} />
        )}
        {activeTab === 'meetings' && (
          <MeetingLeads user_id={userID} lead_id={leads._id} team_id={leads.teamId} />
        )}
        {activeTab === 'emails' && (
          <LeadEmail userid={userID} />
        )}
        {activeTab === 'outbound' && (
          <OutBoundCalls user_id={userID} page="lead" lead_id={leads._id} team_id={leads.teamId} />
        )}
        {activeTab === 'conversation' && (
          <ConversationCom conversations={Conversation?.conversations} />
        )}
      </div>
    </div>
  );
};

export default LeadsDetailsTable;
