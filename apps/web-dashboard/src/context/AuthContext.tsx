"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { jwtDecode } from "jwt-decode";

interface User {
    userId: string;
    email: string;
    role: string;
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

    useEffect(() => {
        // Check initial token
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode<any>(token);
                // Only valid if exp is not reached
                if (decoded.exp * 1000 > Date.now()) {
                    setUser({
                        userId: decoded.sub,
                        email: decoded.email,
                        role: decoded.role || 'MERCHANT'
                    });
                } else {
                    localStorage.removeItem("token");
                }
            } catch (e) {
                localStorage.removeItem("token");
            }
        }
        setLoading(false);
    }, []);

    const login = (token: string) => {
        localStorage.setItem("token", token);
        const decoded = jwtDecode<any>(token);
        setUser({
            userId: decoded.sub,
            email: decoded.email,
            role: decoded.role || 'MERCHANT'
        });
        router.push("/dashboard");
    };

    const logout = () => {
        localStorage.removeItem("token");
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
