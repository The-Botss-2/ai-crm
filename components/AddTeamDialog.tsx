"use client";

import { Dialog, Transition } from "@headlessui/react";
import { useState, Fragment } from "react";
import useSWR, { mutate } from "swr";
import toast from "react-hot-toast";
import { axiosInstance, fetcher } from "@/lib/fetcher";
import { useParams } from "next/navigation";

export default function AddTeamDialog({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(false);
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
    widget_snippet: [],
  });
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
  const handleCreate = async () => {
    if (!teamName.trim()) {
      toast.error("Team name is required");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Creating team...");

    try {
      await axiosInstance.post("/api/team", {
        name: teamName,
        teamAccess: access,
      });

      toast.success("Team created successfully", { id: toastId });

      mutate(`/api/team/user?id=${userId}`); // update teams list
      setTeamName("");
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
        widget_snippet: [],
      })
      // mutate(`/api/team/user?id=${organization_id}&userId=${userId}`);
      setIsOpen(false);
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Something went wrong";
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 text-white text-xs px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        + Add Team
      </button>

      <Transition show={isOpen} as={Fragment}>
        <Dialog
          open={isOpen}
          onClose={() => setIsOpen(false)}
          className="relative z-50"
        >
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            aria-hidden="true"
          />

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

              <Dialog.Title className="text-lg font-semibold mb-4 text-gray-900">
                New Team
              </Dialog.Title>

              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Team name"
                className="
                  border border-gray-300
                  p-2
                  w-full
                  mb-4
                  rounded
                  text-sm
                  text-gray-900
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-500
                  focus:border-blue-500
                  transition
                "
                disabled={loading}
              />
              {/* Access Control checkboxes */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900">Access</h3>
                <div className="space-y-4 flex flex-row flex-wrap gap-4">
                  {['dashboard', 'leads', 'meetings', 'tasks', 'categories', 'products', 'forms', 'teams', 'analytics', 'campaigns', 'knowledge_base', 'widget_snippet'].map((field) => (
                    <div key={field}>
                      <label className="block text-sm text-gray-700 capitalize">{field}</label>
                      <div className="flex space-x-4">
                        {['Visible'].map((perm) => (
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
              <div className="flex justify-end space-x-3">
                <button
                  className="
                    px-4 py-2
                    rounded
                    bg-gray-200
                    text-sm
                    text-gray-800
                    hover:bg-gray-300
                    transition
                    disabled:opacity-50
                  "
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </button>

                <button
                  className="
                    px-4 py-2
                    rounded
                    bg-blue-600
                    text-sm
                    text-white
                    hover:bg-blue-700
                    transition
                    disabled:opacity-50
                  "
                  onClick={handleCreate}
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create"}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
}
