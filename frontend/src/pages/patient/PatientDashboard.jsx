import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { API, authHeaders } from "../../api/client";
import { clearSession, getName } from "../../api/auth";

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [queueAppointments, setQueueAppointments] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [queueLoading, setQueueLoading] = useState(true);
  const [notices, setNotices] = useState([]);
  const [noticeLoading, setNoticeLoading] = useState(true);

  const logout = () => {
    clearSession();
    navigate("/login");
  };

  const loadQueueAppointments = async () => {
    try {
      setQueueLoading(true);
      const res = await axios.get(`${API.appointment}/appointments/me`, {
        headers: authHeaders(),
      });

      const appointments = Array.isArray(res.data) ? res.data : [];
      setAllAppointments(appointments);

      const live = appointments
        .filter((a) => ["ACCEPTED", "CONFIRMED"].includes(a.status))
        .sort((a, b) => {
          const aAhead = a.queue?.patientsAhead ?? 999;
          const bAhead = b.queue?.patientsAhead ?? 999;
          return aAhead - bAhead;
        });

      setQueueAppointments(live);
    } catch (err) {
      console.error("Failed to load queue appointments:", err);
      setAllAppointments([]);
      setQueueAppointments([]);
    } finally {
      setQueueLoading(false);
    }
  };

  const loadNotices = async () => {
    try {
      setNoticeLoading(true);
      const res = await axios.get(`${API.auth}/notices`, {
        headers: authHeaders(),
      });
      setNotices(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load notices:", err);
      setNotices([]);
    } finally {
      setNoticeLoading(false);
    }
  };

  const navItems = [
    { path: "/patient/home", label: "Home", icon: "🏠", active: false },
    { path: "/patient/profile", label: "My Profile", icon: "👤", active: false },
    { path: "/patient/medical-record", label: "My Medical Record", icon: "📋", active: false },
    { path: "/patient/doctors", label: "Browse Doctors", icon: "👨‍⚕️", active: false },
    { path: "/patient/appointments", label: "My Appointments", icon: "📅", active: false },
    { path: "/patient/upload", label: "Upload Medical Reports", icon: "📤", active: false },
    { path: "/patient/reports", label: "My Reports", icon: "📊", active: false },
    { path: "/patient/prescriptions", label: "My Prescriptions", icon: "💊", active: false },
    { path: "/patient/payments", label: "My Payments", icon: "💰", active: false },
  ];

  const dashboardStats = {
    totalAppointments: allAppointments.length,
    pendingAppointments: allAppointments.filter((a) => a.status === "PENDING").length,
    activeAppointments: allAppointments.filter((a) =>
      ["ACCEPTED", "CONFIRMED"].includes(a.status)
    ).length,
    completedAppointments: allAppointments.filter((a) => a.status === "COMPLETED").length,
    cancelledAppointments: allAppointments.filter((a) =>
      ["CANCELLED", "REJECTED"].includes(a.status)
    ).length,
    paidAppointments: allAppointments.filter((a) => a.paymentStatus === "PAID").length,
  };

  // Calculate percentages for progress bars
  const total = dashboardStats.totalAppointments || 1;
  const pendingPercentage = (dashboardStats.pendingAppointments / total) * 100;
  const activePercentage = (dashboardStats.activeAppointments / total) * 100;
  const completedPercentage = (dashboardStats.completedAppointments / total) * 100;
  const cancelledPercentage = (dashboardStats.cancelledAppointments / total) * 100;
  const paidPercentage = (dashboardStats.paidAppointments / total) * 100;

  useEffect(() => {
    loadQueueAppointments();
    loadNotices();

    const interval = setInterval(() => {
      loadQueueAppointments();
      loadNotices();
    }, 8000);

    return () => clearInterval(interval);
  }, []);

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
            <h1 style={styles.title}>Patient Dashboard</h1>
            <p style={styles.subtitle}>Manage your appointments, medical records, and prescriptions</p>
          </div>
        </div>

        {/* Welcome Card */}
        <div style={styles.welcomeCard}>
          <div style={styles.welcomeIcon}>👋</div>
          <div>
            <h2 style={styles.welcomeTitle}>Welcome back, {getName() || "Patient"}!</h2>
            <p style={styles.welcomeText}>Access your healthcare services from your personal dashboard</p>
          </div>
        </div>

        {/* Notice Board Card */}
        <div style={styles.noticeBoardCard}>
          <div style={styles.noticeBoardHeader}>
            <span style={styles.noticeBoardIcon}>📢</span>
            <div>
              <h2 style={styles.noticeBoardTitle}>Important Notices</h2>
              <p style={styles.noticeBoardSubtitle}>Important updates from MediBook</p>
            </div>
          </div>

          {noticeLoading ? (
            <p style={styles.noticeBoardText}>Loading notices...</p>
          ) : notices.length === 0 ? (
            <p style={styles.noticeBoardText}>No notices available right now.</p>
          ) : (
            <div style={styles.noticeBoardList}>
              {notices.map((notice) => (
                <div key={notice._id} style={styles.noticeBoardItem}>
                  <div style={styles.noticeBoardItemTitle}>{notice.title}</div>
                  <div style={styles.noticeBoardItemMessage}>{notice.message}</div>
                  <div style={styles.noticeBoardItemDate}>
                    Posted on {new Date(notice.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Queue Status Card */}
        <div style={styles.welcomeCard}>
          
          <div style={{ width: "100%" }}>
            <h2 style={styles.welcomeTitle}>Live Queue Status</h2>

            {queueLoading ? (
              <p style={styles.welcomeText}>Loading queue status...</p>
            ) : queueAppointments.length === 0 ? (
              <p style={styles.welcomeText}>No active live queue for your appointments right now.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "12px" }}>
                {queueAppointments.map((a) => (
                  <div
                    key={a._id}
                    style={{
                      backgroundColor: "#f8fafc",
                      borderRadius: "14px",
                      padding: "14px 16px",
                      border: "1px solid #eef2f6",
                    }}
                  >
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#1a2c3e", marginBottom: "4px" }}>
                      Doctor ID: {a.doctorId?.slice(-6) || a.doctorId}
                    </div>

                    <div style={{ fontSize: "13px", color: "#5e7a93", marginBottom: "6px" }}>
                      Your slot: {a.slotNumber}
                    </div>

                    <div style={{ fontSize: "14px", fontWeight: "700", color: "#1e6f5c" }}>
                      Current running slot: {a.queue?.currentRunningSlot ?? "-"}
                    </div>

                    <div style={{ fontSize: "13px", color: "#1a2c3e", marginTop: "6px" }}>
                      {a.queue?.isCurrentTurn
                        ? "It is your turn now."
                        : a.queue?.isNextTurn
                        ? "You are next in the queue."
                        : a.queue?.queueMessage || "Queue info unavailable"}
                    </div>

                    {a.telemedicineLink && !["CANCELLED", "COMPLETED"].includes(a.status) && (
                      <a
                        href={a.telemedicineLink}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-flex",
                          marginTop: "10px",
                          padding: "8px 14px",
                          borderRadius: "20px",
                          backgroundColor: a.queue?.isCurrentTurn ? "#e8f5e9" : "#e3f2fd",
                          color: a.queue?.isCurrentTurn ? "#2e7d32" : "#0288d1",
                          textDecoration: "none",
                          fontSize: "12px",
                          fontWeight: "700",
                        }}
                      >
                        Join Telemedicine
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, backgroundColor: "#e3f2fd" }}>📅</div>
            <div>
              <div style={styles.statValue}>{dashboardStats.totalAppointments}</div>
              <div style={styles.statLabel}>Total Appointments Made</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, backgroundColor: "#fff3e0" }}>⏳</div>
            <div>
              <div style={styles.statValue}>{dashboardStats.pendingAppointments}</div>
              <div style={styles.statLabel}>Pending Appointments</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, backgroundColor: "#e8f5e9" }}>✅</div>
            <div>
              <div style={styles.statValue}>{dashboardStats.activeAppointments}</div>
              <div style={styles.statLabel}>Active Appointments</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, backgroundColor: "#ede7f6" }}>🏁</div>
            <div>
              <div style={styles.statValue}>{dashboardStats.completedAppointments}</div>
              <div style={styles.statLabel}>Completed Appointments</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, backgroundColor: "#ffebee" }}>❌</div>
            <div>
              <div style={styles.statValue}>{dashboardStats.cancelledAppointments}</div>
              <div style={styles.statLabel}>Cancelled / Rejected</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, backgroundColor: "#f3e5f5" }}>💳</div>
            <div>
              <div style={styles.statValue}>{dashboardStats.paidAppointments}</div>
              <div style={styles.statLabel}>Paid Appointments</div>
            </div>
          </div>
        </div>

        {/* Patient Summary Section with Progress Bars */}
        <div style={styles.summarySection}>
          <h2 style={styles.sectionTitle}>Appointment Analytics</h2>

          <div style={styles.progressContainer}>
            {/* Pending Progress */}
            <div style={styles.progressItem}>
              <div style={styles.progressHeader}>
                <span style={styles.progressLabel}>Pending Appointments</span>
                <span style={styles.progressValue}>{dashboardStats.pendingAppointments} / {total}</span>
              </div>
              <div style={styles.progressBarBg}>
                <div 
                  style={{ 
                    ...styles.progressBarFill, 
                    width: `${pendingPercentage}%`,
                    backgroundColor: "#ff9800"
                  }} 
                />
              </div>
            </div>

            {/* Active Progress */}
            <div style={styles.progressItem}>
              <div style={styles.progressHeader}>
                <span style={styles.progressLabel}>Active Appointments</span>
                <span style={styles.progressValue}>{dashboardStats.activeAppointments} / {total}</span>
              </div>
              <div style={styles.progressBarBg}>
                <div 
                  style={{ 
                    ...styles.progressBarFill, 
                    width: `${activePercentage}%`,
                    backgroundColor: "#2196f3"
                  }} 
                />
              </div>
            </div>

            {/* Completed Progress */}
            <div style={styles.progressItem}>
              <div style={styles.progressHeader}>
                <span style={styles.progressLabel}>Completed Appointments</span>
                <span style={styles.progressValue}>{dashboardStats.completedAppointments} / {total}</span>
              </div>
              <div style={styles.progressBarBg}>
                <div 
                  style={{ 
                    ...styles.progressBarFill, 
                    width: `${completedPercentage}%`,
                    backgroundColor: "#4caf50"
                  }} 
                />
              </div>
            </div>

            {/* Cancelled Progress */}
            <div style={styles.progressItem}>
              <div style={styles.progressHeader}>
                <span style={styles.progressLabel}>Cancelled / Rejected</span>
                <span style={styles.progressValue}>{dashboardStats.cancelledAppointments} / {total}</span>
              </div>
              <div style={styles.progressBarBg}>
                <div 
                  style={{ 
                    ...styles.progressBarFill, 
                    width: `${cancelledPercentage}%`,
                    backgroundColor: "#f44336"
                  }} 
                />
              </div>
            </div>

            {/* Paid Progress */}
            <div style={styles.progressItem}>
              <div style={styles.progressHeader}>
                <span style={styles.progressLabel}>Paid Appointments</span>
                <span style={styles.progressValue}>{dashboardStats.paidAppointments} / {total}</span>
              </div>
              <div style={styles.progressBarBg}>
                <div 
                  style={{ 
                    ...styles.progressBarFill, 
                    width: `${paidPercentage}%`,
                    backgroundColor: "#9c27b0"
                  }} 
                />
              </div>
            </div>
          </div>

          {/* Queue Status Card */}
          <div style={styles.queueStatusCard}>
            <div style={styles.queueStatusHeader}>
              <span style={styles.queueStatusIcon}>📍</span>
              <span style={styles.queueStatusTitle}>Current Queue Status</span>
            </div>
            <div style={styles.queueStatusContent}>
              {queueLoading ? (
                <p>Loading queue status...</p>
              ) : queueAppointments.length > 0 ? (
                <>
                  <div style={styles.queueStatusValue}>
                    {queueAppointments.length} Active Queue Appointment(s)
                  </div>
                  <div style={styles.queueStatusText}>
                    You currently have accepted or confirmed appointments in the live queue.
                  </div>
                </>
              ) : (
                <div style={styles.queueStatusText}>
                  You do not have any active queue appointments right now.
                </div>
              )}
            </div>
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
  welcomeCard: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "24px",
    marginBottom: "32px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
    width: "100%",
    boxSizing: "border-box",
  },
  welcomeIcon: {
    fontSize: "48px",
  },
  welcomeTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1a2c3e",
    margin: "0 0 4px 0",
  },
  welcomeText: {
    fontSize: "14px",
    color: "#5e7a93",
    margin: 0,
  },
  noticeBoardCard: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "24px",
    marginBottom: "32px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  },
  noticeBoardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "18px",
  },
  noticeBoardIcon: {
    fontSize: "32px",
  },
  noticeBoardTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1a2c3e",
    margin: 0,
  },
  noticeBoardSubtitle: {
    fontSize: "13px",
    color: "#5e7a93",
    margin: "4px 0 0 0",
  },
  noticeBoardText: {
    fontSize: "14px",
    color: "#5e7a93",
  },
  noticeBoardList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  noticeBoardItem: {
    backgroundColor: "#f8fafc",
    border: "1px solid #eef2f6",
    borderRadius: "14px",
    padding: "16px",
  },
  noticeBoardItemTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1a2c3e",
    marginBottom: "6px",
  },
  noticeBoardItemMessage: {
    fontSize: "14px",
    color: "#334155",
    lineHeight: "1.5",
    marginBottom: "8px",
  },
  noticeBoardItemDate: {
    fontSize: "12px",
    color: "#64748b",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
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
    fontSize: "16px",
    fontWeight: "600",
    color: "#1a2c3e",
    lineHeight: 1.2,
  },
  statLabel: {
    fontSize: "13px",
    color: "#5e7a93",
    fontWeight: "500",
  },
  summarySection: {
    width: "100%",
  },
  sectionTitle: {
    fontSize: "22px",
    fontWeight: "600",
    color: "#1a2c3e",
    marginBottom: "20px",
  },
  progressContainer: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "24px",
    marginBottom: "24px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  },
  progressItem: {
    marginBottom: "20px",
  },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  progressLabel: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#1a2c3e",
  },
  progressValue: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#5e7a93",
  },
  progressBarBg: {
    backgroundColor: "#eef2f6",
    borderRadius: "10px",
    height: "8px",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: "10px",
    transition: "width 0.3s ease",
  },
  queueStatusCard: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  },
  queueStatusHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px",
  },
  queueStatusIcon: {
    fontSize: "24px",
  },
  queueStatusTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1a2c3e",
  },
  queueStatusContent: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  queueStatusValue: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1e6f5c",
  },
  queueStatusText: {
    fontSize: "14px",
    color: "#5e7a93",
    lineHeight: "1.5",
  },
};

// Add hover effects
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
  
  a:hover, button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
  
  .nav-item:hover {
    background-color: #f8fafc;
    transform: translateX(4px);
  }
`;

if (typeof document !== "undefined") {
  document.head.appendChild(styleSheet);
}