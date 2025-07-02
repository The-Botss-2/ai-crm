'use client'
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import CopyToClipboard from 'react-copy-to-clipboard';
import toast from 'react-hot-toast';
import { AiOutlineCopy } from 'react-icons/ai';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

const WidgetSnippetPage = ({ user_id }: any) => {
  const [copied, setCopied] = useState(false);
  const [code, setCode] = useState('');

  const fetchapi = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_CALLING_AGENT_URL}/api/agent_widget_snippet?crm_user_id=${user_id}`);
      if (response?.status === 200) {
        setCode(response?.data?.widget_snippet);
      } else {
        toast.error('Failed to fetch snippet');
      }
    } catch (error) {
      toast.error('Failed to fetch snippet');
    }
  }

  useEffect(() => {
    if (!user_id) return;
    fetchapi();
  }, [user_id]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl p-8 transition-all duration-300">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">🔧 Widget Snippet</h2>

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-700">Code Snippet</h3>
          <CopyToClipboard
            text={code}
            onCopy={() => {
              setCopied(true);
              toast.success('Code copied to clipboard');
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            <button className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition">
              <AiOutlineCopy size={18} />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </CopyToClipboard>
        </div>

        <div className="max-h-[400px] overflow-auto rounded-lg border border-gray-300 bg-gray-900">
          <SyntaxHighlighter language="javascript" style={vscDarkPlus} wrapLines wrapLongLines>
            {code || '// Loading...'}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
}

export default WidgetSnippetPage;
