import React from 'react';
import styles from './ProblemStatement.module.css';

export default function ProblemStatement() {
  const problems = [
    {
      title: "Sustainable & Circular",
      desc: "Every purchase reduces the invisible waste cycle on our campus. Save items from the dustbin.",
      icon: "♻️"
    },
    {
      title: "Verified Student Sellers",
      desc: "Buy directly from seniors. No middlemen, no ridiculous markups from local kabaadiwalas.",
      icon: "🎓"
    },
    {
      title: "Secure On-Campus Delivery",
      desc: "Meet at the library or hostel to exchange. Zero shipping costs and immediate logistics.",
      icon: "📦"
    },
    {
      title: "Save Up To 80%",
      desc: "Incoming juniors shouldn't have to buy brand new. Get the exact same items for pennies.",
      icon: "💸"
    }
  ];

  return (
    <section id="problem" className={styles.section}>
      <div className={`container ${styles.container}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>Why Choose CampusMart?</h2>
        </div>
        
        <div className={styles.grid}>
          {problems.map((prob, idx) => (
            <div key={idx} className={`${styles.card}`}>
              <div className={styles.icon}>{prob.icon}</div>
              <h3 className={styles.cardTitle}>{prob.title}</h3>
              <p className={styles.cardDesc}>{prob.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
