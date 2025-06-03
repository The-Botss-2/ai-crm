'use client';

import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { axiosInstanceThirdParty } from '@/lib/thirdParty';

const BotWidget = ({ user_id, team_id }: { user_id: string; team_id: string }) => {
  const [loading, setLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech API recognition if available
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.continuous = true;

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptChunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptChunk;
          } else {
            interimTranscript += transcriptChunk;
          }
        }
        setTranscript(finalTranscript || interimTranscript);
      };

      recognition.onend = () => {
        if (listening) recognition.start(); // restart recognition on end if still listening
      };

      recognitionRef.current = recognition;
    } else {
      toast.error('Speech Recognition API not supported in your browser');
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  const handleBotClick = async () => {
    if (loading) return;

    // Request microphone permission first
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      toast.error('Microphone access is required to use the AI agent');
      return;
    }

    setLoading(true);

    try {
      // Create agent API call
      const response = await axiosInstanceThirdParty.post('/api/create-agent', {
        user_id,
        team_id,
      });

      toast.success('Agent created successfully!');
      setAgentId(response.data.agent_id || null);
      setIsChatOpen(true);
      startListening();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create agent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-5 left-5 z-50">
        <button
          onClick={handleBotClick}
          disabled={loading}
          title="Talk to AI Agent"
          className="bg-gradient-to-tr from-purple-700 to-blue-600 text-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform flex items-center justify-center"
          style={{ width: 56, height: 56 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            {/* Phone handset */}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 5.25a2.25 2.25 0 012.25-2.25h3.75a.75.75 0 01.75.75v3.75a.75.75 0 01-.75.75H7.5a11.25 11.25 0 0011.25 11.25v-2.25a.75.75 0 01.75-.75h3.75a.75.75 0 01.75.75v3.75a2.25 2.25 0 01-2.25 2.25H7.5a17.25 17.25 0 01-4.5-4.5z"
            />
            {/* AI brain nodes */}
            <circle cx="12" cy="8" r="1.5" stroke="currentColor" strokeWidth={1.5} />
            <circle cx="15" cy="11" r="1.5" stroke="currentColor" strokeWidth={1.5} />
            <circle cx="9" cy="11" r="1.5" stroke="currentColor" strokeWidth={1.5} />
            <path
              d="M12 8v3M9 11l3 3 3-3"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Chat panel */}
      {isChatOpen && (
        <div className="fixed bottom-20 left-5 z-50 w-80 h-96 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-700 to-blue-600 text-white">
            <h3 className="font-semibold text-lg">AI Chat Caller</h3>
            <button
              onClick={() => {
                setIsChatOpen(false);
                stopListening();
                setTranscript('');
              }}
              className="text-white hover:text-gray-200 font-bold"
              title="Close"
            >
              ×
            </button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto text-gray-700">
            <p>{transcript || 'Speak to start chatting...'}</p>
          </div>

          <div className="p-3 border-t border-gray-300 flex justify-between items-center">
            {listening ? (
              <button
                onClick={stopListening}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
              >
                Stop Listening
              </button>
            ) : (
              <button
                onClick={startListening}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
              >
                Start Listening
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default BotWidget;
