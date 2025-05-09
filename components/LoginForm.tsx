'use client';
import { authenticate } from '@/actions/auth';
import { useActionState } from 'react';
import toast from 'react-hot-toast';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginForm() {
    const [state, formAction] = useActionState(authenticate, null);
    const router = useRouter();

    useEffect(() => {
        if (state?.status === 'loading') {
            toast.loading('Signing in...', { id: 'login' });
        } else if (state?.status === 'error') {
            toast.error(state.message || 'Login failed.', { id: 'login' });
        } else if (state?.status === 'success') {
            toast.success('Login successful!', { id: 'login' });
            router.push('/teams');
        }
    }, [state]);

    return (
        <form action={formAction}>
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
                    className="w-full cursor-pointer rounded-md  bg-blue-800 text-blue-100 px-5 py-3 text-sm font-medium  transition hover:bg-opacity-90 disabled:opacity-50"
                >
                    Sign In
                </button>

                <div className='mt-5 text-xs flex gap-2 justify-center'>
                    <span>Don't have an account?</span>
                    <Link className='font-semibold' href={'/signup'}>SignUp </Link>
                </div>
            </div>


        </form>
    );
}
