// components/SidebarNav.tsx
'use client';
import Link from 'next/link';
import { useTeamRole } from '@/context/TeamRoleContext';
import {
    AiTwotoneAppstore,
    AiTwotoneCalendar,
    AiTwotoneBuild,
    AiTwotoneSetting,
    AiTwotoneMail
} from 'react-icons/ai';
import {
    PiUsersThreeDuotone,
    PiUsersDuotone,
    PiLinkSimpleDuotone,
} from 'react-icons/pi';

import { BsBookHalf } from "react-icons/bs";
import ElevenLabsWidget from './ElevenLabsConvAI';
import Image from 'next/image';
import { useCardConnection } from '@/context/CardConnectionContext';
import { FaWpforms } from 'react-icons/fa';
import {CiSettings} from 'react-icons/ci';
import {GiClassicalKnowledge} from 'react-icons/gi';
interface Props {
    teamId: string;
    pathname: string;
    userId: string | undefined;
    session: any
}

// Fetcher function for SWR

export default function SidebarNav({ teamId, pathname, userId,session }: Props) {
    const { role, loading, agent, teamName, logo } = useTeamRole();
    const { isCardConnected } = useCardConnection();
    console.log(isCardConnected, role, loading, agent, teamName, logo, 'isCardConnected');
    
    // if (loading) {
    //     return (
    //         <nav className="flex-1 overflow-y-auto py-4 px-2 animate-pulse">
    //             {Array.from({ length: 6 }).map((_, idx) => (
    //                 <div
    //                     key={idx}
    //                     className="h-10 rounded-md bg-gray-200 dark:bg-gray-700 mb-2"
    //                 />
    //             ))}
    //         </nav>
    //     );
    // }
const navigation = [
    {
      name: 'Dashboard',
      href: `/team/${teamId}/dashboard`,
      icon: <AiTwotoneAppstore size={22} />
    },
    {
      name: 'Leads',
      href: `/team/${teamId}/leads`,
      icon: <PiUsersThreeDuotone size={22} />
    },
    {
      name: 'Meetings',
      href: `/team/${teamId}/meetings`,
      icon: <AiTwotoneCalendar  size={22} />
    },
    {
      name: 'Team',
      href: `/team/${teamId}/team-details`,
      icon: <PiUsersDuotone size={22} />
    },
    {
      name: 'Tasks',
      href: `/team/${teamId}/tasks`,
      icon: <AiTwotoneBuild  size={22} />
    },
    {
      name: 'Integrations',
      href: `/team/${teamId}/integrations`,
      icon: <PiLinkSimpleDuotone size={22} />
    },
    {
      name: 'Forms',
      href: `/team/${teamId}/forms`,
      icon: <FaWpforms size={22} />
    },

  
 
  ];

    if (role === 'admin') {
        navigation.push(    {
      name: 'Knowledge Base',
      href: `/team/${teamId}/knowlege-base`,
      icon: <GiClassicalKnowledge size={22} />
    },);
    }


    if (isCardConnected) {
        navigation.push({
            name: 'Emails',
            href: `/team/${teamId}/emails`,
            icon: <AiTwotoneMail size={22} />,
        });
    }

    navigation.push({
        name: 'Settings',
        href: `/team/${teamId}/settings`,
        icon: <AiTwotoneSetting size={22} />,
    })
console.log(session,'"session"');

    return (
        <>
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">

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
                                    className={`flex items-center px-2 py-4 fs-1 rounded-md ${isActive
                                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                                        } transition-colors`}
                                >
                                    <div className="flex-shrink-0">{item.icon}</div>
                                    <span className="ml-3 text-sm">{item.name}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
                {agent && <ElevenLabsWidget agent_id={agent} />}
            </nav>
        </>
    );
}
