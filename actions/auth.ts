'use server';

import { signIn } from '@/auth';

export async function authenticate(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return {
      status: 'error',
      error: {
        email: !email ? 'Email is required' : undefined,
        password: !password ? 'Password is required' : undefined,
      },
      message: 'Missing fields',
    };
  }

  try {
    // Notify client to show loading
    const result = await signIn('credentials', { email, password, redirect: false });

    if (result?.error) {
      return { status: 'error', message: result.error };
    }

    return { status: 'success' };
  } catch (error: any) {
    return { status: 'error', message: 'Unexpected error occurred' };
  }
}
