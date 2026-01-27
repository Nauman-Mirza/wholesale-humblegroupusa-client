import { useState, useEffect } from 'react';
import { Package, Calendar, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { orderApi } from '../api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Loading from '../components/Loading';

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async (page = 1) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await orderApi.getOrders(page, 10);
      const data = response.data?.[0] || response.data || {};
      
      setOrders(data.items || []);
      setPagination(data.pagination || {});
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${STORAGE_URL}/${path}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (loading && orders.length === 0) {
    return (
      <>
        <Header />
        <Loading />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container">
        <div className="orders-page">
          <h1 className="page-title">My Orders</h1>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {orders.length === 0 ? (
            <div className="empty-orders">
              <Package size={64} strokeWidth={1} />
              <h3>No orders yet</h3>
              <p>You haven't placed any orders yet.</p>
            </div>
          ) : (
            <>
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order._id} className="order-card">
                    <div className="order-header" onClick={() => toggleOrder(order._id)}>
                      <div className="order-header-left">
                        <div className="order-info">
                          <span className="order-label">Order ID:</span>
                          <span className="order-value">{order._id}</span>
                        </div>
                      </div>
                      
                      <div className="order-header-right">
                        <div className="order-meta">
                          <div className="order-meta-item">
                            <Calendar size={16} />
                            <span>{formatDate(order.created_at)}</span>
                          </div>
                          <div className="order-meta-item">
                            <DollarSign size={16} />
                            <span>${Number(order.total || 0).toFixed(2)}</span>
                          </div>
                        </div>
                        <button className="expand-btn">
                          {expandedOrder === order._id ? (
                            <ChevronUp size={20} />
                          ) : (
                            <ChevronDown size={20} />
                          )}
                        </button>
                      </div>
                    </div>

                    {expandedOrder === order._id && (
                      <div className="order-details">
                        <h4 className="order-details-title">Order Items</h4>
                        <div className="order-items">
                          {order.items && order.items.length > 0 ? (
                            order.items.map((item, index) => {
                              const product = item.product;
                              const image = product?.images?.[0] ? getImageUrl(product.images[0]) : null;

                              return (
                                <div key={index} className="order-item">
                                  <div className="order-item-image">
                                    {image ? (
                                      <img src={image} alt={product?.name || 'Product'} />
                                    ) : (
                                      <div className="order-item-placeholder">
                                        <Package size={24} />
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="order-item-details">
                                    <h5>{product?.name || 'Product'}</h5>
                                    {product?.sku && (
                                      <p className="order-item-sku">SKU: {product.sku}</p>
                                    )}
                                  </div>
                                  
                                  <div className="order-item-quantity">
                                    <span>Qty: {item.quantity}</span>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <p className="no-items">No items found</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {pagination.last_page > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    disabled={pagination.current_page === 1}
                    onClick={() => loadOrders(pagination.current_page - 1)}
                  >
                    Previous
                  </button>
                  
                  <span className="pagination-info">
                    Page {pagination.current_page} of {pagination.last_page}
                  </span>
                  
                  <button
                    className="pagination-btn"
                    disabled={pagination.current_page === pagination.last_page}
                    onClick={() => loadOrders(pagination.current_page + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}