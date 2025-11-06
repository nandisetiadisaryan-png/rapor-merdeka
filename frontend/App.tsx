

import React from 'react';
import { DataProvider, useData } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
// Fix: Correct import paths
import LoginPage from './components/auth/LoginPage';
import Dashboard from './components/layout/Dashboard';

const AppContent: React.FC = () => {
    const { user } = useAuth();
    const { isLoading } = useData();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-100">
                <div className="text-xl font-semibold text-gray-700">Memuat data...</div>
            </div>
        );
    }

    return (
        <div className="bg-slate-100 min-h-screen">
            {user ? <Dashboard /> : <LoginPage />}
        </div>
    );
};

const App: React.FC = () => {
    return (
        <DataProvider>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </DataProvider>
    );
};

export default App;