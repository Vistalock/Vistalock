/* eslint-disable */
'use client';

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

export default function SearchPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q');

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Search Results</h3>
                <p className="text-sm text-muted-foreground">
                    Showing results for <span className="font-bold">"{query || '...'}"</span>
                </p>
            </div>

            <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg border-dashed">
                <div className="bg-muted p-4 rounded-full mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg">No results found</h3>
                <p className="text-muted-foreground text-sm max-w-sm mt-2">
                    Global search is currently indexing. Access individual Merchant or Device pages to find specific records.
                </p>
            </div>
        </div>
    );
}
