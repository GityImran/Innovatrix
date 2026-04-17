import React from 'react';
import Link from 'next/link';
import styles from './ProductCarousel.module.css';

export default function ProductCarousel({ title, products }: { title: string, products: any[] }) {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2 className={styles.title}>{title}</h2>
          <a href="#" className={styles.seeAll}>See more</a>
        </div>
        
        <div className={styles.carouselRow}>
          {products.map((p, idx) => (
            <Link href={`/product/${p.id}`} key={p.id || idx} className={styles.productCard} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className={styles.imageWrapper}>
                <div className={styles.placeholderImg} style={{ backgroundColor: p.color }}>
                  {p.emoji}
                </div>
                {p.discount && <span className={styles.discountBadge}>{p.discount} Off</span>}
              </div>
              <div className={styles.productInfo}>
                <h3 className={`line-clamp-2 ${styles.productName}`}>{p.name}</h3>
                <div className={styles.priceRow}>
                  <span className={styles.currency}>₹</span>
                  <span className={styles.price}>{p.price}</span>
                  {p.originalPrice && (
                    <span className={styles.originalPrice}>₹{p.originalPrice}</span>
                  )}
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.seller}>Seller: {p.seller} (Senior)</span>
                  <span className={styles.condition}>Cond: {p.condition}</span>
                </div>
                <button className={styles.addToCartBtn}>Add to Cart</button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
