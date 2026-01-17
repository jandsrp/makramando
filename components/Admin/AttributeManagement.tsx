
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Category, Color, Size } from '../../types';

type EditingItem = {
    id: string;
    type: 'categories' | 'colors' | 'sizes';
};

export const AttributeManagement: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [colors, setColors] = useState<Color[]>([]);
    const [sizes, setSizes] = useState<Size[]>([]);
    const [loading, setLoading] = useState(false);

    const [newCategory, setNewCategory] = useState('');
    const [newSize, setNewSize] = useState('');
    const [newColor, setNewColor] = useState({ name: '', hex: '#000000' });

    const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
    const [editValue, setEditValue] = useState<any>(null);

    const fetchData = async () => {
        setLoading(true);
        const [cats, cols, szs] = await Promise.all([
            supabase.from('categories').select('*').order('name'),
            supabase.from('colors').select('*').order('name'),
            supabase.from('sizes').select('*').order('name')
        ]);

        if (cats.data) setCategories(cats.data);
        if (cols.data) setColors(cols.data);
        if (szs.data) setSizes(szs.data);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddCategory = async () => {
        if (!newCategory) return;
        const { error } = await supabase.from('categories').insert([{ name: newCategory }]);
        if (!error) {
            setNewCategory('');
            fetchData();
        }
    };

    const handleAddSize = async () => {
        if (!newSize) return;
        const { error } = await supabase.from('sizes').insert([{ name: newSize }]);
        if (!error) {
            setNewSize('');
            fetchData();
        }
    };

    const handleAddColor = async () => {
        if (!newColor.name) return;
        const { error } = await supabase.from('colors').insert([{ name: newColor.name, hex_code: newColor.hex }]);
        if (!error) {
            setNewColor({ name: '', hex: '#000000' });
            fetchData();
        }
    };

    const handleDelete = async (table: string, id: string) => {
        if (window.confirm('Deseja realmente excluir este item?')) {
            const { error } = await supabase.from(table).delete().eq('id', id);
            if (!error) fetchData();
        }
    };

    const handleUpdate = async () => {
        if (!editingItem || !editValue) return;

        let updateData = {};
        if (editingItem.type === 'colors') {
            updateData = { name: editValue.name, hex_code: editValue.hex_code };
        } else {
            updateData = { name: editValue.name };
        }

        const { error } = await supabase
            .from(editingItem.type)
            .update(updateData)
            .eq('id', editingItem.id);

        if (!error) {
            setEditingItem(null);
            setEditValue(null);
            fetchData();
        }
    };

    const startEditing = (item: any, type: 'categories' | 'colors' | 'sizes') => {
        setEditingItem({ id: item.id, type });
        if (type === 'colors') {
            setEditValue({ name: item.name, hex_code: item.hex_code });
        } else {
            setEditValue({ name: item.name });
        }
    };

    return (
        <div className="p-8 space-y-12">
            {/* Categories */}
            <section>
                <h3 className="text-xl font-bold mb-4 dark:text-white">Categorias</h3>
                <div className="flex gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Nova categoria"
                        className="form-input flex-1 rounded-xl border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-white p-3 border"
                        value={newCategory}
                        onChange={e => setNewCategory(e.target.value)}
                    />
                    <button onClick={handleAddCategory} className="bg-primary text-black font-bold px-6 rounded-xl">Adicionar</button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {categories.map(c => (
                        <div key={c.id} className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full flex items-center gap-2 group relative">
                            {editingItem?.id === c.id ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        className="bg-white dark:bg-gray-700 text-sm px-2 py-0.5 rounded border border-primary outline-none"
                                        value={editValue.name}
                                        onChange={e => setEditValue({ ...editValue, name: e.target.value })}
                                        autoFocus
                                        onKeyDown={e => e.key === 'Enter' && handleUpdate()}
                                    />
                                    <button onClick={handleUpdate} className="text-green-500 hover:text-green-700">
                                        <span className="material-symbols-outlined text-sm">done</span>
                                    </button>
                                    <button onClick={() => setEditingItem(null)} className="text-gray-500 hover:text-gray-700">
                                        <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <span className="text-sm dark:text-white">{c.name}</span>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => startEditing(c, 'categories')} className="text-blue-500 hover:text-blue-700">
                                            <span className="material-symbols-outlined text-sm">edit</span>
                                        </button>
                                        <button onClick={() => handleDelete('categories', c.id)} className="text-red-500 hover:text-red-700">
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Sizes */}
            <section>
                <h3 className="text-xl font-bold mb-4 dark:text-white">Tamanhos</h3>
                <div className="flex gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Novo tamanho (ex: P, M, G, 30x50cm)"
                        className="form-input flex-1 rounded-xl border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-white p-3 border"
                        value={newSize}
                        onChange={e => setNewSize(e.target.value)}
                    />
                    <button onClick={handleAddSize} className="bg-primary text-black font-bold px-6 rounded-xl">Adicionar</button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {sizes.map(s => (
                        <div key={s.id} className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full flex items-center gap-2 group">
                            {editingItem?.id === s.id ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        className="bg-white dark:bg-gray-700 text-sm px-2 py-0.5 rounded border border-primary outline-none"
                                        value={editValue.name}
                                        onChange={e => setEditValue({ ...editValue, name: e.target.value })}
                                        autoFocus
                                        onKeyDown={e => e.key === 'Enter' && handleUpdate()}
                                    />
                                    <button onClick={handleUpdate} className="text-green-500 hover:text-green-700">
                                        <span className="material-symbols-outlined text-sm">done</span>
                                    </button>
                                    <button onClick={() => setEditingItem(null)} className="text-gray-500 hover:text-gray-700">
                                        <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <span className="text-sm dark:text-white">{s.name}</span>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => startEditing(s, 'sizes')} className="text-blue-500 hover:text-blue-700">
                                            <span className="material-symbols-outlined text-sm">edit</span>
                                        </button>
                                        <button onClick={() => handleDelete('sizes', s.id)} className="text-red-500 hover:text-red-700">
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Colors */}
            <section>
                <h3 className="text-xl font-bold mb-4 dark:text-white">Cores</h3>
                <div className="flex gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Nome da cor"
                        className="form-input flex-1 rounded-xl border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-white p-3 border"
                        value={newColor.name}
                        onChange={e => setNewColor({ ...newColor, name: e.target.value })}
                    />
                    <input
                        type="color"
                        className="size-12 rounded-lg border-none cursor-pointer p-0"
                        value={newColor.hex}
                        onChange={e => setNewColor({ ...newColor, hex: e.target.value })}
                    />
                    <button onClick={handleAddColor} className="bg-primary text-black font-bold px-6 rounded-xl">Adicionar</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {colors.map(c => (
                        <div key={c.id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-3 rounded-2xl flex flex-col gap-3 shadow-sm group">
                            {editingItem?.id === c.id ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            className="size-6 rounded-full border-none cursor-pointer p-0"
                                            value={editValue.hex_code || '#000000'}
                                            onChange={e => setEditValue({ ...editValue, hex_code: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            className="bg-white dark:bg-gray-700 text-xs px-2 py-0.5 rounded border border-primary outline-none flex-1"
                                            value={editValue.name}
                                            onChange={e => setEditValue({ ...editValue, name: e.target.value })}
                                            autoFocus
                                            onKeyDown={e => e.key === 'Enter' && handleUpdate()}
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2 text-xs">
                                        <button onClick={handleUpdate} className="text-green-500 font-bold">SALVAR</button>
                                        <button onClick={() => setEditingItem(null)} className="text-gray-500">CANCELAR</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="size-6 rounded-full border border-gray-200" style={{ backgroundColor: c.hex_code || '#fff' }}></div>
                                            <span className="text-xs font-bold dark:text-white">{c.name}</span>
                                        </div>
                                        <span className="text-[10px] text-gray-400 font-mono uppercase">{c.hex_code}</span>
                                    </div>
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity pt-1 border-t border-gray-50 dark:border-gray-700">
                                        <button onClick={() => startEditing(c, 'colors')} className="text-blue-500 hover:text-blue-700">
                                            <span className="material-symbols-outlined text-sm">edit</span>
                                        </button>
                                        <button onClick={() => handleDelete('colors', c.id)} className="text-red-500 hover:text-red-700">
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};
