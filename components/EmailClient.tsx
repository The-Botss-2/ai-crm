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
      <div className="flex h-screen bg-slate-900 text-white items-center justify-center overflow-x-hidden">
        <div className="text-center">
          <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Loading emails...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-slate-900 text-white items-center justify-center overflow-x-hidden">
        <div className="text-center">
          <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Error loading emails. Please try again later.</p>
        </div>
      </div>
    );
  }

  if (!emails || emails.length === 0) {
    return (
      <div className="flex h-screen bg-slate-900 text-white items-center justify-center overflow-x-hidden">
        <div className="text-center">
          <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No emails found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 h-screen bg-slate-900 text-white overflow-x-hidden">
      <div className=" border-r border-slate-700 flex flex-col overflow-x-hidden col-span-1">
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Mail className="w-6 h-6 text-blue-400" />
            <h1 className="text-xl font-semibold truncate">Inbox</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {emails.map((email) => (
            <div
              key={email.id}
              onClick={() => handleEmailClick(email.id)}
              className={`p-4 border-b border-slate-700 cursor-pointer transition-colors hover:bg-slate-800 ${selectedEmailId === email.id ? 'bg-slate-800 border-l-4 border-l-blue-400' : ''}`}
            >
              <div className="flex items-start gap-3">
                <img
                  src={email.sender.avatar}
                  alt={email.sender.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-sm truncate">{email.sender.name}</h3>
                    <span className="text-xs text-slate-400 ml-2">{formatDate(email.date)}</span>
                  </div>
                  <p className="text-sm font-medium text-white mb-1 truncate">{email.subject}</p>
                  <pre className="text-xs text-slate-400 line-clamp-2 overflow-hidden">{email.body}</pre>
                  {email.replies.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs bg-slate-700 px-2 py-1 rounded">
                        {email.replies.length} replies
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden col-span-2">
        {selectedEmail ? (
          <>
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <img
                    src={selectedEmail.sender.avatar}
                    alt={selectedEmail.sender.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <h2 className="font-semibold mb-1 text-sm truncate">{selectedEmail.subject} </h2>
                    <div className="text-xs text-slate-400 flex flex-wrap gap-x-2">
                      <span className="font-medium truncate">{selectedEmail.sender.name}</span>
                      <span className="mx-2">•</span>
                      <span className="truncate">{selectedEmail.sender.email}</span>
                      <span className="mx-2">•</span>
                      <span>{formatDate(selectedEmail.date)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <div className="p-6">
                <div className="bg-slate-800 rounded-lg p-4 mb-6">
                  <pre className="text-slate-200 leading-relaxed text-sm break-words whitespace-pre-wrap font-sans">{selectedEmail.body}</pre>
                </div>

                {selectedEmail.replies.length > 0 && (
                  <div className="space-y-4 mb-6">
                    <h3 className="font-medium text-slate-300 text-xs">Replies</h3>
                    {selectedEmail.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className={`text-sm p-4 rounded-lg ${reply.isUser ? 'bg-blue-900/30 ml-8' : 'bg-slate-800 mr-8'}`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium truncate">{reply.sender}</span>
                          <span className="text-xs text-slate-400">
                            {formatDate(reply.timestamp)}
                          </span>
                        </div>
                        <p className="text-slate-200 break-words">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-700 p-6">
              <div className="space-y-4">
                <h3 className="text-xs font-medium">Reply</h3>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply here..."
                  className="w-full h-20 text-sm bg-slate-800 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => handleGenerateAIResponse(selectedEmail.id)}
                    disabled={isGeneratingReply}
                    className="flex items-center gap-2 text-xs px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    {isGeneratingReply ? 'Generating...' : 'Generate AI Response'}
                  </button>
                  <button
                    onClick={() => handleSendReply(selectedEmail.sender.email, selectedEmail.subject)}
                    disabled={!replyText.trim() || isSendingReply}
                    className="flex items-center gap-2 text-xs px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    {isSendingReply ? 'Sending...' : 'Send Reply'}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center overflow-x-hidden">
            <div className="text-center text-slate-400">
              <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-medium mb-2">Select an email to read</h2>
              <p>Choose an email from the list to view its contents and reply</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailClient;