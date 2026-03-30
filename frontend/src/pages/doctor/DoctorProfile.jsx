import { useEffect, useState } from "react";
import axios from "axios";
import { API, authHeaders } from "../../api/client";
import { Link, useNavigate } from "react-router-dom";
import { clearSession, getName } from "../../api/auth";

export default function DoctorProfile() {
  const navigate = useNavigate();
  const [doctorData, setDoctorData] = useState({
    name: "",
    email: "",
    specialty: "",
    bio: "",
    licenseNumber: "",
    experience: "",
    consultationFee: "",
    rating: 0,
    totalPatients: 0,
    totalAppointments: 0,
  });
  const [form, setForm] = useState({
    specialty: "",
    bio: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [isEditing, setIsEditing] = useState(false);

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

  const load = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API.doctor}/doctors/me`, {
        headers: authHeaders(),
      });

      setDoctorData({
        name: res.data.name || getName() || "Doctor",
        email: res.data.email || "",
        specialty: res.data.specialty || "",
        bio: res.data.bio || "",
        licenseNumber: res.data.licenseNumber || "MED-LIC-2024-XXXX",
        experience: res.data.experience || "5+ years",
        consultationFee: res.data.consultationFee || "Rs 3150",
        rating: res.data.rating || 4.8,
        totalPatients: res.data.totalPatients || 0,
        totalAppointments: res.data.totalAppointments || 0,
      });

      setForm({
        specialty: res.data.specialty || "",
        bio: res.data.bio || "",
      });
    } catch (err) {
      console.error(err);
      showToast("Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const save = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      await axios.put(
        `${API.doctor}/doctors/me`,
        form,
        { headers: authHeaders() }
      );
      
      setDoctorData(prev => ({
        ...prev,
        specialty: form.specialty,
        bio: form.bio,
      }));
      
      showToast("Profile updated successfully!", "success");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
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
            <div style={styles.doctorInfo}>
              <div style={styles.doctorAvatar}>{getName()?.charAt(0) || "D"}</div>
              <div>
                <div style={styles.doctorName}>{getName() || "Dr. Smith"}</div>
                <div style={styles.doctorRole}>Doctor</div>
              </div>
            </div>
          </div>
          <div style={styles.sidebarNav}>
            <Link to="/doctor" style={styles.navItem}>
              <span style={styles.navIcon}>🏠</span>
              <span>Dashboard</span>
            </Link>
            <div style={styles.navItemActive}>
              <span style={styles.navIcon}>👤</span>
              <span>My Profile</span>
            </div>
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
        <div style={styles.mainContent}>
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading profile...</p>
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

      {/* Sidebar - Same as DoctorDashboard */}
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
            <div style={styles.doctorAvatar}>{doctorData.name?.charAt(0) || "D"}</div>
            <div>
              <div style={styles.doctorName}>{doctorData.name}</div>
              <div style={styles.doctorRole}>Doctor</div>
            </div>
          </div>
        </div>
        
        <div style={styles.sidebarNav}>
          <Link to="/doctor" style={styles.navItem}>
            <span style={styles.navIcon}>🏠</span>
            <span>Dashboard</span>
          </Link>
          <div style={styles.navItemActive}>
            <span style={styles.navIcon}>👤</span>
            <span>My Profile</span>
          </div>
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
            <h1 style={styles.title}>My Profile</h1>
            <p style={styles.subtitle}>View and manage your professional information</p>
          </div>
          <div style={styles.headerBadge}>
            <span style={styles.badgeIcon}>⚕️</span>
            <span style={styles.badgeText}>Verified Professional</span>
          </div>
        </div>

        {/* Profile Card - View Section */}
        <div style={styles.profileCard}>
          <div style={styles.profileHeader}>
            <div style={styles.profileAvatar}>
              {doctorData.name?.charAt(0) || "D"}
            </div>
            <div style={styles.profileInfo}>
              <h2 style={styles.profileName}>{doctorData.name}</h2>
              <p style={styles.profileEmail}>{doctorData.email}</p>
              <div style={styles.ratingContainer}>
                <span style={styles.starIcon}>⭐</span>
                <span style={styles.ratingValue}>{doctorData.rating}</span>
                <span style={styles.ratingLabel}>Rating</span>
              </div>
            </div>
            <div style={styles.statsContainer}>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>{doctorData.totalPatients}</div>
                <div style={styles.statText}>Total Patients</div>
              </div>
              <div style={styles.statDivider}></div>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>{doctorData.totalAppointments}</div>
                <div style={styles.statText}>Appointments</div>
              </div>
            </div>
          </div>

          <div style={styles.profileDetails}>
            <div style={styles.detailGrid}>
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>🏥 Specialty</div>
                <div style={styles.detailValue}>{doctorData.specialty || "Not specified"}</div>
              </div>
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>📜 License Number</div>
                <div style={styles.detailValue}>{doctorData.licenseNumber}</div>
              </div>
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>⏳ Experience</div>
                <div style={styles.detailValue}>{doctorData.experience}</div>
              </div>
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>💰 Consultation Fee</div>
                <div style={styles.detailValue}>{doctorData.consultationFee}</div>
              </div>
              <div style={styles.detailItemFull}>
                <div style={styles.detailLabel}>📝 Bio</div>
                <div style={styles.detailValue}>{doctorData.bio || "No bio provided yet"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Section - Form */}
        <div style={styles.editSection}>
          <div style={styles.editHeader}>
            <h3 style={styles.editTitle}>
              <span style={styles.editIcon}>✏️</span>
              Edit Profile Information
            </h3>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                style={styles.editButton}
              >
                Edit Profile
              </button>
            ) : (
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setForm({
                    specialty: doctorData.specialty,
                    bio: doctorData.bio,
                  });
                }}
                style={styles.cancelButton}
              >
                Cancel
              </button>
            )}
          </div>

          {isEditing && (
            <div style={styles.formContainer}>
              <form onSubmit={save} style={styles.form}>
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <span style={styles.labelIcon}>🏥</span>
                      Specialty
                    </label>
                    <input
                      type="text"
                      name="specialty"
                      value={form.specialty}
                      onChange={handleChange}
                      placeholder="e.g., Cardiologist, Dermatologist, Pediatrician"
                      style={styles.input}
                    />
                    <p style={styles.helperText}>Your primary medical specialty</p>
                  </div>

                  <div style={styles.formGroupFull}>
                    <label style={styles.label}>
                      <span style={styles.labelIcon}>📝</span>
                      Professional Bio
                    </label>
                    <textarea
                      name="bio"
                      value={form.bio}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Describe your professional background, experience, education, certifications, and areas of expertise..."
                      style={styles.textarea}
                    />
                    <p style={styles.helperText}>This information will be visible to patients</p>
                  </div>
                </div>

                <div style={styles.formActions}>
                  <button 
                    type="submit" 
                    disabled={saving}
                    style={saving ? styles.submitBtnDisabled : styles.submitBtn}
                  >
                    {saving ? (
                      <>
                        <div style={styles.smallSpinner}></div>
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
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
        
        input:focus, select:focus, textarea:focus {
          border-color: #1e6f5c !important;
          box-shadow: 0 0 0 3px rgba(30, 111, 92, 0.08) !important;
          outline: none;
        }
        
        button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        a:hover {
          background-color: #f8fafc;
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
    width: "calc(100% - 280px)",
    minHeight: "100vh",
    backgroundColor: "#f5f7fa",
    padding: "32px 48px",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
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
  headerBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#e8f5e9",
    padding: "8px 16px",
    borderRadius: "40px",
  },
  badgeIcon: {
    fontSize: "16px",
  },
  badgeText: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#1e6f5c",
  },
  profileCard: {
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    overflow: "hidden",
    marginBottom: "32px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  },
  profileHeader: {
    padding: "32px",
    background: "linear-gradient(135deg, #1e6f5c 0%, #0a3d32 100%)",
    display: "flex",
    alignItems: "center",
    gap: "24px",
    flexWrap: "wrap",
  },
  profileAvatar: {
    width: "100px",
    height: "100px",
    backgroundColor: "#ffffff",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "48px",
    fontWeight: "600",
    color: "#1e6f5c",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: "28px",
    fontWeight: "600",
    color: "#ffffff",
    margin: "0 0 8px 0",
  },
  profileEmail: {
    fontSize: "14px",
    color: "rgba(255, 255, 255, 0.9)",
    margin: "0 0 12px 0",
  },
  ratingContainer: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: "6px 12px",
    borderRadius: "20px",
    width: "fit-content",
  },
  starIcon: {
    fontSize: "14px",
  },
  ratingValue: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#ffffff",
  },
  ratingLabel: {
    fontSize: "12px",
    color: "rgba(255, 255, 255, 0.8)",
  },
  statsContainer: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: "16px 24px",
    borderRadius: "16px",
  },
  statItem: {
    textAlign: "center",
  },
  statNumber: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#ffffff",
  },
  statText: {
    fontSize: "12px",
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: "4px",
  },
  statDivider: {
    width: "1px",
    height: "30px",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  profileDetails: {
    padding: "32px",
  },
  detailGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "24px",
  },
  detailItem: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  detailItemFull: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    gridColumn: "span 2",
  },
  detailLabel: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#5e7a93",
    letterSpacing: "0.3px",
  },
  detailValue: {
    fontSize: "15px",
    fontWeight: "500",
    color: "#1a2c3e",
  },
  editSection: {
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  },
  editHeader: {
    padding: "24px 32px",
    borderBottom: "1px solid #eef2f6",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  editTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1a2c3e",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  editIcon: {
    fontSize: "20px",
  },
  editButton: {
    padding: "10px 24px",
    backgroundColor: "#1e6f5c",
    color: "#ffffff",
    border: "none",
    borderRadius: "40px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.2s ease",
  },
  cancelButton: {
    padding: "10px 24px",
    backgroundColor: "#f1f3f5",
    color: "#5e7a93",
    border: "none",
    borderRadius: "40px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.2s ease",
  },
  formContainer: {
    padding: "32px",
  },
  form: {
    width: "100%",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "24px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  formGroupFull: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    gridColumn: "span 2",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#1a2c3e",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  labelIcon: {
    fontSize: "16px",
  },
  input: {
    padding: "12px 16px",
    fontSize: "14px",
    border: "1.5px solid #e2e8f0",
    borderRadius: "12px",
    fontFamily: "inherit",
    outline: "none",
    transition: "all 0.2s ease",
    backgroundColor: "#ffffff",
  },
  textarea: {
    padding: "12px 16px",
    fontSize: "14px",
    border: "1.5px solid #e2e8f0",
    borderRadius: "12px",
    fontFamily: "inherit",
    outline: "none",
    transition: "all 0.2s ease",
    resize: "vertical",
    backgroundColor: "#ffffff",
  },
  helperText: {
    fontSize: "12px",
    color: "#5e7a93",
    margin: "4px 0 0 0",
  },
  formActions: {
    marginTop: "32px",
    display: "flex",
    justifyContent: "flex-end",
  },
  submitBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 28px",
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
  submitBtnDisabled: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 28px",
    backgroundColor: "#e2e8f0",
    color: "#9aaebf",
    border: "none",
    borderRadius: "40px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "not-allowed",
    fontFamily: "inherit",
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
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderTopColor: "#ffffff",
    borderRadius: "50%",
    animation: "spin 0.6s linear infinite",
  },
  loadingText: {
    marginTop: "16px",
    color: "#5e7a93",
    fontSize: "14px",
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
  
  input:focus, select:focus, textarea:focus {
    border-color: #1e6f5c !important;
    box-shadow: 0 0 0 3px rgba(30, 111, 92, 0.08) !important;
    outline: none;
  }
  
  button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  a:hover {
    background-color: #f8fafc;
  }
`;

if (typeof document !== "undefined") {
  document.head.appendChild(styleSheet);
}