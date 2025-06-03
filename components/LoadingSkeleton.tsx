import React from 'react';

interface LoadingSkeletonProps {
    message?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ message = 'Loading Knowledge Base...' }) => (
    <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, index) => (
                <div
                    key={index}
                    className="flex items-center justify-between relative bg-gray-200 dark:bg-gray-700 border rounded-2xl py-2 h-20"
                >
                    <div className="flex flex-col items-center gap-2 mx-auto">
                        <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded" />
                        <div className="w-24 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
                    </div>
                    <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full absolute top-2 right-2" />
                </div>
            ))}
        </div>
        <div className="space-y-4">
            <div className="w-full h-10 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="flex justify-end">
            <div className="w-24 h-10 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
            {message}
        </div>
    </div>
);