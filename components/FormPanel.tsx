'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { Formik, Form, Field as FormikField, ErrorMessage } from 'formik';
import { IoIosClose } from 'react-icons/io';
import { useParams } from 'next/navigation';
import FieldDialog from './FieldDialog';
import { FiPlus, FiEdit3 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { MdDeleteOutline } from 'react-icons/md';

type Field = {
  id?: number;
  label: string;
  type: string;
  placeholder?: string;
  isRequired: boolean;
  options?: string[];
};

type FormValues = {
  title: string;
  description: string;
  category: string;
  isTemplate: boolean;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  mutate: () => void;
  form?: {
    _id: string;
    title: string;
    description: string;
    category: string;
    isTemplate: boolean;
    fields: Field[];
  } | null;
};

export default function FormPanel({ isOpen, onClose, mutate, form }: Props) {
  const [fields, setFields] = useState<Field[]>([]);
  const [editing, setEditing] = useState<Field | null>(null);
  const [showFieldDialog, setShowFieldDialog] = useState(false);
  const params = useParams<{ id: string }>();
  const teamId = params.id;

  // Initialize form state when editing
  useEffect(() => {
    if (form) {
      const normalizedFields = (form.fields || []).map((field, index) => ({
        ...field,
        id: index, // 💡 inject id as index
      }));
      setFields(normalizedFields);
    } else {
      setFields([]);
    }
  }, [form]);


  const initialValues: FormValues = {
    title: form?.title || '',
    description: form?.description || '',
    category: form?.category || 'custom',
    isTemplate: form?.isTemplate || false,
  };

  const validate = (values: FormValues) => {
    const errors: Partial<Record<keyof FormValues, string>> = {};
    if (!values.title) errors.title = 'Form title is required';
    return errors;
  };

  const handleSaveField = (field: Field) => {
    if (typeof field.id === 'number') {
      const updated = [...fields];
      updated[field.id] = { ...field, id: field.id };
      setFields(updated);
    } else {
      setFields([...fields, { ...field, id: fields.length }]); // append new
    }

    setEditing(null);
    setShowFieldDialog(false);
  };

  const handleDeleteField = (index: number) => {
    const updated = [...fields];
    updated.splice(index, 1);
    setFields(updated.map((f, i) => ({ ...f, id: i }))); // re-index
  };

  const handleDelete = async () => {
    if (!form?._id) return;


    const toastId = toast.loading('Deleting form...');

    try {
      const res = await fetch(`/api/forms?id=${form._id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete form');

      toast.success('Form deleted successfully', { id: toastId });
      mutate();       // Revalidate form list
      onClose();      // Close panel
    } catch (err) {
      console.error(err);
      toast.error('Error deleting form', { id: toastId });
    }
  };


  const handleSubmitForm = async (values: FormValues, { setSubmitting, resetForm }: any) => {
    if (fields.length === 0) {
      toast.error('Please provide at least one field.');
      return;
    }

    const payload = {
      ...values,
      teamId,
      fields,
    };

    const toastId = toast.loading(form ? 'Updating form...' : 'Saving form...');

    try {
      const res = await fetch(form ? `/api/forms?id=${form._id}` : '/api/forms', {
        method: form ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save form');

      toast.success(`Form ${form ? 'updated' : 'saved'}!`, { id: toastId });

      await mutate();
      resetForm();
      setFields([]);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Error saving form', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-slate-950 p-6 shadow-lg overflow-y-auto">
          <Dialog.Title className="flex items-center justify-between border-b border-white/10 pb-4">
            <span className="text-xl font-bold">{form ? 'Edit Form' : 'Create Form'}</span>
            <button className="cursor-pointer rounded-lg bg-white/5" onClick={onClose}>
              <IoIosClose size={28} />
            </button>
          </Dialog.Title>

          <Formik initialValues={initialValues} validate={validate} onSubmit={handleSubmitForm}>
            {({ isSubmitting }) => (
              <Form className="mt-4 space-y-4">
                <div>
                  <label className="block mb-1 text-xs">Form Title *</label>
                  <FormikField
                    name="title"
                    className="w-full border px-3 py-2 rounded text-xs dark:border-gray-700 border-gray-200"
                  />
                  <ErrorMessage name="title" component="div" className="text-red-500 text-xs" />
                </div>

                <div>
                  <label className="block mb-1 text-xs">Description</label>
                  <FormikField
                    as="textarea"
                    name="description"
                    rows={2}
                    className="w-full border px-3 py-2 rounded text-xs dark:border-gray-700 border-gray-200"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-xs">Category</label>
                  <FormikField
                    as="select"
                    name="category"
                    className="w-full border px-3 py-2 rounded text-xs dark:border-gray-700 border-gray-200 dark:bg-slate-950"
                  >
                    <option value="custom">Custom</option>
                    <option value="lead">Lead</option>
                    <option value="meeting">Meeting</option>
                    <option value="task">Task</option>
                    <option value="event">Event</option>
                  </FormikField>
                </div>

                {/* Field Builder */}
                <div className="border border-dotted p-4 border-white/10 flex flex-col gap-2 rounded-lg">
                  <h2 className="font-semibold text-sm">Form Fields</h2>

                  {fields.length === 0 ? (
                    <p className="text-xs text-gray-500">No fields added.</p>
                  ) : (
                    <ul className="space-y-2">
                      {fields.map((field, index) => (
                        <li
                          key={`field-${index}`}
                          className="border border-white/10 dark:bg-slate-900 p-3 rounded flex justify-between items-center"
                        >
                          <div>
                            <p className="font-medium text-sm">
                              {field.label} {field.isRequired && <span>*</span>}
                            </p>
                            <p className="text-xs text-gray-500">{field.type}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="bg-blue-100 text-blue-800 text-xs p-2 rounded-sm"
                              onClick={() => {
                                setEditing({ ...field, id: index });
                                setShowFieldDialog(true);
                              }}
                            >
                              <FiEdit3 />
                            </button>
                            <button
                              type="button"
                              className="text-red-800 bg-red-100 text-xs p-2 rounded-sm"
                              onClick={() => handleDeleteField(index)}
                            >
                              <MdDeleteOutline />
                            </button>
                          </div>
                        </li>
                      ))}


                      {/* {fields.map((field, index) => (
                        <li
                          key={field.id ?? `field-${index}`}
                          className="border border-white/10 dark:bg-slate-900 p-3 rounded flex justify-between items-center"
                        >
                          <div>
                            <p className="font-medium text-sm">
                              {field.label} {field.isRequired && <span>*</span>}
                            </p>
                            <p className="text-xs text-gray-500">{field.type}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="bg-blue-100 text-blue-800 text-xs p-2 rounded-sm"
                              onClick={() => {
                                setEditing(field);
                                setShowFieldDialog(true);
                              }}
                            >
                              <FiEdit3 />
                            </button>
                            <button
                              type="button"
                              className="text-red-800 bg-red-100 text-xs p-2 rounded-sm"
                              onClick={() =>
                                field.id !== undefined && handleDeleteField(field.id)
                              }
                              disabled={field.id === undefined}
                            >
                              <MdDeleteOutline />
                            </button>
                          </div>
                        </li>
                      ))} */}
                    </ul>
                  )}

                  <button
                    type="button"
                    className="bg-blue-100 text-blue-800 text-xs p-2 rounded w-full text-center flex items-center justify-center gap-2"
                    onClick={() => {
                      setEditing(null);
                      setShowFieldDialog(true);
                    }}
                  >
                    <FiPlus />
                    <span>Add Field</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <FormikField type="checkbox" name="isTemplate" />
                  <label className="text-xs">Save as Template</label>
                </div>
                <div className="pt-4 flex gap-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-100 cursor-pointer text-blue-800 py-2 rounded text-xs font-semibold"
                  >
                    {isSubmitting ? 'Saving...' : form ? 'Update Form' : 'Add Form'}
                  </button>

                </div>
              </Form>
            )}
          </Formik>

          <FieldDialog
            isOpen={showFieldDialog}
            onClose={() => setShowFieldDialog(false)}
            onSave={handleSaveField}
            initialData={editing}
          />
        </div>
      </Dialog>
    </Transition>
  );
}
