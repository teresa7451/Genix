import Link from 'next/link';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found | Genix',
  description: 'The page you are looking for does not exist.',
};

export const viewport: Viewport = {
  themeColor: '#050711'
};

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <div className="glass-dark p-8 rounded-xl backdrop-blur-md w-full max-w-lg">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
        <p className="mb-8 text-gray-300">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-800 hover:from-blue-500 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}