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

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;

  await connectToDatabase();
  if (!User) console.warn('User model not loaded');

  let type = 'sell';
  let product: any = await Product.findById(id).populate('sellerId', 'email name').lean();

  if (!product) {
    product = await RentItem.findById(id).populate('sellerId', 'email name').lean();
    type = 'rent';
  }

  if (!product) notFound();

  const isSell = type === 'sell';
  const sellerEmail = product.sellerId?.email || 'Unknown';
  const sellerName  = product.sellerId?.name  || 'Campus Seller';
  const sellerIdStr = product.sellerId?._id?.toString() || product.sellerId?.toString();
  const price       = isSell ? product.expectedPrice : (product.pricing?.day || 0);
  const isSoldOut   = product.status !== 'active';
  const timeAgo     = product.createdAt ? getTimeAgo(new Date(product.createdAt)) : '';
  const discount    = isSell && product.originalPrice
    ? Math.round((1 - product.expectedPrice / product.originalPrice) * 100)
    : 0;

  const [relatedSell, relatedRent] = await Promise.all([
    Product.find({ category: product.category, status: 'active', _id: { $ne: product._id } }).limit(4).lean()
      .then((items: any[]) => items.map((i) => ({ ...i, __type: 'sell' }))),
    RentItem.find({ category: product.category, status: 'active', _id: { $ne: product._id } }).limit(4).lean()
      .then((items: any[]) => items.map((i) => ({ ...i, __type: 'rent' }))),
  ]);
  const relatedProducts = [...relatedSell, ...relatedRent].slice(0, 4);

  /* ── helpers ─────────────────────────────────────── */
  const conditionColor =
    product.condition === 'new'       ? 'text-emerald-400' :
    product.condition === 'like-new'  ? 'text-sky-400'     :
    product.condition === 'good'      ? 'text-amber-400'   :
    'text-rose-400';

  const aiBlock = product.aiCondition;
  const aiColor =
    !aiBlock ? '' :
    aiBlock.aiFailed   ? 'bg-slate-800/60 border-slate-700' :
    aiBlock.mismatch   ? 'bg-amber-500/5  border-amber-500/20' :
                         'bg-emerald-500/5 border-emerald-500/20';
  const aiTextColor =
    !aiBlock ? '' :
    aiBlock.aiFailed  ? 'text-slate-400'  :
    aiBlock.mismatch  ? 'text-amber-400'  :
                        'text-emerald-400';

  return (
    <>
      <style>{`
        .rp-card { transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s; }
        .rp-card:hover { border-color: rgba(255,255,255,0.18) !important; transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.5); }
      `}</style>
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#080808', color: '#e2e8f0' }}>
      <Header />

      <main style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', padding: '32px 24px', width: '100%' }}>

        {/* ── Breadcrumb ───────────────────────────────── */}
        <nav style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link href="/search" style={{ fontSize: '13px', color: '#64748b', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>←</span> Search
          </Link>
          <span style={{ color: '#1e293b', fontSize: '13px' }}>/</span>
          <Link href={`/search?category=${product.category}`} style={{ fontSize: '13px', color: '#64748b', textDecoration: 'none' }}>
            {product.category}
          </Link>
          <span style={{ color: '#1e293b', fontSize: '13px' }}>/</span>
          <span style={{ fontSize: '13px', color: '#94a3b8', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {product.title}
          </span>
        </nav>

        {/* ── Main grid ────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '48px', alignItems: 'start' }}>

          {/* ── LEFT — Image ─────────────────────────────── */}
          <div style={{ position: 'sticky', top: '24px' }}>
            <div style={{
              position: 'relative',
              width: '100%',
              paddingBottom: '100%',
              borderRadius: '24px',
              overflow: 'hidden',
              background: 'linear-gradient(145deg, #111, #0a0a0a)',
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
            }}>
              {product.image?.url ? (
                <img
                  src={product.image.url}
                  alt={product.title}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                />
              ) : (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '7rem', opacity: 0.25 }}>
                  {isSell ? '📦' : '🔄'}
                </div>
              )}

              {/* Sold-out overlay */}
              {isSoldOut && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ background: 'linear-gradient(135deg,#dc2626,#9f1239)', color: '#fff', fontWeight: 900, fontSize: '1.5rem', letterSpacing: '0.25em', padding: '12px 32px', borderRadius: '12px', textTransform: 'uppercase', transform: 'rotate(-8deg)', boxShadow: '0 0 40px rgba(220,38,38,0.5)', border: '1px solid rgba(255,100,100,0.3)' }}>
                    Sold Out
                  </span>
                </div>
              )}
            </div>

            {/* Trust badges */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '24px' }}>
              {[
                { icon: '🛡️', label: 'Secure' },
                { icon: '✅', label: 'Verified' },
                { icon: '↩️', label: '2-Day Return' },
              ].map(b => (
                <div key={b.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '1.25rem' }}>{b.icon}</span>
                  <span style={{ fontSize: '11px', color: '#475569', fontWeight: 600, letterSpacing: '0.05em' }}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT — Details ───────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

            {/* Badges row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '6px 14px', borderRadius: '999px', fontSize: '11px', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                background: isSell ? 'rgba(245,158,11,0.12)' : 'rgba(168,85,247,0.12)',
                color: isSell ? '#fbbf24' : '#c084fc',
                border: `1px solid ${isSell ? 'rgba(245,158,11,0.3)' : 'rgba(168,85,247,0.3)'}`,
              }}>
                {isSell ? '🏷️' : '🔁'} {isSell ? 'For Sale' : 'For Rent'}
              </span>

              <span style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '6px 14px', borderRadius: '999px', fontSize: '11px', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                background: 'rgba(255,255,255,0.05)', color: '#94a3b8',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
                {product.category}
              </span>

              {product.isUrgent && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  padding: '6px 14px', borderRadius: '999px', fontSize: '11px', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  background: 'rgba(239,68,68,0.12)', color: '#f87171',
                  border: '1px solid rgba(239,68,68,0.3)', animation: 'pulse 2s infinite',
                }}>
                  🔥 Urgent
                </span>
              )}
            </div>

            {/* Title + timestamp */}
            <div>
              <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.02em', margin: 0, background: 'linear-gradient(135deg, #fff 60%, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {product.title}
              </h1>
              {timeAgo && (
                <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block', flexShrink: 0 }} />
                  Posted {timeAgo}
                </p>
              )}
            </div>

            {/* Price card */}
            <div style={{
              background: 'linear-gradient(145deg, rgba(15,15,15,0.95), rgba(10,10,10,0.95))',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '20px',
              padding: '28px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}>
              {/* Glow accent */}
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', background: 'rgba(245,158,11,0.08)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }} />

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', position: 'relative' }}>
                <span style={{ fontSize: '1.75rem', fontWeight: 300, color: '#64748b', lineHeight: 1 }}>₹</span>
                <span style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.03em' }}>
                  {price?.toLocaleString('en-IN')}
                </span>
                {!isSell && (
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', marginLeft: '4px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>/ day</span>
                )}
              </div>

              {isSell && product.originalPrice && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px', position: 'relative' }}>
                  <span style={{ fontSize: '1rem', color: '#475569', textDecoration: 'line-through', fontWeight: 500 }}>
                    ₹{product.originalPrice?.toLocaleString('en-IN')}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#34d399', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)', padding: '3px 10px', borderRadius: '999px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {discount}% OFF
                  </span>
                </div>
              )}

              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ margin: 0, fontSize: '11px', color: '#334155', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Includes all applicable taxes
                </p>
              </div>
            </div>

            {/* Meta grid — Condition & Seller Domain */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {/* Condition */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '18px' }}>
                <p style={{ margin: '0 0 8px', fontSize: '10px', fontWeight: 700, color: '#475569', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Condition</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span className={conditionColor} style={{ fontWeight: 700, fontSize: '1rem', textTransform: 'capitalize' }}>
                    {product.condition}
                  </span>
                  {aiBlock && (
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.06em',
                      background: aiBlock.aiFailed ? 'rgba(100,116,139,0.2)' : aiBlock.mismatch ? 'rgba(245,158,11,0.12)' : 'rgba(52,211,153,0.12)',
                      color:      aiBlock.aiFailed ? '#64748b'               : aiBlock.mismatch ? '#fbbf24'               : '#34d399',
                      border: `1px solid ${aiBlock.aiFailed ? 'rgba(100,116,139,0.2)' : aiBlock.mismatch ? 'rgba(245,158,11,0.25)' : 'rgba(52,211,153,0.25)'}`,
                    }}>
                      {aiBlock.aiFailed ? 'Unverified' : aiBlock.mismatch ? '⚠️ Warning' : '✔️ AI OK'}
                    </span>
                  )}
                </div>
              </div>

              {/* Seller Domain */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '18px', overflow: 'hidden' }}>
                <p style={{ margin: '0 0 8px', fontSize: '10px', fontWeight: 700, color: '#475569', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Campus</p>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#f59e0b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {product.sellerDomain}
                </p>
              </div>
            </div>

            {/* Seller info row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '14px 18px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg,#f59e0b,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                🎓
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#e2e8f0' }}>{sellerName}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sellerEmail}</p>
              </div>
              <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 600, color: '#10b981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '3px 10px', borderRadius: '999px', whiteSpace: 'nowrap' }}>
                ★ Campus Seller
              </span>
            </div>

            {/* AI Condition alert */}
            {aiBlock && (
              <div className={aiColor} style={{ borderRadius: '14px', padding: '16px 20px', border: '1px solid', borderColor: 'inherit', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>
                  {aiBlock.aiFailed ? 'ℹ️' : aiBlock.mismatch ? '⚠️' : '✅'}
                </span>
                <div>
                  <p className={aiTextColor} style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '13px' }}>
                    {aiBlock.aiFailed ? 'Condition not verified'
                      : aiBlock.mismatch ? 'Condition may differ from listing'
                      : 'Condition verified by AI'}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>
                    {aiBlock.aiFailed
                      ? "We couldn't verify this item automatically. Please rely on the listing details."
                      : aiBlock.mismatch
                        ? `Item appears "${aiBlock.detected}" but listed as "${product.condition}". Review carefully before buying.`
                        : "This item matches the seller\u2019s description."}
                  </p>
                </div>
              </div>
            )}

            {/* Fair Price Checker */}
            <FairPriceChecker
              title={product.title}
              category={product.category}
              condition={product.condition}
              price={product.expectedPrice}
              excludeId={id}
              mode="buyer"
            />

            {/* Description */}
            <div>
              <h3 style={{ margin: '0 0 12px', fontSize: '11px', fontWeight: 700, color: '#475569', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                About this item
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8', lineHeight: 1.8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', padding: '18px 20px', whiteSpace: 'pre-wrap' }}>
                {product.description || 'No description provided.'}
              </p>
            </div>

            {/* Rent-specific info */}
            {!isSell && product.pricing && (
              <div style={{ background: 'rgba(168,85,247,0.04)', border: '1px solid rgba(168,85,247,0.15)', borderRadius: '16px', padding: '20px' }}>
                <h3 style={{ margin: '0 0 14px', fontSize: '11px', fontWeight: 700, color: '#a855f7', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Rental Pricing</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {[
                    { label: 'Per Day', value: product.pricing.day },
                    { label: 'Per Week', value: product.pricing.week },
                    { label: 'Per Month', value: product.pricing.month },
                  ].map(r => r.value ? (
                    <div key={r.label} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px 8px' }}>
                      <p style={{ margin: '0 0 4px', fontSize: '10px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{r.label}</p>
                      <p style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#c084fc' }}>₹{r.value?.toLocaleString('en-IN')}</p>
                    </div>
                  ) : null)}
                </div>
                {product.securityDeposit && (
                  <p style={{ margin: '14px 0 0', fontSize: '12px', color: '#64748b' }}>
                    Security deposit: <strong style={{ color: '#94a3b8' }}>₹{product.securityDeposit?.toLocaleString('en-IN')}</strong>
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <ProductActions
              productId={id}
              type={type as 'sell' | 'rent'}
              sellerId={sellerIdStr}
              sellerEmail={sellerEmail}
              price={price}
              status={product.status || 'active'}
              title={product.title}
              image={product.image?.url || ''}
              category={product.category}
              condition={product.condition}
            />

          </div>{/* end RIGHT */}
        </div>{/* end grid */}

        {/* ── Related Products ──────────────────────────── */}
        {relatedProducts.length > 0 && (
          <section style={{ marginTop: '80px', paddingTop: '48px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 style={{ margin: '0 0 32px', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.01em', color: '#f1f5f9' }}>
              More in <span style={{ color: '#f59e0b' }}>{product.category}</span>
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
              {relatedProducts.map((rp: any) => {
                const rpIsSell = rp.__type === 'sell';
                const rpPrice  = rpIsSell ? rp.expectedPrice : (rp.pricing?.day || 0);
                return (
                  <Link key={rp._id.toString()} href={`/product/${rp._id.toString()}`} style={{ textDecoration: 'none' }}>
                    <div className="rp-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', overflow: 'hidden', cursor: 'pointer' }}
                    >
                      <div style={{ width: '100%', aspectRatio: '1', background: '#0d0d0d', overflow: 'hidden', position: 'relative' }}>
                        {rp.image?.url
                          ? <img src={rp.image.url} alt={rp.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', opacity: 0.3 }}>{rpIsSell ? '📦' : '🔁'}</div>
                        }
                        <span style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '3px 8px', borderRadius: '6px', background: rpIsSell ? 'rgba(245,158,11,0.2)' : 'rgba(168,85,247,0.2)', color: rpIsSell ? '#fbbf24' : '#c084fc', border: `1px solid ${rpIsSell ? 'rgba(245,158,11,0.3)' : 'rgba(168,85,247,0.3)'}` }}>
                          {rpIsSell ? 'Sale' : 'Rent'}
                        </span>
                      </div>
                      <div style={{ padding: '14px 16px' }}>
                        <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rp.title}</p>
                        <p style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#f59e0b' }}>
                          ₹{rpPrice?.toLocaleString('en-IN')}
                          {!rpIsSell && <span style={{ fontSize: '11px', color: '#475569', fontWeight: 500 }}> /day</span>}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

      </main>
      <Footer />
    </div>
    </>
  );
}
