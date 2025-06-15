'use client';

import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { toast } from 'react-hot-toast';
import { axiosInstance } from '@/lib/fetcher';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { FiEdit3 } from 'react-icons/fi';
import { MdDeleteOutline } from 'react-icons/md';

interface ProductFormProps {
  initialValues: any;
  isEdit: boolean;
  onClose: () => void;
  reload: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  initialValues,
  isEdit,
  onClose,
  reload,
}) => {
  const [loading, setLoading] = useState(false);

  const { data: categories = [] } = useSWR(
    `/api/category?teamId=${initialValues.teamId}`,
    fetcher
  );

  const handleDelete = async () => {
    setLoading(true);
    const toastId = toast.loading('Deleting product...');
    try {
      await axiosInstance.delete(`/api/product/${initialValues._id}`);
      toast.success('Product deleted', { id: toastId });
      reload();
      onClose();
    } catch {
      toast.error('Failed to delete product', { id: toastId });
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
        if (!values.categoryId) errors.categoryId = 'Category is required';
        if (!values.price && values.price !== 0) errors.price = 'Price is required';
        if (!values.currency && values.currency !== 0) errors.currency = 'Currency is required';
        if (!values.quantity && values.quantity !== 0) errors.quantity = 'Quantity is required';
        else if (isNaN(values.price)) errors.price = 'Price must be a number';
        if (values.quantity !== '' && isNaN(values.quantity)) errors.quantity = 'Quantity must be a number';
        return errors;
      }}
      onSubmit={async (values, { setSubmitting }) => {
        const toastId = toast.loading(isEdit ? 'Updating product...' : 'Creating product...');
        try {
          const payload = { ...values };
          if (!isEdit) delete payload._id;

          const url = isEdit ? `/api/product/${payload._id}` : '/api/product';
          const method = isEdit ? 'patch' : 'post';

          await axiosInstance.request({
            url,
            method,
            params: isEdit ? { id: payload._id } : undefined,
            data: payload,
          });

          toast.success(isEdit ? 'Product updated' : 'Product created', { id: toastId });
          reload();
          onClose();
        } catch {
          toast.error('Failed to save product', { id: toastId });
        } finally {
          setSubmitting(false);
        }
      }}
      validateOnBlur
      validateOnChange
    >
      {({ isSubmitting }) => (
        <Form className="space-y-4">

          {/* Name */}
          <Field name="name">
            {({ field, meta }: any) => (
              <div>
                <input
                  {...field}
                  placeholder="Product Name"
                  className="w-full border border-gray-300 text-xs p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {meta.touched && meta.error && (
                  <div className="text-red-500 text-xs mt-1">{meta.error}</div>
                )}
              </div>
            )}
          </Field>
          <Field name="currency">
            {({ field, meta }: any) => (
              <div>
                <input
                  {...field}
                  placeholder="Currency (e.g. USD)"
                  className="w-full border border-gray-300 text-xs p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {meta.touched && meta.error && (
                  <div className="text-red-500 text-xs mt-1">{meta.error}</div>
                )}
              </div>
            )}
          </Field>


          {/* Price with $ symbol */}
          <Field name="price">
            {({ field, meta }: any) => (
              <div>
                <div className="relative">
                  <input
                    {...field}
                    type="number"
                    placeholder="Price"
                    className="w-full  border border-gray-300 text-xs p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {meta.touched && meta.error && (
                  <div className="text-red-500 text-xs mt-1">{meta.error}</div>
                )}
              </div>
            )}
          </Field>

          {/* Quantity */}
          <Field name="quantity">
            {({ field, meta }: any) => (
              <div>
                <input
                  {...field}
                  type="number"
                  placeholder="Quantity"
                  className="w-full border border-gray-300 text-xs p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {meta.touched && meta.error && (
                  <div className="text-red-500 text-xs mt-1">{meta.error}</div>
                )}
              </div>
            )}
          </Field>

          {/* Category */}
          <Field name="categoryId">
            {({ field, meta }: any) => (
              <div>
                <select
                  {...field}
                  className="w-full border border-gray-300 text-xs p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  {categories?.map((cat: any) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {meta.touched && meta.error && (
                  <div className="text-red-500 text-xs mt-1">{meta.error}</div>
                )}
              </div>
            )}
          </Field>

          {/* Description */}
          <Field name="description">
            {({ field }: any) => (
              <textarea
                {...field}
                placeholder="Description"
                rows={3}
                className="w-full border border-gray-300 text-xs p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </Field>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4 items-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 font-semibold text-xs transition disabled:opacity-50"
            >
              <FiEdit3 size={14} />
              {isEdit ? 'Update' : 'Create'}
            </button>

            {isEdit && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="flex items-center gap-1 bg-red-100 text-red-800 px-3 py-2 rounded hover:bg-red-200 font-semibold text-xs transition disabled:opacity-50"
              >
                <MdDeleteOutline size={16} />
                Delete
              </button>
            )}
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ProductForm;
