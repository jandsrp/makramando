import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { View } from '../types';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    requireAdmin?: boolean;
    redirectTo?: View;
    onRedirect?: (view: View) => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requireAuth = false,
    requireAdmin = false,
    redirectTo = 'home',
    onRedirect,
}) => {
    const { session, isAdmin, isLoading } = useAuth();

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="size-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Check authentication requirement
    if (requireAuth && !session) {
        if (onRedirect) {
            onRedirect('auth');
        }
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
                <div className="size-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 mb-6">
                    <span className="material-symbols-outlined text-4xl">lock</span>
                </div>
                <h2 className="text-3xl font-black dark:text-white mb-4">Acesso Restrito</h2>
                <p className="text-gray-500 text-center max-w-md mb-6">
                    Você precisa estar logado para acessar esta página.
                </p>
                <button
                    onClick={() => onRedirect && onRedirect('auth')}
                    className="bg-primary hover:bg-primary-dark text-black font-bold py-3 px-8 rounded-xl shadow-lg"
                >
                    Fazer Login
                </button>
            </div>
        );
    }

    // Check admin requirement
    if (requireAdmin && !isAdmin) {
        if (onRedirect) {
            onRedirect(redirectTo);
        }
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
                <div className="size-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-500 mb-6">
                    <span className="material-symbols-outlined text-4xl">block</span>
                </div>
                <h2 className="text-3xl font-black dark:text-white mb-4">Acesso Negado</h2>
                <p className="text-gray-500 text-center max-w-md mb-6">
                    Você não tem permissão para acessar esta página. Apenas administradores podem visualizar este conteúdo.
                </p>
                <button
                    onClick={() => onRedirect && onRedirect('home')}
                    className="bg-primary hover:bg-primary-dark text-black font-bold py-3 px-8 rounded-xl shadow-lg"
                >
                    Voltar para Home
                </button>
            </div>
        );
    }

    // Render children if all checks pass
    return <>{children}</>;
};
