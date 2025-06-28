// components/CampaignEditForm.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import DatePicker from 'react-datepicker';

interface CampaignEditFormProps {
    initialValues: {
        agentName: string;
        firstMessage: string;
        systemPrompt: string;
        phoneNumber: string;
        contactsFileName: string;
        scheduledAt: Date | null;
        status: 'draft' | 'scheduled' | 'running' | 'stopped';
    };
    onSubmit: (values: any) => void;
    onCancel: () => void;
    agentId: string;
    userId: string;
}

const API_BASE_URL = `${process.env.CALLING_AGENT_URL}/api`;

const CampaignEditForm: React.FC<CampaignEditFormProps> = ({
    initialValues,
    onSubmit,
    onCancel,
    agentId,
    userId,
}) => {
    const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
    const [fileName, setFileName] = useState(initialValues.contactsFileName);

    useEffect(() => {
        const loadPhoneNumbers = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/elevenlabs/free-numbers?crm_user_id=${userId}`);
                setPhoneNumbers(response.data.map((p: any) => p.phone_number));
            } catch (error) {
                toast.error('Failed to load phone numbers.');
            }
        };
        loadPhoneNumbers();
    }, [userId]);

    return (
        <Formik
            initialValues={initialValues}
            validate={(values) => {
                const errors: any = {};
                if (!values.agentName.trim()) errors.agentName = 'Agent name is required';
                if (!values.firstMessage.trim()) errors.firstMessage = 'First message is required';
                if (!values.systemPrompt.trim()) errors.systemPrompt = 'System prompt is required';
                if (!values.phoneNumber) errors.phoneNumber = 'Phone number is required';
                if (values.status === 'scheduled' && !values.scheduledAt) {
                    errors.scheduledAt = 'Scheduled time is required';
                }
                return errors;
            }}
            onSubmit={async (values, { setSubmitting }) => {
                try {
                    const response = await axios.put(`${API_BASE_URL}/update_campaign/${agentId}`, {
                        crm_user_id: userId,
                        agent_name: values.agentName,
                        first_message: values.firstMessage,
                        system_prompt: values.systemPrompt,
                        phone_number: values.phoneNumber,
                        contacts_file: fileName,
                        scheduled_at: values.scheduledAt ? values.scheduledAt.toISOString() : null,
                        status: values.status,
                    });

                    toast.success('Campaign updated successfully!');
                    onSubmit(response.data);
                } catch (error) {
                    toast.error('Failed to update campaign. Please try again.');
                }
                setSubmitting(false);
            }}
        >
            {({ isSubmitting, values, errors, touched, setFieldValue }) => (
                <Form className="space-y-6">
                    {/* Agent Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Agent Name</label>
                        <Field
                            name="agentName"
                            type="text"
                            className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Alice Johnson"
                        />
                        {errors.agentName && touched.agentName && <p className="text-red-600">{errors.agentName}</p>}
                    </div>

                    {/* First Message */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">First Message</label>
                        <Field
                            name="firstMessage"
                            type="text"
                            className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Hello, this is Alice..."
                        />
                        {errors.firstMessage && touched.firstMessage && <p className="text-red-600">{errors.firstMessage}</p>}
                    </div>

                    {/* System Prompt */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">System Prompt</label>
                        <Field
                            name="systemPrompt"
                            as="textarea"
                            rows={4}
                            className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Speak politely and ask how you can help."
                        />
                        {errors.systemPrompt && touched.systemPrompt && <p className="text-red-600">{errors.systemPrompt}</p>}
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <Field as="select" name="phoneNumber" className="w-full p-3 border border-gray-300 rounded">
                            <option value="">Select</option>
                            {phoneNumbers.map((num) => (
                                <option key={num} value={num}>
                                    {num}
                                </option>
                            ))}
                        </Field>
                        {errors.phoneNumber && touched.phoneNumber && <p className="text-red-600">{errors.phoneNumber}</p>}
                    </div>

                    {/* Upload Contacts */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Upload Contacts</label>
                        <input
                            type="file"
                            accept=".csv,.xlsx,.txt"
                            onChange={(e) => {
                                if (e.target.files?.[0]) {
                                    setFileName(e.target.files[0].name);
                                }
                            }}
                        />
                        {fileName && <p className="text-sm mt-1">Selected: {fileName}</p>}
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <Field as="select" name="status" className="w-full p-3 border border-gray-300 rounded">
                            <option value="draft">Draft</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="running">Running</option>
                            <option value="stopped">Stopped</option>
                        </Field>
                    </div>

                    {/* Scheduled At */}
                    {values.status === 'scheduled' && (
                        <div>
                            <label className="block mb-1 text-sm font-medium">Schedule Time</label>
                            <DatePicker
                                selected={values.scheduledAt}
                                onChange={(date) => setFieldValue('scheduledAt', date)}
                                showTimeSelect
                                timeIntervals={15}
                                dateFormat="yyyy-MM-dd HH:mm"
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                            {errors.scheduledAt && touched.scheduledAt && (
                                <p className="text-red-600 text-sm">{errors.scheduledAt}</p>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="bg-gray-100 text-gray-800 px-5 py-2 rounded text-sm hover:bg-gray-200"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-blue-600 text-white px-5 py-2 rounded text-sm hover:bg-blue-700 transition"
                        >
                            {isSubmitting ? 'Updating...' : 'Update Campaign'}
                        </button>
                    </div>
                </Form>
            )}
        </Formik>
    );
};

export default CampaignEditForm;
