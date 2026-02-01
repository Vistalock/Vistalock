
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, CheckCircle, XCircle, AlertTriangle, ExternalLink } from 'lucide-react';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    application: any;
    onReview: (action: 'APPROVE' | 'REJECT', data?: any) => void;
    loading: boolean;
}

const OPS_CHECKLIST = [
    { id: 'cac_verified', label: 'CAC Certificate Verified' },
    { id: 'status_report_verified', label: 'CAC Status Report Verified' },
    { id: 'address_verified', label: 'Operating Address Verified' },
    { id: 'directors_kyc_verified', label: 'Director IDs / KYC Validated' },
    { id: 'tin_verified', label: 'TIN Validated (if applicable)' },
];

const RISK_CHECKLIST = [
    { id: 'credit_check_passed', label: 'Director Credit Check Passed' },
    { id: 'business_model_approved', label: 'Business Model / Product Risk Approved' },
    { id: 'volume_capacity_verified', label: 'Sales Volume Capacity Verified' },
    { id: 'locking_capability_confirmed', label: 'Device Locking Compatibility Confirmed' },
];

export function ApplicationReviewModal({ isOpen, onClose, application, onReview, loading }: ReviewModalProps) {
    const [checklist, setChecklist] = useState<Record<string, boolean>>({});
    const [notes, setNotes] = useState('');
    const [confirmAction, setConfirmAction] = useState<'APPROVE' | 'REJECT' | null>(null);

    if (!application) return null;

    const isOpsStage = application.status === 'PENDING';
    const isRiskStage = application.status === 'OPS_REVIEWED';
    const currentChecklist = isOpsStage ? OPS_CHECKLIST : (isRiskStage ? RISK_CHECKLIST : []);

    const toggleCheck = (id: string) => {
        setChecklist(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const allChecked = currentChecklist.every(item => checklist[item.id]);

    const handleAction = (action: 'APPROVE' | 'REJECT') => {
        if (action === 'APPROVE' && !allChecked) {
            alert("Please complete all checklist items before approving.");
            return;
        }
        setConfirmAction(action);
    };

    const confirmSubmit = () => {
        if (!confirmAction) return;

        const reviewData = {
            checklist,
            notes,
            passed: confirmAction === 'APPROVE'
        };

        onReview(confirmAction, reviewData);
        setConfirmAction(null);
        setChecklist({});
        setNotes('');
    };

    const viewDocument = (doc: any) => {
        if (!doc || !doc.content) return;
        const win = window.open();
        if (win) {
            win.document.write(
                `<iframe src="${doc.content}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
            );
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <div className="flex justify-between items-center">
                        <DialogTitle>Review Application: {application.businessName}</DialogTitle>
                        <Badge variant={isOpsStage ? "secondary" : "default"}>
                            {application.status}
                        </Badge>
                    </div>
                    <DialogDescription>ID: {application.id}</DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden">
                    <Tabs defaultValue="overview" className="h-full flex flex-col">
                        <div className="px-6 pt-2">
                            <TabsList>
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="documents">Documents ({Object.keys(application.documents || {}).length})</TabsTrigger>
                                <TabsTrigger value="branches">Branches ({application.branches?.length || 0})</TabsTrigger>
                                <TabsTrigger value="review">Review Decision</TabsTrigger>
                            </TabsList>
                        </div>

                        <ScrollArea className="flex-1 p-6">
                            <TabsContent value="overview" className="mt-0 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-sm text-muted-foreground">Business Details</h4>
                                        <div className="grid gap-2 text-sm">
                                            <div className="flex justify-between pb-1 border-b"><span>Legal Name</span> <span className="font-medium">{application.businessName}</span></div>
                                            <div className="flex justify-between pb-1 border-b"><span>Trading Name</span> <span className="font-medium">{application.tradingName || '-'}</span></div>
                                            <div className="flex justify-between pb-1 border-b"><span>RC Number</span> <span className="font-medium">{application.cacNumber}</span></div>
                                            <div className="flex justify-between pb-1 border-b"><span>Type</span> <span className="font-medium">{application.businessType}</span></div>
                                            <div className="flex justify-between pb-1 border-b"><span>Years in Op</span> <span className="font-medium">{application.yearsInOperation || '-'}</span></div>
                                            <div className="flex justify-between pb-1 border-b"><span>Website</span> <span className="font-medium">{application.website || '-'}</span></div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-sm text-muted-foreground">Principal Contact</h4>
                                        <div className="grid gap-2 text-sm">
                                            <div className="flex justify-between pb-1 border-b"><span>Name</span> <span className="font-medium">{application.contactName}</span></div>
                                            <div className="flex justify-between pb-1 border-b"><span>Phone</span> <span className="font-medium">{application.phone}</span></div>
                                            <div className="flex justify-between pb-1 border-b"><span>Email</span> <span className="font-medium">{application.email}</span></div>
                                            <div className="flex justify-between pb-1 border-b"><span>Address</span> <span className="font-medium">{application.businessAddress}</span></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-semibold text-sm text-muted-foreground">Product Declaration</h4>
                                    <Card className="bg-muted/30">
                                        <CardContent className="p-4 grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-muted-foreground block text-xs">Categories</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {(application.productDeclaration?.categories || []).map((c: string) => (
                                                        <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground block text-xs">Brands</span>
                                                <p className="font-medium">{application.productDeclaration?.brands?.join(', ')}</p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground block text-xs">Price Range</span>
                                                <p className="font-medium">₦{application.productDeclaration?.minPrice} - ₦{application.productDeclaration?.maxPrice}</p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground block text-xs">Volume</span>
                                                <p className="font-medium">{application.productDeclaration?.monthlyVolume}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            <TabsContent value="documents" className="mt-0">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {Object.entries(application.documents || {}).map(([key, doc]: [string, any]) => (
                                        <Card key={key} className="cursor-pointer hover:border-primary transition-colors" onClick={() => viewDocument(doc)}>
                                            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                                                <FileText className="h-8 w-8 text-primary/60" />
                                                <div className="text-sm font-medium capitalize">{key.replace(/_/g, ' ')}</div>
                                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                    {doc.type?.split('/')[1]?.toUpperCase()} • {(doc.size / 1024 / 1024).toFixed(2)} MB
                                                    <ExternalLink className="h-3 w-3 ml-1" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="branches" className="mt-0 space-y-4">
                                {(application.branches || []).map((b: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center p-3 border rounded-lg bg-muted/20">
                                        <div>
                                            <p className="font-medium">{b.name}</p>
                                            <p className="text-sm text-muted-foreground">{b.address}, {b.state}</p>
                                        </div>
                                        <div className="text-right text-sm">
                                            <p>{b.managerName}</p>
                                            <p className="text-muted-foreground">{b.managerPhone}</p>
                                        </div>
                                    </div>
                                ))}
                            </TabsContent>

                            <TabsContent value="review" className="mt-0 space-y-6">
                                {(isOpsStage || isRiskStage) ? (
                                    <>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold">Review Checklist</h4>
                                                <Badge>{isOpsStage ? 'OPS' : 'RISK'}</Badge>
                                            </div>
                                            <Card>
                                                <CardContent className="p-4 space-y-3">
                                                    {currentChecklist.map(item => (
                                                        <div key={item.id} className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={item.id}
                                                                checked={checklist[item.id] || false}
                                                                onCheckedChange={() => toggleCheck(item.id)}
                                                            />
                                                            <label htmlFor={item.id} className="text-sm font-medium leading-none cursor-pointer">
                                                                {item.label}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </CardContent>
                                            </Card>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Review Notes / Observations</Label>
                                            <Textarea
                                                value={notes}
                                                onChange={e => setNotes(e.target.value)}
                                                placeholder="Enter any findings, red flags, or approval comments..."
                                                className="min-h-[100px]"
                                            />
                                        </div>

                                        {!confirmAction ? (
                                            <div className="flex gap-4 pt-4">
                                                <Button
                                                    className="flex-1 bg-red-600 hover:bg-red-700"
                                                    onClick={() => handleAction('REJECT')}
                                                >
                                                    <XCircle className="w-4 h-4 mr-2" />
                                                    Reject Application
                                                </Button>
                                                <Button
                                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                                    onClick={() => handleAction('APPROVE')}
                                                    disabled={!allChecked}
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    Approve & Pass to {isOpsStage ? 'Risk' : 'Activation'}
                                                </Button>
                                            </div>
                                        ) : (
                                            <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto" />
                                            // Leaving confirm logic to main dialog for simplicity or inline
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-10 text-muted-foreground">
                                        This application is already {application.status}. No further review actions required.
                                    </div>
                                )}
                            </TabsContent>
                        </ScrollArea>

                    </Tabs>
                </div>

                {confirmAction && (
                    <div className="p-4 bg-muted/50 border-t flex flex-col items-center gap-2 animate-in slide-in-from-bottom-5">
                        <p className="font-medium">Confirm {confirmAction} decision?</p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setConfirmAction(null)}>Cancel</Button>
                            <Button size="sm" onClick={confirmSubmit} disabled={loading} variant={confirmAction === 'REJECT' ? 'destructive' : 'default'}>
                                {loading ? 'Processing...' : 'Confirm Decision'}
                            </Button>
                        </div>
                    </div>
                )}

                <DialogFooter className="px-6 py-4 border-t">
                    <Button variant="outline" onClick={onClose} disabled={loading}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
