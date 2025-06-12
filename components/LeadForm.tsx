'use client';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Lead } from '@/types/lead';
import toast from 'react-hot-toast';
import { axiosInstance } from '@/lib/fetcher';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface Props {
  initialValues: Partial<Lead>;
  onClose: () => void;
  isEdit: boolean;
  isPreview?: boolean;
  reload: () => void;
  submittedBy: string;
  userId?: string;
}

export default function LeadForm({ userId, initialValues, onClose, isEdit, isPreview, reload, submittedBy }: Props) {
  const validate = (values: Partial<Lead>) => {
    const errors: Partial<Record<keyof Lead, string>> = {};
    if (!values.name) errors.name = 'Required';
    if (!values.email) errors.email = 'Required';
    if (!values.phone) errors.phone = 'Required';

    return errors;
  };
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const API_BASE_URL = 'https://callingagent.thebotss.com/api';

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
console.log(initialValues, 'initialValues');

  return (
    <Formik initialValues={initialValues} validate={validate} onSubmit={handleSubmit} enableReinitialize>
      {({ isSubmitting, errors, touched }) => (
        <Form className="space-y-6">
          {[
            { label: 'Name', name: 'name', type: 'text' },
            { label: 'Email', name: 'email', type: 'email' },
            { label: 'Phone', name: 'phone', type: 'tel' },
            { label: 'Company', name: 'company', type: 'text' },
          ].map(({ label, name, type }) => {
            const showError = !!(errors[name as keyof Lead] && touched[name as keyof Lead]);
            return (
              <div key={name}>
                <label htmlFor={name} className="block mb-1 text-sm font-medium text-gray-700">
                  {label}
                </label>
                <Field
                  id={name}
                  name={name}
                  type={type}
                  disabled={isPreview}
                  className={`w-full border rounded-md px-3 py-2 text-sm placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500
                    transition
                    ${showError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
                  `}
                  placeholder={label}
                />
                <ErrorMessage
                  name={name}
                  component="div"
                  className="text-red-600 text-xs mt-1 font-semibold select-none"
                />
              </div>
            );
          })}

          <div>
            <label htmlFor="status" className="block mb-1 text-sm font-medium text-gray-700">
              Status
            </label>
            <Field
              as="select"
              id="status"
              name="status"
              disabled={isPreview}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 transition"
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="proposal">Proposal</option>
              <option value="negotiation">Negotiation</option>
              <option value="closed_won">Closed Won</option>
              <option value="closed_lost">Closed Lost</option>
            </Field>
            <ErrorMessage
              name="status"
              component="div"
              className="text-red-600 text-xs mt-1 font-semibold select-none"
            />
          </div>
         
          <div>
            <label htmlFor="source" className="block mb-1 text-sm font-medium text-gray-700">
              Source
            </label>
            <Field
              id="source"
              name="source"
              disabled={isPreview}
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 transition"
              placeholder="Source"
            />
            <ErrorMessage
              name="source"
              component="div"
              className="text-red-600 text-xs mt-1 font-semibold select-none"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block mb-1 text-sm font-medium text-gray-700">
              Notes
            </label>
            <Field
              as="textarea"
              id="notes"
              name="notes"
              disabled={isPreview}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 resize-none transition"
              placeholder="Additional notes"
            />
            <ErrorMessage
              name="notes"
              component="div"
              className="text-red-600 text-xs mt-1 font-semibold select-none"
            />
          </div>

          {!isPreview && (
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold text-sm transition disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : isEdit ? 'Update Lead' : 'Add Lead'}
            </button>
          )}
        </Form>
      )}
    </Formik>
  );
}
