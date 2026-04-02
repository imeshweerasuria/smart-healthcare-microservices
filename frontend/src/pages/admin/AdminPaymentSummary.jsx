import { useEffect, useState } from "react";
import axios from "axios";
import { API, authHeaders } from "../../api/client";
import { Link, useNavigate } from "react-router-dom";
import { clearSession, getName } from "../../api/auth";

export default function AdminPaymentSummary() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const logout = () => {
    clearSession();
    navigate("/login");
  };

  const loadSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API.payment}/payments/summary`, {
        headers: authHeaders(),
      });
      setSummary(res.data);
    } catch (err) {
      console.error("Failed to load payment summary:", err);
      setError(err.response?.data?.message || "Failed to load payment summary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const formatCurrency = (amount, currency) => {
    if (amount === null || amount === undefined) return null;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const navItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/admin/doctors", label: "Manage Doctors", icon: "👨‍⚕️" },
    { path: "/admin/patients", label: "Manage Patients", icon: "👤" },
    { path: "/admin/appointments", label: "Appointments", icon: "📅" },
    { path: "/admin/payments", label: "Payment Summary", icon: "💰", active: true },
    { path: "/admin/reports", label: "Reports", icon: "📋" },
  ];

  if (loading) {
    return (
      <div style={styles.container}>
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
              <div style={styles.adminAvatar}>{getName()?.charAt(0) || "A"}</div>
              <div>
                <div style={styles.adminName}>{getName() || "Admin"}</div>
                <div style={styles.adminRole}>Administrator</div>
              </div>
            </div>
          </div>
          <div style={styles.sidebarNav}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                style={item.active ? styles.navItemActive : styles.navItem}
                className="nav-item"
              >
                <span style={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
            <button onClick={logout} style={styles.logoutBtn} className="logout-button">
              <span style={styles.navIcon}>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
        <div style={styles.mainContent}>
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading payment summary...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div style={styles.container}>
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
              <div style={styles.adminAvatar}>{getName()?.charAt(0) || "A"}</div>
              <div>
                <div style={styles.adminName}>{getName() || "Admin"}</div>
                <div style={styles.adminRole}>Administrator</div>
              </div>
            </div>
          </div>
          <div style={styles.sidebarNav}>
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} style={styles.navItem}>
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
        <div style={styles.mainContent}>
          <div style={styles.errorContainer}>
            <div style={styles.errorIcon}>⚠️</div>
            <h3 style={styles.errorTitle}>Unable to Load Summary</h3>
            <p style={styles.errorMessage}>{error || "No payment data available"}</p>
            <button onClick={loadSummary} style={styles.retryBtn}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Payments",
      value: summary.totalCount || 0,
      icon: "💰",
      color: "#1e6f5c",
      bgColor: "#e8f5e9",
    },
    {
      label: "Paid",
      value: summary.paidCount || 0,
      icon: "✓",
      color: "#2e7d32",
      bgColor: "#e8f5e9",
      amount: formatCurrency(summary.paidAmount, summary.currency),
    },
    {
      label: "Pending",
      value: summary.pendingCount || 0,
      icon: "⏳",
      color: "#ed6c02",
      bgColor: "#fff3e0",
      amount: formatCurrency(summary.pendingAmount, summary.currency),
    },
    {
      label: "Failed",
      value: summary.failedCount || 0,
      icon: "✗",
      color: "#c62828",
      bgColor: "#ffebee",
      amount: formatCurrency(summary.failedAmount, summary.currency),
    },
     {
      label: "Refunded",
      value: summary.refundedCount || 0,
      icon: "↩️",
      color: "#c62828",
      bgColor: "#ffebee",
      amount: formatCurrency(summary.refundedAmount, summary.currency),
    },
  ];

  const successRate = summary.totalCount
    ? ((summary.paidCount / summary.totalCount) * 100).toFixed(1)
    : 0;

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
            <div style={styles.adminAvatar}>{getName()?.charAt(0) || "A"}</div>
            <div>
              <div style={styles.adminName}>{getName() || "Admin"}</div>
              <div style={styles.adminRole}>Administrator</div>
            </div>
          </div>
        </div>

        <div style={styles.sidebarNav}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={item.active ? styles.navItemActive : styles.navItem}
              className="nav-item"
            >
              <span style={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
          <button onClick={logout} style={styles.logoutBtn} className="logout-button">
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
              <h1 style={styles.title}>Payment Summary</h1>
              <p style={styles.subtitle}>Track revenue and payment analytics for consultation fees</p>
            </div>
            <div style={styles.headerActions}>
              <button onClick={loadSummary} style={styles.refreshBtn}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 12C1 12 4 4 12 4C20 4 23 12 23 12C23 12 20 20 12 20C4 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Refresh
              </button>
              <Link to="/admin/appointments" style={styles.viewAppointmentsBtn}>
                View Appointments
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <div key={index} style={styles.statCard} className="stat-card">
                <div style={{ ...styles.statIcon, backgroundColor: stat.bgColor, color: stat.color }}>
                  {stat.icon}
                </div>
                <div style={styles.statContent}>
                  <div style={styles.statLabel}>{stat.label}</div>
                  <div style={styles.statValue}>{stat.value}</div>
                  {stat.amount && <div style={styles.statAmount}>{stat.amount}</div>}
                </div>
              </div>
            ))}
          </div>

          {/* Revenue Overview */}
          <div style={styles.revenueSection}>
            <div style={styles.revenueCard} className="revenue-card">
              <div style={styles.revenueHeader}>
                <h3 style={styles.sectionTitle}>Revenue Overview</h3>
                <div style={styles.successRate}>
                  <span style={styles.successRateLabel}>Success Rate</span>
                  <span
                    style={{
                      ...styles.successRateValue,
                      color: successRate >= 70 ? "#2e7d32" : successRate >= 40 ? "#ed6c02" : "#c62828",
                    }}
                  >
                    {successRate}%
                  </span>
                </div>
              </div>
              <div style={styles.revenueContent}>
                <div style={styles.totalRevenue}>
                  <div style={styles.totalRevenueLabel}>Total Revenue</div>
                  <div style={styles.totalRevenueAmount}>
                    {formatCurrency(summary.totalRevenue, summary.currency)}
                  </div>
                  <div style={styles.totalRevenueSub}>
                    from {summary.totalCount || 0} total transactions
                  </div>
                </div>
                <div style={styles.revenueBreakdown}>
                  <div style={styles.breakdownItem}>
                    <div style={styles.breakdownLabel}>
                      <span style={styles.paidDot}></span>
                      Paid 
                    </div>
                    <div style={styles.breakdownValue}>
                      {formatCurrency(summary.paidAmount, summary.currency)}
                    </div>
                    <div style={styles.breakdownCount}>
                      ({summary.paidCount || 0} transactions)
                    </div>
                  </div>
                  <div style={styles.breakdownItem}>
                    <div style={styles.breakdownLabel}>
                      <span style={styles.pendingDot}></span>
                      Pending 
                    </div>
                    <div style={styles.breakdownValue}>
                      {formatCurrency(summary.pendingAmount, summary.currency)}
                    </div>
                    <div style={styles.breakdownCount}>
                      ({summary.pendingCount || 0} transactions)
                    </div>
                  </div>
                  <div style={styles.breakdownItem}>
                    <div style={styles.breakdownLabel}>
                      <span style={styles.failedDot}></span>
                      Failed 
                    </div>
                    <div style={styles.breakdownValue}>
                      {formatCurrency(summary.failedAmount, summary.currency)}
                    </div>
                    <div style={styles.breakdownCount}>
                      ({summary.failedCount || 0} transactions)
                    </div>                    
                  </div>
                 
                  <div style={styles.breakdownItem}>
                    <div style={styles.breakdownLabel}>
                      <span style={styles.failedDot}></span>
                      Refunded
                    </div>
                    <div style={styles.breakdownValue}>
                      {formatCurrency(summary.refundedAmount, summary.currency)}
                    </div>
                    <div style={styles.breakdownCount}>
                      ({summary.refundedCount || 0} transactions)
                    </div>
                    
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Status Distribution */}
          <div style={styles.distributionSection}>
            <h3 style={styles.sectionTitle}>Payment Status Distribution</h3>
            <div style={styles.distributionBars}>
              {summary.totalCount > 0 && (
                <>
                  <div style={styles.distributionItem}>
                    <div style={styles.distributionHeader}>
                      <span style={styles.distributionLabel}>
                        <span style={styles.paidDot}></span>
                        Paid
                      </span>
                      <span style={styles.distributionPercent}>
                        {((summary.paidCount / summary.totalCount) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div style={styles.barContainer}>
                      <div
                        style={{
                          ...styles.barFill,
                          width: `${(summary.paidCount / summary.totalCount) * 100}%`,
                          backgroundColor: "#2e7d32",
                        }}
                      ></div>
                    </div>
                    <div style={styles.distributionCount}>
                      {summary.paidCount} of {summary.totalCount} payments
                    </div>
                  </div>

                  <div style={styles.distributionItem}>
                    <div style={styles.distributionHeader}>
                      <span style={styles.distributionLabel}>
                        <span style={styles.pendingDot}></span>
                        Pending
                      </span>
                      <span style={styles.distributionPercent}>
                        {((summary.pendingCount / summary.totalCount) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div style={styles.barContainer}>
                      <div
                        style={{
                          ...styles.barFill,
                          width: `${(summary.pendingCount / summary.totalCount) * 100}%`,
                          backgroundColor: "#ed6c02",
                        }}
                      ></div>
                    </div>
                    <div style={styles.distributionCount}>
                      {summary.pendingCount} of {summary.totalCount} payments
                    </div>
                  </div>

                  <div style={styles.distributionItem}>
                    <div style={styles.distributionHeader}>
                      <span style={styles.distributionLabel}>
                        <span style={styles.failedDot}></span>
                        Failed
                      </span>
                      <span style={styles.distributionPercent}>
                        {((summary.failedCount / summary.totalCount) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div style={styles.barContainer}>
                      <div
                        style={{
                          ...styles.barFill,
                          width: `${(summary.failedCount / summary.totalCount) * 100}%`,
                          backgroundColor: "#c62828",
                        }}
                      ></div>
                    </div>
                    <div style={styles.distributionCount}>
                      {summary.failedCount} of {summary.totalCount} payments
                    </div>
                  </div>
                  <div style={styles.distributionItem}>
  <div style={styles.distributionHeader}>
    <span style={styles.distributionLabel}>
      <span style={styles.refundedDot}></span>
      Refunded
    </span>
    <span style={styles.distributionPercent}>
      {((summary.refundedCount / summary.totalCount) * 100).toFixed(1)}%
    </span>
  </div>
  <div style={styles.barContainer}>
    <div
      style={{
        ...styles.barFill,
        width: `${(summary.refundedCount / summary.totalCount) * 100}%`,
        backgroundColor: "#c62828", // same as refunded color
      }}
    ></div>
  </div>
  <div style={styles.distributionCount}>
    {summary.refundedCount} of {summary.totalCount} payments
  </div>
</div>
                </>
              )}
            </div>
          </div>

          {/* Footer Stats */}
          <div style={styles.footerStats}>
            <div style={styles.footerItem}>
              <span style={styles.footerLabel}>Last Updated:</span>
              <span style={styles.footerValue}>{new Date().toLocaleString()}</span>
            </div>
            <div style={styles.footerItem}>
              <span style={styles.footerLabel}>Currency:</span>
              <span style={styles.footerValue}>{summary.currency || "USD"}</span>
            </div>
            <div style={styles.footerItem}>
              <span style={styles.footerLabel}>Consultation Fee:</span>
              <span style={styles.footerValue}>Included in revenue</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .stat-card, .revenue-card {
          transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
        }
        
        .stat-card:hover, .revenue-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px -8px rgba(0, 0, 0, 0.12);
        }
        
        .nav-item {
          transition: all 0.2s ease;
        }
        
        .nav-item:hover {
          background-color: #f8fafc;
          transform: translateX(4px);
        }
        
        .logout-button {
          transition: all 0.2s ease;
        }
        
        .logout-button:hover {
          background-color: #fee;
          transform: translateX(4px);
        }
        
        button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        a:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(30, 111, 92, 0.2);
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    width: "100%",
    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
    fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    overflow: "hidden",
  },
  sidebar: {
    width: "280px",
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    backdropFilter: "blur(10px)",
    borderRight: "1px solid rgba(0, 0, 0, 0.05)",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    overflowY: "auto",
    zIndex: 100,
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
    background: "linear-gradient(135deg, #1e6f5c 0%, #289b82 100%)",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
    boxShadow: "0 4px 10px rgba(30, 111, 92, 0.2)",
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
    background: "linear-gradient(135deg, #e8f5e9 0%, #d4ede8 100%)",
    borderRadius: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#1e6f5c",
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
    fontSize: "14px",
    fontWeight: "500",
  },
  navItemActive: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #e8f5e9 0%, #e0f2ef 100%)",
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
  },
  mainContent: {
    flex: 1,
    marginLeft: "280px",
    padding: "40px",
    width: "calc(100% - 280px)",
    height: "100vh",
    overflowY: "auto",
    boxSizing: "border-box",
  },
  content: {
    maxWidth: "1400px",
    margin: "0 auto",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #e2e8f0",
    borderTopColor: "#1e6f5c",
    borderRadius: "50%",
    animation: "spin 0.6s linear infinite",
  },
  loadingText: {
    marginTop: "16px",
    color: "#5e7a93",
    fontSize: "14px",
  },
  errorContainer: {
    textAlign: "center",
    padding: "80px 20px",
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    maxWidth: "500px",
    margin: "80px auto",
  },
  errorIcon: {
    fontSize: "64px",
    marginBottom: "16px",
  },
  errorTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1a2c3e",
    marginBottom: "8px",
  },
  errorMessage: {
    fontSize: "14px",
    color: "#5e7a93",
    marginBottom: "24px",
  },
  retryBtn: {
    padding: "12px 24px",
    backgroundColor: "#1e6f5c",
    color: "#ffffff",
    border: "none",
    borderRadius: "40px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "inherit",
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
    fontWeight: "700",
    color: "#1a2c3e",
    margin: "0 0 8px 0",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "15px",
    color: "#5e7a93",
    margin: 0,
  },
  headerActions: {
    display: "flex",
    gap: "12px",
  },
  refreshBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: "#ffffff",
    border: "1.5px solid #e2e8f0",
    borderRadius: "40px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#1e6f5c",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  viewAppointmentsBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: "#1e6f5c",
    border: "none",
    borderRadius: "40px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#ffffff",
    textDecoration: "none",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "20px",
    marginBottom: "32px",
  },
  statCard: {
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    padding: "24px",
    display: "flex",
    gap: "16px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  },
  statIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#5e7a93",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "8px",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1a2c3e",
  },
  statAmount: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#1e6f5c",
    marginTop: "4px",
  },
  revenueSection: {
    marginBottom: "32px",
  },
  revenueCard: {
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    padding: "32px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  },
  revenueHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "16px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1a2c3e",
    margin: 0,
  },
  successRate: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "8px 16px",
    backgroundColor: "#f8fafc",
    borderRadius: "40px",
  },
  successRateLabel: {
    fontSize: "13px",
    color: "#5e7a93",
  },
  successRateValue: {
    fontSize: "18px",
    fontWeight: "700",
  },
  revenueContent: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "32px",
  },
  totalRevenue: {
    textAlign: "center",
    padding: "24px",
    backgroundColor: "#f8fafc",
    borderRadius: "20px",
  },
  totalRevenueLabel: {
    fontSize: "14px",
    color: "#5e7a93",
    marginBottom: "12px",
  },
  totalRevenueAmount: {
    fontSize: "48px",
    fontWeight: "700",
    color: "#1e6f5c",
    marginBottom: "8px",
  },
  totalRevenueSub: {
    fontSize: "13px",
    color: "#8aa0b3",
  },
  revenueBreakdown: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    justifyContent: "center",
  },
  breakdownItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid #eef2f6",
  },
  breakdownLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#5e7a93",
  },
  breakdownValue: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1a2c3e",
  },
  breakdownCount: {
    fontSize: "12px",
    color: "#8aa0b3",
  },
  paidDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#2e7d32",
    display: "inline-block",
  },
  pendingDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#ed6c02",
    display: "inline-block",
  },
  failedDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#c62828",
    display: "inline-block",
  },
  distributionSection: {
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    padding: "32px",
    marginBottom: "24px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  },
  distributionBars: {
    marginTop: "24px",
  },
  distributionItem: {
    marginBottom: "24px",
  },
  distributionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  distributionLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#1a2c3e",
  },
  distributionPercent: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1a2c3e",
  },
  barContainer: {
    height: "8px",
    backgroundColor: "#e2e8f0",
    borderRadius: "4px",
    overflow: "hidden",
    marginBottom: "8px",
  },
  barFill: {
    height: "100%",
    borderRadius: "4px",
    transition: "width 0.3s ease",
  },
  distributionCount: {
    fontSize: "12px",
    color: "#8aa0b3",
  },
  footerStats: {
    display: "flex",
    justifyContent: "center",
    gap: "32px",
    padding: "20px",
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    flexWrap: "wrap",
  },
  footerItem: {
    display: "flex",
    gap: "8px",
    fontSize: "13px",
  },
  footerLabel: {
    color: "#5e7a93",
  },
  footerValue: {
    color: "#1a2c3e",
    fontWeight: "500",
  },
  refundedDot: {
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  backgroundColor: "#c62828", // red-ish
},
};
