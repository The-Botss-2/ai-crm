'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { IoClose } from 'react-icons/io5';
import ProductForm from './ProductForm';

interface ProductPanelProps {
  isOpen: boolean;
  onClose: () => void;
  product: any | null;
  teamId: string;
  mutate: () => void;
}

const ProductPanel: React.FC<ProductPanelProps> = ({ isOpen, onClose, product, teamId, mutate }) => {
  const isEdit = !!product;

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl p-6 overflow-y-auto rounded-l-lg">
          <Dialog.Title className="text-md font-semibold border-b pb-4 mb-4 flex justify-between items-center">
            {isEdit ? 'Edit Product' : 'Add Product'}
            <button onClick={onClose}>
              <IoClose size={20} />
            </button>
          </Dialog.Title>

          <ProductForm
            initialValues={{
              _id: product?._id || '',
              name: product?.name || '',
              currency: product?.currency || '',
              price: product?.price || '',
              quantity: product?.quantity || '',
              categoryId: product?.categoryId?._id || '',
              description: product?.description || '',
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

export default ProductPanel;
