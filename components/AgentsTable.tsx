'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import toast from 'react-hot-toast';
import Link from 'next/link';
import AddAgentDialog from './AddAgent';

interface Agent {
    agent_id: string;
    name: string;
    tags: string[];
    created_at_unix_secs: number;
    access_info: {
        is_creator: boolean;
        creator_name: string;
        creator_email: string;
        role: string;
    };
}

interface AgentsResponse {
    agents: Agent[];
    next_cursor: string | null;
    has_more: boolean;
}

interface AgentsTableProps {
    crmUserId: string;
}

// Fetcher function for SWR
const fetcher = (url: string) => axios.get(url, { headers: { 'accept': 'application/json' } }).then(res => res.data);

export default function AgentsTable({ crmUserId }: AgentsTableProps) {
    const { data, error, mutate, isLoading } = useSWR<AgentsResponse>(
        `https://callingagent.thebotss.com/api/elevenlabs/agents?crm_user_id=${crmUserId}`,
        fetcher
    );

    const handleDelete = async (agentId: string) => {
        // Show loading toast
        const loadingToast = toast.loading('Deleting agent...');

        try {
            await axios.delete(`https://callingagent.thebotss.com/api/elevenlabs/agent/${agentId}?crm_user_id=${crmUserId}`, {
                headers: { 'accept': 'application/json' },
            });

            // Dismiss loading toast and show success
            toast.dismiss(loadingToast);
            toast.success('Agent deleted successfully');

            mutate(
                (currentData: AgentsResponse | undefined) => {
                    if (!currentData) return currentData;
                    return {
                        ...currentData,
                        agents: currentData.agents.filter(agent => agent.agent_id !== agentId),
                    };
                },
                false
            );
        } catch (error) {
            console.error('Failed to delete agent:', error);

            // Dismiss loading toast and show error
            toast.dismiss(loadingToast);
            toast.error('Failed to delete agent');
            mutate();
        }
    };

    const handleAddSuccess = () => {
        mutate(); // Refresh the agent list
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-6">
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-gray-400 animate-spin" viewBox="0 0 24 24" fill="none">
                                <path d="M12 4V2m0 20v-2m8-8h2m-20 0H2m16.364-6.364l-1.414-1.414M5.636 18.364l1.414-1.414m12.728 0l-1.414 1.414M5.636 5.636l1.414 1.414" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-gray-800">Loading Agents</h3>
                            <p className="mt-1 text-sm text-gray-600">Fetching agent data...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error Loading Agents</h3>
                            <p className="mt-1 text-sm text-red-700">{error.message || 'An unexpected error occurred'}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white text-slate-900">Agents</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Manage your agents for user ID: {crmUserId}
                    </p>
                </div>
                <AddAgentDialog crmUserId={crmUserId} mutate={mutate} />
            </div>



            {data?.agents.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No agents</h3>
                    <p className="mt-1 text-sm text-gray-500">No agents found for your account.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 shadow overflow-hidden sm:rounded-md">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 dark:bg-slate-900">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Creator
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created At
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {data?.agents.map((agent, index) => (
                                    <tr key={agent.agent_id} className={index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50 dark:bg-slate-800'}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                                            {agent.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {agent.access_info.creator_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {agent.access_info.role}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(agent.created_at_unix_secs * 1000).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex gap-4">
                                            <button
                                                onClick={() => handleDelete(agent.agent_id)}
                                                className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 hover:bg-red-200"
                                            >
                                                Delete
                                            </button>
                                            <Link
                                                href={`/team/${crmUserId}/integrations/eleven-labs/${agent.agent_id}`}
                                                className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 hover:bg-green-200"
                                            >
                                                Edit
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-900 px-6 py-3 border-t border-gray-200">
                        <p className="text-sm text-gray-700">
                            Showing <span className="font-medium">{data?.agents.length}</span> agent{data?.agents.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}