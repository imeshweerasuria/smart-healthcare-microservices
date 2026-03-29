import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { API, authHeaders } from "../../api/client";
import { clearSession, getName } from "../../api/auth";

export default function MyReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const logout = () => {
    clearSession();
    navigate("/login");
  };

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API.patient}/patients/me/reports`, {
        headers: authHeaders(),
      });
      setReports(res.data);
    } catch (err) {
      console.error(err);
      showToast("Failed to load reports", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const confirmDelete = (filename) => {
    setReportToDelete(filename);
    setShowConfirmModal(true);
  };

  const cancelDelete = () => {
    setReportToDelete(null);
    setShowConfirmModal(false);
  };

  const executeDelete = async () => {
    if (!reportToDelete) return;
    
    try {
      setDeleting(reportToDelete);
      setShowConfirmModal(false);
      await axios.delete(`${API.patient}/patients/me/reports/${reportToDelete}`, {
        headers: authHeaders(),
      });
      showToast("Report deleted successfully", "success");
      await loadReports();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to delete report", "error");
    } finally {
      setDeleting(null);
      setReportToDelete(null);
    }
  };

  const navItems = [
    { path: "/patient/profile", label: "My Profile", icon: "👤" },
    { path: "/patient/medical-record", label: "My Medical Record", icon: "📋" },
    { path: "/patient/doctors", label: "Browse Doctors", icon: "👨‍⚕️" },
    { path: "/patient/appointments", label: "My Appointments", icon: "📅" },
    { path: "/patient/upload", label: "Upload Medical Reports", icon: "📤" },
    { path: "/patient/reports", label: "My Reports", icon: "📊", active: true },
    { path: "/patient/prescriptions", label: "My Prescriptions", icon: "💊" },
    { path: "/patient/payments", label: "My Payments", icon: "💰" },
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (filename) => {
    const extension = filename?.split('.').pop()?.toLowerCase();
    switch(extension) {
      case 'pdf':
        return '📄';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      case 'doc':
      case 'docx':
        return '📝';
      default:
        return '📁';
    }
  };

  const stats = {
    total: reports.length,
    pdf: reports.filter(r => r.originalName?.toLowerCase().endsWith('.pdf')).length,
    image: reports.filter(r => /\.(jpg|jpeg|png|gif)$/i.test(r.originalName)).length,
    document: reports.filter(r => /\.(doc|docx)$/i.test(r.originalName)).length,
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
            <p style={styles.loadingText}>Loading reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Toast Notification */}
      {toast.show && (
        <div style={{
          ...styles.toast,
          backgroundColor: toast.type === "success" ? "#4caf50" : "#f44336",
          animation: "slideIn 0.3s ease-out"
        }}>
          <div style={styles.toastContent}>
            <span style={styles.toastIcon}>
              {toast.type === "success" ? "✓" : "✕"}
            </span>
            <span style={styles.toastMessage}>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {showConfirmModal && (
        <div style={styles.modalOverlay} onClick={cancelDelete}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalIcon}>⚠️</div>
              <h3 style={styles.modalTitle}>Delete Report</h3>
            </div>
            <div style={styles.modalContent}>
              <p style={styles.modalMessage}>
                Are you sure you want to delete this report?
              </p>
              <p style={styles.modalWarning}>
                This action cannot be undone and the file will be permanently removed.
              </p>
            </div>
            <div style={styles.modalActions}>
              <button onClick={cancelDelete} style={styles.modalCancelBtn}>
                Cancel
              </button>
              <button onClick={executeDelete} style={styles.modalConfirmBtn}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

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
            <h1 style={styles.title}>My Reports</h1>
            <p style={styles.subtitle}>View and manage your uploaded medical reports</p>
          </div>
          <Link to="/patient/upload" style={styles.uploadBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4V20M20 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Upload New Report
          </Link>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={{...styles.statIcon, backgroundColor: "#e3f2fd"}}>📊</div>
            <div>
              <div style={styles.statValue}>{stats.total}</div>
              <div style={styles.statLabel}>Total Reports</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{...styles.statIcon, backgroundColor: "#ffebee"}}>📄</div>
            <div>
              <div style={styles.statValue}>{stats.pdf}</div>
              <div style={styles.statLabel}>PDF Files</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{...styles.statIcon, backgroundColor: "#e8f5e9"}}>🖼️</div>
            <div>
              <div style={styles.statValue}>{stats.image}</div>
              <div style={styles.statLabel}>Images</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{...styles.statIcon, backgroundColor: "#fff3e0"}}>📝</div>
            <div>
              <div style={styles.statValue}>{stats.document}</div>
              <div style={styles.statLabel}>Documents</div>
            </div>
          </div>
        </div>

        {/* Reports List */}
        {reports.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📊</div>
            <p style={styles.emptyText}>No reports yet</p>
            <p style={styles.emptySubtext}>Upload your first medical report to get started</p>
            <Link to="/patient/upload" style={styles.emptyBtn}>
              Upload Report
            </Link>
          </div>
        ) : (
          <div style={styles.reportsGrid}>
            {reports.map((r, index) => (
              <div key={index} style={styles.reportCard}>
                <div style={styles.cardHeader}>
                  <div style={styles.fileIcon}>{getFileIcon(r.originalName)}</div>
                  <div style={styles.fileInfo}>
                    <div style={styles.fileName}>{r.originalName}</div>
                    <div style={styles.uploadDate}>{formatDate(r.uploadedAt)}</div>
                  </div>
                </div>

                <div style={styles.cardContent}>
                  <div style={styles.fileDetails}>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>File ID:</span>
                      <span style={styles.detailValue}>{r.filename?.slice(-12) || "N/A"}</span>
                    </div>
                    {r.fileSize && (
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Size:</span>
                        <span style={styles.detailValue}>{(r.fileSize / 1024).toFixed(2)} KB</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={styles.cardActions}>
                  {r.downloadUrl && (
                    <a 
                      href={r.downloadUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      style={styles.viewBtn}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      View / Download
                    </a>
                  )}
                  <button
                    onClick={() => confirmDelete(r.filename)}
                    disabled={deleting === r.filename}
                    style={deleting === r.filename ? styles.deleteBtnDisabled : styles.deleteBtn}
                  >
                    {deleting === r.filename ? (
                      <>
                        <div style={styles.smallSpinner}></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        button:hover:not(:disabled), a:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .report-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }
      `}</style>
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
    position: "relative",
  },
  toast: {
    position: "fixed",
    top: "24px",
    right: "24px",
    zIndex: 1000,
    padding: "14px 20px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
    color: "#ffffff",
    minWidth: "280px",
    maxWidth: "400px",
  },
  toastContent: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  toastIcon: {
    fontSize: "18px",
    fontWeight: "bold",
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  toastMessage: {
    fontSize: "14px",
    fontWeight: "500",
    flex: 1,
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    backdropFilter: "blur(4px)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    animation: "fadeIn 0.2s ease-out",
  },
  modal: {
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    width: "90%",
    maxWidth: "480px",
    overflow: "hidden",
    animation: "scaleIn 0.2s ease-out",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
  },
  modalHeader: {
    padding: "24px 24px 16px 24px",
    backgroundColor: "#fff5f5",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    borderBottom: "1px solid #ffe0e0",
  },
  modalIcon: {
    fontSize: "28px",
  },
  modalTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#c62828",
    margin: 0,
  },
  modalContent: {
    padding: "24px",
  },
  modalMessage: {
    fontSize: "15px",
    color: "#1a2c3e",
    marginBottom: "12px",
    lineHeight: "1.5",
  },
  modalWarning: {
    fontSize: "13px",
    color: "#c62828",
    backgroundColor: "#fff5f5",
    padding: "12px",
    borderRadius: "8px",
    marginTop: "12px",
    fontWeight: "500",
  },
  modalActions: {
    padding: "16px 24px 24px 24px",
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
  },
  modalCancelBtn: {
    padding: "10px 20px",
    backgroundColor: "#f5f7fa",
    color: "#5e7a93",
    border: "1.5px solid #e2e8f0",
    borderRadius: "40px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
  },
  modalConfirmBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: "#c62828",
    color: "#ffffff",
    border: "none",
    borderRadius: "40px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
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
  uploadBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: "#1e6f5c",
    color: "#ffffff",
    border: "none",
    borderRadius: "40px",
    fontSize: "14px",
    fontWeight: "500",
    textDecoration: "none",
    transition: "all 0.2s ease",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
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
  reportsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
    gap: "24px",
    width: "100%",
  },
  reportCard: {
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
  fileIcon: {
    width: "56px",
    height: "56px",
    backgroundColor: "#e8f5e9",
    borderRadius: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    color: "#1e6f5c",
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1a2c3e",
    marginBottom: "4px",
    wordBreak: "break-all",
  },
  uploadDate: {
    fontSize: "12px",
    color: "#5e7a93",
  },
  cardContent: {
    padding: "20px 24px",
    borderBottom: "1px solid #eef2f6",
  },
  fileDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  detailRow: {
    display: "flex",
    gap: "12px",
    fontSize: "13px",
  },
  detailLabel: {
    color: "#5e7a93",
    minWidth: "60px",
  },
  detailValue: {
    color: "#1a2c3e",
    fontFamily: "monospace",
  },
  cardActions: {
    padding: "16px 24px",
    display: "flex",
    gap: "12px",
  },
  viewBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "10px",
    backgroundColor: "#e8f5e9",
    color: "#1e6f5c",
    border: "none",
    borderRadius: "40px",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    textDecoration: "none",
    transition: "all 0.2s ease",
  },
  deleteBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "10px",
    backgroundColor: "#ffebee",
    color: "#c62828",
    border: "none",
    borderRadius: "40px",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
  },
  deleteBtnDisabled: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "10px",
    backgroundColor: "#ffebee",
    color: "#c62828",
    border: "none",
    borderRadius: "40px",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "not-allowed",
    fontFamily: "inherit",
    opacity: 0.6,
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
  smallSpinner: {
    width: "14px",
    height: "14px",
    border: "2px solid rgba(198, 40, 40, 0.3)",
    borderTopColor: "#c62828",
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
    marginBottom: "24px",
  },
  emptyBtn: {
    display: "inline-block",
    padding: "12px 28px",
    backgroundColor: "#1e6f5c",
    color: "#ffffff",
    textDecoration: "none",
    borderRadius: "40px",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s ease",
  },
};

// Add keyframes animation
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
  
  button:hover:not(:disabled), a:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .report-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }
`;

if (typeof document !== "undefined") {
  document.head.appendChild(styleSheet);
}