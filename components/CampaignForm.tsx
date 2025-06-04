// components/CampaignForm.tsx
'use client';

import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-hot-toast';

interface FormValues {
  agentName: string;
  firstMessage: string;
  systemPrompt: string;
  phoneNumber: string;
  contactsFileName: string;
  scheduledAt: Date | null;
  statusAction: 'startNow' | 'schedule';
}

interface CampaignFormProps {
  initialValues: FormValues;
  onSubmit: (values: FormValues) => void;
  onCancel: () => void;
}

const dummyPhoneNumbers = [
  '+1 (555) 123-4567',
  '+1 (555) 234-5678',
  '+1 (555) 345-6789',
  '+1 (555) 456-7890',
];

const CampaignForm: React.FC<CampaignFormProps> = ({ initialValues, onSubmit, onCancel }) => {
  const [fileName, setFileName] = useState(initialValues.contactsFileName || '');

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
        if (!values.phoneNumber) {
          errors.phoneNumber = 'Select a phone number';
        }
        if (values.statusAction === 'schedule' && !values.scheduledAt) {
          errors.scheduledAt = 'Pick a date & time';
        }
        return errors;
      }}
      onSubmit={(values, { setSubmitting }) => {
        toast.success('Saving campaign...');
        onSubmit({
          ...values,
          contactsFileName: fileName,
        });
        setSubmitting(false);
      }}
    >
      {({ isSubmitting, setFieldValue, values, errors, touched }) => (
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

          {/* Phone Number Selector */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Phone Number</label>
            <Field
              name="phoneNumber"
              as="select"
              className="w-full border border-gray-300 text-sm p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select a phone number --</option>
              {dummyPhoneNumbers.map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </Field>
            {errors.phoneNumber && touched.phoneNumber && (
              <p className="text-red-600 text-sm mt-1">{errors.phoneNumber}</p>
            )}
          </div>

          {/* Upload Contacts */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Upload Contacts</label>
            <input
              type="file"
              accept=".csv, .xlsx, .txt"
              className="w-full text-sm"
              onChange={(e) => {
                if (e.currentTarget.files && e.currentTarget.files.length > 0) {
                  setFileName(e.currentTarget.files[0].name);
                }
              }}
            />
            {fileName && (
              <p className="text-gray-600 text-sm mt-1">Selected: {fileName}</p>
            )}
          </div>

          {/* Schedule Options */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Field
                type="radio"
                name="statusAction"
                value="startNow"
                id="startNow"
                onClick={() => setFieldValue('statusAction', 'startNow')}
                className="cursor-pointer"
              />
              <label htmlFor="startNow" className="text-sm text-gray-700 cursor-pointer">
                Start Now
              </label>

              <Field
                type="radio"
                name="statusAction"
                value="schedule"
                id="schedule"
                onClick={() => setFieldValue('statusAction', 'schedule')}
                className="cursor-pointer"
              />
              <label htmlFor="schedule" className="text-sm text-gray-700 cursor-pointer">
                Schedule for Later
              </label>
            </div>

            {values.statusAction === 'schedule' && (
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Pick Date & Time
                </label>
                <DatePicker
                  selected={values.scheduledAt}
                  onChange={(date) => setFieldValue('scheduledAt', date)}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="yyyy-MM-dd HH:mm"
                  className="w-full border border-gray-300 text-sm p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholderText="Select date & time"
                />
                {errors.scheduledAt && touched.scheduledAt && (
                  <p className="text-red-600 text-sm mt-1">{errors.scheduledAt}</p>
                )}
              </div>
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
              {initialValues.agentName ? 'Update' : 'Create'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default CampaignForm;
