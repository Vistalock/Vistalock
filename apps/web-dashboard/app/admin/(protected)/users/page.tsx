'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, ShieldAlert, UserCog } from 'lucide-react';

interface User {
    id: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
}

const ROLES = [
    { value: 'SUPER_ADMIN', label: 'Super Admin' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'OPS_ADMIN', label: 'Operations Admin' },
    { value: 'RISK_ADMIN', label: 'Risk Admin' },
    { value: 'COMPLIANCE_ADMIN', label: 'Compliance Admin' },
    { value: 'TECH_ADMIN', label: 'Tech Admin' },
    { value: 'SUPPORT_ADMIN', label: 'Support Admin' },
];

import { SudoModal } from '@/components/ui/sudo-modal';

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Sudo State
    const [isSudoOpen, setIsSudoOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<{
        type: 'SUSPEND' | 'ACTIVATE' | 'RESET_PASSWORD' | 'UPDATE_ROLE';
        userId: string;
        payload?: any;
    } | null>(null);

    // Create Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('SUPPORT_ADMIN');
    const [createLoading, setCreateLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/auth/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/auth/admin/users`, {
                email,
                password,
                role
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsCreateOpen(false);
            fetchUsers();
            setEmail('');
            setPassword('');
            setRole('SUPPORT_ADMIN');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create user');
        } finally {
            setCreateLoading(false);
        }
    };

    const triggerSudo = (action: typeof pendingAction) => {
        setPendingAction(action);
        setIsSudoOpen(true);
    };

    const handleSudoSuccess = async (sudoToken: string) => {
        if (!pendingAction) return;

        try {
            const token = localStorage.getItem('token');
            const headers = {
                Authorization: `Bearer ${token}`,
                'X-Sudo-Token': sudoToken
            };

            if (pendingAction.type === 'SUSPEND' || pendingAction.type === 'ACTIVATE') {
                await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/auth/admin/users/${pendingAction.userId}/suspend`, {
                    isActive: pendingAction.payload.isActive
                }, { headers });
            } else if (pendingAction.type === 'RESET_PASSWORD') {
                const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/auth/admin/users/${pendingAction.userId}/reset-password`, {}, { headers });
                alert(`New Password: ${res.data.tempPassword}`);
            } else if (pendingAction.type === 'UPDATE_ROLE') {
                // Not implemented in UI yet but ready
                await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/auth/admin/users/${pendingAction.userId}/role`, { role: pendingAction.payload.role }, { headers });
            }

            fetchUsers();
        } catch (err) {
            alert('Action failed');
            console.error(err);
        } finally {
            setPendingAction(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center justify-between">
                    <div></div>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                Create User
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Internal User</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-4">
                                {error && <div className="p-2 bg-red-100 text-red-600 rounded text-sm">{error}</div>}
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Password</Label>
                                    <Input type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Role</Label>
                                    <Select value={role} onValueChange={setRole}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ROLES.map(r => (
                                                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={createLoading}>
                                        {createLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Create User
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Internal Users</CardTitle>
                    <CardDescription>
                        List of all users with administrative access.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === 'SUPER_ADMIN' ? 'destructive' : 'secondary'}>
                                                {user.role.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={user.isActive ? "text-green-600 border-green-200 bg-green-50" : "text-red-600 border-red-200 bg-red-50"}>
                                                {user.isActive ? 'Active' : 'Suspended'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={user.isActive ? "text-red-600 hover:bg-red-50" : "text-green-600 hover:bg-green-50"}
                                                onClick={() => triggerSudo({
                                                    type: user.isActive ? 'SUSPEND' : 'ACTIVATE',
                                                    userId: user.id,
                                                    payload: { isActive: !user.isActive }
                                                })}
                                            >
                                                {user.isActive ? 'Suspend' : 'Activate'}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => triggerSudo({
                                                    type: 'RESET_PASSWORD',
                                                    userId: user.id
                                                })}
                                            >
                                                Reset
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <SudoModal
                isOpen={isSudoOpen}
                onClose={() => setIsSudoOpen(false)}
                onSuccess={handleSudoSuccess}
            />
        </div>
    );
}
