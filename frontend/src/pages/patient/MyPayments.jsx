import { useEffect, useState } from "react";
import axios from "axios";
import { API, authHeaders } from "../../api/client";

export default function MyPayments() {
  const [list, setList] = useState([]);

  useEffect(() => {
    axios
      .get(`${API.payment}/payments/me`, { headers: authHeaders() })
      .then((res) => setList(res.data))
      .catch((err) => {
        console.error(err);
        alert("Failed to load payments");
      });
  }, []);

  // Helper to get status badge style
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "succeeded":
        return { bg: "#e8f5e9", color: "#2e7d32" };
      case "pending":
        return { bg: "#fff3e0", color: "#ed6c02" };
      case "failed":
      case "cancelled":
        return { bg: "#ffebee", color: "#c62828" };
      default:
        return { bg: "#f5f5f5", color: "#757575" };
    }
  };

  // Format currency
  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>My Payments</h1>
            <p style={styles.subtitle}>View your payment history and transaction details</p>
          </div>
        </div>

        {/* Payments List */}
        {list.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>💰</div>
            <p style={styles.emptyText}>No payments yet</p>
            <p style={styles.emptySubtext}>Your payment history will appear here</p>
          </div>
        ) : (
          <>
            <div style={styles.summaryCard}>
              <div style={styles.summaryIcon}>💳</div>
              <div>
                <div style={styles.summaryTitle}>Total Transactions</div>
                <div style={styles.summaryValue}>{list.length}</div>
              </div>
              <div style={styles.summaryDivider} />
              <div>
                <div style={styles.summaryTitle}>Total Spent</div>
                <div style={styles.summaryValue}>
                  {formatCurrency(
                    list.reduce((sum, p) => sum + (p.amount || 0), 0),
                    list[0]?.currency || "USD"
                  )}
                </div>
              </div>
            </div>

            <div style={styles.paymentsGrid}>
              {list.map((p) => {
                const statusStyle = getStatusStyle(p.status);
                return (
                  <div key={p._id} style={styles.paymentCard}>
                    <div style={styles.cardHeader}>
                      <div style={styles.paymentIcon}>
                        {p.provider === "stripe" ? "💳" : "🏦"}
                      </div>
                      <div style={{ ...styles.statusBadge, backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                        {p.status}
                      </div>
                    </div>
                    <div style={styles.cardBody}>
                      <div style={styles.amountRow}>
                        <span style={styles.amountLabel}>Amount</span>
                        <span style={styles.amountValue}>
                          {formatCurrency(p.amount, p.currency)}
                        </span>
                      </div>
                      <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Payment ID</span>
                        <span style={styles.infoValue}>{p._id}</span>
                      </div>
                      <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Appointment ID</span>
                        <span style={styles.infoValue}>{p.appointmentId}</span>
                      </div>
                      <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Provider</span>
                        <span style={styles.infoValue}>
                          {p.provider === "stripe" ? "Stripe" : p.provider || "N/A"}
                        </span>
                      </div>
                      <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Date</span>
                        <span style={styles.infoValue}>
                          {new Date(p.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={styles.footerStats}>
              Showing {list.length} transaction{list.length !== 1 ? "s" : ""}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    width: "100vw",
    maxWidth: "100%",
    background: "#f5f7fa",
    fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflowY: "auto",
    zIndex: 9999,
    margin: 0,
    padding: 0,
  },
  content: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "32px 24px",
    width: "100%",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "32px",
    flexWrap: "wrap",
    gap: "16px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "600",
    color: "#1a2c3e",
    margin: "0 0 8px 0",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "15px",
    color: "#5e7a93",
    margin: 0,
  },
  summaryCard: {
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    padding: "24px",
    marginBottom: "32px",
    display: "flex",
    alignItems: "center",
    gap: "24px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
    flexWrap: "wrap",
  },
  summaryIcon: {
    width: "56px",
    height: "56px",
    backgroundColor: "#e8f5e9",
    borderRadius: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
  },
  summaryTitle: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#5e7a93",
    marginBottom: "4px",
  },
  summaryValue: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1a2c3e",
    lineHeight: 1.2,
  },
  summaryDivider: {
    width: "1px",
    height: "40px",
    backgroundColor: "#eef2f6",
  },
  emptyState: {
    textAlign: "center",
    padding: "80px 20px",
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  },
  emptyIcon: {
    fontSize: "64px",
    marginBottom: "16px",
  },
  emptyText: {
    fontSize: "18px",
    fontWeight: "500",
    color: "#1a2c3e",
    marginBottom: "8px",
  },
  emptySubtext: {
    fontSize: "14px",
    color: "#5e7a93",
  },
  paymentsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
    gap: "24px",
  },
  paymentCard: {
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  cardHeader: {
    padding: "20px 24px",
    backgroundColor: "#fafcfd",
    borderBottom: "1px solid #eef2f6",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentIcon: {
    width: "48px",
    height: "48px",
    backgroundColor: "#e8f5e9",
    borderRadius: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
  },
  statusBadge: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  cardBody: {
    padding: "24px",
  },
  amountRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: "20px",
    paddingBottom: "16px",
    borderBottom: "1px solid #eef2f6",
  },
  amountLabel: {
    fontSize: "14px",
    color: "#5e7a93",
    fontWeight: "500",
  },
  amountValue: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1e6f5c",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
    fontSize: "14px",
  },
  infoLabel: {
    color: "#5e7a93",
    fontWeight: "500",
  },
  infoValue: {
    color: "#1a2c3e",
    fontWeight: "500",
    fontFamily: "monospace",
    fontSize: "13px",
    backgroundColor: "#f8fafc",
    padding: "4px 8px",
    borderRadius: "8px",
    maxWidth: "60%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  footerStats: {
    marginTop: "24px",
    textAlign: "center",
    fontSize: "13px",
    color: "#5e7a93",
    padding: "20px",
  },
};

// Add global styles to remove any parent layout constraints
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .payment-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }
  
  /* Force the component to take full viewport and remove any parent layout */
  body {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }
  
  /* Remove any sidebar or layout containers when this component mounts */
  [class*="sidebar"], 
  [class*="Sidebar"],
  [class*="layout"],
  [class*="Layout"],
  [class*="dashboard"],
  [class*="Dashboard"] {
    display: none !important;
  }
  
  /* Ensure the component's container is visible and takes full width */
  div:has(> div[style*="position: fixed"]) {
    all: unset;
    display: block !important;
    width: 100% !important;
    height: 100% !important;
  }
`;

if (typeof document !== "undefined") {
  document.head.appendChild(styleSheet);
}