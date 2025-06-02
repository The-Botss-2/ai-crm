'use client';

import { authenticate } from '@/actions/auth';
import { useActionState } from 'react';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginForm() {
    const [mounted, setMounted] = useState(false);
    const [state, formAction] = useActionState(authenticate, null);
    const router = useRouter();

    // Ensure hydration-safe rendering
    useEffect(() => {
        setMounted(true);
    }, []);

    // Toast notifications
    useEffect(() => {
        if (!state) return;

        if (state?.status === 'loading') {
            toast.loading('Signing in...', { id: 'login' });
        } else if (state?.status === 'error') {
            toast.error(state.message || 'Login failed.', { id: 'login' });
        } else if (state?.status === 'success') {
            toast.success('Login successful!', { id: 'login' });
            router.push('/teams');
        }
    }, [state]);

    if (!mounted) return null; // Prevent hydration mismatch

    return (
        <form action={formAction}>
            <div className="mb-6">
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="w-full rounded-md border border-stroke bg-transparent px-5 py-3 text-base text-body-color outline-none focus:border-primary dark:border-dark-3 dark:text-white"
                    required
                />
                {state?.error?.email && (
                    <p className="text-red-500 text-sm mt-1">{state.error.email}</p>
                )}
            </div>
            <div className="mb-6">
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="w-full rounded-md border border-stroke bg-transparent px-5 py-3 text-base text-body-color outline-none focus:border-primary dark:border-dark-3 dark:text-white"
                    required
                />
                {state?.error?.password && (
                    <p className="text-red-500 text-sm mt-1">{state.error.password}</p>
                )}
            </div>

            <div className="mb-2">
                <button
                    type="submit"
                    className="w-full flex justify-center items-center gap-2 cursor-pointer rounded-md border border-primary bg-primary px-5 py-3 text-base font-medium text-white transition hover:bg-opacity-90 disabled:opacity-50"
                    disabled={state?.status === 'loading'}
                >
                    {state?.status === 'loading' ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                />
                            </svg>
                            Signing in...
                        </>
                    ) : (
                        'Sign In'
                    )}
                </button>
            </div>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-primary hover:underline">
                    Sign up
                </Link>
            </p>
        </form>
    );
}
