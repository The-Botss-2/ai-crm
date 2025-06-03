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

  form?.fields.forEach((field) => {
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
    <div className="max-w-4xl my-18 mx-auto bg-white rounded-xl shadow-lg ring-1 ring-gray-200">
      <header className="bg-white border-b border-gray-200 rounded-t-xl p-8">
        <h1 className="text-3xl font-extrabold text-gray-900">{form.title}</h1>
        <p className="mt-2 text-gray-600 text-base max-w-prose">
          {form.description || 'Please fill out the form below'}
        </p>
      </header>

      <Formik initialValues={initialValues} validate={validate} onSubmit={handleSubmit}>
        {({ isSubmitting }) => (
          <Form className="p-8 space-y-10 max-h-[calc(100vh-180px)] overflow-y-auto">
            {/* Email and Username */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-semibold text-gray-700"
                >
                  Email <span className="text-red-600">*</span>
                </label>
                <FormikField
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className="block w-full rounded-lg border border-gray-300 px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-base"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-600 text-xs mt-1"
                />
              </div>

              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="block mb-2 text-sm font-semibold text-gray-700"
                >
                  Username <span className="text-red-600">*</span>
                </label>
                <FormikField
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Your name"
                  className="block w-full rounded-lg border border-gray-300 px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-base"
                />
                <ErrorMessage
                  name="username"
                  component="div"
                  className="text-red-600 text-xs mt-1"
                />
              </div>
            </div>

            {/* Dynamic Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {form.fields.map((field) => (
                <FieldRenderer key={field.label} field={field} />
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-400 disabled:opacity-50 transition"
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
