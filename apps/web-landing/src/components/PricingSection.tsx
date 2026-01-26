import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const plans = [
    {
        name: "Starter",
        price: "₦15,000",
        description: "Perfect for small retailers starting out.",
        features: [
            "Up to 20 Devices",
            "Manual Loan Approvals",
            "Basic Dashboard",
            "Standard Device Locking",
            "Email Support"
        ],
        cta: "Get Started",
        popular: false
    },
    {
        name: "Growth",
        price: "₦45,000",
        description: "For scaling businesses with active sales.",
        features: [
            "Up to 200 Devices",
            "Bulk Device Upload",
            "Auto-lock Rules",
            "API Access",
            "Priority Support"
        ],
        cta: "Start Free Trial",
        popular: true
    },
    {
        name: "Enterprise",
        price: "Custom",
        description: "For large chains and financing partners.",
        features: [
            "Unlimited Devices",
            "Custom Branding (White-label)",
            "Dedicated Account Manager",
            "Custom SLA",
            "On-premise Deployment Options"
        ],
        cta: "Contact Sales",
        popular: false
    }
];

export function PricingSection() {
    return (
        <section id="pricing" className="py-24">
            <div className="container mx-auto max-w-7xl px-4 md:px-6">
                <div className="flex flex-col items-center justify-center text-center space-y-4 mb-16">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Simple, Transparent Pricing</h2>
                    <p className="max-w-[700px] text-muted-foreground md:text-xl">
                        Choose the plan that fits your business stage. No hidden fees.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, index) => (
                        <Card key={index} className={`flex flex-col ${plan.popular ? 'border-primary shadow-lg scale-105 relative' : ''}`}>
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full flex justify-center">
                                    <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase">
                                        Most Popular
                                    </span>
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                <CardDescription>{plan.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="mb-6">
                                    <span className="text-4xl font-bold">{plan.price}</span>
                                    {plan.price !== "Custom" && <span className="text-muted-foreground">/month</span>}
                                </div>
                                <ul className="space-y-3">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center text-sm">
                                            <Check className="w-4 h-4 text-green-500 mr-2 shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                                    {plan.cta}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
