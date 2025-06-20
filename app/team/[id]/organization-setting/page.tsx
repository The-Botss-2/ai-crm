
import { auth } from '@/auth';
import { notFound } from "next/navigation";
import OrganizationSettingsPage from '@/components/OrganizationSettingsPage';

export default async function page({params}:{params:Promise<{id:string}>}) {
   const session = await auth();
  if (!session) return notFound();

  const { id } = await params;

  return (<OrganizationSettingsPage  user_id={session.user?.id} teamId={id} />);
}