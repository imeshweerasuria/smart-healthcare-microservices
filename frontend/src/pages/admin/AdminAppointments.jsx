import { useEffect, useState } from "react";
import axios from "axios";
import { API, authHeaders } from "../../api/client";
import { Link, useNavigate } from "react-router-dom";
import { clearSession, getName } from "../../api/auth";

export default function AdminAppointments() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const logout = () => {
    clearSession();
    navigate("/login");
  };

  const load = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API.appointment}/appointments/admin/all`, {
        headers: authHeaders(),
      });
      setList(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Filter appointments - UPDATED with patientName, doctorName, slotNumber search
  const filteredAppointments = list.filter((a) => {
    const appointmentStatus = (a.status || "").toUpperCase();
    const filterStatus = filter.toUpperCase();
    const matchesFilter = filter === "ALL" || appointmentStatus === filterStatus;
    
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      searchTerm === "" ||
      (a._id || "").toLowerCase().includes(q) ||
      (a.patientId || "").toLowerCase().includes(q) ||
      (a.patientName || "").toLowerCase().includes(q) ||
      (a.doctorId || "").toLowerCase().includes(q) ||
      (a.doctorName || "").toLowerCase().includes(q) ||
      (a.reason || "").toLowerCase().includes(q) ||
      String(a.slotNumber || "").toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    const upperStatus = (status || "").toUpperCase();
    switch (upperStatus) {
      case "CONFIRMED":
        return { bg: "#e8f5e9", text: "#2e7d32", dot: "#4caf50" };
      case "PENDING":
        return { bg: "#fff3e0", text: "#ed6c02", dot: "#ff9800" };
      case "COMPLETED":
        return { bg: "#ede7f6", text: "#6a1b9a", dot: "#9c27b0" };
      case "CANCELLED":
        return { bg: "#ffebee", text: "#d32f2f", dot: "#f44336" };
      case "ACCEPTED":
        return { bg: "#e3f2fd", text: "#1565c0", dot: "#2196f3" };
      case "REJECTED":
        return { bg: "#f5f5f5", text: "#616161", dot: "#9e9e9e" };
      default:
        return { bg: "#f5f5f5", text: "#757575", dot: "#9e9e9e" };
    }
  };

  const getPaymentColor = (status) => {
    const upperStatus = (status || "").toUpperCase();
    switch (upperStatus) {
      case "PAID":
        return { bg: "#e8f5e9", text: "#2e7d32" };
      case "PENDING":
        return { bg: "#fff3e0", text: "#ed6c02" };
      case "FAILED":
        return { bg: "#ffebee", text: "#d32f2f" };
      case "UNPAID":
        return { bg: "#ffebee", text: "#c62828" };
      default:
        return { bg: "#f5f5f5", text: "#757575" };
    }
  };

  const formatDate = (datetime) => {
    if (!datetime) return "N/A";
    const date = new Date(datetime);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = {
    total: list.length,
    pending: list.filter(a => (a.status || "").toUpperCase() === "PENDING").length,
    confirmed: list.filter(a => (a.status || "").toUpperCase() === "CONFIRMED").length,
    completed: list.filter(a => (a.status || "").toUpperCase() === "COMPLETED").length,
    cancelled: list.filter(a => (a.status || "").toUpperCase() === "CANCELLED").length,
    accepted: list.filter(a => (a.status || "").toUpperCase() === "ACCEPTED").length,
  };

  const navItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/admin/doctors", label: "Manage Doctors", icon: "👨‍⚕️" },
    { path: "/admin/patients", label: "Manage Patients", icon: "👤" },
    { path: "/admin/appointments", label: "Appointments", icon: "📅", active: true },
    { path: "/admin/payments", label: "Payment Summary", icon: "💰" },
    { path: "/admin/reports", label: "Reports", icon: "📋" },
  ];

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
          <div style={styles.header}>
            <div>
              <h1 style={styles.title}>Appointment Management</h1>
              <p style={styles.subtitle}>Monitor and manage all appointments across the platform</p>
            </div>
            <button onClick={load} style={styles.refreshBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 12C1 12 4 4 12 4C20 4 23 12 23 12C23 12 20 20 12 20C4 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Refresh
            </button>
          </div>

          {/* Stats Cards */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>📋</div>
              <div>
                <div style={styles.statValue}>{stats.total}</div>
                <div style={styles.statLabel}>Total Appointments</div>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>⏳</div>
              <div>
                <div style={styles.statValue}>{stats.pending}</div>
                <div style={styles.statLabel}>Pending</div>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>✓</div>
              <div>
                <div style={styles.statValue}>{stats.confirmed}</div>
                <div style={styles.statLabel}>Confirmed</div>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>✅</div>
              <div>
                <div style={styles.statValue}>{stats.completed}</div>
                <div style={styles.statLabel}>Completed</div>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>❌</div>
              <div>
                <div style={styles.statValue}>{stats.cancelled}</div>
                <div style={styles.statLabel}>Cancelled</div>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>📌</div>
              <div>
                <div style={styles.statValue}>{stats.accepted}</div>
                <div style={styles.statLabel}>Accepted</div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div style={styles.filterSection}>
            <div style={styles.filterTabs}>
              {["ALL", "PENDING", "ACCEPTED", "CONFIRMED", "COMPLETED", "CANCELLED", "REJECTED"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  style={filter === s ? { ...styles.filterBtn, ...styles.filterBtnActive } : styles.filterBtn}
                >
                  {s}
                </button>
              ))}
            </div>

            <div style={styles.searchWrapper}>
              <svg style={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                type="text"
                placeholder="Search by appointment ID, patient name, doctor name, slot, or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>
          </div>

          {/* Appointments List */}
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p style={styles.loadingText}>Loading appointments...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📅</div>
              <p style={styles.emptyText}>No appointments found</p>
              <p style={styles.emptySubtext}>Try adjusting your filters or search criteria</p>
            </div>
          ) : (
            <>
              <div style={styles.appointmentsGrid}>
                {filteredAppointments.map((a) => {
                  const statusStyle = getStatusColor(a.status);
                  const paymentStyle = getPaymentColor(a.paymentStatus);

                  return (
                    <div key={a._id} style={styles.appointmentCard} className="appointment-card">
                      <div style={styles.cardHeader}>
                        <div style={styles.cardId}>
                          <span style={styles.idLabel}>Appointment ID:</span>
                          <span style={styles.idValue}>{a._id}</span>
                        </div>
                        <div style={{ ...styles.statusBadge, backgroundColor: statusStyle.bg, color: statusStyle.text }}>
                          <span style={{ ...styles.statusDot, backgroundColor: statusStyle.dot }}></span>
                          {a.status || "UNKNOWN"}
                        </div>
                      </div>

                      <div style={styles.cardContent}>
                        <div style={styles.infoRow}>
                          <div style={styles.infoItem}>
                            <span style={styles.infoIcon}>👤</span>
                            <div>
                              <div style={styles.infoLabel}>Patient</div>
                              <div style={styles.infoValue}>{a.patientName || "Unknown Patient"}</div>
                              <div style={styles.infoSubValue}>ID: {a.patientId || "-"}</div>
                            </div>
                          </div>

                          <div style={styles.infoItem}>
                            <span style={styles.infoIcon}>👨‍⚕️</span>
                            <div>
                              <div style={styles.infoLabel}>Doctor</div>
                              <div style={styles.infoValue}>{a.doctorName || "Unknown Doctor"}</div>
                              <div style={styles.infoSubValue}>ID: {a.doctorId || "-"}</div>
                            </div>
                          </div>
                        </div>

                        <div style={styles.infoRow}>
                          <div style={styles.infoItem}>
                            <span style={styles.infoIcon}>🔢</span>
                            <div>
                              <div style={styles.infoLabel}>Slot Number</div>
                              <div style={styles.infoValue}>Slot {a.slotNumber ?? "-"}</div>
                            </div>
                          </div>

                          <div style={styles.infoItem}>
                            <span style={styles.infoIcon}>💰</span>
                            <div>
                              <div style={styles.infoLabel}>Payment</div>
                              <div style={{ ...styles.paymentBadge, backgroundColor: paymentStyle.bg, color: paymentStyle.text }}>
                                {(a.paymentStatus || "UNKNOWN").toUpperCase()}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div style={styles.infoRow}>
                          <div style={styles.infoItem}>
                            <span style={styles.infoIcon}>📅</span>
                            <div>
                              <div style={styles.infoLabel}>Requested On</div>
                              <div style={styles.infoValue}>{formatDate(a.createdAt)}</div>
                            </div>
                          </div>

                        </div>

                        <div style={styles.reasonSection}>
                          <span style={styles.reasonIcon}>📝</span>
                          <div>
                            <div style={styles.infoLabel}>Reason for visit</div>
                            <div style={styles.reasonText}>{a.reason || "Not specified"}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer Stats */}
              <div style={styles.footerStats}>
                Showing {filteredAppointments.length} of {list.length} appointments
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body, html {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        
        #root {
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        
        .stat-card, .appointment-card {
          transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
        }
        
        .stat-card:hover, .appointment-card:hover {
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
        
        input:focus {
          border-color: #1e6f5c !important;
          box-shadow: 0 0 0 3px rgba(30, 111, 92, 0.08) !important;
          outline: none;
        }
        
        button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    width: "100%",
    height: "100vh",
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
    height: "100vh",
    overflowY: "auto",
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
    overflowY: "auto",
    height: "100vh",
    padding: "40px",
  },
  content: {
    maxWidth: "1400px",
    margin: "0 auto",
    paddingBottom: "40px",
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
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
    marginBottom: "32px",
  },
  statCard: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  },
  statIcon: {
    fontSize: "32px",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1a2c3e",
    lineHeight: 1.2,
  },
  statLabel: {
    fontSize: "13px",
    color: "#5e7a93",
    fontWeight: "500",
  },
  filterSection: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "20px",
    marginBottom: "32px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  },
  filterTabs: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  filterBtn: {
    padding: "8px 20px",
    backgroundColor: "#f8fafc",
    border: "1.5px solid #e2e8f0",
    borderRadius: "40px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#5e7a93",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  filterBtnActive: {
    backgroundColor: "#1e6f5c",
    borderColor: "#1e6f5c",
    color: "#ffffff",
  },
  searchWrapper: {
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    left: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#9aaebf",
  },
  searchInput: {
    width: "100%",
    padding: "12px 16px 12px 44px",
    fontSize: "14px",
    border: "1.5px solid #e2e8f0",
    borderRadius: "40px",
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
  },
  appointmentsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(480px, 1fr))",
    gap: "24px",
  },
  appointmentCard: {
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
  },
  cardHeader: {
    padding: "20px 24px",
    backgroundColor: "#fafcfd",
    borderBottom: "1px solid #eef2f6",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardId: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  idLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#8aa0b3",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  idValue: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#1a2c3e",
    fontFamily: "monospace",
  },
  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    borderRadius: "40px",
    fontSize: "12px",
    fontWeight: "600",
  },
  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
  },
  cardContent: {
    padding: "24px",
  },
  infoRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginBottom: "20px",
  },
  infoItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
  },
  infoIcon: {
    fontSize: "20px",
  },
  infoLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#8aa0b3",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "4px",
  },
  infoValue: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#1a2c3e",
  },
  infoSubValue: {
    fontSize: "12px",
    color: "#7a8fa6",
    marginTop: "4px",
    wordBreak: "break-all",
  },
  paymentBadge: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  reasonSection: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "16px",
    backgroundColor: "#f8fafc",
    borderRadius: "16px",
    borderLeft: "4px solid #1e6f5c",
  },
  reasonIcon: {
    fontSize: "18px",
  },
  reasonText: {
    fontSize: "14px",
    color: "#2c3e50",
    lineHeight: "1.5",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 20px",
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
  emptyState: {
    textAlign: "center",
    padding: "80px 20px",
    backgroundColor: "#ffffff",
    borderRadius: "24px",
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
  footerStats: {
    marginTop: "24px",
    textAlign: "center",
    fontSize: "13px",
    color: "#5e7a93",
    padding: "20px",
  },
};