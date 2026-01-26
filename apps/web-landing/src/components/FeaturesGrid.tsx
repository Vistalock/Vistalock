import { Lock, CreditCard, Activity, Smartphone, Shield, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
    {
        title: "Device Locking",
        description: "Automatically lock devices when payments are overdue. Remote control via API or Dashboard.",
        icon: Lock,
    },
    {
        title: "Credit Building",
        description: "Help your customers build verifiable credit history with every successful repayment.",
        icon: Activity,
    },
    {
        title: "Real-time Monitoring",
        description: "Track location, connectivity, and payment status of your entire fleet in real-time.",
        icon: Smartphone,
    },
    {
        title: "Flexible Repayment",
        description: "Set custom installment schedules (Weekly, Monthly) that fit your customers' income.",
        icon: CreditCard,
    },
    {
        title: "Bank-Grade Security",
        description: "NDPR compliant data handling and secure payment processing via Paystack/Flutterwave.",
        icon: Shield,
    },
    {
        title: "Merchant Dashboard",
        description: "A unified view for all your loans, devices, and financial reports.",
        icon: Users,
    },
];

export function FeaturesGrid() {
    return (
        <section id="features" className="py-24 bg-muted/50">
            <div className="container mx-auto max-w-7xl px-4 md:px-6">
                <div className="flex flex-col items-center justify-center text-center space-y-4 mb-16">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Features that protect your revenue</h2>
                    <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        VistaLock gives you the tools to sell confidently on credit, minimizing risk and maximizing collection rates.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <Card key={index} className="bg-background border-none shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                            <CardHeader>
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                                    <feature.icon className="w-7 h-7 text-primary" />
                                </div>
                                <CardTitle className="text-xl">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground leading-relaxed">
                                    {feature.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
