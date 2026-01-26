import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface LoginLog {
    id: string;
    deviceId: string | null;
    ipAddress: string | null;
    success: boolean;
    failReason: string | null;
    createdAt: string;
}

export function LoginLogsModal({ agentId, agentName, onClose }: {
    agentId: string;
    agentName: string;
    onClose: () => void;
}) {
    const [logs, setLogs] = useState<LoginLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, [agentId]);

    const fetchLogs = async () => {
        try {
            const response = await api.get(`/agents/${agentId}/login-logs`);
            setLogs(response.data);
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Login History - {agentName}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                        ×
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-gray-500">Loading logs...</div>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        No login attempts yet
                    </div>
                ) : (
                    <div className="overflow-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fail Reason</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {log.success ? (
                                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                                    ✓ Success
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                                                    ✗ Failed
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 font-mono text-xs">
                                            {log.deviceId ? log.deviceId.substring(0, 16) + '...' : 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                            {log.ipAddress || 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-red-600">
                                            {log.failReason || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
