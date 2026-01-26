import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage';

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, clearCart, getCartTotal } = useCart();
  const { user } = useAuth();

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${STORAGE_URL}/${path}`;
  };

  const canOrder = user?.can_order !== false;

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
          <h1 className="page-title">Shopping Cart</h1>

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

                return (
                  <div key={item._id} className="cart-item">
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
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        >
                          <Minus size={16} />
                        </button>
                        <input
                          type="number"
                          className="qty-input"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item._id, parseInt(e.target.value) || 1)}
                          min="1"
                        />
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
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

              <button 
                className="btn-checkout" 
                disabled={!canOrder}
                onClick={() => navigate('/checkout')}
                title={!canOrder ? 'Order permissions required' : 'Proceed to checkout'}
              >
                Proceed to Checkout
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