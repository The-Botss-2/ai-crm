'use client';

import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { IoClose } from 'react-icons/io5';
import CategoryForm from './CategoryForm';

interface CategoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  category: any;
  teamId: string;
  mutate: () => void;
}

const CategoryPanel: React.FC<CategoryPanelProps> = ({
  isOpen,
  onClose,
  category,
  teamId,
  mutate,
}) => {
  const isEdit = !!category;

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl p-6 overflow-y-auto rounded-l-lg">
          <Dialog.Title className="flex justify-between items-center text-md font-semibold text-gray-900 mb-4 border-b pb-2">
            {isEdit ? 'Edit Category' : 'New Category'}
            <button onClick={onClose}>
              <IoClose size={20} />
            </button>
          </Dialog.Title>

          <CategoryForm
            initialValues={{
              _id: category?._id || '',
              name: category?.name || '',
              description: category?.description || '',
              teamId,
            }}
            isEdit={isEdit}
            onClose={onClose}
            reload={mutate}
          />
        </div>
      </Dialog>
    </Transition>
  );
};

export default CategoryPanel;
