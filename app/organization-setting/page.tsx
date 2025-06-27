
import { auth } from '@/auth';
import { notFound } from "next/navigation";
import OrganizationSettingsPage from '@/components/OrganizationSettingsPage';

export default async function page() {
   const session = await auth();
  if (!session) return notFound();


  return (<OrganizationSettingsPage  user_id={session.user?.id}  />);
}