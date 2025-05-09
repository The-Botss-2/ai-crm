'use client';

import { Dialog, Transition } from '@headlessui/react';
import { IoClose } from 'react-icons/io5';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { zoomFetcher } from '@/lib/zoomFetcher';
import { AiTwotoneFileText, AiTwotoneCloseCircle } from "react-icons/ai";

interface ZoomPanelProps {
  isOpen: boolean;
  zoomUserId: string;
  onClose: () => void;
}

export default function ZoomPanel({ isOpen, zoomUserId, onClose }: ZoomPanelProps) {
  const { data, error, isLoading, mutate } = useSWR(isOpen ? `/get_context/${zoomUserId}` : null, zoomFetcher,
    {
      revalidateOnFocus: false,
      onError: () => {
        toast.error('Failed to load knowledge base.');
      }
    }
  );

  const [prompt, setPrompt] = useState('');
  const [knowledgeBase, setKnowledgeBase] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (error && isOpen) {
      setPrompt('');
      setFile(null);
    }

    if (data?.system_prompt && isOpen) {
      setPrompt(data.system_prompt);
    }

    if (data?.kb_text && isOpen) {
      setKnowledgeBase(data.kb_text);
    }
  }, [data, error, isOpen]);

  const handleSave = async () => {
    try {
      await axios.post(`https://zoom.thebotss.com/zoom/upload_context`,
        {
          'zoom_user_id ': zoomUserId,
          'kb_files': file,
          'prompt': prompt,
          'kb_text': knowledgeBase,
        },
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      toast.success('Knowledge base updated!');
      mutate();

      // ✅ Reset file input and state
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setFile(null);
    } catch (err) {
      toast.error('Failed to save knowledge base.');
      console.error(err);
    }
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs" />
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-slate-900 shadow-xl p-6 overflow-y-auto">
          <Dialog.Title className="text-md font-semibold border-b dark:border-gray-700 border-gray-200 pb-4 mb-4 flex justify-between items-center">
            Setup Knowledge Base
            <button onClick={onClose}><IoClose size={16} /></button>
          </Dialog.Title>

          {isLoading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : (
            <div className="space-y-6">


              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                {data?.uploaded_files?.map((file: any) => (
                  <div key={file.file_name} className="flex items-center justify-between relative bg-gray-50  dark:border-gray-700 border-gray-200 border rounded-2xl py-2">
                    <div className="flex flex-col items-center gap-2 mx-auto">
                      <AiTwotoneFileText size={20} className="text-gray-500" />
                      <span className="text-sm text-gray-700 text-center">{file.file_name}</span>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await axios.delete(`https://zoom.thebotss.com/zoom/delete_context?zoom_user_id=${zoomUserId}&delete_file_name=${file.file_name}`);
                          toast.success('File deleted successfully!');
                          mutate();
                        } catch (err) {
                          toast.error('Failed to delete file.');
                          console.error(err);
                        }
                      }}
                      className="text-red-500 hover:text-red-700 text-xs absolute top-2 right-2"
                    >
                      <AiTwotoneCloseCircle size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-3">Upload File</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="block w-full text-xs text-gray-700 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-blue-100 file:text-blue-800 hover:file:font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-3">Knowledge Base</label>
                <textarea
                  value={knowledgeBase}
                  onChange={(e) => setKnowledgeBase(e.target.value)}
                  rows={6}
                  className="w-full border rounded-md p-2 text-sm"
                  placeholder="Enter knowledge base here..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-3">Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={6}
                  className="w-full border rounded-md p-2 text-sm"
                  placeholder="Enter prompt here..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  className="bg-blue-100 text-blue-800 px-4 py-2 rounded hover:font-semibold text-xs"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </Transition >
  );
}
