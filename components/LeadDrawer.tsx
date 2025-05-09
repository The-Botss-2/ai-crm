import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { IoClose } from 'react-icons/io5';
import LeadForm from '@/components/LeadForm';
import { Lead } from '@/types/lead';

interface LeadDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  editLead: Lead | null;
  teamId: string;
  userId: string;
  mutate: () => void;
}

const LeadDrawer: React.FC<LeadDrawerProps> = ({ isOpen, onClose, editLead, teamId, userId, mutate }) => {
  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl p-6 overflow-y-auto">
          <Dialog.Title className="text-lg font-semibold border-b border-gray-200 pb-4 mb-4 flex justify-between items-center">
            {editLead ? 'Edit Lead' : 'Add New Lead'}
            <button onClick={onClose}><IoClose size={16} /></button>
          </Dialog.Title>
          <LeadForm
            initialValues={{
              _id: editLead?._id || '',
              name: editLead?.name || '',
              email: editLead?.email || '',
              phone: editLead?.phone || '',
              company: editLead?.company || '',
              status: editLead?.status || 'new',
              source: editLead?.source || '',
              notes: editLead?.notes || '',
              team: teamId,
            }}
            isEdit={!!editLead}
            onClose={onClose}
            reload={mutate}
            submittedBy={userId}
          />
        </div>
      </Dialog>
    </Transition>
  );
};

export default LeadDrawer;
