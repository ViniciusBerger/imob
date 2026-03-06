import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
    user: any | null;
    token: string | null;
    login: (token: string, userData: any) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<any | null>(null);
    const [token, setToken] = useState<string | null>(sessionStorage.getItem('token'));

    useEffect(() => {
        // Clear legacy localStorage to ensure clean state
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Hydrate state from sessionStorage on boot
        const storedToken = sessionStorage.getItem('token');
        const storedUser = sessionStorage.getItem('user');

        if (storedToken) {
            setToken(storedToken);
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    console.error("Failed to parse user data", e);
                }
            }
        }
    }, []);

    const login = (newToken: string, userData: any) => {
        sessionStorage.setItem('token', newToken);
        sessionStorage.setItem('user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
    };

    const logout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
