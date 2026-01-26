import { Shield } from 'lucide-react';

export default function MobileDeviceMockup() {
    return (
        <div className="relative w-full max-w-xs mx-auto">
            {/* Phone Frame with enhanced styling */}
            <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-[3.5rem] p-3 shadow-2xl">
                <div className="relative bg-white rounded-[3rem] overflow-hidden" style={{ aspectRatio: '9/19.5' }}>
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-6 bg-black rounded-b-3xl z-10"></div>

                    {/* Screen Content with gradient background */}
                    <div className="relative h-full bg-gradient-to-b from-emerald-50 to-white flex flex-col items-center justify-center px-6 py-12">

                        {/* Decorative circles in background */}
                        <div className="absolute top-20 right-8 w-32 h-32 bg-emerald-100 rounded-full opacity-30 blur-2xl"></div>
                        <div className="absolute bottom-32 left-8 w-24 h-24 bg-emerald-200 rounded-full opacity-20 blur-xl"></div>

                        {/* Content Container */}
                        <div className="relative z-10 flex flex-col items-center">
                            {/* Enhanced Shield Icon with glow effect */}
                            <div className="mb-6 relative">
                                <div className="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-40"></div>
                                <div className="relative bg-white rounded-full p-4 shadow-lg">
                                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M32 4L8 16V30C8 43.6 16.8 56 32 60C47.2 56 56 43.6 56 30V16L32 4Z" fill="url(#shield-gradient)" />
                                        <rect x="26" y="24" width="12" height="16" rx="1.5" fill="white" />
                                        <rect x="28" y="21" width="8" height="6" rx="4" stroke="white" strokeWidth="2.5" fill="none" />
                                        <defs>
                                            <linearGradient id="shield-gradient" x1="32" y1="4" x2="32" y2="60" gradientUnits="userSpaceOnUse">
                                                <stop stopColor="#10B981" />
                                                <stop offset="1" stopColor="#059669" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </div>
                            </div>

                            {/* Device Locked Text with better typography */}
                            <h2 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">Device Locked</h2>
                            <p className="text-gray-500 text-sm font-medium mb-8">Payment Overdue: ₦5,000</p>

                            {/* Enhanced Pay Now Button */}
                            <button className="relative group bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold px-10 py-3.5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 w-full max-w-[200px] overflow-hidden">
                                <span className="relative z-10">Pay Now</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                            </button>

                            {/* Additional info text */}
                            <p className="text-xs text-gray-400 mt-6 text-center">
                                Make payment to unlock your device
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
