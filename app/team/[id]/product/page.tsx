import React from 'react';
import { KnowledgeBaseClient } from '@/components/KnowledgeBaseClient';
import { auth } from '@/auth';
import { notFound } from 'next/navigation';
import ProductPage from '@/components/ProductPage';


export default async function Products({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) return notFound();

    return (
        <div className="p-4">
            <ProductPage teamId={id} />
        </div>
    );
}