import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Team from "@/model/Team";
import Profile from "@/model/Profile"; 

export async function GET(req: NextRequest) {
  await connectToDatabase();

  const email = req.nextUrl.searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Email query parameter is required" }, { status: 400 });
  }

  const user = await Profile.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: "No user found with that email" }, { status: 404 });
  }

  const teams = await Team.find({ createdBy: user._id });

  return NextResponse.json({ teams }, { status: 200 });
}
