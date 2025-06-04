'use client'

import React, { useState, useEffect } from 'react';
import { Mail, Send, Sparkles, Trash2 } from 'lucide-react';
import useSWR, { mutate } from 'swr';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

// Types
interface Reply {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  isUser: boolean;
}

interface Email {
  id: string;
  subject: string;
  body: string;
  sender: {
    name: string;
    email: string;
    avatar: string;
  };
  date: Date;
  replies: Reply[];
}

interface EmailClientProps {
  userid: string;
}

// Fetcher function for useSWR
const fetcher = (url: string) => axios.get(url).then(res =>
  res.data.map((email: any) => ({
    ...email,
    date: new Date(email.date),
    replies: email.replies.map((reply: any) => ({
      ...reply,
      timestamp: new Date(reply.timestamp)
    }))
  }))
);

const EmailClient: React.FC<EmailClientProps> = ({ userid }) => {
  const emailsKey = `https://crm-emails.thebotss.com/emails/${userid}`;
  const { data: emails, error, isLoading } = useSWR<Email[]>(emailsKey, fetcher);

  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [isGeneratingReply, setIsGeneratingReply] = useState<boolean>(false);
  const [isSendingReply, setIsSendingReply] = useState<boolean>(false);
  const [urlQuery, setUrlQuery] = useState<string>('');

  useEffect(() => {
    if (urlQuery) {
      setSelectedEmailId(urlQuery);
    }
  }, [urlQuery]);

  const selectedEmail = emails?.find(email => email.id === selectedEmailId);

  const handleEmailClick = (emailId: string) => {
    setSelectedEmailId(emailId);
    setUrlQuery(emailId);
    setReplyText('');
  };

  const handleGenerateAIResponse = async (message_id: string) => {
    if (!selectedEmail) return;

    setIsGeneratingReply(true);
    const loadingToast = toast.loading('Generating AI response...');

    try {
      const response = await axios.post('https://crm-emails.thebotss.com/generate-reply', {
        user_id: userid,
        message_id: message_id
      });

      setReplyText(response.data.reply_body);
      toast.success('AI response generated successfully!', { id: loadingToast });

    } catch (error) {
      console.error('Error generating AI response:', error);

      let errorMessage = 'Failed to generate AI response';
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          errorMessage = 'Email not found';
        } else if (error.response?.status === 500) {
          errorMessage = 'Server error. Please try again later';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage, { id: loadingToast });
    } finally {
      setIsGeneratingReply(false);
    }
  };

  const handleSendReply = async (to: string, subject: string): Promise<void> => {
    if (!replyText.trim() || !selectedEmail) return;

    setIsSendingReply(true);
    const loadingToast = toast.loading('Sending reply...');

    try {
      const response = await axios.post('https://crm-emails.thebotss.com/send-reply', {
        user_id: userid,
        to: to,
        subject: `Re: ${subject}`,
        body: replyText
      });

      // Create new reply object to add to the email
      const newReply: Reply = {
        id: response.data.reply_id || Math.random().toString(36).substr(2, 9),
        content: replyText,
        sender: 'You',
        timestamp: new Date(),
        isUser: true
      };

      // Optimistically update the emails data
      if (emails) {
        const updatedEmails = emails.map(email =>
          email.id === selectedEmailId
            ? { ...email, replies: [...email.replies, newReply] }
            : email
        );

        // Mutate the SWR cache with optimistic update
        mutate(emailsKey, updatedEmails, false);
      }

      setReplyText('');
      toast.success('Reply sent successfully!', { id: loadingToast });

      // Revalidate the data to ensure consistency
      setTimeout(() => {
        mutate(emailsKey);
      }, 1000);

    } catch (error) {
      console.error('Error sending reply:', error);

      let errorMessage = 'Failed to send reply';
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          errorMessage = 'Invalid request. Please check your input';
        } else if (error.response?.status === 401) {
          errorMessage = 'Unauthorized. Please check your credentials';
        } else if (error.response?.status === 500) {
          errorMessage = 'Server error. Please try again later';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage, { id: loadingToast });
    } finally {
      setIsSendingReply(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen text-dark items-center justify-center overflow-x-hidden">
        <div className="text-center">
          <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Loading emails...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen text-black items-center justify-center overflow-x-hidden">
        <div className="text-center">
          <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Error loading emails. Please try again later.</p>
        </div>
      </div>
    );
  }

  if (!emails || emails.length === 0) {
    return (
      <div className="flex h-screen  text-black items-center justify-center overflow-x-hidden">
        <div className="text-center">
          <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No emails found.</p>
        </div>
      </div>
    );
  }
  return <div className="grid grid-cols-3 h-screen bg-gray-100 text-gray-800">
    <div className="border-r border-gray-300 bg-white overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-blue-600" />
          <h1 className="text-lg font-semibold">Inbox</h1>
        </div>
      </div>
      {emails.map(email => (
        <div
          key={email.id}
          onClick={() => handleEmailClick(email.id)}
          className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-blue-50 transition ${selectedEmailId === email.id ? 'bg-blue-100 border-l-4 border-blue-500' : ''}`}
        >
          <div className="flex items-start gap-3">
            <img src={email.sender.avatar} alt={email.sender.name} className="w-10 h-10 rounded-full" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold truncate">{email.sender.name}</h3>
              <p className="text-xs text-gray-500 truncate">{email.subject}</p>
              <p className="text-xs text-gray-500 truncate">{email.body}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
    <div className="col-span-2 flex flex-col">
      {selectedEmail ? (
        <div className="flex-1 flex flex-col">
          <div className="p-6 border-b border-gray-300 bg-white">
            <div className="flex items-start gap-4">
              <img src={selectedEmail.sender.avatar} alt={selectedEmail.sender.name} className="w-12 h-12 rounded-full" />
              <div>
                <h2 className="text-base font-semibold">{selectedEmail.subject}</h2>
                <div className="text-sm text-gray-500">
                  {selectedEmail.sender.name} • {selectedEmail.sender.email} • {formatDate(selectedEmail.date)}
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200 h-[100vh]">
              <pre className="whitespace-pre-wrap text-sm text-gray-700">{selectedEmail.body}</pre>
            </div>
            {selectedEmail.replies.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700">Replies</h3>
                {selectedEmail.replies.map(reply => (
                  <div
                    key={reply.id}
                    className={`p-4 text-sm rounded-lg ${reply.isUser ? 'bg-blue-100 ml-8' : 'bg-gray-100 mr-8'} border`}
                  >
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{reply.sender}</span>
                      <span className="text-xs text-gray-500">{formatDate(reply.timestamp)}</span>
                    </div>
                    <p className="text-gray-800">{reply.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-6 border-t border-gray-300 bg-white">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none text-sm focus:ring focus:ring-blue-200"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => handleGenerateAIResponse(selectedEmail.id)}
                disabled={isGeneratingReply}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {isGeneratingReply ? 'Generating...' : 'Generate AI Response'}
              </button>
              <button
                onClick={() => handleSendReply(selectedEmail.sender.email, selectedEmail.subject)}
                disabled={!replyText.trim() || isSendingReply}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {isSendingReply ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-center text-gray-500">
          <div>
            <Mail className="w-16 h-16 mx-auto mb-4 text-blue-400" />
            <h2 className="text-xl font-semibold">Select an email to read</h2>
            <p>Choose an email from the list to view its contents and reply.</p>
          </div>
        </div>
      )}
    </div>
  </div>;
};

export default EmailClient;
