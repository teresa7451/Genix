import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import AuthProvider from '../components/AuthProvider';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Genix - AI Image Forge",
  description: "Generate stunning images with Genix Vision AI",
  icons: {
    icon: '/genix.png',
    apple: '/genix.png',
    shortcut: '/genix.png'
  },
  manifest: '/manifest.json'
};

export const viewport: Viewport = {
  themeColor: '#050711'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} antialiased min-h-screen bg-[#050711] bg-gradient-to-br from-[#050711] via-[#0a1025] to-[#081730] text-white flex flex-col`}
      >
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#1f1f1f',
              color: '#fff',
              borderRadius: '10px',
              border: '1px solid #333',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#0c0c0c',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#0c0c0c',
              },
            },
          }}
        />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
