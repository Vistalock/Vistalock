/* eslint-disable */
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

// API Configuration
// Assuming the backend Gateway is running on 3000 or defined in ENV
// In this dev environment setup, auth-service might be on 3001, gateway on 3000
const API_URL = 'http://localhost:3000'; // Default Gateway

export default function SimulatorPage() {
    const [imei, setImei] = useState('');
    const [activeImei, setActiveImei] = useState('');
    const [policy, setPolicy] = useState<any>(null);
    const [lastSync, setLastSync] = useState<Date | null>(null);
    const [loading, setLoading] = useState(false);

    // Polling Logic
    useEffect(() => {
        if (!activeImei) return;

        const fetchPolicy = async () => {
            try {
                // Determine port: auth-service usually 3001 or via gateway.
                // Using gateway path: /device-control/policy/:imei
                // Note: Gateway routing needs to be confirmed. If standard nestjs mono-repo, maybe direct.
                // Let's try direct auth-service port 3001 if gateway mapping is unknown, 
                // BUT better to try Gateway first.
                const res = await axios.get(`${API_URL}/device-control/policy/${activeImei}`);
                setPolicy(res.data);
                setLastSync(new Date());

                // Send Heartbeat
                await axios.post(`${API_URL}/device-control/heartbeat`, {
                    imei: activeImei,
                    batteryLevel: 85,
                    currentLockState: res.data.lock
                });
            } catch (err) {
                console.error("Poling failed", err);
            }
        };

        // Initial fetch
        fetchPolicy();

        // Poll every 5 seconds
        const interval = setInterval(fetchPolicy, 3000);
        return () => clearInterval(interval);
    }, [activeImei]);

    const handleStart = () => {
        if (!imei) return;
        setActiveImei(imei);
    };

    const handleStop = () => {
        setActiveImei('');
        setPolicy(null);
    };

    // Render Logic
    if (!activeImei) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <div className="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full border border-gray-700">
                    <h1 className="text-2xl font-bold text-white mb-2 text-center">📱 Device Simulator</h1>
                    <p className="text-gray-400 text-center mb-6">Enter an IMEI to emulate an Android Device</p>

                    <input
                        type="text"
                        value={imei}
                        onChange={(e) => setImei(e.target.value)}
                        placeholder="Enter IMEI (e.g. 123456789012345)"
                        className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                    />

                    <button
                        onClick={handleStart}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all"
                    >
                        Power On Device
                    </button>

                    <div className="mt-4 text-xs text-center text-gray-500">
                        Vistalock DPC Emulator v1.0
                    </div>
                </div>
            </div>
        );
    }

    const isLocked = policy?.lock;
    const stage = policy?.lockStage ?? 0;

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-8">
            {/* Phone Frame */}
            <div className="relative border-[14px] border-gray-900 rounded-[2.5rem] h-[800px] w-[380px] shadow-xl bg-black overflow-hidden flex flex-col">
                {/* Notch */}
                <div className="absolute top-0 inset-x-0 h-6 bg-gray-900 rounded-b-xl w-40 mx-auto z-50"></div>

                {/* Status Bar */}
                <div className={`h-8 w-full ${isLocked ? 'bg-red-900' : 'bg-transparent'} flex justify-between items-center px-6 pt-2 z-40`}>
                    <span className="text-white text-xs font-bold">12:30</span>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-full bg-white opacity-80"></div>
                        <div className="w-3 h-3 rounded-full bg-white opacity-80"></div>
                        <div className="w-4 h-3 rounded-sm border border-white opacity-80"></div>
                    </div>
                </div>

                {/* Screen Content */}
                <div className={`flex-1 flex flex-col items-center relative ${isLocked ? 'bg-red-800' : 'bg-wallpaper bg-cover bg-center'}`}>

                    {/* Background Image Placeholder for Home */}
                    {!isLocked && (
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900 opacity-100 flex flex-col items-center pt-20">
                            {/* App Icons Grid */}
                            <div className="grid grid-cols-4 gap-4 p-4 w-full">
                                {[...Array(16)].map((_, i) => (
                                    <div key={i} className="flex flex-col items-center">
                                        <div className={`w-14 h-14 rounded-xl mb-1 ${['bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-pink-500'][i % 4]} opacity-90 shadow-lg`}></div>
                                        <span className="text-white text-[10px] opacity-80">App {i + 1}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Unlocked Banner if Stage 1 */}
                            {stage === 1 && (
                                <div className="absolute bottom-24 mx-4 bg-orange-500/90 p-3 rounded-xl border border-orange-400 shadow-lg backdrop-blur-md">
                                    <h3 className="font-bold text-white text-sm">⚠️ Payment Due</h3>
                                    <p className="text-white text-xs">Some apps are blocked. Pay to restore full access.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Locked Overlay */}
                    {isLocked && (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center z-10 w-full animate-in fade-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-md animate-pulse">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-white">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                </svg>
                            </div>

                            <h2 className="text-3xl font-bold text-white mb-2">Device Locked</h2>
                            <p className="text-red-100 font-medium mb-8">
                                {policy.lockMessage || "This device is locked due to non-payment."}
                            </p>

                            <div className="bg-black/30 w-full p-4 rounded-xl border border-white/10 mb-4">
                                <p className="text-gray-300 text-xs uppercase">Pay to Unlock</p>
                                <p className="text-white text-lg font-bold mt-1">Visit Merchant</p>
                            </div>

                            <button className="bg-white/10 text-white py-2 px-6 rounded-full text-sm border border-white/20 hover:bg-white/20">
                                Emergency Call
                            </button>

                            <div className="absolute bottom-6 text-[10px] text-white/40">
                                VistaLock Security Framework
                            </div>
                        </div>
                    )}

                </div>

                {/* Home Bar */}
                <div className="bg-black h-8 w-full flex justify-center items-center pb-2">
                    <div className="w-32 h-1 bg-gray-700 rounded-full"></div>
                </div>
            </div>

            {/* Controls Side Panel */}
            <div className="ml-12 bg-gray-800 p-6 rounded-xl border border-gray-700 w-80">
                <h3 className="text-white font-bold mb-4">Debugging Console</h3>
                <div className="space-y-4">
                    <div className="flex justify-between">
                        <span className="text-gray-400">IMEI:</span>
                        <span className="text-white font-mono">{activeImei}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Poll Status:</span>
                        <span className={`font-bold ${policy ? 'text-green-400' : 'text-yellow-400'}`}>
                            {policy ? 'Syncing...' : 'Waiting'}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Last Sync:</span>
                        <span className="text-white text-xs">
                            {lastSync ? lastSync.toLocaleTimeString() : '-'}
                        </span>
                    </div>
                    <div className="h-px bg-gray-600 my-2"></div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Remote Lock:</span>
                        <span className={isLocked ? "text-red-500 font-bold" : "text-green-500 font-bold"}>
                            {isLocked ? "ACTIVE" : "INACTIVE"}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Lock Stage:</span>
                        <span className="text-white font-bold">{stage}</span>
                    </div>

                    <button
                        onClick={handleStop}
                        className="w-full mt-4 bg-red-600/20 text-red-400 border border-red-600/50 py-2 rounded-lg hover:bg-red-600/30"
                    >
                        Power Off
                    </button>
                </div>
            </div>
        </div>
    );
}
