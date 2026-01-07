
import React, { useState } from 'react';
import { Product, View } from '../types';

interface ProductDetailProps {
  product: Product;
  addToCart: (p: Product, q: number, c?: string, s?: string) => void;
  navigateTo: (v: View) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, addToCart, navigateTo }) => {
  // Use images array if available, fallback to single image_url
  const productImages = product.images && product.images.length > 0
    ? product.images
    : (product.image_url ? [product.image_url] : []);

  // Default to first image
  const [activeImage, setActiveImage] = useState(productImages[0] || '');
  const [quantity, setQuantity] = useState(1);

  // Update active image if product changes
  React.useEffect(() => {
    setActiveImage(productImages[0] || '');
  }, [product]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-10 py-10">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <button onClick={() => navigateTo('home')} className="hover:text-primary">Home</button>
        <span>/</span>
        <button onClick={() => navigateTo('shop')} className="hover:text-primary">Loja</button>
        <span>/</span>
        <span className="font-bold text-text dark:text-white">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        {/* Gallery */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl bg-gray-100 relative group">
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-500"
            />
            <button className="absolute top-6 right-6 size-12 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-lg hover:text-red-500 transition-colors">
              <span className="material-symbols-outlined">favorite</span>
            </button>
          </div>

          {/* Thumbnails */}
          {productImages.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {productImages.slice(0, 4).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImage === img ? 'border-primary scale-95' : 'border-transparent hover:border-gray-300'}`}
                >
                  <img src={img} alt={`View ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          <div>
            <span className="text-primary font-bold uppercase tracking-widest text-sm">{product.category}</span>
            <h1 className="text-3xl md:text-4xl font-black mt-2 dark:text-white leading-tight">{product.name}</h1>
            <p className="text-3xl font-black text-primary mt-4">R$ {product.price.toFixed(2)}</p>
          </div>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
            {product.description}
          </p>

          <div className="flex flex-col gap-6 pt-6 border-t border-gray-100 dark:border-gray-800">
            {/* Color & Size Display */}
            <div className="space-y-4">
              {product.color && (
                <div className="space-y-2">
                  <span className="text-sm font-bold uppercase tracking-wider dark:text-white">Cor Disponível</span>
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-full border border-gray-200" style={{ backgroundColor: product.color }}></div>
                    <span className="text-gray-600 dark:text-gray-300">{product.color}</span>
                  </div>
                </div>
              )}
              {product.size && (
                <div className="space-y-2">
                  <span className="text-sm font-bold uppercase tracking-wider dark:text-white">Tamanho</span>
                  <span className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm font-bold dark:text-white inline-block">
                    {product.size}
                  </span>
                </div>
              )}
            </div>

            {/* Qty and Add */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl h-14 w-full sm:w-40 border border-transparent focus-within:border-primary">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 text-gray-500 hover:text-black dark:hover:text-white"
                >
                  <span className="material-symbols-outlined text-lg">remove</span>
                </button>
                <input
                  type="text"
                  value={quantity}
                  readOnly
                  className="flex-1 bg-transparent border-none text-center font-bold dark:text-white focus:ring-0"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 text-gray-500 hover:text-black dark:hover:text-white"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                </button>
              </div>
              <button
                onClick={() => addToCart(product, quantity)}
                className="flex-1 h-14 bg-primary hover:bg-primary-dark text-black font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-3 transition-transform active:scale-95"
              >
                <span className="material-symbols-outlined">shopping_bag</span>
                Adicionar ao Carrinho
              </button>
            </div>
          </div>

          <div className="bg-primary/5 p-4 rounded-xl flex items-start gap-4">
            <span className="material-symbols-outlined text-primary">eco</span>
            <div>
              <p className="font-bold text-sm dark:text-white">Sustentabilidade</p>
              <p className="text-xs text-gray-500">Cada peça economiza 15L de água e utiliza algodão 100% orgânico.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
