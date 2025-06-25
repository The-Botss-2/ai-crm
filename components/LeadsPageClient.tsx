'use client';

import useSWR from 'swr';
import { useState, useMemo } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Lead } from '@/types/lead';
import { fetcher } from '@/lib/fetcher';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import LeadPanel from './LeadPanel';
import LeadsTable from './LeadsTable';
import LeadsToolbar from './LeadsToolbar';
import { useTeamRole } from '@/context/TeamRoleContext';

export default function LeadsPage({ user_id }: any) {
    const { role, access } = useTeamRole();
    const searchParams = useSearchParams();
    const router = useRouter();
    const params = useParams<{ id: string }>()
    const team_id = params.id;

    const initialSearch = searchParams.get('search') || '';
    const initialSort = searchParams.get('sort') || 'createdAt-desc';
    const [search, setSearch] = useState(initialSearch);
    const [sortOption, setSortOption] = useState(initialSort);
    const [editLead, setEditLead] = useState<Lead | null>(null);
    const [previewLead, setPreviewLead] = useState<Lead | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<Lead | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const [sortBy, order] = sortOption.split('-') as [string, 'asc' | 'desc'];

    const { data: rawLeads, error, mutate } = useSWR<Lead[]>(`/api/leads?team=${team_id}`, fetcher);

    const updateQueryParams = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(key, value);
        router.push(`?${params.toString()}`);
    };

    const leads = useMemo(() => {
        if (!rawLeads) return [];

        let filtered = rawLeads.filter(
            (lead) =>
                lead.name.toLowerCase().includes(search.toLowerCase()) ||
                lead.email.toLowerCase().includes(search.toLowerCase())
        );

        filtered.sort((a, b) => {
            let aVal = a[sortBy as keyof Lead];
            let bVal = b[sortBy as keyof Lead];

            if (sortBy === 'createdAt') {
                aVal = typeof aVal === 'string' || typeof aVal === 'number' ? new Date(aVal).getTime().toString() : '';
                bVal = typeof bVal === 'string' || typeof bVal === 'number' ? new Date(bVal).getTime().toString() : '';
            } else {
                aVal = aVal?.toString().toLowerCase();
                bVal = bVal?.toString().toLowerCase();
            }

            if (aVal < bVal) return order === 'asc' ? -1 : 1;
            if (aVal > bVal) return order === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [rawLeads, search, sortBy, order]);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-300">
                <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
             {role === 'admin' || access?.leads?.includes('write') ?     <button
                    onClick={() => {
                        setEditLead(null);
                        setDrawerOpen(true);
                    }}
                    className="bg-blue-100 text-blue-800 px-4 py-2 rounded hover:font-semibold text-xs cursor-pointer"
                >
                    Add Lead
                </button> : null}
            </div>

            <LeadsToolbar
                search={search}
                sortOption={sortOption}
                onSearchChange={(value) => {
                    setSearch(value);
                    updateQueryParams('search', value);
                }}
                onSortChange={(value) => {
                    setSortOption(value);
                    updateQueryParams('sort', value);
                }}
            />

            <LeadsTable
                leads={leads}
                onEdit={(lead) => {
                    setEditLead(lead);
                    setDrawerOpen(true);
                }}
                onDelete={(lead) => setConfirmDelete(lead)}
                onPreview={(lead) => setPreviewLead(lead)}
                error={!!error}
                role={role}
                access={access}
            />

            <LeadPanel
                mode={previewLead ? 'preview' : 'edit'}
                lead={previewLead || editLead}
                isOpen={drawerOpen || !!previewLead}
                onClose={() => {
                    setDrawerOpen(false);
                    setEditLead(null);
                    setPreviewLead(null);
                }}
                teamId={team_id}
                userId={user_id}
                mutate={mutate}
            />

            <ConfirmDeleteModal
                lead={confirmDelete}
                onClose={() => setConfirmDelete(null)}
                teamId={team_id}
                userId={user_id}
                mutate={mutate}
            />
        </div>
    );
}
