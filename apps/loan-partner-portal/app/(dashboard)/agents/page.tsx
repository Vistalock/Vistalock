export default function AgentsPage() {
    return (
        <div className="flex flex-col gap-4">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <div className="flex flex-col space-y-1.5">
                    <h3 className="font-semibold leading-none tracking-tight">Merchant Agents (View Only)</h3>
                    <p className="text-sm text-muted-foreground">View agents assigned to your financed merchants.</p>
                </div>
                <div className="p-6 pt-0 flex items-center justify-center h-48 border-2 border-dashed rounded-md mt-4">
                    <p className="text-muted-foreground">Agent list will appear here</p>
                </div>
            </div>
        </div>
    );
}
