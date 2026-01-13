import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { Profile } from '../types';

export interface AuthState {
    session: Session | null;
    profile: Profile | null;
    isAdmin: boolean;
    isLoading: boolean;
}

export const useAuth = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            if (session?.user) {
                setIsLoading(true);
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (!error && data) {
                    setProfile(data);
                } else {
                    setProfile(null);
                }
                setIsLoading(false);
            } else {
                setProfile(null);
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [session]);

    const isAdmin = profile?.role === 'admin';

    return {
        session,
        profile,
        isAdmin,
        isLoading,
    };
};
