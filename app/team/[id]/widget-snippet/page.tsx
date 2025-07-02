

import { auth } from '@/auth';
import WidgetSnippetPage from '@/components/WidgetSnippetPage';
import { notFound } from "next/navigation";

export default async function page() {
   const session = await auth();
  if (!session) return notFound();

  return (<WidgetSnippetPage user_id={session.user?.id} />);
}