
import LeadsPage from '@/components/LeadsPageClient';
import { auth } from '@/auth';
import { notFound } from "next/navigation";

export default async function Leads() {
   const session = await auth();
  if (!session) return notFound();

  return (<LeadsPage  user_id={session.user?.id} />);
}