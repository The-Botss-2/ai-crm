// components/CampaignDetailsForm.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import DatePicker from 'react-datepicker';
import axios from 'axios';
import toast from 'react-hot-toast';
import 'react-datepicker/dist/react-datepicker.css';

interface CampaignDetailsFormProps {
  agentId: string;
  user_id: string;
  onSuccess: () => void;
}

const CampaignDetailsForm: React.FC<CampaignDetailsFormProps> = ({ agentId, user_id, onSuccess }) => {
  const [fileName, setFileName] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const Api_BASE_URL = 'https://callingagent.thebotss.com/api'

  useEffect(() => {
    const loadNumbers = async () => {
      try {
        const res = await axios.get(`${Api_BASE_URL}/elevenlabs/free-numbers?crm_user_id=${user_id}`);
        setPhoneNumbers(res.data.map((p: any) => p.phone_number));
      } catch {
        toast.error('Failed to load phone numbers');
      }
    };
    loadNumbers();
  }, [user_id]);
  return (
    <Formik
      initialValues={{
        phoneNumber: '',
        contactsFileName: '',
        scheduledAt: null as Date | null,
        statusAction: 'startNow' as 'startNow' | 'schedule',
      }}
      validate={(values) => {
        const errors: any = {};
        if (!values.phoneNumber) errors.phoneNumber = 'Required';
        if (values.statusAction === 'schedule' && !values.scheduledAt) errors.scheduledAt = 'Pick a date';
        return errors;
      }}
      onSubmit={async (values) => {
        const toastId = toast.loading('Scheduling campaign...');
        try {
          await axios.post(`${Api_BASE_URL}/schedule_campaign`, {
            agent_id: agentId,
            crm_user_id: user_id,
            phone_number: values.phoneNumber,
            contacts_file: fileName, // Optional: Upload logic separately
            scheduled_at: values.statusAction === 'schedule' ? values.scheduledAt?.toISOString() : new Date().toISOString(),
          });

          toast.success('Campaign scheduled!', { id: toastId });
          onSuccess();
        } catch (err:any) {
          toast.error(err?.response?.data?.detail || 'Failed to schedule campaign', { id: toastId });
        }
      }}
    >
      {({ setFieldValue, values, errors, touched }) => (
        <Form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <Field
              as="select"
              name="phoneNumber"
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">Select</option>
              {phoneNumbers.map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </Field>
            {errors.phoneNumber && touched.phoneNumber && (
              <p className="text-red-600 text-sm">{errors.phoneNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Upload Contacts</label>
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

          <div className="flex gap-4">
            <label>
              <Field type="radio" name="statusAction" value="startNow" />
              <span className="ml-2 text-sm">Start Now</span>
            </label>
            <label>
              <Field type="radio" name="statusAction" value="schedule" />
              <span className="ml-2 text-sm">Schedule</span>
            </label>
          </div>

          {values.statusAction === 'schedule' && (
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

          <div className="flex justify-end gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Submit Campaign
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default CampaignDetailsForm;
