import Header from './components/Header/Header';
import CategoriesNav from './components/CategoriesNav/CategoriesNav';
import Hero from './components/Hero/Hero';
import ProductCarousel from './components/ProductCarousel/ProductCarousel';
import ProblemStatement from './components/ProblemStatement/ProblemStatement';
import Footer from './components/Footer/Footer';
import Sidebar from './components/Sidebar/Sidebar';

import { mockTextbooks, mockElectronics } from '../lib/mockProducts';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';
import { auth } from '@/lib/auth';

export default async function Home() {
  await connectToDatabase();
  const session = await auth();

  let textbooks: any[] = [];
  let electronics: any[] = [];

  /**
   * Build a college-aware filter that handles both old and new products:
   *
   * Old products: saved with `sellerDomain` derived from the seller's email
   *   e.g. { sellerDomain: "iitb.ac.in" }
   *
   * New products: saved with the explicit `college` string from the user's profile
   *   e.g. { college: "Indian Institute of Technology Bombay" }
   *
   * When logged in  → match either field for the user's college.
   * When logged out → return all active products as a generic browsing feed.
   */
  let collegeFilter: Record<string, any> = {};

  if (session?.user?.college) {
    const userCollege = session.user.college;

    // Derive domain from the session email to match legacy sellerDomain products
    const userEmail = session.user.email ?? '';
    const userDomain = userEmail.includes('@') ? userEmail.split('@')[1].toLowerCase() : null;

    const orConditions: Record<string, any>[] = [
      { college: userCollege }, // new products — explicit college string
    ];

    if (userDomain) {
      orConditions.push({ sellerDomain: userDomain }); // legacy products — email domain
    }

    collegeFilter = { $or: orConditions };
  }

  const baseQuery = {
    status: 'active',
    ...collegeFilter,
  };

  const allProducts = await Product.find(baseQuery)
    .sort({ isUrgent: -1, createdAt: -1 })
    .limit(30)
    .lean() as any[];

  // Group products by their exact category
  const productsByCategory: Record<string, any[]> = {};
  if (allProducts.length > 0) {
    allProducts.forEach(p => {
      const cat = p.category || 'Other';
      if (!productsByCategory[cat]) productsByCategory[cat] = [];
      productsByCategory[cat].push(p);
    });
  }

  const isLoggedIn = !!session?.user;
  const college = session?.user?.college;

  const categoryEntries = Object.entries(productsByCategory);
  const showMock = categoryEntries.length === 0;

  return (
    <>
      {/* Dynamic Background Glowing Orbs */}
      <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', zIndex: -1, pointerEvents: 'none' }}></div>
      <div style={{ position: 'fixed', bottom: '-20%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(59,130,246,0.04) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', zIndex: -1, pointerEvents: 'none' }}></div>

      <Sidebar />
      <div className="sidebar-spacer" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <CategoriesNav />
        <main style={{ flex: 1, position: 'relative' }}>
          <Hero />

        {/* Main E-commerce Layout */}
        <div id="shop" style={{ scrollMarginTop: '100px', backgroundColor: 'var(--bg-color)', minHeight: '100vh', padding: '0 0 2rem 0' }}>
          
          <div style={{ position: 'relative', top: '-100px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {showMock ? (
              <>
                <div id="category-lab-equipment" style={{ scrollMarginTop: '100px' }}>
                  <ProductCarousel
                    title={isLoggedIn && college ? `Textbooks at ${college}` : 'Trending Textbooks'}
                    products={mockTextbooks}
                    currentUserId={session?.user?.id}
                  />
                </div>
                <div id="category-electronics" style={{ scrollMarginTop: '100px' }}>
                  <ProductCarousel
                    title={isLoggedIn && college ? `Lab & Electronics at ${college}` : 'Lab Equipment & Electronics'}
                    products={mockElectronics}
                    currentUserId={session?.user?.id}
                  />
                </div>
              </>
            ) : (
              categoryEntries.map(([categoryName, products]) => {
                const capitalizedCategory = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
                const title = isLoggedIn && college 
                  ? `${capitalizedCategory} at ${college}`
                  : `Trending ${capitalizedCategory}`;

                return (
                  <div key={categoryName} id={`category-${categoryName.replace(/\s+/g, '-').toLowerCase()}`} style={{ scrollMarginTop: '100px' }}>
                    <ProductCarousel
                      title={title}
                      products={products}
                      currentUserId={session?.user?.id}
                    />
                  </div>
                );
              })
            )}
          </div>

          <div style={{ marginTop: showMock ? '-60px' : '0' }}>
            <ProblemStatement />
          </div>
        </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
