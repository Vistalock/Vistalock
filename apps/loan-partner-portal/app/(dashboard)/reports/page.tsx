export default function ReportsPage() {
    return (
        <div className="flex flex-col gap-4">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <div className="flex flex-col space-y-1.5">
                    <h3 className="font-semibold leading-none tracking-tight">Financial Reports</h3>
                    <p className="text-sm text-muted-foreground">Download detailed reports on loans, repayments, and commissions.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
                    {['Loan Issuance', 'Repayment History', 'Default Rates', 'Portfolio Growth'].map((report) => (
                        <div key={report} className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                            <h4 className="font-medium">{report}</h4>
                            <p className="text-xs text-muted-foreground mt-1">Export CSV/PDF</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
