import React from 'react'
import { auth } from '@/auth';
import { notFound } from "next/navigation";
import KnowledgeBase from '@/components/KnowledgeBase';
const page = async() => {
    const session = await auth();
    if (!session) return notFound();
  
    return (session.user?.id &&    <div className="p-4">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                    <h1 className="text-2xl font-bold">Knowledge Base</h1>
                </div>
                <KnowledgeBase user_id={session.user?.id} /> 
            </div>);
  }

export default page
