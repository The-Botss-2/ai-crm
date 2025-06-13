'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import useSWR from 'swr';
import { Tab, Menu } from '@headlessui/react';
import { FiPlus } from 'react-icons/fi';
import { CgFileDocument } from 'react-icons/cg';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { fetcher } from '@/lib/fetcher';
import toast from 'react-hot-toast';
import FormPanel from './FormPanel';
import InlineResponses from './InlineResponses';
import CodeSnippetModal from './CodeSnippetModal';

type Field = {
  label: string;
  type: string;
  placeholder?: string;
  isRequired: boolean;
  options?: string[];
  id?: number;
};

type Form = {
  _id: string;
  title: string;
  description: string;
  category: string;
  isTemplate: boolean;
  createdAt: string;
  code_snippet: string;
  fields: Field[];
};

const categories = ['all', 'lead', 'custom'];

export default function FormGrid() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [selectedTab, setSelectedTab] = useState('all');
  const [showResponses, setShowResponses] = useState<string | null>(null);
  const [showSnippet, setShowSnippet] = useState<string | null>(null);

  const params = useParams<{ id: string }>();
  const teamId = params.id;

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && categories.includes(categoryParam)) {
      setSelectedTab(categoryParam);
    }
  }, [searchParams]);

  const { data, error, isLoading, mutate } = useSWR(teamId ? `/api/forms?teamId=${teamId}` : null, fetcher);
  const filteredForms = data?.filter((form: Form) => selectedTab === 'all' ? true : form.category === selectedTab);

  const handleTabChange = (index: number) => {
    const selected = categories[index];
    setSelectedTab(selected);
    const params = new URLSearchParams(window.location.search);
    params.set('category', selected);
    router.replace(`?${params.toString()}`);
  };

  const handleDelete = async (formId: string) => {
    const toastId = toast.loading('Deleting form...');
    try {
      const res = await fetch(`/api/forms?id=${formId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete form');
      toast.success('Form deleted successfully', { id: toastId });
      mutate();
    } catch (err) {
      console.error(err);
      toast.error('Error deleting form', { id: toastId });
    }
  };

  return (
    <>
      {showResponses ? (
        <InlineResponses formId={showResponses}   onBack={() => setShowResponses(null)} />
      ) : (
        <>
          <Tab.Group selectedIndex={categories.indexOf(selectedTab)} onChange={handleTabChange} className="p-3">
            <Tab.List className="flex space-x-2 mb-4 border-b border-gray-300">
              {categories.map((cat) => (
                <Tab
                  key={cat}
                  className={({ selected }) =>
                    `px-3 py-1.5 text-xs rounded-t-md ${selected
                      ? 'bg-blue-100 text-blue-800 font-semibold border border-b-0 border-blue-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`
                  }
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Tab>
              ))}
            </Tab.List>
          </Tab.Group>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 text-gray-900 p-3">
            {/* Create New Form */}
            <button
              className="flex flex-col justify-center gap-4"
              onClick={() => {
                setSelectedForm(null);
                setIsOpen(true);
              }}
            >
              <div className="aspect-square bg-gray-100 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-200 transition-all shadow-sm">
                <FiPlus size={28} className="text-gray-700" />
              </div>
              <h1 className="text-left hover:font-semibold text-sm text-gray-900">Create New Form</h1>
            </button>

            {/* Loading skeleton */}
            {isLoading &&
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex flex-col justify-center gap-2 animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-2xl" />
                  <div className="h-4 w-2/3 bg-gray-300 rounded self-center" />
                </div>
              ))}

            {/* Filtered Forms */}
            {!isLoading &&
              filteredForms?.map((form: Form) => {
                const normalizedForm: Form = {
                  ...form,
                  description: form.description || '',
                  category: form.category || 'custom',
                  isTemplate: form.isTemplate ?? false,
                  fields: form.fields || [],
                };

                return (
                  <div key={form._id} className="flex flex-col justify-center gap-2 relative">
                    <div className="aspect-square bg-gray-100 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-sm transition-all hover:shadow-md cursor-pointer">
                      <CgFileDocument size={28} className="text-gray-700" />
                    </div>

                    <div className="flex items-center justify-between px-2 gap-4">
                      <h1 className="text-sm truncate">{form.title}</h1>

                      <Menu as="div" className="relative inline-block text-left">
                        <Menu.Button className="text-gray-700 text-xs cursor-pointer">
                          <BsThreeDotsVertical size={16} />
                        </Menu.Button>
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-36 origin-top-right divide-y divide-gray-200 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                          <div className="px-1 py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => {
                                    setSelectedForm(normalizedForm);
                                    setIsOpen(true);
                                  }}
                                  className={`${active ? 'bg-blue-100 text-blue-800' : 'text-gray-900'
                                    } group flex w-full items-center rounded px-2 py-2 text-xs`}
                                >
                                  Edit
                                </button>
                              )}
                            </Menu.Item>

                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => handleDelete(form._id)}
                                  className={`${active ? 'bg-red-100 text-red-700' : 'text-red-600'
                                    } group flex w-full items-center rounded px-2 py-2 text-xs`}
                                >
                                  Delete
                                </button>
                              )}
                            </Menu.Item>

                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => {
                                    const url = `${window.location.origin}/form/${form._id}`;
                                    navigator.clipboard.writeText(url);
                                    toast.success('Link copied to clipboard');
                                  }}
                                  className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-800'
                                    } group flex w-full items-center rounded px-2 py-2 text-xs`}
                                >
                                  Copy Link
                                </button>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => {
                                    setShowSnippet(form.code_snippet);
                                  }}

                                  className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-800'
                                    } group flex w-full items-center rounded px-2 py-2 text-xs`}
                                >
                                  Code Snippet
                                </button>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => setShowResponses(form._id)}
                                  className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-800'
                                    } group flex w-full items-center rounded px-2 py-2 text-xs`}
                                >
                                  Responses
                                </button>
                              )}
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Menu>
                    </div>
                  </div>
                );
              })}

            {error && (
              <div className="col-span-full text-red-500 text-sm">Failed to load forms.</div>
            )}
          </div>

          {/* Form Creation Panel */}
          <FormPanel
            isOpen={isOpen}
            onClose={() => {
              setIsOpen(false);
              setSelectedForm(null);
            }}
            mutate={mutate}
            form={selectedForm}
          />

          {/* Responses Panel */}

          {showSnippet && (<CodeSnippetModal
            isOpen={!!showSnippet}
            onClose={() => setShowSnippet(null)}
            code={showSnippet || ''}
          />)}
        </>
      )}
    </>
  );
}
