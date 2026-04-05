import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { API, authHeaders } from "../../api/client";
import { clearSession, getName } from "../../api/auth";

export default function MyPayments() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    axios
      .get(`${API.payment}/payments/me`, { headers: authHeaders() })
      .then((res) => setList(res.data))
      .catch((err) => {
        console.error(err);
        alert("Failed to load payments");
      });
  }, []);

  const logout = () => {
    clearSession();
    navigate("/login");
  };

  const navItems = [
    { path: "/patient/profile", label: "My Profile", icon: "👤" },
    { path: "/patient/medical-record", label: "My Medical Record", icon: "📋" },
    { path: "/patient/doctors", label: "Browse Doctors", icon: "👨‍⚕️" },
    { path: "/patient/appointments", label: "My Appointments", icon: "📅" },
    { path: "/patient/upload", label: "Upload Medical Reports", icon: "📤" },
    { path: "/patient/reports", label: "My Reports", icon: "📊" },
    { path: "/patient/prescriptions", label: "My Prescriptions", icon: "💊" },
    { path: "/patient/payments", label: "My Payments", icon: "💰", active: true },
  ];

  // Filter payments based on active tab
  const getFilteredPayments = () => {
    switch (activeTab) {
      case "paid":
        return list.filter(p => p.status?.toLowerCase() === "paid");
      case "pending":
        return list.filter(p => p.status?.toLowerCase() === "pending");
      case "failed":
        return list.filter(p => p.status?.toLowerCase() === "failed");
      case "refunded":
        return list.filter(p => p.status?.toLowerCase() === "refunded");
      default:
        return list;
    }
  };

  const filteredList = getFilteredPayments();

  // Get count for each status
  const getCount = (status) => {
    switch (status) {
      case "paid":
        return list.filter(p => p.status?.toLowerCase() === "paid").length;
      case "pending":
        return list.filter(p => p.status?.toLowerCase() === "pending").length;
      case "failed":
        return list.filter(p => p.status?.toLowerCase() === "failed").length;
      case "refunded":
        return list.filter(p => p.status?.toLowerCase() === "refunded").length;
      default:
        return list.length;
    }
  };

  // Helper to get status badge style
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
      case "completed":
      case "succeeded":
        return { bg: "#e8f5e9", color: "#2e7d32" };
      case "pending":
        return { bg: "#fff3e0", color: "#ed6c02" };
      case "failed":
      case "cancelled":
        return { bg: "#ffebee", color: "#c62828" };
      case "refunded":
        return { bg: "#e0f7fa", color: "#006064" };
      default:
        return { bg: "#f5f5f5", color: "#757575" };
    }
  };

  // Format currency
  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: currency || "LKR",
    }).format((amount || 0) / 100);
  };

  // Calculate totals
  const totalSpent = list.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalRefunded = list.reduce((sum, p) => {
    if (p.status?.toLowerCase() === "refunded") {
      return sum + (p.amount || 0);
    }
    return sum;
  }, 0);
  const netTotal = totalSpent - totalRefunded;

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15 8H22L16 12L19 18L12 14L5 18L8 12L2 8H9L12 2Z" fill="currentColor"/>
              </svg>
            </div>
            <div style={styles.logoText}>
              Medi<span style={styles.logoSpan}>Book</span>
            </div>
          </div>
          <div style={styles.adminInfo}>
            <div style={styles.adminAvatar}>{getName()?.charAt(0) || "P"}</div>
            <div>
              <div style={styles.adminName}>{getName() || "Patient"}</div>
              <div style={styles.adminRole}>Patient</div>
            </div>
          </div>
        </div>
        
        <div style={styles.sidebarNav}>
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} style={item.active ? styles.navItemActive : styles.navItem}>
              <span style={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
          <button onClick={logout} style={styles.logoutBtn}>
            <span style={styles.navIcon}>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.content}>
          {/* Header */}
          <div style={styles.header}>
            <div>
              <h1 style={styles.title}>My Payments</h1>
              <p style={styles.subtitle}>View your payment history and transaction details</p>
            </div>
          </div>

          {/* Tabs */}
          <div style={styles.tabsContainer}>
            <button
              onClick={() => setActiveTab("all")}
              style={{
                ...styles.tab,
                ...(activeTab === "all" ? styles.tabActive : {}),
              }}
            >
              All
              <span style={styles.tabCount}>{getCount("all")}</span>
            </button>
            <button
              onClick={() => setActiveTab("paid")}
              style={{
                ...styles.tab,
                ...(activeTab === "paid" ? styles.tabActive : {}),
              }}
            >
              Paid
              <span style={styles.tabCount}>{getCount("paid")}</span>
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              style={{
                ...styles.tab,
                ...(activeTab === "pending" ? styles.tabActive : {}),
              }}
            >
              Pending
              <span style={styles.tabCount}>{getCount("pending")}</span>
            </button>
            <button
              onClick={() => setActiveTab("failed")}
              style={{
                ...styles.tab,
                ...(activeTab === "failed" ? styles.tabActive : {}),
              }}
            >
              Failed
              <span style={styles.tabCount}>{getCount("failed")}</span>
            </button>
            <button
              onClick={() => setActiveTab("refunded")}
              style={{
                ...styles.tab,
                ...(activeTab === "refunded" ? styles.tabActive : {}),
              }}
            >
              Refunded
              <span style={styles.tabCount}>{getCount("refunded")}</span>
            </button>
          </div>

          {/* Payments List */}
          {filteredList.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>💰</div>
              <p style={styles.emptyText}>No {activeTab !== "all" ? activeTab : ""} payments yet</p>
              <p style={styles.emptySubtext}>
                {activeTab !== "all" 
                  ? `You don't have any ${activeTab} payments in your history`
                  : "Your payment history will appear here"}
              </p>
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
                    {formatCurrency(totalSpent, list[0]?.currency || "LKR")}
                  </div>
                </div>
                <div style={styles.summaryDivider} />
                <div>
                  <div style={styles.summaryTitle}>Total Refunded</div>
                  <div style={{ ...styles.summaryValue, color: "#006064" }}>
                    {formatCurrency(totalRefunded, list[0]?.currency || "LKR")}
                  </div>
                </div>
                <div style={styles.summaryDivider} />
                <div>
                  <div style={styles.summaryTitle}>Net Total</div>
                  <div style={{ ...styles.summaryValue, color: "#1e6f5c" }}>
                    {formatCurrency(netTotal, list[0]?.currency || "LKR")}
                  </div>
                </div>
              </div>

              <div style={styles.paymentsGrid}>
                {filteredList.map((p) => {
                  const statusStyle = getStatusStyle(p.status);
                  const isRefunded = p.status?.toLowerCase() === "refunded";
                  
                  return (
                    <div key={p._id} style={styles.paymentCard}>
                      <div style={styles.cardHeader}>
                        <div style={styles.paymentIcon}>
                          {isRefunded ? "↩️" : (p.provider === "stripe" ? "💳" : "🏦")}
                        </div>
                        <div style={{ ...styles.statusBadge, backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                          {p.status}
                        </div>
                      </div>
                      <div style={styles.cardBody}>
                        <div style={styles.amountRow}>
                          <span style={styles.amountLabel}>Amount</span>
                          <span style={{ 
                            ...styles.amountValue, 
                            color: isRefunded ? "#006064" : "#1e6f5c",
                            textDecoration: isRefunded ? "line-through" : "none"
                          }}>
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
                Showing {filteredList.length} transaction{filteredList.length !== 1 ? "s" : ""}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    width: "100vw",
    background: "#f5f7fa",
    fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    margin: 0,
    padding: 0,
    overflowX: "hidden",
    position: "relative",
  },
  sidebar: {
    width: "280px",
    backgroundColor: "#ffffff",
    borderRight: "1px solid #eef2f6",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    overflowY: "auto",
    zIndex: 100,
    flexShrink: 0,
  },
  sidebarHeader: {
    padding: "32px 24px",
    borderBottom: "1px solid #eef2f6",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "32px",
  },
  logoIcon: {
    width: "36px",
    height: "36px",
    backgroundColor: "#1e6f5c",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
  },
  logoText: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1a2c3e",
  },
  logoSpan: {
    fontWeight: "400",
    color: "#1e6f5c",
  },
  adminInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  adminAvatar: {
    width: "48px",
    height: "48px",
    backgroundColor: "#1e6f5c",
    borderRadius: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
    fontSize: "20px",
    fontWeight: "600",
  },
  adminName: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#1a2c3e",
  },
  adminRole: {
    fontSize: "12px",
    color: "#5e7a93",
    marginTop: "2px",
  },
  sidebarNav: {
    flex: 1,
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "12px",
    color: "#5e7a93",
    textDecoration: "none",
    transition: "all 0.2s ease",
    fontSize: "14px",
    fontWeight: "500",
  },
  navItemActive: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "12px",
    backgroundColor: "#e8f5e9",
    color: "#1e6f5c",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "600",
  },
  navIcon: {
    fontSize: "18px",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "transparent",
    color: "#d32f2f",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    fontFamily: "inherit",
    marginTop: "auto",
    transition: "all 0.2s ease",
  },
  mainContent: {
    flex: 1,
    marginLeft: "280px",
    width: "calc(100% - 280px)",
    minHeight: "100vh",
    backgroundColor: "#f5f7fa",
    padding: "32px 48px",
    boxSizing: "border-box",
  },
  content: {
    maxWidth: "1200px",
    margin: "0 auto",
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
  tabsContainer: {
    display: "flex",
    gap: "12px",
    marginBottom: "32px",
    borderBottom: "2px solid #eef2f6",
    paddingBottom: "0",
    flexWrap: "wrap",
  },
  tab: {
    padding: "12px 20px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#5e7a93",
    background: "none",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    borderRadius: "12px 12px 0 0",
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  tabActive: {
    color: "#1e6f5c",
    backgroundColor: "#e8f5e9",
  },
  tabCount: {
    backgroundColor: "#eef2f6",
    padding: "2px 8px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
    color: "#5e7a93",
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