"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneCall, PhoneOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

const VoiceCallWidget = () => {
    const [isCallOpen, setIsCallOpen] = useState(false);
    const [callState, setCallState] = useState('idle'); // idle, ringing, connected, ended
    const [callDuration, setCallDuration] = useState('00:00:00');
    const [isMuted, setIsMuted] = useState(false);
    const [isVolumeOn, setIsVolumeOn] = useState(true);

    // WebRTC and call management refs
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const dataChannelRef = useRef<RTCDataChannel | null>(null);
    const beepIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const secondsRef = useRef(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);
console.log(isCallOpen, 'isCallOpen');

    // Initialize audio for beeping
    useEffect(() => {
        audioRef.current = new Audio('/static/assets/beep.mp3');
    }, []);

    // Core calling logic adapted from app.js
    const startCall = async (instructions = null) => {
        setIsCallOpen(true);
        setCallState('ringing');
        startBeeping();
        console.log("INSTRUCTIONS", instructions);
        
        try {
            // 1️⃣ Create session
            const key = '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'
            
            const opts = instructions ? { method: 'POST', headers: { 'Content-Type': 'application/json' },  } : {};
            const openaiRes = await fetch('https://api.openai.com/v1/realtime/sessions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${key}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    
                })
            });

                const data = await openaiRes.json();
                const EPHEMERAL = data.client_secret.value;
   

            // 2️⃣ Setup WebRTC
            peerConnectionRef.current = new RTCPeerConnection();
            peerConnectionRef.current.onconnectionstatechange = () => {
                if (peerConnectionRef.current && peerConnectionRef.current.connectionState === 'connected') {
                    onConnected();
                }
            };

            peerConnectionRef.current.ontrack = e => {
                const audio = document.createElement('audio');
                audio.autoplay = true;
                audio.srcObject = e.streams[0];
                audio.muted = !isVolumeOn;
            };

            const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            peerConnectionRef.current.addTrack(micStream.getTracks()[0]);

            // 3️⃣ Data Channel & Functions
            dataChannelRef.current = peerConnectionRef.current.createDataChannel('response');
            dataChannelRef.current.onopen = () => configureDataChannel();
            dataChannelRef.current.onmessage = async ev => {
                type FunctionHandlerName = keyof typeof functionHandlers;
                type MsgType = {
                    type: string;
                    name: FunctionHandlerName;
                    arguments: string;
                    call_id: string;
                };
                const msg: MsgType = JSON.parse(ev.data);
                if (msg.type === 'response.function_call_arguments.done') {
                    const fn = functionHandlers[msg.name];
                    if (fn) {
                        const args = JSON.parse(msg.arguments);
                        const result = await fn(args);
                        dataChannelRef.current!.send(JSON.stringify({
                            type: 'conversation.item.create',
                            item: {
                                type: 'function_call_output',
                                call_id: msg.call_id,
                                output: JSON.stringify(result)
                            }
                        }));
                    }
                }
            };

            // 4️⃣ SDP Offer/Answer
            const offer = await peerConnectionRef.current.createOffer();
            await peerConnectionRef.current.setLocalDescription(offer);
            const sdpRes = await fetch(
                `https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17`,
                {
                    method: 'POST',
                    body: offer.sdp,
                    headers: {
                        'Authorization': `Bearer ${key}`,
                        'Content-Type': 'application/sdp'
                    }
                }
            );
            const answer: RTCSessionDescriptionInit = {
                type: 'answer',
                sdp: await sdpRes.text()
            };
            await peerConnectionRef.current.setRemoteDescription(answer);

        } catch (err) {
            console.error('Call failed:', err);
            endCall();
        }
    };

    const onConnected = () => {
        stopBeeping();
        setCallState('connected');
        startTimer();
    };

    const configureDataChannel = () => {
        const sessionUpdate = {
            type: 'session.update',
            session: {
                modalities: ['text', 'audio'],
                tools: [
                    {
                        type: 'function',
                        name: 'changeBackgroundColor',
                        description: 'Changes background gradient',
                        parameters: {
                            type: 'object',
                            properties: {
                                color1: { type: 'string' },
                                color2: { type: 'string' }
                            },
                            required: ['color1', 'color2']
                        }
                    },
                    {
                        type: 'function',
                        name: 'searchWeb',
                        description: 'Search the web for a query',
                        parameters: {
                            type: 'object',
                            properties: {
                                query: { type: 'string' }
                            },
                            required: ['query']
                        }
                    },
                    {
                        type: 'function',
                        name: 'sendEmail',
                        description: 'Send an email with call summary',
                        parameters: {
                            type: 'object',
                            properties: {
                                message: { type: 'string' }
                            },
                            required: ['message']
                        }
                    }
                ]
            }
        };
        if (dataChannelRef.current) {
            dataChannelRef.current.send(JSON.stringify(sessionUpdate));
        }
    };

    // Function handlers from app.js
    const functionHandlers = {
        changeBackgroundColor: ({ color1, color2 }: { color1: string; color2: string }) => {
            document.body.style.background = `linear-gradient(135deg, ${color1}, ${color2})`;
            return { success: true };
        },
        sendEmail: async ({ message }: { message: string }) => {
            const res = await fetch('/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
            return await res.json();
        },
        searchWeb: async ({ query }: { query: string }) => {
            try {
                const res = await fetch('/search', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query })
                });
                const results = await res.json();
                return { success: true, results };
            } catch (e: any) {
                return { success: false, error: e.message };
            }
        }
    };

    const startBeeping = () => {
        if (audioRef.current) {
            audioRef.current.play().catch(console.error);
            beepIntervalRef.current = setInterval(() => {
                if (audioRef.current) {
                    audioRef.current.play().catch(console.error);
                }
            }, 3000);
        }
    };

    const stopBeeping = () => {
        if (beepIntervalRef.current) {
            clearInterval(beepIntervalRef.current);
            beepIntervalRef.current = null;
        }
    };

    const startTimer = () => {
        secondsRef.current = 0;
        setCallDuration('00:00:00');
        timerIntervalRef.current = setInterval(() => {
            secondsRef.current++;
            const h = String(Math.floor(secondsRef.current / 3600)).padStart(2, '0');
            const m = String(Math.floor((secondsRef.current % 3600) / 60)).padStart(2, '0');
            const s = String(secondsRef.current % 60).padStart(2, '0');
            setCallDuration(`${h}:${m}:${s}`);
        }, 1000);
    };

    const endCall = () => {
        stopBeeping();
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }

        if (peerConnectionRef.current) {
            peerConnectionRef.current.getSenders().forEach(sender => {
                if (sender.track) sender.track.stop();
            });
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        if (dataChannelRef.current) {
            dataChannelRef.current.close();
            dataChannelRef.current = null;
        }

        if (callState === 'connected') {
            setCallState('ended');
            setTimeout(() => {
                setIsCallOpen(false);
                setCallState('idle');
                setCallDuration('00:00:00');
            }, 3000);
        } else {
            setIsCallOpen(false);
            setCallState('idle');
            setCallDuration('00:00:00');
        }
    };

    const toggleMute = () => {
        if (peerConnectionRef.current) {
            const sender = peerConnectionRef.current.getSenders().find(s =>
                s.track && s.track.kind === 'audio'
            );
            if (sender && sender.track) {
                sender.track.enabled = isMuted;
                setIsMuted(!isMuted);
            }
        }
    };

    const toggleVolume = () => {
        setIsVolumeOn(!isVolumeOn);
        // Update all audio elements
        document.querySelectorAll('audio').forEach(audio => {
            audio.muted = isVolumeOn;
        });
    };

    const getCallStatusText = () => {
        switch (callState) {
            case 'ringing': return 'Calling AI Assistant...';
            case 'connected': return 'Connected with AI';
            case 'ended': return `Call ended • Duration: ${callDuration}`;
            default: return 'Ready to call';
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {/* Call Interface */}
            {isCallOpen && (
                <div className="mb-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
                    {/* Call Header */}
                    <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 text-white text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-3 flex items-center justify-center">
                            {callState === 'ringing' ? (
                                <div className="w-8 h-8 bg-white/40 rounded-full animate-pulse flex items-center justify-center">
                                    <Phone size={20} />
                                </div>
                            ) : (
                                <Phone size={20} />
                            )}
                        </div>
                        <h3 className="font-semibold text-lg">AI Assistant</h3>
                        <p className="text-sm opacity-90">{getCallStatusText()}</p>
                        {callState === 'connected' && (
                            <p className="text-lg font-mono mt-2">{callDuration}</p>
                        )}
                    </div>

                    {/* Call Controls */}
                    <div className="p-6">
                        <div className="flex justify-center space-x-4">
                            {/* Mute Button */}
                            <button
                                onClick={toggleMute}
                                disabled={callState !== 'connected'}
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isMuted
                                    ? 'bg-red-100 text-red-600'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    } disabled:opacity-50`}
                            >
                                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                            </button>

                            {/* End Call Button */}
                            <button
                                onClick={endCall}
                                className="w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all transform hover:scale-105"
                            >
                                <PhoneOff size={24} />
                            </button>

                            {/* Volume Button */}
                            <button
                                onClick={toggleVolume}
                                disabled={callState !== 'connected'}
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${!isVolumeOn
                                    ? 'bg-red-100 text-red-600'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    } disabled:opacity-50`}
                            >
                                {isVolumeOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
                            </button>
                        </div>

                        {/* Call Status Indicator */}
                        {callState === 'ringing' && (
                            <div className="flex items-center justify-center mt-4 space-x-2 text-gray-500">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-100"></div>
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-200"></div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Floating Call Button */}
            <button
                onClick={() => callState === 'idle' ? startCall() : null}
                disabled={callState !== 'idle'}
                className={`w-14 h-14 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center group ${callState === 'idle'
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    }`}
            >
                {callState === 'ringing' ? (
                    <div className="animate-pulse">
                        <PhoneCall size={24} />
                    </div>
                ) : callState === 'connected' ? (
                    <div className="relative">
                        <Phone size={24} />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                    </div>
                ) : (
                    <Phone size={24} className="group-hover:scale-110 transition-transform duration-200" />
                )}
            </button>
        </div>
    );
};

export default VoiceCallWidget;