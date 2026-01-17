import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { View } from '../types';
import { Reveal } from '../components/UI/Reveal';

interface AuthProps {
    navigateTo: (view: View) => void;
}

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset';

const Auth: React.FC<AuthProps> = ({ navigateTo }) => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [authMode, setAuthMode] = useState<AuthMode>('login');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    React.useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                setAuthMode('reset');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (authMode === 'signup') {
                if (password !== confirmPassword) {
                    throw new Error('As senhas não coincidem.');
                }

                if (password.length < 6) {
                    throw new Error('A senha deve ter pelo menos 6 caracteres.');
                }

                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            phone: phone,
                        }
                    }
                });
                if (error) throw error;
                setMessage({ type: 'success', text: 'Verifique seu email para confirmar o cadastro!' });
                setAuthMode('login');
            } else if (authMode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                navigateTo('home');
            } else if (authMode === 'forgot') {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}`,
                });
                if (error) throw error;
                setMessage({ type: 'success', text: 'Link de recuperação enviado para seu email!' });
            } else if (authMode === 'reset') {
                if (password !== confirmPassword) {
                    throw new Error('As senhas não coincidem.');
                }
                const { error } = await supabase.auth.updateUser({ password });
                if (error) throw error;
                setMessage({ type: 'success', text: 'Senha atualizada com sucesso! Você já pode entrar.' });
                setTimeout(() => {
                    setAuthMode('login');
                    setMessage(null);
                }, 2000);
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Ocorreu um erro.' });
        } finally {
            setLoading(false);
        }
    };

    const getTitleAndSubtitle = () => {
        switch (authMode) {
            case 'signup': return { title: 'Criar Conta', sub: 'Junte-se à nossa comunidade' };
            case 'forgot': return { title: 'Recuperar Senha', sub: 'Digite seu email para receber o link' };
            case 'reset': return { title: 'Nova Senha', sub: 'Defina sua nova senha de acesso' };
            default: return { title: 'Bem-vindo', sub: 'Entre para gerenciar seus pedidos' };
        }
    };

    const { title, sub } = getTitleAndSubtitle();

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-12">
            <Reveal width="fit-content">
                <div className="w-full max-w-md bg-white dark:bg-surface-dark p-10 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-black text-primary mb-2">{title}</h2>
                        <p className="text-gray-500">{sub}</p>
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
                        {authMode === 'signup' && (
                            <>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nome Completo</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        placeholder="Seu nome completo"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Telefone Celular</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        placeholder="(11) 99999-9999"
                                    />
                                </div>
                            </>
                        )}

                        {(authMode !== 'reset') && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="seu@email.com"
                                />
                            </div>
                        )}

                        {(authMode === 'login' || authMode === 'signup' || authMode === 'reset') && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    {authMode === 'reset' ? 'Nova Senha' : 'Senha'}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all pr-12"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors flex items-center justify-center p-1"
                                    >
                                        <span className="material-symbols-outlined text-xl">
                                            {showPassword ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {(authMode === 'signup' || authMode === 'reset') && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Confirmar Senha</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all pr-12"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors flex items-center justify-center p-1"
                                    >
                                        <span className="material-symbols-outlined text-xl">
                                            {showConfirmPassword ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {authMode === 'login' && (
                            <div className="text-right">
                                <button
                                    type="button"
                                    onClick={() => setAuthMode('forgot')}
                                    className="text-xs text-gray-400 hover:text-primary transition-colors"
                                >
                                    Esqueceu sua senha?
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-4 bg-primary hover:bg-primary-dark text-black font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                        >
                            {loading ? 'Carregando...' : (
                                authMode === 'signup' ? 'Cadastrar' :
                                    authMode === 'forgot' ? 'Enviar Link' :
                                        authMode === 'reset' ? 'Salvar Nova Senha' : 'Entrar'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center space-y-4">
                        {authMode !== 'reset' && (
                            <button
                                onClick={() => {
                                    setAuthMode(authMode === 'login' ? 'signup' : 'login');
                                    setMessage(null);
                                }}
                                className="text-gray-500 hover:text-primary transition-colors text-sm font-medium w-full"
                            >
                                {authMode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
                            </button>
                        )}
                        {authMode === 'forgot' && (
                            <button
                                onClick={() => setAuthMode('login')}
                                className="text-primary hover:underline text-sm font-bold block w-full"
                            >
                                Voltar para o login
                            </button>
                        )}
                    </div>
                </div>
            </Reveal>
        </div>
    );
};

export default Auth;
