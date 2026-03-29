import { useEffect, useState } from "react";
import axios from "axios";
import { API, authHeaders } from "../../api/client";
import { Link, useNavigate } from "react-router-dom";
import { clearSession, getName } from "../../api/auth";

export default function PatientMedicalRecord() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [reports, setReports] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    clearSession();
    navigate("/login");
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [profileRes, reportsRes, prescriptionsRes] = await Promise.all([
          axios.get(`${API.patient}/patients/me`, { headers: authHeaders() }),
          axios.get(`${API.patient}/patients/me/reports`, { headers: authHeaders() }),
          axios.get(`${API.patient}/patients/me/prescriptions`, { headers: authHeaders() }),
        ]);

        setProfile(profileRes.data);
        setReports(reportsRes.data);
        setPrescriptions(prescriptionsRes.data);
      } catch (err) {
        console.error(err);
        alert("Failed to load medical record");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const navItems = [
    { path: "/patient/profile", label: "My Profile", icon: "👤" },
    { path: "/patient/medical-record", label: "My Medical Record", icon: "📋", active: true },
    { path: "/patient/doctors", label: "Browse Doctors", icon: "👨‍⚕️" },
    { path: "/patient/appointments", label: "My Appointments", icon: "📅" },
    { path: "/patient/upload", label: "Upload Medical Reports", icon: "📤" },
    { path: "/patient/reports", label: "My Reports", icon: "📊" },
    { path: "/patient/prescriptions", label: "My Prescriptions", icon: "💊" },
    { path: "/patient/payments", label: "My Payments", icon: "💰" },
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
            <p style={styles.loadingText}>Loading medical record...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

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
            <h1 style={styles.title}>My Medical Record</h1>
            <p style={styles.subtitle}>Complete medical history and health information</p>
          </div>
        </div>

        {/* Personal Information Section */}
        <div style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon}>👤</div>
            <h2 style={styles.sectionTitle}>Personal Information</h2>
          </div>
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <div style={styles.infoLabel}>Date of Birth</div>
              <div style={styles.infoValue}>{profile.dateOfBirth || "-"}</div>
            </div>
            <div style={styles.infoItem}>
              <div style={styles.infoLabel}>Gender</div>
              <div style={styles.infoValue}>{profile.gender || "-"}</div>
            </div>
            <div style={styles.infoItem}>
              <div style={styles.infoLabel}>Phone</div>
              <div style={styles.infoValue}>{profile.phone || "-"}</div>
            </div>
            <div style={styles.infoItem}>
              <div style={styles.infoLabel}>Address</div>
              <div style={styles.infoValue}>{profile.address || "-"}</div>
            </div>
          </div>
        </div>

        {/* Medical History Section */}
        <div style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon}>📋</div>
            <h2 style={styles.sectionTitle}>Medical History</h2>
          </div>
          <div style={styles.infoBlock}>
            <div style={styles.infoLabel}>Medical History</div>
            <div style={styles.infoValue}>{profile.medicalHistory || "No medical history recorded"}</div>
          </div>
        </div>

        {/* Allergies Section */}
        <div style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon}>⚠️</div>
            <h2 style={styles.sectionTitle}>Allergies</h2>
          </div>
          <div style={styles.tagsContainer}>
            {(profile.allergies || []).length > 0 ? (
              (profile.allergies || []).map((allergy, index) => (
                <span key={index} style={styles.tagAllergy}>
                  {allergy}
                </span>
              ))
            ) : (
              <div style={styles.infoValue}>No allergies recorded</div>
            )}
          </div>
        </div>

        {/* Chronic Conditions Section */}
        <div style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon}>🏥</div>
            <h2 style={styles.sectionTitle}>Chronic Conditions</h2>
          </div>
          <div style={styles.tagsContainer}>
            {(profile.chronicConditions || []).length > 0 ? (
              (profile.chronicConditions || []).map((condition, index) => (
                <span key={index} style={styles.tagCondition}>
                  {condition}
                </span>
              ))
            ) : (
              <div style={styles.infoValue}>No chronic conditions recorded</div>
            )}
          </div>
        </div>

        {/* Reports Summary */}
        <div style={styles.statsGrid}>
          <Link to="/patient/reports" style={styles.statCard}>
            <div style={{...styles.statIcon, backgroundColor: "#e3f2fd"}}>📊</div>
            <div>
              <div style={styles.statValue}>{reports.length}</div>
              <div style={styles.statLabel}>Total Reports</div>
              <div style={styles.statLink}>View all reports →</div>
            </div>
          </Link>

          <Link to="/patient/prescriptions" style={styles.statCard}>
            <div style={{...styles.statIcon, backgroundColor: "#e8f5e9"}}>💊</div>
            <div>
              <div style={styles.statValue}>{prescriptions.length}</div>
              <div style={styles.statLabel}>Total Prescriptions</div>
              <div style={styles.statLink}>View all prescriptions →</div>
            </div>
          </Link>
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
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "24px",
    marginBottom: "24px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
    width: "100%",
    boxSizing: "border-box",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
    paddingBottom: "12px",
    borderBottom: "1px solid #eef2f6",
  },
  sectionIcon: {
    fontSize: "24px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1a2c3e",
    margin: 0,
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
  },
  infoItem: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  infoBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  infoLabel: {
    fontSize: "12px",
    fontWeight: "500",
    color: "#5e7a93",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  infoValue: {
    fontSize: "15px",
    color: "#1a2c3e",
    lineHeight: "1.5",
  },
  tagsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  tagAllergy: {
    padding: "6px 14px",
    backgroundColor: "#ffebee",
    color: "#c62828",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "500",
  },
  tagCondition: {
    padding: "6px 14px",
    backgroundColor: "#fff3e0",
    color: "#ed6c02",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "500",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "24px",
    marginTop: "8px",
  },
  statCard: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "24px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
    textDecoration: "none",
    transition: "all 0.2s ease",
    cursor: "pointer",
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
    marginTop: "4px",
  },
  statLink: {
    fontSize: "12px",
    color: "#1e6f5c",
    marginTop: "8px",
    fontWeight: "500",
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
  
  a:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }
  
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }
`;

if (typeof document !== "undefined") {
  document.head.appendChild(styleSheet);
}