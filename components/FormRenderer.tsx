'use client';

import { Formik, Form, Field as FormikField, ErrorMessage } from 'formik';
import toast from 'react-hot-toast';
import axios from 'axios';
import FieldRenderer from './FieldRenderer';

type Field = {
    label: string;
    type: string;
    placeholder?: string;
    isRequired: boolean;
    options?: string[];
};

type FormData = {
    _id: string;
    title: string;
    description?: string;
    category: string;
    fields: Field[];
};

export default function FormRenderer({ form }: { form: FormData }) {
    const initialValues: Record<string, any> = {
        email: '',
        username: '',
    };

    form.fields.forEach((field) => {
        initialValues[field.label] = field.type === 'checkbox' ? [] : '';
    });

    const validate = (values: Record<string, any>) => {
        const errors: Record<string, string> = {};

        if (!values.email) errors.email = 'Email is required';
        if (!values.username) errors.username = 'Username is required';

        for (const field of form.fields) {
            if (field.isRequired && !values[field.label]) {
                errors[field.label] = `${field.label} is required`;
            }
        }

        return errors;
    };

    const handleSubmit = async (
        values: Record<string, any>,
        { setSubmitting, resetForm }: any
    ) => {
        const toastId = toast.loading('Submitting response...');
        try {
            const responsePayload = {
                email: values.email,
                username: values.username,
                form: form._id,
                responses: Object.entries(values)
                    .filter(([key]) => key !== 'email' && key !== 'username')
                    .map(([label, value]) => ({ label, value })),
            };

            await axios.post('/api/form-responses', responsePayload);
            toast.success('Form submitted successfully!', { id: toastId });
            resetForm();
        } catch (err) {
            console.error(err);
            toast.error('Failed to submit form', { id: toastId });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-5xl h-full bg-white dark:bg-slate-900 rounded-lg shadow">
            <div className='bg-slate-800 rounded-s-lg rounded-e-lg p-6'>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {form.title}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {form.description || 'Please fill out the form below'}
                </p>

            </div>
            <Formik initialValues={initialValues} validate={validate} onSubmit={handleSubmit}>
                {({ isSubmitting }) => (
                    <Form className="space-y-4 overflow-y-auto h-[calc(100vh-200px)]">

                        <div className='grid grid-cols-2 gap-4 bg-slate-800 p-6'>
                            {/* Email */}
                            <div>
                                <label className="block mb-1 text-xs font-medium">Email *</label>
                                <FormikField
                                    name="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    className="w-full border px-3 py-2 rounded text-xs dark:border-gray-700 border-gray-200"
                                />
                                <ErrorMessage
                                    name="email"
                                    component="div"
                                    className="text-red-500 text-xs mt-1"
                                />
                            </div>

                            {/* Username */}
                            <div>
                                <label className="block mb-1 text-xs font-medium">Username *</label>
                                <FormikField
                                    name="username"
                                    type="text"
                                    placeholder="Enter your name"
                                    className="w-full border px-3 py-2 rounded text-xs dark:border-gray-700 border-gray-200"
                                />
                                <ErrorMessage
                                    name="username"
                                    component="div"
                                    className="text-red-500 text-xs mt-1"
                                />
                            </div>
                        </div>


                        <div className='p-6 flex flex-col gap-4'>
                            <div className='grid grid-cols-2 gap-4'>
                                {/* Render Dynamic Fields */}
                                {form.fields.map((field) => (
                                    <FieldRenderer key={field.label} field={field} />
                                ))}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-fit px-4 bg-blue-100 text-blue-800 py-2 rounded text-sm font-semibold"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Response'}
                            </button>
                        </div>


                    </Form>
                )}
            </Formik>
        </div>
    );
}
