import { useState, useEffect } from 'react';
import { Package, Calendar, DollarSign, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { orderApi } from '../api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Loading from '../components/Loading';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  // Export state
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportDateFrom, setExportDateFrom] = useState('');
  const [exportDateTo, setExportDateTo] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const [exportFormat, setExportFormat] = useState('csv');

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
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getExportHeaders = () => [
    'Order ID', 'Order Total ($)', 'Items Count', 'Order Date',
    'Customer Name', 'Email', 'Phone', 'Company',
    'Ship Street 1', 'Ship Street 2', 'Ship City', 'Ship State', 'Ship Postal Code', 'Ship Country',
    'SKU', 'Product Name', 'Qty', 'Unit Price ($)', 'Line Total ($)',
  ];

  const getExportRows = (rows) => {
    const csvRows = [];
    for (const order of rows) {
      for (const item of order.items ?? []) {
        csvRows.push([
          order.order_id,
          order.total,
          order.items_count,
          order.created_at?.slice(0, 10) ?? '',
          order.user_name,
          order.user_email,
          String(order.user_phone),
          order.company_name,
          order.ship_street1,
          order.ship_street2 ?? '',
          order.ship_city,
          order.ship_state,
          String(order.ship_postal_code),
          order.ship_country,
          item.sku,
          item.product_name,
          item.quantity,
          item.default_price,
          parseFloat((item.quantity * item.default_price).toFixed(2)),
        ]);
      }
    }
    return csvRows;
  };

  const getFileName = (ext) =>
    `my-orders-${exportDateFrom || 'all'}-to-${exportDateTo || 'all'}.${ext}`;

  const exportCSV = (headers, dataRows) => {
    const escape = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    const csv = [headers.map(escape).join(','), ...dataRows.map(r => r.map(escape).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    triggerDownload(blob, getFileName('csv'));
  };

  const exportExcel = (headers, dataRows) => {
    const wsData = [headers, ...dataRows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Auto-size columns
    const colWidths = headers.map((h, i) => {
      const maxLen = Math.max(
        h.length,
        ...dataRows.map(r => String(r[i] ?? '').length)
      );
      return { wch: Math.min(maxLen + 2, 40) };
    });
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orders');
    const wbOut = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbOut], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    triggerDownload(blob, getFileName('xlsx'));
  };

  const exportPDF = (headers, dataRows) => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

    doc.setFontSize(16);
    doc.text('My Orders', 40, 36);
    doc.setFontSize(10);
    doc.setTextColor(100);
    const dateRange = `${exportDateFrom || 'All'} to ${exportDateTo || 'All'}`;
    doc.text(`Date Range: ${dateRange}`, 40, 52);

    autoTable(doc, {
      head: [headers],
      body: dataRows,
      startY: 65,
      styles: { fontSize: 7, cellPadding: 4 },
      headStyles: { fillColor: [27, 58, 107], textColor: 255, fontStyle: 'bold', fontSize: 7 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { left: 20, right: 20 },
      tableWidth: 'auto',
    });

    doc.save(getFileName('pdf'));
  };

  const triggerDownload = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportError('');
    try {
      const res = await orderApi.exportOrders(exportDateFrom || undefined, exportDateTo || undefined);
      const rows = res?.data?.rows || [];

      if (!rows.length) {
        setExportError('No orders found for the selected date range.');
        return;
      }

      const headers = getExportHeaders();
      const dataRows = getExportRows(rows);

      if (exportFormat === 'csv') {
        exportCSV(headers, dataRows);
      } else if (exportFormat === 'excel') {
        exportExcel(headers, dataRows);
      } else if (exportFormat === 'pdf') {
        exportPDF(headers, dataRows);
      }

      setShowExportModal(false);
      setExportDateFrom('');
      setExportDateTo('');
      setExportFormat('csv');
    } catch (err) {
      setExportError(err?.response?.data?.message || 'Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${STORAGE_URL}/${path}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const toggleOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (loading && orders.length === 0) {
    return (<><Header /><Loading /><Footer /></>);
  }

  return (
    <>
      <Header />
      <main className="container">
        <div className="orders-page">

          {/* Page header */}
          <div className="orders-page-header">
            <h1 className="page-title">My Orders</h1>
            <button className="export-btn" onClick={() => setShowExportModal(true)}>
              <Download size={16} />
              Export Orders
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

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
                          {expandedOrder === order._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </div>
                    </div>

                    {expandedOrder === order._id && (
                      <div className="order-details">
                        <h4 className="order-details-title">Order Items</h4>
                        <div className="order-items">
                          {order.items?.length > 0 ? order.items.map((item, index) => {
                            const product = item.product;
                            const image = product?.images?.[0] ? getImageUrl(product.images[0]) : null;
                            return (
                              <div key={index} className="order-item">
                                <div className="order-item-image">
                                  {image ? (
                                    <img src={image} alt={product?.name || 'Product'} />
                                  ) : (
                                    <div className="order-item-placeholder"><Package size={24} /></div>
                                  )}
                                </div>
                                <div className="order-item-details">
                                  <h5>{product?.name || 'Product'}</h5>
                                  {product?.sku && <p className="order-item-sku">SKU: {product.sku}</p>}
                                </div>
                                <div className="order-item-quantity">
                                  <span>Qty: {item.quantity}</span>
                                </div>
                              </div>
                            );
                          }) : <p className="no-items">No items found</p>}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {pagination.last_page > 1 && (
                <div className="pagination">
                  <button className="pagination-btn" disabled={pagination.current_page === 1}
                    onClick={() => loadOrders(pagination.current_page - 1)}>Previous</button>
                  <span className="pagination-info">Page {pagination.current_page} of {pagination.last_page}</span>
                  <button className="pagination-btn" disabled={pagination.current_page === pagination.last_page}
                    onClick={() => loadOrders(pagination.current_page + 1)}>Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Export Modal */}
      {showExportModal && (
        <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Export Orders</h3>
              <button className="modal-close" onClick={() => setShowExportModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="modal-description">
                Select a date range to filter your export. Leave blank to export all orders.
              </p>
              <div className="export-date-row">
                <div className="export-date-field">
                  <label>From</label>
                  <input type="date" value={exportDateFrom}
                    onChange={(e) => setExportDateFrom(e.target.value)} />
                </div>
                <div className="export-date-field">
                  <label>To</label>
                  <input type="date" value={exportDateTo}
                    onChange={(e) => setExportDateTo(e.target.value)} />
                </div>
              </div>

              {/* Export Format Selection */}
              <div className="export-format-section">
                <label className="export-format-label">Export Format</label>
                <div className="export-format-options">
                  <label className={`export-format-option${exportFormat === 'csv' ? ' active' : ''}`}>
                    <input
                      type="radio"
                      name="exportFormat"
                      value="csv"
                      checked={exportFormat === 'csv'}
                      onChange={(e) => setExportFormat(e.target.value)}
                    />
                    <span className="format-icon">📄</span>
                    <span className="format-details">
                      <span className="format-name">CSV</span>
                      <span className="format-desc">Comma-separated values</span>
                    </span>
                  </label>
                  <label className={`export-format-option${exportFormat === 'excel' ? ' active' : ''}`}>
                    <input
                      type="radio"
                      name="exportFormat"
                      value="excel"
                      checked={exportFormat === 'excel'}
                      onChange={(e) => setExportFormat(e.target.value)}
                    />
                    <span className="format-icon">📊</span>
                    <span className="format-details">
                      <span className="format-name">Excel</span>
                      <span className="format-desc">XLSX spreadsheet</span>
                    </span>
                  </label>
                  <label className={`export-format-option${exportFormat === 'pdf' ? ' active' : ''}`}>
                    <input
                      type="radio"
                      name="exportFormat"
                      value="pdf"
                      checked={exportFormat === 'pdf'}
                      onChange={(e) => setExportFormat(e.target.value)}
                    />
                    <span className="format-icon">📕</span>
                    <span className="format-details">
                      <span className="format-name">PDF</span>
                      <span className="format-desc">Printable document</span>
                    </span>
                  </label>
                </div>
              </div>

              {exportError && <p className="export-error">{exportError}</p>}
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowExportModal(false)}>Cancel</button>
              <button className="btn-export" onClick={handleExport} disabled={isExporting}>
                <Download size={15} />
                {isExporting ? 'Exporting...' : `Download ${exportFormat === 'excel' ? 'XLSX' : exportFormat.toUpperCase()}`}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}