import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API, authHeaders } from "../../api/client";

export default function PatientReports() {
  const [patientId, setPatientId] = useState("");
  const [profile, setProfile] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);

  const loadPatientData = async () => {
    if (!patientId.trim()) {
      alert("Please enter a patient ID");
      return;
    }

    try {
      setLoading(true);
      setSearchAttempted(true);
      const [profileRes, reportsRes] = await Promise.all([
        axios.get(`${API.doctor}/doctors/patient/${patientId}/profile`, {
          headers: authHeaders(),
        }),
        axios.get(`${API.doctor}/doctors/patient/${patientId}/reports`, {
          headers: authHeaders(),
        }),
      ]);

      setProfile(profileRes.data);
      setReports(reportsRes.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load patient data. Please check the patient ID and try again.");
      setProfile(null);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && patientId.trim()) {
      loadPatientData();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>D</div>
            <div>
              <div style={styles.userName}>Doctor Portal</div>
              <div style={styles.userRole}>Patient Reports</div>
            </div>
          </div>
        </div>
        
        <div style={styles.sidebarNav}>
          <Link to="/doctor/dashboard" style={styles.navItem}>
            <span style={styles.navIcon}>🏠</span>
            <span>Dashboard</span>
          </Link>
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
          <div style={styles.navItemActive}>
            <span style={styles.navIcon}>📊</span>
            <span>View Patient Reports</span>
          </div>
          <Link to="/doctor/prescriptions" style={styles.navItem}>
            <span style={styles.navIcon}>💊</span>
            <span>My Issued Prescriptions</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Patient Reports & Profile</h1>
            <p style={styles.subtitle}>Access and review patient medical records and reports</p>
          </div>
        </div>

        {/* Search Section */}
        <div style={styles.searchCard}>
          <h3 style={styles.sectionTitle}>Find Patient Records</h3>
          <div style={styles.searchContainer}>
            <div style={styles.searchInputWrapper}>
              <span style={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Enter patient ID to view medical records..."
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                onKeyPress={handleKeyPress}
                style={styles.searchInput}
                disabled={loading}
              />
            </div>
            <button 
              onClick={loadPatientData} 
              disabled={!patientId.trim() || loading} 
              style={styles.searchBtn}
            >
              {loading ? (
                <>
                  <div style={styles.smallSpinner}></div>
                  Loading...
                </>
              ) : (
                "Load Patient Data"
              )}
            </button>
          </div>
          <p style={styles.searchHint}>
            Enter the patient's unique ID to access their profile and medical reports
          </p>
        </div>

        {searchAttempted && !loading && !profile && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🔍</div>
            <p style={styles.emptyText}>No patient found</p>
            <p style={styles.emptySubtext}>
              Please check the patient ID and try again
            </p>
          </div>
        )}

        {profile && (
          <>
            {/* Patient Profile Section */}
            <div style={styles.profileCard}>
              <div style={styles.cardHeader}>
                <div style={styles.cardTitleWrapper}>
                  <span style={styles.cardIcon}>👤</span>
                  <h3 style={styles.cardTitle}>Patient Profile</h3>
                </div>
                <div style={styles.patientIdBadge}>
                  ID: {patientId}
                </div>
              </div>
              
              <div style={styles.profileGrid}>
                <div style={styles.profileItem}>
                  <span style={styles.profileLabel}>Date of Birth</span>
                  <span style={styles.profileValue}>{formatDate(profile.dateOfBirth)}</span>
                </div>
                <div style={styles.profileItem}>
                  <span style={styles.profileLabel}>Gender</span>
                  <span style={styles.profileValue}>{profile.gender || "-"}</span>
                </div>
                <div style={styles.profileItem}>
                  <span style={styles.profileLabel}>Phone</span>
                  <span style={styles.profileValue}>{profile.phone || "-"}</span>
                </div>
                <div style={styles.profileItem}>
                  <span style={styles.profileLabel}>Address</span>
                  <span style={styles.profileValue}>{profile.address || "-"}</span>
                </div>
              </div>

              <div style={styles.profileSection}>
                <div style={styles.sectionHeader}>
                  <span style={styles.sectionIcon}>📋</span>
                  <span style={styles.sectionTitle}>Medical History</span>
                </div>
                <div style={styles.sectionContent}>
                  {profile.medicalHistory || "No medical history recorded"}
                </div>
              </div>

              <div style={styles.profileGrid}>
                <div style={styles.profileFullItem}>
                  <span style={styles.profileLabel}>Allergies</span>
                  <div style={styles.tagContainer}>
                    {(profile.allergies && profile.allergies.length > 0) ? (
                      profile.allergies.map((allergy, idx) => (
                        <span key={idx} style={{...styles.tag, backgroundColor: "#ffebee", color: "#c62828"}}>
                          {allergy}
                        </span>
                      ))
                    ) : (
                      <span style={styles.profileValue}>No allergies recorded</span>
                    )}
                  </div>
                </div>
              </div>

              <div style={styles.profileGrid}>
                <div style={styles.profileFullItem}>
                  <span style={styles.profileLabel}>Chronic Conditions</span>
                  <div style={styles.tagContainer}>
                    {(profile.chronicConditions && profile.chronicConditions.length > 0) ? (
                      profile.chronicConditions.map((condition, idx) => (
                        <span key={idx} style={{...styles.tag, backgroundColor: "#fff3e0", color: "#ed6c02"}}>
                          {condition}
                        </span>
                      ))
                    ) : (
                      <span style={styles.profileValue}>No chronic conditions recorded</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Reports Section */}
            <div style={styles.reportsCard}>
              <div style={styles.cardHeader}>
                <div style={styles.cardTitleWrapper}>
                  <span style={styles.cardIcon}>📄</span>
                  <h3 style={styles.cardTitle}>Medical Reports</h3>
                </div>
                <div style={styles.reportCount}>
                  {reports.length} report(s)
                </div>
              </div>

              {reports.length === 0 ? (
                <div style={styles.noReportsState}>
                  <div style={styles.noReportsIcon}>📭</div>
                  <p style={styles.noReportsText}>No reports available</p>
                  <p style={styles.noReportsSubtext}>No medical reports have been uploaded for this patient</p>
                </div>
              ) : (
                <div style={styles.reportsList}>
                  {reports.map((r, index) => (
                    <div key={index} style={styles.reportItem}>
                      <div style={styles.reportIcon}>
                        {r.originalName?.toLowerCase().includes('.pdf') ? '📄' : 
                         r.originalName?.toLowerCase().includes('.jpg') || r.originalName?.toLowerCase().includes('.png') ? '🖼️' : '📎'}
                      </div>
                      <div style={styles.reportInfo}>
                        <div style={styles.reportName}>{r.originalName}</div>
                        <div style={styles.reportDate}>
                          Uploaded: {new Date(r.uploadedAt).toLocaleString()}
                        </div>
                      </div>
                      {r.downloadUrl && (
                        <a 
                          href={r.downloadUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          style={styles.reportLink}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M12 4v12m-4-4l4 4 4-4"/>
                          </svg>
                          Open
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    height: "100vh",  // ADDED: Forces full viewport height
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
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  userAvatar: {
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
  userName: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#1a2c3e",
  },
  userRole: {
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
  mainContent: {
    flex: 1,
    marginLeft: "280px",
    padding: "32px",
    width: "calc(100% - 280px)",
    minHeight: "100vh",
    height: "100%",  // ADDED: Takes full height
    overflowY: "auto",  // ADDED: Enables scrolling within content
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
  searchCard: {
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    padding: "32px",
    marginBottom: "32px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1a2c3e",
    marginBottom: "20px",
  },
  searchContainer: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  searchInputWrapper: {
    flex: 1,
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "16px",
    color: "#9aaebf",
  },
  searchInput: {
    width: "100%",
    padding: "12px 12px 12px 42px",
    fontSize: "14px",
    border: "1.5px solid #e2e8f0",
    borderRadius: "12px",
    fontFamily: "inherit",
    outline: "none",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
  },
  searchBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px 32px",
    backgroundColor: "#1e6f5c",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
  },
  searchHint: {
    marginTop: "12px",
    fontSize: "12px",
    color: "#5e7a93",
  },
  profileCard: {
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    padding: "32px",
    marginBottom: "32px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  },
  reportsCard: {
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    padding: "32px",
    marginBottom: "32px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "12px",
  },
  cardTitleWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  cardIcon: {
    fontSize: "24px",
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1a2c3e",
    margin: 0,
  },
  patientIdBadge: {
    padding: "6px 12px",
    backgroundColor: "#e8f5e9",
    color: "#1e6f5c",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  reportCount: {
    padding: "6px 12px",
    backgroundColor: "#f8fafc",
    color: "#5e7a93",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
  },
  profileGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "24px",
  },
  profileItem: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  profileFullItem: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "20px",
  },
  profileLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#5e7a93",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  profileValue: {
    fontSize: "15px",
    color: "#1a2c3e",
    fontWeight: "500",
  },
  profileSection: {
    marginBottom: "24px",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px",
  },
  sectionIcon: {
    fontSize: "16px",
  },
  /*sectionTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1a2c3e",
  },*/
  sectionContent: {
    backgroundColor: "#f8fafc",
    padding: "16px",
    borderRadius: "12px",
    fontSize: "14px",
    color: "#1a2c3e",
    lineHeight: "1.6",
  },
  tagContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  tag: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "500",
  },
  reportsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  reportItem: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    transition: "all 0.2s ease",
  },
  reportIcon: {
    fontSize: "24px",
  },
  reportInfo: {
    flex: 1,
  },
  reportName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1a2c3e",
    marginBottom: "4px",
  },
  reportDate: {
    fontSize: "12px",
    color: "#5e7a93",
  },
  reportLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    backgroundColor: "#e8f5e9",
    color: "#1e6f5c",
    textDecoration: "none",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "500",
    transition: "all 0.2s ease",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
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
  noReportsState: {
    textAlign: "center",
    padding: "48px 20px",
  },
  noReportsIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  noReportsText: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#1a2c3e",
    marginBottom: "8px",
  },
  noReportsSubtext: {
    fontSize: "13px",
    color: "#5e7a93",
  },
  smallSpinner: {
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderTopColor: "#ffffff",
    borderRadius: "50%",
    animation: "spin 0.6s linear infinite",
  },
};

// Add keyframes animation
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    input:focus {
      border-color: #1e6f5c !important;
      box-shadow: 0 0 0 3px rgba(30, 111, 92, 0.08) !important;
      outline: none;
    }
    
    button:hover:not(:disabled), .search-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .search-btn:hover:not(:disabled) {
      background-color: #155a4b;
      box-shadow: 0 4px 12px rgba(30, 111, 92, 0.3);
    }
    
    .report-link:hover {
      background-color: #c8e6c9;
      transform: translateX(2px);
    }
    
    .report-item:hover {
      transform: translateX(4px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
    
    .nav-item:hover {
      background-color: #f8fafc;
    }
    
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `;
  document.head.appendChild(styleSheet);
}