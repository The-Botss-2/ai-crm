import { auth, signOut } from "@/auth";
import { notFound, redirect } from "next/navigation";

const HomePage = async () => {
  const session = await auth();
  if (!session) return notFound();
  if (session) return redirect('/teams');
};
export default HomePage;