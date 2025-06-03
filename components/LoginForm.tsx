'use client';

import { authenticate } from '@/actions/auth';
import { useActionState } from 'react';
import toast from 'react-hot-toast';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(authenticate, null);
  const router = useRouter();

  useEffect(() => {
    if (isPending) {
      toast.loading('Signing in...', { id: 'login' });
    } else if (state?.status === 'error') {
      toast.error(state.message || 'Login failed.', { id: 'login' });
    } else if (state?.status === 'success') {
      toast.success('Login successful!', { id: 'login' });
      router.push('/teams');
    }
  }, [state,isPending]);


  return (
    <form action={formAction}>
      <div className="space-y-4">
        <div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            className={`w-full rounded-md border px-4 py-2 text-sm focus:outline-none ${
              state?.error?.email ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
            }`}
            required
            disabled={isPending}
          />
          {state?.error?.email && (
            <p className="text-red-500 text-sm mt-1">{state.error.email}</p>
          )}
        </div>
        <div>
          <input
            type="password"
            name="password"
            placeholder="Password"
            className={`w-full rounded-md border px-4 py-2 text-sm focus:outline-none ${
              state?.error?.password ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
            }`}
            required
            disabled={isPending}
          />
          {state?.error?.password && (
            <p className="text-red-500 text-sm mt-1">{state.error.password}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isPending}
          className={`w-full rounded-md px-4 py-2 text-sm font-medium text-white transition ${
            isPending ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isPending ? 'Signing in...' : 'Sign In'}
        </button>
      </div>
    </form>
  );
}
