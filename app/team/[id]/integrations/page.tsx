// app/integrations/page.tsx
import { auth } from '@/auth';
import { notFound } from 'next/navigation';
import Integration from '@/components/Integration';

export default async function Page() {
  const session = await auth();
  if (!session?.user?.id) return notFound();

  return(  <div className="p-4"> <Integration userId={session.user.id} /></div>);
}
