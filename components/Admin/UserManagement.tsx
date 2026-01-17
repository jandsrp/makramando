import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Profile } from '../../types';

interface UserManagementProps {
    currentUserProfile: Profile | null;
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ currentUserProfile, showToast }) => {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const [editingUser, setEditingUser] = useState<Profile | null>(null);
    const [registrationLoading, setRegistrationLoading] = useState(false);
    const [registrationData, setRegistrationData] = useState({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        role: 'admin' as 'admin' | 'master_admin' | 'customer'
    });
    const [showPassword, setShowPassword] = useState(false);

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

            showToast('Usuário promovido a administrador!', 'success');
            fetchUsers();
        } catch (error) {
            console.error('Error promoting user:', error);
            showToast('Erro ao promover usuário.', 'error');
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
            showToast('Você não pode remover seus próprios privilégios.', 'error');
            return;
        }

        setActionLoading(userId);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: 'customer' })
                .eq('id', userId);

            if (error) throw error;

            showToast('Privilégios removidos com sucesso!', 'success');
            fetchUsers();
        } catch (error) {
            console.error('Error demoting user:', error);
            showToast('Erro ao remover privilégios.', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRegisterUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setRegistrationLoading(true);

        try {
            const payload = {
                ...registrationData,
                action: editingUser ? 'update' : 'create',
                userId: editingUser?.id
            };

            const { data, error } = await supabase.functions.invoke('admin-create-user', {
                body: payload
            });

            if (error) throw error;

            showToast(editingUser ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!', 'success');
            setIsRegistering(false);
            setEditingUser(null);
            setRegistrationData({
                full_name: '',
                email: '',
                phone: '',
                password: '',
                role: 'admin'
            });
            fetchUsers();
        } catch (error: any) {
            console.error('Error managing user:', error);
            showToast(error.message || 'Erro desconhecido', 'error');
        } finally {
            setRegistrationLoading(false);
        }
    };

    const handleDeleteUser = async (user: Profile) => {
        if (!window.confirm(`Deseja realmente excluir o usuário ${user.full_name}? Esta ação não pode ser desfeita.`)) {
            return;
        }

        setActionLoading(user.id);
        try {
            const { error } = await supabase.functions.invoke('admin-create-user', {
                body: { action: 'delete', userId: user.id }
            });

            if (error) throw error;

            showToast('Usuário excluído com sucesso!', 'success');
            fetchUsers();
        } catch (error: any) {
            console.error('Error deleting user:', error);
            showToast(`Erro ao excluir usuário: ${error.message}`, 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleEditUser = (user: Profile) => {
        setEditingUser(user);
        setRegistrationData({
            full_name: user.full_name || '',
            email: user.email || '',
            phone: user.phone || '',
            password: '', // Keep empty for updates unless user wants to change
            role: user.role as any
        });
        setIsRegistering(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center px-6 pt-6">
                <h3 className="text-xl font-bold dark:text-white">Gerenciamento de Usuários</h3>
                {currentUserProfile?.role === 'master_admin' && (
                    <button
                        onClick={() => { setEditingUser(null); setRegistrationData({ full_name: '', email: '', phone: '', password: '', role: 'admin' }); setIsRegistering(true); }}
                        className="bg-primary hover:bg-primary-dark text-black font-bold py-2 px-6 rounded-xl flex items-center gap-2 shadow-lg transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined">person_add</span>
                        Novo Usuário
                    </button>
                )}
            </div>

            {/* Registration Modal */}
            {isRegistering && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black dark:text-white">
                                    {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                                </h2>
                                <button onClick={() => { setIsRegistering(false); setEditingUser(null); }} className="text-gray-400 hover:text-red-500 transition-colors">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <form onSubmit={handleRegisterUser} className="space-y-4">
                                <label className="flex flex-col gap-1">
                                    <span className="text-xs font-bold uppercase tracking-wider dark:text-white">Nome Completo</span>
                                    <input
                                        required
                                        className="form-input rounded-xl border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-white p-3 border focus:border-primary outline-none"
                                        placeholder="ex: João Silva"
                                        value={registrationData.full_name}
                                        onChange={e => setRegistrationData({ ...registrationData, full_name: e.target.value })}
                                    />
                                </label>

                                <label className="flex flex-col gap-1">
                                    <span className="text-xs font-bold uppercase tracking-wider dark:text-white">Email</span>
                                    <input
                                        required
                                        type="email"
                                        className="form-input rounded-xl border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-white p-3 border focus:border-primary outline-none"
                                        placeholder="email@exemplo.com"
                                        value={registrationData.email}
                                        onChange={e => setRegistrationData({ ...registrationData, email: e.target.value })}
                                    />
                                </label>

                                <label className="flex flex-col gap-1">
                                    <span className="text-xs font-bold uppercase tracking-wider dark:text-white">Telefone</span>
                                    <input
                                        className="form-input rounded-xl border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-white p-3 border focus:border-primary outline-none"
                                        placeholder="(11) 99999-9999"
                                        value={registrationData.phone}
                                        onChange={e => setRegistrationData({ ...registrationData, phone: e.target.value })}
                                    />
                                </label>

                                <label className="flex flex-col gap-1">
                                    <span className="text-xs font-bold uppercase tracking-wider dark:text-white">
                                        {editingUser ? 'Senha (deixe em branco para não alterar)' : 'Senha Temporária'}
                                    </span>
                                    <div className="relative">
                                        <input
                                            required={!editingUser}
                                            type={showPassword ? "text" : "password"}
                                            minLength={6}
                                            className="form-input rounded-xl border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-white p-3 border focus:border-primary outline-none w-full pr-12"
                                            placeholder={editingUser ? '••••••' : 'Mínimo 6 caracteres'}
                                            value={registrationData.password}
                                            onChange={e => setRegistrationData({ ...registrationData, password: e.target.value })}
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
                                </label>

                                <label className="flex flex-col gap-1">
                                    <span className="text-xs font-bold uppercase tracking-wider dark:text-white">Tipo de Acesso</span>
                                    <select
                                        className="form-select rounded-xl border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-white p-3 border focus:border-primary outline-none"
                                        value={registrationData.role}
                                        onChange={e => setRegistrationData({ ...registrationData, role: e.target.value as any })}
                                    >
                                        <option value="customer">Cliente</option>
                                        <option value="admin">Administrador</option>
                                        <option value="master_admin">Master Admin</option>
                                    </select>
                                </label>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => { setIsRegistering(false); setEditingUser(null); }}
                                        className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={registrationLoading}
                                        className="flex-1 py-3 px-4 rounded-xl font-bold bg-primary hover:bg-primary-dark text-black shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {registrationLoading && <span className="size-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>}
                                        {registrationLoading ? (editingUser ? 'Salvando...' : 'Cadastrando...') : (editingUser ? 'Salvar Alterações' : 'Cadastrar')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto px-6 pb-6">
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
                                        {user.email || 'Sem email'}
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
                                            <button
                                                onClick={() => handleEditUser(user)}
                                                className="p-2 text-gray-400 hover:text-primary transition-colors"
                                                title="Editar Usuário"
                                            >
                                                <span className="material-symbols-outlined text-xl">edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user)}
                                                disabled={user.id === currentUserProfile?.id || user.role === 'master_admin'}
                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-30"
                                                title={user.id === currentUserProfile?.id ? "Você não pode se excluir" : user.role === 'master_admin' ? "Não é possível excluir um Master Admin" : "Excluir Usuário"}
                                            >
                                                <span className="material-symbols-outlined text-xl">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
