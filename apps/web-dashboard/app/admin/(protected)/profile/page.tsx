'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Mail, Shield } from "lucide-react";

export default function ProfilePage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Profile</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your admin account settings and preferences.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Your admin identity details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                            S
                        </div>
                        <div>
                            <p className="font-medium">Super Admin</p>
                            <p className="text-sm text-muted-foreground">superadmin@vistalock.com</p>
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Role</label>
                            <div className="flex items-center space-x-2 border p-2 rounded-md bg-muted/50">
                                <Shield className="h-4 w-4 text-primary" />
                                <span className="text-sm">SUPER_ADMIN</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <div className="flex items-center space-x-2 border p-2 rounded-md bg-muted/50">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">superadmin@vistalock.com</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
