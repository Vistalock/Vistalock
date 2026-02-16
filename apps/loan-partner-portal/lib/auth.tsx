"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { api } from "@/lib/api";

interface LoanPartner {
    id: string;
    name: string;
    merchantId: string;
    merchantName: string;
}

interface AuthContextType {
    user: LoanPartner | null;
    loading: boolean;
    login: (token: string, partner: LoanPartner) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<LoanPartner | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedPartner = localStorage.getItem("partner");

        if (token && storedPartner) {
            try {
                const decoded = jwtDecode<any>(token);
                if (decoded.exp * 1000 > Date.now()) {
                    setUser(JSON.parse(storedPartner));
                } else {
                    localStorage.removeItem("token");
                    localStorage.removeItem("partner");
                }
            } catch {
                localStorage.removeItem("token");
                localStorage.removeItem("partner");
            }
        }
        setLoading(false);
    }, []);

    const login = (token: string, partner: LoanPartner) => {
        localStorage.setItem("token", token);
        localStorage.setItem("partner", JSON.stringify(partner));
        setUser(partner);
        router.push("/dashboard");
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("partner");
        setUser(null);
        router.push("/login"); // Redirect to login page
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            logout,
            isAuthenticated: !!user
        }
        }>
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
