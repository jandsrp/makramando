
import React, { useState } from 'react';
import { supabase } from '../../services/supabase';
import { Product } from '../../types';

interface ProductFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    product?: Product | null;
}

export const ProductForm: React.FC<ProductFormProps> = ({ onSuccess, onCancel, product }) => {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price.toString() || '',
        category: product?.category || 'Painéis de Parede',
        size: product?.size || 'Padrão',
        color: product?.color || '#fdfbf7',
        images: product?.images || (product?.image_url ? [product.image_url] : [])
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        if (formData.images.length >= 4) {
            alert('Máximo de 4 imagens permitido.');
            return;
        }

        setUploading(true);
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);

            setFormData(prev => ({
                ...prev,
                images: [...prev.images, data.publicUrl]
            }));
        } catch (error) {
            alert('Erro ao fazer upload da imagem!');
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const image_url = formData.images.length > 0 ? formData.images[0] : null;

            const payload = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                category: formData.category,
                size: formData.size,
                color: formData.color,
                images: formData.images,
                image_url: image_url, // Keep backward compatibility
                is_new: product ? product.is_new : true, // Keep existing status if editing
                stock: product ? product.stock : 10
            };

            let error;
            if (product?.id) {
                // Update
                const { error: updateError } = await supabase
                    .from('products')
                    .update(payload)
                    .eq('id', product.id);
                error = updateError;
            } else {
                // Insert
                const { error: insertError } = await supabase
                    .from('products')
                    .insert([payload]);
                error = insertError;
            }

            if (error) throw error;

            onSuccess();
        } catch (error) {
            alert('Erro ao salvar produto!');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-surface-dark p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl mb-12 animate-in fade-in slide-in-from-top-4 duration-300">
            <h2 className="text-2xl font-bold mb-6 dark:text-white">{product ? 'Editar Produto' : 'Cadastrar Produto'}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-bold dark:text-white">Nome do Produto</span>
                        <input
                            required
                            className="form-input rounded-xl border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-white p-3 border"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="ex: Filtro dos Sonhos Luna"
                        />
                    </label>

                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-bold dark:text-white">Descrição</span>
                        <textarea
                            required
                            rows={4}
                            className="form-textarea rounded-xl border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-white resize-none p-3 border"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Fale sobre os detalhes..."
                        />
                    </label>

                    <div className="grid grid-cols-2 gap-4">
                        <label className="flex flex-col gap-2">
                            <span className="text-sm font-bold dark:text-white">Preço (R$)</span>
                            <input
                                required
                                type="number"
                                step="0.01"
                                className="form-input rounded-xl border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-white p-3 border"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                placeholder="0.00"
                            />
                        </label>
                        <label className="flex flex-col gap-2">
                            <span className="text-sm font-bold dark:text-white">Categoria</span>
                            <select
                                className="form-select rounded-xl border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-white p-3 border"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option>Painéis de Parede</option>
                                <option>Suportes para Plantas</option>
                                <option>Acessórios</option>
                                <option>Decoração Infantil</option>
                            </select>
                        </label>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-bold dark:text-white">Imagens do Produto (Máx 4)</span>

                        <div className="grid grid-cols-4 gap-4 mb-4">
                            {formData.images.map((img, idx) => (
                                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-gray-200">
                                    <img src={img} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 size-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">close</span>
                                    </button>
                                </div>
                            ))}

                            {formData.images.length < 4 && (
                                <label className={`aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    {uploading ? (
                                        <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-gray-400 text-3xl">add_photo_alternate</span>
                                            <span className="text-xs text-gray-400 font-bold mt-1">Add Foto</span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        disabled={uploading}
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                        <p className="text-xs text-gray-400">A primeira imagem será usada como destaque/capa.</p>
                    </label>

                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-bold dark:text-white">Cor (Hex ou Nome)</span>
                        <input
                            className="form-input rounded-xl border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-white p-3 border"
                            value={formData.color}
                            onChange={e => setFormData({ ...formData, color: e.target.value })}
                            placeholder="#fdfbf7"
                        />
                    </label>

                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-bold dark:text-white">Tamanho</span>
                        <input
                            className="form-input rounded-xl border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-white p-3 border"
                            value={formData.size}
                            onChange={e => setFormData({ ...formData, size: e.target.value })}
                            placeholder="Padrão, 30x50cm..."
                        />
                    </label>

                    <div className="pt-4 flex gap-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-4 rounded-xl transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || uploading}
                            className="flex-1 bg-primary hover:bg-primary-dark text-black font-bold py-4 rounded-xl shadow-lg transition-all disabled:opacity-50"
                        >
                            {loading ? 'Salvando...' : (product ? 'Salvar Alterações' : 'Cadastrar Produto')}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};
