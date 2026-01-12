import { useState, useEffect } from 'react';
import { catalogApi } from '../api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BrandSection from '../components/BrandSection';
import Loading from '../components/Loading';

export default function CatalogPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async (page = 1) => {
    try {
      setLoading(true);
      const response = await catalogApi.getBrandsWithCategories(page, 20);
      
      if (response.data && response.data[0]) {
        const data = response.data[0];
        setBrands(data.items || []);
        setPagination(data.pagination || null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load catalog');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <Loading />
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="container">
          <div className="empty-state">
            <h3>Error Loading Catalog</h3>
            <p>{error}</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container">
        {brands.length === 0 ? (
          <div className="empty-state">
            <h3>No Products Available</h3>
            <p>Check back soon for new products.</p>
          </div>
        ) : (
          brands.map((brand) => (
            <BrandSection key={brand._id || brand.id} brand={brand} />
          ))
        )}
        
        {pagination && pagination.last_page > 1 && (
          <div className="pagination" style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '12px', 
            padding: '40px 0' 
          }}>
            {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => fetchCatalog(page)}
                className={`category-pill ${page === pagination.current_page ? 'active' : ''}`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
