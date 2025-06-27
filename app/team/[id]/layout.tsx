import Sidebar from '@/components/sidebar';
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { TeamRoleProvider } from '@/context/TeamRoleContext';
import { CardConnectionProvider } from '@/context/CardConnectionContext';
import { headers } from 'next/headers';
import Main from './Main';

interface LayoutProps {
    children: React.ReactNode;
    params: Promise<{
        id: string;
    }>;
}


export default async function DashboardLayout({ children, params }: LayoutProps) {
    const session = await auth();
    if (!session) return notFound();
 const pathname = (await headers()).get('x-pathname') || '';
    const { id } = await params;
    console.log(session,id, 'sessionsessionsessionsession');
    
    return (session.user?.id && (
        <TeamRoleProvider teamId={id} userId={session.user.id}>
            <CardConnectionProvider>
                <div className="flex min-h-screen ">
                    <Main id={id} pathname={pathname} session={session} children={children} />
                    {/* <VoiceCallWidget /> */}
                </div>
            </CardConnectionProvider>
        </TeamRoleProvider>)
    );
}