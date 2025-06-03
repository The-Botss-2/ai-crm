'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import axios from 'axios';

interface PhoneNumber {
  phone_number: string;
  sid: string;
}

interface AddElevenAgentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: () => void;
}

const validationSchema = Yup.object({
  agent_name: Yup.string().required('Agent name is required'),
  phone_number: Yup.string().optional(),
  system_prompt: Yup.string().required('System prompt is required'),
  first_message: Yup.string().required('First message is required'),
});

const fetchPhoneNumbers = async (crmUserId: string): Promise<PhoneNumber[]> => {
  const response = await axios.get(
    `https://callingagent.thebotss.com/api/elevenlabs/free-numbers?crm_user_id=${crmUserId}`,
    { headers: { 'accept': 'application/json' } }
  );
  return response.data;
};

export default function AddElevenAgentDialog({
  isOpen,
  onClose,
  userId,
  onSuccess,
}: AddElevenAgentDialogProps) {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  useEffect(() => {
    const loadPhoneNumbers = async () => {
      try {
        const data = await fetchPhoneNumbers(userId);
        setPhoneNumbers(data);
      } catch (err) {
        setPhoneError(err instanceof Error ? err.message : 'Failed to load phone numbers');
        toast.error('Failed to load phone numbers');
      }
    };
    loadPhoneNumbers();
  }, [userId]);

  if (phoneError) {
    return (
      <Transition show={isOpen} as={Fragment}>
        <Dialog onClose={onClose} className="relative z-50">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-slate-900 shadow-xl p-6 overflow-y-auto">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error Loading Phone Numbers</h3>
                  <p className="mt-1 text-sm text-red-700">{phoneError}</p>
                </div>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
    );
  }

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-slate-900 shadow-xl p-6 overflow-y-auto">
          <Dialog.Title className="text-md font-semibold border-b border-gray-300 dark:border-gray-700 pb-3 mb-4 flex justify-between items-center">
            Add ElevenLabs Agent
            <button onClick={onClose}>
              <IoClose size={18} />
            </button>
          </Dialog.Title>

          <Formik
            initialValues={{
              agent_name: '',
              phone_number: '',
              system_prompt: '',
              first_message: '',
            }}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting, resetForm, setStatus }) => {
              const toastId = toast.loading('Adding agent...');
              try {
                const formData = new FormData();
                formData.append('crm_user_id', userId);
                formData.append('agent_name', values.agent_name);
                formData.append('system_prompt', values.system_prompt);
                formData.append('first_message', values.first_message);
                formData.append('phone_number', values.phone_number);

                await axios.post(
                  'https://callingagent.thebotss.com/api/elevenlabs/agent-setup',
                  formData,
                  {
                    headers: {
                      'accept': 'application/json',
                      'Content-Type': 'multipart/form-data',
                    },
                  }
                );

                toast.success('Agent added successfully!', { id: toastId });
                resetForm();
                onSuccess();
                onClose();
              } catch (err: any) {
                let message = 'Failed to add agent.';
                if (err.response) {
                  message = err.response.data?.detail || err.response.data?.message || `Server error: ${err.response.status}`;
                } else if (err.request) {
                  message = 'Network error. Please check your connection.';
                } else {
                  message = err.message || 'An unexpected error occurred.';
                }
                setStatus(message);
                toast.error(message, { id: toastId });
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting, status }) => (
              <Form className="space-y-4 text-sm">
                {status && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                        <p className="mt-1 text-sm text-red-700">{status}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="agent_name" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Agent Name
                  </label>
                  <Field
                    name="agent_name"
                    type="text"
                    className="mt-1 block w-full rounded-md px-4 py-3 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-slate-800 dark:border-gray-600 dark:text-gray-200"
                  />
                  <ErrorMessage name="agent_name" component="div" className="text-red-600 text-xs mt-1" />
                </div>

                <div>
                  <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Phone Number
                  </label>
                  <Field
                    as="select"
                    name="phone_number"
                    className="mt-1 block w-full rounded-md px-4 py-3 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-slate-800 dark:border-gray-600 dark:text-gray-200"
                  >
                    <option value="" disabled>
                      No number configured
                    </option>
                    {phoneNumbers.map((phone) => (
                      <option key={phone.sid} value={phone.phone_number}>
                        {phone.phone_number}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="phone_number" component="div" className="text-red-600 text-xs mt-1" />
                </div>

                <div>
                  <label htmlFor="system_prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    System Prompt
                  </label>
                  <Field
                    as="textarea"
                    name="system_prompt"
                    rows={4}
                    className="mt-1 block w-full rounded-md px-4 py-3 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-slate-800 dark:border-gray-600 dark:text-gray-200"
                  />
                  <ErrorMessage name="system_prompt" component="div" className="text-red-600 text-xs mt-1" />
                </div>

                <div>
                  <label htmlFor="first_message" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    First Message
                  </label>
                  <Field
                    as="textarea"
                    name="first_message"
                    rows={4}
                    className="mt-1 block w-full rounded-md px-4 py-3 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-slate-800 dark:border-gray-600 dark:text-gray-200"
                  />
                  <ErrorMessage name="first_message" component="div" className="text-red-600 text-xs mt-1" />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Adding...' : 'Add Agent'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </Dialog>
    </Transition>
  );
}