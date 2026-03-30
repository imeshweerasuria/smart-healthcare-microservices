import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API, authHeaders } from "../../api/client";
import { Link, useNavigate } from "react-router-dom";
import { clearSession, getName } from "../../api/auth";

export default function AdminManageDoctors() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const logout = () => {
    clearSession();
    navigate("/login");
  };

  const load = async () => {
    try {
      setLoading(true);

      const usersRes = await axios.get(`${API.auth}/auth/users`, {
        headers: authHeaders(),
      });

      const doctorUsers = (usersRes.data || []).filter((u) => u.role === "DOCTOR");

      const enrichedDoctors = await Promise.all(
        doctorUsers.map(async (doctor) => {
          try {
            const profileRes = await axios.get(`${API.doctor}/doctors/${doctor._id}`, {
              headers: authHeaders(),
            });

            return {
              ...doctor,
              profile: profileRes.data || null,
            };
          } catch {
            return {
              ...doctor,
              profile: null,
            };
          }
        })
      );

      setDoctors(enrichedDoctors);
    } catch (err) {
      console.error(err);
      alert("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleDisable = async (userId) => {
    try {
      await axios.patch(
        `${API.auth}/auth/users/${userId}/toggle-disable`,
        {},
        { headers: authHeaders() }
      );
      await load();
    } catch (err) {
      console.error(err);
      alert("Failed to update doctor status");
    }
  };

  const verifyDoctor = async (doctorId) => {
    try {
      await axios.patch(
        `${API.auth}/auth/doctors/${doctorId}/verify`,
        {},
        { headers: authHeaders() }
      );
      await load();
    } catch (err) {
      console.error(err);
      alert("Failed to verify doctor");
    }
  };

  const filteredDoctors = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return doctors.filter((d) => {
      return (
        d.name?.toLowerCase().includes(q) ||
        d.email?.toLowerCase().includes(q) ||
        d.profile?.specialty?.toLowerCase().includes(q) ||
        d.profile?.bio?.toLowerCase().includes(q)
      );
    });
  }, [doctors, searchTerm]);

  const stats = {
    total: doctors.length,
    verified: doctors.filter((d) => d.doctorVerified).length,
    unverified: doctors.filter((d) => !d.doctorVerified).length,
    disabled: doctors.filter((d) => d.isDisabled).length,
  };

  const navItems = [
    { path: "/admin", label: "Dashboard", icon: "📊" },
    { path: "/admin/doctors", label: "Manage Doctors", icon: "👨‍⚕️", active: true },
    { path: "/admin/patients", label: "Manage Patients", icon: "👤" },
    { path: "/admin/appointments", label: "Appointments", icon: "📅" },
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
              <h1 style={styles.title}>Manage Doctors</h1>
              <p style={styles.subtitle}>View, verify, and manage all registered doctors</p>
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
              <div style={{...styles.statIcon, backgroundColor: "#e3f2fd"}}>👨‍⚕️</div>
              <div>
                <div style={styles.statValue}>{stats.total}</div>
                <div style={styles.statLabel}>Total Doctors</div>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={{...styles.statIcon, backgroundColor: "#e8f5e9"}}>✓</div>
              <div>
                <div style={styles.statValue}>{stats.verified}</div>
                <div style={styles.statLabel}>Verified</div>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={{...styles.statIcon, backgroundColor: "#fff3e0"}}>⏳</div>
              <div>
                <div style={styles.statValue}>{stats.unverified}</div>
                <div style={styles.statLabel}>Unverified</div>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={{...styles.statIcon, backgroundColor: "#ffebee"}}>🚫</div>
              <div>
                <div style={styles.statValue}>{stats.disabled}</div>
                <div style={styles.statLabel}>Disabled</div>
              </div>
            </div>
          </div>

          {/* Search Box */}
          <div style={styles.searchWrapper}>
            <svg style={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <input
              type="text"
              placeholder="Search doctor by name, email, specialty, or bio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {/* Doctors List */}
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p style={styles.loadingText}>Loading doctors...</p>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>👨‍⚕️</div>
              <p style={styles.emptyText}>No doctors found</p>
              <p style={styles.emptySubtext}>Try adjusting your search criteria</p>
            </div>
          ) : (
            <>
              <div style={styles.cardsGrid}>
                {filteredDoctors.map((doctor) => (
                  <div key={doctor._id} style={styles.doctorCard} className="doctor-card">
                    <div style={styles.cardHeader}>
                      <div style={styles.userAvatar}>
                        {doctor.name?.charAt(0) || "D"}
                      </div>
                      <div style={styles.cardHeaderInfo}>
                        <h3 style={styles.cardTitle}>{doctor.name}</h3>
                        <p style={styles.cardEmail}>{doctor.email}</p>
                      </div>
                      <div style={doctor.doctorVerified ? styles.badgeVerified : styles.badgePending}>
                        {doctor.doctorVerified ? "Verified" : "Pending"}
                      </div>
                    </div>

                    <div style={styles.cardContent}>
                      <div style={styles.infoRow}>
                        <span style={styles.infoIcon}>🎯</span>
                        <div>
                          <div style={styles.infoLabel}>Specialty</div>
                          <div style={styles.infoValue}>{doctor.profile?.specialty || "Not added"}</div>
                        </div>
                      </div>
                      <div style={styles.infoRow}>
                        <span style={styles.infoIcon}>📝</span>
                        <div>
                          <div style={styles.infoLabel}>Bio</div>
                          <div style={styles.infoValue}>{doctor.profile?.bio || "Not added"}</div>
                        </div>
                      </div>
                      <div style={styles.infoRow}>
                        <span style={styles.infoIcon}>⚡</span>
                        <div>
                          <div style={styles.infoLabel}>Status</div>
                          <div style={doctor.isDisabled ? styles.statusDisabled : styles.statusActive}>
                            {doctor.isDisabled ? "Disabled" : "Active"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={styles.actions}>
                      {!doctor.doctorVerified && (
                        <button onClick={() => verifyDoctor(doctor._id)} style={styles.verifyBtn} className="action-button">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginRight: "6px" }}>
                            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          Verify Doctor
                        </button>
                      )}
                      <button
                        onClick={() => toggleDisable(doctor._id)}
                        style={doctor.isDisabled ? styles.enableBtn : styles.disableBtn}
                        className="action-button"
                      >
                        {doctor.isDisabled ? "Enable Doctor" : "Disable Doctor"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Stats */}
              {filteredDoctors.length > 0 && (
                <div style={styles.footerStats}>
                  Showing {filteredDoctors.length} of {doctors.length} doctors
                </div>
              )}
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
        
        .doctor-card {
          transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
        }
        
        .doctor-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px -8px rgba(0, 0, 0, 0.12);
        }
        
        .action-button {
          transition: all 0.2s ease;
        }
        
        .action-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        input:focus {
          border-color: #1e6f5c !important;
          box-shadow: 0 0 0 3px rgba(30, 111, 92, 0.08) !important;
          outline: none;
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
  searchWrapper: {
    position: "relative",
    marginBottom: "32px",
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
    transition: "all 0.2s ease",
    boxSizing: "border-box",
    backgroundColor: "#ffffff",
  },
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
    gap: "24px",
  },
  doctorCard: {
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
    alignItems: "center",
    gap: "16px",
    position: "relative",
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
    flexShrink: 0,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1a2c3e",
    margin: "0 0 4px 0",
  },
  cardEmail: {
    fontSize: "13px",
    color: "#5e7a93",
    margin: 0,
  },
  badgeVerified: {
    padding: "6px 12px",
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    flexShrink: 0,
  },
  badgePending: {
    padding: "6px 12px",
    backgroundColor: "#fff3e0",
    color: "#ed6c02",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    flexShrink: 0,
  },
  cardContent: {
    padding: "24px",
  },
  infoRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "16px",
  },
  infoIcon: {
    fontSize: "20px",
    flexShrink: 0,
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
  statusActive: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#2e7d32",
  },
  statusDisabled: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#c62828",
  },
  actions: {
    padding: "0 24px 24px 24px",
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  verifyBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
  },
  disableBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
  },
  footerStats: {
    marginTop: "24px",
    textAlign: "center",
    fontSize: "13px",
    color: "#5e7a93",
    padding: "20px",
  },
};