'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ZoomCardSkeleton, ZoomCard } from './ZoomCard';
import { zoomFetcher } from '@/lib/zoomFetcher';


export default function ZoomIntegration({ userId }: { userId: string }) {
    const { data: userData, error, isLoading } = useSWR(`/zoom_user/${userId}`, zoomFetcher, {
        shouldRetryOnError: false,
    });


    const handleConnect = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_ZOOM_URL}/zoom/oauth/start?crm_user_id=${userId}`);
            window.open(res.data.auth_url, '_blank');
        } catch (err) {
            toast.error('Failed to connect with Zoom.');
            console.error(err);
        }
    };


    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <ZoomCardSkeleton />
            </div>
        );
    }

    if (error && error.response?.status !== 404) {
        toast.error('Error loading Zoom status.');
        return <div>Failed to load data.</div>;
    }

    const isNotConnected = error?.response?.status === 404;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <ZoomCard
                isConnected={!isNotConnected}
                zoomUserId={userData?.zoom_user_id}
                onConnect={handleConnect}
            />
        </div>
    );
}
