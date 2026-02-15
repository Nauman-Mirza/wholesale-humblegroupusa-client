import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, MapPin, CreditCard, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { authApi, orderApi } from '../api';
import Header from '../components/Header';
import Footer from '../components/Footer';

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearCart, getCartTotal } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState(1); // 1: Review, 2: Confirm
  const [loading, setLoading] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [attachment, setAttachment] = useState(null);
  const [attachmentError, setAttachmentError] = useState('');

  useEffect(() => {
    if (cart.length === 0 && !success) {
      navigate('/cart');
    }
  }, [cart, navigate, success]);

  useEffect(() => {
    loadShippingAddress();
  }, []);

  const loadShippingAddress = async () => {
    setLoadingAddress(true);
    try {
      const response = await authApi.getUserData();
      // Handle nested data structure: response.data.data.data
      const userData = response.data?.data?.data || response.data?.data || response.data;
      
      if (userData?.shipping_address) {
        setShippingAddress(userData.shipping_address);
      } else {
        setError('Please add a shipping address in your profile before placing an order.');
      }
    } catch (err) {
      console.error('Failed to load shipping address:', err);
      setError('Failed to load shipping address. Please try again.');
    } finally {
      setLoadingAddress(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) {
      setAttachment(null);
      setAttachmentError('');
      return;
    }
    
    // Validate file type
    const validTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!validTypes.includes(file.type)) {
      setAttachmentError('File must be PDF, JPG, PNG, DOC, or DOCX');
      setAttachment(null);
      e.target.value = '';
      return;
    }
    
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setAttachmentError('File size must not exceed 10 MB');
      setAttachment(null);
      e.target.value = '';
      return;
    }
    
    setAttachmentError('');
    setAttachment(file);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');

    // Validate attachment is present
    if (!attachment) {
      setError('Please upload a purchase order or invoice document');
      setLoading(false);
      return;
    }

    try {
      // Validate cart items have required fields
      const invalidItems = cart.filter(item => 
        !item.warehence_product_id || !item.sku || !item.quantity
      );

      if (invalidItems.length > 0) {
        throw new Error('Some cart items are missing required information. Please refresh your cart.');
      }

      // Prepare order items
      const items = cart.map(item => ({
        warehence_product_id: parseInt(item.warehence_product_id),
        quantity: parseInt(item.quantity),
        sku: String(item.sku),
      }));

      const orderPayload = {
        user_id: user.id,
        total: parseFloat(getCartTotal().toFixed(2)),
        items,
        attachment, // Add file here
      };

      console.log('Order Payload:', {
        user_id: orderPayload.user_id,
        total: orderPayload.total,
        items: orderPayload.items,
        attachment: attachment?.name,
      });

      const response = await orderApi.createOrder(orderPayload);

      console.log('Order Response:', response);

      // Check for success in various response formats
      if (response.data || response.status === 'success') {
        setOrderData(response.data);
        setSuccess(true);
        clearCart();
      } else {
        throw new Error(response.message || 'Failed to create order');
      }
    } catch (err) {
      console.error('Order creation error:', err);
      console.error('Error response:', err.response?.data);
      
      // Extract detailed error message
      let errorMsg = 'Failed to place order. Please try again.';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        // Check for validation errors
        if (errorData.errors) {
          // Laravel validation errors format
          const errorMessages = Object.entries(errorData.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages[0] : messages}`)
            .join(', ');
          errorMsg = errorMessages || errorData.message;
        } else if (errorData.message) {
          errorMsg = errorData.message;
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${STORAGE_URL}/${path}`;
  };

  if (success) {
    return (
      <>
        <Header />
        <main className="container">
          <div className="checkout-page">
            <div className="success-container">
              <div className="success-icon">
                <CheckCircle size={64} strokeWidth={1.5} />
              </div>
              <h1 className="success-title">Order Placed Successfully!</h1>
              <p className="success-message">
                Thank you for your order. We've received your order and will process it shortly.
              </p>

              <div className="success-actions">
                <button onClick={() => navigate('/')} className="btn-primary">
                  Continue Shopping
                </button>
              </div>
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
        <div className="checkout-page">
          <h1 className="page-title">Checkout</h1>

          {/* Progress Steps */}
          <div className="checkout-steps">
            <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
              <div className="step-icon">
                <Package size={20} />
              </div>
              <span>Review Order</span>
            </div>
            <div className="step-divider"></div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <div className="step-icon">
                <CreditCard size={20} />
              </div>
              <span>Confirm & Place Order</span>
            </div>
          </div>

          {error && (
            <div className="error-banner">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <div className="checkout-layout">
            <div className="checkout-main">
              {loadingAddress ? (
                <div className="checkout-section">
                  <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <Loader className="spinner" size={32} style={{ margin: '0 auto 1rem' }} />
                    <p>Loading shipping address...</p>
                  </div>
                </div>
              ) : !shippingAddress ? (
                <div className="checkout-section">
                  <div className="error-state">
                    <AlertCircle size={48} />
                    <h3>No Shipping Address Found</h3>
                    <p>Please add a shipping address in your profile before placing an order.</p>
                    <button 
                      onClick={() => navigate('/profile')} 
                      className="btn-primary"
                      style={{ marginTop: '1rem' }}
                    >
                      Go to Profile
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Step 1: Review Order */}
                  {step === 1 && (
                <div className="checkout-section">
                  <h2 className="section-title">Review Your Order</h2>
                  <div className="order-items-list">
                    {cart.map((item) => {
                      const image = item.images?.[0] ? getImageUrl(item.images[0]) : null;
                      const price = Number(item.price) || 0;
                      const subtotal = price * item.quantity;

                      return (
                        <div key={item._id} className="order-item-card">
                          <div className="order-item-image">
                            {image ? (
                              <img src={image} alt={item.name} />
                            ) : (
                              <div className="order-item-placeholder">
                                {item.name?.charAt(0) || 'P'}
                              </div>
                            )}
                          </div>
                          <div className="order-item-details">
                            <h4>{item.name}</h4>
                            {item.sku && <p className="item-sku">SKU: {item.sku}</p>}
                            <p className="item-quantity">Quantity: {item.quantity}</p>
                          </div>
                          <div className="order-item-price">
                            <span className="price">${price.toFixed(2)}</span>
                            <span className="subtotal">${subtotal.toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="checkout-actions">
                    <button onClick={() => navigate('/cart')} className="btn-secondary">
                      Back to Cart
                    </button>
                    <button onClick={() => setStep(2)} className="btn-primary">
                      Continue to Confirmation
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Confirm Order */}
              {step === 2 && (
                <div className="checkout-section">
                  <h2 className="section-title">Confirm Your Order</h2>
                  
                  <div className="confirmation-section">
                    <div className="address-header">
                      <h3>Shipping Address</h3>
                      <button 
                        onClick={() => navigate('/profile')} 
                        className="btn-edit-address"
                      >
                        Edit in Profile
                      </button>
                    </div>
                    <div className="address-display">
                      <p>{shippingAddress.address_1}</p>
                      {shippingAddress.address_2 && <p>{shippingAddress.address_2}</p>}
                      <p>{shippingAddress.city}, {shippingAddress.state_code || shippingAddress.state} {shippingAddress.postcode}</p>
                      <p>{shippingAddress.country}</p>
                    </div>
                  </div>

                  <div className="confirmation-section">
                    <h3>Order Items</h3>
                    <div className="items-summary">
                      {cart.map((item) => (
                        <div key={item._id} className="summary-item">
                          <span>{item.name} × {item.quantity}</span>
                          <span>${(Number(item.price) * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ADD THIS NEW SECTION */}
                  <div className="confirmation-section">
                    <h3>Attachment <span style={{ color: '#dc2626' }}>*</span></h3>
                    <div className="form-group">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={handleFileChange}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                        }}
                      />
                      {attachmentError && (
                        <div style={{ 
                          color: '#dc2626', 
                          fontSize: '13px', 
                          marginTop: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}>
                          <AlertCircle size={14} />
                          <span>{attachmentError}</span>
                        </div>
                      )}
                      {attachment && !attachmentError && (
                        <div style={{ 
                          color: '#16a34a', 
                          fontSize: '13px', 
                          marginTop: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}>
                          <CheckCircle size={14} />
                          <span>✓ {attachment.name} ({(attachment.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="checkout-actions">
                    <button onClick={() => setStep(1)} className="btn-secondary" disabled={loading}>
                      Back
                    </button>
                    <button 
                      onClick={handlePlaceOrder} 
                      className="btn-primary"
                      disabled={loading || !attachment || attachmentError}
                    >
                      {loading ? (
                        <>
                          <Loader className="spinner" size={18} />
                          Placing Order...
                        </>
                      ) : (
                        'Place Order'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
            )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="checkout-sidebar">
              <div className="order-summary-card">
                <h3>Order Summary</h3>
                
                <div className="summary-row">
                  <span>Items ({cart.reduce((sum, item) => sum + item.quantity, 0)})</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>

                <div className="summary-row">
                  <span>Shipping</span>
                  <span>Calculated at fulfillment</span>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-row summary-total">
                  <span>Total</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>

                <p className="summary-note">
                  Final shipping costs will be calculated by our fulfillment center
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}