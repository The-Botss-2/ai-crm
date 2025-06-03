// app/forms/[id]/page.tsx
import { axiosInstance } from '@/lib/fetcher';
import FormRenderer from '@/components/FormRenderer';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const res = await axiosInstance.get(`/api/form?id=${id}`);
    const form = res.data;

    return (
      <section className="flex justify-center py-10 px-4 h-screen bg-gray-50 dark:bg-slate-950">
        <FormRenderer form={form} />
      </section>
    );
  }


  catch (err) {
    return (
      <section className="flex items-center justify-center min-h-screen">
        <p className="text-red-500 text-sm">Form not found or failed to load.</p>
      </section>
    );
  }
}
