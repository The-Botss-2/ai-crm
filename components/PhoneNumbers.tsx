import React from 'react'
import { auth } from '@/auth';
import { notFound } from "next/navigation";
import axios from 'axios';
import toast from 'react-hot-toast';

interface PhoneNumber {
    phone_number: string;
    sid: string;
    in_use: boolean;
    used_by: string | null;
}

async function fetchPhoneNumbers(userId: string): Promise<PhoneNumber[]> {
    try {
        const response = await axios.get(`https://callingagent.thebotss.com/api/twilio/get-phone-numbers?crm_user_id=${userId}`,
            {
                headers: {
                    'accept': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching phone numbers:', error);
        throw new Error('Failed to fetch phone numbers');
    }
}

export default async function PhoneNumbers() {
    const session = await auth();
    if (!session?.user?.id) return notFound();

    let phoneNumbers: PhoneNumber[] = [];
    let error: string | null = null;

    try {
        phoneNumbers = await fetchPhoneNumbers(session.user.id);
    } catch (err) {
        error = err instanceof Error ? err.message : 'An unexpected error occurred';
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error Loading Phone Numbers</h3>
                            <p className="mt-1 text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold dark:text-white text-slate-900">Phone Numbers</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Manage your Twilio phone numbers for user ID: {session.user.id}
                </p>
            </div>

            {phoneNumbers.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No phone numbers</h3>
                    <p className="mt-1 text-sm text-gray-500">No phone numbers found for your account.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 shadow overflow-hidden sm:rounded-md">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 dark:bg-slate-900">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Phone Number
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        SID
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Used By
                                    </th>
                                </tr>
                            </thead>


                            <tbody className="bg-white divide-y divide-gray-200">
                                {phoneNumbers.map((phone, index) => (
                                    <tr key={phone.sid} className={index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50 dark:bg-slate-800'}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                                            {phone.phone_number}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                            {phone.sid}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${phone.in_use
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-green-100 text-green-800'
                                                }`}>
                                                {phone.in_use ? 'In Use' : 'Available'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {phone.used_by || (
                                                <span className="text-gray-400 italic">Not assigned</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-gray-50 dark:bg-slate-900 px-6 py-3 border-t border-gray-200">
                        <p className="text-sm text-gray-700">
                            Showing <span className="font-medium">{phoneNumbers.length}</span> phone number{phoneNumbers.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}