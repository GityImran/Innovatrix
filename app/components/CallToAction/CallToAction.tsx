import React from 'react';
import Link from 'next/link';
import styles from './CallToAction.module.css';

export default function CallToAction() {
  return (
    <section id="join" className={styles.ctaSection}>
      <div className={`container`}>
        <div className={styles.ctaCard}>
          <div className={styles.content}>
            <h2 className={styles.title}>Ready to Change Your Campus?</h2>
            <p className={styles.desc}>
              Connect outgoing students with incoming ones. Capture the value within your campus gates and contribute to a sustainable, circular economy.
            </p>
            <Link href="#signup" className={styles.btn}>
              Get Started Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
