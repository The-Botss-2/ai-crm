import { Suspense } from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Integration from '@/components/Integration';
import Loading from '@/components/Loading';

export default async function page() {
  const session = await auth();
  console.log(session, "sessionnotFound");

  if (!session?.user?.id) {
    redirect('/signin');
  }

  return (
    <div className="h-screen">
      <Suspense fallback={<div className="text-gray-500"><Loading /></div>}>
        <div className="p-4">
          <div className="flex justify-between items-center mb-4 p-3 pb-4 border-b border-gray-200">

          </div>
          <Integration userId={session.user.id} page="integrations" />
        </div>
      </Suspense>
    </div>
  );
}
