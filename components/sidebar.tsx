// components/Sidebar.tsx
import { headers } from 'next/headers';
import { auth } from "@/auth";
import SignOutBtn from './SignOutBtn';
import SidebarNav from './SidebarNav';

export default async function Sidebar({ team_id }: { team_id: string }) {
  const pathname = (await headers()).get('x-pathname') || '';
  const session = await auth();

  return (
    <div className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-gray-200 shadow-sm">
      <SidebarNav 
        teamId={team_id} 
        pathname={pathname} 
        userId={session?.user?.id} 
        session={session} 
      />

      <div className="flex items-center p-4 border-t border-gray-200">
        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">U</div>
        <div className="ml-3 flex w-full items-center justify-between min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {session?.user?.name}
          </p>
          <SignOutBtn />
        </div>
      </div>
    </div>
  );
}
