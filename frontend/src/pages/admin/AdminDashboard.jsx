import { useEffect, useState } from "react";
import axios from "axios";
import { API, authHeaders } from "../../api/client";
import { clearSession, getName } from "../../api/auth";
import { useNavigate, Link } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");

  const load = async () => {
    try {
      setLoading(true);

      const [usersRes, pendingRes] = await Promise.all([
        axios.get(`${API.auth}/auth/users`, { headers: authHeaders() }),
        axios.get(`${API.auth}/auth/doctors/pending`, { headers: authHeaders() }),
      ]);

      setUsers(usersRes.data);
      setPendingDoctors(pendingRes.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const verifyDoctor = async (doctorId) => {
    try {
      await axios.patch(
        `${API.auth}/auth/doctors/${doctorId}/verify`,
        {},
        { headers: authHeaders() }
      );
      alert("Doctor verified successfully");
      load();
    } catch (err) {
      console.error(err);
      alert("Verify failed");
    }
  };

  const toggleDisable = async (userId) => {
    try {
      await axios.patch(
        `${API.auth}/auth/users/${userId}/toggle-disable`,
        {},
        { headers: authHeaders() }
      );
      alert("User status updated successfully");
      load();
    } catch (err) {
      console.error(err);
      alert("Failed to update user status");
    }
  };

  const logout = () => {
    clearSession();
    navigate("/login");
  };

  // Filter users based on search
  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeStyle = (role) => {
    switch(role) {
      case "ADMIN": return { bg: "#ffebee", color: "#c62828" };
      case "DOCTOR": return { bg: "#e8f5e9", color: "#2e7d32" };
      case "PATIENT": return { bg: "#e3f2fd", color: "#0288d1" };
      default: return { bg: "#f5f5f5", color: "#757575" };
    }
  };

  const stats = {
    totalUsers: users.length,
    totalDoctors: users.filter(u => u.role === "DOCTOR").length,
    totalPatients: users.filter(u => u.role === "PATIENT").length,
    totalAdmins: users.filter(u => u.role === "ADMIN").length,
    pendingDoctors: pendingDoctors.length,
    disabledUsers: users.filter(u => u.isDisabled).length,
  };

  return (
    <div style={styles.app}>
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
            <div style={styles.adminAvatar}>A</div>
            <div>
              <div style={styles.adminName}>{getName() || "Admin"}</div>
              <div style={styles.adminRole}>Administrator</div>
            </div>
          </div>
        </div>
        
        <div style={styles.sidebarNav}>
          <div style={styles.navItemActive}>
            <span style={styles.navIcon}>📊</span>
            <span>Dashboard</span>
          </div>

          <Link to="/admin/doctors" style={styles.navItem}>
            <span style={styles.navIcon}>👨‍⚕️</span>
            <span>Manage Doctors</span>
          </Link>

          <Link to="/admin/patients" style={styles.navItem}>
            <span style={styles.navIcon}>👤</span>
            <span>Manage Patients</span>
          </Link>

          <Link to="/admin/appointments" style={styles.navItem}>
            <span style={styles.navIcon}>📅</span>
            <span>Appointments</span>
          </Link>

          <Link to="/admin/payments" style={styles.navItem}>
            <span style={styles.navIcon}>💰</span>
            <span>Payment Summary</span>
          </Link>

          <Link to="/admin/reports" style={styles.navItem}>
            <span style={styles.navIcon}>📋</span>
            <span>Reports</span>
          </Link>

          <button onClick={logout} style={styles.logoutBtn}>
            <span style={styles.navIcon}>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.content}>
          <div style={styles.header}>
            <div>
              <h1 style={styles.title}>Admin Dashboard</h1>
              <p style={styles.subtitle}>Manage users, doctors, and system settings</p>
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

          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={{...styles.statIcon, backgroundColor: "#e3f2fd"}}>👥</div>
              <div>
                <div style={styles.statValue}>{stats.totalUsers}</div>
                <div style={styles.statLabel}>Total Users</div>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={{...styles.statIcon, backgroundColor: "#e8f5e9"}}>👨‍⚕️</div>
              <div>
                <div style={styles.statValue}>{stats.totalDoctors}</div>
                <div style={styles.statLabel}>Doctors</div>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={{...styles.statIcon, backgroundColor: "#fff3e0"}}>👤</div>
              <div>
                <div style={styles.statValue}>{stats.totalPatients}</div>
                <div style={styles.statLabel}>Patients</div>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={{...styles.statIcon, backgroundColor: "#ffebee"}}>⏳</div>
              <div>
                <div style={styles.statValue}>{stats.pendingDoctors}</div>
                <div style={styles.statLabel}>Pending Verifications</div>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={{...styles.statIcon, backgroundColor: "#f3e5f5"}}>🚫</div>
              <div>
                <div style={styles.statValue}>{stats.disabledUsers}</div>
                <div style={styles.statLabel}>Disabled Users</div>
              </div>
            </div>
          </div>

          <div style={styles.tabSection}>
            <div style={styles.tabs}>
              <button 
                onClick={() => setActiveTab("pending")}
                style={activeTab === "pending" ? {...styles.tab, ...styles.tabActive} : styles.tab}
              >
                Pending Doctors
                {stats.pendingDoctors > 0 && (
                  <span style={styles.badge}>{stats.pendingDoctors}</span>
                )}
              </button>
              <button 
                onClick={() => setActiveTab("all")}
                style={activeTab === "all" ? {...styles.tab, ...styles.tabActive} : styles.tab}
              >
                All Users
              </button>
            </div>
            
            {activeTab === "all" && (
              <div style={styles.searchWrapper}>
                <svg style={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                />
              </div>
            )}
          </div>

          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p style={styles.loadingText}>Loading dashboard data...</p>
            </div>
          ) : (
            <>
              {activeTab === "pending" && (
                <div>
                  {pendingDoctors.length === 0 ? (
                    <div style={styles.emptyState}>
                      <div style={styles.emptyIcon}>✓</div>
                      <p style={styles.emptyText}>No pending doctors</p>
                      <p style={styles.emptySubtext}>All doctors have been verified</p>
                    </div>
                  ) : (
                    <div style={styles.usersGrid}>
                      {pendingDoctors.map((d) => (
                        <div key={d._id} style={styles.userCard}>
                          <div style={styles.cardHeader}>
                            <div style={styles.userAvatar}>{d.name?.charAt(0) || "D"}</div>
                            <div style={styles.pendingBadge}>Pending</div>
                          </div>
                          <div style={styles.userInfo}>
                            <h3 style={styles.userName}>{d.name}</h3>
                            <p style={styles.userEmail}>{d.email}</p>
                            <div style={styles.userMeta}>
                              <span>👨‍⚕️ Doctor Registration</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => verifyDoctor(d._id)} 
                            style={styles.verifyBtn}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                            Verify Doctor
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "all" && (
                <div>
                  {filteredUsers.length === 0 ? (
                    <div style={styles.emptyState}>
                      <div style={styles.emptyIcon}>🔍</div>
                      <p style={styles.emptyText}>No users found</p>
                      <p style={styles.emptySubtext}>Try adjusting your search</p>
                    </div>
                  ) : (
                    <div style={styles.usersGrid}>
                      {filteredUsers.map((u) => {
                        const roleStyle = getRoleBadgeStyle(u.role);
                        return (
                          <div key={u._id} style={styles.userCard}>
                            <div style={styles.cardHeader}>
                              <div style={styles.userAvatar}>{u.name?.charAt(0) || "U"}</div>
                              <div style={{...styles.roleBadge, backgroundColor: roleStyle.bg, color: roleStyle.color}}>
                                {u.role}
                              </div>
                            </div>
                            <div style={styles.userInfo}>
                              <h3 style={styles.userName}>{u.name}</h3>
                              <p style={styles.userEmail}>{u.email}</p>
                              <div style={styles.userMeta}>
                                {u.role === "DOCTOR" && (
                                  <span style={{...styles.verifiedBadge, backgroundColor: u.doctorVerified ? "#e8f5e9" : "#ffebee", color: u.doctorVerified ? "#2e7d32" : "#c62828"}}>
                                    {u.doctorVerified ? "✓ Verified" : "⏳ Unverified"}
                                  </span>
                                )}
                                {u.isDisabled && (
                                  <span style={styles.disabledBadge}>Disabled</span>
                                )}
                              </div>
                            </div>
                            <button 
                              onClick={() => toggleDisable(u._id)} 
                              style={u.isDisabled ? styles.enableBtn : styles.disableBtn}
                            >
                              {u.isDisabled ? "Enable User" : "Disable User"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {filteredUsers.length > 0 && (
                    <div style={styles.footerStats}>
                      Showing {filteredUsers.length} of {users.length} users
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  app: {
    display: "flex",
    width: "100%",
    minHeight: "100vh",
    backgroundColor: "#f5f7fa",
    fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sidebar: {
    width: "280px",
    backgroundColor: "#ffffff",
    borderRight: "1px solid #eef2f6",
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    position: "sticky",
    top: 0,
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
    overflowY: "auto",
    backgroundColor: "#f5f7fa",
    height: "100vh",
  },
  content: {
    padding: "32px",
    maxWidth: "1400px",
    margin: "0 auto",
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
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
  },
  tabs: {
    display: "flex",
    gap: "12px",
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
  searchWrapper: {
    position: "relative",
    width: "280px",
  },
  searchIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#9aaebf",
  },
  searchInput: {
    width: "100%",
    padding: "10px 12px 10px 38px",
    fontSize: "14px",
    border: "1.5px solid #e2e8f0",
    borderRadius: "40px",
    fontFamily: "inherit",
    outline: "none",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
  },
  usersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
    gap: "24px",
  },
  userCard: {
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
  userAvatar: {
    width: "48px",
    height: "48px",
    backgroundColor: "#e8f5e9",
    borderRadius: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "600",
    color: "#1e6f5c",
  },
  pendingBadge: {
    padding: "6px 12px",
    backgroundColor: "#fff3e0",
    color: "#ed6c02",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  roleBadge: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  userInfo: {
    padding: "24px",
  },
  userName: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1a2c3e",
    margin: "0 0 8px 0",
  },
  userEmail: {
    fontSize: "14px",
    color: "#5e7a93",
    margin: "0 0 12px 0",
  },
  userMeta: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  verifiedBadge: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
  },
  disabledBadge: {
    padding: "4px 10px",
    backgroundColor: "#ffebee",
    color: "#c62828",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
  },
  verifyBtn: {
    margin: "0 24px 24px 24px",
    width: "calc(100% - 48px)",
    padding: "12px",
    backgroundColor: "#e8f5e9",
    color: "#1e6f5c",
    border: "none",
    borderRadius: "40px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  disableBtn: {
    margin: "0 24px 24px 24px",
    width: "calc(100% - 48px)",
    padding: "12px",
    backgroundColor: "#ffebee",
    color: "#c62828",
    border: "none",
    borderRadius: "40px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
  },
  enableBtn: {
    margin: "0 24px 24px 24px",
    width: "calc(100% - 48px)",
    padding: "12px",
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
    border: "none",
    borderRadius: "40px",
    fontSize: "14px",
    fontWeight: "600",
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

// Add keyframes animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
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
    overflow: auto;
  }
  
  #root {
    width: 100%;
    height: 100%;
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
  
  .nav-item:hover, .user-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }
  
  a:hover {
    background-color: #f8fafc;
  }
`;

if (typeof document !== "undefined") {
  document.head.appendChild(styleSheet);
}