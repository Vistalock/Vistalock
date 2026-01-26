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

export default function AgentsPage() {
    const { user } = useAuth();
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [showUnbindModal, setShowUnbindModal] = useState(false);
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [showLogsModal, setShowLogsModal] = useState(false);

    useEffect(() => {
        fetchAgents();
    }, []);

    const fetchAgents = async () => {
        try {
            const response = await api.get('/agents');
            setAgents(response.data);
        } catch (error) {
            console.error('Failed to fetch agents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleResendActivation = async (agentId: string) => {
        try {
            await api.post(`/agents/${agentId}/resend-activation`);
            alert('Activation link sent successfully!');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to resend activation');
        }
    };

    const handleUnbindDevice = (agent: Agent) => {
        setSelectedAgent(agent);
        setShowUnbindModal(true);
    };

    const confirmUnbind = async () => {
        if (!selectedAgent) return;
        try {
            await api.post(`/agents/${selectedAgent.id}/unbind-device`);
            alert('Device unbound successfully!');
            setShowUnbindModal(false);
            fetchAgents();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to unbind device');
        }
    };

    const handleDeactivate = (agent: Agent) => {
        setSelectedAgent(agent);
        setShowDeactivateModal(true);
    };

    const confirmDeactivate = async () => {
        if (!selectedAgent) return;
        try {
            await api.delete(`/agents/${selectedAgent.id}`);
            alert('Agent deactivated successfully!');
            setShowDeactivateModal(false);
            fetchAgents();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to deactivate agent');
        }
    };

    const handleViewLogs = (agent: Agent) => {
        setSelectedAgent(agent);
        setShowLogsModal(true);
    };

    const getStatusBadge = (status: string, isActivated: boolean) => {
        if (status === 'DEACTIVATED') {
            return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Deactivated</span>;
        }
        if (isActivated) {
            return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>;
        }
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending Activation</span>;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading agents...</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
                    <p className="text-gray-600">Manage your field agents</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    + Add Agent
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Limit</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {agents.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                        No agents yet. Click "Add Agent" to create your first agent.
                                    </td>
                                </tr>
                            ) : (
                                agents.map((agent) => (
                                    <tr key={agent.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {agent.agentProfile.fullName}
                                            </div>
                                            <div className="text-xs text-gray-500">{agent.email}</div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                            {agent.agentProfile.phoneNumber}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                            {agent.agentProfile.branch}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {getStatusBadge(agent.agentProfile.status, agent.agentProfile.isActivated)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {agent.agentProfile.deviceId ? (
                                                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                                    🔒 Bound
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                                                    Not Bound
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                                            {agent.agentProfile.lastLoginAt
                                                ? new Date(agent.agentProfile.lastLoginAt).toLocaleString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })
                                                : 'Never'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                            {agent.agentProfile.onboardingLimit}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs">
                                            <div className="flex flex-col gap-1">
                                                <button
                                                    onClick={() => handleViewLogs(agent)}
                                                    className="text-blue-600 hover:text-blue-900 text-left"
                                                >
                                                    View Logs
                                                </button>
                                                {!agent.agentProfile.isActivated && (
                                                    <button
                                                        onClick={() => handleResendActivation(agent.id)}
                                                        className="text-green-600 hover:text-green-900 text-left"
                                                    >
                                                        Resend
                                                    </button>
                                                )}
                                                {agent.agentProfile.deviceId && (
                                                    <button
                                                        onClick={() => handleUnbindDevice(agent)}
                                                        className="text-orange-600 hover:text-orange-900 text-left"
                                                    >
                                                        Unbind
                                                    </button>
                                                )}
                                                {agent.agentProfile.status !== 'DEACTIVATED' && (
                                                    <button
                                                        onClick={() => handleDeactivate(agent)}
                                                        className="text-red-600 hover:text-red-900 text-left"
                                                    >
                                                        Deactivate
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showCreateModal && (
                <CreateAgentModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchAgents();
                    }}
                />
            )}

            {showUnbindModal && selectedAgent && (
                <ConfirmModal
                    title="Unbind Device?"
                    message={`Are you sure you want to unbind the device for ${selectedAgent.agentProfile.fullName}? They will be able to log in from a new device.`}
                    onConfirm={confirmUnbind}
                    onCancel={() => setShowUnbindModal(false)}
                    confirmText="Unbind"
                    confirmColor="orange"
                />
            )}

            {showDeactivateModal && selectedAgent && (
                <ConfirmModal
                    title="Deactivate Agent?"
                    message={`Are you sure you want to deactivate ${selectedAgent.agentProfile.fullName}? They will no longer be able to log in.`}
                    onConfirm={confirmDeactivate}
                    onCancel={() => setShowDeactivateModal(false)}
                    confirmText="Deactivate"
                    confirmColor="red"
                />
            )}

            {showLogsModal && selectedAgent && (
                <LoginLogsModal
                    agentId={selectedAgent.id}
                    agentName={selectedAgent.agentProfile.fullName}
                    onClose={() => setShowLogsModal(false)}
                />
            )}
        </div>
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
