// components/CampaignForm.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-hot-toast';

interface FormValues {
  agentName: string;
  firstMessage: string;
  systemPrompt: string;
 
}

interface CampaignFormProps {
  initialValues: FormValues;
  onSubmit: (values: FormValues) => void;
  onCancel: () => void;
  user_id: string,
  agendId: string
}

const CampaignForm: React.FC<CampaignFormProps> = ({ initialValues, onSubmit, onCancel}) => {
  
  return (
    <Formik
      initialValues={initialValues}
      validate={(values) => {
        const errors: Partial<Record<keyof FormValues, string>> = {};
        if (!values.agentName.trim()) {
          errors.agentName = 'Required';
        }
        if (!values.firstMessage.trim()) {
          errors.firstMessage = 'Required';
        }
        if (!values.systemPrompt.trim()) {
          errors.systemPrompt = 'Required';
        }
  
        return errors;
      }}
      onSubmit={(values, { setSubmitting }) => {
        toast.success('Saving campaign...');
        onSubmit({
          ...values,
        });
        setSubmitting(false);
      }}
    >
      {({ isSubmitting,errors, touched }) => (
        <Form className="space-y-6">
          {/* Agent Name */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Agent Name</label>
            <Field
              name="agentName"
              type="text"
              className="w-full border border-gray-300 text-sm p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Alice Johnson"
            />
            {errors.agentName && touched.agentName && (
              <p className="text-red-600 text-sm mt-1">{errors.agentName}</p>
            )}
          </div>

          {/* First Message */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">First Message</label>
            <Field
              name="firstMessage"
              type="text"
              className="w-full border border-gray-300 text-sm p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Hello, this is Alice..."
            />
            {errors.firstMessage && touched.firstMessage && (
              <p className="text-red-600 text-sm mt-1">{errors.firstMessage}</p>
            )}
          </div>

          {/* System Prompt */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">System Prompt</label>
            <Field
              name="systemPrompt"
              as="textarea"
              rows={4}
              className="w-full border border-gray-300 text-sm p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Speak politely and ask how you can help."
            />
            {errors.systemPrompt && touched.systemPrompt && (
              <p className="text-red-600 text-sm mt-1">{errors.systemPrompt}</p>
            )}
          </div>
      
          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6">
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
              {isSubmitting ? 'Saving...' : 'Create'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default CampaignForm;
