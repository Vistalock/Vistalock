/* eslint-disable */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { LoginLogsModal } from './LoginLogsModal';

interface Agent {
    id: string;
    email: string;
    agentProfile: {
        fullName: string;
        phoneNumber: string;
        branch: string;
        onboardingLimit: number;
        status: 'PENDING' | 'ACTIVE' | 'DEACTIVATED';
        isActivated: boolean;
        activationToken: string | null;
        activationExpiresAt: string | null;
        deviceId: string | null;
        lastLoginAt: string | null;
    };
    createdAt: string;
}

                />
            )}
        </div >
    );
}

function ConfirmModal({ title, message, onConfirm, onCancel, confirmText, confirmColor }: {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText: string;
    confirmColor: 'red' | 'orange';
}) {
    const colorClasses = confirmColor === 'red'
        ? 'bg-red-600 hover:bg-red-700'
        : 'bg-orange-600 hover:bg-orange-700';

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-bold mb-4">{title}</h3>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 px-4 py-2 text-white rounded-lg ${colorClasses}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

function CreateAgentModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        email: '',
        branch: '',
        onboardingLimit: 10
    });
    const [loading, setLoading] = useState(false);
    const [activationLink, setActivationLink] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/agents', formData);
            setActivationLink(response.data.activationLink);
            setShowSuccess(true);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to create agent');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(activationLink);
        alert('Activation link copied to clipboard!');
    };

    if (showSuccess) {
        return (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                    <h3 className="text-lg font-bold text-green-600 mb-4">✅ Agent Created Successfully!</h3>

                    <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Activation link has been sent via SMS to:</p>
                        <p className="font-medium">{formData.phoneNumber}</p>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Activation Link:</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={activationLink}
                                readOnly
                                className="flex-1 px-3 py-2 border rounded-lg text-sm"
                            />
                            <button
                                onClick={copyToClipboard}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Copy
                            </button>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-yellow-800">
                            ⏰ This link expires in 24 hours
                        </p>
                    </div>

                    <button
                        onClick={onSuccess}
                        className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                    >
                        Done
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-bold mb-4">Add New Agent</h3>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="John Doe"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                        <input
                            type="tel"
                            required
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="+2348012345678"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="agent@example.com"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Branch/Location *</label>
                        <input
                            type="text"
                            required
                            value={formData.branch}
                            onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="Lagos Branch"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Daily Onboarding Limit</label>
                        <input
                            type="number"
                            min="1"
                            value={formData.onboardingLimit}
                            onChange={(e) => setFormData({ ...formData, onboardingLimit: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Agent'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
