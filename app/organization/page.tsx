import { Suspense } from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { connectToDatabase } from '@/lib/db';
import Organization from "@/model/Organization";

export default async function page() {
  const session = await auth();
  console.log(session, "sessionnotFound");
  
  if (!session?.user?.id) {
    redirect('/signin'); 
  }
 // Fetch the organizations of the user
  await connectToDatabase();
  const organizations = await Organization.find({ userId: session?.user?.id });
    console.log(organizations,'organizationsorganizations');
    
  // If there are organizations, redirect to the team route
  if (organizations?.length > 0) {
    const teamId = organizations[0]?._id;
    return redirect(`/teams`);
  } 
  return (
    <div className="h-screen">
      <Suspense fallback={<div className="text-gray-500">Loading...</div>}>
       <Organization user_id={session.user.id} />
      </Suspense>
    </div>
  );
}
