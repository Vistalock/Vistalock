
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { StepProps } from './types';

const CATEGORIES = [
    "Android Smartphones", "iPhones", "Tablets / iPads",
    "Laptops (Mac/Windows)", "Game Consoles", "Smartwatches",
    "Accessories"
];

export default function Step4_Products({ formData, updateForm, onNext, onBack }: StepProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    const productData = formData.productDeclaration || {
        categories: [],
        brands: [],
        minPrice: '',
        maxPrice: '',
        monthlyVolume: '',
        condition: 'NEW'
    };

    const updateProduct = (key: string, value: any) => {
        updateForm('productDeclaration', {
            ...productData,
            [key]: value
        });
    };

    const toggleCategory = (cat: string) => {
        const current = productData.categories || [];
        if (current.includes(cat)) {
            updateProduct('categories', current.filter(c => c !== cat));
        } else {
            updateProduct('categories', [...current, cat]);
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!productData.categories || productData.categories.length === 0) newErrors.categories = "Select at least one category";
        if (!productData.brands || productData.brands.length === 0) newErrors.brands = "List major brands sold";
        if (!productData.minPrice) newErrors.minPrice = "Required";
        if (!productData.maxPrice) newErrors.maxPrice = "Required";
        if (!productData.monthlyVolume) newErrors.monthlyVolume = "Required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validate()) {
            onNext?.();
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium">6. Product & Device Declaration</h3>

            <div className="space-y-3">
                <Label>Device Categories Sold <span className="text-red-500">*</span></Label>
                <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map(cat => (
                        <div key={cat} className="flex items-center space-x-2">
                            <Checkbox
                                id={cat}
                                checked={productData.categories?.includes(cat)}
                                onCheckedChange={() => toggleCategory(cat)}
                            />
                            <label htmlFor={cat} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {cat}
                            </label>
                        </div>
                    ))}
                </div>
                {errors.categories && <p className="text-xs text-red-500">{errors.categories}</p>}
            </div>

            <div className="space-y-3 pt-2">
                <Label>Device Condition <span className="text-red-500">*</span></Label>
                <RadioGroup
                    value={productData.condition}
                    onValueChange={(val: 'NEW' | 'REFURB' | 'BOTH') => updateProduct('condition', val)}
                    className="flex flex-col space-y-1"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="NEW" id="new" />
                        <Label htmlFor="new">Brand New Only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="REFURB" id="refurb" />
                        <Label htmlFor="refurb">Used / Refurbished Only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="BOTH" id="both" />
                        <Label htmlFor="both">Both New & Used</Label>
                    </div>
                </RadioGroup>
            </div>

            <div className="space-y-2">
                <Label>Major Brands Sold</Label>
                <Input
                    value={Array.isArray(productData.brands) ? productData.brands.join(', ') : productData.brands}
                    onChange={e => updateProduct('brands', e.target.value.split(',').map(s => s.trim()))}
                    placeholder="e.g. Samsung, Apple, Tecno, Infinix (Comma separated)"
                    className={errors.brands ? "border-red-500" : ""}
                />
                {errors.brands && <p className="text-xs text-red-500">{errors.brands}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label>Min Device Price (₦)</Label>
                    <Input
                        type="number"
                        value={productData.minPrice}
                        onChange={e => updateProduct('minPrice', e.target.value)}
                        placeholder="50000"
                        className={errors.minPrice ? "border-red-500" : ""}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Max Device Price (₦)</Label>
                    <Input
                        type="number"
                        value={productData.maxPrice}
                        onChange={e => updateProduct('maxPrice', e.target.value)}
                        placeholder="2000000"
                        className={errors.maxPrice ? "border-red-500" : ""}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Average Monthly Sales Volume (Units)</Label>
                <Select
                    value={productData.monthlyVolume}
                    onValueChange={val => updateProduct('monthlyVolume', val)}
                >
                    <SelectTrigger className={errors.monthlyVolume ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select Volume" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="0-10">0 - 10 Units</SelectItem>
                        <SelectItem value="11-50">11 - 50 Units</SelectItem>
                        <SelectItem value="51-100">51 - 100 Units</SelectItem>
                        <SelectItem value="101-500">101 - 500 Units</SelectItem>
                        <SelectItem value="500+">500+ Units</SelectItem>
                    </SelectContent>
                </Select>
                {errors.monthlyVolume && <p className="text-xs text-red-500">{errors.monthlyVolume}</p>}
            </div>

            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={onBack}>Back</Button>
                <Button onClick={handleNext}>Next Step</Button>
            </div>
        </div>
    );
}

// Helper imports hook
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
