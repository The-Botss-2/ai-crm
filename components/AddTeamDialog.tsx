"use client";

import { Dialog, Transition } from "@headlessui/react";
import { useState, Fragment } from "react";
import { mutate } from "swr";
import toast from "react-hot-toast";
import { axiosInstance } from "@/lib/fetcher";

export default function AddTeamDialog({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(false);

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
        adminId: userId,
      });

      toast.success("Team created successfully", { id: toastId });

      mutate(`/api/team/user?id=${userId}`); // update teams list
      setTeamName("");
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
            <Dialog.Panel
              className="
                fixed top-1/3 left-1/2 -translate-x-1/2 transform
                bg-white
                p-6
                z-50
                rounded-xl
                shadow-md
                w-96
              "
            >
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
