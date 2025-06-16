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

  useEffect(() => {
    if (form) {
      const normalizedFields = (form.fields || []).map((field, index) => ({
        ...field,
        id: index, // inject id as index
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
      mutate(); // Revalidate form list
      onClose(); // Close panel
    } catch (err) {
      console.error(err);
      toast.error('Error deleting form', { id: toastId });
    }
  };
function generateFormHTML(form: { title: string; fields: Field[] }): string {
  // Prepend the default name and email fields
  const defaultFields: Field[] = [
    { label: 'Name', type: 'text', isRequired: true, placeholder: 'Enter your name', id: -1 },
    { label: 'Email', type: 'email', isRequired: true, placeholder: 'Enter your email', id: -2 },
  ];

  // Merge the default fields with the dynamic fields
  const allFields = [...defaultFields, ...form.fields];

  const formFields = allFields.map((field:any) => {
    const required = field.isRequired ? 'required' : '';
    const nameAttr = `name="${field.label.replace(/\s+/g, '_').toLowerCase()}"`;

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'date':
      case 'number':
        return `
          <label class="form-label">
            ${field.label}${field.isRequired ? ' *' : ''}
            <input type="${field.type}" class="form-input" placeholder="${field.placeholder || ''}" ${nameAttr} ${required} />
          </label>`;
      case 'textarea':
        return `
          <label class="form-label">
            ${field.label}
            <textarea class="form-input" placeholder="${field.placeholder || ''}" ${nameAttr} ${required}></textarea>
          </label>`;
      case 'select':
        return `
          <label class="form-label">
            ${field.label}
            <select class="form-input" ${nameAttr} ${required}>
              ${(field.options || []).map((opt:any) => `<option>${opt}</option>`).join('')}
            </select>
          </label>`;
      case 'radio':
      case 'checkbox':
        return `
          <fieldset class="form-fieldset">
            <legend>${field.label}</legend>
            ${(field.options || []).map((opt:any) => `
              <label class="form-check">
                <input type="${field.type}" name="${field.label}" value="${opt}" ${required} />
                ${opt}
              </label>`).join('')}
          </fieldset>`;
      default:
        return '';
    }
  }).join('\n');

  const html = `
<style>
  form.custom-form {
    max-width: 600px;
    margin: 0 auto;
    font-family: sans-serif;
    padding: 1.5rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #f9f9f9;
  }
  .form-label {
    display: block;
    margin-bottom: 1rem;
    font-size: 0.9rem;
    color: #333;
  }
  .form-label input,
  .form-label select,
  .form-label textarea {
    width: 100%;
    padding: 0.5rem;
    margin-top: 0.25rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  .form-input {
    font-size: 0.9rem;
  }
  .form-fieldset {
    margin-bottom: 1rem;
    border: none;
  }
  .form-check {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.85rem;
  }
  button {
    padding: 0.6rem 1rem;
    background-color: #2563eb;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
  }
  button:hover {
    background-color: #1e40af;
  }
</style>

<form class="custom-form" action="#" method="POST">
  <h2>${form.title}</h2>
  ${formFields}
  <button type="submit">Submit</button>
</form>`;

  return html.trim();
}



  const handleSubmitForm = async (values: FormValues, { setSubmitting, resetForm }: any) => {
    if (fields.length === 0) {
      toast.error('Please provide at least one field.');
      return;
    }
    const code_snippet = generateFormHTML({
      title: values.title,
      fields,
    });
    const payload = {
      ...values,
      teamId,
      fields,
      code_snippet,
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
        {/* Background overlay */}
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />

        {/* Panel */}
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white p-6 shadow-lg overflow-y-auto">
          <Dialog.Title className="flex items-center justify-between border-b border-gray-300 pb-4">
            <span className="text-xl font-bold text-gray-900">{form ? 'Edit Form' : 'Create Form'}</span>
            <button
              className="cursor-pointer rounded-lg hover:bg-gray-200 p-1"
              onClick={onClose}
              aria-label="Close panel"
            >
              <IoIosClose size={28} className="text-gray-700" />
            </button>
          </Dialog.Title>

          <Formik initialValues={initialValues} validate={validate} onSubmit={handleSubmitForm}>
            {({ isSubmitting }) => (
              <Form className="mt-4 space-y-4 text-gray-900">
                <div>
                  <label className="block mb-1 text-xs font-medium">Form Title *</label>
                  <FormikField
                    name="title"
                    className="w-full border border-gray-300 px-3 py-2 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <ErrorMessage name="title" component="div" className="text-red-600 text-xs mt-1" />
                </div>

                <div>
                  <label className="block mb-1 text-xs font-medium">Description</label>
                  <FormikField
                    as="textarea"
                    name="description"
                    rows={2}
                    className="w-full border border-gray-300 px-3 py-2 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-xs font-medium">Category</label>
                  <FormikField
                    as="select"
                    name="category"
                    className="w-full border border-gray-300 px-3 py-2 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="custom">Custom</option>
                    <option value="lead">Lead</option>

                  </FormikField>
                </div>

                {/* Field Builder */}
                <div className="border border-dotted border-gray-300 p-4 flex flex-col gap-2 rounded-lg">
                  <h2 className="font-semibold text-sm text-gray-900">Form Fields</h2>
                  <li
                    key={``}
                    className="border border-gray-300 p-3 rounded flex justify-between items-center hover:shadow-sm transition-shadow"
                  >
                    <div>
                      <p className="font-medium text-sm text-gray-900">
                        Name <span className="text-red-600">*</span>
                      </p>
                      <p className="text-xs text-gray-500">text</p>
                    </div>
                    <div className="text-red-600 text-sm flex gap-2">
                      Default
                    </div>
                  </li>
                  <li
                    key={``}
                    className="border border-gray-300 p-3 rounded flex justify-between items-center hover:shadow-sm transition-shadow"
                  >
                    <div>
                      <p className="font-medium text-sm text-gray-900">
                        Email <span className="text-red-600">*</span>
                      </p>
                      email                         
                       </div>
                    <div className="text-red-600 text-sm flex gap-2">
                      Default
                    </div>
                  </li>
                  {fields.length === 0 ? (
                    <p className="text-xs text-gray-500">No fields added.</p>
                  ) : (
                    <ul className="space-y-2">
                      {fields.map((field, index) => (
                        <li
                          key={`field-${index}`}
                          className="border border-gray-300 p-3 rounded flex justify-between items-center hover:shadow-sm transition-shadow"
                        >
                          <div>
                            <p className="font-medium text-sm text-gray-900">
                              {field.label} {field.isRequired && <span className="text-red-600">*</span>}
                            </p>
                            <p className="text-xs text-gray-500">{field.type}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="bg-blue-100 text-blue-800 text-xs p-2 rounded-sm hover:bg-blue-200 transition"
                              onClick={() => {
                                setEditing({ ...field, id: index });
                                setShowFieldDialog(true);
                              }}
                            >
                              <FiEdit3 />
                            </button>
                            <button
                              type="button"
                              className="bg-red-100 text-red-700 text-xs p-2 rounded-sm hover:bg-red-200 transition"
                              onClick={() => handleDeleteField(index)}
                            >
                              <MdDeleteOutline />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    type="button"
                    className="bg-blue-100 text-blue-800 text-xs p-2 rounded w-full text-center flex items-center justify-center gap-2 hover:bg-blue-200 transition"
                    onClick={() => {
                      setEditing(null);
                      setShowFieldDialog(true);
                    }}
                  >
                    <FiPlus />
                    <span>Add Field</span>
                  </button>
                </div>
                <div className="pt-4 flex gap-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 cursor-pointer text-white py-2 rounded text-xs font-semibold hover:bg-blue-700 transition"
                  >
                    {isSubmitting ? 'Saving...' : form ? 'Update Form' : 'Add Form'}
                  </button>
                  {form && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="w-full bg-red-600 cursor-pointer text-white py-2 rounded text-xs font-semibold hover:bg-red-700 transition"
                    >
                      Delete Form
                    </button>
                  )}
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
