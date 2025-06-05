import Sidebar from '@/components/sidebar';
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { TeamRoleProvider } from '@/context/TeamRoleContext';
import BotWidget from '@/components/BotWidget';
import { CardConnectionProvider } from '@/context/CardConnectionContext';
import VoiceCallWidget from '@/components/VoiceCallWidget';
import { headers } from 'next/headers';

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
    return (session.user?.id && (
        <TeamRoleProvider teamId={id} userId={session.user.id}>
            <CardConnectionProvider>
                <div className="flex min-h-screen ">
                    <Sidebar team_id={id} pathname={pathname}  session={session}/>
                    <div className="flex-1 pl-16 lg:pl-64 transition-all duration-300">
                        <main>
                            {children}
                        </main>
                    </div>
                    {/* <VoiceCallWidget /> */}
                </div>
            </CardConnectionProvider>
        </TeamRoleProvider>)
    );
}