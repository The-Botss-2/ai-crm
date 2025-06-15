import React from 'react';
import { auth } from '@/auth';
import { notFound } from 'next/navigation';
import CategoryPage from '@/components/CategoryPage';


export default async function Categories({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) return notFound();

    return (
        <div className="p-4">
            <CategoryPage teamId={id} />
        </div>
    );
}