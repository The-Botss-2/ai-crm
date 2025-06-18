import React from 'react';
import { KnowledgeBaseClient } from '@/components/KnowledgeBaseClient';
import { auth } from '@/auth';
import { notFound } from 'next/navigation';
import ProductPage from '@/components/ProductPage';
import TaskPageClient from '@/components/TaskPageClient';


export default async function Products({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) return notFound();

    return (
        <div className="">
            <TaskPageClient userID={session?.user?.id} />
        </div>
    );
}