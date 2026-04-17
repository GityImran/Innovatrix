import Header from './components/Header/Header';
import CategoriesNav from './components/CategoriesNav/CategoriesNav';
import Hero from './components/Hero/Hero';
import ProductCarousel from './components/ProductCarousel/ProductCarousel';
import ProblemStatement from './components/ProblemStatement/ProblemStatement';
import Footer from './components/Footer/Footer';

import { mockTextbooks, mockElectronics } from '../lib/mockProducts';

export default function Home() {
  return (
    <>
      <Header />
      <CategoriesNav />
      <main>
        <Hero />
        
        {/* Main E-commerce Layout */}
        <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh', padding: '0 0 2rem 0' }}>
          {/* Overlapping Carousel over the Hero banner */}
          <div style={{ position: 'relative', top: '-100px', zIndex: 10 }}>
            <ProductCarousel title="Trending Textbooks for Sem 3" products={mockTextbooks} />
          </div>
          
          <div style={{ marginTop: '-80px' }}>
            <ProductCarousel title="Lab Equipment & Electronics" products={mockElectronics} />
          </div>

          <ProblemStatement />
        </div>
      </main>
      <Footer />
    </>
  );
}
