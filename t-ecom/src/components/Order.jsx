import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import { formatUsd } from '../utils/currency';

const Order = () => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/orders`);
        setOrders(response.data);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setError('Failed to fetch orders. Please try again later.');
        setLoading(false);
      }
    };

    fetchOrders();
  }, [baseUrl]);

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));
  };

  const statusPillClass = (status) => {
    switch (status) {
      case 'PLACED':
        return 'status-pill status-pill-placed';
      case 'SHIPPED':
        return 'status-pill status-pill-shipped';
      case 'DELIVERED':
        return 'status-pill status-pill-delivered';
      case 'CANCELLED':
        return 'status-pill status-pill-cancelled';
      default:
        return 'status-pill status-pill-default';
    }
  };

  const calculateOrderTotal = (items) =>
    items.reduce((total, item) => total + item.totalPrice, 0);

  const stats = useMemo(() => {
    const n = orders.length;
    const delivered = orders.filter((o) => o.status === 'DELIVERED').length;
    const revenue = orders.reduce(
      (s, o) => s + o.items.reduce((t, i) => t + i.totalPrice, 0),
      0
    );
    return { n, delivered, revenue };
  }, [orders]);

  if (loading) {
    return (
      <div className="page-shell container d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <div className="spinner-border loader-app" role="status">
            <span className="visually-hidden">Loading…</span>
          </div>
          <p className="page-lead mt-3 mb-0">Loading orders…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell container">
        <div className="alert alert-app-error" role="alert">
          <i className="bi bi-wifi-off me-2" aria-hidden />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell container">
      <div className="page-header-block">
        <h1 className="page-title">Orders</h1>
        <p className="page-lead">Review customer orders and line items at a glance.</p>
      </div>

      <div className="orders-stats">
        <div className="stat-chip">
          <strong>{stats.n}</strong>
          <span>Total orders</span>
        </div>
        <div className="stat-chip">
          <strong>{stats.delivered}</strong>
          <span>Delivered</span>
        </div>
        <div className="stat-chip">
          <strong>{formatUsd(stats.revenue)}</strong>
          <span>Combined total</span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="surface-card">
          <div className="surface-card-body text-center py-5">
            <i className="bi bi-inbox display-4 text-muted opacity-50 d-block mb-3" aria-hidden />
            <h2 className="h5 text-muted">No orders yet</h2>
            <p className="page-lead mb-0">When customers check out, their orders will show up here.</p>
          </div>
        </div>
      ) : (
        orders.map((order) => {
          const total = formatUsd(calculateOrderTotal(order.items));
          const open = expandedOrder === order.orderId;

          return (
            <div key={order.orderId} className="order-card">
              <button
                type="button"
                className="order-card-top text-start border-0 bg-transparent"
                onClick={() => toggleOrderDetails(order.orderId)}
                aria-expanded={open}
              >
                <div className="order-card-summary">
                  <div className="fw-bold fs-6">#{order.orderId}</div>
                  <div className="order-meta-compact mt-1">
                    <small>{order.customerName}</small>
                    <small>{order.email}</small>
                  </div>
                </div>
                <div className="order-card-status">
                  <span className={statusPillClass(order.status)}>{order.status}</span>
                </div>
                <div className="order-card-amount">
                  <div className="fw-bold">{total}</div>
                  <small className="text-muted d-block">{new Date(order.orderDate).toLocaleString()}</small>
                </div>
                <div className="order-card-status">
                  <span className="order-expand-btn">
                    {open ? 'Hide' : 'Details'}
                    <i className={`bi bi-chevron-${open ? 'up' : 'down'}`} aria-hidden />
                  </span>
                </div>
              </button>

              {open && (
                <div className="order-items-panel">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="form-section-title mb-0">{order.items.length} line item(s)</span>
                    <span className="fw-bold">{total}</span>
                  </div>
                  {order.items.map((item, index) => (
                    <div key={index} className="order-line">
                      <span>{item.productName}</span>
                      <span className="text-muted">
                        ×{item.quantity} · {formatUsd(item.totalPrice)}
                      </span>
                    </div>
                  ))}
                  <div className="order-line order-line-total d-flex justify-content-between">
                    <span>Order total</span>
                    <span>{total}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default Order;
