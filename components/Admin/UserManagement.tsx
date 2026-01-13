import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Profile } from '../../types';

interface UserManagementProps {
    currentUserProfile: Profile | null;
}

export const UserManagement: React.FC<UserManagementProps> = ({ currentUserProfile }) => {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setUsers(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handlePromoteToAdmin = async (userId: string) => {
        if (!window.confirm('Tem certeza que deseja promover este usuário a administrador?')) {
            return;
        }

        setActionLoading(userId);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: 'admin' })
                .eq('id', userId);

            if (error) throw error;

            alert('Usuário promovido a administrador com sucesso!');
            fetchUsers();
        } catch (error) {
            console.error('Error promoting user:', error);
            alert('Erro ao promover usuário. Verifique as permissões.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDemoteToCustomer = async (userId: string) => {
        if (!window.confirm('Tem certeza que deseja remover privilégios de administrador deste usuário?')) {
            return;
        }

        // Prevent demoting yourself
        if (userId === currentUserProfile?.id) {
            alert('Você não pode remover seus próprios privilégios de administrador.');
            return;
        }

        setActionLoading(userId);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: 'customer' })
                .eq('id', userId);

            if (error) throw error;

            alert('Privilégios de administrador removidos com sucesso!');
            fetchUsers();
        } catch (error) {
            console.error('Error demoting user:', error);
            alert('Erro ao remover privilégios. Verifique as permissões.');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider dark:text-white">Usuário</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider dark:text-white">Email</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider dark:text-white">Role</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider dark:text-white text-center">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {users.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                Nenhum usuário encontrado.
                            </td>
                        </tr>
                    ) : (
                        users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 bg-primary/20 rounded-full flex items-center justify-center">
                                            <span className="material-symbols-outlined text-primary">person</span>
                                        </div>
                                        <div>
                                            <div className="font-bold dark:text-white">
                                                {user.full_name || 'Sem nome'}
                                            </div>
                                            {user.id === currentUserProfile?.id && (
                                                <span className="text-xs text-primary font-bold">(Você)</span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {user.phone || 'Não informado'}
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-black uppercase ${user.role === 'master_admin'
                                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                            : user.role === 'admin'
                                                ? 'bg-primary/20 text-primary'
                                                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                            }`}
                                    >
                                        {user.role === 'master_admin' ? 'Master Admin' : user.role === 'admin' ? 'Administrador' : 'Cliente'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-center gap-2">
                                        {user.role === 'customer' ? (
                                            <button
                                                onClick={() => handlePromoteToAdmin(user.id)}
                                                disabled={actionLoading === user.id}
                                                className="px-4 py-2 bg-primary hover:bg-primary-dark text-black text-xs font-bold rounded-lg transition-all disabled:opacity-50 flex items-center gap-1"
                                            >
                                                <span className="material-symbols-outlined text-sm">
                                                    {actionLoading === user.id ? 'sync' : 'admin_panel_settings'}
                                                </span>
                                                {actionLoading === user.id ? 'Promovendo...' : 'Promover a Admin'}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleDemoteToCustomer(user.id)}
                                                disabled={actionLoading === user.id || user.id === currentUserProfile?.id || user.role === 'master_admin'}
                                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold rounded-lg transition-all disabled:opacity-50 flex items-center gap-1"
                                                title={
                                                    user.id === currentUserProfile?.id
                                                        ? 'Você não pode remover seus próprios privilégios'
                                                        : user.role === 'master_admin'
                                                            ? 'Não é possível remover privilégios de um Master Admin'
                                                            : ''
                                                }
                                            >
                                                <span className="material-symbols-outlined text-sm">
                                                    {actionLoading === user.id ? 'sync' : 'person_remove'}
                                                </span>
                                                {actionLoading === user.id ? 'Removendo...' : 'Remover Admin'}
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};
