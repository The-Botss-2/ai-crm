'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Formik, Form, Field as FormikField, ErrorMessage } from 'formik';

export type FieldData = {
  id?: number;
  label: string;
  type: string;
  placeholder?: string;
  isRequired: boolean;
  options?: string[];
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (field: FieldData) => void;
  initialData: FieldData | null;
};

const FieldTypesWithOptions = ['select', 'checkbox', 'radio'];

export default function FieldDialog({ isOpen, onClose, onSave, initialData }: Props) {
  const initialValues: FieldData = initialData || {
    label: '',
    type: 'text',
    placeholder: '',
    isRequired: false,
    options: [],
  };

  const validate = (values: FieldData) => {
    const errors: Partial<Record<keyof FieldData, string>> = {};
    if (!values.label) errors.label = 'Label is required';
    return errors;
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-20" onClose={onClose}>
        <div className="fixed inset-0 bg-black/20" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded p-6 shadow max-w-md w-full">
            <Dialog.Title className="text-lg font-semibold mb-4 text-gray-900">
              {initialData ? 'Edit Field' : 'Add Field'}
            </Dialog.Title>

            <Formik
              initialValues={initialValues}
              validate={validate}
              onSubmit={(values, { setSubmitting }) => {
                onSave(values);
                setSubmitting(false);
              }}
              enableReinitialize
            >
              {({ values, setFieldValue, isSubmitting }) => (
                <Form className="space-y-4 text-gray-900">
                  {/* Label */}
                  <div>
                    <label className="block mb-1 text-xs font-medium">Label *</label>
                    <FormikField
                      name="label"
                      className="w-full border border-gray-300 px-3 py-2 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <ErrorMessage
                      name="label"
                      component="div"
                      className="text-red-600 text-xs mt-1"
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block mb-1 text-xs font-medium">Type</label>
                    <FormikField
                      as="select"
                      name="type"
                      className="w-full border border-gray-300 px-3 py-2 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="text">Text</option>
                      <option value="textarea">Textarea</option>
                      <option value="number">Number</option>
                      <option value="email">Email</option>
                      <option value="tel">Telephone</option>
                      <option value="date">Date</option>
                      <option value="checkbox">Checkbox</option>
                      <option value="radio">Radio</option>
                      <option value="select">Select</option>
                    </FormikField>
                  </div>

                  {/* Placeholder */}
                  <div>
                    <label className="block mb-1 text-xs font-medium">Placeholder</label>
                    <FormikField
                      name="placeholder"
                      className="w-full border border-gray-300 px-3 py-2 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  {/* isRequired */}
                  <div className="flex items-center gap-2">
                    <FormikField type="checkbox" name="isRequired" id="isRequired" className="cursor-pointer" />
                    <label htmlFor="isRequired" className="text-sm select-none">
                      Required
                    </label>
                  </div>

                  {/* Options (only if needed) */}
                  {FieldTypesWithOptions.includes(values.type) && (
                    <div>
                      <label className="block mb-1 text-xs font-medium">Options</label>
                      {(values.options || []).map((option, idx) => (
                        <div key={idx} className="flex items-center gap-2 mb-2">
                          <input
                            className="w-full border border-gray-300 px-3 py-1 text-xs rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...(values.options || [])];
                              newOptions[idx] = e.target.value;
                              setFieldValue('options', newOptions);
                            }}
                          />
                          <button
                            type="button"
                            className="text-red-600 text-sm hover:text-red-800"
                            onClick={() => {
                              const newOptions = [...(values.options || [])].filter((_, i) => i !== idx);
                              setFieldValue('options', newOptions);
                            }}
                            aria-label="Remove option"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="text-sm text-blue-600 hover:text-blue-800"
                        onClick={() => setFieldValue('options', [...(values.options || []), ''])}
                      >
                        + Add Option
                      </button>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end pt-4 gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-xs border border-gray-300 rounded hover:bg-gray-100 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-600 text-white text-xs px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                      {initialData ? 'Update' : 'Add'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  );
}
