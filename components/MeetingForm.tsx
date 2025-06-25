'use client';

import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { toast } from 'react-hot-toast';
import { axiosInstance, fetcher } from '@/lib/fetcher';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import "./Meeting.css"
import useSWR from 'swr';
import { useTeamRole } from '@/context/TeamRoleContext';
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
  const [attendeeInput, setAttendeeInput] = useState('');
  const { data: leads = [] } = useSWR(`/api/leads?team=${initialValues.teamId}`, fetcher);
  const {role , access} = useTeamRole();

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    const toastId = toast.loading(isEdit ? 'Updating meeting...' : 'Adding meeting...');

    try {
      const payload = {
        ...values,
        startTime: values.date && values.fromTime
          ? new Date(
              values.date.getFullYear(),
              values.date.getMonth(),
              values.date.getDate(),
              values.fromTime.getHours(),
              values.fromTime.getMinutes()
            ).toISOString()
          : null,
        endTime: values.date && values.toTime
          ? new Date(
              values.date.getFullYear(),
              values.date.getMonth(),
              values.date.getDate(),
              values.toTime.getHours(),
              values.toTime.getMinutes()
            ).toISOString()
          : null,
      };
      if (!isEdit) delete (payload as any)._id;
      delete payload.date;
      delete payload.fromTime;
      delete payload.toTime;

      if(!payload?.leadId) delete payload.leadId

      const url = isEdit ? '/api/meeting' : '/api/meetings';
      const method = isEdit ? 'patch' : 'post';

      await axiosInstance.request({
        url,
        method,
        params: isEdit ? { id: values._id } : undefined,
        data: payload,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      toast.success(isEdit ? 'Meeting updated' : 'Meeting added', { id: toastId });
      window.location.reload();
      onClose();
    } catch (err: any) {
      toast.error('Something went wrong', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };
console.log(role, access, 'role');

  return (
    <Formik
      initialValues={{
        ...initialValues,
        date: initialValues.startTime ? new Date(initialValues.startTime) : null,
        fromTime: initialValues.startTime ? new Date(initialValues.startTime) : null,
        toTime: initialValues.endTime ? new Date(initialValues.endTime) : null,
        attendees: initialValues.attendees || [],
        title: initialValues.title || '',
        description: initialValues.description || '',
        platform: initialValues.platform || 'zoom',
        link: initialValues.link || '',
        meetingType: initialValues.meetingType || 'online',
        notes: initialValues.notes || '',
        leadId: initialValues?.leadId || '',
        followUpStatus: initialValues.followUpStatus || '',
        recordingUrl: initialValues.recordingUrl || '',
        transcript: initialValues.transcript || '',
        aiSummary: initialValues.aiSummary || '',
      }}
      validate={(values) => {
        const errors: any = {};
        if (!values.title) errors.title = 'Required';
        if (!values.description) errors.description = 'Required';
        if (!values.date) errors.date = 'Required';
        if (!values.fromTime) errors.fromTime = 'Required';
        if (!values.toTime) errors.toTime = 'Required';
        if (values.fromTime && values.toTime && values.fromTime >= values.toTime)
          errors.toTime = 'End time must be after start time';
        if (!values.link) errors.link = 'Required';
      
        return errors;
      }}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, values, setFieldValue, errors, touched }) => {
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
            {/* Title */}
            <div>
              <Field
                name="title"
                type="text"
                disabled={isPreview}
                className={`w-full border rounded-md p-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 ${
                  touched.title && errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Title"
              />
              <ErrorMessage name="title" component="div" className="text-red-500 text-xs mt-1" />
            </div>

            {/* Description */}
            <div>
              <Field
                name="description"
                as="textarea"
                disabled={isPreview}
                rows={2}
                className={`w-full border rounded-md p-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 ${
                  touched.description && errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Description"
              />
              <ErrorMessage name="description" component="div" className="text-red-500 text-xs mt-1" />
            </div>

            {/* Date Picker */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Date</label>
              <div className="w-full relative">
              <DatePicker
              selected={values.date}
              onChange={(date) => setFieldValue('date', date)}
              dateFormat="yyyy-MM-dd"
              disabled={isPreview}
              className={`w-full border rounded-md p-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 ${
                touched.date && errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholderText="Select date"
              popperPlacement="bottom-start"
              popperClassName="custom-datepicker-popper"
            />

              </div>

              <ErrorMessage name="date" component="div" className="text-red-500 text-xs mt-1" />
            </div>

            {/* From Time Picker */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">From Time</label>
              <DatePicker
                selected={values.fromTime}
                onChange={(time) => setFieldValue('fromTime', time)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="From"
                dateFormat="HH:mm"
                disabled={isPreview}
                className={`w-full border rounded-md p-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 ${
                  touched.fromTime && errors.fromTime ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholderText="Select time"
              />
              <ErrorMessage name="fromTime" component="div" className="text-red-500 text-xs mt-1" />
            </div>

            {/* To Time Picker */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">To Time</label>
              <DatePicker
                selected={values.toTime}
                onChange={(time) => setFieldValue('toTime', time)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="To"
                dateFormat="HH:mm"
                disabled={isPreview}
                className={`w-full border rounded-md p-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 ${
                  touched.toTime && errors.toTime ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholderText="Select time"
              />
              <ErrorMessage name="toTime" component="div" className="text-red-500 text-xs mt-1" />
            </div>
  
             <div>
            <Field name="leadId" as="select" className="w-full border border-gray-300 text-xs p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="">Link to Lead</option>
            {leads.map((lead: any) => (
              <option key={lead._id} value={lead._id}>
                {lead.name || lead.email}
              </option>
            ))}
          </Field>
              <ErrorMessage name="description" component="div" className="text-red-500 text-xs mt-1" />
            </div>

            {/* Platform */}
            <Field
              as="select"
              name="platform"
              disabled={isPreview}
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
            >
              <option value="zoom">Zoom</option>
              <option value="meet">Google Meet</option>
              <option value="teams">Microsoft Teams</option>
            </Field>

            {/* Link */}
            <div>
              <Field
                name="link"
                disabled={isPreview}
                className={`w-full border rounded-md p-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 ${
                  touched.link && errors.link ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Meeting Link"
              />
              <ErrorMessage name="link" component="div" className="text-red-500 text-xs mt-1" />
            </div>

            {/* Meeting Type */}
            <Field
              as="select"
              name="meetingType"
              disabled={isPreview}
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
            >
              <option value="online">Online</option>
              <option value="onsite">Onsite</option>
            </Field>

            {/* Attendees */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Attendees</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="email"
                  value={attendeeInput}
                  onChange={(e) => setAttendeeInput(e.target.value)}
                  className="flex-grow border border-gray-300 rounded-md p-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add attendee email"
                  disabled={isPreview}
                />
                <button
                  type="button"
                  onClick={addAttendee}
                  className="bg-blue-100 text-blue-800 px-3 py-2 rounded hover:font-semibold text-sm"
                  disabled={isPreview}
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {values.attendees.map((email: string) => (
                  <span
                    key={email}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center text-xs"
                  >
                    {email}
                    {!isPreview && (
                      <button
                        type="button"
                        onClick={() => removeAttendee(email)}
                        className="ml-2 text-blue-600 hover:text-red-600"
                      >
                        ✕
                      </button>
                    )}
                  </span>
                ))}
              </div>
              {touched.attendees && errors.attendees && typeof errors.attendees === 'string' && (
                <div className="text-red-500 text-xs mt-1">{errors.attendees}</div>
              )}
            </div>

            {/* Notes */}
            <Field
              as="textarea"
              name="notes"
              disabled={isPreview}
              rows={2}
              className="w-full border border-gray-300 rounded-md p-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
              placeholder="Notes"
            />

            {/* After meeting fields */}
            {isEdit && (
              <>
                <Field
                  name="followUpStatus"
                  className="w-full border border-gray-300 rounded-md p-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="Follow-up Status"
                />
                <Field
                  name="recordingUrl"
                  className="w-full border border-gray-300 rounded-md p-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="Recording URL"
                />
                <Field
                  as="textarea"
                  name="transcript"
                  rows={2}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="Transcript"
                />
                <Field
                  as="textarea"
                  name="aiSummary"
                  rows={2}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="AI Summary"
                />
              </>
            )}

            {!isPreview && (
              <div className="flex gap-2 mt-4">
             {role === 'admin' || access?.meetings?.includes('update') ? ( <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-semibold text-sm transition disabled:opacity-50"
                >
                  {isEdit ? 'Update Meeting' : 'Create Meeting'}
                </button>): !isEdit && (role === 'admin' || access?.meetings?.includes('write')) ? <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-semibold text-sm transition disabled:opacity-50"
                >
                  {'Create Meeting'}
                </button>: null}  

                {isEdit && (
                    role === 'admin'|| access?.meetings?.includes('delete') ? (  <button
                    type="button"
                    onClick={async () => {
                      const toastId = toast.loading('Deleting meeting...');
                      try {
                        await axiosInstance.delete('/api/meeting', {
                          params: {
                            id: initialValues._id,
                          },
                        });

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
                  </button>):null
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
