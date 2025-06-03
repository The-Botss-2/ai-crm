'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { IoClose } from 'react-icons/io5';
import { useCardConnection } from '@/context/CardConnectionContext';

interface ConnectField {
  name: string;
  label: string;
  type?: string;
}

interface ConnectDialogProps {
  name: string;
  isOpen: boolean;
  onClose: () => void;
  fields: ConnectField[];
  apiUrl: string;
  crmUserId: string;
  onSuccess?: () => void;
}

export default function ConnectDialog({
  name,
  isOpen,
  onClose,
  fields,
  apiUrl,
  crmUserId,
  onSuccess,
}: ConnectDialogProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { setIsCardConnected } = useCardConnection();

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    fields.forEach(field => {
      if (!formData[field.name]?.trim()) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fill in all required fields.');
      return;
    }
    const toastId = toast.loading('Connecting...');
    try {
      const payload = { crm_user_id: crmUserId, user_id: crmUserId, ...formData };
      await axios.post(apiUrl, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (name == 'email') {
        setIsCardConnected(true)
      }
      toast.success('Connected successfully!', { id: toastId });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      const apiMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to connect.';
      toast.error(apiMessage, { id: toastId });
      console.error(err);
    }
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        <div className="fixed inset-y-0 right-0 max-w-sm w-full bg-white dark:bg-slate-900 p-6 overflow-y-auto shadow-lg">
          <Dialog.Title className="text-md font-semibold border-b dark:border-gray-700 border-gray-200 pb-4 mb-4 flex justify-between items-center capitalize">
            Connect {name}
            <button onClick={onClose}>
              <IoClose size={16} />
            </button>
          </Dialog.Title>

          <div className="space-y-4">
            {fields.map(field => (
              <div key={field.name}>
                <label className="block text-xs font-medium mb-1">{field.label}</label>
                <input
                  type={field.type || 'text'}
                  className={`w-full border rounded px-2 py-1 text-sm ${errors[field.name] ? 'border-red-500' : ''
                    }`}
                  value={formData[field.name] || ''}
                  onChange={e => handleChange(field.name, e.target.value)}
                  placeholder={`Enter your ${field.label}`}
                />
                {errors[field.name] && (
                  <p className="text-xs text-red-600 mt-1">{errors[field.name]}</p>
                )}
              </div>
            ))}

            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700"
              >
                Connect
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
