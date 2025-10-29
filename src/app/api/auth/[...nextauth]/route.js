import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "../../../../lib/DataBase/connectDB";
import User from "../../../../models/User";
import bcrypt from "bcryptjs";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        await connectDB();

        // Find user by email
        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          throw new Error("No user found with this email");
        }

        if (user.isblocked) {
          throw new Error("Your account has been blocked");
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        // Return user object for NextAuth session
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          phone: user.phone,
          userImage: user.userImage,
        };
      },
    }),
  ],
  callbacks: {
    // 🔑 Handle Google sign-in and sync with your DB
    async jwt({ token, user, account, profile }) {
      // First sign-in (credentials or Google)
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.phone = user.phone;
        token.userImage = user.userImage;
        token.provider = account?.provider || "credentials";
      }

      // Handle subsequent Google logins (no `user` object)
      if (account?.provider === "google" && profile) {
        await connectDB();

        let dbUser = await User.findOne({ email: profile.email });

        // 🔒 If user exists and is blocked → should not happen here, but safe
        if (dbUser?.isblocked) {
          // Unfortunately, we can't throw here — but we'll handle in session
          token.isBlocked = true;
        }

        // Create new user if doesn't exist
        if (!dbUser) {
          dbUser = await User.create({
            name: profile.name,
            email: profile.email,
            userImage: profile.picture,
            password: "", // not used for OAuth
            phone: "", // Google doesn't provide phone by default
            isblocked: false,
          });
        }

        token.id = dbUser._id.toString();
        token.email = dbUser.email;
        token.name = dbUser.name;
        token.userImage = dbUser.userImage;
        token.phone = dbUser.phone || "";
        token.provider = "google";
      }

      return token;
    },

    async session({ session, token }) {
      // 🔒 Block access if user is blocked (for Google users too)
      if (token.isBlocked) {
        // This will cause session to be invalid
        return null;
      }

      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.phone = token.phone;
        session.user.userImage = token.userImage;
        session.user.provider = token.provider;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
export const runtime = "nodejs";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
