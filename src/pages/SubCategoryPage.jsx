import { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Loading from '../components/Loading';
import { catalogApi } from '../api';

// Storage URL for images
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage';

export default function SubCategoryPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [subCategory, setSubCategory] = useState(location.state?.subCategory || null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  
  const categoryName = location.state?.categoryName || '';
  const brandName = location.state?.brandName || '';

  useEffect(() => {
    fetchProducts();
  }, [id]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await catalogApi.getProductsBySubCategory(id);
      
      if (response.data?.[0]?.items) {
        const items = response.data[0].items;
        setProducts(items);
        
        // If we don't have subCategory from state, get it from first product
        if (!subCategory && items.length > 0 && items[0].sub_category) {
          setSubCategory(items[0].sub_category);
        }
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to get full image URL
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${STORAGE_URL}/${path}`;
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

  if (!subCategory && products.length === 0) {
    return (
      <>
        <Header />
        <div className="container">
          <div className="empty-state">
            <h3>Product Not Found</h3>
            <p>The product you are looking for does not exist.</p>
            <button 
              onClick={() => navigate('/')} 
              className="btn-primary" 
              style={{ marginTop: '20px', width: 'auto', padding: '12px 24px' }}
            >
              Back to Catalog
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const formatPrice = () => {
    if (!subCategory?.price) return '$0.00';
    
    if (subCategory.price_type === 'single') {
      return `$${Number(subCategory.price.amount || 0).toFixed(2)}`;
    }
    
    if (subCategory.price_type === 'range') {
      const min = Number(subCategory.price.min || 0).toFixed(2);
      const max = Number(subCategory.price.max || 0).toFixed(2);
      return `$${min} – $${max}`;
    }
    
    return '$0.00';
  };

  // Get images from subCategory
  const images = (subCategory?.images || []).map(img => getImageUrl(img)).filter(Boolean);

  // Get selected product data
  const selectedProductData = products.find(p => p._id === selectedProduct);
  
  // Build flavors list from product names
  const flavors = products.map(p => p.name).join(', ');

  // Get category/brand info from products if not in state
  const displayCategoryName = categoryName || products[0]?.category?.name || '';
  const displayBrandName = brandName || products[0]?.brand?.name || '';

  return (
    <>
      <Header />
      <main className="container">
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>{displayCategoryName || displayBrandName}</span>
          <span>/</span>
          <span>{subCategory?.name}</span>
        </nav>
        
        <div className="product-detail">
          <div className="product-detail-grid">
            <div className="product-gallery">
              <div className="main-image-wrapper">
                {images.length > 0 ? (
                  <>
                    <img 
                      src={images[selectedImage]} 
                      alt={subCategory?.name}
                      className="main-image"
                    />
                    <button 
                      className="zoom-btn"
                      onClick={() => setShowModal(true)}
                    >
                      <Search size={18} />
                    </button>
                  </>
                ) : (
                  <div className="product-placeholder" style={{ fontSize: '48px' }}>
                    {subCategory?.name?.charAt(0) || 'P'}
                  </div>
                )}
              </div>
              
              {images.length > 1 && (
                <div className="thumbnail-grid">
                  {images.map((img, index) => (
                    <div
                      key={index}
                      className={`thumbnail ${index === selectedImage ? 'active' : ''}`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img src={img} alt={`${subCategory?.name} ${index + 1}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="product-detail-info">
              <div className="detail-price">{formatPrice()}</div>
              
              {subCategory?.description && (
                <div className="detail-description">
                  <p>{subCategory.description}</p>
                </div>
              )}
              
              {flavors && (
                <div className="detail-flavors">
                  <span className="flavors-label">Flavors: </span>
                  <span className="flavors-list">{flavors}</span>
                </div>
              )}

              {products.length > 0 && (
                <div className="variant-selector">
                  <div className="variant-label">Pick-N-Mix Flavors</div>
                  <select
                    className="variant-select"
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                  >
                    <option value="">Choose an option</option>
                    {products.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name} - ${Number(product.price || 0).toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="add-to-cart-section">
                <input
                  type="number"
                  className="quantity-input"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                />
                <button className="add-to-cart-btn">
                  Add to cart
                </button>
              </div>

              <div className="product-meta">
                <div className="meta-item">
                  <span className="meta-label">SKU:</span>
                  <span className="meta-value">
                    {selectedProductData?.sku || 'N/A'}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Category:</span>
                  <span className="meta-value">
                    <Link to="/">{displayCategoryName || 'Uncategorized'}</Link>
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Brand:</span>
                  <span className="meta-value">
                    <Link to="/">{displayBrandName || 'N/A'}</Link>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {showModal && images.length > 0 && (
        <div className="image-modal" onClick={() => setShowModal(false)}>
          <button className="modal-close" onClick={() => setShowModal(false)}>
            <X size={24} />
          </button>
          <img src={images[selectedImage]} alt={subCategory?.name} />
        </div>
      )}
    </>
  );
}
