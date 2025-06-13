'use client';

import { Dialog } from '@headlessui/react';
import { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import toast from 'react-hot-toast';
import { AiOutlineCopy } from 'react-icons/ai';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';


type CodeSnippetModalProps = {
  isOpen: boolean;
  onClose: () => void;
  code: string;
};

export default function CodeSnippetModal({ isOpen, onClose, code }: CodeSnippetModalProps) {
  const [copied, setCopied] = useState(false);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="max-w-2xl w-full bg-white p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-semibold">Code Snippet</Dialog.Title>
            <CopyToClipboard
              text={code}
              onCopy={() => {
                setCopied(true);
                toast.success('Code copied to clipboard');
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              <button className="text-sm text-blue-600 flex items-center gap-1 hover:underline">
                <AiOutlineCopy size={18} />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </CopyToClipboard>
          </div>

          <div className="max-h-[400px] overflow-auto rounded-md border bg-gray-100">
            <SyntaxHighlighter language="javascript" style={vscDarkPlus} wrapLines wrapLongLines>
              {code}
            </SyntaxHighlighter>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
