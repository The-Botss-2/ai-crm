'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useTeamRole } from '@/context/TeamRoleContext';
import { useCardConnection } from '@/context/CardConnectionContext';

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
import { RiProductHuntLine } from "react-icons/ri";
import { TbCategory } from "react-icons/tb";
import { FaProductHunt, FaWpforms } from 'react-icons/fa';
import { GiClassicalKnowledge } from 'react-icons/gi';
import { MdOutlineOutbound, MdOutlineTextSnippet } from 'react-icons/md';

import ElevenLabsWidget from './ElevenLabsConvAI';
import { Fa42Group } from 'react-icons/fa6';
import { IoAnalytics } from 'react-icons/io5';

interface Props {
    teamId: string;
    pathname: string;
    userId: string | undefined;
    session: any;
    isOpen: boolean;
}

export default function SidebarNav({ teamId, pathname, userId, session, isOpen }: Props) {
    const { role, access, agent, teamName, logo, teamAccess } = useTeamRole();
    const { isCardConnected } = useCardConnection();
    
    const groupedNavigation = [
        {
            title: 'Dashboard',
            items: [
                ...((role === 'admin' && teamAccess?.dashboard?.includes('Visible')) || access?.dashboard?.includes('read')
                    ? [{ name: 'Dashboard', href: `/team/${teamId}/dashboard`, icon: <AiTwotoneAppstore size={22} /> }]
                    : []),
                ...((role === 'admin' && teamAccess?.analytics?.includes('Visible')) || access?.analytics?.includes('read') ? [{ name: 'Analytics', href: `/team/${teamId}/Analytics`, icon: <IoAnalytics size={22} /> }] : []),
            ],

        },
        {
            title: 'Management',
            items: [
                ...((role === 'admin' && teamAccess?.leads?.includes('Visible')) || access?.leads?.includes('read') ? [{ name: 'Leads', href: `/team/${teamId}/leads`, icon: <PiUsersThreeDuotone size={22} /> }] : []),
                ...((role === 'admin' && teamAccess?.meetings?.includes('Visible')) || access?.meetings?.includes('read') ? [{ name: 'Meetings', href: `/team/${teamId}/meetings`, icon: <AiTwotoneCalendar size={22} /> }] : []), ,
                ...((role === 'admin' && teamAccess?.teams?.includes('Visible')) || access?.teams?.includes('read') ? [{ name: 'Team', href: `/team/${teamId}/team-details`, icon: <PiUsersDuotone size={22} /> }] : []),
                ...((role === 'admin' && teamAccess?.tasks?.includes('Visible')) || access?.tasks?.includes('read') ? [{ name: 'Tasks', href: `/team/${teamId}/tasks`, icon: <AiTwotoneBuild size={22} /> }] : []),
                ...((role === 'admin' && teamAccess?.categories?.includes('Visible')) || access?.categories?.includes('read') ? [{ name: 'Categories', href: `/team/${teamId}/category`, icon: <TbCategory size={22} /> }] : []),
                ...((role === 'admin' && teamAccess?.products?.includes('Visible')) || access?.products?.includes('read') ? [{ name: 'Products', href: `/team/${teamId}/product`, icon: <RiProductHuntLine size={22} /> }] : []),

            ],
        },
        {
            title: 'Campaigns',
            items: [
                ...((role === 'admin' && teamAccess?.campaigns?.includes('Visible')) || access?.campaigns?.includes('read') ? [{
                    name: 'Outbound Campaigns',
                    href: `/team/${teamId}/outbound-calls`,
                    icon: <MdOutlineOutbound size={22} />,
                }] : [])
            ],
        },
        {
            title: 'Integrations',
            items: [
                ...((role === 'admin' && teamAccess?.forms?.includes('Visible')) || access?.forms?.includes('read') ? [{ name: 'Forms', href: `/team/${teamId}/forms`, icon: <FaWpforms size={22} /> }] : []),
            ],
        },
        {
            title: 'AI',
            items:  [
                ...((role === 'admin' && teamAccess?.knowledge_base?.includes('Visible')) || access?.knowledge_base?.includes('read') ? [{ name: 'Knowledge Base', href: `/team/${teamId}/knowlege-base`, icon: <GiClassicalKnowledge size={22} /> }] : []),
                  
                ...((role === 'admin' && teamAccess?.widget_snippet?.includes('Visible')) || access?.widget_snippet?.includes('read') ? [{
                    name: "Widget Snippet",
                    href: `/team/${teamId}/widget-snippet`,
                    icon: <MdOutlineTextSnippet size={22} />
                }] : []),
            ] 
        },
        {
            title: 'Communication',
            items: isCardConnected ? [
                {
                    name: 'Emails',
                    href: `/team/${teamId}/emails`,
                    icon: <AiTwotoneMail size={22} />,
                },
            ] : [],
        },
        {
            title: 'Settings',
            items: [
                {
                    name: 'Settings',
                    href: `/team/${teamId}/settings`,
                    icon: <AiTwotoneSetting size={22} />,
                },
                { name: 'Organization Setting', href: `/organization-setting`, icon: <PiLinkSimpleDuotone size={22} /> }

            ],
        },
    ];

    return (
        <>
            {/* Logo / Team Header */}
            {/* <div className="flex items-center h-16 px-4 border-b border-gray-200">
                <Link href="/teams" className="flex items-center space-x-3 text-blue-600 hover:underline">
                    {logo && (
                        <Image
                            src={logo}
                            alt={teamName || 'User avatar'}
                            width={isOpen ? 45 : 35}
                            height={isOpen ? 45 : 35}
                            className="rounded-full object-cover"
                        />
                    )}
                    {isOpen && teamName && (
                        <span className="font-semibold mx-1" style={{fontSize: '25px'}}>{teamName || "..."}</span>
                    )}
                </Link>
            </div> */}

            {/* Menu Items */}
            <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
                <ul className="space-y-1 px-2">
                    {groupedNavigation.map((section) => {
                        if (!section.items.length) return null;
                        return (
                            <div key={section.title} className="mb-6">
                                {isOpen && (
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-1">
                                        {section.title}
                                    </h4>
                                )}
                                <ul className="space-y-1 px-1">
                                    {section.items.map((item: any) => {
                                        const isActive = pathname.startsWith(item.href);
                                        return (
                                            <li key={item?.name}>
                                                <Link
                                                    href={item?.href}
                                                    className={`group flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 relative ${isActive
                                                        ? 'bg-blue-100 text-blue-700 font-semibold shadow-inner'
                                                        : 'text-gray-700 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    <div
                                                        className="p-1 rounded-md bg-white shadow-md text-gray-600 flex items-center justify-center"
                                                        title={!isOpen ? item?.name : ''}
                                                    >
                                                        {item.icon}

                                                    </div>
                                                    {isOpen && (
                                                        <span className="ml-3 text-md">{item?.name}</span>
                                                    )}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        );
                    })}
                </ul>
                {agent && <ElevenLabsWidget agent_id={agent} />}
            </nav>
        </>
    );
}
