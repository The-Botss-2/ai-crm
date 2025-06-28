'use client';
import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PhoneCall, User, ClipboardList, Mic } from 'lucide-react';
import Loading from './Loading';

interface Campaign {
  id: number;
  agent_id: string;
  agent_name: string;
  source_number: string;
  lead_id: string;
  contacts_file: string;
  status: string;
  created_at: string;
}

interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  notes: string;
  createdAt: string;
}

interface Conversation {
  id: number;
  conversation_id: string;
  transcript: string;
  summary: string;
  duration_seconds: number;
  cost: number;
  created_at: string;
}

interface Props {
  teamId: string;
  out_id: string;
  userID: string;
}

const SingleCampaign = ({ teamId, out_id, userID }: Props) => {
  const { data: campaigns = [], isLoading: campaignsLoading } = useSWR<Campaign[]>(
    `${process.env.CALLING_AGENT_URL}/api/outbound-campaigns?crm_user_id=${userID}`,
    fetcher
  );

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [lead, setLead] = useState<Lead | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const fetchConversations = async (lead_id: string) => {
    try {
      const { data } = await axios.get(`${process.env.CALLING_AGENT_URL}/api/conversations/by-lead?lead_id=${lead_id}`);
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchLead = async (lead_id: string) => {
    try {
      const res = await fetch(`/api/lead/?id=${lead_id}`);
      const data = await res.json();
      if (data) {
        setLead(data);
        fetchConversations(data._id);
      }
    } catch (err) {
      toast.error('Failed to load lead data');
      console.error(err);
    }
  };

  useEffect(() => {
    const selected = campaigns.find((c) => String(c.id) === out_id);
    if (selected) {
      setCampaign(selected);
      fetchLead(selected.lead_id);
    }
  }, [campaigns, out_id]);

  const handleCall = async () => {
    if (!campaign || !lead) return;

    const payload = {
      crm_user_id: userID,
      agent_id: campaign.agent_id || 'agent_01jxfjbbxvfhf9mng76nq6pe7n',
      lead_id: campaign.lead_id,
      to_number: lead.phone,
      from_number: campaign.source_number,
    };

    const toastId = toast.loading('Calling agent...');
    try {
      const res = await axios.post(`${process.env.CALLING_AGENT_URL}/api/outbound-single-call`, payload);

      if (res.data && res.data.success) {
        fetchConversations(lead._id);
        toast.success('Call initiated successfully!', { id: toastId });
      } else {
        toast.error('Call failed or no response received.', { id: toastId });
      }
    } catch (error) {
      toast.error('Call failed. Please try again.', { id: toastId });
      console.error('Call error:', error);
    }
  };

  if (campaignsLoading) return <Loading />;
  if (!campaign || !lead) return <p className="text-gray-500">Campaign or lead not found.</p>;

  return (
    <div className="space-y-6 p-2">
      {/* Campaign Info */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="flex items-center text-xl font-semibold mb-4 gap-2">
          <ClipboardList className="w-6 h-6 text-blue-600" />
          Campaign Details
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
          <div><strong>ID:</strong> #{campaign.id}</div>
          <div><strong>Status:</strong> {campaign.status}</div>
          <div><strong>Agent:</strong> {campaign.agent_name}</div>
          <div><strong>Source Number:</strong> {campaign.source_number}</div>
          <div className="col-span-2">
            <strong>Created At:</strong> {new Date(campaign.created_at).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Lead Info */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="flex items-center text-xl font-semibold mb-4 gap-2">
          <User className="w-6 h-6 text-green-600" />
          Lead Information
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
          <div><strong>Name:</strong> {lead.name}</div>
          <div><strong>Phone:</strong> {lead.phone}</div>
          <div><strong>Email:</strong> {lead.email}</div>
          <div><strong>Status:</strong> {lead.status}</div>
          <div className="col-span-2">
            <strong>Notes:</strong> {lead.notes || 'No notes available'}
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

      {/* Conversations */}
      {conversations.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="flex items-center text-xl font-semibold mb-4 gap-2">
            <Mic className="w-6 h-6 text-purple-600" />
            Conversations
          </h2>
          {conversations.map((conv) => (
            <div key={conv.id} className="border-t pt-4 mt-4 text-sm">
              <p className="text-gray-800"><strong>Summary:</strong> {conv.summary}</p>
              <p className="text-gray-600 mt-2 whitespace-pre-wrap">{conv.transcript}</p>
              <p className="text-xs text-gray-400 mt-2">
                ⏱ {conv.duration_seconds}s &nbsp;&nbsp; | &nbsp;&nbsp; 💵 ${conv.cost.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SingleCampaign;
