'use client';

import { useEffect, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { toast } from 'react-hot-toast';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

interface TaskFormProps {
    initialValues: any;
    isEdit: boolean;
    onClose: () => void;
    reload: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({
    initialValues,
    isEdit,
    onClose,
    reload,
}) => {
    const [loading, setLoading] = useState(false);
    const { data: meetings = [] } = useSWR(`/api/meetings?team=${initialValues.teamId}`, fetcher);
    const { data: teamData } = useSWR(`/api/team?id=${initialValues.teamId}`, fetcher);
    const { data: leads = [] } = useSWR(`/api/leads?team=${initialValues.teamId}`, fetcher);


    const handleDelete = async () => {
        const confirmDelete = confirm('Are you sure you want to delete this task?');
        if (!confirmDelete) return;

        setLoading(true);
        const toastId = toast.loading('Deleting task...');
        try {
            const res = await fetch(`/api/task?id=${initialValues._id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error(await res.text());

            toast.success('Task deleted', { id: toastId });
            reload();
            onClose();
        } catch (err) {
            toast.error('Failed to delete task', { id: toastId });
        } finally {
            setLoading(false);
        }
    };


    return (
        <Formik
            initialValues={initialValues}
            validate={(values) => {
                const errors: any = {};
                if (!values.title) errors.title = 'Title is required';
                return errors;
            }}
            onSubmit={async (values, { setSubmitting }) => {
                const toastId = toast.loading(isEdit ? 'Updating task...' : 'Creating task...');
                try {
                    const payload = { ...values };

                    if (!isEdit) {
                        delete payload._id; // never send _id on create
                    }

                    // Remove empty references
                    if (!payload.assignedTo) delete payload.assignedTo;
                    if (!payload.leadId) delete payload.leadId;
                    if (!payload.meetingId) delete payload.meetingId;


                    const res = await fetch(
                        isEdit ? `/api/task?id=${values._id}` : '/api/tasks',
                        {
                            method: isEdit ? 'PATCH' : 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload),
                        }
                    );

                    if (!res.ok) throw new Error(await res.text());

                    toast.success(isEdit ? 'Task updated' : 'Task created', { id: toastId });
                    reload();
                    onClose();
                } catch (err) {
                    toast.error('Failed to save task', { id: toastId });
                } finally {
                    setSubmitting(false);
                }
            }}

        >
            {({ isSubmitting, values, setFieldValue }) => (
                <Form className="space-y-4">
                    <Field name="title">
                        {({ field }: any) => (
                            <input
                                {...field}
                                placeholder="Title"
                                required
                                className="w-full border border-gray-200 text-xs p-2 rounded"
                            />
                        )}
                    </Field>

                    <Field name="description">
                        {({ field }: any) => (
                            <textarea
                                {...field}
                                placeholder="Description"
                                className="w-full border border-gray-200 text-xs p-2 rounded"
                                rows={2}
                            />
                        )}
                    </Field>

                    <div className="flex gap-2">
                        <Field name="status" as="select" className="w-full border text-xs border-gray-200 p-2 rounded">
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="blocked">Blocked</option>
                        </Field>

                        <Field name="priority" as="select" className="w-full border text-xs border-gray-200 p-2 rounded">
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </Field>
                    </div>

                    <Field name="dueDate">
                        {({ field }: any) => (
                            <input
                                {...field}
                                type="datetime-local"
                                className="w-full border text-xs border-gray-200 p-2 rounded"
                            />
                        )}
                    </Field>


                    <Field name="assignedTo" as="select" className="w-full border text-xs border-gray-200 p-2 rounded">

                        <option value="">Assign to</option>
                        {teamData?.team?.members?.map((m: any) => (
                            <option key={m.profile._id} value={m.profile._id}>
                                {m.profile.name} ({m.role})
                            </option>
                        ))}
                    </Field>

                    <Field name="leadId" as="select" className="w-full border text-xs border-gray-200 p-2 rounded">
                        <option value="">Link to Lead</option>
                        {leads.map((lead: any) => (
                            <option key={lead._id} value={lead._id}>
                                {lead.name || lead.email}
                            </option>
                        ))}
                    </Field>

                    <Field name="meetingId" as="select" className="w-full border text-xs border-gray-200 p-2 rounded">
                        <option value="">Link to Meeting</option>
                        {meetings.map((m: any) => (
                            <option key={m._id} value={m._id}>
                                {m.title}
                            </option>
                        ))}
                    </Field>

                    <div className="flex gap-2 mt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-blue-100 text-blue-800 px-3 py-2 rounded hover:font-semibold text-xs"
                        >
                            {isEdit ? 'Update Task' : 'Create Task'}
                        </button>

                        {isEdit && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={loading}
                                className="bg-red-100 text-red-800 px-3 py-2 rounded hover:font-semibold text-xs"
                            >
                                Delete Task
                            </button>
                        )}
                    </div>
                </Form>
            )}
        </Formik>
    );
};

export default TaskForm;
