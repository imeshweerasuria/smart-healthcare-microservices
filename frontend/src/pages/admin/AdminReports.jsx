import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API, authHeaders } from "../../api/client";
import { Link, useNavigate } from "react-router-dom";
import { clearSession, getName } from "../../api/auth";

export default function AdminReports() {
  const navigate = useNavigate();
  const [reportRows, setReportRows] = useState([]);
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

      const patientUsers = (usersRes.data || []).filter((u) => u.role === "PATIENT");

      const rowsNested = await Promise.all(
        patientUsers.map(async (patient) => {
          try {
            const reportsRes = await axios.get(
              `${API.patient}/patients/${patient._id}/reports`,
              { headers: authHeaders() }
            );

            return (reportsRes.data || []).map((report) => ({
              patientId: patient._id,
              patientName: patient.name,
              patientEmail: patient.email,
              filename: report.filename,
              originalName: report.originalName,
              uploadedAt: report.uploadedAt,
              downloadUrl: report.downloadUrl,
            }));
          } catch {
            return [];
          }
        })
      );

      setReportRows(rowsNested.flat());
    } catch (err) {
      console.error(err);
      alert("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredReports = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return reportRows.filter((r) => {
      return (
        r.patientName?.toLowerCase().includes(q) ||
        r.patientEmail?.toLowerCase().includes(q) ||
        r.originalName?.toLowerCase().includes(q) ||
        r.filename?.toLowerCase().includes(q)
      );
    });
  }, [reportRows, searchTerm]);

  const stats = {
    total: reportRows.length,
    uniquePatients: new Set(reportRows.map(r => r.patientId)).size,
    fileTypes: reportRows.filter(r => r.originalName?.match(/\.(pdf|jpg|jpeg|png|doc|docx)$/i)).length,
  };

  const navItems = [
    { path: "/admin", label: "Dashboard", icon: "📊" },
    { path: "/admin/doctors", label: "Manage Doctors", icon: "👨‍⚕️" },
    { path: "/admin/patients", label: "Manage Patients", icon: "👤" },
    { path: "/admin/appointments", label: "Appointments", icon: "📅" },
    { path: "/admin/payments", label: "Payment Summary", icon: "💰" },
    { path: "/admin/reports", label: "Reports", icon: "📋", active: true },
  ];

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (filename) => {
    const ext = filename?.split('.').pop()?.toLowerCase();
    switch(ext) {
      case 'pdf': return '📄';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return '🖼️';
      case 'doc':
      case 'docx': return '📝';
      default: return '📎';
    }
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
              <h1 style={styles.title}>Medical Reports</h1>
              <p style={styles.subtitle}>View and manage patient uploaded medical reports and documents</p>
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
              <div style={{...styles.statIcon, backgroundColor: "#e3f2fd"}}>📋</div>
              <div>
                <div style={styles.statValue}>{stats.total}</div>
                <div style={styles.statLabel}>Total Reports</div>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={{...styles.statIcon, backgroundColor: "#e8f5e9"}}>👥</div>
              <div>
                <div style={styles.statValue}>{stats.uniquePatients}</div>
                <div style={styles.statLabel}>Patients with Reports</div>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={{...styles.statIcon, backgroundColor: "#f3e5f5"}}>📎</div>
              <div>
                <div style={styles.statValue}>{stats.fileTypes}</div>
                <div style={styles.statLabel}>Documents</div>
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
              placeholder="Search by patient name, email, or file name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {/* Reports Table */}
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p style={styles.loadingText}>Loading reports...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📋</div>
              <p style={styles.emptyText}>No reports found</p>
              <p style={styles.emptySubtext}>Try adjusting your search criteria</p>
            </div>
          ) : (
            <>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Patient</th>
                      <th style={styles.th}>Email</th>
                      <th style={styles.th}>File Name</th>
                      <th style={styles.th}>Uploaded At</th>
                      <th style={styles.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map((report, index) => (
                      <tr key={`${report.patientId}-${report.filename}-${index}`} className="report-row">
                        <td style={styles.td}>
                          <div style={styles.patientCell}>
                            <div style={styles.patientAvatar}>
                              {report.patientName?.charAt(0) || "P"}
                            </div>
                            <span style={styles.patientName}>{report.patientName}</span>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.emailText}>{report.patientEmail}</span>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.fileCell}>
                            <span style={styles.fileIcon}>{getFileIcon(report.originalName)}</span>
                            <span style={styles.fileName}>{report.originalName || report.filename}</span>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.dateCell}>
                            <span style={styles.dateIcon}>📅</span>
                            <span>{formatDate(report.uploadedAt)}</span>
                          </div>
                        </td>
                        <td style={styles.td}>
                          {report.downloadUrl ? (
                            <a
                              href={report.downloadUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={styles.downloadBtn}
                              className="download-button"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginRight: "6px" }}>
                                <path d="M12 3V12M12 12L9 9M12 12L15 9M5 21H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                <path d="M4 17L4 19C4 20.1046 4.89543 21 6 21L18 21C19.1046 21 20 20.1046 20 19L20 17" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                              Open Report
                            </a>
                          ) : (
                            <span style={styles.noAction}>N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer Stats */}
              {filteredReports.length > 0 && (
                <div style={styles.footerStats}>
                  Showing {filteredReports.length} of {reportRows.length} reports
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
        
        .report-row {
          transition: all 0.2s ease;
        }
        
        .report-row:hover {
          background-color: #f8fafc;
        }
        
        .download-button {
          transition: all 0.2s ease;
        }
        
        .download-button:hover {
          background-color: #c8e6d9 !important;
          transform: translateX(2px);
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
  tableWrapper: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    overflow: "auto",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "800px",
  },
  th: {
    textAlign: "left",
    padding: "16px 20px",
    backgroundColor: "#fafcfd",
    borderBottom: "1px solid #eef2f6",
    color: "#1a2c3e",
    fontWeight: "600",
    fontSize: "14px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  td: {
    padding: "16px 20px",
    borderBottom: "1px solid #eef2f6",
    color: "#334155",
    fontSize: "14px",
  },
  patientCell: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  patientAvatar: {
    width: "32px",
    height: "32px",
    backgroundColor: "#e8f5e9",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "600",
    color: "#1e6f5c",
  },
  patientName: {
    fontWeight: "500",
    color: "#1a2c3e",
  },
  emailText: {
    color: "#5e7a93",
  },
  fileCell: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  fileIcon: {
    fontSize: "18px",
  },
  fileName: {
    color: "#334155",
  },
  dateCell: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  dateIcon: {
    fontSize: "14px",
  },
  downloadBtn: {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 16px",
    backgroundColor: "#e8f5e9",
    color: "#1e6f5c",
    textDecoration: "none",
    borderRadius: "40px",
    fontSize: "13px",
    fontWeight: "600",
    transition: "all 0.2s ease",
  },
  noAction: {
    color: "#9aaebf",
    fontSize: "13px",
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