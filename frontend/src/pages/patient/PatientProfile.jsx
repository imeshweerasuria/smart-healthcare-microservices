import { useEffect, useState } from "react";
import axios from "axios";
import { API, authHeaders } from "../../api/client";
import { Link, useNavigate } from "react-router-dom";
import { clearSession, getName } from "../../api/auth";

export default function PatientProfile() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    address: "",
    medicalHistory: "",
    allergies: "",
    chronicConditions: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const patientName = getName();

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
      const res = await axios.get(`${API.patient}/patients/me`, {
        headers: authHeaders(),
      });

      console.log("Loaded patient data:", res.data);

      setForm({
        fullName: patientName || "",
        dateOfBirth: res.data.dateOfBirth || "",
        gender: res.data.gender || "",
        phone: res.data.phone || "",
        address: res.data.address || "",
        medicalHistory: res.data.medicalHistory || "",
        allergies: Array.isArray(res.data.allergies) ? res.data.allergies.join(", ") : (res.data.allergies || ""),
        chronicConditions: Array.isArray(res.data.chronicConditions)
          ? res.data.chronicConditions.join(", ")
          : (res.data.chronicConditions || ""),
      });
    } catch (err) {
      console.error("Error loading profile:", err);
      showToast("Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Changing ${name} to:`, value);
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const save = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const profileData = {
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        phone: form.phone,
        address: form.address,
        medicalHistory: form.medicalHistory,
        allergies: form.allergies
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        chronicConditions: form.chronicConditions
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
      };
      
      await axios.put(
        `${API.patient}/patients/me`,
        profileData,
        { headers: authHeaders() }
      );

      showToast("Profile updated successfully!", "success");
    } catch (err) {
      console.error("Error saving profile:", err);
      showToast(err.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const navItems = [
    { path: "/patient", label: "Dashboard", icon: "📊", active: false },
    { path: "/patient/home", label: "Home", icon: "🏠", active: false },
    { path: "/patient/profile", label: "My Profile", icon: "👤", active: true },
    { path: "/patient/medical-record", label: "My Medical Record", icon: "📋", active: false },
    { path: "/patient/doctors", label: "Browse Doctors", icon: "👨‍⚕️", active: false },
    { path: "/patient/appointments", label: "My Appointments", icon: "📅", active: false },
    { path: "/patient/upload", label: "Upload Medical Reports", icon: "📤", active: false },
    { path: "/patient/reports", label: "My Reports", icon: "📊", active: false },
    { path: "/patient/prescriptions", label: "My Prescriptions", icon: "💊", active: false },
    { path: "/patient/payments", label: "My Payments", icon: "💰", active: false },
  ];

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
              <div style={styles.adminAvatar}>{patientName?.charAt(0) || "P"}</div>
              <div>
                <div style={styles.adminName}>{patientName || "Patient"}</div>
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
            <div style={styles.adminAvatar}>{patientName?.charAt(0) || "P"}</div>
            <div>
              <div style={styles.adminName}>{patientName || "Patient"}</div>
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

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>My Profile</h1>
            <p style={styles.subtitle}>Manage your personal information and medical details</p>
          </div>
        </div>

        {/* Profile Form */}
        <div style={styles.formContainer}>
          <form onSubmit={save} style={styles.form}>
            <div style={styles.formGrid}>
              {/* Patient Name - Non-editable field */}
              <div style={styles.formGroupFull}>
                <div style={styles.nameCard}>
                  <div style={styles.nameIcon}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div style={styles.nameInfo}>
                    <span style={styles.nameLabel}>Full Name</span>
                    <span style={styles.nameValue}>{form.fullName || patientName || "Not specified"}</span>
                    <span style={styles.nameHint}>This field cannot be edited. Contact support for name changes.</span>
                  </div>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Gender</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Address</label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroupFull}>
                <label style={styles.label}>Medical History</label>
                <textarea
                  name="medicalHistory"
                  value={form.medicalHistory}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe your medical history"
                  style={styles.textarea}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Allergies</label>
                <input
                  type="text"
                  name="allergies"
                  value={form.allergies}
                  onChange={handleChange}
                  placeholder="e.g., Penicillin, Peanuts, Pollen"
                  style={styles.input}
                />
                <p style={styles.helperText}>Separate multiple allergies with commas</p>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Chronic Conditions</label>
                <input
                  type="text"
                  name="chronicConditions"
                  value={form.chronicConditions}
                  onChange={handleChange}
                  placeholder="e.g., Diabetes, Hypertension, Asthma"
                  style={styles.input}
                />
                <p style={styles.helperText}>Separate multiple conditions with commas</p>
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
                    Saving...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </form>
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
        
        input, select, textarea {
          font-size: 14px !important;
          color: #1a2c3e !important;
          background-color: #ffffff !important;
        }
        
        input::placeholder, textarea::placeholder {
          color: #9aaebf !important;
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
  formContainer: {
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    padding: "32px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
    width: "100%",
    boxSizing: "border-box",
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
  nameCard: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    padding: "24px",
    backgroundColor: "#f8fafc",
    borderRadius: "16px",
    border: "1px solid #eef2f6",
    marginBottom: "8px",
  },
  nameIcon: {
    width: "56px",
    height: "56px",
    backgroundColor: "#e8f5e9",
    borderRadius: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#1e6f5c",
  },
  nameInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  nameLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#5e7a93",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  nameValue: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1a2c3e",
  },
  nameHint: {
    fontSize: "12px",
    color: "#9aaebf",
    marginTop: "4px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#1a2c3e",
  },
  input: {
    padding: "12px 16px",
    fontSize: "14px",
    color: "#1a2c3e",
    border: "1.5px solid #e2e8f0",
    borderRadius: "12px",
    fontFamily: "inherit",
    outline: "none",
    transition: "all 0.2s ease",
    backgroundColor: "#ffffff",
  },
  select: {
    padding: "12px 16px",
    fontSize: "14px",
    color: "#1a2c3e",
    border: "1.5px solid #e2e8f0",
    borderRadius: "12px",
    fontFamily: "inherit",
    outline: "none",
    transition: "all 0.2s ease",
    backgroundColor: "#ffffff",
    cursor: "pointer",
  },
  textarea: {
    padding: "12px 16px",
    fontSize: "14px",
    color: "#1a2c3e",
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
  
  input, select, textarea {
    font-size: 14px !important;
    color: #1a2c3e !important;
    background-color: #ffffff !important;
  }
  
  input::placeholder, textarea::placeholder {
    color: #9aaebf !important;
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