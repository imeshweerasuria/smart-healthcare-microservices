import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { API, authHeaders } from "../../api/client";

export default function DoctorAvailability() {
  const [availability, setAvailability] = useState([]);
  const [day, setDay] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API.doctor}/doctors/me`, {
        headers: authHeaders(),
      });
      setAvailability(res.data.availability || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load availability");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addSlot = () => {
    if (!day || !from || !to) return alert("Please fill in all fields");
    
    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(from) || !timeRegex.test(to)) {
      return alert("Please enter time in HH:MM format (e.g., 09:00)");
    }
    
    // Validate that from time is before to time
    if (from >= to) {
      return alert("Start time must be before end time");
    }
    
    setAvailability((prev) => [...prev, { day, from, to }]);
    setDay("");
    setFrom("");
    setTo("");
  };

  const removeSlot = (index) => {
    setAvailability((prev) => prev.filter((_, i) => i !== index));
  };

  const save = async () => {
    try {
      setSaving(true);
      await axios.put(
        `${API.doctor}/doctors/me/availability`,
        { availability },
        { headers: authHeaders() }
      );
      alert("Availability updated successfully");
      load(); // Reload to confirm save
    } catch (err) {
      console.error(err);
      alert("Failed to save availability");
    } finally {
      setSaving(false);
    }
  };

  const getDayColor = (day) => {
    const days = {
      "MON": "#e3f2fd",
      "TUE": "#e3f2fd",
      "WED": "#e3f2fd",
      "THU": "#e3f2fd",
      "FRI": "#e3f2fd",
      "SAT": "#fff3e0",
      "SUN": "#ffebee",
    };
    return days[day] || "#f5f5f5";
  };

  const daysOfWeek = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

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
              <div style={styles.userRole}>Availability</div>
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
          <div style={styles.navItemActive}>
            <span style={styles.navIcon}>📅</span>
            <span>My Availability</span>
          </div>
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
            <h1 style={styles.title}>My Availability</h1>
            <p style={styles.subtitle}>Set your working hours for patient appointments</p>
          </div>
          <div style={styles.headerActions}>
            <button onClick={load} style={styles.refreshBtn} disabled={loading}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 12C1 12 4 4 12 4C20 4 23 12 23 12C23 12 20 20 12 20C4 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Add Availability Form */}
        <div style={styles.formCard}>
          <h3 style={styles.sectionTitle}>Add New Availability Slot</h3>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Day of Week</label>
              <select 
                value={day} 
                onChange={(e) => setDay(e.target.value)} 
                style={styles.select}
              >
                <option value="">Select day</option>
                {daysOfWeek.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Start Time</label>
              <input 
                type="time"
                placeholder="09:00" 
                value={from} 
                onChange={(e) => setFrom(e.target.value)} 
                style={styles.input}
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>End Time</label>
              <input 
                type="time"
                placeholder="17:00" 
                value={to} 
                onChange={(e) => setTo(e.target.value)} 
                style={styles.input}
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>&nbsp;</label>
              <button onClick={addSlot} style={styles.addBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 4v16M4 12h16"/>
                </svg>
                Add Slot
              </button>
            </div>
          </div>
        </div>

        {/* Current Availability List */}
        <div style={styles.availabilityCard}>
          <div style={styles.cardHeader}>
            <h3 style={styles.sectionTitle}>Current Availability</h3>
            <span style={styles.slotCount}>{availability.length} slot(s)</span>
          </div>
          
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p style={styles.loadingText}>Loading availability...</p>
            </div>
          ) : availability.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📅</div>
              <p style={styles.emptyText}>No availability slots yet</p>
              <p style={styles.emptySubtext}>Add your working hours using the form above</p>
            </div>
          ) : (
            <div style={styles.slotsGrid}>
              {availability.map((slot, index) => {
                const dayColor = getDayColor(slot.day);
                return (
                  <div key={index} style={styles.slotCard}>
                    <div style={{...styles.slotDay, backgroundColor: dayColor}}>
                      {slot.day}
                    </div>
                    <div style={styles.slotTime}>
                      <span style={styles.timeIcon}>⏰</span>
                      <span>{slot.from} - {slot.to}</span>
                    </div>
                    <button 
                      onClick={() => removeSlot(index)} 
                      style={styles.removeBtn}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Save Button */}
        <div style={styles.saveSection}>
          <button 
            onClick={save} 
            style={styles.saveBtn}
            disabled={saving || availability.length === 0}
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
                Save Availability
              </>
            )}
          </button>
          <p style={styles.saveHint}>
            Don't forget to save your changes. Patient appointments will be based on these availability slots.
          </p>
        </div>

        {/* Tips Section */}
        <div style={styles.tipsCard}>
          <div style={styles.tipsHeader}>
            <span style={styles.tipsIcon}>💡</span>
            <span style={styles.tipsTitle}>Pro Tips</span>
          </div>
          <ul style={styles.tipsList}>
            <li>Set consistent availability to help patients book appointments easily</li>
            <li>Consider adding buffer time between appointments for breaks</li>
            <li>Update your availability at least 24 hours in advance</li>
            <li>You can add multiple slots for different days or time ranges</li>
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
  headerActions: {
    display: "flex",
    gap: "12px",
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
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    padding: "24px",
    marginBottom: "32px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1a2c3e",
    marginBottom: "20px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    alignItems: "end",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#5e7a93",
  },
  input: {
    padding: "12px 16px",
    fontSize: "14px",
    border: "1.5px solid #e2e8f0",
    borderRadius: "12px",
    fontFamily: "inherit",
    outline: "none",
    transition: "all 0.2s ease",
  },
  select: {
    padding: "12px 16px",
    fontSize: "14px",
    border: "1.5px solid #e2e8f0",
    borderRadius: "12px",
    fontFamily: "inherit",
    outline: "none",
    transition: "all 0.2s ease",
    backgroundColor: "#ffffff",
    cursor: "pointer",
  },
  addBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px 24px",
    backgroundColor: "#e8f5e9",
    color: "#1e6f5c",
    border: "none",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
  },
  availabilityCard: {
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    padding: "24px",
    marginBottom: "32px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  slotCount: {
    fontSize: "13px",
    color: "#5e7a93",
    backgroundColor: "#f8fafc",
    padding: "4px 12px",
    borderRadius: "20px",
  },
  slotsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "16px",
  },
  slotCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px",
    backgroundColor: "#fafcfd",
    borderRadius: "16px",
    border: "1px solid #eef2f6",
    transition: "all 0.2s ease",
  },
  slotDay: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#1a2c3e",
  },
  slotTime: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "14px",
    color: "#1a2c3e",
    fontWeight: "500",
  },
  timeIcon: {
    fontSize: "14px",
  },
  removeBtn: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "6px 12px",
    backgroundColor: "#ffebee",
    color: "#c62828",
    border: "none",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
  },
  saveSection: {
    textAlign: "center",
    marginBottom: "32px",
  },
  saveBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "14px 32px",
    backgroundColor: "#1e6f5c",
    color: "#ffffff",
    border: "none",
    borderRadius: "40px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
    minWidth: "200px",
  },
  saveHint: {
    marginTop: "12px",
    fontSize: "12px",
    color: "#5e7a93",
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
    padding: "60px 20px",
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
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
  },
  emptyIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  emptyText: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#1a2c3e",
    marginBottom: "8px",
  },
  emptySubtext: {
    fontSize: "13px",
    color: "#5e7a93",
  },
};

// Add keyframes animation
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    input:focus, select:focus {
      border-color: #1e6f5c !important;
      box-shadow: 0 0 0 3px rgba(30, 111, 92, 0.08) !important;
      outline: none;
    }
    
    button:hover:not(:disabled), .refresh-btn:hover, .add-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .save-btn:hover:not(:disabled) {
      background-color: #155a4b;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(30, 111, 92, 0.3);
    }
    
    .remove-btn:hover {
      background-color: #ffcdd2;
      transform: translateY(-1px);
    }
    
    .slot-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
    
    .nav-item:hover {
      background-color: #f8fafc;
    }
  `;
  document.head.appendChild(styleSheet);
}