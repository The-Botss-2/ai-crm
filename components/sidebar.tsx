import Link from 'next/link';
import { headers } from 'next/headers';
import { auth } from "@/auth";
import SignOutBtn from './SignOutBtn';
import { PiUsersThreeDuotone, PiUsersDuotone, PiLinkSimpleDuotone } from "react-icons/pi";
import { AiTwotoneSetting,AiTwotoneAppstore , AiTwotoneCalendar , AiTwotoneBuild   } from "react-icons/ai";
import {CiSettings} from "react-icons/ci";
import {GiClassicalKnowledge} from "react-icons/gi";
import { FaWpforms } from 'react-icons/fa';
import Image from 'next/image';

export default async function Sidebar({ team_id }: { team_id: string }) {
  const pathname = (await headers()).get('x-pathname') || '';
  const session = await auth();
  const navigation = [
    {
      name: 'Dashboard',
      href: `/team/${team_id}/dashboard`,
      icon: <AiTwotoneAppstore size={22} />
    },
    {
      name: 'Leads',
      href: `/team/${team_id}/leads`,
      icon: <PiUsersThreeDuotone size={22} />
    },
    {
      name: 'Meetings',
      href: `/team/${team_id}/meetings`,
      icon: <AiTwotoneCalendar  size={22} />
    },
    {
      name: 'Team',
      href: `/team/${team_id}/team-details`,
      icon: <PiUsersDuotone size={22} />
    },
    {
      name: 'Tasks',
      href: `/team/${team_id}/tasks`,
      icon: <AiTwotoneBuild  size={22} />
    },
    {
      name: 'Integrations',
      href: `/team/${team_id}/integrations`,
      icon: <PiLinkSimpleDuotone size={22} />
    },
    {
      name: 'Forms',
      href: `/team/${team_id}/forms`,
      icon: <FaWpforms size={22} />
    },
    {
      name: 'Knowledge Base',
      href: `/team/${team_id}/knowlege-base`,
      icon: <GiClassicalKnowledge size={22} />
    },
    {
      name: 'Settings',
      href: `/team/${team_id}/settings`,
      icon: <CiSettings size={22} />
    },
 
  ];
console.log(session?.user , "session?.user?.image ");

  return (
    <div className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-gray-200 shadow-sm">
      
<div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
  <Link href="/dashboard" className="flex items-center space-x-3 text-blue-600 hover:underline">
    {session?.user?.image && (
      <Image
        src={session.user.image}
        alt={session.user.name || 'User avatar'}
        width={40}
        height={40}
        className="rounded-full object-cover"
      />
    )}
    <span className="font-semibold text-lg">{session?.user?.name}</span>
  </Link>
</div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center px-2 py-5 fs-1 rounded-md ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  } transition-colors`}
                >
                  <div className="flex-shrink-0">{item.icon}</div>
                  <span className="ml-3 text-sm">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

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
