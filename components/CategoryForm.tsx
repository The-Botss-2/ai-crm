'use client';

import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { toast } from 'react-hot-toast';
import { axiosInstance } from '@/lib/fetcher';

interface CategoryFormProps {
  initialValues: any;
  isEdit: boolean;
  onClose: () => void;
  reload: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  initialValues,
  isEdit,
  onClose,
  reload,
}) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
   
    setLoading(true);
    const toastId = toast.loading('Deleting category...');
    try {
      await axiosInstance.delete(`/api/category/${initialValues._id}`);
      toast.success('Category deleted', { id: toastId });
      reload();
      onClose();
    } catch {
      toast.error('Failed to delete category', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validate={(values) => {
        const errors: any = {};
        if (!values.name) errors.name = 'Name is required';
        return errors;
      }}
      onSubmit={async (values, { setSubmitting }) => {
        const toastId = toast.loading(isEdit ? 'Updating...' : 'Creating...');
        try {
          const payload = { ...values };
          if (!isEdit) delete payload._id;

          const url = isEdit ? `/api/category/${values._id}` : '/api/category';
          const method = isEdit ? 'patch' : 'post';

          await axiosInstance.request({
            url,
            method,
            data: payload,
          });

          toast.success(isEdit ? 'Category updated' : 'Category created', { id: toastId });
          reload();
          onClose();
        } catch {
          toast.error('Failed to save category', { id: toastId });
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-4">
          <Field name="name">
            {({ field, meta }: any) => (
              <div>
                <input
                  {...field}
                  placeholder="Category Name"
                  className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                {meta.touched && meta.error && (
                  <div className="text-red-500 text-xs mt-1">{meta.error}</div>
                )}
              </div>
            )}
          </Field>

          <Field name="description">
            {({ field }: any) => (
              <textarea
                {...field}
                placeholder="Description"
                className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            )}
          </Field>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white text-xs px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isEdit ? 'Update' : 'Create'}
            </button>

            {isEdit && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="bg-red-100 text-red-700 text-xs px-4 py-2 rounded hover:bg-red-200 disabled:opacity-50"
              >
                Delete
              </button>
            )}
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default CategoryForm;
