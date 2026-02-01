
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, MapPin, Store } from 'lucide-react';
import { StepProps, BranchData } from './types';

export default function Step3_Branches({ formData, updateForm, onNext, onBack }: StepProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [newBranch, setNewBranch] = useState<Partial<BranchData>>({});
    const [error, setError] = useState("");

    const handleAddBranch = () => {
        // Validation
        if (!newBranch.name || !newBranch.address || !newBranch.state || !newBranch.managerName || !newBranch.managerPhone) {
            setError("All fields are required");
            return;
        }

        const branch: BranchData = {
            id: Date.now().toString(),
            name: newBranch.name,
            address: newBranch.address,
            state: newBranch.state,
            managerName: newBranch.managerName,
            managerPhone: newBranch.managerPhone,
            operatingHours: newBranch.operatingHours || "9am - 5pm" // Default
        };

        const updatedBranches = [...(formData.branches || []), branch];
        updateForm('branches', updatedBranches);

        // Reset
        setNewBranch({});
        setIsAdding(false);
        setError("");
    };

    const removeBranch = (id: string) => {
        const updatedBranches = formData.branches.filter(b => b.id !== id);
        updateForm('branches', updatedBranches);
    };

    const handleNext = () => {
        if (!formData.branches || formData.branches.length === 0) {
            setError("You must add at least one branch/store.");
            return;
        }
        onNext?.();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">5. Store / Branch Network</h3>
                {!isAdding && (
                    <Button onClick={() => setIsAdding(true)} size="sm" className="gap-2">
                        <Plus className="h-4 w-4" /> Add Branch
                    </Button>
                )}
            </div>

            {/* List of Branches */}
            <div className="space-y-4">
                {formData.branches && formData.branches.length > 0 ? (
                    formData.branches.map((branch, index) => (
                        <Card key={branch.id} className="relative">
                            <CardHeader className="py-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Store className="h-4 w-4 text-primary" />
                                    {branch.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="py-3 text-sm space-y-1">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    {branch.address}, {branch.state}
                                </div>
                                <div><span className="font-semibold">Manager:</span> {branch.managerName} ({branch.managerPhone})</div>
                                <div><span className="font-semibold">Hours:</span> {branch.operatingHours}</div>
                            </CardContent>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 text-muted-foreground hover:text-red-500"
                                onClick={() => removeBranch(branch.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </Card>
                    ))
                ) : (
                    !isAdding && (
                        <div className="text-center p-8 border-2 border-dashed rounded-lg text-muted-foreground">
                            No branches added yet. Please add your primary operating location.
                        </div>
                    )
                )}
            </div>

            {/* Add Branch Form */}
            {isAdding && (
                <Card className="border-primary/50 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="text-base">New Branch Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Branch Name</Label>
                                <Input
                                    value={newBranch.name || ''}
                                    onChange={e => setNewBranch({ ...newBranch, name: e.target.value })}
                                    placeholder="e.g. Ikeja Main Store"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>State</Label>
                                <Input
                                    value={newBranch.state || ''}
                                    onChange={e => setNewBranch({ ...newBranch, state: e.target.value })}
                                    placeholder="e.g. Lagos"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Full Address</Label>
                            <Input
                                value={newBranch.address || ''}
                                onChange={e => setNewBranch({ ...newBranch, address: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Manager Name</Label>
                                <Input
                                    value={newBranch.managerName || ''}
                                    onChange={e => setNewBranch({ ...newBranch, managerName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Manager Phone</Label>
                                <Input
                                    value={newBranch.managerPhone || ''}
                                    onChange={e => setNewBranch({ ...newBranch, managerPhone: e.target.value })}
                                    placeholder="080..."
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Operating Hours</Label>
                            <Input
                                value={newBranch.operatingHours || ''}
                                onChange={e => setNewBranch({ ...newBranch, operatingHours: e.target.value })}
                                placeholder="e.g. Mon-Sat, 9am - 6pm"
                            />
                        </div>

                        {error && <p className="text-sm text-red-500">{error}</p>}

                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
                            <Button onClick={handleAddBranch}>Save Branch</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {error && !isAdding && <p className="text-sm text-center text-red-500">{error}</p>}

            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={onBack} disabled={isAdding}>Back</Button>
                <Button onClick={handleNext} disabled={isAdding}>Next Step</Button>
            </div>
        </div>
    );
}
