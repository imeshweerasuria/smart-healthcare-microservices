import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API, authHeaders } from "../../api/client";

export default function IssuePrescription() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [meds, setMeds] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!meds.trim()) {
      alert("Please enter medication details");
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(
        `${API.doctor}/prescriptions`,
        { patientId, meds, notes },
        { headers: authHeaders() }
      );
      alert("Prescription issued successfully");
      setMeds("");
      setNotes("");
      // Optional: Navigate back to appointments or prescriptions list
      // navigate("/doctor/prescriptions");
    } catch (err) {
      console.error(err);
      alert("Failed to issue prescription. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (meds || notes) {
      if (window.confirm("Are you sure? Any unsaved changes will be lost.")) {
        navigate(-1);
      }
    } else {
      navigate(-1);
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
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>D</div>
            <div>
              <div style={styles.userName}>Doctor Portal</div>
              <div style={styles.userRole}>Issue Prescription</div>
            </div>
          </div>
        </div>
        
        <div style={styles.sidebarNav}>
          <Link to="/doctor" style={styles.navItem}>
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
          <Link to="/doctor/patient-reports" style={styles.navItem}>
            <span style={styles.navIcon}>📊</span>
            <span>View Patient Reports</span>
          </Link>
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
            <h1 style={styles.title}>Issue Prescription</h1>
            <p style={styles.subtitle}>Create a new prescription for your patient</p>
          </div>
        </div>

        {/* Patient Info Card */}
        <div style={styles.infoCard}>
          <div style={styles.infoHeader}>
            <span style={styles.infoIcon}>👤</span>
            <span style={styles.infoTitle}>Patient Information</span>
          </div>
          <div style={styles.patientIdContainer}>
            <span style={styles.patientIdLabel}>Patient ID:</span>
            <code style={styles.patientIdCode}>{patientId}</code>
          </div>
          <p style={styles.infoHint}>
            This prescription will be linked to this patient's medical record
          </p>
        </div>

        {/* Prescription Form */}
        <div style={styles.formCard}>
          <h3 style={styles.sectionTitle}>Prescription Details</h3>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Medications <span style={styles.required}>*</span>
            </label>
            <textarea
              value={meds}
              onChange={(e) => setMeds(e.target.value)}
              placeholder="Enter medications with dosage, frequency, and duration...
              
Example:
- Paracetamol 500mg, twice daily for 5 days
- Amoxicillin 250mg, three times daily for 7 days
- Vitamin C 1000mg, once daily"
              rows={6}
              style={styles.textarea}
              disabled={submitting}
            />
            <div style={styles.charCount}>
              {meds.length} characters
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Additional Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any additional instructions, precautions, or follow-up notes...
              
Example:
- Take medication with food
- Avoid alcohol during treatment
- Schedule follow-up in 1 week"
              rows={4}
              style={styles.textarea}
              disabled={submitting}
            />
            <div style={styles.charCount}>
              {notes.length} characters
            </div>
          </div>

          {/* Prescription Preview */}
          {(meds || notes) && (
            <div style={styles.previewCard}>
              <div style={styles.previewHeader}>
                <span style={styles.previewIcon}>📄</span>
                <span style={styles.previewTitle}>Prescription Preview</span>
              </div>
              {meds && (
                <div style={styles.previewSection}>
                  <div style={styles.previewLabel}>Medications:</div>
                  <div style={styles.previewContent}>{meds}</div>
                </div>
              )}
              {notes && (
                <div style={styles.previewSection}>
                  <div style={styles.previewLabel}>Notes:</div>
                  <div style={styles.previewContent}>{notes}</div>
                </div>
              )}
            </div>
          )}

          <div style={styles.formActions}>
            <button 
              onClick={submit} 
              style={styles.submitBtn}
              disabled={!meds.trim() || submitting}
            >
              {submitting ? (
                <>
                  <div style={styles.smallSpinner}></div>
                  Issuing Prescription...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 12V8H4V12M12 4V20M8 16L12 20L16 16"/>
                  </svg>
                  Issue Prescription
                </>
              )}
            </button>
            <button 
              onClick={handleCancel} 
              style={styles.cancelBtn}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Tips Card */}
        <div style={styles.tipsCard}>
          <div style={styles.tipsHeader}>
            <span style={styles.tipsIcon}>💊</span>
            <span style={styles.tipsTitle}>Prescription Guidelines</span>
          </div>
          <ul style={styles.tipsList}>
            <li>Include clear dosage instructions (e.g., "500mg twice daily")</li>
            <li>Specify duration of treatment (e.g., "for 5 days")</li>
            <li>Note any potential side effects or precautions</li>
            <li>Include instructions for taking medication (with/without food)</li>
            <li>Add follow-up recommendations if needed</li>
            <li>Always include your contact information for emergencies</li>
          </ul>
        </div>

        {/* Back Navigation */}
        <div style={styles.backNav}>
          <Link to="/doctor/appointments" style={styles.backLink}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Appointments
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
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "24px",
    marginBottom: "24px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  },
  infoHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "16px",
  },
  infoIcon: {
    fontSize: "20px",
  },
  infoTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1a2c3e",
  },
  patientIdContainer: {
    backgroundColor: "#f8fafc",
    padding: "12px 16px",
    borderRadius: "12px",
    marginBottom: "12px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  patientIdLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#5e7a93",
  },
  patientIdCode: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#1e6f5c",
    backgroundColor: "#e8f5e9",
    padding: "4px 12px",
    borderRadius: "20px",
    fontFamily: "monospace",
  },
  infoHint: {
    fontSize: "12px",
    color: "#5e7a93",
    margin: 0,
  },
  formCard: {
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
    marginBottom: "24px",
  },
  formGroup: {
    marginBottom: "24px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#1a2c3e",
    marginBottom: "8px",
  },
  required: {
    color: "#c62828",
  },
  textarea: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "14px",
    border: "1.5px solid #e2e8f0",
    borderRadius: "12px",
    fontFamily: "inherit",
    outline: "none",
    transition: "all 0.2s ease",
    resize: "vertical",
  },
  charCount: {
    marginTop: "6px",
    fontSize: "11px",
    color: "#5e7a93",
    textAlign: "right",
  },
  previewCard: {
    backgroundColor: "#f8fafc",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "24px",
    border: "1px solid #eef2f6",
  },
  previewHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "16px",
    paddingBottom: "12px",
    borderBottom: "1px solid #eef2f6",
  },
  previewIcon: {
    fontSize: "18px",
  },
  previewTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1a2c3e",
  },
  previewSection: {
    marginBottom: "16px",
  },
  previewLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#5e7a93",
    marginBottom: "8px",
  },
  previewContent: {
    fontSize: "13px",
    color: "#1a2c3e",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
    fontFamily: "monospace",
    backgroundColor: "#ffffff",
    padding: "12px",
    borderRadius: "8px",
  },
  formActions: {
    display: "flex",
    gap: "12px",
    marginTop: "24px",
  },
  submitBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
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
    minWidth: "180px",
  },
  cancelBtn: {
    padding: "12px 32px",
    backgroundColor: "#ffffff",
    color: "#5e7a93",
    border: "1.5px solid #e2e8f0",
    borderRadius: "40px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
  },
  tipsCard: {
    backgroundColor: "#f8fafc",
    borderRadius: "20px",
    padding: "20px",
    marginBottom: "24px",
    border: "1px solid #eef2f6",
  },
  tipsHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px",
  },
  tipsIcon: {
    fontSize: "20px",
  },
  tipsTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1a2c3e",
  },
  tipsList: {
    margin: 0,
    paddingLeft: "20px",
    color: "#5e7a93",
    fontSize: "13px",
    lineHeight: "1.6",
  },
  backNav: {
    textAlign: "center",
  },
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    color: "#1e6f5c",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s ease",
    borderRadius: "40px",
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
    
    textarea:focus {
      border-color: #1e6f5c !important;
      box-shadow: 0 0 0 3px rgba(30, 111, 92, 0.08) !important;
      outline: none;
    }
    
    button:hover:not(:disabled), .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .submit-btn:hover:not(:disabled) {
      background-color: #155a4b;
      box-shadow: 0 4px 12px rgba(30, 111, 92, 0.3);
    }
    
    .cancel-btn:hover:not(:disabled) {
      background-color: #f8fafc;
      border-color: #cbd5e1;
    }
    
    .back-link:hover {
      background-color: #e8f5e9;
      transform: translateX(-4px);
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