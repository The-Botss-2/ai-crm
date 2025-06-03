import { signIn } from "@/auth";
import Link from "next/link";
import LoginForm from "@/components/LoginForm";
import { FcGoogle } from "react-icons/fc";

const LoginPage = () => {
  return (
    <section className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md p-8 rounded-lg shadow-lg bg-white relative">
        <div className="mb-8 text-center">
          <Link href="/" className="text-3xl font-bold text-blue-600">
            AI-CRM
          </Link>
          <p className="text-sm text-gray-500 mt-2">Welcome back! Please log in.</p>
        </div>

        <LoginForm />

        <div className="relative text-center my-6">
          <span className="text-sm text-gray-400 bg-white px-4">OR</span>
          <div className="absolute inset-0 flex items-center">
            <div className="border-t w-full border-gray-200" />
          </div>
        </div>

        <form
          action={async () => {
            "use server";
            await signIn("google");
          }}
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-700 font-medium px-4 py-2 rounded-md border border-blue-100 hover:bg-blue-100 transition"
          >
            <FcGoogle />
            <span>Login with Google</span>
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-gray-500">
          Don't have an account?{" "}
          <Link href="/signup" className="text-blue-600 font-medium hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </section>
  );
};

export default LoginPage;
