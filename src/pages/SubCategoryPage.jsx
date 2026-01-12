import { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { Search, X, Check, Minus, Plus, ChevronRight, ShoppingBag, Package, Truck, Shield } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Loading from '../components/Loading';
import { useCart } from '../context/CartContext';
import { catalogApi } from '../api';

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage';

export default function SubCategoryPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [subCategory, setSubCategory] = useState(location.state?.subCategory || null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const categoryName = location.state?.categoryName || '';
  const brandName = location.state?.brandName || '';

  useEffect(() => {
    fetchProducts();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await catalogApi.getProductsBySubCategory(id);
      
      if (response.data?.[0]?.items) {
        const items = response.data[0].items;
        setProducts(items);
        
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

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${STORAGE_URL}/${path}`;
  };

  const handleAddToCart = () => {
    if (!selectedProduct) {
      alert('Please select a flavor');
      return;
    }

    const product = products.find(p => p._id === selectedProduct);
    if (!product) return;

    const cartItem = {
      ...product,
      subCategoryName: subCategory?.name,
      brandName: product.brand?.name || brandName,
      categoryName: product.category?.name || categoryName,
    };

    addToCart(cartItem, quantity);
    setAddedToCart(true);
    
    setTimeout(() => {
      setAddedToCart(false);
    }, 2500);
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

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
            <Package size={64} strokeWidth={1} />
            <h3>Product Not Found</h3>
            <p>The product you are looking for does not exist or has been removed.</p>
            <button onClick={() => navigate('/')} className="btn-back-catalog">
              <ShoppingBag size={18} />
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

  const images = (subCategory?.images || []).map(img => getImageUrl(img)).filter(Boolean);
  const selectedProductData = products.find(p => p._id === selectedProduct);
  const displayCategoryName = categoryName || products[0]?.category?.name || '';
  const displayBrandName = brandName || products[0]?.brand?.name || '';

  return (
    <>
      <Header />
      <main className="pdp-container">
        {/* Breadcrumb */}
        <nav className="pdp-breadcrumb">
          <Link to="/">Home</Link>
          <ChevronRight size={14} />
          {displayBrandName && (
            <>
              <Link to="/">{displayBrandName}</Link>
              <ChevronRight size={14} />
            </>
          )}
          {displayCategoryName && (
            <>
              <Link to="/">{displayCategoryName}</Link>
              <ChevronRight size={14} />
            </>
          )}
          <span className="current">{subCategory?.name}</span>
        </nav>
        
        <div className="pdp-layout">
          {/* Image Gallery */}
          <div className="pdp-gallery">
            <div className="pdp-main-image">
              {images.length > 0 ? (
                <>
                  <div className={`image-skeleton ${imageLoaded ? 'hidden' : ''}`} />
                  <img 
                    src={images[selectedImage]} 
                    alt={subCategory?.name}
                    className={`main-img ${imageLoaded ? 'loaded' : ''}`}
                    onLoad={() => setImageLoaded(true)}
                  />
                  <button className="pdp-zoom-btn" onClick={() => setShowModal(true)}>
                    <Search size={20} />
                  </button>
                  {images.length > 1 && (
                    <div className="image-counter">
                      {selectedImage + 1} / {images.length}
                    </div>
                  )}
                </>
              ) : (
                <div className="pdp-no-image">
                  <Package size={64} strokeWidth={1} />
                  <span>No image available</span>
                </div>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="pdp-thumbnails">
                {images.map((img, index) => (
                  <button
                    key={index}
                    className={`pdp-thumb ${index === selectedImage ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedImage(index);
                      setImageLoaded(false);
                    }}
                  >
                    <img src={img} alt={`${subCategory?.name} view ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="pdp-info">
            {/* Brand Badge */}
            {displayBrandName && (
              <div className="pdp-brand-badge">{displayBrandName}</div>
            )}

            {/* Title */}
            <h1 className="pdp-title">{subCategory?.name}</h1>
            
            {/* Price */}
            <div className="pdp-price-block">
              <span className="pdp-price">{formatPrice()}</span>
              <span className="pdp-price-note">Wholesale pricing</span>
            </div>
            
            {/* Description */}
            {subCategory?.description && (
              <div className="pdp-description">
                <p>{subCategory.description}</p>
              </div>
            )}

            <div className="pdp-divider" />

            {/* Flavor Selector */}
            {products.length > 0 && (
              <div className="pdp-variant-block">
                <label className="pdp-label">
                  Select Flavor
                  <span className="required">*</span>
                </label>
                <div className="pdp-select-wrapper">
                  <select
                    className={`pdp-select ${selectedProduct ? 'selected' : ''}`}
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                  >
                    <option value="">Choose a flavor...</option>
                    {products.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name} — ${Number(product.price || 0).toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="pdp-variant-count">{products.length} flavors available</p>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="pdp-actions">
              <div className="pdp-quantity">
                <label className="pdp-label">Quantity</label>
                <div className="pdp-qty-control">
                  <button 
                    className="pdp-qty-btn" 
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus size={18} />
                  </button>
                  <input
                    type="number"
                    className="pdp-qty-input"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                  />
                  <button className="pdp-qty-btn" onClick={incrementQuantity}>
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              <button 
                className={`pdp-add-btn ${addedToCart ? 'success' : ''} ${!selectedProduct ? 'disabled' : ''}`}
                onClick={handleAddToCart}
                disabled={addedToCart || !selectedProduct}
              >
                {addedToCart ? (
                  <>
                    <Check size={20} />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBag size={20} />
                    Add to Cart
                  </>
                )}
              </button>
            </div>

            {/* Success Message */}
            {addedToCart && (
              <div className="pdp-success-toast">
                <div className="toast-icon">
                  <Check size={20} />
                </div>
                <div className="toast-content">
                  <strong>{selectedProductData?.name}</strong> added to cart
                </div>
                <Link to="/cart" className="toast-action">View Cart</Link>
              </div>
            )}

            <div className="pdp-divider" />

            {/* Product Meta */}
            <div className="pdp-meta">
              {selectedProductData?.sku && (
                <div className="pdp-meta-item">
                  <span className="meta-key">SKU</span>
                  <span className="meta-val">{selectedProductData.sku}</span>
                </div>
              )}
              <div className="pdp-meta-item">
                <span className="meta-key">Category</span>
                <Link to="/" className="meta-val meta-link">{displayCategoryName || 'Uncategorized'}</Link>
              </div>
              <div className="pdp-meta-item">
                <span className="meta-key">Brand</span>
                <Link to="/" className="meta-val meta-link">{displayBrandName || 'N/A'}</Link>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="pdp-trust">
              <div className="trust-item">
                <Truck size={20} />
                <span>Fast Shipping</span>
              </div>
              <div className="trust-item">
                <Shield size={20} />
                <span>Secure Checkout</span>
              </div>
              <div className="trust-item">
                <Package size={20} />
                <span>Quality Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Image Modal */}
      {showModal && images.length > 0 && (
        <div className="pdp-modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowModal(false)}>
              <X size={24} />
            </button>
            <img src={images[selectedImage]} alt={subCategory?.name} />
            {images.length > 1 && (
              <div className="modal-thumbnails">
                {images.map((img, index) => (
                  <button
                    key={index}
                    className={`modal-thumb ${index === selectedImage ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={img} alt={`View ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}