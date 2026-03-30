import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { API, authHeaders } from "../../api/client";
import { clearSession, getName } from "../../api/auth";

export default function UploadReports() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
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

  const upload = async () => {
    try {
      if (!file) {
        showToast("Please select a file first", "error");
        return;
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        showToast("Only PDF, JPG, and PNG files are allowed", "error");
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast("File size must be less than 5MB", "error");
        return;
      }

      setLoading(true);

      const form = new FormData();
      form.append("report", file);

      await axios.post(`${API.patient}/patients/me/reports`, form, {
        headers: {
          ...authHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      });

      showToast("Report uploaded successfully!", "success");
      setFile(null);
      // Reset file input
      const fileInput = document.getElementById('file-upload');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Upload failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      // Validate file type for drag and drop
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(droppedFile.type)) {
        showToast("Only PDF, JPG, and PNG files are allowed", "error");
        return;
      }
      if (droppedFile.size > 5 * 1024 * 1024) {
        showToast("File size must be less than 5MB", "error");
        return;
      }
      setFile(droppedFile);
    }
  };

  const navItems = [
    { path: "/patient/profile", label: "My Profile", icon: "👤" },
    { path: "/patient/medical-record", label: "My Medical Record", icon: "📋" },
    { path: "/patient/doctors", label: "Browse Doctors", icon: "👨‍⚕️" },
    { path: "/patient/appointments", label: "My Appointments", icon: "📅" },
    { path: "/patient/upload", label: "Upload Medical Reports", icon: "📤", active: true },
    { path: "/patient/reports", label: "My Reports", icon: "📊" },
    { path: "/patient/prescriptions", label: "My Prescriptions", icon: "💊" },
    { path: "/patient/payments", label: "My Payments", icon: "💰" },
  ];

  const getFileIcon = () => {
    if (!file) return "📄";
    const type = file.type;
    if (type === 'application/pdf') return "📑";
    if (type.includes('image')) return "🖼️";
    return "📁";
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

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
            <h1 style={styles.title}>Upload Medical Report</h1>
            <p style={styles.subtitle}>Share your medical documents with your healthcare provider</p>
          </div>
          <Link to="/patient/reports" style={styles.viewReportsBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
            </svg>
            View My Reports
          </Link>
        </div>

        {/* Upload Card */}
        <div style={styles.uploadCard}>
          <div style={styles.uploadIcon}>📤</div>
          <h2 style={styles.uploadTitle}>Upload Medical Report</h2>
          <p style={styles.uploadDescription}>
            Upload your medical reports, test results, or any health-related documents
          </p>

          {/* File Requirements */}
          <div style={styles.requirements}>
            <div style={styles.requirementBadge}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              PDF, JPG, PNG
            </div>
            <div style={styles.requirementBadge}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Max 5MB
            </div>
            <div style={styles.requirementBadge}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2V22M2 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              One file at a time
            </div>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            style={{
              ...styles.dropzone,
              ...(dragActive ? styles.dropzoneActive : {}),
            }}
          >
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) {
                  // Validate file type for file selection
                  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
                  if (!allowedTypes.includes(selectedFile.type)) {
                    showToast("Only PDF, JPG, and PNG files are allowed", "error");
                    e.target.value = '';
                    return;
                  }
                  if (selectedFile.size > 5 * 1024 * 1024) {
                    showToast("File size must be less than 5MB", "error");
                    e.target.value = '';
                    return;
                  }
                  setFile(selectedFile);
                }
              }}
              style={styles.fileInput}
            />
            <div style={styles.dropzoneContent}>
              <div style={styles.dropzoneIcon}>📁</div>
              <p style={styles.dropzoneText}>
                {file ? "File selected" : "Drag and drop your file here"}
              </p>
              <p style={styles.dropzoneSubtext}>
                {file ? file.name : "or click to browse"}
              </p>
            </div>
          </div>

          {/* Selected File Preview */}
          {file && (
            <div style={styles.filePreview}>
              <div style={styles.filePreviewIcon}>{getFileIcon()}</div>
              <div style={styles.filePreviewInfo}>
                <div style={styles.filePreviewName}>{file.name}</div>
                <div style={styles.filePreviewDetails}>
                  {formatFileSize(file.size)} • {file.type || "Unknown type"}
                </div>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  const fileInput = document.getElementById('file-upload');
                  if (fileInput) fileInput.value = '';
                }}
                style={styles.removeFileBtn}
                className="remove-file-btn"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Remove
              </button>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={upload}
            disabled={!file || loading}
            style={!file || loading ? styles.uploadBtnDisabled : styles.uploadBtn}
          >
            {loading ? (
              <>
                <div style={styles.smallSpinner}></div>
                Uploading...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4V20M20 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Upload Report
              </>
            )}
          </button>
        </div>

        {/* Tips Section */}
        <div style={styles.tipsCard}>
          <div style={styles.tipsHeader}>
            <span style={styles.tipsIcon}>💡</span>
            <h3 style={styles.tipsTitle}>Tips for uploading reports</h3>
          </div>
          <ul style={styles.tipsList}>
            <li style={styles.tipItem}>Ensure the file is clear and readable</li>
            <li style={styles.tipItem}>Use descriptive file names for easy identification</li>
            <li style={styles.tipItem}>You can upload multiple reports one at a time</li>
            <li style={styles.tipItem}>Uploaded reports are securely stored and can be viewed by your doctor</li>
            <li style={styles.tipItem}>You can delete reports at any time from the "My Reports" page</li>
          </ul>
        </div>
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
        
        button:hover:not(:disabled), .view-reports-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .dropzone:hover {
          border-color: #1e6f5c;
          background-color: #e8f5e9;
        }
        
        .remove-file-btn:hover {
          background-color: #ffebee;
          transform: scale(1.05);
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
  viewReportsBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: "#ffffff",
    border: "1.5px solid #e2e8f0",
    borderRadius: "40px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#5e7a93",
    textDecoration: "none",
    transition: "all 0.2s ease",
  },
  uploadCard: {
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    padding: "48px",
    textAlign: "center",
    marginBottom: "24px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
    width: "100%",
    boxSizing: "border-box",
  },
  uploadIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  uploadTitle: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#1a2c3e",
    margin: "0 0 8px 0",
  },
  uploadDescription: {
    fontSize: "14px",
    color: "#5e7a93",
    margin: "0 0 24px 0",
  },
  requirements: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    marginBottom: "32px",
    flexWrap: "wrap",
  },
  requirementBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    backgroundColor: "#f5f7fa",
    borderRadius: "20px",
    fontSize: "12px",
    color: "#5e7a93",
  },
  dropzone: {
    border: "2px dashed #e2e8f0",
    borderRadius: "16px",
    padding: "40px",
    marginBottom: "24px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    position: "relative",
  },
  dropzoneActive: {
    borderColor: "#1e6f5c",
    backgroundColor: "#e8f5e9",
  },
  fileInput: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    opacity: 0,
    cursor: "pointer",
  },
  dropzoneContent: {
    pointerEvents: "none",
  },
  dropzoneIcon: {
    fontSize: "48px",
    marginBottom: "12px",
  },
  dropzoneText: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#1a2c3e",
    margin: "0 0 4px 0",
  },
  dropzoneSubtext: {
    fontSize: "13px",
    color: "#5e7a93",
    margin: 0,
  },
  filePreview: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    marginBottom: "24px",
  },
  filePreviewIcon: {
    fontSize: "32px",
  },
  filePreviewInfo: {
    flex: 1,
    textAlign: "left",
  },
  filePreviewName: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#1a2c3e",
    marginBottom: "4px",
  },
  filePreviewDetails: {
    fontSize: "12px",
    color: "#5e7a93",
  },
  removeFileBtn: {
    padding: "8px",
    backgroundColor: "transparent",
    border: "none",
    color: "#c62828",
    cursor: "pointer",
    borderRadius: "8px",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 32px",
    backgroundColor: "#1e6f5c",
    color: "#ffffff",
    border: "none",
    borderRadius: "40px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
  },
  uploadBtnDisabled: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 32px",
    backgroundColor: "#e2e8f0",
    color: "#9aaebf",
    border: "none",
    borderRadius: "40px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "not-allowed",
    fontFamily: "inherit",
  },
  smallSpinner: {
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderTopColor: "#ffffff",
    borderRadius: "50%",
    animation: "spin 0.6s linear infinite",
  },
  tipsCard: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
    width: "100%",
    boxSizing: "border-box",
  },
  tipsHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px",
  },
  tipsIcon: {
    fontSize: "20px",
  },
  tipsTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1a2c3e",
    margin: 0,
  },
  tipsList: {
    margin: 0,
    paddingLeft: "20px",
  },
  tipItem: {
    fontSize: "13px",
    color: "#5e7a93",
    marginBottom: "8px",
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
  
  button:hover:not(:disabled), .view-reports-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .dropzone:hover {
    border-color: #1e6f5c;
    background-color: #e8f5e9;
  }
  
  .remove-file-btn:hover {
    background-color: #ffebee;
    transform: scale(1.05);
  }
`;

if (typeof document !== "undefined") {
  document.head.appendChild(styleSheet);
}