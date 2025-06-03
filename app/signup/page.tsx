import Link from 'next/link';
import SignupForm from '@/components/SignupForm';

const SignupPage = () => {
  return (
    <section className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md p-10 rounded-lg shadow-lg bg-white relative">
        <div className="mb-8 text-center">
          <Link href="/" className="text-3xl font-bold text-blue-600">
            AI-CRM
          </Link>
          <p className="text-sm text-gray-500 mt-2">
            Create your account to get started
          </p>
        </div>

        <SignupForm />

        <div className="absolute right-2 top-2">
          {/* Keep your decorative SVG here if needed, or replace with simpler design */}
          {/* Example: */}
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="opacity-20"
          >
            <circle
              cx="20"
              cy="20"
              r="20"
              fill="#3056D3"
            />
          </svg>
        </div>

        <div className="absolute bottom-2 left-2">
          {/* Another decorative SVG or leave empty */}
        </div>
      </div>
    </section>
  );
};

export default SignupPage;
