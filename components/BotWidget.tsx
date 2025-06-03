'use client';

import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { axiosInstance } from '@/lib/fetcher';
import { useRouter } from 'next/navigation';
import { navigation } from '@/utils';

const BotWidget = ({ user_id, team_id }: { user_id: string; team_id: string }) => {
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<{
    totalLeads: number;
    pendingTasks: number;
    completedTasks: number;
    upcomingMeetings: { title: string; startTime: string }[];
  } | null>(null);

  const recognitionRef = useRef<any>(null);
  const router = useRouter();

  const navigationPaths = navigation.map((item) => item.href);

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
          const transcriptChunk = event.results[i][0].transcript.trim();
          if (event.results[i].isFinal) {
            finalTranscript += transcriptChunk + ' ';
          } else {
            interimTranscript += transcriptChunk + ' ';
          }
        }
        const combinedTranscript = (finalTranscript || interimTranscript).trim();

        if (finalTranscript) {
          handleCommands(combinedTranscript.toLowerCase());
        }
      };

      recognition.onend = () => {
        if (listening) recognition.start();
      };

      recognitionRef.current = recognition;
    } else {
      toast.error('Speech Recognition API not supported in your browser');
    }
  }, [listening, analyticsData]);

  const startListening = () => {
    if (recognitionRef.current && !listening) {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(utterance);
    }
  };

  const handleCommands = (text: string) => {
    const redirectRegex = /(redirect|go|navigate)( to)? (\/[a-z0-9\-_/]*)/i;
    const redirectMatch = text.match(redirectRegex);
    if (redirectMatch && redirectMatch[3]) {
      const path = redirectMatch[3];

      if (navigationPaths.includes(path)) {
        stopListening();
        toast.success(`Redirecting to ${path}`);
        router.push(path);
      } else {
        const msg = "Sorry, that page was not found.";
        speak(msg);
      }
      return;
    }

    if (!analyticsData) {
      const msg = "I don't have any analytics data right now.";
      speak(msg);
      return;
    }

    if (text.includes('leads')) {
      const msg = `You have ${analyticsData.totalLeads} lead${analyticsData.totalLeads !== 1 ? 's' : ''}.`;
      speak(msg);
      return;
    }

    if (text.includes('pending tasks')) {
      const msg = `You have ${analyticsData.pendingTasks} pending task${analyticsData.pendingTasks !== 1 ? 's' : ''}.`;
      speak(msg);
      return;
    }

    if (text.includes('completed tasks')) {
      const msg = `You have completed ${analyticsData.completedTasks} task${analyticsData.completedTasks !== 1 ? 's' : ''}.`;
      speak(msg);
      return;
    }

    if (text.includes('upcoming meetings')) {
      if (analyticsData.upcomingMeetings.length === 0) {
        const msg = 'You have no upcoming meetings.';
        speak(msg);
      } else {
        const meetingTitles = analyticsData.upcomingMeetings.map(m => m.title).join(', ');
        const msg = `Your upcoming meetings are: ${meetingTitles}`;
        speak(msg);
      }
      return;
    }

    const fallbackMsg = "I don't have that information.";
    speak(fallbackMsg);
  };

  const handleBotClick = async () => {
    if (loading) return;

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      toast.error('Microphone access is required to use the AI agent');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/analytics?teamId=${team_id}`);
      setAnalyticsData(response.data);
      startListening();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create agent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-5 right-5 z-50">
        <button
          onClick={handleBotClick}
          disabled={loading}
          title="Talk to AI Agent"
          className="bg-gradient-to-tr from-purple-700 to-blue-600 text-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform flex items-center justify-center"
          style={{ width: 56, height: 56 }}
        >
          {/* SVG omitted for brevity */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 5.25a2.25 2.25 0 012.25-2.25h3.75a.75.75 0 01.75.75v3.75a.75.75 0 01-.75.75H7.5a11.25 11.25 0 0011.25 11.25v-2.25a.75.75 0 01.75-.75h3.75a.75.75 0 01.75.75v3.75a2.25 2.25 0 01-2.25 2.25H7.5a17.25 17.25 0 01-4.5-4.5z"
            />
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
    </>
  );
};

export default BotWidget;
