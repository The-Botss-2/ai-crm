'use client';
import React, { useState } from 'react';
import { Lead } from '@/types/lead';
import { useTeamRole } from '@/context/TeamRoleContext';
import MeetingLeads from './MeetingLeads';
import LeadTasks from './LeadTasks';
// import OutBoundCalls from './OutBoundCalls';
import Loading from './Loading';
import { PhoneCall, UserIcon } from 'lucide-react';
import ConversationCom from './Conversation';
import toast from 'react-hot-toast';
import axios from 'axios';
import LeadEmail from './LeadEmail';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { X, Loader } from 'lucide-react'; // Import icons from lucide-react
import { socialFetcher } from '@/lib/socialFetcher';
import InlineResponses from './InlineResponses';
import LeadAssignModal from './LeadAssignModal';
import Overview from './Overview';

interface LeadsTableProps {
  leads?: Lead;
  error?: boolean;
  userID: string;
  mutateConversation: any;
  Conversation: any;
  teamId: any
}

const LeadsDetailsTable: React.FC<LeadsTableProps> = ({ leads, error, teamId, userID, mutateConversation, Conversation }) => {
  const { role,access, loading } = useTeamRole();
  const [activeTab, setActiveTab] = useState<'tasks' | 'meetings' | 'emails' | 'outbound' | 'conversation' | 'form' | 'overview'>('overview');
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [isLeadAssignModalOpen, setIsLeadAssignModalOpen] = useState(false); // Modal state
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null); // Selected campaign state
  const [isSubmitting, setIsSubmitting] = useState(false); // Track submission state
  const { data: status, error: statusError, isLoading, mutate } = useSWR('/api/integrations', socialFetcher);

  // Fetch campaigns
  const { data: campaigns = [], isLoading: campaignsLoading, error: campaignsError } = useSWR<any[]>(
    `https://callingagent.thebotss.com/api/outbound-campaigns?crm_user_id=${userID}`,
    fetcher
  );
  const { data: teamData } = useSWR(`/api/team?id=${teamId}`, fetcher);

  if (loading) return <Loading />;
  if (error || !leads) {
    return (
      <div className="text-center text-gray-500 py-6">
        {error ? 'Failed to load lead' : 'No lead found'}
      </div>
    );
  }



  const handleCall = async (agentId: string, number: string) => {
    if (!leads) return;

    const payload = {
      crm_user_id: userID,
      agent_id: agentId,
      lead_id: leads._id,
      to_number: leads.phone,
      from_number: number,
    };

    const toastId = toast.loading('Initiating call...', { duration: 2000 }); // Infinite loading toast
    setIsSubmitting(true);

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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCampaignSelection = (campaignId: string, agentId: string, number: string) => {
    console.log(campaignId, agentId, 'agentId');
    setSelectedCampaign(campaignId);
    setIsModalOpen(false); // Close the modal
    handleCall(agentId, number); // Call with the selected agent_id
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
          <div><strong>Phone:</strong> {leads?.phone || 'No phone number available'}</div>
          <div><strong>Email:</strong> {leads?.email}</div>
          <div><strong>Status:</strong> {leads?.status}</div>
          <div><strong>Notes:</strong> {leads?.notes || 'No notes available'}</div>
          <div><strong>Source:</strong> {leads?.source || 'No source available'}</div>
        </div>
      </div>
      {/* Call Button */}
      <div className="flex gap-4 justify-end">
        {role === 'admin' ? (
        <button
          onClick={() => {
            setIsLeadAssignModalOpen(true);
          }} // Open the modal when clicked
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-lg transition duration-300"
        >
          Assign Lead
        </button>):(<></>)}
        <button
          onClick={() => {
            if (!leads?.phone) {
              toast.error('Lead phone number is not available.');
            } else {
              setIsModalOpen(true);
            }
          }} // Open the modal when clicked
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-lg transition duration-300"
        >
          <PhoneCall className="w-5 h-5" />
          Call Agent
        </button>
      </div>


      {isLeadAssignModalOpen ? (
        <LeadAssignModal
          isLeadAssignModalOpen={isLeadAssignModalOpen}
          setIsLeadAssignModalOpen={setIsLeadAssignModalOpen}
          teamData={teamData}
          leads={leads}
        />
      ) : null}


      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Select a Campaign</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-600 hover:text-gray-900 focus:outline-none"
              >
                <X size={24} />
              </button>
            </div>
            {campaignsLoading ? (
              <div className="flex justify-center items-center">
                <Loader size={24} className="animate-spin text-blue-600" />
              </div>
            ) : campaignsError || campaigns.length === 0 ? (
              <div className="text-center text-gray-600">No campaigns available</div>
            ) : (
              <div className="space-y-4">
                <select
                  className="w-full p-2 border rounded-md "
                  onChange={(e) => setSelectedCampaign(e.target.value)}
                  value={selectedCampaign || ''}
                >
                  <option value="" disabled>Select an Agent</option>
                  {campaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.agent_name}
                    </option>
                  ))}
                </select>

                <div className="mt-4 text-right">
                  <button
                    onClick={() => {
                      const selectedCampaignData = campaigns.find(campaign => campaign.id === Number(selectedCampaign));
                      if (selectedCampaignData) {
                        handleCampaignSelection(selectedCampaignData.id, selectedCampaignData.agent_id, selectedCampaignData?.source_number);
                      }
                    }}
                    className={`bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isSubmitting || !selectedCampaign}
                  >
                    {isSubmitting ? 'Calling...' : 'Select and Call'}
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-4 w-full bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Close
            </button>
          </div>
        </div>
      )}


      {/* Tab Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'tasks', label: 'Tasks' },
          { key: 'meetings', label: 'Meetings' },
          // { key: 'outbound', label: 'Outbound Campaign' },
          ...(status && status?.email?.connected ? [{ key: 'emails', label: 'Emails' }] : []),
          ...(Conversation && Conversation?.conversations?.length > 0 ? [{ key: 'conversation', label: 'Conversation' }] : []),
          { key: 'form', label: 'Form Responses' },
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
          <LeadTasks user_id={userID} lead_id={leads._id} team_id={leads.teamId} role={role} access={access}/>
        )}
        {activeTab === 'meetings' && (
          <MeetingLeads user_id={userID} lead_id={leads._id} team_id={leads.teamId} role={role} access={access}/>
        )}
        {activeTab === 'emails' && (
          <LeadEmail userid={userID} page={"lead"} source_email={leads?.email} />
        )}
        {/* {activeTab === 'outbound' && (
          <OutBoundCalls user_id={userID} page="lead" lead_id={leads._id} team_id={leads.teamId} />
        )} */}
        {activeTab === 'conversation' && (
          <ConversationCom conversations={Conversation?.conversations} />
        )}
        {activeTab === 'form' && (
          <InlineResponses email={leads?.email} />
        )}
        {activeTab === 'overview' && (
          <Overview userid={userID} lead_id={leads?._id} team_id={leads?.teamId} email = {leads?.email}/>
        )}
      </div>
    </div>
  );
};

export default LeadsDetailsTable;
