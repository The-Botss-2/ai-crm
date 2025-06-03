'use client';

import axios from 'axios';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function SignupForm() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: undefined })); // clear error on change
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    const toastId = toast.loading('Signing up...');

    try {
      const response = await axios.post('/api/auth/signup', formData);

      toast.success('Signup successful!', { id: toastId });
      router.push('/teams');
    } catch (error: any) {
      toast.dismiss(toastId);
      if (axios.isAxiosError(error) && error.response) {
        const data = error.response.data;

        // Handle general error message
        if (data.error) {
          toast.error(data.error);
        }

        // If your API returns validation errors per field, show them
        if (data.errors) {
          setErrors(data.errors);
        }
      } else {
        toast.error('Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-5">
        <div>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full rounded-md border px-4 py-3 text-sm focus:outline-none ${
              errors.name ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
            }`}
            required
            disabled={loading}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full rounded-md border px-4 py-3 text-sm focus:outline-none ${
              errors.email ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
            }`}
            required
            disabled={loading}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full rounded-md border px-4 py-3 text-sm focus:outline-none ${
              errors.password ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
            }`}
            required
            disabled={loading}
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full rounded-md px-4 py-3 text-sm font-semibold text-white transition ${
            loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <a href="/signin" className="text-blue-600 font-semibold hover:underline">
          Sign In
        </a>
      </p>
    </form>
  );
}
