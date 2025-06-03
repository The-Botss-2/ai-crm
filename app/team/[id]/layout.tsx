import Sidebar from '@/components/sidebar';
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { TeamRoleProvider } from '@/context/TeamRoleContext';
import BotWidget from '@/components/BotWidget';

interface LayoutProps {
    children: React.ReactNode;
    params: {
        id: string;
    };
}

export default async function DashboardLayout({ children, params }: LayoutProps) {
    const session = await auth();

    if (!session) return notFound();
    const {id} = await params
    return (
        <div className="flex min-h-screen ">

            <Sidebar team_id={id} />
            <div className="flex-1 pl-16 lg:pl-64 transition-all duration-300">
                <main className="py-6">
                    {session.user?.id && <> (<TeamRoleProvider teamId={id} userId={session.user.id}>
                            {children}
                        </TeamRoleProvider><BotWidget user_id={session?.user?.id} team_id={id} />)</>}
                        
                </main>
            </div>
        </div>
    );
}