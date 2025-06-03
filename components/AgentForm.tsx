'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import Breadcrumb from '@/components/Breadcrumb';
import { useFormik } from 'formik';
import * as Yup from 'yup';

interface AgentData {
    agent_name: string;
    system_prompt: string;
    first_message: string;
    phone_number: string;
}

interface PhoneNumber {
    phone_number: string;
    sid: string;
}

interface AgentFormProps {
    agentId: string;
    crmUserId: string;
    initialData: AgentData | null;
    error: string | null;
}

const fetchPhoneNumbers = async (crmUserId: string): Promise<PhoneNumber[]> => {
    const response = await axios.get(
        `https://callingagent.thebotss.com/api/elevenlabs/free-numbers?crm_user_id=${crmUserId}`,
        { headers: { accept: 'application/json' } }
    );
    return response.data;
};

export default function AgentForm({ agentId, crmUserId, initialData, error }: AgentFormProps) {
    const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
    const [phoneError, setPhoneError] = useState<string | null>(null);

    // Fetch phone numbers
    useEffect(() => {
        const loadPhoneNumbers = async () => {
            try {
                const data = await fetchPhoneNumbers(crmUserId);
                setPhoneNumbers(data);
            } catch (err) {
                setPhoneError(err instanceof Error ? err.message : 'Failed to load phone numbers');
                toast.error('Failed to load phone numbers');
            }
        };
        loadPhoneNumbers();
    }, [crmUserId]);

    // Formik setup with validation schema
    const formik = useFormik<AgentData>({
        initialValues: initialData || {
            agent_name: '',
            system_prompt: '',
            first_message: '',
            phone_number: '',
        },
        validationSchema: Yup.object({
            agent_name: Yup.string()
                .min(2, 'Agent name must be at least 2 characters')
                .required('Agent name is required'),
            system_prompt: Yup.string()
                .min(10, 'System prompt must be at least 10 characters')
                .required('System prompt is required'),
            first_message: Yup.string()
                .min(5, 'First message must be at least 5 characters')
                .required('First message is required'),
            phone_number: Yup.string()
                .matches(/^\+\d{10,15}$/, 'Invalid phone number format')
                .required('Phone number is required'),
        }),
        onSubmit: async (values) => {
            const toastId = toast.loading('Updating agent...');
            try {
                const form = new FormData();
                form.append('crm_user_id', crmUserId);
                form.append('agent_name', values.agent_name);
                form.append('system_prompt', values.system_prompt);
                form.append('first_message', values.first_message);
                form.append('phone_number', values.phone_number);

                await axios.patch(
                    `https://callingagent.thebotss.com/api/elevenlabs/agent/${agentId}`,
                    form,
                    {
                        headers: {
                            accept: 'application/json',
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );
                toast.success('Agent updated successfully', { id: toastId });
            } catch (err) {
                toast.error('Failed to update agent', { id: toastId });
            }
        },
        enableReinitialize: true, // Reinitialize form when initialData changes
    });

    // Combine phone numbers with initialData.phone_number if not already included
    const availablePhoneNumbers = [
        ...(initialData?.phone_number && !phoneNumbers.some(p => p.phone_number === initialData.phone_number)
            ? [{ phone_number: initialData.phone_number, sid: 'initial' }]
            : []),
        ...phoneNumbers,
    ];

    // Check if no phone numbers are available
    const hasNoPhoneNumbers = phoneNumbers.length === 0;

    if (error) {
        return (
            <div>
                <Breadcrumb />
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error Loading Agent</h3>
                            <p className="mt-1 text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (phoneError) {
        return (
            <div>
                <Breadcrumb />
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error Loading Phone Numbers</h3>
                            <p className="mt-1 text-sm text-red-700">{phoneError}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>

            <Breadcrumb />
            <div className="my-6">
                <h1 className="text-2xl font-bold dark:text-white text-slate-900">Edit Agent</h1>
                <p className="mt-1 text-sm text-gray-600">Update details for agent ID: {agentId}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 shadow overflow-hidden sm:rounded-md">
                <form onSubmit={formik.handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="agent_name" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Agent Name
                            </label>
                            <input
                                type="text"
                                name="agent_name"
                                id="agent_name"
                                value={formik.values.agent_name}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="mt-1 block w-full rounded-md px-4 py-3 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-slate-800 dark:border-gray-600 dark:text-gray-200"
                            />
                            {formik.touched.agent_name && formik.errors.agent_name ? (
                                <p className="mt-1 text-sm text-red-600">{formik.errors.agent_name}</p>
                            ) : null}
                        </div>
                        <div>
                            <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Phone Number
                            </label>
                            {hasNoPhoneNumbers ? (
                                <>
                                    <input
                                        type="text"
                                        name="phone_number"
                                        id="phone_number"
                                        value={formik.values.phone_number}
                                        readOnly
                                        className="mt-1 block w-full rounded-md px-4 py-3 border-gray-300 shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed sm:text-sm dark:bg-slate-700 dark:border-gray-600 dark:text-gray-400"
                                        placeholder="No phone number assigned"
                                    />
                                    <p className="mt-1 text-sm text-gray-700">
                                        No new numbers available. The current phone number cannot be edited.
                                    </p>
                                </>
                            ) : (
                                <select
                                    name="phone_number"
                                    id="phone_number"
                                    value={formik.values.phone_number}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="mt-1 block w-full rounded-md px-4 py-3 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-slate-800 dark:border-gray-600 dark:text-gray-200"
                                >
                                    <option value="">Select a phone number</option>
                                    {availablePhoneNumbers.map((phone) => (
                                        <option key={phone.sid} value={phone.phone_number}>
                                            {phone.phone_number}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {formik.touched.phone_number && formik.errors.phone_number ? (
                                <p className="mt-1 text-sm text-red-600">{formik.errors.phone_number}</p>
                            ) : null}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div>
                            <label htmlFor="system_prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                System Prompt
                            </label>
                            <textarea
                                name="system_prompt"
                                id="system_prompt"
                                value={formik.values.system_prompt}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                rows={6}
                                className="mt-1 block w-full rounded-md px-4 py-3 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-slate-800 dark:border-gray-600 dark:text-gray-200"
                            />
                            {formik.touched.system_prompt && formik.errors.system_prompt ? (
                                <p className="mt-1 text-sm text-red-600">{formik.errors.system_prompt}</p>
                            ) : null}
                        </div>
                        <div>
                            <label htmlFor="first_message" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                First Message
                            </label>
                            <textarea
                                rows={6}
                                name="first_message"
                                id="first_message"
                                value={formik.values.first_message}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="mt-1 block w-full rounded-md px-4 py-3 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-slate-800 dark:border-gray-600 dark:text-gray-200"
                            />
                            {formik.touched.first_message && formik.errors.first_message ? (
                                <p className="mt-1 text-sm text-red-600">{formik.errors.first_message}</p>
                            ) : null}
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            disabled={formik.isSubmitting}
                            className="inline-flex px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {formik.isSubmitting ? 'Updating...' : 'Update Agent'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}