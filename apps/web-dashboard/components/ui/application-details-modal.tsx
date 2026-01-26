
'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area";

interface ApplicationDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    application: any | null;
}

export function ApplicationDetailsModal({ isOpen, onClose, application }: ApplicationDetailsModalProps) {
    if (!application) return null;

    const sections = [
        {
            title: "Business Info",
            data: {
                "Legal Name": application.businessName,
                "Trading Name": application.tradingName,
                "Type": application.businessType,
                "CAC": application.cacNumber,
                "Incorporated": application.dateOfIncorporation ? new Date(application.dateOfIncorporation).toLocaleDateString() : 'N/A',
                "Nature": application.natureOfBusiness,
                "Website": application.website
            }
        },
        {
            title: "Contact & Address",
            data: {
                "Contact Person": application.contactName,
                "Email": application.email,
                "Phone": application.phone,
                "Registered Address": application.businessAddress,
                "Operating Address": application.operatingAddress
            }
        },
        {
            title: "Bank Details",
            data: application.bankDetails // Assuming straight object
        },
        {
            title: "Operations",
            data: application.operations
        }
    ];

    const renderData = (data: any) => {
        if (!data) return <span className="text-muted-foreground">N/A</span>;
        return Object.entries(data).map(([key, value]) => (
            <div key={key} className="grid grid-cols-3 py-1 border-b last:border-0 border-gray-100">
                <span className="font-medium text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className="col-span-2 text-sm">{typeof value === 'object' ? JSON.stringify(value) : String(value || 'N/A')}</span>
            </div>
        ));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl bg-white max-h-[85vh]">
                <DialogHeader>
                    <DialogTitle>Application Details</DialogTitle>
                    <DialogDescription>
                        Reviewing application for <span className="font-semibold text-black">{application.businessName}</span>
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="flex-1 pr-4 h-[60vh] overflow-y-auto">
                    <div className="space-y-6">
                        {sections.map((section) => (
                            <div key={section.title} className="space-y-2">
                                <h3 className="font-semibold text-lg border-b pb-1">{section.title}</h3>
                                <div className="bg-gray-50 p-3 rounded-md">
                                    {renderData(section.data)}
                                </div>
                            </div>
                        ))}

                        {/* Arrays like Directors */}
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg border-b pb-1">Directors</h3>
                            <div className="space-y-2">
                                {application.directors && Array.isArray(application.directors) ? application.directors.map((d: any, i: number) => (
                                    <div key={i} className="bg-gray-50 p-3 rounded-md">
                                        <p className="font-bold text-sm">#{i + 1} {d.name}</p>
                                        {renderData(d)}
                                    </div>
                                )) : <p className="text-sm text-muted-foreground">No director info</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg border-b pb-1">Compliance</h3>
                            <div className="bg-gray-50 p-3 rounded-md">
                                {renderData(application.compliance)}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
                <div className="flex justify-end pt-4">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
