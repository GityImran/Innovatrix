import Header from './components/Header/Header';
import CategoriesNav from './components/CategoriesNav/CategoriesNav';
import Hero from './components/Hero/Hero';
import ProductCarousel from './components/ProductCarousel/ProductCarousel';
import ProblemStatement from './components/ProblemStatement/ProblemStatement';
import Footer from './components/Footer/Footer';

export default function Home() {
  const mockTextbooks = [
    { name: 'Engineering Physics (8th Ed) - Highlighted', price: '450', originalPrice: '1200', discount: '62%', seller: 'Rahul S.', condition: 'Used - Good', emoji: '📘', color: '#102a43' },
    { name: 'Data Structures and Algorithms in C++', price: '300', originalPrice: '850', discount: '64%', seller: 'Priya K.', condition: 'Like New', emoji: '📙', color: '#842029' },
    { name: 'Microeconomics Principles', price: '250', originalPrice: '700', discount: '64%', seller: 'Amit V.', condition: 'Acceptable', emoji: '📗', color: '#0f5132' },
    { name: 'Organic Chemistry Vol. 2', price: '500', originalPrice: '1500', discount: '66%', seller: 'Neha R.', condition: 'Used - Very Good', emoji: '📕', color: '#664d03' }
  ];

  const mockElectronics = [
    { name: 'Casio fx-991EX Scientific Calculator', price: '600', originalPrice: '1350', discount: '55%', seller: 'Vikas T.', condition: 'Like New', emoji: '🖩', color: '#052c65' },
    { name: 'Arduino Uno R3 Starter Kit', price: '800', originalPrice: '2000', discount: '60%', seller: 'Samir D.', condition: 'Used - Good', emoji: '🔌', color: '#1a1d20' },
    { name: 'Drafting Table Tool Set (Mini-drafter)', price: '200', originalPrice: '600', discount: '66%', seller: 'Ankit M.', condition: 'Used - Acceptable', emoji: '📐', color: '#332701' },
    { name: 'Lab Coat (Size M) + Goggles', price: '150', originalPrice: '450', discount: '66%', seller: 'Riya G.', condition: 'Used - Washed', emoji: '🥼', color: '#000000' }
  ];

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
