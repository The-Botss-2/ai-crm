'use client';

import React, { useEffect, useState } from 'react';
import FormRenderer from '@/components/FormRenderer';
import Loading from '@/components/Loading';
import { useParams } from 'next/navigation';



export default function Page() {
  const { id } = useParams()

  const [form, setForm] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setError('Form ID is required.');
      setLoading(false);
      return;
    }

    async function fetchForm() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        const res = await fetch(`${baseUrl}/api/form?id=${id}`);

        if (!res.ok) {
          throw new Error('Failed to fetch form');
        }

        const data = await res.json();
        setForm(data);
      } catch (err) {
        setError('Form not found or failed to load.');
      } finally {
        setLoading(false);
      }
    }

    fetchForm();
  }, [id]);

  if (loading) {
    return (
     <Loading />
    );
  }

  if (error || !form) {
    return (
      <section className="flex items-center justify-center min-h-screen">
        <p className="text-red-500 text-sm">{error || 'Form not found or failed to load.'}</p>
      </section>
    );
  }

  return (
      <FormRenderer form={form} />
  );
}
