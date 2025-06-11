import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { connectToDatabase } from "./lib/db";
import Profile from "./model/Profile";

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // session maxAge (30 days in seconds)
        updateAge: 24 * 60 * 60, // how often the session is refreshed (every 24 hours)
        
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
        async jwt({ token}) {
            return token;
        },

        async session({ session}) {
            console.log("session123", session);
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

        // redirect() {
        //     return "/signin";
        // },
    },
});
