import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
    return (
        <footer className="border-t border-[#4cc9ff]/20 backdrop-blur-md bg-black/30 py-4 px-4 mt-auto">
            <div className="container mx-auto">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-x-4">
                        <div className="flex items-center gap-2">
                            <Image
                                src="/genix.png"
                                alt="Genix Logo"
                                width={20}
                                height={20}
                                className="rounded-md"
                            />
                            <span className="text-sm font-semibold text-gradient tracking-wide">
                                GENIX
                            </span>
                            <a
                                href="https://x.com/Genix_image"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center text-[#4cc9ff]/70 hover:text-[#4cc9ff] transition-colors"
                                aria-label="Follow Genix on X"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" fill="currentColor" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div className="flex items-center gap-x-6">
                        <Link href="/privacy" className="text-xs tracking-wide text-[#a4c9e8] hover:text-[#4cc9ff] transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="text-xs tracking-wide text-[#a4c9e8] hover:text-[#4cc9ff] transition-colors">Terms of Service</Link>
                        <span className="text-[10px] tracking-wide text-[#a4c9e8]/60">
                            © 2025 Genix. All rights reserved.
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
} 