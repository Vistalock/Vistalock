"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { jwtDecode } from "jwt-decode";

interface User {
    userId: string;
    email: string;
    role: string;
    tenantId?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchProfile = async () => {
        try {
            // Try to get profile (relies on cookie)
            const { data } = await api.get("/auth/profile");
            setUser({
                userId: data.userId || data.sub, // Adjust based on profile endpoint response
                email: data.email,
                role: data.role,
                tenantId: data.tenantId
            });
        } catch (error) {
            console.log("Not authenticated or session expired");
            setUser(null);
            // Optionally try /auth/refresh here if profile fails but refresh might work?
            // But usually profile endpoint should just work if cookie is valid.
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const login = async (loginResponse: any) => {
        // loginResponse contains { role, tenantId } (from controller)
        // We need to fetch full profile or just trust the response + maybe userId if returned
        // Let's refetch profile to be sure and get full user object
        await fetchProfile();
        router.push("/dashboard");
    };

    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (e) {
            console.error("Logout failed", e);
        }
        setUser(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
