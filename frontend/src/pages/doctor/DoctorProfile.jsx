import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { API, authHeaders } from "../../api/client";
import { clearSession} from "../../api/auth";

export default function DoctorProfile() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    specialty: "",
    bio: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState({
    name: "",
    email: "",
    doctorVerified: false,
  });

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

      setForm({
        specialty: res.data.specialty || "",
        bio: res.data.bio || "",
      });
      
      setDoctorInfo({
        name: res.data.name || "",
        email: res.data.email || "",
        doctorVerified: res.data.doctorVerified || false,
      });
    } catch (err) {
      console.error(err);
      alert("Failed to load doctor profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    
    if (!form.specialty.trim()) {
      alert("Please enter your specialty");
      return;
    }

    try {
      setSaving(true);
      await axios.put(
        `${API.doctor}/doctors/me`,
        form,
        { headers: authHeaders() }
      );
      alert("Profile updated successfully");
      load(); // Reload to refresh data
    } catch (err) {
      console.error(err);
      alert("Update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const specialties = [
    "Cardiology",
    "Dermatology",
    "Neurology",
    "Pediatrics",
    "Psychiatry",
    "Orthopedics",
    "Ophthalmology",
    "Gynecology",
    "Urology",
    "General Medicine",
    "Family Medicine",
    "Emergency Medicine",
    "Radiology",
    "Anesthesiology",
    "Surgery",
  ];

  // Add any custom specialty if it exists but not in the list (so selected value is visible)
  const allSpecialties = form.specialty && !specialties.includes(form.specialty)
    ? [form.specialty, ...specialties]
    : specialties;

  const navItems = [
    { path: "/doctor", label: "Dashboard", icon: "🏠" },
    { path: "/doctor/profile", label: "My Profile", icon: "👤", active: true },
    { path: "/doctor/availability", label: "My Availability", icon: "📅" },
    { path: "/doctor/appointments", label: "Appointment Requests", icon: "📋" },
    { path: "/doctor/patient-reports", label: "View Patient Reports", icon: "📊" },
    { path: "/doctor/prescriptions", label: "My Issued Prescriptions", icon: "💊" },
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
            <div style={styles.userInfo}>
              <div style={styles.userAvatar}>{doctorInfo.name?.charAt(0) || "D"}</div>
              <div>
                <div style={styles.userName}>{doctorInfo.name || "Doctor"}</div>
                <div style={styles.userRole}>Loading...</div>
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
            <div style={styles.userAvatar}>{doctorInfo.name?.charAt(0) || "D"}</div>
            <div>
              <div style={styles.userName}>{doctorInfo.name || "Doctor"}</div>
              <div style={styles.userRole}>
                {doctorInfo.doctorVerified ? "✓ Verified" : "⏳ Pending Verification"}
              </div>
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
            <p style={styles.subtitle}>Manage your professional information and credentials</p>
          </div>
        </div>

        {/* Profile Overview Card */}
        <div style={styles.overviewCard}>
          <div style={styles.overviewHeader}>
            <div style={styles.profileAvatar}>
              {doctorInfo.name?.charAt(0) || "D"}
            </div>
            <div style={styles.profileInfo}>
              <h2 style={styles.profileName}>{doctorInfo.name || "Doctor"}</h2>
              <p style={styles.profileEmail}>{doctorInfo.email}</p>
              <div style={styles.verificationBadge}>
                {doctorInfo.doctorVerified ? (
                  <>
                    <span style={styles.verifiedIcon}>✓</span>
                    <span style={styles.verifiedText}>Verified Doctor</span>
                  </>
                ) : (
                  <>
                    <span style={styles.pendingIcon}>⏳</span>
                    <span style={styles.pendingText}>Pending Verification</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        <div style={styles.formCard}>
          <h3 style={styles.sectionTitle}>Professional Information</h3>
          <form onSubmit={save} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Specialty <span style={styles.required}>*</span>
              </label>
              <select
                value={form.specialty}
                onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                style={styles.select}
                required
              >
                <option value="">Select your specialty</option>
                {allSpecialties.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
              <p style={styles.hintText}>
                Choose your primary medical specialty
              </p>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Bio / Professional Summary</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={6}
                style={styles.textarea}
                placeholder="Tell patients about your experience, approach to care, and areas of expertise..."
              />
              <p style={styles.hintText}>
                {form.bio.length}/500 characters
              </p>
            </div>

            <div style={styles.formActions}>
              <button 
                type="submit" 
                style={styles.saveBtn}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div style={styles.smallSpinner}></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 12V8H4V12M12 4V20M8 16L12 20L16 16"/>
                    </svg>
                    Save Profile
                  </>
                )}
              </button>
              <button 
                type="button" 
                onClick={load} 
                style={styles.cancelBtn}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Tips Card */}
        <div style={styles.tipsCard}>
          <div style={styles.tipsHeader}>
            <span style={styles.tipsIcon}>💡</span>
            <span style={styles.tipsTitle}>Profile Tips</span>
          </div>
          <ul style={styles.tipsList}>
            <li>Add your specialty to help patients find you more easily</li>
            <li>A detailed bio builds trust with potential patients</li>
            <li>Include your years of experience and areas of expertise</li>
            <li>Update your profile regularly to reflect any new certifications</li>
            <li>Your profile will be verified by the admin before going live</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    height: "100vh",
    width: "100%",
    background: "#f5f7fa",
    fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    overflow: "hidden",
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
  },
  mainContent: {
    flex: 1,
    marginLeft: "280px",
    padding: "32px",
    width: "calc(100% - 280px)",
    minHeight: "100vh",
    height: "100%",
    overflowY: "auto",
  },
  header: {
    marginBottom: "32px",
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
  overviewCard: {
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    padding: "32px",
    marginBottom: "32px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  },
  overviewHeader: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
    flexWrap: "wrap",
  },
  profileAvatar: {
    width: "96px",
    height: "96px",
    backgroundColor: "#e8f5e9",
    borderRadius: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "40px",
    fontWeight: "600",
    color: "#1e6f5c",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#1a2c3e",
    margin: "0 0 8px 0",
  },
  profileEmail: {
    fontSize: "14px",
    color: "#5e7a93",
    margin: "0 0 12px 0",
  },
  verificationBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "500",
  },
  verifiedIcon: {
    color: "#2e7d32",
    fontSize: "14px",
  },
  verifiedText: {
    color: "#2e7d32",
  },
  pendingIcon: {
    color: "#ed6c02",
    fontSize: "14px",
  },
  pendingText: {
    color: "#ed6c02",
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
  form: {
    maxWidth: "100%",
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
  select: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "14px",
    border: "1.5px solid #e2e8f0",
    borderRadius: "12px",
    fontFamily: "inherit",
    outline: "none",
    transition: "all 0.2s ease",
    backgroundColor: "#ffffff",
    cursor: "pointer",
    color: "#1a2c3e",
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
  hintText: {
    marginTop: "6px",
    fontSize: "12px",
    color: "#5e7a93",
  },
  formActions: {
    display: "flex",
    gap: "12px",
    marginTop: "32px",
  },
  saveBtn: {
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
    minWidth: "140px",
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

// Add keyframes animation and option styling
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    input:focus, select:focus, textarea:focus {
      border-color: #1e6f5c !important;
      box-shadow: 0 0 0 3px rgba(30, 111, 92, 0.08) !important;
      outline: none;
    }
    
    button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .nav-item:hover {
      background-color: #f8fafc;
      transform: translateX(4px);
    }
    
    .logout-btn:hover {
      background-color: #fee;
      transform: translateX(4px);
    }
    
    /* Ensure select options are always visible */
    select, option {
      color: #1a2c3e;
      background-color: #ffffff;
    }
  `;
  document.head.appendChild(styleSheet);
}