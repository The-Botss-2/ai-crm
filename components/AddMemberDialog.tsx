'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import toast from 'react-hot-toast';
import { axiosInstance } from '@/lib/fetcher';
import { useTeamRole } from '@/context/TeamRoleContext';

export default function AddMemberDialog({ teamId, requesterId, mutate, page }: any) {
  const [email, setEmail] = useState('');
  const { teamAccess } = useTeamRole();
  console.log(teamAccess, 'teamAccess');

  const [role, setRole] = useState('agent');
  const [access, setAccess] = useState<any>({
    dashboard: [],
    leads: [],
    meetings: [],
    tasks: [],
    categories: [],
    products: [],
    forms: [],
    teams: [],
    analytics: [],
    campaigns: [],
    knowledge_base: [],
  });
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAccessChange = (field: string, value: string) => {
    setAccess((prevAccess: any) => {
      const currentPermissions = prevAccess[field];
      if (currentPermissions.includes(value)) {
        return {
          ...prevAccess,
          [field]: currentPermissions.filter((perm: string) => perm !== value),
        };
      } else {
        return {
          ...prevAccess,
          [field]: [...currentPermissions, value],
        };
      }
    });
  };

  const handleAdd = async () => {
    if (!email || !role) return;
    const toastId = toast.loading('Adding member...');
    setLoading(true);

    try {
      const response = await axiosInstance.put(`/api/team/user?id=${teamId}`, {
        requesterId,
        email,
        role,
        access,
      });

      toast.success(response?.data?.message || 'Member added', { id: toastId });
      setEmail('');
      setAccess({
        dashboard: [],
        leads: [],
        meetings: [],
        tasks: [],
        categories: [],
        products: [],
        forms: [],
        teams: [],
        analytics: [],
        campaigns: [],
        knowledge_base: [],
      })
      setRole('agent');
      setIsOpen(false);
      page !== 'team' ? mutate() : null;
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to add', { id: toastId });
      setEmail('');
      setRole('agent');
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs hover:bg-blue-700 transition"
      >
        + Add Member
      </button>

      <Transition show={isOpen} as={Fragment} >
        <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50 ">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 z-[9999] rounded-xl shadow-md w-[500px] max-h-[70vh] overflow-y-scroll">
              <Dialog.Title className="text-lg font-semibold mb-4 text-gray-900">Add Member</Dialog.Title>
              <input
                type="email"
                placeholder="User email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-2 w-full mb-2 rounded text-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="border p-2 w-full mb-2 rounded text-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                <option value="manager">Manager</option>
                <option value="agent">Agent</option>
              </select>

              {/* Access Control checkboxes */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900">Access</h3>
                <div className="space-y-4">
                  {['dashboard', 'leads', 'meetings', 'tasks', 'categories', 'products', 'forms', 'teams', 'analytics', 'campaigns', 'knowledge_base']
                    .filter(field => teamAccess[field]?.includes('Visible'))
                    .map(field => (<div key={field}>
                      <label className="block text-sm text-gray-700 capitalize">{field}</label>
                      <div className="flex space-x-4">
                        {['read', 'write', 'update', 'delete'].map((perm) => (
                          <label key={perm} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              value={perm}
                              checked={access[field].includes(perm)}
                              onChange={() => handleAccessChange(field, perm)}
                              className="h-4 w-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                              disabled={loading}
                            />
                            <span>{perm.charAt(0).toUpperCase() + perm.slice(1)}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded text-xs text-gray-800 hover:bg-gray-300 transition"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition"
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add'}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
}
