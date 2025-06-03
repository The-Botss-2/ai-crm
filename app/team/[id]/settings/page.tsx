import { auth } from '@/auth';
import { notFound } from "next/navigation";
import SettingsPage from '@/components/SettingsPage';

export default async function Meetings() {
  const session = await auth();
  if (!session) return notFound();

  return (session.user?.id && <div className="p-4">
    <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold">Settings</h1>
    </div>
    <SettingsPage user_id={session.user?.id} />
</div>);
}