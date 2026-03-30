import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { API, authHeaders } from "../../api/client";
import { clearSession, getName } from "../../api/auth";

export default function MyPrescriptions() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    clearSession();
    navigate("/login");
  };

  useEffect(() => {
    const loadPrescriptions = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API.patient}/patients/me/prescriptions`, { 
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

    loadPrescriptions();
  }, []);

  const navItems = [
    { path: "/patient/profile", label: "My Profile", icon: "👤" },
    { path: "/patient/medical-record", label: "My Medical Record", icon: "📋" },
    { path: "/patient/doctors", label: "Browse Doctors", icon: "👨‍⚕️" },
    { path: "/patient/appointments", label: "My Appointments", icon: "📅" },
    { path: "/patient/upload", label: "Upload Medical Reports", icon: "📤" },
    { path: "/patient/reports", label: "My Reports", icon: "📊" },
    { path: "/patient/prescriptions", label: "My Prescriptions", icon: "💊", active: true },
    { path: "/patient/payments", label: "My Payments", icon: "💰" },
  ];

  const stats = {
    total: list.length,
    recent: list.slice(0, 5).length,
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
        <div style={styles.mainContent}>
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading prescriptions...</p>
          </div>
        </div>
      </div>
    );
  }

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

      {/* Main Content - Full Width */}
      <div style={styles.mainContent}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>My Prescriptions</h1>
            <p style={styles.subtitle}>View all your prescribed medications and instructions</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={{...styles.statIcon, backgroundColor: "#e8f5e9"}}>💊</div>
            <div>
              <div style={styles.statValue}>{stats.total}</div>
              <div style={styles.statLabel}>Total Prescriptions</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{...styles.statIcon, backgroundColor: "#e3f2fd"}}>📋</div>
            <div>
              <div style={styles.statValue}>{stats.recent}</div>
              <div style={styles.statLabel}>Recent Prescriptions</div>
            </div>
          </div>
        </div>

        {/* Prescriptions List */}
        {list.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>💊</div>
            <p style={styles.emptyText}>No prescriptions yet</p>
            <p style={styles.emptySubtext}>Your prescriptions will appear here once prescribed by a doctor</p>
          </div>
        ) : (
          <div style={styles.prescriptionsGrid}>
            {list.map((p) => (
              <div key={p._id} style={styles.prescriptionCard}>
                <div style={styles.cardHeader}>
                  <div style={styles.headerIcon}>💊</div>
                  <div style={styles.headerInfo}>
                    <div style={styles.prescriptionDate}>{formatDate(p.createdAt)}</div>
                    <div style={styles.doctorId}>Doctor ID: {p.doctorId?.slice(-8) || "N/A"}</div>
                  </div>
                </div>

                <div style={styles.cardContent}>
                  {p.appointmentId && (
                    <div style={styles.infoRow}>
                      <span style={styles.infoIcon}>📅</span>
                      <div>
                        <div style={styles.infoLabel}>Appointment ID</div>
                        <div style={styles.infoValue}>{p.appointmentId?.slice(-8) || "-"}</div>
                      </div>
                    </div>
                  )}

                  <div style={styles.infoRow}>
                    <span style={styles.infoIcon}>💊</span>
                    <div>
                      <div style={styles.infoLabel}>Medications</div>
                      <div style={styles.medsText}>{p.meds}</div>
                    </div>
                  </div>

                  {p.notes && (
                    <div style={styles.infoRow}>
                      <span style={styles.infoIcon}>📝</span>
                      <div>
                        <div style={styles.infoLabel}>Notes & Instructions</div>
                        <div style={styles.notesText}>{p.notes}</div>
                      </div>
                    </div>
                  )}
                </div>

                <div style={styles.cardFooter}>
                  <div style={styles.prescriptionId}>Prescription ID: {p._id?.slice(-8) || "N/A"}</div>
                  <button 
                    onClick={() => {
                      const printContent = document.getElementById(`prescription-${p._id}`);
                      if (printContent) {
                        const originalContents = document.body.innerHTML;
                        document.body.innerHTML = printContent.innerHTML;
                        window.print();
                        document.body.innerHTML = originalContents;
                        window.location.reload();
                      }
                    }}
                    style={styles.printBtn}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 18H4C2.89543 18 2 17.1046 2 16V10C2 8.89543 2.89543 8 4 8H20C21.1046 8 22 8.89543 22 10V16C22 17.1046 21.1046 18 20 18H18M6 18V22H18V18M6 18H18M6 14H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Print
                  </button>
                </div>

                <div id={`prescription-${p._id}`} style={{ display: 'none' }}>
                  <div style={styles.printContainer}>
                    <h2>Medical Prescription</h2>
                    <p><strong>Date:</strong> {formatDate(p.createdAt)}</p>
                    <p><strong>Doctor ID:</strong> {p.doctorId || "N/A"}</p>
                    {p.appointmentId && <p><strong>Appointment ID:</strong> {p.appointmentId}</p>}
                    <hr />
                    <h3>Medications</h3>
                    <p>{p.meds}</p>
                    {p.notes && (
                      <>
                        <h3>Notes & Instructions</h3>
                        <p>{p.notes}</p>
                      </>
                    )}
                    <hr />
                    <p><em>Prescription ID: {p._id}</em></p>
                  </div>
                </div>
              </div>
            ))}
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
    width: "100vw",
    background: "#f5f7fa",
    fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    margin: 0,
    padding: 0,
    overflowX: "hidden",
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
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "32px",
    flexWrap: "wrap",
    gap: "16px",
    width: "100%",
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
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "24px",
    marginBottom: "32px",
    width: "100%",
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
  prescriptionsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    width: "100%",
  },
  prescriptionCard: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  cardHeader: {
    padding: "20px 24px",
    backgroundColor: "#fafcfd",
    borderBottom: "1px solid #eef2f6",
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  headerIcon: {
    width: "48px",
    height: "48px",
    backgroundColor: "#e8f5e9",
    borderRadius: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    color: "#1e6f5c",
  },
  headerInfo: {
    flex: 1,
  },
  prescriptionDate: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1a2c3e",
    marginBottom: "4px",
  },
  doctorId: {
    fontSize: "13px",
    color: "#5e7a93",
  },
  cardContent: {
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  infoRow: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
  },
  infoIcon: {
    fontSize: "18px",
    marginTop: "2px",
  },
  infoLabel: {
    fontSize: "12px",
    color: "#5e7a93",
    marginBottom: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  infoValue: {
    fontSize: "14px",
    color: "#1a2c3e",
  },
  medsText: {
    fontSize: "14px",
    color: "#1a2c3e",
    lineHeight: "1.6",
    backgroundColor: "#f8fafc",
    padding: "12px 16px",
    borderRadius: "12px",
    fontFamily: "monospace",
  },
  notesText: {
    fontSize: "14px",
    color: "#5e7a93",
    lineHeight: "1.6",
    backgroundColor: "#fef9e6",
    padding: "12px 16px",
    borderRadius: "12px",
    borderLeft: "3px solid #ed6c02",
  },
  cardFooter: {
    padding: "16px 24px",
    borderTop: "1px solid #eef2f6",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
  },
  prescriptionId: {
    fontSize: "12px",
    color: "#9aaebf",
    fontFamily: "monospace",
  },
  printBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    backgroundColor: "#f5f7fa",
    color: "#5e7a93",
    border: "1.5px solid #e2e8f0",
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
    minHeight: "100vh",
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
    width: "100%",
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
  printContainer: {
    padding: "40px",
    fontFamily: "'Inter', system-ui, sans-serif",
    maxWidth: "800px",
    margin: "0 auto",
  },
};

// Add keyframes animation and hover effects
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .prescription-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }
  
  @media print {
    body * {
      visibility: hidden;
    }
    #prescription-print {
      visibility: visible;
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
    }
  }
`;

if (typeof document !== "undefined") {
  document.head.appendChild(styleSheet);
}