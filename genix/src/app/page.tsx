'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ImageGenerator from '../components/ImageGenerator';
import LoadingState from '../components/LoadingState';
import { ArrowRight, Sparkles, Zap, Lock, MessageSquare, ImagePlus, Lightbulb, Layers } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';

export default function Home() {
  const { user, loading, signInUser } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // SSR check - avoid hydration mismatch
  if (!mounted) return null;

  return (
    <div className="web3-bg min-h-screen flex flex-col">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] bg-[#4cc9ff]/5 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-[#3d85c6]/5 rounded-full blur-[100px]"></div>
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-[#4cc9ff]/3 rounded-full blur-[80px]"></div>
      </div>

      <Header />

      <main className="flex-1 flex flex-col">
        {loading ? (
          <div className="pt-24 pb-16 px-4 flex items-center justify-center">
            <LoadingState />
          </div>
        ) : (
          <>
            {!user ? (
              <div className="pt-24 pb-16 px-4 flex flex-col items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center mb-12 relative"
                >
                  <div className="max-w-3xl mx-auto relative">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <button
                        onClick={signInUser}
                        className="bg-gradient-to-r from-[#1e3a8a] to-[#155e75] hover:from-[#1e40af] hover:to-[#0e7490] text-white px-8 py-3 rounded-btn font-medium transition-all border border-[#4cc9ff]/30 group relative overflow-hidden inline-flex items-center gap-2"
                      >
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#4cc9ff]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></span>
                        <span className="relative z-10">Get Started</span>
                        <ArrowRight className="w-4 h-4 text-[#4cc9ff] relative z-10" />
                      </button>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Feature description section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="w-full max-w-5xl mb-12"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Text to image */}
                    <div className="glass-dark rounded-2xl-plus p-6 border border-[#4cc9ff]/10 card-3d feature-card">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#1e3a8a]/50 border border-[#4cc9ff]/20">
                          <MessageSquare size={20} className="text-[#4cc9ff]" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Text to Image</h3>
                      </div>
                      <p className="text-[#a4c9e8] mb-4 text-sm">
                        Transform your ideas into stunning visuals using detailed text prompts. Our advanced AI understands complex descriptions, styles, and artistic concepts.
                      </p>
                      <div className="bg-[#091128]/70 rounded-xl p-3 border border-[#4cc9ff]/10">
                        <p className="text-xs text-[#7aa1c9] italic mb-2">Example prompt:</p>
                        <p className="text-xs text-white font-mono">"A futuristic cyberpunk city at night with neon lights, flying cars, and holographic advertisements"</p>
                      </div>
                    </div>

                    {/* Image to image */}
                    <div className="glass-dark rounded-2xl-plus p-6 border border-[#4cc9ff]/10 card-3d feature-card">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#155e75]/50 border border-[#4cc9ff]/20">
                          <ImagePlus size={20} className="text-[#4cc9ff]" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Image to Image</h3>
                      </div>
                      <p className="text-[#a4c9e8] mb-4 text-sm">
                        Upload reference images and transform them into new artistic creations. Perfect for style transfers, variations, or enhancing existing concepts.
                      </p>
                      <div className="bg-[#091128]/70 rounded-xl p-3 border border-[#4cc9ff]/10">
                        <p className="text-xs text-[#7aa1c9] italic mb-2">Upload + prompt:</p>
                        <p className="text-xs text-white font-mono">"Transform this photo into an oil painting with vibrant autumn colors"</p>
                      </div>
                    </div>
                  </div>

                  {/* Feature list */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="glass-dark rounded-xl p-4 border border-[#4cc9ff]/10 feature-card flex flex-col items-center text-center">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#1e3a8a]/40 border border-[#4cc9ff]/20 mb-3">
                        <Sparkles size={16} className="text-[#4cc9ff]" />
                      </div>
                      <h4 className="text-sm font-semibold text-white mb-1">High Quality</h4>
                      <p className="text-[#7aa1c9] text-xs">Ultra-detailed 4K resolution images</p>
                    </div>
                    <div className="glass-dark rounded-xl p-4 border border-[#4cc9ff]/10 feature-card flex flex-col items-center text-center">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#1e3a8a]/40 border border-[#4cc9ff]/20 mb-3">
                        <Zap size={16} className="text-[#4cc9ff]" />
                      </div>
                      <h4 className="text-sm font-semibold text-white mb-1">Fast Generation</h4>
                      <p className="text-[#7aa1c9] text-xs">Images in seconds, not minutes</p>
                    </div>
                    <div className="glass-dark rounded-xl p-4 border border-[#4cc9ff]/10 feature-card flex flex-col items-center text-center">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#1e3a8a]/40 border border-[#4cc9ff]/20 mb-3">
                        <Lightbulb size={16} className="text-[#4cc9ff]" />
                      </div>
                      <h4 className="text-sm font-semibold text-white mb-1">Creative Control</h4>
                      <p className="text-[#7aa1c9] text-xs">Fine-tune style, mood, and details</p>
                    </div>
                    <div className="glass-dark rounded-xl p-4 border border-[#4cc9ff]/10 feature-card flex flex-col items-center text-center">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#1e3a8a]/40 border border-[#4cc9ff]/20 mb-3">
                        <Layers size={16} className="text-[#4cc9ff]" />
                      </div>
                      <h4 className="text-sm font-semibold text-white mb-1">Multiple Styles</h4>
                      <p className="text-[#7aa1c9] text-xs">Photography, art, 3D, abstract & more</p>
                    </div>
                  </div>
                </motion.div>

                {/* Example image section */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.4 }}
                  className="w-full max-w-5xl"
                >
                  <h2 className="text-xl font-bold text-center mb-6 text-white">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#4cc9ff] to-[#3d85c6]">
                      Generated Showcase
                    </span>
                  </h2>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mx-auto mb-4">
                    <div className="glass-dark rounded-xl overflow-hidden aspect-square relative group feature-card">
                      <img
                        src="/wew0.png"
                        alt="Cyberpunk cityscape"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                        <p className="text-xs text-white">Cyberpunk cityscape</p>
                      </div>
                    </div>
                    <div className="glass-dark rounded-xl overflow-hidden aspect-square relative group feature-card">
                      <img
                        src="https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=800&auto=format&fit=crop"
                        alt="Abstract digital art"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                        <p className="text-xs text-white">Abstract digital art</p>
                      </div>
                    </div>
                    <div className="glass-dark rounded-xl overflow-hidden aspect-square relative group feature-card">
                      <img
                        src="https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=800&auto=format&fit=crop"
                        alt="Fantasy landscape"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                        <p className="text-xs text-white">Fantasy landscape</p>
                      </div>
                    </div>
                    <div className="glass-dark rounded-xl overflow-hidden aspect-square relative group feature-card">
                      <img
                        src="https://images.unsplash.com/photo-1581822261290-991b38693d1b?q=80&w=800&auto=format&fit=crop"
                        alt="Sci-fi character"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                        <p className="text-xs text-white">Sci-fi character</p>
                      </div>
                    </div>
                  </div>

                  {/* Advanced examples */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-auto">
                    <div className="glass-dark rounded-xl overflow-hidden relative group">
                      <div className="aspect-video relative">
                        <img
                          src="/rgzxv.png"
                          alt="Product Visualization"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent"></div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-[#4cc9ff] text-sm font-semibold mb-1">Product Visualization</h3>
                        <p className="text-xs text-[#a4c9e8]">
                          Create photorealistic product concepts and mockups with precise control over lighting, materials, and environments.
                        </p>
                      </div>
                    </div>
                    <div className="glass-dark rounded-xl overflow-hidden relative group">
                      <div className="aspect-video relative">
                        <img
                          src="/qrwrf.png"
                          alt="Style Transformation"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent"></div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-[#4cc9ff] text-sm font-semibold mb-1">Style Transformation</h3>
                        <p className="text-xs text-[#a4c9e8]">
                          Transform existing images into different artistic styles, eras, or media from oil paintings to neon-lit dystopias.
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-center text-xs text-[#7aa1c9]/70 mt-4">Create your own stunning visuals with AI Image Technology</p>
                </motion.div>

                {/* Feature tags - shown at bottom when user not logged in */}
                <div className="relative z-10 max-w-xl mx-auto mt-8 px-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#4cc9ff]/5 to-[#3d85c6]/5 rounded-2xl blur-sm"></div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2 rounded-2xl bg-[#091128]/30 backdrop-blur-sm border border-[#4cc9ff]/20 relative z-10">
                    <div className="flex flex-col items-center justify-center py-3 px-2 hover:bg-[#091128]/50 transition-colors rounded-xl cursor-default">
                      <Sparkles size={18} className="text-[#4cc9ff] mb-1" />
                      <span className="text-xs font-medium text-[#a4c9e8]">AI Powered</span>
                    </div>
                    <div className="flex flex-col items-center justify-center py-3 px-2 hover:bg-[#091128]/50 transition-colors rounded-xl cursor-default">
                      <Lock size={18} className="text-[#4cc9ff] mb-1" />
                      <span className="text-xs font-medium text-[#a4c9e8]">Secure</span>
                    </div>
                    <div className="flex flex-col items-center justify-center py-3 px-2 hover:bg-[#091128]/50 transition-colors rounded-xl cursor-default">
                      <Zap size={18} className="text-[#4cc9ff] mb-1" />
                      <span className="text-xs font-medium text-[#a4c9e8]">Cutting-Edge</span>
                    </div>
                    <div className="flex flex-col items-center justify-center py-3 px-2 hover:bg-[#091128]/50 transition-colors rounded-xl cursor-default">
                      <span className="w-5 h-5 flex items-center justify-center mb-1">
                        <svg viewBox="0 0 24 24" width="18" height="18" className="text-[#4cc9ff]" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4 16.2422C2.79401 15.435 2 14.0602 2 12.5C2 10.1564 3.79151 8.23129 6.07974 8.01937C6.54781 5.17213 9.02024 3 12 3C14.9798 3 17.4522 5.17213 17.9203 8.01937C20.2085 8.23129 22 10.1564 22 12.5C22 14.0602 21.206 15.435 20 16.2422M8 17L12 21M12 21L16 17M12 21V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span className="text-xs font-medium text-[#a4c9e8]">Web3</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="pt-20 pb-10 px-4 flex flex-col items-center justify-center">
                <div className="flex flex-col w-full max-w-4xl">
                  <ImageGenerator />
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
