import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { signOut, getAuth } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { LogOut, CreditCard, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthProvider';

export default function Header() {
    const { user, loading, signOutUser, signInUser, remainingGenerations } = useAuth();
    const [showPurchaseOptions, setShowPurchaseOptions] = useState(false);

    const handleSignOut = async () => {
        try {
            toast.success('Signing out...');
            await signOutUser();
        } catch (error) {
            console.error('Error signing out:', error);
            toast.error('Failed to sign out, please try again');
        }
    };

    const handlePurchaseTokens = () => {
        // Redirect to Four.meme
        window.open('https://four.meme/', '_blank');
        toast.success('Redirecting to Four.meme to get Genix tokens');
        setShowPurchaseOptions(false);
    };

    return (
        <header className="backdrop-blur-md bg-black/30 border-b border-[#4cc9ff]/20 fixed w-full z-10">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="relative w-9 h-9 overflow-hidden rounded-xl group-hover:scale-105 transition-transform duration-300">
                        <Image
                            src="/genix.png"
                            alt="Logo"
                            width={36}
                            height={36}
                            className="object-contain pulse-glow"
                        />
                    </div>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#4cc9ff] to-[#3d85c6] neon-text">
                        GENIX
                    </h1>
                </Link>

                <div className="flex items-center gap-3">
                    {loading ? (
                        <div className="h-10 w-10 rounded-full bg-[#0a1025] border border-[#4cc9ff]/30 animate-pulse"></div>
                    ) : user ? (
                        <>
                            {/* Generation Counter */}
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#091128]/70 border border-[#4cc9ff]/20">
                                <Zap size={14} className="text-[#4cc9ff]" />
                                <span className="text-xs text-[#a4c9e8]">
                                    <span className="text-[#4cc9ff] font-medium">{remainingGenerations}</span> / 5 free
                                </span>
                            </div>

                            {/* Buy Tokens Button */}
                            <a
                                href="https://four.meme/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] hover:from-[#1e40af] hover:to-[#2146c7] text-white px-3 py-1.5 rounded-full text-xs transition-all border border-[#4cc9ff]/30 hover:shadow-[0_0_10px_rgba(76,201,255,0.15)]"
                            >
                                <CreditCard size={14} />
                                <span>Get Tokens</span>
                            </a>

                            {/* User Profile and Sign Out */}
                            <div className="flex items-center gap-3">
                                {user.photoURL && (
                                    <div className="rounded-full border border-[#4cc9ff]/30 p-[2px] bg-gradient-to-r from-[#4cc9ff]/30 to-[#3d85c6]/30">
                                        <Image
                                            src={user.photoURL}
                                            alt={user.displayName || 'User'}
                                            width={32}
                                            height={32}
                                            className="rounded-full"
                                        />
                                    </div>
                                )}
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center gap-2 text-sm text-[#4cc9ff]/80 hover:text-[#4cc9ff] bg-[#091128]/70 px-3 py-1.5 rounded-full border border-[#4cc9ff]/20 hover:border-[#4cc9ff]/40 transition-all cursor-pointer"
                                    type="button"
                                >
                                    <LogOut size={16} />
                                    <span className="hidden sm:inline">Sign Out</span>
                                </button>
                            </div>
                        </>
                    ) : (
                        <button
                            onClick={signInUser}
                            className="flex items-center gap-2 bg-[#091128] hover:bg-[#0c1940] text-[#4cc9ff] px-4 py-2 rounded-full text-sm transition-all border border-[#4cc9ff]/30 hover:border-[#4cc9ff]/60 hover:shadow-[0_0_10px_rgba(76,201,255,0.15)]"
                            aria-label="Sign in with X"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" fill="currentColor" />
                            </svg>
                            <span>Sign in with X</span>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
} 