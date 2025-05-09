import TeamList from '@/components/TeamList';
import { Suspense } from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default async function TeamsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/signin'); 
  }

  return (
    <div className="h-screen">
      <Navbar id={session.user.id} />
      <Suspense fallback={<div className="text-gray-500">Loading teams...</div>}>
        <TeamList id={session.user.id} />
      </Suspense>
    </div>
  );
}
