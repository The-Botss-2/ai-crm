'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupForm() {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        toast.loading('Signing up...', { id: 'signup' });

        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        setLoading(false);

        if (!res.ok) {
            toast.error(data.error || 'Signup failed', { id: 'signup' });

            if (data.error?.includes('User already exists')) {
                setErrors({ email: data.error });
            }
            return;
        }

        toast.success('Signup successful!', { id: 'signup' });
        router.push('/teams');
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-6">
                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    className="w-full rounded-md border border-stroke bg-transparent px-5 py-3 text-base text-body-color outline-none focus:border-primary dark:border-dark-3 dark:text-white"
                    required
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            <div className="mb-6">
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="w-full rounded-md border border-stroke bg-transparent px-5 py-3 text-base text-body-color outline-none focus:border-primary dark:border-dark-3 dark:text-white"
                    required
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            <div className="mb-6">
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="w-full rounded-md border border-stroke bg-transparent px-5 py-3 text-base text-body-color outline-none focus:border-primary dark:border-dark-3 dark:text-white"
                    required
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <div className="mb-2">
                <button
                    type="submit"
                    className="w-full flex justify-center items-center gap-2 rounded-md border border-primary bg-primary px-5 py-3 text-base font-medium text-white transition hover:bg-opacity-90 disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                />
                            </svg>
                            Signing up...
                        </>
                    ) : (
                        'Sign Up'
                    )}
                </button>
            </div>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Already have an account?{' '}
                <Link href="/signin" className="text-primary hover:underline">
                    Sign in
                </Link>
            </p>
        </form>
    );
}
