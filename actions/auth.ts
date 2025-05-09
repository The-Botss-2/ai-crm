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


export async function signup(prevState: any, formData: FormData) {
  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');

  console.log("GETTING DATA", name, email, password);

  const errors: Record<string, string> = {};
  if (!name) errors.name = 'Name is required';
  if (!email) errors.email = 'Email is required';
  if (!password) errors.password = 'Password is required';

  if (Object.keys(errors).length > 0) {
    return {
      status: 'error',
      message: 'Missing fields',
      error: errors,
    };
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        status: 'error',
        message: data.message || 'Signup failed.',
        error: data.errors || {},
      };
    }

    return { status: 'success' };
  }
  catch (error) {

    console.log(error)
    return {
      status: 'error',
      message: 'An unexpected error occurred.',
    };
  }
}
