'use client';

import { Dialog, Transition } from '@headlessui/react';
import { IoClose } from 'react-icons/io5';
import React, { Fragment, useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { socialFetcher } from '@/lib/zoomFetcher';

interface SocialPanelProps {
  isOpen: boolean;
  userId: string;
  onClose: () => void;
  fetchUrl: string;
  uploadUrl?: string;
  label?: string;
  name: string;
}

export default function SocialPanel({
  isOpen,
  userId,
  onClose,
  fetchUrl,
  uploadUrl = '',
  label = 'Prompt',
  name,
}: SocialPanelProps) {
  const [prompt, setPrompt] = useState('');

  const { data, error, isLoading, mutate } = useSWR(isOpen ? fetchUrl : null, name === 'Zoom' ? socialFetcher : async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch data');
    return res.json();
  },
    {
      revalidateOnFocus: false,
      onError: () => toast.error(`Failed to load ${name} data.`),
    }
  );

  useEffect(() => {
    if (error && isOpen) setPrompt('');
    if (data?.system_prompt && isOpen) setPrompt(data.system_prompt);
  }, [data, error, isOpen]);

  const handleSave = async () => {
    if (!uploadUrl) return;

    const loadingToast = toast.loading('Updating knowledge base...');

    try {
      await axios.post(
        uploadUrl,
        {
          prompt,
          crm_user_id: userId,
        },
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      toast.success('Knowledge base updated!', {
        id: loadingToast,
      });
      mutate();
    } catch (err) {
      toast.error('Failed to save knowledge base.', {
        id: loadingToast,
      });
      console.error(err);
    }
  };


  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs" />
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-slate-900 shadow-xl p-6 overflow-y-auto">
          <Dialog.Title className="text-md font-semibold border-b dark:border-gray-700 border-gray-200 pb-4 mb-4 flex justify-between items-center">
            Setup {label}
            <button onClick={onClose}>
              <IoClose size={16} />
            </button>
          </Dialog.Title>

          {isLoading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : (
            <div className="space-y-6">
              {/* ZOOM PANEL */}
              {name === 'Zoom' && (
                <>
                  <label className="block text-xs font-semibold text-gray-700 mb-3">{label}</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={6}
                    className="w-full border rounded-md p-2 text-sm"
                    placeholder={`Enter ${label.toLowerCase()} here...`}
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSave}
                      className="bg-blue-100 text-blue-800 px-4 py-2 rounded hover:font-semibold text-xs"
                    >
                      Save
                    </button>
                  </div>
                </>
              )}




            </div>
          )}
        </div>


      </Dialog>
    </Transition>
  );
}
