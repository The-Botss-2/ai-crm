import React from 'react';
import { KnowledgeBaseClient } from '@/components/KnowledgeBaseClient';
import { auth } from '@/auth';
import { notFound } from 'next/navigation';


export default async function KnowledgeBasePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) return notFound();

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                <h1 className="text-2xl font-bold">Knowledge Base</h1>
            </div>

            <KnowledgeBaseClient teamId={id} />
        </div>
    );
}