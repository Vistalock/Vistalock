"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";

const REPORTS = [
    { title: 'Loan Book', description: 'Complete list of all funded loans and their current status.' },
    { title: 'Repayment Schedule', description: 'Expected vs Actual repayments for the current period.' },
    { title: 'Commission Report', description: 'Breakdown of commissions earned and withheld.' },
    { title: 'Merchant Performance', description: 'Aggregated metrics for all connected merchants.' },
    { title: 'Device Lock History', description: 'Log of all device lock/unlock events.' },
];

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Reports</h1>
                    <p className="text-sm text-gray-500">Download operational and financial reports</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {REPORTS.map((report) => (
                    <Card key={report.title} className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center">
                                <FileText className="mr-2 h-5 w-5 text-gray-500" />
                                {report.title}
                            </CardTitle>
                            <CardDescription>{report.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="mt-auto pt-0">
                            <Button className="w-full" variant="outline">
                                <Download className="mr-2 h-4 w-4" />
                                Download CSV
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
