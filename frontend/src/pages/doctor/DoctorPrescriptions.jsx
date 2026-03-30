import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { API, authHeaders } from "../../api/client";

export default function DoctorPrescriptions() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API.doctor}/prescriptions/doctor/me`, { 
        headers: authHeaders() 
      });
      setList(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load prescriptions");
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = () => {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);
    return { today, lastWeek, lastMonth };
  };

  const filterPrescriptions = () => {
    const { today, lastWeek, lastMonth } = getDateRange();
    
    switch(activeFilter) {
      case "today":
        return list.filter(p => new Date(p.createdAt).toDateString() === today.toDateString());
      case "week":
        return list.filter(p => new Date(p.createdAt) >= lastWeek);
      case "month":
        return list.filter(p => new Date(p.createdAt) >= lastMonth);
      default:
        return list;
    }
  };

  const filteredList = filterPrescriptions();

  const stats = {
    total: list.length,
    today: list.filter(p => new Date(p.createdAt).toDateString() === new Date().toDateString()).length,
    week: list.filter(p => {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      return new Date(p.createdAt) >= lastWeek;
    }).length,
    month: list.filter(p => {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      return new Date(p.createdAt) >= lastMonth;
    }).length,
  };

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
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>D</div>
            <div>
              <div style={styles.userName}>Doctor Portal</div>
              <div style={styles.userRole}>Prescriptions</div>
            </div>
          </div>
        </div>
        
        <div style={styles.sidebarNav}>
          <Link to="/doctor" style={styles.navItem}>
            <span style={styles.navIcon}>🏠</span>
            <span>Dashboard</span>
          </Link>
          <Link to="/doctor/profile" style={styles.navItem}>
            <span style={styles.navIcon}>👤</span>
            <span>My Profile</span>
          </Link>
          <Link to="/doctor/availability" style={styles.navItem}>
            <span style={styles.navIcon}>📅</span>
            <span>My Availability</span>
          </Link>
          <Link to="/doctor/appointments" style={styles.navItem}>
            <span style={styles.navIcon}>📋</span>
            <span>Appointment Requests</span>
          </Link>
          <Link to="/doctor/patient-reports" style={styles.navItem}>
            <span style={styles.navIcon}>📊</span>
            <span>View Patient Reports</span>
          </Link>
          <div style={styles.navItemActive}>
            <span style={styles.navIcon}>💊</span>
            <span>My Issued Prescriptions</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>My Issued Prescriptions</h1>
            <p style={styles.subtitle}>View and manage all prescriptions you've issued to patients</p>
          </div>
          <button onClick={loadPrescriptions} style={styles.refreshBtn} disabled={loading}>
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
            <div style={{...styles.statIcon, backgroundColor: "#e3f2fd"}}>💊</div>
            <div>
              <div style={styles.statValue}>{stats.total}</div>
              <div style={styles.statLabel}>Total Prescriptions</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{...styles.statIcon, backgroundColor: "#e8f5e9"}}>📅</div>
            <div>
              <div style={styles.statValue}>{stats.today}</div>
              <div style={styles.statLabel}>Today</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{...styles.statIcon, backgroundColor: "#fff3e0"}}>📆</div>
            <div>
              <div style={styles.statValue}>{stats.week}</div>
              <div style={styles.statLabel}>Last 7 Days</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{...styles.statIcon, backgroundColor: "#f3e5f5"}}>📊</div>
            <div>
              <div style={styles.statValue}>{stats.month}</div>
              <div style={styles.statLabel}>Last 30 Days</div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={styles.tabSection}>
          <div style={styles.tabs}>
            <button 
              onClick={() => setActiveFilter("all")}
              style={activeFilter === "all" ? {...styles.tab, ...styles.tabActive} : styles.tab}
            >
              All
              {stats.total > 0 && <span style={styles.badge}>{stats.total}</span>}
            </button>
            <button 
              onClick={() => setActiveFilter("today")}
              style={activeFilter === "today" ? {...styles.tab, ...styles.tabActive} : styles.tab}
            >
              Today
              {stats.today > 0 && <span style={styles.badge}>{stats.today}</span>}
            </button>
            <button 
              onClick={() => setActiveFilter("week")}
              style={activeFilter === "week" ? {...styles.tab, ...styles.tabActive} : styles.tab}
            >
              Last 7 Days
              {stats.week > 0 && <span style={styles.badge}>{stats.week}</span>}
            </button>
            <button 
              onClick={() => setActiveFilter("month")}
              style={activeFilter === "month" ? {...styles.tab, ...styles.tabActive} : styles.tab}
            >
              Last 30 Days
              {stats.month > 0 && <span style={styles.badge}>{stats.month}</span>}
            </button>
          </div>
        </div>

        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading prescriptions...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>💊</div>
            <p style={styles.emptyText}>No prescriptions found</p>
            <p style={styles.emptySubtext}>
              {activeFilter === "all" 
                ? "You haven't issued any prescriptions yet" 
                : `No prescriptions issued in this time period`}
            </p>
            <Link to="/doctor/appointments" style={styles.emptyActionBtn}>
              View Appointments
            </Link>
          </div>
        ) : (
          <div style={styles.prescriptionsGrid}>
            {filteredList.map((p) => (
              <div key={p._id} style={styles.prescriptionCard}>
                <div style={styles.cardHeader}>
                  <div style={styles.patientInfo}>
                    <div style={styles.patientAvatar}>
                      {p.patientName?.charAt(0) || "P"}
                    </div>
                    <div>
                      <div style={styles.patientId}>Patient ID: {p.patientId}</div>
                      <div style={styles.prescriptionDate}>
                        📅 {new Date(p.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div style={styles.prescriptionTime}>
                        ⏰ {new Date(p.createdAt).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                  <div style={styles.prescriptionBadge}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 4v16M4 12h16"/>
                    </svg>
                    Prescription
                  </div>
                </div>

                <div style={styles.cardContent}>
                  {p.appointmentId && (
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Appointment ID:</span>
                      <span style={styles.infoValue}>{p.appointmentId}</span>
                    </div>
                  )}
                  
                  <div style={styles.medsSection}>
                    <div style={styles.sectionHeader}>
                      <span style={styles.sectionIcon}>💊</span>
                      <span style={styles.sectionTitle}>Medications</span>
                    </div>
                    <div style={styles.medsContent}>
                      {p.meds}
                    </div>
                  </div>

                  {p.notes && (
                    <div style={styles.notesSection}>
                      <div style={styles.sectionHeader}>
                        <span style={styles.sectionIcon}>📝</span>
                        <span style={styles.sectionTitle}>Doctor's Notes</span>
                      </div>
                      <div style={styles.notesContent}>
                        {p.notes}
                      </div>
                    </div>
                  )}
                </div>

                <div style={styles.cardFooter}>
                  <button 
                    onClick={() => {
                      // Optional: Add functionality to print or download prescription
                      const printContent = `
                        <html>
                          <head><title>Prescription</title></head>
                          <body>
                            <h2>MediBook Prescription</h2>
                            <p><strong>Patient ID:</strong> ${p.patientId}</p>
                            <p><strong>Date:</strong> ${new Date(p.createdAt).toLocaleString()}</p>
                            <p><strong>Medications:</strong> ${p.meds}</p>
                            <p><strong>Notes:</strong> ${p.notes || "N/A"}</p>
                          </body>
                        </html>
                      `;
                      const printWindow = window.open('', '_blank');
                      printWindow.document.write(printContent);
                      printWindow.document.close();
                      printWindow.print();
                    }}
                    style={styles.printBtn}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 18L18 18M6 14L18 14M6 10L18 10M6 6L18 6M6 22L18 22"/>
                    </svg>
                    Print
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!loading && filteredList.length > 0 && (
          <div style={styles.footerStats}>
            Showing {filteredList.length} of {list.length} prescriptions
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    height: "100vh",  // ADDED: Forces full viewport height
    width: "100%",
    background: "#f5f7fa",
    fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
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
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  userAvatar: {
    width: "48px",
    height: "48px",
    backgroundColor: "#e8f5e9",
    borderRadius: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#1e6f5c",
    fontSize: "20px",
    fontWeight: "600",
  },
  userName: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#1a2c3e",
  },
  userRole: {
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
  mainContent: {
    flex: 1,
    marginLeft: "280px",
    padding: "32px",
    width: "calc(100% - 280px)",
    minHeight: "100vh",
    height: "100%",  // ADDED: Takes full height
    overflowY: "auto",  // ADDED: Enables scrolling within content
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
    transition: "all 0.2s ease",
    fontFamily: "inherit",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
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
    width: "48px",
    height: "48px",
    borderRadius: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
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
  tabSection: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "20px",
    marginBottom: "32px",
  },
  tabs: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  tab: {
    padding: "8px 20px",
    backgroundColor: "#f8fafc",
    border: "1.5px solid #e2e8f0",
    borderRadius: "40px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#5e7a93",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  tabActive: {
    backgroundColor: "#1e6f5c",
    borderColor: "#1e6f5c",
    color: "#ffffff",
  },
  badge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: "2px 8px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  prescriptionsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  prescriptionCard: {
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
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "12px",
  },
  patientInfo: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
  },
  patientAvatar: {
    width: "56px",
    height: "56px",
    backgroundColor: "#e8f5e9",
    borderRadius: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "600",
    color: "#1e6f5c",
  },
  patientId: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1a2c3e",
    marginBottom: "4px",
  },
  prescriptionDate: {
    fontSize: "13px",
    color: "#5e7a93",
    marginBottom: "2px",
  },
  prescriptionTime: {
    fontSize: "13px",
    color: "#5e7a93",
  },
  prescriptionBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  cardContent: {
    padding: "24px",
    borderBottom: "1px solid #eef2f6",
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  infoLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#5e7a93",
    minWidth: "120px",
  },
  infoValue: {
    fontSize: "14px",
    color: "#1a2c3e",
    flex: 1,
  },
  medsSection: {
    marginBottom: "20px",
  },
  notesSection: {
    marginTop: "20px",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px",
  },
  sectionIcon: {
    fontSize: "16px",
  },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1a2c3e",
  },
  medsContent: {
    backgroundColor: "#f8fafc",
    padding: "16px",
    borderRadius: "12px",
    fontSize: "14px",
    color: "#1a2c3e",
    lineHeight: "1.6",
    fontFamily: "monospace",
    whiteSpace: "pre-wrap",
  },
  notesContent: {
    backgroundColor: "#f8fafc",
    padding: "16px",
    borderRadius: "12px",
    fontSize: "14px",
    color: "#5e7a93",
    lineHeight: "1.6",
    fontStyle: "italic",
  },
  cardFooter: {
    padding: "16px 24px",
    display: "flex",
    justifyContent: "flex-end",
  },
  printBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 20px",
    backgroundColor: "#f8fafc",
    color: "#1e6f5c",
    border: "1px solid #e2e8f0",
    borderRadius: "40px",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 20px",
    backgroundColor: "#ffffff",
    borderRadius: "24px",
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
    marginBottom: "24px",
  },
  emptyActionBtn: {
    display: "inline-block",
    padding: "10px 24px",
    backgroundColor: "#1e6f5c",
    color: "#ffffff",
    textDecoration: "none",
    borderRadius: "40px",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s ease",
  },
  footerStats: {
    marginTop: "24px",
    textAlign: "center",
    fontSize: "13px",
    color: "#5e7a93",
    padding: "20px",
  },
};

// Add keyframes animation
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    button:hover:not(:disabled), .refresh-btn:hover, .print-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .empty-action-btn:hover {
      background-color: #155a4b;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(30, 111, 92, 0.3);
    }
    
    .nav-item:hover, .prescription-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    }
    
    a:hover {
      background-color: #f8fafc;
    }
  `;
  document.head.appendChild(styleSheet);
}