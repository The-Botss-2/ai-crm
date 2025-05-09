import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { IoClose } from 'react-icons/io5';
import LeadForm from '@/components/LeadForm';
import { Lead } from '@/types/lead';

interface LeadPreviewProps {
  lead: Lead | null;
  onClose: () => void;
  teamId: string;
  mutate: () => void;
}

const LeadPreview: React.FC<LeadPreviewProps> = ({ lead, onClose, teamId, mutate }) => {
  return (
    <Transition show={!!lead} as={React.Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl p-6 overflow-y-auto">
          <Dialog.Title className="text-lg font-semibold border-b border-gray-200 pb-4 mb-4 flex justify-between items-center">
            Preview Lead
            <button onClick={onClose}><IoClose size={16} /></button>
          </Dialog.Title>
          {lead && (
            <LeadForm
              initialValues={{
                _id: lead._id,
                name: lead.name,
                email: lead.email,
                phone: lead.phone,
                company: lead.company,
                status: lead.status,
                source: lead.source,
                notes: lead.notes,
                team: teamId,
              }}
              isEdit={false}
              isPreview={true}
              onClose={onClose}
              reload={mutate}
              submittedBy={'read-only'}
            />
          )}
        </div>
      </Dialog>
    </Transition>
  );
};

export default LeadPreview;
