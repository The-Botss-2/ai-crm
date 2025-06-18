'use client';
import { fetcher } from "@/lib/fetcher";
import { Lead } from "@/types/lead";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import LeadsDetailsTable from "./LeadsDetailsTable";
import Loading from "./Loading";
interface LeadProps {
    leadId: string,
    teamId: string,
    userID: string
}
interface ConversationType {
    id: number;
    conversation_id: string;
    transcript: string;
    summary: string;
    duration_seconds: number;
    cost: number;
    created_at: string;
  }
const LeadDetails = ({ leadId, teamId, userID }: LeadProps) => {
    const searchParams = useSearchParams();
    const { data: rawLeads, error, mutate } = useSWR<Lead>(`/api/lead?id=${leadId}`, fetcher);
    const { data: Conversation, error:ConversationError, mutate: mutateConversation } = useSWR<ConversationType>(`https://callingagent.thebotss.com/api/conversations/by-lead?lead_id=${leadId}`, fetcher);

    return (
        rawLeads ? (<div className="p-4">
            <LeadsDetailsTable
                leads={rawLeads}
                error={!!error}
                userID={userID}
                Conversation={Conversation}
                mutateConversation={mutateConversation}
                teamId={teamId}
            /></div>) : (
            <Loading />
        )
    )
};

export default LeadDetails;
