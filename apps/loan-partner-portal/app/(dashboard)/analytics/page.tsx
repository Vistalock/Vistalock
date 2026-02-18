"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const REPAYMENT_DATA = [
    { name: 'Mon', collected: 4000, expected: 4500 },
    { name: 'Tue', collected: 3000, expected: 3200 },
    { name: 'Wed', collected: 2000, expected: 4000 },
    { name: 'Thu', collected: 2780, expected: 3000 },
    { name: 'Fri', collected: 1890, expected: 2500 },
    { name: 'Sat', collected: 2390, expected: 2500 },
    { name: 'Sun', collected: 3490, expected: 3500 },
];

const RISK_DISTRIBUTION = [
    { name: 'Low Risk', value: 400, color: '#10B981' },
    { name: 'Medium Risk', value: 300, color: '#F59E0B' },
    { name: 'High Risk', value: 300, color: '#EF4444' },
];

const DEVICE_STATUS = [
    { name: 'Active', value: 85, color: '#3B82F6' },
    { name: 'Locked', value: 10, color: '#EF4444' },
    { name: 'Inactive', value: 5, color: '#9CA3AF' },
];

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Analytics & Insights</h1>
                    <p className="text-sm text-gray-500">Deep dive into portfolio performance and trends</p>
                </div>
                <Select defaultValue="30d">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7d">Last 7 Days</SelectItem>
                        <SelectItem value="30d">Last 30 Days</SelectItem>
                        <SelectItem value="90d">Last quarter</SelectItem>
                        <SelectItem value="ytd">Year to Date</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Main Trend Chart */}
                <Card className="col-span-4 lg:col-span-5">
                    <CardHeader>
                        <CardTitle>Cash Flow Forecast</CardTitle>
                        <CardDescription>Projected vs Actual Repayments</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={REPAYMENT_DATA}>
                                    <defs>
                                        <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₦${value}`} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="collected" stroke="#3B82F6" fillOpacity={1} fill="url(#colorCollected)" />
                                    <Area type="monotone" dataKey="expected" stroke="#9CA3AF" fillOpacity={0} strokeDasharray="5 5" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Risk Pie Chart */}
                <Card className="col-span-4 lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Risk Distribution</CardTitle>
                        <CardDescription>By customer credit tier</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] flex justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={RISK_DISTRIBUTION}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {RISK_DISTRIBUTION.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-4 text-xs">
                            {RISK_DISTRIBUTION.map((item) => (
                                <div key={item.name} className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span>{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Default Prediction</CardTitle>
                        <CardDescription>AI-based risk assessment</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">Low</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Your portfolio shows strong repayment behavior. Predicted default rate for next month is <strong>1.8%</strong>.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Device Health</CardTitle>
                        <CardDescription>Lock status overview</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[100px] flex justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={DEVICE_STATUS} layout="vertical">
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={60} fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                        {DEVICE_STATUS.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Commission Yield</CardTitle>
                        <CardDescription>Average return per loan</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600">₦12,450</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            +5.2% vs industry average.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
