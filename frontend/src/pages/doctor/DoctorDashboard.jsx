import { Link, useNavigate } from "react-router-dom";
import { clearSession, getName } from "../../api/auth";

export default function DoctorDashboard() {
  const navigate = useNavigate();

  const logout = () => {
    clearSession();
    navigate("/login");
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
          <div style={styles.doctorInfo}>
            <div style={styles.doctorAvatar}>{getName()?.charAt(0) || "D"}</div>
            <div>
              <div style={styles.doctorName}>{getName() || "Dr. Smith"}</div>
              <div style={styles.doctorRole}>Doctor</div>
            </div>
          </div>
        </div>
        
        <div style={styles.sidebarNav}>
          <div style={styles.navItemActive}>
            <span style={styles.navIcon}>🏠</span>
            <span>Dashboard</span>
          </div>
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
          <Link to="/doctor/prescriptions" style={styles.navItem}>
            <span style={styles.navIcon}>💊</span>
            <span>My Issued Prescriptions</span>
          </Link>
          <button onClick={logout} style={styles.logoutBtn}>
            <span style={styles.navIcon}>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Doctor Dashboard</h1>
            <p style={styles.subtitle}>Welcome back, {getName() || "Doctor"}! Manage your practice efficiently</p>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={{...styles.statIcon, backgroundColor: "#e3f2fd"}}>📅</div>
            <div>
              <div style={styles.statValue}>0</div>
              <div style={styles.statLabel}>Today's Appointments</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{...styles.statIcon, backgroundColor: "#e8f5e9"}}>⏰</div>
            <div>
              <div style={styles.statValue}>0</div>
              <div style={styles.statLabel}>Upcoming Appointments</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{...styles.statIcon, backgroundColor: "#fff3e0"}}>👥</div>
            <div>
              <div style={styles.statValue}>0</div>
              <div style={styles.statLabel}>Total Patients</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{...styles.statIcon, backgroundColor: "#f3e5f5"}}>💊</div>
            <div>
              <div style={styles.statValue}>0</div>
              <div style={styles.statLabel}>Active Prescriptions</div>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div style={styles.quickActions}>
          <h3 style={styles.sectionTitle}>Quick Actions</h3>
          <div style={styles.actionGrid}>
            <Link to="/doctor/availability" style={styles.actionCard}>
              <div style={styles.actionIcon}>📅</div>
              <div style={styles.actionText}>Set Availability</div>
              <div style={styles.actionDesc}>Update your working hours</div>
            </Link>
            <Link to="/doctor/appointments" style={styles.actionCard}>
              <div style={styles.actionIcon}>📋</div>
              <div style={styles.actionText}>View Requests</div>
              <div style={styles.actionDesc}>Check appointment requests</div>
            </Link>
            <Link to="/doctor/patient-reports" style={styles.actionCard}>
              <div style={styles.actionIcon}>📊</div>
              <div style={styles.actionText}>Patient Reports</div>
              <div style={styles.actionDesc}>Review and create reports</div>
            </Link>
            <Link to="/doctor/prescriptions" style={styles.actionCard}>
              <div style={styles.actionIcon}>💊</div>
              <div style={styles.actionText}>New Prescription</div>
              <div style={styles.actionDesc}>Issue medications</div>
            </Link>
          </div>
        </div>

        {/* Navigation Links Section */}
        <div style={styles.navigationSection}>
          <h3 style={styles.sectionTitle}>Quick Navigation</h3>
          <div style={styles.navGrid}>
            <Link to="/doctor/profile" style={styles.navCard}>
              <div style={styles.navCardIcon}>👤</div>
              <div style={styles.navCardTitle}>My Profile</div>
              <div style={styles.navCardDesc}>View and edit your profile</div>
            </Link>
            <Link to="/doctor/availability" style={styles.navCard}>
              <div style={styles.navCardIcon}>⏰</div>
              <div style={styles.navCardTitle}>Availability</div>
              <div style={styles.navCardDesc}>Manage your schedule</div>
            </Link>
            <Link to="/doctor/appointments" style={styles.navCard}>
              <div style={styles.navCardIcon}>📅</div>
              <div style={styles.navCardTitle}>Appointments</div>
              <div style={styles.navCardDesc}>View and manage requests</div>
            </Link>
            <Link to="/doctor/patient-reports" style={styles.navCard}>
              <div style={styles.navCardIcon}>📄</div>
              <div style={styles.navCardTitle}>Patient Reports</div>
              <div style={styles.navCardDesc}>Access medical records</div>
            </Link>
            <Link to="/doctor/prescriptions" style={styles.navCard}>
              <div style={styles.navCardIcon}>💊</div>
              <div style={styles.navCardTitle}>Prescriptions</div>
              <div style={styles.navCardDesc}>View issued prescriptions</div>
            </Link>
          </div>
        </div>

        {/* Welcome Message */}
        <div style={styles.welcomeCard}>
          <div style={styles.welcomeIcon}>👨‍⚕️</div>
          <div style={styles.welcomeContent}>
            <h3 style={styles.welcomeTitle}>Welcome to your Practice Hub</h3>
            <p style={styles.welcomeText}>
              Manage appointments, access patient records, and issue prescriptions all from one place.
              Use the quick actions above to get started with your daily tasks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    height: "100vh",
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
  doctorInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  doctorAvatar: {
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
  doctorName: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#1a2c3e",
  },
  doctorRole: {
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
    padding: "32px",
    width: "calc(100% - 280px)",
    minHeight: "100vh",
    height: "100%",
    overflowY: "auto",
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
  quickActions: {
    marginBottom: "40px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1a2c3e",
    marginBottom: "16px",
  },
  actionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
  },
  actionCard: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "24px",
    textDecoration: "none",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
    textAlign: "center",
  },
  actionIcon: {
    fontSize: "40px",
    marginBottom: "12px",
  },
  actionText: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1a2c3e",
    marginBottom: "4px",
  },
  actionDesc: {
    fontSize: "12px",
    color: "#5e7a93",
  },
  navigationSection: {
    marginBottom: "40px",
  },
  navGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  },
  navCard: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "20px",
    textDecoration: "none",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
    textAlign: "center",
  },
  navCardIcon: {
    fontSize: "32px",
    marginBottom: "12px",
  },
  navCardTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1a2c3e",
    marginBottom: "4px",
  },
  navCardDesc: {
    fontSize: "11px",
    color: "#5e7a93",
  },
  welcomeCard: {
    backgroundColor: "linear-gradient(135deg, #1e6f5c 0%, #155a4b 100%)",
    background: "linear-gradient(135deg, #1e6f5c 0%, #155a4b 100%)",
    borderRadius: "24px",
    padding: "32px",
    display: "flex",
    gap: "20px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  welcomeIcon: {
    fontSize: "48px",
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#ffffff",
    margin: "0 0 8px 0",
  },
  welcomeText: {
    fontSize: "14px",
    color: "rgba(255, 255, 255, 0.9)",
    margin: 0,
    lineHeight: 1.5,
  },
};

// Add keyframes and hover effects, and ensure full height of root elements
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    /* Full height for root elements */
    html, body, #root {
      margin: 0;
      padding: 0;
      height: 100%;
      width: 100%;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    button:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .nav-item:hover, .action-card:hover, .nav-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    }
    a:hover {
      background-color: #f8fafc;
    }
    .action-card:hover, .nav-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
    }
  `;
  document.head.appendChild(styleSheet);
}