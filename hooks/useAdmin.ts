import { useAuth } from './useAuth';

export const useAdmin = () => {
    const { isAdmin, isMasterAdmin, isLoading, session } = useAuth();

    return {
        isAdmin,
        isMasterAdmin,
        isLoading,
        isAuthenticated: !!session,
    };
};
