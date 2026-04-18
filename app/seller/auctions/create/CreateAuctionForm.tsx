"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadImage } from "@/lib/upload";

const CATEGORIES = [
  "Books",
  "Electronics",
  "Furniture",
  "Lab Equipment",
  "Hostel Supplies",
  "Others",
];

export default function CreateAuctionForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    productTitle: "",
    description: "",
    category: "",
    condition: "Good",
    startingPrice: "",
    minIncrement: "10",
    durationHours: "24",
    reservePrice: "",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (images.length === 0) throw new Error("Please upload at least one image");
      if (!formData.category) throw new Error("Please select a category");

      // 1. Upload images to Cloudinary
      const imageUrls = await Promise.all(
        images.map(async (file) => {
          const res = await uploadImage(file);
          return res.imageUrl;
        })
      );

      // 2. Create auction
      const res = await fetch("/api/auctions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          startingPrice: Number(formData.startingPrice),
          minIncrement: Number(formData.minIncrement),
          durationHours: Number(formData.durationHours),
          reservePrice: formData.reservePrice ? Number(formData.reservePrice) : undefined,
          images: imageUrls,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create auction");

      router.push("/seller/auctions");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-5 rounded-2xl text-sm font-bold flex items-center gap-3 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
          <span className="text-xl">⚠️</span> {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-[#0a0a0a] border border-white/5 shadow-2xl rounded-[2.5rem] p-8 lg:p-12 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        
        <h2 className="text-2xl font-black flex items-center gap-4 mb-10 relative z-10">
          <div className="relative flex items-center justify-center w-10 h-10">
            <span className="absolute inset-0 bg-yellow-500/20 rounded-full blur-md" />
            <span className="relative bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 w-full h-full rounded-full flex items-center justify-center text-sm font-black shadow-inner">1</span>
          </div>
          Product Details
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          <div className="md:col-span-2">
            <label className="block text-zinc-500 text-xs font-bold uppercase tracking-widest mb-3">Product Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Scientific Calculator Casio FX-991ES"
              className="w-full bg-[#111] border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all font-medium text-white placeholder:text-zinc-600"
              value={formData.productTitle}
              onChange={e => setFormData({ ...formData, productTitle: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-zinc-500 text-xs font-bold uppercase tracking-widest mb-3">Category</label>
            <select
              required
              className="w-full bg-[#111] border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all appearance-none font-medium text-white text-base"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="" disabled className="text-zinc-600">Select Category</option>
              {CATEGORIES.map(c => <option key={c} value={c} className="bg-zinc-900">{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-zinc-500 text-xs font-bold uppercase tracking-widest mb-3">Condition</label>
            <div className="grid grid-cols-3 gap-3">
              {["New", "Good", "Used"].map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFormData({ ...formData, condition: c as any })}
                  className={`py-4 rounded-xl text-sm font-bold transition-all border shadow-sm ${
                    formData.condition === c 
                    ? "bg-yellow-500/10 border-yellow-500 text-yellow-400" 
                    : "bg-[#111] border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-zinc-500 text-xs font-bold uppercase tracking-widest mb-3">Description</label>
            <textarea
              rows={5}
              placeholder="Tell buyers about your product. Include details about its condition, features, and why you are selling it."
              className="w-full bg-[#111] border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all font-medium text-white placeholder:text-zinc-600 resize-none"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Auction Settings */}
      <div className="bg-[#0a0a0a] border border-white/5 shadow-2xl rounded-[2.5rem] p-8 lg:p-12 relative overflow-hidden group">
        <h2 className="text-2xl font-black flex items-center gap-4 mb-10 relative z-10">
          <div className="relative flex items-center justify-center w-10 h-10">
             <span className="absolute inset-0 bg-yellow-500/20 rounded-full blur-md" />
             <span className="relative bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 w-full h-full rounded-full flex items-center justify-center text-sm font-black shadow-inner">2</span>
          </div>
          Bidding & Time
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          <div>
            <label className="block text-zinc-500 text-xs font-bold uppercase tracking-widest mb-3">Starting Bid</label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">₹</span>
              <input
                type="number"
                required
                placeholder="e.g. 500"
                className="w-full bg-[#111] border border-white/10 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all font-black text-xl text-white placeholder:text-zinc-700"
                value={formData.startingPrice}
                onChange={e => setFormData({ ...formData, startingPrice: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-500 text-xs font-bold uppercase tracking-widest mb-3">Min. Bid Increment</label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">₹</span>
              <input
                type="number"
                required
                placeholder="e.g. 10"
                className="w-full bg-[#111] border border-white/10 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all font-black text-xl text-white placeholder:text-zinc-700"
                value={formData.minIncrement}
                onChange={e => setFormData({ ...formData, minIncrement: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-500 text-xs font-bold uppercase tracking-widest mb-3">Duration</label>
            <div className="relative">
              <select
                className="w-full bg-[#111] border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all appearance-none font-bold text-lg text-white"
                value={formData.durationHours}
                onChange={e => setFormData({ ...formData, durationHours: e.target.value })}
              >
                {[1, 6, 12, 24, 48, 72].map(h => (
                  <option key={h} value={h} className="bg-zinc-900">{h} {h === 1 ? 'Hour' : 'Hours'}</option>
                ))}
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">▼</div>
            </div>
          </div>

          <div>
            <label className="block text-zinc-500 text-xs font-bold uppercase tracking-widest mb-3 flex items-center justify-between">
              <span>Reserve Price</span>
              <span className="text-[10px] text-zinc-600 bg-white/5 px-2 py-0.5 rounded uppercase">Optional</span>
            </label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">₹</span>
              <input
                type="number"
                placeholder="Secret minimum"
                className="w-full bg-[#111] border border-white/10 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all font-bold text-lg text-white placeholder:text-zinc-600"
                value={formData.reservePrice}
                onChange={e => setFormData({ ...formData, reservePrice: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-[#0a0a0a] border border-white/5 shadow-2xl rounded-[2.5rem] p-8 lg:p-12 relative overflow-hidden group">
        <h2 className="text-2xl font-black flex items-center gap-4 mb-10 relative z-10">
          <div className="relative flex items-center justify-center w-10 h-10">
             <span className="absolute inset-0 bg-yellow-500/20 rounded-full blur-md" />
             <span className="relative bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 w-full h-full rounded-full flex items-center justify-center text-sm font-black shadow-inner">3</span>
          </div>
          Upload Media
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
          {previews.map((src, idx) => (
            <div key={idx} className="aspect-square relative rounded-3xl overflow-hidden border border-white/10 group/img shadow-xl">
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity z-10" />
              <img src={src} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-3 right-3 bg-red-500/80 backdrop-blur text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg hover:bg-red-500 transition-all z-20 shadow-lg scale-0 group-hover/img:scale-100"
              >
                ×
              </button>
            </div>
          ))}
          
          <label className="aspect-square border-2 border-dashed border-white/10 hover:border-yellow-500/50 rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-yellow-500/5 group/upload shadow-inner">
            <span className="text-4xl mb-3 group-hover/upload:scale-110 group-hover/upload:-translate-y-1 transition-all duration-300">📸</span>
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 group-hover/upload:text-yellow-400 transition-colors">Select Photos</span>
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
        </div>
      </div>

      <div className="flex flex-col-reverse md:flex-row justify-end gap-4 pb-24 pt-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-8 py-5 rounded-2xl font-bold text-zinc-500 hover:text-white hover:bg-white/5 transition-all text-sm uppercase tracking-widest w-full md:w-auto"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="group relative overflow-hidden bg-yellow-500 hover:bg-yellow-400 disabled:bg-zinc-800 disabled:opacity-50 text-black font-black px-12 py-5 rounded-2xl transition-all shadow-[0_0_30px_rgba(234,179,8,0.2)] hover:shadow-[0_0_40px_rgba(234,179,8,0.4)] disabled:shadow-none w-full md:w-auto border border-yellow-400 disabled:border-transparent"
        >
          {!loading && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />}
          <span className="relative z-10 flex items-center justify-center gap-2 text-lg uppercase tracking-wide">
            {loading ? "Initializing..." : "Launch Auction 🔥"}
          </span>
        </button>
      </div>
    </form>
  );
}
