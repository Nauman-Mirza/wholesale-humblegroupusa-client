import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useCatalog } from '../context/CatalogContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BrandSection from '../components/BrandSection';
import Loading from '../components/Loading';

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage';

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${STORAGE_URL}/${path}`;
};

export default function CatalogPage() {
  const { brands, loading, error, pagination, fetchCatalog } = useCatalog();
  const location = useLocation();

  useEffect(() => {
    if (!loading && location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [loading, location.hash]);

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

      {/* Hero Cover Section */}
      <section className="hero-cover">
        <img
          src="/cover.jpg"
          alt="Welcome to our catalog"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </section>

      <main className="container">
        {brands.length === 0 ? (
          <div className="empty-state">
            <h3>No Products Available</h3>
            <p>Check back soon for new products.</p>
          </div>
        ) : (
          brands.map((brand) => (
            <div key={brand._id || brand.id} id={`brand-${brand._id || brand.id}`} className="brand-wrapper">
              <div className="brand-header">
                {brand.image && (
                  <div className="brand-logo-side">
                    <img
                      src={getImageUrl(brand.image)}
                      alt={brand.name}
                      className="brand-logo"
                    />
                  </div>
                )}
                <div className="brand-info-side">
                  <h2 className="brand-title">{brand.name}</h2>
                  {brand.description && (
                    <p className="brand-description">{brand.description}</p>
                  )}
                </div>
              </div>
              <BrandSection brand={brand} />
            </div>
          ))
        )}

        {pagination && pagination.last_page > 1 && (
          <div className="pagination">
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
