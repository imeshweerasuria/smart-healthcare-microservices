import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API, authHeaders } from "../../api/client";
import { clearSession, getName } from "../../api/auth";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    clearSession();
    navigate("/login");
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API.appointment}/appointments/doctor/me`, {
        headers: authHeaders(),
      });

      const data = Array.isArray(res.data) ? res.data : [];
      setAppointments(data);
    } catch (err) {
      console.error("Failed to load doctor dashboard data:", err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const dashboardStats = useMemo(() => {
    const today = new Date();

    const isSameDay = (value) => {
      if (!value) return false;
      const d = new Date(value);
      if (isNaN(d.getTime())) return false;

      return (
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate()
      );
    };

    const todayRequests = appointments.filter((a) => isSameDay(a.createdAt)).length;

    const upcomingAppointments = appointments.filter((a) =>
      ["ACCEPTED", "CONFIRMED"].includes(a.status)
    ).length;

    const totalPatients = new Set(
      appointments.map((a) => a.patientId).filter(Boolean)
    ).size;

    const completedAppointments = appointments.filter(
      (a) => a.status === "COMPLETED"
    ).length;

    const pendingAppointments = appointments.filter(
      (a) => a.status === "PENDING"
    ).length;

    const rejectedAppointments = appointments.filter(
      (a) => a.status === "REJECTED"
    ).length;

    const totalAppointments = appointments.length;

    return {
      todayRequests,
      upcomingAppointments,
      totalPatients,
      completedAppointments,
      pendingAppointments,
      rejectedAppointments,
      totalAppointments,
    };
  }, [appointments]);

  // Calculate percentages for progress bars
  const completionRate = dashboardStats.totalAppointments > 0 
    ? (dashboardStats.completedAppointments / dashboardStats.totalAppointments) * 100 
    : 0;
  
  const acceptanceRate = dashboardStats.totalAppointments > 0 
    ? ((dashboardStats.upcomingAppointments + dashboardStats.completedAppointments) / dashboardStats.totalAppointments) * 100 
    : 0;
  
  const pendingRate = dashboardStats.totalAppointments > 0 
    ? (dashboardStats.pendingAppointments / dashboardStats.totalAppointments) * 100 
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
            <div style={{ ...styles.statIcon, backgroundColor: "#e3f2fd", color: "#1976d2" }}>📅</div>
            <div>
              <div style={styles.statValue}>
                {loading ? "..." : dashboardStats.todayRequests}
              </div>
              <div style={styles.statLabel}>Today's Requests</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, backgroundColor: "#e8f5e9", color: "#2e7d32" }}>⏰</div>
            <div>
              <div style={styles.statValue}>
                {loading ? "..." : dashboardStats.upcomingAppointments}
              </div>
              <div style={styles.statLabel}>Accepted / Confirmed</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, backgroundColor: "#fff3e0", color: "#ed6c02" }}>👥</div>
            <div>
              <div style={styles.statValue}>
                {loading ? "..." : dashboardStats.totalPatients}
              </div>
              <div style={styles.statLabel}>Unique Patients</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, backgroundColor: "#ede7f6", color: "#6a1b9a" }}>✅</div>
            <div>
              <div style={styles.statValue}>
                {loading ? "..." : dashboardStats.completedAppointments}
              </div>
              <div style={styles.statLabel}>Completed Appointments</div>
            </div>
          </div>
        </div>

        {/* Performance Metrics Section with Progress Bars */}
        <div style={styles.metricsSection}>
          <h3 style={styles.sectionTitle}>Practice Performance</h3>
          <div style={styles.metricsGrid}>
            {/* Completion Rate */}
            <div style={styles.metricCard}>
              <div style={styles.metricHeader}>
                <span style={styles.metricIcon}>🎯</span>
                <span style={styles.metricTitle}>Completion Rate</span>
                <span style={styles.metricPercentage}>
                  {loading ? "..." : `${Math.round(completionRate)}%`}
                </span>
              </div>
              <div style={styles.progressBarContainer}>
                <div 
                  style={{
                    ...styles.progressBarFill,
                    width: loading ? "0%" : `${completionRate}%`,
                    backgroundColor: "#4caf50",
                    animation: loading ? "none" : "growWidth 1s ease-out"
                  }}
                />
              </div>
              <div style={styles.metricDetails}>
                <span>✅ {dashboardStats.completedAppointments} completed</span>
                <span>📋 {dashboardStats.totalAppointments} total</span>
              </div>
            </div>

            {/* Acceptance Rate */}
            <div style={styles.metricCard}>
              <div style={styles.metricHeader}>
                <span style={styles.metricIcon}>📊</span>
                <span style={styles.metricTitle}>Acceptance Rate</span>
                <span style={styles.metricPercentage}>
                  {loading ? "..." : `${Math.round(acceptanceRate)}%`}
                </span>
              </div>
              <div style={styles.progressBarContainer}>
                <div 
                  style={{
                    ...styles.progressBarFill,
                    width: loading ? "0%" : `${acceptanceRate}%`,
                    backgroundColor: "#2196f3",
                    animation: loading ? "none" : "growWidth 1s ease-out"
                  }}
                />
              </div>
              <div style={styles.metricDetails}>
                <span>✓ {dashboardStats.upcomingAppointments + dashboardStats.completedAppointments} accepted</span>
                <span>⏳ {dashboardStats.pendingAppointments} pending</span>
              </div>
            </div>

            {/* Pending Rate */}
            <div style={styles.metricCard}>
              <div style={styles.metricHeader}>
                <span style={styles.metricIcon}>⏳</span>
                <span style={styles.metricTitle}>Pending Rate</span>
                <span style={styles.metricPercentage}>
                  {loading ? "..." : `${Math.round(pendingRate)}%`}
                </span>
              </div>
              <div style={styles.progressBarContainer}>
                <div 
                  style={{
                    ...styles.progressBarFill,
                    width: loading ? "0%" : `${pendingRate}%`,
                    backgroundColor: "#ff9800",
                    animation: loading ? "none" : "growWidth 1s ease-out"
                  }}
                />
              </div>
              <div style={styles.metricDetails}>
                <span>⏰ {dashboardStats.pendingAppointments} pending</span>
                <span>📊 needs your attention</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity & Upcoming Section */}
        <div style={styles.recentSection}>
          <div style={styles.recentCard}>
            <div style={styles.cardHeader}>
              <span style={styles.cardTitle}>Recent Activity</span>
              <span style={styles.cardBadge}>Overview</span>
            </div>
            <div style={styles.activityList}>
              <div style={styles.activityItem}>
                <div style={styles.activityIcon}>⏳</div>
                <div style={styles.activityContent}>
                  <div style={styles.activityText}>
                    Pending requests: {loading ? "..." : dashboardStats.pendingAppointments}
                  </div>
                  <div style={styles.activityTime}>Appointments waiting for your action</div>
                </div>
              </div>

              <div style={styles.activityItem}>
                <div style={styles.activityIcon}>❌</div>
                <div style={styles.activityContent}>
                  <div style={styles.activityText}>
                    Rejected requests: {loading ? "..." : dashboardStats.rejectedAppointments}
                  </div>
                  <div style={styles.activityTime}>Requests you declined</div>
                </div>
              </div>

              <div style={styles.activityItem}>
                <div style={styles.activityIcon}>✅</div>
                <div style={styles.activityContent}>
                  <div style={styles.activityText}>
                    Completed: {loading ? "..." : dashboardStats.completedAppointments}
                  </div>
                  <div style={styles.activityTime}>Successfully finished consultations</div>
                </div>
              </div>
            </div>
          </div>
          
          <div style={styles.upcomingCard}>
            <div style={styles.cardHeader}>
              <span style={styles.cardTitle}>Upcoming Schedule</span>
              <span style={styles.cardBadge}>Active Queue</span>
            </div>
            <div style={styles.schedulePlaceholder}>
              <div style={styles.emptyStateIcon}>📅</div>
              <p style={styles.emptyStateText}>
                {loading
                  ? "Loading schedule..."
                  : dashboardStats.upcomingAppointments > 0
                  ? `${dashboardStats.upcomingAppointments} accepted/confirmed appointment(s)`
                  : "No upcoming accepted appointments"}
              </p>
              {dashboardStats.upcomingAppointments > 0 && (
                <Link to="/doctor/appointments" style={styles.viewLink}>
                  View pending requests →
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div style={styles.welcomeCard}>
          <div style={styles.welcomeIcon}>👨‍⚕️</div>
          <div style={styles.welcomeContent}>
            <h3 style={styles.welcomeTitle}>Welcome to your Practice Hub</h3>
            <p style={styles.welcomeText}>
              Track your performance metrics, manage appointments, and provide excellent care to your patients.
              The progress bars above show your practice's key performance indicators.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes growWidth {
          from {
            width: 0%;
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }
        
        .metric-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }
      `}</style>
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
    transition: "all 0.2s ease",
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
  metricsSection: {
    marginBottom: "40px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1a2c3e",
    marginBottom: "16px",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
  },
  metricCard: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
    transition: "all 0.2s ease",
  },
  metricHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px",
  },
  metricIcon: {
    fontSize: "24px",
  },
  metricTitle: {
    flex: 1,
    fontSize: "15px",
    fontWeight: "600",
    color: "#1a2c3e",
  },
  metricPercentage: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1e6f5c",
  },
  progressBarContainer: {
    backgroundColor: "#eef2f6",
    borderRadius: "10px",
    height: "10px",
    overflow: "hidden",
    marginBottom: "12px",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: "10px",
    transition: "width 0.3s ease",
  },
  metricDetails: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    color: "#5e7a93",
  },
  recentSection: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
    marginBottom: "40px",
  },
  recentCard: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  },
  upcomingCard: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1a2c3e",
  },
  cardBadge: {
    fontSize: "12px",
    padding: "4px 10px",
    backgroundColor: "#f0f2f5",
    borderRadius: "20px",
    color: "#5e7a93",
  },
  activityList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  activityItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  activityIcon: {
    width: "32px",
    height: "32px",
    backgroundColor: "#f8fafc",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#1a2c3e",
    marginBottom: "2px",
  },
  activityTime: {
    fontSize: "12px",
    color: "#5e7a93",
  },
  schedulePlaceholder: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 0",
  },
  emptyStateIcon: {
    fontSize: "40px",
    marginBottom: "12px",
    opacity: 0.6,
  },
  emptyStateText: {
    fontSize: "14px",
    color: "#5e7a93",
    margin: "0 0 12px 0",
  },
  viewLink: {
    color: "#1e6f5c",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: "600",
    marginTop: "8px",
  },
  welcomeCard: {
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
    html, body, #root {
      margin: 0;
      padding: 0;
      height: 100%;
      width: 100%;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes growWidth {
      from {
        width: 0%;
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    button:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    a:hover {
      background-color: #f8fafc;
    }
    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    }
    .metric-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    }
  `;
  document.head.appendChild(styleSheet);
}