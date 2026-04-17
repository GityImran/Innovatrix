import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { getMockProductById } from '../../../lib/mockProducts';

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

// NextJS 13+ App Router generates pages like this
export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = getMockProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-slate-100">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Link href="/" className="text-sm text-slate-400 hover:text-amber-500 transition-colors flex items-center gap-2">
            ← Back to Products
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left Column - Image Viewer */}
          <div className="flex flex-col gap-4">
            <div 
              className="w-full aspect-square rounded-2xl flex items-center justify-center text-[10rem] shadow-lg shadow-black/50 border border-slate-800"
              style={{ backgroundColor: product.color }}
            >
              {product.emoji}
            </div>
            {/* Thumbnails placeholder */}
            <div className="flex gap-4 overflow-x-auto pb-2">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className={`w-24 h-24 rounded-lg flex items-center justify-center text-4xl cursor-pointer border-2 ${i === 1 ? 'border-amber-500' : 'border-slate-800 hover:border-slate-600'}`}
                  style={{ backgroundColor: product.color }}
                >
                  {product.emoji}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Product Details */}
          <div className="flex flex-col">
            <div className="mb-2">
              <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {product.id.startsWith('tb') ? 'Textbooks' : 'Electronics & Lab'}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight leading-tight">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex gap-1 text-amber-400">
                <span>★</span><span>★</span><span>★</span><span>★</span><span className="text-slate-600">★</span>
              </div>
              <span className="text-sm text-slate-400">(12 Reviews)</span>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800 mb-8 w-fit min-w-[300px]">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-light text-slate-400">₹</span>
                <span className="text-5xl font-bold text-white tracking-tight">{product.price}</span>
              </div>
              
              {product.originalPrice && (
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 line-through text-lg">₹{product.originalPrice}</span>
                  {product.discount && (
                    <span className="text-emerald-400 font-medium text-sm bg-emerald-400/10 px-2 py-0.5 rounded">
                      {product.discount} OFF
                    </span>
                  )}
                </div>
              )}
              <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800">Includes all applicable taxes</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
                <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">Condition</p>
                <p className="font-medium text-slate-200">{product.condition}</p>
              </div>
              <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
                <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">Seller</p>
                <p className="font-medium text-amber-500">{product.seller}</p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3 border-b border-slate-800 pb-2">Description</h3>
              <p className="text-slate-300 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="flex gap-4 mt-auto">
              <button 
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-bold py-4 px-8 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all hover:scale-[1.02] active:scale-95"
              >
                Add to Cart
              </button>
              <button 
                className="flex-1 bg-white hover:bg-slate-200 text-black font-bold py-4 px-8 rounded-xl transition-all hover:scale-[1.02] active:scale-95"
              >
                Buy Now
              </button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <span className="text-xl">🛡️</span> Secure Transaction
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🔄</span> 2 Days Return
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
