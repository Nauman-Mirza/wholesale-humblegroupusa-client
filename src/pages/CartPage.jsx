import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, AlertCircle, RefreshCw } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { catalogApi } from '../api';
import Header from '../components/Header';
import Footer from '../components/Footer';

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage';

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, clearCart, getCartTotal } = useCart();
  const { user } = useAuth();
  const [inventoryData, setInventoryData] = useState({});
  const [inventoryErrors, setInventoryErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    if (cart.length > 0) {
      validateInventory();
    }
  }, []);

  const validateInventory = async () => {
    setValidating(true);
    const errors = {};
    const inventory = {};

    try {
      // Fetch current inventory for all items in cart
      for (const item of cart) {
        const subCategoryId = item.sub_category?._id || item.sub_category;
        if (subCategoryId) {
          try {
            const response = await catalogApi.getProductsBySubCategory(subCategoryId);
            if (response.data?.[0]?.items) {
              const product = response.data[0].items.find(p => p._id === item._id);
              if (product) {
                inventory[item._id] = product.quantity;
                
                // Check if cart quantity exceeds available stock
                if (product.quantity === 0) {
                  errors[item._id] = {
                    message: 'Out of stock',
                    available: 0,
                  };
                } else if (item.quantity > product.quantity) {
                  errors[item._id] = {
                    message: `Only ${product.quantity} available`,
                    available: product.quantity,
                  };
                }
              }
            }
          } catch (err) {
            console.error(`Failed to validate inventory for ${item._id}:`, err);
          }
        }
      }
    } finally {
      setInventoryData(inventory);
      setInventoryErrors(errors);
      setValidating(false);
    }
  };

  const handleQuantityChange = (productId, newQuantity) => {
    const availableStock = inventoryData[productId];
    
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    if (availableStock !== undefined && newQuantity > availableStock) {
      // Update to maximum available and show error
      const newErrors = {
        ...inventoryErrors,
        [productId]: {
          message: availableStock === 0 ? 'Out of stock' : `Only ${availableStock} available`,
          available: availableStock,
        },
      };
      setInventoryErrors(newErrors);
      updateQuantity(productId, availableStock);
      return;
    }

    // Clear error if quantity is valid
    if (inventoryErrors[productId]) {
      const newErrors = { ...inventoryErrors };
      delete newErrors[productId];
      setInventoryErrors(newErrors);
    }

    updateQuantity(productId, newQuantity);
  };

  const handleProceedToCheckout = async () => {
    // Check if there are any inventory errors
    if (Object.keys(inventoryErrors).length > 0) {
      return;
    }

    // Validate one more time before checkout
    setLoading(true);
    await validateInventory();
    setLoading(false);

    // Check again after validation
    if (Object.keys(inventoryErrors).length === 0) {
      navigate('/checkout');
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${STORAGE_URL}/${path}`;
  };

  const canOrder = user?.can_order !== false;
  const hasInventoryErrors = Object.keys(inventoryErrors).length > 0;

  if (cart.length === 0) {
    return (
      <>
        <Header />
        <main className="container">
          <div className="cart-page">
            <h1 className="page-title">Shopping Cart</h1>
            <div className="empty-cart">
              <ShoppingBag size={64} strokeWidth={1} />
              <h3>Your cart is empty</h3>
              <p>Looks like you haven't added any items yet.</p>
              <Link to="/" className="btn-continue-shopping">
                Continue Shopping
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container">
        <div className="cart-page">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h1 className="page-title">Shopping Cart</h1>
            <button 
              onClick={validateInventory}
              disabled={validating}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: '500',
                color: '#6b7280',
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                cursor: validating ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: validating ? 0.6 : 1,
              }}
            >
              <RefreshCw size={14} style={{ animation: validating ? 'spin 1s linear infinite' : 'none' }} />
              {validating ? 'Checking...' : 'Refresh Stock'}
            </button>
          </div>

          {hasInventoryErrors && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 16px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              marginBottom: '20px',
              color: '#991b1b',
              fontSize: '13px',
              lineHeight: '1.5',
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0, color: '#dc2626' }} />
              <span>
                Some items in your cart have stock issues. Please adjust quantities or remove items before checkout.
              </span>
            </div>
          )}

          <div className="cart-layout">
            <div className="cart-items">
              <div className="cart-header-row">
                <span className="cart-col-product">Product</span>
                <span className="cart-col-price">Price</span>
                <span className="cart-col-quantity">Quantity</span>
                <span className="cart-col-subtotal">Subtotal</span>
                <span className="cart-col-action"></span>
              </div>

              {cart.map((item) => {
                const image = item.images?.[0] ? getImageUrl(item.images[0]) : null;
                const price = Number(item.price) || 0;
                const subtotal = price * item.quantity;
                const hasError = inventoryErrors[item._id];
                const availableStock = inventoryData[item._id];

                return (
                  <div key={item._id} className="cart-item" style={{
                    borderLeft: hasError ? '3px solid #ef4444' : 'none',
                    paddingLeft: hasError ? '13px' : '16px',
                  }}>
                    <div className="cart-col-product">
                      <div className="cart-item-image">
                        {image ? (
                          <img src={image} alt={item.name} />
                        ) : (
                          <div className="cart-item-placeholder">
                            {item.name?.charAt(0) || 'P'}
                          </div>
                        )}
                      </div>
                      <div className="cart-item-details">
                        <h4 className="cart-item-name">{item.name}</h4>
                        {item.sku && <p className="cart-item-sku">SKU: {item.sku}</p>}
                        {item.subCategoryName && (
                          <p className="cart-item-category">{item.subCategoryName}</p>
                        )}
                        
                        {/* Inventory error message - only show when there's an actual error */}
                        {hasError && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginTop: '8px',
                            padding: '6px 10px',
                            background: '#fee',
                            border: '1px solid #fecaca',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '500',
                            color: '#dc2626',
                          }}>
                            <AlertCircle size={12} />
                            <span>{hasError.message}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="cart-col-price">
                      <span className="mobile-label">Price:</span>
                      ${price.toFixed(2)}
                    </div>

                    <div className="cart-col-quantity">
                      <div className="quantity-controls">
                        <button
                          className="qty-btn"
                          onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                        >
                          <Minus size={16} />
                        </button>
                        <input
                          type="number"
                          className="qty-input"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value) || 1)}
                          min="1"
                          max={availableStock}
                        />
                        <button
                          className="qty-btn"
                          onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                          disabled={availableStock !== undefined && item.quantity >= availableStock}
                          style={{
                            opacity: (availableStock !== undefined && item.quantity >= availableStock) ? 0.5 : 1,
                            cursor: (availableStock !== undefined && item.quantity >= availableStock) ? 'not-allowed' : 'pointer',
                          }}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="cart-col-subtotal">
                      <span className="mobile-label">Subtotal:</span>
                      ${subtotal.toFixed(2)}
                    </div>

                    <div className="cart-col-action">
                      <button
                        className="remove-btn"
                        onClick={() => removeFromCart(item._id)}
                        title="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="cart-actions">
                <Link to="/" className="btn-continue">
                  ← Continue Shopping
                </Link>
                <button className="btn-clear" onClick={clearCart}>
                  Clear Cart
                </button>
              </div>
            </div>

            <div className="cart-summary">
              <h3 className="summary-title">Cart Summary</h3>
              
              <div className="summary-row">
                <span>Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row summary-total">
                <span>Total</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>

              {!canOrder && (
                <div className="order-disabled-notice">
                  <AlertCircle size={16} />
                  <span>Your account does not have ordering permissions. Please contact support to enable checkout.</span>
                </div>
              )}

              {hasInventoryErrors && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 14px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  marginTop: '16px',
                  color: '#991b1b',
                  fontSize: '12px',
                  lineHeight: '1.5',
                }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>Fix inventory issues to proceed</span>
                </div>
              )}

              <button 
                className="btn-checkout" 
                disabled={!canOrder || hasInventoryErrors || loading}
                onClick={handleProceedToCheckout}
                title={
                  !canOrder ? 'Order permissions required' : 
                  hasInventoryErrors ? 'Fix inventory issues first' : 
                  'Proceed to checkout'
                }
              >
                {loading ? 'Validating...' : 'Proceed to Checkout'}
              </button>

              <p className="summary-note">
                Taxes and shipping calculated at checkout
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}