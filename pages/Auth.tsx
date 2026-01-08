import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { View } from '../types';
import { Reveal } from '../components/UI/Reveal';

interface AuthProps {
    navigateTo: (view: View) => void;
}

const Auth: React.FC<AuthProps> = ({ navigateTo }) => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                setMessage({ type: 'success', text: 'Verifique seu email para confirmar o cadastro!' });
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                navigateTo('home');
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Ocorreu um erro.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-12">
            <Reveal width="fit-content">
                <div className="w-full max-w-md bg-white dark:bg-surface-dark p-10 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-black text-primary mb-2">
                            {isSignUp ? 'Criar Conta' : 'Bem-vindo'}
                        </h2>
                        <p className="text-gray-500">
                            {isSignUp ? 'Junte-se à nossa comunidade' : 'Entre para gerenciar seus pedidos'}
                        </p>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${message.type === 'success'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleAuth} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="seu@email.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Senha
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-4 bg-primary hover:bg-primary-dark text-black font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                        >
                            {loading ? 'Carregando...' : (isSignUp ? 'Cadastrar' : 'Entrar')}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-gray-500 hover:text-primary transition-colors text-sm font-medium"
                        >
                            {isSignUp
                                ? 'Já tem uma conta? Faça login'
                                : 'Não tem conta? Cadastre-se'}
                        </button>
                    </div>
                </div>
            </Reveal>
        </div>
    );
};

export default Auth;
