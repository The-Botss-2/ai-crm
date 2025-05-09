import { auth } from '@/auth';
import { notFound } from 'next/navigation';
import ZoomIntegration from '@/components/ZoomIntegration';

export default async function Page() {
    const session = await auth();
    if (!session?.user?.id) return notFound();

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                <h1 className="text-2xl font-bold">Integrations</h1>
            </div>
            <ZoomIntegration userId={session.user.id} />
        </div>
    );
}
