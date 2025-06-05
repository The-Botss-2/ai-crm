import EmailClient from '@/components/EmailClient';
import { auth } from '@/auth';
import { notFound } from 'next/navigation';

export default async function Page() {
  const session = await auth();
  if (!session?.user?.id) return notFound();
  return <div className='p-3'><EmailClient userid={session.user.id} /></div>;
}