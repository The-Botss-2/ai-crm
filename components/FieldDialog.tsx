'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect } from 'react';
import { Formik, Form, Field as FormikField, ErrorMessage, useFormikContext } from 'formik';

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
        <div className="fixed inset-0 bg-black/25" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white dark:bg-slate-950 rounded p-6 shadow max-w-md w-full">
            <Dialog.Title className="text-lg font-semibold mb-4">
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
                <Form className="space-y-4">
                  {/* Label */}
                  <div>
                    <label className="block mb-1 text-xs">Label *</label>
                    <FormikField
                      name="label"
                      className="w-full border px-3 py-2 rounded text-xs dark:border-gray-700 border-gray-200"
                    />
                    <ErrorMessage
                      name="label"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block mb-1 text-xs">Type</label>
                    <FormikField
                      as="select"
                      name="type"
                      className="w-full border px-3 py-2 rounded text-xs dark:bg-slate-950 dark:border-gray-700 border-gray-200"
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
                    <label className="block mb-1 text-xs">Placeholder</label>
                    <FormikField
                      name="placeholder"
                      className="w-full border px-3 py-2 rounded text-xs dark:border-gray-700 border-gray-200"
                    />
                  </div>

                  {/* isRequired */}
                  <div className="flex items-center gap-2">
                    <FormikField type="checkbox" name="isRequired" />
                    <label className="text-sm">Required</label>
                  </div>

                  {/* Options (only if needed) */}
                  {FieldTypesWithOptions.includes(values.type) && (
                    <div>
                      <label className="block mb-1 text-xs">Options</label>
                      {(values.options || []).map((option, idx) => (
                        <div key={idx} className="flex items-center gap-2 mb-2">
                          <input
                            className="w-full border px-3 py-1 text-xs rounded dark:border-gray-700 border-gray-200"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...(values.options || [])];
                              newOptions[idx] = e.target.value;
                              setFieldValue('options', newOptions);
                            }}
                          />
                          <button
                            type="button"
                            className="text-red-500 text-sm"
                            onClick={() => {
                              const newOptions = [...(values.options || [])].filter((_, i) => i !== idx);
                              setFieldValue('options', newOptions);
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="text-sm text-blue-600"
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
                      className="px-4 py-2 text-xs border rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-600 text-white text-xs px-4 py-2 rounded"
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
