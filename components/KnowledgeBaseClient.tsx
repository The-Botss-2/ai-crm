'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTeamRole } from '@/context/TeamRoleContext';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { FileGrid } from './FileGrid';
import { KnowledgeBaseForm } from './KnowledgeBaseForm';
import { LoadingSkeleton } from './LoadingSkeleton';
import { AccessDenied } from './AccessDenied';
import { initializeKnowledgeBase, deleteFile, uploadAndUpdateKnowledgeBase, KnowledgeBaseData, FileData } from '@/utils/knowledge-base';
import toast from 'react-hot-toast';

interface KnowledgeBaseClientProps {
    teamId: string;
}

export function KnowledgeBaseClient({ teamId }: KnowledgeBaseClientProps) {
    const { role, loading } = useTeamRole();
    const [isInitializing, setIsInitializing] = useState(true);
    const [knowledgeBase, setKnowledgeBase] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, error, isLoading, mutate } = useSWR<KnowledgeBaseData>(
        role === 'admin' ? `api/knowledge-base?team_id=${teamId}` : null,
        fetcher,
        {
            revalidateOnFocus: false,
            onError: async (err: any) => {
                if (err?.status === 428) {
                    const initialized = await initializeKnowledgeBase(teamId, mutate);
                    setIsInitializing(!initialized);
                } else {
                    toast.error('Failed to load knowledge base.');
                }
            },
        }
    );

    useEffect(() => {
        if (data?.text) {
            setKnowledgeBase(data.text);
        }
        setIsInitializing(false);
    }, [data]);

    const handleDeleteFile = async (url: string) => await deleteFile(teamId, url, mutate);


    const handleSave = async () => {
        await uploadAndUpdateKnowledgeBase(teamId, file, knowledgeBase, Array.isArray(data?.file) ? data.file : [], mutate, fileInputRef);
        setFile(null);
    };

    if (error && error?.status !== 428) return <div className="text-center text-red-500">Error in Fetching KB...</div>;
    if (loading) return <LoadingSkeleton message="Checking Role" />;
    if (role !== 'admin') return <AccessDenied />;
    if (isLoading || isInitializing) return <LoadingSkeleton message={isInitializing ? 'Initializing Knowledge Base...' : 'Loading Knowledge Base...'} />;

    return (
        <div className="space-y-6  p-3">
            <FileGrid files={data?.file || []}data={data} onDeleteFile={handleDeleteFile} />
            <KnowledgeBaseForm
                knowledgeBase={knowledgeBase}
                onKnowledgeBaseChange={setKnowledgeBase}
                onFileChange={setFile}
                onSave={handleSave}
                fileInputRef={fileInputRef}
            />
        </div>
    );
}