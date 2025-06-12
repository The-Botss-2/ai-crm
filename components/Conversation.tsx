'use client';
import React from 'react';
import {  Mic } from 'lucide-react';

interface Props {
  conversations:any
}
const ConversationCom = ({ conversations}: Props) => {
  return (
    <>
      {/* Conversations */}
      {conversations.length > 0 && (
        <div className=" rounded-xl p-3">
          <h2 className="flex items-center text-xl font-semibold mb-4 gap-2">
            <Mic className="w-6 h-6 text-purple-600" />
            Conversations
          </h2>
          {conversations.map((conv:any) => (
            <div key={conv.id} className="border-t pt-4 mt-4 text-sm">
              <p className="text-gray-800"><strong>Summary:</strong> {conv.summary}</p>
              <p className="text-gray-600 mt-2 whitespace-pre-wrap">{conv.transcript}</p>
              <p className="text-xs text-gray-400 mt-2">
                ⏱ {conv.duration_seconds}s &nbsp;&nbsp; | &nbsp;&nbsp; 💵 ${conv.cost.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default ConversationCom;
