import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Check } from "lucide-react";

export function HeroSection() {
    return (
        <section className="pt-24 pb-12 md:pt-32 md:pb-24 overflow-hidden">
            <div className="container mx-auto max-w-7xl px-4 md:px-6">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 space-y-6">
                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20">
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            Secure Device Control
                        </div>
                        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
                            Sell Devices. <br />
                            Get <span className="text-primary bg-primary/10 px-3 py-1 rounded-lg">Paid</span>. <br />
                            Stay in Control.
                        </h1>
                        <p className="max-w-[600px] text-muted-foreground md:text-xl">
                            The complete BNPL & Device Locking platform for Nigerian merchants.
                            Automate repayments, secure your inventory, and build credit for your customers.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button asChild size="lg" className="w-full sm:w-auto">
                                <Link href="http://localhost:3004/register">
                                    Start Selling <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                                <Link href="#features">Learn More</Link>
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Trusted by leading retailers. NDPR Compliant.
                        </p>
                    </div>
                    {/* Visual Placeholder for Device Mockup */}
                    <div className="flex-1 relative w-full aspect-square md:aspect-auto md:h-[600px] bg-gradient-to-tr from-primary/5 to-transparent rounded-[3rem] border border-border/50 flex items-center justify-center p-8">
                        <div className="text-center p-8">
                            <div className="w-64 h-[500px] bg-black rounded-[3rem] border-8 border-gray-800 mx-auto shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
                                {/* Screen Content */}
                                <div className="absolute inset-0 bg-background flex flex-col items-center justify-center p-8 text-center space-y-6">
                                    <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-2">
                                        <ShieldCheck className="w-10 h-10 text-primary" />
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-bold text-2xl tracking-tight">Smart Device Financing</h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed">
                                            Empowering merchants to sell devices on credit with confidence.
                                        </p>
                                    </div>

                                    <div className="w-full bg-muted/30 rounded-xl p-4 text-left space-y-3">
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                                <Check className="w-3 h-3 text-green-600" />
                                            </div>
                                            <span className="font-medium">Automated Locking</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                                <Check className="w-3 h-3 text-green-600" />
                                            </div>
                                            <span className="font-medium">Easy Repayments</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                                <Check className="w-3 h-3 text-green-600" />
                                            </div>
                                            <span className="font-medium">Risk-Free Sales</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
