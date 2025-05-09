'use client';

import { signup } from '@/actions/auth';
import { useActionState } from 'react';
import toast from 'react-hot-toast';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupForm() {
    const [state, formAction] = useActionState(signup, null);
    const router = useRouter();

    useEffect(() => {
        if (state?.status === 'loading') {
            toast.loading('Signing up...', { id: 'signup' });
        } else if (state?.status === 'error') {
            toast.error(state.message || 'Signup failed.', { id: 'signup' });
        } else if (state?.status === 'success') {
            toast.success('Signup successful!', { id: 'signup' });
            router.push('/teams');
        }
    }, [state]);

    return (
        <form action={formAction}>
            <div className="mb-6">
                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    className="w-full rounded-md border border-stroke bg-transparent px-5 py-3 text-sm text-body-color outline-none focus:border-primary dark:border-dark-3 dark:text-white"
                    required
                />
                {state?.error?.name && (
                    <p className="text-red-500 text-sm mt-1">{state.error.name}</p>
                )}
            </div>
            <div className="mb-6">
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="w-full rounded-md border border-stroke bg-transparent px-5 py-3 text-sm text-body-color outline-none focus:border-primary dark:border-dark-3 dark:text-white"
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
                    className="w-full rounded-md border border-stroke bg-transparent px-5 py-3 text-sm text-body-color outline-none focus:border-primary dark:border-dark-3 dark:text-white"
                    required
                />
                {state?.error?.password && (
                    <p className="text-red-500 text-sm mt-1">{state.error.password}</p>
                )}
            </div>
            <div className="mb-10">
                <button
                    type="submit"
                    className="w-full cursor-pointer rounded-md bg-blue-800 text-blue-100 px-5 py-3 text-sm font-medium transition hover:bg-opacity-90 disabled:opacity-50"
                >
                    Sign Up
                </button>

                <div className="mt-5 text-xs flex gap-2 justify-center">
                    <span>Already have an account?</span>
                    <Link className="font-semibold" href="/signin">Sign In</Link>
                </div>
            </div>
        </form>
    );
}
