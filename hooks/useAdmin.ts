import { useAuth } from './useAuth';

export const useAdmin = () => {
    const { isAdmin, isLoading, session } = useAuth();

    return {
        isAdmin,
        isLoading,
        isAuthenticated: !!session,
    };
};
