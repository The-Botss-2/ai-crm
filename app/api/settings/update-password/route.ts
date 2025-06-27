import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/db';
import Credentials from '@/model/Credentials'; // Assuming Credentials stores password
import { auth } from '@/auth';
import Profile from '@/model/Profile';

export async function PATCH(req: NextRequest) {
  try {
      await connectToDatabase();
      const session = await auth();
      if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // Step 1: Extract the data (email, currentPassword, newPassword) from the request body
    const { currentPassword, newPassword } = await req.json();

    const profile = await Profile.findOne({ _id: session?.user?.id });
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    const email = profile.email;
    // Step 2: Ensure the new password meets your security requirements (e.g., length, complexity)
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }
    // Step 4: Find the user in the database by email
    let user = await Credentials.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Step 5: Compare the provided current password with the stored hashed password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid current password' }, { status: 401 });
    }

    // Step 6: Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12); // 12 is the salt rounds

    // Step 7: Update the password in the database
    user.password = hashedPassword;
    await user.save();

    // Step 8: Return a success response
    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
