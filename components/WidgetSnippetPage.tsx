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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl p-6 sm:p-8 border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">🔧 Widget Snippet</h1>
          <CopyToClipboard
            text={code}
            onCopy={() => {
              setCopied(true);
              toast.success('Code copied to clipboard');
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 active:scale-95 transition-transform">
              <AiOutlineCopy size={18} />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </CopyToClipboard>
        </div>

        <div className="bg-[#1e1e1e] rounded-lg overflow-auto max-h-[500px] border border-gray-300">
          <SyntaxHighlighter language="javascript" style={vscDarkPlus} customStyle={{ margin: 0, padding: '1rem' }} wrapLines wrapLongLines>
            {code || '// Loading...'}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
}

export default WidgetSnippetPage;
