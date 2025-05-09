import { auth } from '@/auth';
import { notFound } from "next/navigation";
import MeetingsPage from '@/components/Meetingspage';

export default async function Meetings() {
  const session = await auth();
  if (!session) return notFound();

  return (session.user?.id && <MeetingsPage user_id={session.user?.id} />);
}