import React from 'react';
import Link from 'next/link';
import styles from './ProductCarousel.module.css';
import AddToCartButton from '../AddToCartButton/AddToCartButton';

export default function ProductCarousel({ title, products, currentUserId, itemModel = "Product" }: { title: string, products: any[], currentUserId?: string, itemModel?: "Product" | "RentItem" | "Auction" }) {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2 className={styles.title}>{title}</h2>
          <a href="#" className={styles.seeAll}>See more</a>
        </div>
        
        <div className={styles.carouselRow}>
          {products.map((p, idx) => {
            const isOwnProduct = currentUserId && (
              p.sellerId?.toString() === currentUserId || 
              p.sellerId?._id?.toString() === currentUserId
            );
            
            // Determine item model for this specific product or use the default
            const model = p.itemModel || itemModel;

            return (
            <Link href={`/product/${p._id || p.id}`} key={p._id || p.id || idx} className={styles.productCard} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className={styles.imageWrapper}>
                {p.image?.url || typeof p.image === 'string' ? (
                  <img src={p.image.url || p.image} alt={p.name || p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div className={styles.placeholderImg} style={{ backgroundColor: p.color }}>
                    {p.emoji}
                  </div>
                )}
                {p.discount && <span className={styles.discountBadge}>{p.discount} Off</span>}
                {isOwnProduct && <span className={styles.ownProductBadge}>Your Listing</span>}
              </div>
              <div className={styles.productInfo}>
                <h3 className={`line-clamp-2 ${styles.productName}`}>{p.name || p.title}</h3>
                <div className={styles.priceRow}>
                  <span className={styles.currency}>₹</span>
                  <span className={styles.price}>{p.price || p.expectedPrice}</span>
                  {p.originalPrice && (
                    <span className={styles.originalPrice}>₹{p.originalPrice}</span>
                  )}
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.seller}>Seller: {p.seller || p.sellerId?.name || 'Student'}</span>
                  <span className={styles.condition}>Cond: {p.condition}</span>
                </div>
                {isOwnProduct ? (
                  <button className={styles.ownProductBtn} disabled>Your Listing</button>
                ) : (
                  <AddToCartButton 
                    itemId={(p._id || p.id).toString()} 
                    itemModel={model} 
                    className={styles.addToCartBtn} 
                  />
                )}
              </div>
            </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
