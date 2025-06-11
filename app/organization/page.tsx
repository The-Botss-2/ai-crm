import { Suspense } from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Organization from '@/components/Organization';

export default async function page() {
  const session = await auth();
  console.log(session, "sessionnotFound");
  
  if (!session?.user?.id) {
    redirect('/signin'); 
  }

  return (
    <div className="h-screen">
      <Suspense fallback={<div className="text-gray-500">Loading...</div>}>
       <Organization user_id={session.user.id} />
      </Suspense>
    </div>
  );
}
