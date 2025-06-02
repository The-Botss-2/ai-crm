import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { connectToDatabase } from "./lib/db";
import Profile from "./model/Profile";
export const runtime = 'nodejs'; 
export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/signin",
    },
    callbacks: {
        async signIn({ user, account }) {

            await connectToDatabase();
            if (account?.provider === 'google') {
                const existingUser = await Profile.findOne({ email: user.email });
                if (!existingUser) {
                    await Profile.create({
                        name: user.name,
                        email: user.email,
                        image: user.image,
                    });
                }
            }
            return true;
        },
        async jwt({ token, user, account, profile }) {
            return token;
        },

        async session({ session, user, token }) {
            await connectToDatabase();
            if (session.user.email) {
                const dbUser = await Profile.findOne({ email: session.user.email });
                if (dbUser) {
                    session.user.id = dbUser._id.toString();
                    session.user.name = dbUser.name;
                    session.user.image = dbUser.image;
                }
            }
            return session;
        },

        redirect() {
            return "/signin";
        },
    },
});
