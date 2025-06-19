import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Organization from "@/model/Organization";

// HomePage server-side logic
const HomePage = async () => {
  const session = await auth();
  
  if (!session) return notFound();

  // Fetch the organizations of the user
  await connectToDatabase();
  const organizations = await Organization.find({ userId: session?.user?.id });
  // If there are organizations, redirect to the team route
  if (organizations.length > 0) {
    // Assuming the first organization is the one you want to redirect to
    const teamId = organizations[0]._id;
    return redirect(`/teams`);
  } else {
    return redirect('/organization'); // Redirect to organization creation page if no organization found
  }
};

export default HomePage;
