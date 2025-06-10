'use client';

import { useState, useEffect } from 'react';
import { IoMdMenu } from 'react-icons/io';
import SignOutBtn from './SignOutBtn';
import SidebarNav from './SidebarNav';
import Link from 'next/link';
import { useTeamRole } from '@/context/TeamRoleContext';
interface Props {
  team_id: string;
  pathname: string;
  session: any,
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}
export default function Sidebar({ team_id, pathname ,session, isOpen, setIsOpen}: Props) {
    const { teamName} = useTeamRole();


  // Persist sidebar state in localStorage (optional)
  useEffect(() => {
    const storedState = localStorage.getItem('sidebar-open');
    if (storedState !== null) {
      setIsOpen(storedState === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebar-open', String(isOpen));
  }, [isOpen]);

  return (
    <div className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
      
      {/* Top Bar */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-blue-600">
          <IoMdMenu size={24} />
        </button>
        {isOpen && <span className=" font-bold text-blue-600" style={{fontSize: '22px'}}>{teamName ? teamName : '...'}</span>}
      </div>

      {/* Sidebar Navigation */}
      <SidebarNav 
        teamId={team_id} 
        pathname={pathname} 
        userId={session?.user?.id} 
        session={session} 
        isOpen={isOpen}
      />

      {/* Footer */}
      <div className="flex items-center p-4 border-t border-gray-200">
        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white"> {session?.user?.name.charAt(0).toUpperCase()}</div>
        {isOpen && (
          <div className="ml-3 flex w-full items-center justify-between min-w-0">
            <Link href={`/team/${team_id}/settings`} className="text-lg font-large text-gray-900 truncate">
              {session?.user?.name}
            </Link>
            <SignOutBtn />
          </div>
        )}
      </div>
    </div>
  );
}
