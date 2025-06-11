import TeamList from '@/components/TeamList';
import { Suspense } from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { connectToDatabase } from '@/lib/db';
import Organization from '@/model/Organization';

export default async function TeamsPage({params}:{params:Promise<{id:string}>}) {
  const {id} = await params
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/signin'); 
  }

  // Fetch the organizations of the user
  await connectToDatabase();
  const organizations = await Organization.find({ userId: session?.user?.id });
  // If there are organizations, redirect to the team route
  if (!organizations.length) {
    return redirect('/organization'); 
  } else {
    
  return (
    <div className="h-screen">
      <Navbar id={session.user.id} />
      <Suspense fallback={<div className="text-gray-500">Loading teams...</div>}>
        <TeamList id={id} userId={session.user.id} organizations={organizations}/>
      </Suspense>
    </div>
  );
}
}
