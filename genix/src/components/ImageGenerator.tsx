import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Download, RefreshCw, Send, X, User, Bot, ZoomIn, Maximize2, Zap, AlertTriangle, Info, CreditCard, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthProvider';

// Define types
type AiProvider = 'openai' | 'gemini';

type MessageStatus = 'sending' | 'sent' | 'error';

interface MessageType {
    id: string;
    type: 'user' | 'ai' | 'system';
    content: string;
    timestamp: Date;
    imageUrl?: string;
    status?: MessageStatus;
}

export default function ImageGenerator() {
    const [prompt, setPrompt] = useState('');
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isTestMode, setIsTestMode] = useState(false);
    const [isSimulated, setIsSimulated] = useState(false);
    const [provider, setProvider] = useState<AiProvider>('openai'); // Default to OpenAI
    const [showTokensModal, setShowTokensModal] = useState(false);

    // Authentication and user data
    const {
        user,
        remainingGenerations,
        updateGenerations,
        isGenerationAllowed,
        userData
    } = useAuth();

    // Image enlargement state
    const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Initial system message
    useEffect(() => {
        if (messages.length === 0) {
            const welcomeMessages = [
                {
                    id: 'welcome',
                    type: 'ai' as const,
                    content: '👋 Hi! I\'m your AI Image Assistant powered by Genix AI. Describe any image you want me to create!',
                    timestamp: new Date(),
                }
            ];

            setMessages(welcomeMessages);
        }
    }, [messages.length, remainingGenerations, user]);

    const handleGenerateImage = async () => {
        if (!prompt.trim()) {
            toast.error('Please enter a prompt');
            return;
        }

        // Check if user is logged in
        if (!user) {
            toast.error('Please sign in to generate images');
            return;
        }

        // Add user message to chat
        const userMessageId = `user-${Date.now()}`;
        setMessages(prev => [...prev, {
            id: userMessageId,
            type: 'user',
            content: prompt,
            timestamp: new Date(),
        }]);

        // Add AI "generating" message
        const aiMessageId = `ai-${Date.now()}`;
        setMessages(prev => [...prev, {
            id: aiMessageId,
            type: 'ai',
            content: provider === 'openai'
                ? 'Creating your image with Genix Vision AI...'
                : 'Creating your image with Genix AI...',
            timestamp: new Date(),
            status: 'sending'
        }]);

        setIsGenerating(true);

        try {
            // 始终返回成功，无需检查生成次数是否足够
            // const updateSuccess = await updateGenerations();
            // if (!updateSuccess) {
            //     throw new Error('Failed to update generation count. Please try again.');
            // }

            // 仍然调用更新函数以更新UI显示，但忽略其结果
            await updateGenerations().catch(err => console.log('Generation count update ignored:', err));

            console.log(`Sending prompt to API (${provider}):`, prompt.substring(0, 50) + (prompt.length > 50 ? '...' : ''));

            const response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt,
                    provider // Pass the selected AI provider
                }),
            });

            // Get response data
            const data = await response.json();

            if (!response.ok) {
                console.error('API error:', data);
                throw new Error(data.error || 'Failed to generate image');
            }

            if (!data.imageUrl) {
                console.error('No image URL in response:', data);
                throw new Error('No image URL returned from API');
            }

            // Update AI message with the generated image
            let responseMessage = 'Here\'s your generated image!';

            // Set message based on different modes
            if (data.isTest) {
                setIsTestMode(true);
                responseMessage = 'Here\'s a preview image (API key not configured yet).';
            } else if (data.isSimulated) {
                setIsSimulated(true);
                if (data.isFallback) {
                    responseMessage = 'I couldn\'t generate an image, so I found this related image from Unsplash instead.';
                } else {
                    responseMessage = 'I found this image from Unsplash based on your keywords. To generate custom images, please check API settings.';
                }
            } else if (data.isAiGenerated) {
                if (data.provider === 'openai') {
                    responseMessage = 'I\'ve created this image just for you with Genix Vision AI. What do you think?';
                } else {
                    responseMessage = 'I\'ve created this image just for you with Genix AI. What do you think?';
                }
            }

            // If there's a custom message, use it
            if (data.message) {
                responseMessage = data.message;
            }

            // Check image URL format
            const isDataUrl = data.imageUrl.startsWith('data:');
            const isHttpUrl = data.imageUrl.startsWith('http');

            if (!isDataUrl && !isHttpUrl) {
                console.error('Invalid image URL format:', data.imageUrl.substring(0, 30) + '...');
                throw new Error('Invalid image format received');
            }

            // Update AI message
            setMessages(prev => prev.map(msg =>
                msg.id === aiMessageId ? {
                    ...msg,
                    content: responseMessage,
                    imageUrl: data.imageUrl,
                    status: 'sent'
                } : msg
            ));

            // Clear input
            setPrompt('');

        } catch (err) {
            console.error('Error generating image:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';

            // Update AI message to error state
            setMessages(prev => prev.map(msg =>
                msg.id === aiMessageId ? {
                    ...msg,
                    content: `Sorry, I couldn't generate that image. ${errorMessage.includes('API') ? 'Please try again with a different prompt.' : 'Please try again.'}`,
                    status: 'error'
                } : msg
            ));

            toast.error('Failed to generate image');
        } finally {
            setIsGenerating(false);
        }
    };

    // Handle image enlargement
    const handleImageEnlarge = (imageUrl: string) => {
        setEnlargedImage(imageUrl);
    };

    // Close enlarged image
    const handleCloseEnlarged = () => {
        setEnlargedImage(null);
    };

    // Handle token purchase
    const handleTokenPurchase = () => {
        // Redirect to Four.meme
        window.open('https://four.meme/', '_blank');
        setShowTokensModal(false);
        toast.success('Redirecting to Four.meme to get Genix tokens');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!isGenerating && prompt.trim()) {
                handleGenerateImage();
            }
        }
    };

    const handleDownloadImage = (imageUrl: string) => {
        if (!imageUrl) return;

        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `ai-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Image downloaded');
    };

    return (
        <div className="w-full pt-20 pb-6 px-4">
            <div className="w-full max-w-5xl mx-auto">
                {/* Dialog box */}
                <div className="glass-dark backdrop-blur-md rounded-2xl border border-[#4cc9ff]/20 overflow-hidden flex flex-col h-[calc(100vh-160px)]">
                    {/* Title bar with generation counter */}
                    <div className="flex items-center justify-between p-4 border-b border-[#4cc9ff]/20 bg-gradient-to-r from-[#091128]/90 to-[#0d1940]/90">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-[#1e3a8a]/40 flex items-center justify-center">
                                <Sparkles size={18} className="text-[#4cc9ff]" />
                            </div>
                            <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#4cc9ff] to-[#3d85c6]">
                                Genix Vision
                            </h2>
                        </div>

                        {user && (
                            <div className="flex items-center gap-3">
                                <div className="px-3 py-1 rounded-full bg-[#1e3a8a]/30 border border-[#4cc9ff]/20 flex items-center gap-2">
                                    <Zap size={14} className="text-[#4cc9ff]" />
                                    <span className="text-xs text-[#4cc9ff]">
                                        {Math.max(0, remainingGenerations)} / 5 free
                                    </span>
                                </div>

                                <a
                                    href="https://four.meme/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] hover:from-[#1e40af] hover:to-[#2146c7] text-white border border-[#4cc9ff]/30 text-xs flex items-center gap-1 transition-all hover:shadow-md hover:shadow-blue-900/20"
                                >
                                    <CreditCard size={12} />
                                    <span>Get Tokens</span>
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Dialog content area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} ${message.type === 'system' ? 'justify-center' : ''}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl p-4 ${message.type === 'user'
                                        ? 'bg-gradient-to-r from-[#1e3a8a]/70 to-[#1e3a8a]/90 text-white'
                                        : message.type === 'ai'
                                            ? 'bg-gradient-to-r from-[#091128]/80 to-[#0d1940]/80 text-[#a4c9e8] border border-[#4cc9ff]/20'
                                            : 'bg-[#091128]/60 text-[#4cc9ff] text-sm border border-[#4cc9ff]/20 px-4 py-2 rounded-full'
                                        }`}
                                >
                                    {message.type === 'ai' && message.status === 'sending' && (
                                        <div className="flex items-center space-x-2">
                                            <div className="animate-pulse">{message.content}</div>
                                            <RefreshCw size={16} className="animate-spin ml-2 text-[#4cc9ff]" />
                                        </div>
                                    )}

                                    {message.type === 'ai' && message.status === 'error' && (
                                        <div className="flex items-center text-red-400">
                                            <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                                            <span>{message.content}</span>
                                        </div>
                                    )}

                                    {((message.type === 'ai' && message.status !== 'sending' && message.status !== 'error') || message.type !== 'ai') && (
                                        <div>{message.content}</div>
                                    )}

                                    {message.type === 'ai' && message.imageUrl && (
                                        <div className="mt-3">
                                            <div className="relative rounded-xl overflow-hidden border border-[#4cc9ff]/20 group">
                                                <div className="absolute inset-0 bg-gradient-to-b from-[#4cc9ff]/5 to-transparent z-0 pointer-events-none"></div>
                                                <Image
                                                    src={message.imageUrl}
                                                    alt="Generated image"
                                                    width={400}
                                                    height={400}
                                                    className="rounded-xl hover:scale-[1.02] transition-transform duration-300 z-10 relative"
                                                    style={{ width: '100%', height: 'auto' }}
                                                    unoptimized={true}
                                                />
                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleImageEnlarge(message.imageUrl!);
                                                        }}
                                                        className="bg-[#091128]/80 hover:bg-[#0c1940] p-1.5 rounded-full text-[#4cc9ff] transition-all duration-300 border border-[#4cc9ff]/30 opacity-80 hover:opacity-100 shadow-lg shadow-black/30 hover:scale-110"
                                                        aria-label="Enlarge image"
                                                    >
                                                        <ZoomIn size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input area */}
                    <div className="p-4 border-t border-[#4cc9ff]/20 bg-gradient-to-r from-[#080f1f]/95 to-[#0d1940]/95 backdrop-blur-md">
                        <div className="flex gap-2 items-end">
                            {/* Enhanced text input */}
                            <div className="flex-1 relative">
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#4cc9ff]/30 to-[#3d85c6]/30 blur-md opacity-50"></div>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Describe any image you want... (e.g. a mountain landscape at sunset with vibrant colors)"
                                    className="w-full py-3.5 px-5 bg-[#091128]/80 border border-[#4cc9ff]/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4cc9ff]/50 focus:border-transparent transition-all resize-none text-[#a4c9e8] h-12 max-h-32 shadow-inner shadow-black/20 backdrop-blur-md z-10 relative"
                                    rows={1}
                                    style={{
                                        minHeight: '54px',
                                        height: 'auto',
                                    }}
                                    disabled={isGenerating}
                                />

                                {/* Input prompt and character count */}
                                <div className="absolute -top-8 left-0 right-0 px-1 flex justify-between items-center text-xs">
                                    <div className="text-[#4cc9ff]/70">Describe an image to generate</div>
                                    {prompt && (
                                        <div className={`px-2 py-0.5 rounded-md backdrop-blur-sm
                                            ${prompt.length > 500 ? 'text-red-400 bg-red-900/20' : 'text-[#4cc9ff]/70 bg-[#091128]/50'}`}>
                                            {prompt.length}/1000
                                        </div>
                                    )}
                                </div>

                                {/* Input hint */}
                                {!user && !isGenerating && (
                                    <div className="absolute right-3 top-3.5 text-[#4cc9ff]/50 text-xs bg-[#091128]/80 px-2 py-1 rounded-md backdrop-blur-sm border border-[#4cc9ff]/10">
                                        Please sign in to generate
                                    </div>
                                )}

                                {/* Enter to send hint */}
                                {user && !prompt && !isGenerating && (
                                    <div className="absolute right-3 top-3.5 text-[#4cc9ff]/50 text-xs bg-[#091128]/80 px-2 py-1 rounded-md backdrop-blur-sm border border-[#4cc9ff]/10">
                                        Press Enter to send
                                    </div>
                                )}
                            </div>

                            {/* Enhanced send button */}
                            <button
                                onClick={handleGenerateImage}
                                disabled={isGenerating || !prompt.trim()}
                                className="p-3.5 rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] hover:from-[#1e40af] hover:to-[#2146c7] text-white border border-[#4cc9ff]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md shadow-blue-900/30 hover:shadow-lg hover:shadow-blue-900/40 relative overflow-hidden group flex-shrink-0 h-[54px] flex items-center justify-center"
                                aria-label="Generate image"
                            >
                                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#4cc9ff]/0 via-[#4cc9ff]/20 to-[#4cc9ff]/0 -translate-x-full group-hover:animate-shimmer"></span>
                                {isGenerating ?
                                    <RefreshCw size={20} className="animate-spin text-[#4cc9ff]" /> :
                                    <Send size={20} className="text-[#4cc9ff]" />
                                }
                            </button>
                        </div>

                        <div className="text-xs text-[#a4c9e8]/60 mt-2 text-center">
                            Powered by <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#4cc9ff] to-[#3d85c6] font-semibold">Genix Vision AI</span>
                            {!user && (
                                <span className="ml-2">• <span className="text-[#4cc9ff]/60">Sign in to generate images</span></span>
                            )}
                            {user && remainingGenerations > 0 && (
                                <span className="ml-2">• <span className="text-[#4cc9ff]/60">{remainingGenerations} free {remainingGenerations === 1 ? 'generation' : 'generations'} remaining</span></span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Image enlargement modal */}
            <AnimatePresence>
                {enlargedImage && (
                    <motion.div
                        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleCloseEnlarged}
                    >
                        <motion.div
                            className="relative max-w-5xl max-h-[90vh] w-full h-full"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            <div className="w-full h-full relative overflow-hidden rounded-2xl border border-[#4cc9ff]/30 shadow-2xl shadow-black/50 group">
                                <div className="absolute inset-0 bg-gradient-to-b from-[#4cc9ff]/10 to-transparent z-0 pointer-events-none"></div>
                                <Image
                                    src={enlargedImage}
                                    alt="Enlarged image"
                                    fill
                                    className="object-contain z-10"
                                    unoptimized={true}
                                    quality={100}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none z-20"></div>
                            </div>

                            <div className="absolute top-4 right-4 z-30 flex gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownloadImage(enlargedImage);
                                    }}
                                    className="p-3 rounded-full bg-black/40 text-[#4cc9ff] hover:bg-black/60 backdrop-blur-md border border-[#4cc9ff]/30 transition-all duration-300 hover:scale-110 shadow-lg shadow-black/30"
                                    aria-label="Download image"
                                >
                                    <Download size={20} />
                                </button>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCloseEnlarged();
                                    }}
                                    className="p-3 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md border border-white/20 transition-all duration-300 hover:scale-110 shadow-lg shadow-black/30"
                                    aria-label="Close enlarged image"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md text-white/80 text-sm shadow-lg shadow-black/30 border border-white/10">
                                Click anywhere to close
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Purchase tokens modal */}
            <AnimatePresence>
                {showTokensModal && (
                    <motion.div
                        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="relative max-w-md w-full bg-[#091128]/95 rounded-2xl border border-[#4cc9ff]/30 shadow-2xl shadow-black/50 overflow-hidden"
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-[#4cc9ff]/20 bg-gradient-to-r from-[#1e3a8a]/80 to-[#1e40af]/80">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <CreditCard size={18} className="text-[#4cc9ff]" />
                                        Get Genix Tokens
                                    </h3>
                                    <button
                                        onClick={() => setShowTokensModal(false)}
                                        className="p-1.5 rounded-full hover:bg-[#0c1940] text-white/80 hover:text-white transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <div className="mb-6 flex items-center gap-3 p-3 rounded-lg bg-[#0c1940]/70 border border-[#4cc9ff]/20">
                                    <div className="p-2 rounded-full bg-[#1e3a8a] flex items-center justify-center">
                                        <Info size={20} className="text-[#4cc9ff]" />
                                    </div>
                                    <p className="text-sm text-[#a4c9e8]">
                                        Genix Tokens allow you to generate more AI images beyond your free limit. Get tokens at <a href="https://four.meme/" target="_blank" rel="noopener noreferrer" className="text-[#4cc9ff] underline hover:text-[#3d85c6] transition-colors">Four.meme</a>.
                                    </p>
                                </div>

                                <div className="mb-6">
                                    <h4 className="text-white font-medium mb-3">Select a package</h4>
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="p-4 rounded-xl border border-[#4cc9ff]/40 bg-[#0c1940]/50 cursor-pointer hover:bg-[#0c1940]/80 transition-colors relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 bg-[#1e3a8a] px-2 py-1 text-xs text-white rounded-bl-lg">
                                                Popular
                                            </div>
                                            <h5 className="text-white font-bold text-lg mb-1">20 Tokens</h5>
                                            <p className="text-[#4cc9ff] font-semibold text-xl mb-2">200 Genix</p>
                                            <p className="text-[#a4c9e8] text-xs">Generate 20 high quality AI images</p>

                                            <div className="absolute inset-0 border-2 border-[#4cc9ff]/0 group-hover:border-[#4cc9ff]/30 rounded-xl transition-all duration-300"></div>
                                        </div>

                                        <div className="p-4 rounded-xl border border-[#4cc9ff]/30 bg-[#0c1940]/50 cursor-pointer hover:bg-[#0c1940]/80 transition-colors relative overflow-hidden group">
                                            <h5 className="text-white font-bold text-lg mb-1">50 Tokens</h5>
                                            <p className="text-[#4cc9ff] font-semibold text-xl mb-2">450 Genix</p>
                                            <p className="text-[#a4c9e8] text-xs">Generate 50 high quality AI images</p>

                                            <div className="absolute inset-0 border-2 border-[#4cc9ff]/0 group-hover:border-[#4cc9ff]/30 rounded-xl transition-all duration-300"></div>
                                        </div>

                                        <div className="p-4 rounded-xl border border-[#4cc9ff]/30 bg-[#0c1940]/50 cursor-pointer hover:bg-[#0c1940]/80 transition-colors relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 bg-[#1e3a8a] px-2 py-1 text-xs text-white rounded-bl-lg">
                                                Best Value
                                            </div>
                                            <h5 className="text-white font-bold text-lg mb-1">100 Tokens</h5>
                                            <p className="text-[#4cc9ff] font-semibold text-xl mb-2">800 Genix</p>
                                            <p className="text-[#a4c9e8] text-xs">Generate 100 high quality AI images</p>

                                            <div className="absolute inset-0 border-2 border-[#4cc9ff]/0 group-hover:border-[#4cc9ff]/30 rounded-xl transition-all duration-300"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setShowTokensModal(false)}
                                        className="px-4 py-2 rounded-lg text-[#a4c9e8] hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <a
                                        href="https://four.meme/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] hover:from-[#1e40af] hover:to-[#2146c7] text-white transition-all inline-flex items-center gap-2"
                                    >
                                        Get Tokens
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1">
                                            <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
} 