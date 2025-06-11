import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { IoClose } from 'react-icons/io5';
import LeadForm from '@/components/LeadForm';
import { Lead } from '@/types/lead';

interface LeadPanelProps {
  lead: Lead | null;
  isOpen: boolean;
  mode: 'edit' | 'preview';
  onClose: () => void;
  teamId: string;
  userId: string;
  mutate: () => void;
}

const LeadPanel: React.FC<LeadPanelProps> = ({
  lead,
  isOpen,
  mode,
  onClose,
  teamId,
  userId,
  mutate
}) => {
  const isPreview = mode === 'preview';
  const isEdit = mode === 'edit' && !!lead;

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl p-6 overflow-y-auto">
          <Dialog.Title className="text-md font-semibold border-b border-gray-200 pb-4 mb-4 flex justify-between items-center text-gray-900">
            {isPreview ? 'Preview Lead' : isEdit ? 'Edit Lead' : 'Add New Lead'}
            <button onClick={onClose} aria-label="Close panel" className="text-gray-600 hover:text-gray-900 transition">
              <IoClose size={16} />
            </button>
          </Dialog.Title>

          {(lead || !isEdit) && (
            <LeadForm
              initialValues={{
                _id: lead?._id || '',
                name: lead?.name || '',
                email: lead?.email || '',
                phone: lead?.phone || '',
                company: lead?.company || '',
                status: lead?.status || 'new',
                source: lead?.source || '',
                notes: lead?.notes || '',
                team: teamId || '',
                createdBy : lead?.createdBy || userId
              }}
              submittedBy={userId}
              isEdit={isEdit}
              isPreview={isPreview}
              onClose={onClose}
              reload={mutate}
            />
          )}
        </div>
      </Dialog>
    </Transition>
  );
};

export default LeadPanel;
