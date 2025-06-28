import { auth } from '@/auth';
import { notFound } from 'next/navigation';
import axios from 'axios';
import AgentForm from '@/components/AgentForm';

interface AgentData {
  agent_name: string;
  system_prompt: string;
  knowledge_text: string;
  first_message: string;
  phone_number: string;
}

async function fetchAgentData(agentid: string, crmUserId: string): Promise<AgentData> {
  try {
    const response = await axios.get(
      `${process.env.CALLING_AGENT_URL}/api/elevenlabs/agent/${agentid}?crm_user_id=${crmUserId}`,
      { headers: { 'accept': 'application/json' } }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching agent data:', error);
    throw new Error('Failed to load agent data');
  }
}

export default async function Page({ params }: { params: Promise<{ agentid: string }> }) {
  const { agentid } = await params;
  const session = await auth();
  if (!session) return notFound();

  let agentData: AgentData | null = null;
  let error: string | null = null;

  const crmUserId = session.user?.id;
  if (!crmUserId) {
    return notFound();
  }

  try {
    agentData = await fetchAgentData(agentid, crmUserId);
  } catch (err) {
    error = err instanceof Error ? err.message : 'An unexpected error occurred';
  }

  return (
    <div className="container mx-auto p-6">
      <AgentForm agentId={agentid} crmUserId={crmUserId} initialData={agentData} error={error} />
    </div>
  );
}