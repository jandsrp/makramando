import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Product, Category, Color, Size } from '../../types';
import { generateProductDescription } from '../../services/geminiService';

interface ProductFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    product?: Product | null;
}

export const ProductForm: React.FC<ProductFormProps> = ({ onSuccess, onCancel, product }) => {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [generatingDescription, setGeneratingDescription] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [allColors, setAllColors] = useState<Color[]>([]);
    const [allSizes, setAllSizes] = useState<Size[]>([]);

    const [formData, setFormData] = useState({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price?.toString() || '',
        category_id: product?.category_id || '',
        selectedColors: product?.product_colors || [],
        selectedSizes: product?.product_sizes || [],
        images: product?.images || (product?.image_url ? [product.image_url] : [])
    });

    useEffect(() => {
        const fetchAttributes = async () => {
            const [cats, cols, szs] = await Promise.all([
                supabase.from('categories').select('*').order('name'),
                supabase.from('colors').select('*').order('name'),
                supabase.from('sizes').select('*').order('name')
            ]);
            if (cats.data) {
                setCategories(cats.data);
                if (!product && cats.data.length > 0) {
                    setFormData(prev => ({ ...prev, category_id: cats.data[0].id }));
                }
            }
            if (cols.data) setAllColors(cols.data);
            if (szs.data) setAllSizes(szs.data);
        };
        fetchAttributes();
    }, [product]);

    const toggleColor = (colorName: string) => {
        setFormData(prev => ({
            ...prev,
            selectedColors: prev.selectedColors.includes(colorName)
                ? prev.selectedColors.filter(c => c !== colorName)
                : [...prev.selectedColors, colorName]
        }));
    };

    const toggleSize = (sizeName: string) => {
        setFormData(prev => ({
            ...prev,
            selectedSizes: prev.selectedSizes.includes(sizeName)
                ? prev.selectedSizes.filter(s => s !== sizeName)
                : [...prev.selectedSizes, sizeName]
        }));
    };

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
                category_id: formData.category_id,
                product_colors: formData.selectedColors,
                product_sizes: formData.selectedSizes,
                category: categories.find(c => c.id === formData.category_id)?.name || '', // Backward compatibility
                color: formData.selectedColors[0] || '', // Backward compatibility
                size: formData.selectedSizes[0] || '', // Backward compatibility
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
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold dark:text-white">Descrição</span>
                            <button
                                type="button"
                                disabled={generatingDescription}
                                onClick={async () => {
                                    if (!formData.name) return alert('Digite o nome do produto primeiro.');
                                    setGeneratingDescription(true);
                                    try {
                                        const desc = await generateProductDescription(formData.name, [formData.category, formData.color]);
                                        setFormData(prev => ({ ...prev, description: desc }));
                                    } finally {
                                        setGeneratingDescription(false);
                                    }
                                }}
                                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 disabled:opacity-50"
                            >
                                <span className={`material-symbols-outlined text-sm ${generatingDescription ? 'animate-spin' : ''}`}>
                                    {generatingDescription ? 'sync' : 'auto_awesome'}
                                </span>
                                {generatingDescription ? 'Gerando...' : 'Gerar com IA'}
                            </button>
                        </div>
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
                                value={formData.category_id}
                                onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                            >
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
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

                    <div className="flex flex-col gap-2">
                        <span className="text-sm font-bold dark:text-white">Cores Disponíveis</span>
                        <div className="flex flex-wrap gap-2">
                            {allColors.map(color => (
                                <button
                                    key={color.id}
                                    type="button"
                                    onClick={() => toggleColor(color.name)}
                                    className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${formData.selectedColors.includes(color.name)
                                        ? 'bg-primary border-primary text-black'
                                        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-800 dark:text-white'
                                        }`}
                                >
                                    <div className="size-3 rounded-full border border-gray-200" style={{ backgroundColor: color.hex_code || '#fff' }}></div>
                                    {color.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <span className="text-sm font-bold dark:text-white">Tamanhos Disponíveis</span>
                        <div className="flex flex-wrap gap-2">
                            {allSizes.map(size => (
                                <button
                                    key={size.id}
                                    type="button"
                                    onClick={() => toggleSize(size.name)}
                                    className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all ${formData.selectedSizes.includes(size.name)
                                        ? 'bg-primary border-primary text-black'
                                        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-800 dark:text-white'
                                        }`}
                                >
                                    {size.name}
                                </button>
                            ))}
                        </div>
                    </div>

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
