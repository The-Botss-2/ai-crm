'use client';

import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { toast } from 'react-hot-toast';

interface MeetingFormProps {
    initialValues: any;
    isEdit: boolean;
    isPreview: boolean;
    onClose: () => void;
    reload: () => void;
}

const MeetingForm: React.FC<MeetingFormProps> = ({
    initialValues,
    isEdit,
    isPreview,
    onClose,
    reload,
}) => {
    const handleSubmit = async (values: any, { setSubmitting }: any) => {
        const toastId = toast.loading(isEdit ? 'Updating meeting...' : 'Adding meeting...');
        try {
            const payload = { ...values };
            if (!isEdit) delete (payload as any)._id;

            const res = await fetch(
                isEdit ? `/api/meeting?id=${values._id}` : `/api/meetings`,
                {
                    method: isEdit ? 'PATCH' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                }
            );

            if (!res.ok) throw new Error(await res.text());

            toast.success(isEdit ? 'Meeting updated' : 'Meeting added', { id: toastId });
            reload();
            onClose();
        } catch (err: any) {
            toast.error('Something went wrong', { id: toastId });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Formik
            initialValues={{
                ...initialValues,
                startTime: initialValues.startTime
                    ? new Date(initialValues.startTime).toISOString().slice(0, 16)
                    : '',
                endTime: initialValues.endTime
                    ? new Date(initialValues.endTime).toISOString().slice(0, 16)
                    : '',
            }}
            validate={(values) => {
                const errors: any = {};
                if (new Date(values.startTime) >= new Date(values.endTime)) {
                    errors.endTime = 'End time must be after start time';
                }
                if (!values.attendees || values.attendees.length === 0) {
                    errors.attendees = 'At least one attendee is required';
                }
                return errors;
            }}
            onSubmit={handleSubmit}
        >
            {({ isSubmitting, values, setFieldValue, errors, touched }) => {
                const [attendeeInput, setAttendeeInput] = useState('');

                const addAttendee = () => {
                    const trimmed = attendeeInput.trim().toLowerCase();
                    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);

                    if (!trimmed || !isEmail) {
                        toast.error('Please enter a valid email address');
                        return;
                    }

                    if (values.attendees.includes(trimmed)) {
                        toast.error('This email is already added');
                        return;
                    }

                    setFieldValue('attendees', [...values.attendees, trimmed]);
                    setAttendeeInput('');
                };

                const removeAttendee = (email: string) => {
                    setFieldValue(
                        'attendees',
                        values.attendees.filter((e: string) => e !== email)
                    );
                };

                return (
                    <Form className="space-y-4">
                        <Field name="title">
                            {({ field }: any) => (
                                <input {...field} className="w-full border border-gray-200 text-xs p-2 rounded" placeholder="Title" required />
                            )}
                        </Field>

                        <Field name="description">
                            {({ field }: any) => (
                                <textarea {...field} className="w-full border border-gray-200 text-xs p-2 rounded" placeholder="Description" rows={2} required />
                            )}
                        </Field>

                        <div className="flex gap-2">
                            <Field name="startTime">
                                {({ field }: any) => (
                                    <input
                                        {...field}
                                        type="datetime-local"
                                        className="w-full border border-gray-200 text-xs p-2 rounded "
                                        required
                                    />
                                )}
                            </Field>

                            <Field name="endTime">
                                {({ field, meta }: any) => (
                                    <>
                                        <input
                                            {...field}
                                            type="datetime-local"
                                            className={`w-full border border-gray-200 text-xs p-2 rounded  ${meta.touched && meta.error ? 'border border-gray-200 text-xs-red-500' : ''
                                                }`}
                                            required
                                        />
                                        {meta.touched && meta.error && (
                                            <p className="text-red-500 text-xs mt-1">{meta.error}</p>
                                        )}
                                    </>
                                )}
                            </Field>
                        </div>

                        <Field name="platform" as="select" className="w-full border border-gray-200 text-xs p-2 rounded">
                            <option value="zoom">Zoom</option>
                            <option value="meet">Google Meet</option>
                            <option value="teams">Microsoft Teams</option>
                        </Field>

                        <Field name="link">
                            {({ field }: any) => (
                                <input {...field} className="w-full border border-gray-200 text-xs p-2 rounded" placeholder="Meeting Link" required />
                            )}
                        </Field>

                        <Field name="meetingType" as="select" className="w-full border border-gray-200 text-xs p-2 rounded">
                            <option value="online">Online</option>
                            <option value="onsite">Onsite</option>
                        </Field>

                        {/* Attendees Field */}
                        <div>

                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    value={attendeeInput}
                                    onChange={(e) => setAttendeeInput(e.target.value)}
                                    className="w-full border border-gray-200 text-xs p-2 rounded"
                                    placeholder="Add attendee email"
                                />
                                <button
                                    type="button"
                                    onClick={addAttendee}
                                    className="bg-blue-100 text-blue-800 px-3 py-2 rounded hover:font-semibold text-xs"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {values.attendees.map((email: string) => (
                                    <span
                                        key={email}
                                        className="bg-blue-100 text-xs text-blue-800  px-2 py-1 rounded-full flex items-center"
                                    >
                                        {email}
                                        <button
                                            type="button"
                                            onClick={() => removeAttendee(email)}
                                            className="ml-2 text-blue-600 hover:text-red-600"
                                        >
                                            ✕
                                        </button>
                                    </span>
                                ))}
                            </div>
                            {touched.attendees && errors.attendees && typeof errors.attendees === 'string' && (
                                <p className="text-red-500 text-xs mt-1">{errors.attendees}</p>
                            )}
                        </div>

                        <Field name="notes">
                            {({ field }: any) => (
                                <textarea {...field} className="w-full border border-gray-200 text-xs p-2 rounded" placeholder="Notes" rows={2} />
                            )}
                        </Field>

                        {/* Show after-meeting fields only in edit */}
                        {isEdit && (
                            <>
                                <Field name="followUpStatus">
                                    {({ field }: any) => (
                                        <input {...field} className="w-full border border-gray-200 text-xs p-2 rounded" placeholder="Follow-up Status" />
                                    )}
                                </Field>

                                <Field name="recordingUrl">
                                    {({ field }: any) => (
                                        <input {...field} className="w-full border border-gray-200 text-xs p-2 rounded" placeholder="Recording URL" />
                                    )}
                                </Field>

                                <Field name="transcript">
                                    {({ field }: any) => (
                                        <textarea {...field} className="w-full border border-gray-200 text-xs p-2 rounded" placeholder="Transcript" rows={2} />
                                    )}
                                </Field>

                                <Field name="aiSummary">
                                    {({ field }: any) => (
                                        <textarea {...field} className="w-full border border-gray-200 text-xs p-2 rounded" placeholder="AI Summary" rows={2} />
                                    )}
                                </Field>
                            </>
                        )}

                        {!isPreview && (
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-blue-100 text-blue-800 px-3 py-2 rounded hover:font-semibold text-xs"
                                >
                                    {isEdit ? 'Update Meeting' : 'Create Meeting'}
                                </button>

                                {isEdit && (
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            const toastId = toast.loading('Deleting meeting...');
                                            try {
                                                const res = await fetch(`/api/meeting?id=${initialValues._id}`, {
                                                    method: 'DELETE',
                                                });

                                                if (!res.ok) throw new Error(await res.text());

                                                toast.success('Meeting deleted', { id: toastId });
                                                reload();
                                                onClose();
                                            } catch (err: any) {
                                                toast.error('Failed to delete meeting', { id: toastId });
                                            }
                                        }}
                                        className="bg-red-100 text-red-800 px-3 py-2 rounded hover:font-semibold text-xs"
                                    >
                                        Delete Meeting
                                    </button>
                                )}
                            </div>
                        )}

                    </Form>
                );
            }}
        </Formik>
    );
};

export default MeetingForm;
