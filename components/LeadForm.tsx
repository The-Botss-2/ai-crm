'use client';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Lead } from '@/types/lead';
import toast from 'react-hot-toast';
import { axiosInstance } from '@/lib/fetcher';

interface Props {
  initialValues: Partial<Lead>;
  onClose: () => void;
  isEdit: boolean;
  isPreview?: boolean; // Added preview mode
  reload: () => void;
  submittedBy: string;
}

export default function LeadForm({ initialValues, onClose, isEdit, isPreview, reload, submittedBy }: Props) {
  const validate = (values: Partial<Lead>) => {
    const errors: Partial<Record<keyof Lead, string>> = {};
    if (!values.name) errors.name = 'Required';
    if (!values.email) errors.email = 'Required';
    if (!values.phone) errors.phone = 'Required';
    if (!values.company) errors.company = 'Required';
    return errors;
  };

  const handleSubmit = async (values: Partial<Lead>, { setSubmitting, resetForm }: any) => {
    const toastId = toast.loading(isEdit ? 'Updating lead...' : 'Adding lead...');

    try {
      const url = isEdit ? '/api/lead' : '/api/leads';
      const method = isEdit ? 'patch' : 'post';

      await axiosInstance.request({
        url,
        method,
        params: {
          team: values.team,
          user: submittedBy,
        },
        data: values,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      toast.success(isEdit ? 'Lead updated' : 'Lead added', { id: toastId });
      reload();
      onClose();
      resetForm();
    } catch (err) {
      toast.error('Something went wrong', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik initialValues={initialValues} validate={validate} onSubmit={handleSubmit} enableReinitialize>
      {({ isSubmitting }) => (
        <Form className="space-y-4">
          <div>
            <label className="block mb-1 text-xs">Name</label>
            <Field name="name" disabled={isPreview} className="w-full border px-3 py-2 rounded text-xs dark:border-gray-700 border-gray-200 " />
            <ErrorMessage name="name" component="div" className="text-red-500 text-xs" />
          </div>

          <div>
            <label className="block mb-1 text-xs">Email</label>
            <Field name="email" disabled={isPreview} className="w-full border px-3 py-2 rounded text-xs dark:border-gray-700 border-gray-200 " />
            <ErrorMessage name="email" component="div" className="text-red-500 text-xs" />
          </div>

          <div>
            <label className="block mb-1 text-xs">Phone</label>
            <Field name="phone" disabled={isPreview} className="w-full border px-3 py-2 rounded text-xs dark:border-gray-700 border-gray-200 " />
            <ErrorMessage name="phone" component="div" className="text-red-500 text-xs" />
          </div>

          <div>
            <label className="block mb-1 text-xs">Company</label>
            <Field name="company" disabled={isPreview} className="w-full border px-3 py-2 rounded text-xs dark:border-gray-700 border-gray-200 " />
            <ErrorMessage name="company" component="div" className="text-red-500 text-xs" />
          </div>

          <div>
            <label className="block mb-1 text-xs">Status</label>
            <Field as="select" name="status" disabled={isPreview} className=" text-xs dark:border-gray-700 border-gray-200 w-full border px-3 py-2 rounded dark:bg-slate-900">
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="proposal">Proposal</option>
              <option value="negotiation">Negotiation</option>
              <option value="closed_won">Closed Won</option>
              <option value="closed_lost">Closed Lost</option>
            </Field>
            <ErrorMessage name="status" component="div" className="text-red-500 text-xs" />
          </div>

          <div>
            <label className="block mb-1 text-xs">Source</label>
            <Field name="source" disabled={isPreview} className=" text-xs dark:border-gray-700 border-gray-200 w-full border px-3 py-2 rounded" />
            <ErrorMessage name="source" component="div" className="text-red-500 text-xs" />
          </div>

          <div>
            <label className="block mb-1 text-xs">Notes</label>
            <Field as="textarea" name="notes" disabled={isPreview} rows={3} className=" text-xs dark:border-gray-700 border-gray-200 w-full border px-3 py-2 rounded" />
            <ErrorMessage name="notes" component="div" className="text-red-500 text-xs" />
          </div>

          {!isPreview && (
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-100 text-blue-800 py-2 rounded-lg font-bold text-sm "
            >
              {isSubmitting ? 'Submitting...' : isEdit ? 'Update Lead' : 'Add Lead'}
            </button>
          )}
        </Form>
      )}
    </Formik>
  );
}
