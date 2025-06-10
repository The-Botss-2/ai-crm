'use client';
import { fetcher } from "@/lib/fetcher";
import { Lead } from "@/types/lead";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import LeadsDetailsTable from "./LeadsDetailsTable";
interface LeadProps {
    leadId: string,
    teamId: string,
    userID: string
}
const LeadDetails = ({ leadId, teamId, userID }: LeadProps) => {
    const searchParams = useSearchParams();
    const { data: rawLeads, error, mutate } = useSWR<Lead>(`/api/lead?id=${leadId}`, fetcher);
    return (
    <div className="p-4">
    <LeadsDetailsTable
        leads={rawLeads || null}
        error={!!error}
        userID={userID}
    /></div>)
};

export default LeadDetails;
