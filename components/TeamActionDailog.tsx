'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import toast from 'react-hot-toast';
import { axiosInstance } from '@/lib/fetcher';

export default function TeamActionDialog({ team, teamId, requesterId, mutate }: any) {
    console.log(team, 'teamteam');
    
  const [isOpen, setIsOpen] = useState(false);
    const [name , setName] = useState(team?.name)
  const [permissions, setPermissions] = useState(team?.teamAccess);
  const [loading, setLoading] = useState(false);

  // Handle permission changes (multiple permissions can be selected)
  const handlePermissionChange = (field: string, permission: string) => {
    setPermissions((prevPermissions: any) => {
      const currentPermissions = prevPermissions[field] || [];
      if (currentPermissions.includes(permission)) {
        return {
          ...prevPermissions,
          [field]: currentPermissions.filter((perm: string) => perm !== permission),
        };
      } else {
        return {
          ...prevPermissions,
          [field]: [...currentPermissions, permission],
        };
      }
    });
  };

  const handleUpdate = async () => {
    if(!name) {
      return toast.error('Team name is required');
    }
    const toastId = toast.loading('Updating role and permissions...');
    setLoading(true);
    try {
      await axiosInstance.put(`/api/team`, {
        requesterId,
        teamId: team._id,
        name,
        access: permissions,
      });

      toast.success('Name and permissions updated', { id: toastId });
      setIsOpen(false);
      window.location.reload();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to update', { id: toastId });
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <button onClick={() => setIsOpen(true)} className="text-sm text-blue-600 hover:underline">Actions</button>

      <Transition show={isOpen} as={Fragment}>
        <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
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

              <Dialog.Title className="text-lg font-semibold mb-4">Update Team & Permissions</Dialog.Title>

              {/* Role selection */}
               <input
                type="text"
                placeholder="Team Name"
                value={name}
                required
                onChange={(e) => setName(e.target.value)}
                className="border p-2 w-full mb-2 rounded text-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />

              {/* Permissions checkboxes */}
              <div className="space-y-4 flex flex-row flex-wrap gap-4">
                {['dashboard', 'leads', 'meetings', 'tasks', 'categories', 'products', 'forms', 'teams', 'analytics', 'campaigns', 'knowledge_base', 'widget_snippet'].map(field => (<div key={field}>
                    <h3 className="font-semibold text-gray-900 capitalize">{field}</h3>
                    <div className="flex space-x-4">
                      {['Visible'].map((perm) => (
                        <label key={perm} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            value={perm}
                            checked={permissions[field]?.includes(perm)}
                            onChange={() => handlePermissionChange(field, perm)}
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

              <div className="flex justify-between mt-4">
            
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 bg-gray-200 rounded text-xs"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="px-4 py-2 bg-blue-600 text-white rounded text-xs"
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
}
