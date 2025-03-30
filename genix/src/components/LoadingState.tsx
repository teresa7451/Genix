import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function LoadingState() {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full p-6">
            <div className="relative w-24 h-24 mb-6">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.7, 0.3],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    className="absolute inset-0 rounded-full bg-[#4cc9ff]/20 blur-md"
                />

                <div className="absolute inset-0 flex items-center justify-center">
                    <Image
                        src="/genix.png"
                        alt="Genix Logo"
                        width={64}
                        height={64}
                        className="object-contain z-10"
                    />
                </div>

                <motion.div
                    animate={{
                        rotate: 360,
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <div className="w-20 h-20 rounded-full border-2 border-[#4cc9ff]/30 border-t-[#4cc9ff] border-l-[#4cc9ff]/50" />
                </motion.div>
            </div>

            <motion.div
                animate={{
                    opacity: [0.5, 1, 0.5],
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                className="flex flex-col items-center"
            >
                <p className="text-[#4cc9ff] text-sm mb-1 neon-text">
                    Initializing
                </p>
                <div className="flex space-x-1">
                    <motion.div
                        animate={{
                            opacity: [0.2, 1, 0.2],
                            y: [0, -3, 0]
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: 0
                        }}
                        className="w-1.5 h-1.5 rounded-full bg-[#4cc9ff]"
                    />
                    <motion.div
                        animate={{
                            opacity: [0.2, 1, 0.2],
                            y: [0, -3, 0]
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: 0.2
                        }}
                        className="w-1.5 h-1.5 rounded-full bg-[#4cc9ff]"
                    />
                    <motion.div
                        animate={{
                            opacity: [0.2, 1, 0.2],
                            y: [0, -3, 0]
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: 0.4
                        }}
                        className="w-1.5 h-1.5 rounded-full bg-[#4cc9ff]"
                    />
                </div>
            </motion.div>
        </div>
    );
} 