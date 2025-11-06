import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User } from '../types';
import { useData } from './DataContext';

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const { users } = useData();

    const login = (username: string, password: string) => {
        const foundUser = users.find(u => u.username === username && u.password === password);
        if (foundUser) {
            setUser(foundUser);
        } else {
            alert('Username atau password salah');
        }
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};