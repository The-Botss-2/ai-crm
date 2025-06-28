'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { KeyedMutator } from 'swr';
import { IoClose } from 'react-icons/io5';

// Interface for phone number option
interface PhoneNumber {
    phone_number: string;
}

// Interface for form values
interface FormValues {
    agent_name: string;
    system_prompt: string;
    first_message: string;
    phone_number: string;
}

// Interface for component props
interface AddAgentDialogProps {
    crmUserId: string;
    mutate: KeyedMutator<any>;
}

export default function AddAgentDialog({ crmUserId, mutate }: AddAgentDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);

    // Fetch free phone numbers
    useEffect(() => {
        const fetchPhoneNumbers = async () => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_CALLING_AGENT_URL}/api/elevenlabs/free-numbers?crm_user_id=${crmUserId}`,
                    {
                        headers: { accept: 'application/json' },
                    }
                );
                setPhoneNumbers(response.data);
            } catch (error) {
                console.error('Error fetching phone numbers:', error);
                toast.error('Failed to fetch phone numbers');
            }
        };
        fetchPhoneNumbers();
    }, [crmUserId]);

    // Formik setup with validation schema
    const formik = useFormik<FormValues>({
        initialValues: {
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
        onSubmit: async (values, { resetForm }) => {
            const toastId = toast.loading('Creating agent...');
            try {
                await axios.post(
                    `${process.env.NEXT_PUBLIC_CALLING_AGENT_URL}/api/elevenlabs/agent-setup`,
                    new URLSearchParams({
                        crm_user_id: crmUserId,
                        agent_name: values.agent_name,
                        system_prompt: values.system_prompt,
                        first_message: values.first_message,
                        phone_number: values.phone_number,
                    }).toString(),
                    {
                        headers: {
                            accept: 'application/json',
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                    }
                );
                toast.success('Agent created successfully!', { id: toastId });
                resetForm();
                setIsOpen(false);
                mutate(); // Refresh the agent list
            } catch (error) {
                console.error('Error creating agent:', error);
                toast.error('Failed to create agent. Please try again.', { id: toastId });
            }
        },
    });

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="rounded-md bg-blue-600 px-4 py-2 text-xs text-white hover:bg-blue-700"
            >
                Add New Agent
            </button>

            <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <DialogPanel className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
                        <DialogTitle className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-3 mb-4 flex justify-between items-center">
                            Add New Agent
                            <button onClick={() => setIsOpen(false)} className="text-gray-600 hover:text-gray-900">
                                <IoClose size={18} />
                            </button>
                        </DialogTitle>
                        <form onSubmit={formik.handleSubmit} className="mt-4 space-y-4">
                            <div>
                                <label htmlFor="agent_name" className="block text-sm font-medium text-gray-700">
                                    Agent Name
                                </label>
                                <input
                                    id="agent_name"
                                    name="agent_name"
                                    type="text"
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-gray-900"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.agent_name}
                                />
                                {formik.touched.agent_name && formik.errors.agent_name ? (
                                    <p className="mt-1 text-sm text-red-600">{formik.errors.agent_name}</p>
                                ) : null}
                            </div>

                            <div>
                                <label htmlFor="system_prompt" className="block text-sm font-medium text-gray-700">
                                    System Prompt
                                </label>
                                <textarea
                                    id="system_prompt"
                                    name="system_prompt"
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-gray-900"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.system_prompt}
                                />
                                {formik.touched.system_prompt && formik.errors.system_prompt ? (
                                    <p className="mt-1 text-sm text-red-600">{formik.errors.system_prompt}</p>
                                ) : null}
                            </div>

                            <div>
                                <label htmlFor="first_message" className="block text-sm font-medium text-gray-700">
                                    First Message
                                </label>
                                <textarea
                                    id="first_message"
                                    name="first_message"
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-gray-900"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.first_message}
                                />
                                {formik.touched.first_message && formik.errors.first_message ? (
                                    <p className="mt-1 text-sm text-red-600">{formik.errors.first_message}</p>
                                ) : null}
                            </div>

                            <div>
                                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                                    Phone Number
                                </label>
                                <select
                                    id="phone_number"
                                    name="phone_number"
                                    className="mt-1 block w-full rounded-md border text-gray-900 border-gray-300 p-2"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.phone_number}
                                >
                                    <option value="">Select a phone number</option>
                                    {phoneNumbers.map((phone, key) => (
                                        <option key={key} value={phone.phone_number}>
                                            {phone.phone_number}
                                        </option>
                                    ))}
                                </select>
                                {formik.touched.phone_number && formik.errors.phone_number ? (
                                    <p className="mt-1 text-sm text-red-600">{formik.errors.phone_number}</p>
                                ) : null}
                            </div>

                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="rounded-md bg-gray-300 px-4 py-2 text-xs text-gray-700 hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formik.isSubmitting}
                                    className="rounded-md bg-blue-600 px-4 py-2 text-xs text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {formik.isSubmitting ? 'Creating...' : 'Create Agent'}
                                </button>
                            </div>
                        </form>
                    </DialogPanel>
                </div>
            </Dialog>
        </>
    );
}