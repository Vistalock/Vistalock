import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container mx-auto max-w-7xl flex h-16 items-center px-4">
                <div className="mr-8 flex items-center space-x-2">
                    <span className="text-xl font-bold text-primary tracking-tight">VISTALOCK</span>
                </div>
                <div className="flex-1 flex justify-end space-x-4">
                    <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors py-2">
                        Features
                    </Link>
                    <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors py-2">
                        Pricing
                    </Link>
                    <Button asChild variant="outline" size="sm" className="mr-2">
                        <Link href="/apply">Become a Merchant</Link>
                    </Button>
                    <Button asChild variant="default" size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                        <Link href="http://localhost:3004/login">Merchant Login</Link>
                    </Button>
                </div>
            </div>
        </nav>
    );
}
