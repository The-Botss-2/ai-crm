import React from 'react'
import { auth } from '@/auth';
import { notFound } from "next/navigation";
import OutBoundCalls from '@/components/OutBoundCalls';
const page = async() => {
    const session = await auth();
    console.log(session, "sessionnotFound");
    
    if (!session) return notFound();
  
    return (session.user?.id &&    <div className="p-4">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                </div>
                <OutBoundCalls user_id={session.user?.id} /> 
            </div>);
  }

export default page
