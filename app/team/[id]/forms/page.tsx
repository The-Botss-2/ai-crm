// app/forms/page.tsx
import { auth } from '@/auth';
import { notFound } from 'next/navigation';
import FormGrid from '@/components/FormGrid';

export default async function Page() {
  const session = await auth();
  if (!session?.user?.id) return notFound();
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4 border-b p-3 pb-4">
        <h1 className="text-2xl font-bold">Forms</h1>
      </div>
      <FormGrid />
    </div>
  );
}
