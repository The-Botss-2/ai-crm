import TeamList from '@/components/TeamList';
import { Suspense } from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { connectToDatabase } from '@/lib/db';
import Organization from '@/model/Organization';
import Loading from '@/components/Loading';

export default async function TeamsPage({params}:{params:Promise<{id:string}>}) {
  const {id} = await params
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/signin'); 
  }

  // Fetch the organizations of the user
  await connectToDatabase();
  const organizations = await Organization.find({ userId: session?.user?.id });
  console.log(organizations,'organizationsorganizations');
  
  // If there are organizations, redirect to the team route
  if (organizations?.length === 0) {
    return redirect('/organization'); 
  } else {
    
  return (
    <div className="h-screen">
      <Navbar id={session.user.id} />
      <Suspense fallback={<Loading />}>
        <TeamList id={id} userId={session.user.id}/>
      </Suspense>
    </div>
  );
}
}
