// components/CampaignDetailsForm.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import DatePicker from 'react-datepicker';
import axios from 'axios';
import toast from 'react-hot-toast';
import 'react-datepicker/dist/react-datepicker.css';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

interface CampaignDetailsFormProps {
  agentId: string;
  user_id: string;
  onSuccess: () => void;
  fetchCampaigns: () => void
  page?: string;
  lead_id?: string
  team_id?: string
}
type Payload = {
  agent_id: string;
  crm_user_id: string;
  source_number: string;
  contacts_file?: File;
  agent_name: string;
  scheduled_at?: string;
  start_immediately?: boolean;
};

const CampaignDetailsForm: React.FC<CampaignDetailsFormProps> = ({ agentId, user_id, onSuccess,fetchCampaigns ,team_id, page, lead_id}) => {
  const [file, setFile] = useState<File | null>(null);
  const { data: leads = [] } = useSWR(`/api/leads?team=${team_id}`, fetcher);

  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const Api_BASE_URL = `${process.env.CALLING_AGENT_URL}/api`

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
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    };
  };
  return (
    <Formik
      initialValues={{
        phoneNumber: '',
        contactsFile: '',
        campaignName: '',
        leadId: page === 'lead' ? lead_id : '',
        scheduledAt: null as Date | null,
        statusAction: 'startNow' as 'startNow' | 'schedule',
      }}
      validate={(values) => {
        const errors: any = {};
        if (!values.campaignName) errors.campaignName = 'Required';
        if (!values.phoneNumber) errors.phoneNumber = 'Required';
        if (!values.leadId) errors.leadId = 'Required';
        if (values.statusAction === 'schedule' && !values.scheduledAt) errors.scheduledAt = 'Pick a date';
        return errors;
      }}
      onSubmit={async (values) => {
        if (!file) {
          toast.error('File is required');
          return;
        }
        const toastId = toast.loading('Scheduling campaign...');

        // Build URL with query parameters
        const url = new URL(`${Api_BASE_URL}/outbound-campaign`);
        url.searchParams.append('crm_user_id', user_id);
        url.searchParams.append('agent_id', agentId);
        url.searchParams.append('agent_name', values.campaignName);
        url.searchParams.append('source_number', values.phoneNumber);
        url.searchParams.append('lead_id', values.leadId || '');
        url.searchParams.append('start_immediately', values.statusAction === 'startNow' ? 'true' : 'false');

        if (values.statusAction === 'schedule' && values.scheduledAt instanceof Date) {
          console.log(values.scheduledAt.toISOString(), 'values.scheduledAt');
          url.searchParams.append('scheduled_at', values.scheduledAt.toISOString());
        }

        // Prepare FormData with file only
        const formData = new FormData();
        formData.append('contacts_file', file);

        try {
          const res = await axios.post(url.toString(), formData, {
            headers: {
              'accept': 'application/json',
              'Content-Type': 'multipart/form-data',
            },
          });
          console.log(res, 'outbound-campaig');
          if(res && res?.data?.success == true){
            toast.success('Campaign scheduled!', { id: toastId });
            onSuccess()
            fetchCampaigns();
          }
        } catch (err: any) {
          toast.error(err?.response?.data?.detail || 'Failed to schedule campaign', { id: toastId });
        }
      }}


    >
      {({ setFieldValue, values, errors, touched }) => (
        <Form className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Campaign Name</label>
            <Field
              name="campaignName"
              type="text"
              className="w-full border border-gray-300 text-sm p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Campaign Name"
            />
            {errors.campaignName && touched.campaignName && (
              <p className="text-red-600 text-sm mt-1">{errors.campaignName}</p>
            )}
          </div>
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
         {page === 'lead' ?'' : <div>
           <Field name="leadId" as="select" className="w-full border border-gray-300 text-xs p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Link to Lead</option>
                      {leads.map((lead: any) => (
                        <option key={lead._id} value={lead._id}>
                          {lead.name || lead.email}
                        </option>
                      ))}
                    </Field>
            {errors.leadId && touched.leadId && (
              <p className="text-red-600 text-sm">{errors.leadId}</p>
            )}
          </div>}

          <div>
            <label className="block text-sm font-medium mb-1">Upload Contacts</label>
            <input
              type="file"
              accept=".csv,.xlsx,.txt"
              onChange={(e) => {
                handleFileInputChange(e);
              }}
            />
            {file && <p className="text-sm mt-1">Selected: {file.name}</p>}
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
