// components/OutBoundCalls.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { IoAdd, IoClose } from 'react-icons/io5';
import CampaignForm from './CampaignForm';
import CampaignTable from './CampaignTable';
import axios, { Axios } from 'axios';
import toast from 'react-hot-toast';
import CampaignDetailsForm from './CampaignDetailsForm';
import CampaignEditForm from './CampaignEditForm';
import { useParams } from 'next/navigation';

export interface Campaign {
  id: string;
  agent_name: string;
  firstMessage: string;
  systemPrompt: string;
  source_number: string;
  contacts_file: string; // just store the uploaded filename
  scheduled_at: Date | null;
  status: 'draft' | 'scheduled' | 'running' | 'stopped';
}
export interface AddCampaign {
  id: string;
  agentName: string;
  firstMessage: string;
  systemPrompt: string;


}
interface props {
  user_id: string;
  page?: string;
  lead_id?: string;
  team_id?: string;
}
export default function OutBoundCalls({ user_id ,page, lead_id, team_id}: props) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
  ]);
    const { id: teamId } = useParams<{ id: string }>();
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [agendId, setAgendId] = useState<string | null>('');
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'scheduled' | 'running' | 'stopped'>('all');
  const [step, setStep] = useState<'agent' | 'details'>('agent');
  const Api_BASE_URL = `${process.env.NEXT_PUBLIC_CALLING_AGENT_URL}/api`
  const handleAddClick = () => {
    setEditingCampaign(null);
    setDrawerOpen(true);
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setDrawerOpen(true);
  };

  const handleDelete = (id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  };

  const handleStop = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'stopped' } : c))
    );
  };
  const fetchCampaigns = async () => {
    setCampaignLoading(true);
    const path = page === 'lead' ? `/campaign-by-lead?lead_id=${lead_id}` : `/outbound-campaigns?crm_user_id=${user_id}`;
      try {
        const res = await axios.get(`${Api_BASE_URL}${path}`);
        console.log(res, 'campaigns');
      setCampaignLoading(false);
        setCampaigns(res?.data || []);
      } catch {
        setCampaignLoading(false);
        // toast.error('Failed to load campaigns');
      }
    };
 useEffect(() => {
  if (user_id){
    fetchCampaigns();
  }
  }, [user_id]);
  const handleSubmitForm = async (
    values: Omit<AddCampaign, 'id' | 'status'>
  ) => {
    if (editingCampaign) {
      // Existing logic...
      return;
    }

    const toastId = toast.loading('Creating agent...');
    try {
      const response = await axios.post(
        `${Api_BASE_URL}/create_outbound_agent`, {
        crm_user_id: user_id,
        agent_name: values.agentName,
        system_prompt: values.systemPrompt,
        first_message: values.firstMessage,
      },
        {
          headers: {
            accept: 'application/json',
          },
        }
      );

      const agentId = response?.data?.agent_id; // Ensure API returns agent_id
      console.log('Agent ID:', agentId,response);
      
        toast.success('Agent created successfully!', { id: toastId });
        setAgendId(agentId);
        setStep('details');
      // Save agentId and move to step 2
    } catch (error: any) {
      console.error('Error creating agent:', error);
      toast.error(error?.response?.data?.detail || 'Failed to create agent. Please try again.', { id: toastId });
    }
  };
  // NEW: compute filtered campaigns based on searchTerm + statusFilter
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      // 1) Status filter
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;

      // 2) Search term filter (case‐insensitive match against agentName, phoneNumber, or firstMessage)
      const lcTerm = searchTerm.trim().toLowerCase();
      if (!lcTerm) return true;

      return (
        c.agent_name.toLowerCase().includes(lcTerm) ||
        c.source_number.toLowerCase().includes(lcTerm) ||
        c.firstMessage.toLowerCase().includes(lcTerm)
      );
    });
  }, [campaigns, searchTerm, statusFilter]);

  return (
    <div className="p-3 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-300">
        <h1 className="text-2xl font-bold text-gray-900">Outbound Campaigns</h1>

        <button
          onClick={handleAddClick}
          className="bg-blue-100 text-blue-800 px-4 py-2 rounded hover:font-semibold text-xs cursor-pointer"
        >
          Add Campaign
        </button>
      </div>

      {/* NEW: Search + Status Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-3 md:space-y-0">
        {/* Search Input */}
        <div className="w-full md:w-1/5">
          <input
            type="text"
            placeholder="Search campaigns..."
            className="w-full border px-3 py-2 rounded text-xs border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-1/9">
          <select
            className="w-full border px-3 py-2 rounded text-xs border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as
                | 'all'
                | 'draft'
                | 'scheduled'
                | 'running'
                | 'stopped')
            }
          >
            <option value="all">Filter by Status: All</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="running">Running</option>
            <option value="stopped">Stopped</option>
          </select>
        </div>
      </div>

      {/* Table of (filtered) campaigns */}
      <CampaignTable
        campaigns={filteredCampaigns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStop={handleStop}
        campaignLoading={campaignLoading}
        teamId={teamId}
      />

      {/* Sliding Drawer for Create/Edit */}
      {drawerOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40">
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl p-6 overflow-y-auto z-50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {step === 'agent' ? 'Create Agent' : 'Campaign Details'}
              </h2>
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  setStep('agent');
                  setAgendId(null);
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                <IoClose size={20} />
              </button>
            </div>

            {editingCampaign && (
              <CampaignEditForm
                initialValues={{
                  agentName: editingCampaign.agent_name,
                  firstMessage: editingCampaign.firstMessage,
                  systemPrompt: editingCampaign.systemPrompt,
                  phoneNumber: editingCampaign.source_number,
                  contactsFileName: editingCampaign.contacts_file,
                  scheduledAt: editingCampaign.scheduled_at,
                  status: editingCampaign.status,
                }}
                onSubmit={(updatedCampaign) => {
                  setCampaigns((prevCampaigns) =>
                    prevCampaigns.map((c) => (c.id === updatedCampaign.id ? updatedCampaign : c))
                  );
                  setDrawerOpen(false);
                }}
                onCancel={() => setDrawerOpen(false)}
                agentId={editingCampaign.id}
                userId={user_id}
              />
            )}
            {!editingCampaign ? (

              step === 'agent' ? (
                <CampaignForm
                  initialValues={{
                    agentName: '',
                    firstMessage: '',
                    systemPrompt: '',

                  }}
                  onSubmit={handleSubmitForm}
                  onCancel={() => {
                    setDrawerOpen(false);
                    setStep('agent');
                  }}
                  user_id={user_id}
                  agendId=""
                />
              ) : (
                <CampaignDetailsForm
                  agentId={agendId!}
                  user_id={user_id}
                  onSuccess={() => {
                    toast.success('Campaign created successfully!');
                    setDrawerOpen(false);
                    setStep('agent');
                    setAgendId(null);
                  }}
                  fetchCampaigns={fetchCampaigns}
                  page={page}
                  lead_id={lead_id}
                  team_id={team_id || teamId}
                />
              )

            ) : (null)}
          </div>
        </div>
      )}

    </div>
  );
}
