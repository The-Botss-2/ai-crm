// components/OutBoundCalls.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { IoAdd, IoClose } from 'react-icons/io5';
import CampaignForm from './CampaignForm';
import CampaignTable from './CampaignTable';

export interface Campaign {
    id: string;
    agentName: string;
    firstMessage: string;
    systemPrompt: string;
    phoneNumber: string;
    contactsFileName: string; // just store the uploaded filename
    scheduledAt: Date | null;
    status: 'draft' | 'scheduled' | 'running' | 'stopped';
}

export default function OutBoundCalls({ user_id }: { user_id: string }) {
    const [campaigns, setCampaigns] = useState<Campaign[]>([
        // Example dummy campaigns
        {
            id: 'cmp1',
            agentName: 'Alice Johnson',
            firstMessage: 'Hello, this is Alice from Acme Corp.',
            systemPrompt: 'Speak politely and ask how you can help.',
            phoneNumber: '+1 (555) 123-4567',
            contactsFileName: 'contacts_jan.csv',
            scheduledAt: new Date(Date.now() + 3600_000), // one hour from now
            status: 'scheduled',
        },
        {
            id: 'cmp2',
            agentName: 'Bob Smith',
            firstMessage: 'Hey there, Bob here! Just checking in.',
            systemPrompt: 'Keep it friendly and concise.',
            phoneNumber: '+1 (555) 987-6543',
            contactsFileName: 'leads_feb.xlsx',
            scheduledAt: null,
            status: 'running',
        },
        {
            id: 'cmp3',
            agentName: 'Carol Lee',
            firstMessage: 'Good afternoon—Carol calling on behalf of XYZ Inc.',
            systemPrompt: 'Be upbeat and confirm contact availability.',
            phoneNumber: '+1 (555) 222-3333',
            contactsFileName: 'mar_contacts.csv',
            scheduledAt: null,
            status: 'draft',
        },
    ]);

    // Drawer open / editing‐campaign state
    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // NEW: search term and status filter:
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'scheduled' | 'running' | 'stopped'>('all');

    // Generate a simple unique ID:
    const generateId = () => 'cmp_' + Date.now().toString(36);

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

    const handleSubmitForm = (
        values: Omit<Campaign, 'id' | 'status'> & { statusAction: 'startNow' | 'schedule' }
    ) => {
        const newStatus: Campaign['status'] =
            values.statusAction === 'startNow' ? 'running' : 'scheduled';
        const scheduledDate = values.statusAction === 'startNow' ? new Date() : values.scheduledAt;

        if (editingCampaign) {
            // Update existing
            setCampaigns((prev) =>
                prev.map((c) =>
                    c.id === editingCampaign.id
                        ? {
                            ...c,
                            agentName: values.agentName,
                            firstMessage: values.firstMessage,
                            systemPrompt: values.systemPrompt,
                            phoneNumber: values.phoneNumber,
                            contactsFileName: values.contactsFileName,
                            scheduledAt: scheduledDate,
                            status: newStatus,
                        }
                        : c
                )
            );
        } else {
            // Create new
            const newCampaign: Campaign = {
                id: generateId(),
                agentName: values.agentName,
                firstMessage: values.firstMessage,
                systemPrompt: values.systemPrompt,
                phoneNumber: values.phoneNumber,
                contactsFileName: values.contactsFileName,
                scheduledAt: scheduledDate,
                status: newStatus,
            };
            setCampaigns((prev) => [newCampaign, ...prev]);
        }

        setDrawerOpen(false);
        setEditingCampaign(null);
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
                c.agentName.toLowerCase().includes(lcTerm) ||
                c.phoneNumber.toLowerCase().includes(lcTerm) ||
                c.firstMessage.toLowerCase().includes(lcTerm)
            );
        });
    }, [campaigns, searchTerm, statusFilter]);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
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
            />

            {/* Sliding Drawer for Create/Edit */}
            {drawerOpen && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40">
                    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl p-6 overflow-y-auto z-50">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">
                                {editingCampaign ? 'Edit Campaign' : 'New Campaign'}
                            </h2>
                            <button
                                onClick={() => {
                                    setDrawerOpen(false);
                                    setEditingCampaign(null);
                                }}
                                className="text-gray-600 hover:text-gray-900"
                            >
                                <IoClose size={20} />
                            </button>
                        </div>

                        <CampaignForm
                            initialValues={
                                editingCampaign
                                    ? {
                                        agentName: editingCampaign.agentName,
                                        firstMessage: editingCampaign.firstMessage,
                                        systemPrompt: editingCampaign.systemPrompt,
                                        phoneNumber: editingCampaign.phoneNumber,
                                        contactsFileName: editingCampaign.contactsFileName,
                                        scheduledAt: editingCampaign.scheduledAt,
                                        statusAction:
                                            editingCampaign.status === 'running'
                                                ? 'startNow'
                                                : 'schedule',
                                    }
                                    : {
                                        agentName: '',
                                        firstMessage: '',
                                        systemPrompt: '',
                                        phoneNumber: '',
                                        contactsFileName: '',
                                        scheduledAt: null,
                                        statusAction: 'startNow' as 'startNow',
                                    }
                            }
                            onSubmit={handleSubmitForm}
                            onCancel={() => {
                                setDrawerOpen(false);
                                setEditingCampaign(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
