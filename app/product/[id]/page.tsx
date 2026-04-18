import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';
import RentItem from '@/models/RentItem';
import User from '@/models/User';
import { FairPriceChecker } from '@/app/components/FairPriceChecker/FairPriceChecker';
import { ProductActions } from './ProductActions';

function getTimeAgo(date: Date) {
  const today = new Date();
  const seconds = Math.round((today.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

// NextJS 13+ App Router generates pages like this
export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;
  
  await connectToDatabase();
  
  if (!User) console.warn("User model not loaded"); // Ensure available for populate
  
  let type = "sell";
  let product: any = await Product.findById(id).populate("sellerId", "email name").lean();

  if (!product) {
    product = await RentItem.findById(id).populate("sellerId", "email name").lean();
    type = "rent";
  }

  if (!product) {
    notFound();
  }

  const isSell = type === "sell";
  const sellerEmail = product.sellerId?.email || "Unknown";
  const sellerIdStr = product.sellerId?._id?.toString() || product.sellerId?.toString();
  const price = isSell ? product.expectedPrice : (product.pricing?.day || 0);
  const isSoldOut = product.status !== "active";
  const timeAgo = product.createdAt ? getTimeAgo(new Date(product.createdAt)) : "";

  // Fetch Related Products Server Side
  const relatedProductsPromise = Product.find({ 
    category: product.category, 
    status: "active", 
    _id: { $ne: product._id } 
  }).limit(4).lean().then(items => items.map((i: any) => ({ ...i, __type: "sell" })));

  const relatedRentItemsPromise = RentItem.find({
    category: product.category,
    status: "active",
    _id: { $ne: product._id }
  }).limit(4).lean().then(items => items.map((i: any) => ({ ...i, __type: "rent" })));

  const [relatedSell, relatedRent] = await Promise.all([relatedProductsPromise, relatedRentItemsPromise]);
  const relatedProducts = [...relatedSell, ...relatedRent].slice(0, 4);

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
              className="w-full aspect-square rounded-2xl flex items-center justify-center shadow-lg shadow-black/50 border border-slate-800 overflow-hidden relative group"
            >
              {product.image?.url ? (
                <img src={product.image.url} alt={product.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
              ) : (
                <span className="text-[10rem]">{isSell ? "📦" : "🔄"}</span>
              )}
              {isSoldOut && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                  <span className="bg-red-500/90 text-white font-bold px-6 py-2 rounded-lg tracking-widest text-xl rotate-12 shadow-[0_0_30px_rgba(239,68,68,0.5)] border border-red-400/50">
                    SOLD OUT
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Product Details */}
          <div className="flex flex-col">
            <div className="mb-2 flex items-center gap-3">
              <span className={`inline-block px-3 py-1 text-xs font-bold rounded-md uppercase tracking-wider ${isSell ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'}`}>
                {isSell ? "For Sale" : "For Rent"}
              </span>
              <span className="inline-block px-3 py-1 text-xs font-semibold rounded-md bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                {product.category}
              </span>
              {product.isUrgent && (
                <span className="px-3 py-1 text-xs font-bold rounded-md bg-red-500/20 text-red-500 border border-red-500/30">
                  🔥 Urgent
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-bold mb-2 tracking-tight leading-tight">{product.title}</h1>
            {timeAgo && <p className="text-sm text-slate-500 mb-4">Posted {timeAgo}</p>}
            
            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800 mb-8 w-fit min-w-[300px]">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-light text-slate-400">₹</span>
                <span className="text-5xl font-bold text-white tracking-tight">{price}</span>
                {!isSell && <span className="text-slate-400 font-medium">/ day</span>}
              </div>
              
              {isSell && product.originalPrice && (
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 line-through text-lg">₹{product.originalPrice}</span>
                  <span className="text-emerald-400 font-medium text-sm bg-emerald-400/10 px-2 py-0.5 rounded">
                    {Math.round((1 - product.expectedPrice / product.originalPrice) * 100)}% OFF
                  </span>
                </div>
              )}
              <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800">Includes all applicable taxes</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
                <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">Condition</p>
                <p className="font-medium text-slate-200 uppercase">{product.condition}</p>
              </div>
              <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
                <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">Seller Domain</p>
                <p className="font-medium text-amber-500">{product.sellerDomain}</p>
              </div>
            </div>

            {/* Fair Price Checker Integration */}
            <div className="mb-8">
              <FairPriceChecker
                title={product.title}
                category={product.category}
                condition={product.condition}
                price={product.expectedPrice}
                excludeId={id}
                mode="buyer"
              />
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3 border-b border-slate-800 pb-2">Description</h3>
              <p className="text-slate-300 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="mt-8">
              <ProductActions 
                productId={id}
                type={type as "sell" | "rent"}
                sellerId={sellerIdStr}
                sellerEmail={sellerEmail}
                price={price}
                status={product.status || "active"}
              />
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

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-10 border-t border-slate-800/50">
            <h2 className="text-2xl font-bold mb-8 text-white">More in <span className="text-amber-500">{product.category}</span></h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map(rp => {
                const rpIsSell = rp.__type === "sell";
                const rpPrice = rpIsSell ? rp.expectedPrice : (rp.pricing?.day || 0);
                
                return (
                  <Link href={`/product/${rp._id.toString()}`} key={rp._id.toString()} className="group flex flex-col bg-slate-900/40 border border-slate-800/60 rounded-xl overflow-hidden hover:border-slate-700 transition-all hover:-translate-y-1">
                    <div className="w-full aspect-square bg-[#111] overflow-hidden relative">
                      {rp.image?.url ? (
                        <img src={rp.image.url} alt={rp.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl opacity-50 bg-[#151515]">
                          {rpIsSell ? "📦" : "🔄"}
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      <span className="text-[10px] uppercase font-bold text-slate-500 mb-1">{rpIsSell ? "For Sale" : "For Rent"}</span>
                      <h4 className="text-sm font-semibold text-slate-200 line-clamp-1 mb-2">{rp.title}</h4>
                      <p className="text-amber-500 font-bold mt-auto">
                        ₹{rpPrice?.toLocaleString('en-IN')}
                        {!rpIsSell && <span className="text-xs text-slate-500 font-normal"> / day</span>}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
