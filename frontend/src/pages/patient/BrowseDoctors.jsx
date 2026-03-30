import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../../api/client";
import { clearSession, getName } from "../../api/auth";

export default function BrowseDoctors() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [specialty, setSpecialty] = useState("");
  const [loading, setLoading] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  const logout = () => {
    clearSession();
    navigate("/login");
  };

  const load = async (specialtyValue = "") => {
    try {
      setLoading(true);
      const url = specialtyValue
        ? `${API.doctor}/doctors?specialty=${encodeURIComponent(specialtyValue)}`
        : `${API.doctor}/doctors`;

      const res = await axios.get(url);
      setDoctors(res.data);
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

  const navItems = [
    { path: "/patient/profile", label: "My Profile", icon: "👤" },
    { path: "/patient/medical-record", label: "Medical Record", icon: "📋" },
    { path: "/patient/doctors", label: "Browse Doctors", icon: "👨‍⚕️", active: true },
    { path: "/patient/appointments", label: "Appointments", icon: "📅" },
    { path: "/patient/upload", label: "Upload Reports", icon: "📤" },
    { path: "/patient/reports", label: "My Reports", icon: "📊" },
    { path: "/patient/prescriptions", label: "Prescriptions", icon: "💊" },
    { path: "/patient/payments", label: "Payments", icon: "💰" },
  ];

  const specialties = [
    "Cardiologist", "Dermatologist", "Neurologist", "Pediatrician", "Psychiatrist",
    "Orthopedic", "Ophthalmologist", "Gynecologist", "General Physician", "Dentist"
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
            <div style={styles.adminAvatar}>{getName()?.charAt(0) || "P"}</div>
            <div>
              <div style={styles.adminName}>{getName() || "Patient"}</div>
              <div style={styles.adminRole}>Patient</div>
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
        <div style={styles.contentWrapper}>
          <div style={styles.header}>
            <div>
              <h1 style={styles.title}>
                Browse <span style={styles.gradientText}>Doctors</span>
              </h1>
              <p style={styles.subtitle}>Connect with top specialists & schedule appointments seamlessly</p>
            </div>
            <div style={styles.statsBadge}>
              <span>{doctors.length} Available</span>
            </div>
          </div>

          {/* Search Section */}
          <div style={styles.searchCard}>
            <div style={styles.searchHeader}>
              <span style={styles.searchIcon}>🔍</span>
              <h3 style={styles.searchTitle}>Find a Doctor</h3>
            </div>
            
            <div style={styles.searchContainer}>
              <div style={styles.searchInputWrapper}>
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="Search by specialty (e.g., Cardiologist)"
                  style={styles.searchInput}
                  onKeyPress={(e) => e.key === 'Enter' && load(specialty)}
                  className="search-input"
                />
              </div>
              <div style={styles.searchButtons}>
                <button onClick={() => load(specialty)} style={styles.searchBtn} className="primary-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Search
                </button>
                <button 
                  onClick={() => { setSpecialty(""); load(""); }} 
                  style={styles.clearBtn}
                  className="secondary-btn"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Specialty Chips */}
            <div style={styles.specialtyChips}>
              {specialties.map((spec) => (
                <button
                  key={spec}
                  onClick={() => { setSpecialty(spec); load(spec); }}
                  style={specialty === spec ? styles.chipActive : styles.chip}
                  className="chip"
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          {/* Doctors Grid */}
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p style={styles.loadingText}>Loading expert doctors...</p>
            </div>
          ) : doctors.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>👨‍⚕️</div>
              <p style={styles.emptyText}>No doctors found</p>
              <p style={styles.emptySubtext}>Try adjusting your search criteria</p>
            </div>
          ) : (
            <div style={styles.doctorsGrid}>
              {doctors.map((d) => (
                <div 
                  key={d._id} 
                  style={{
                    ...styles.doctorCard,
                    ...(hoveredCard === d._id ? styles.doctorCardHover : {})
                  }}
                  onMouseEnter={() => setHoveredCard(d._id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="doctor-card"
                >
                  <div style={styles.doctorHeader}>
                    <div style={styles.doctorAvatar}>
                      {d.specialty?.charAt(0) || "D"}
                    </div>
                    <div style={styles.doctorHeaderInfo}>
                      <div style={styles.doctorSpecialty}>{d.specialty || "General Physician"}</div>
                      <div style={styles.doctorId}>ID: {d.userId?.slice(-6) || "N/A"}</div>
                    </div>
                  </div>

                  <div style={styles.doctorBio}>
                    <p>{d.bio || "Experienced healthcare professional dedicated to your well-being."}</p>
                  </div>

                  <div style={styles.availabilitySection}>
                    <div style={styles.availabilityTitle}>
                      <span>📅</span>
                      <span>Availability</span>
                    </div>
                    {d.availability?.length ? (
                      <div style={styles.slotsContainer}>
                        {d.availability.slice(0, 3).map((slot, idx) => (
                          <div key={idx} style={styles.slot}>
                            <span style={styles.slotDay}>{slot.day}</span>
                            <span style={styles.slotTime}>{slot.from} - {slot.to}</span>
                          </div>
                        ))}
                        {d.availability.length > 3 && (
                          <div style={styles.moreSlots}>+{d.availability.length - 3} more slots</div>
                        )}
                      </div>
                    ) : (
                      <div style={styles.noAvailability}>No availability added yet</div>
                    )}
                  </div>

                  <Link to={`/patient/book/${d.userId}`} style={styles.bookBtn} className="book-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 2V5M16 2V5M3 9H21M5 4H19C20.1046 4 21 4.89543 21 6V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M12 13H12.01M12 16H12.01M15 13H15.01M9 13H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Book Appointment
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .doctor-card {
          animation: fadeSlideUp 0.5s ease-out;
          transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
        }
        
        .chip {
          transition: all 0.2s ease;
          cursor: pointer;
        }
        
        .chip:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(30, 111, 92, 0.15);
        }
        
        .primary-btn, .secondary-btn, .book-btn {
          transition: all 0.2s ease;
          cursor: pointer;
        }
        
        .primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(30, 111, 92, 0.3);
        }
        
        .secondary-btn:hover {
          transform: translateY(-2px);
          background-color: #f0f2f5;
        }
        
        .book-btn:hover {
          transform: translateY(-2px);
          background-color: #d9f0eb;
          box-shadow: 0 4px 12px rgba(30, 111, 92, 0.2);
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
        
        .search-input {
          transition: all 0.2s ease;
        }
        
        .search-input:focus {
          border-color: #1e6f5c;
          box-shadow: 0 0 0 3px rgba(30, 111, 92, 0.08);
          outline: none;
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    width: "100%",
    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
    fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  },
  sidebar: {
    width: "280px",
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    backdropFilter: "blur(10px)",
    borderRight: "1px solid rgba(0, 0, 0, 0.05)",
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
    marginLeft: "280px",
    padding: "40px",
    width: "calc(100% - 280px)",
    minHeight: "100vh",
  },
  contentWrapper: {
    maxWidth: "1400px",
    width: "100%",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
    flexWrap: "wrap",
    gap: "16px",
  },
  title: {
    fontSize: "36px",
    fontWeight: "700",
    color: "#1a2c3e",
    margin: "0 0 8px 0",
    letterSpacing: "-0.5px",
  },
  gradientText: {
    background: "linear-gradient(135deg, #1e6f5c 0%, #2c9b82 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  subtitle: {
    fontSize: "15px",
    color: "#5e7a93",
    margin: 0,
  },
  statsBadge: {
    backgroundColor: "rgba(30, 111, 92, 0.1)",
    padding: "8px 16px",
    borderRadius: "40px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#1e6f5c",
  },
  searchCard: {
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    padding: "28px",
    marginBottom: "32px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
  },
  searchHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "20px",
  },
  searchIcon: {
    fontSize: "20px",
  },
  searchTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1a2c3e",
    margin: 0,
  },
  searchContainer: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  searchInputWrapper: {
    flex: 1,
    minWidth: "250px",
  },
  searchInput: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "14px",
    border: "1.5px solid #e2e8f0",
    borderRadius: "12px",
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
  },
  searchButtons: {
    display: "flex",
    gap: "8px",
  },
  searchBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 24px",
    background: "linear-gradient(135deg, #1e6f5c 0%, #238b72 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  clearBtn: {
    padding: "12px 24px",
    backgroundColor: "#f5f7fa",
    color: "#5e7a93",
    border: "1.5px solid #e2e8f0",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  specialtyChips: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "8px",
  },
  chip: {
    padding: "6px 16px",
    backgroundColor: "#f5f7fa",
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
    fontSize: "13px",
    color: "#5e7a93",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  chipActive: {
    padding: "6px 16px",
    background: "linear-gradient(135deg, #1e6f5c 0%, #238b72 100%)",
    border: "none",
    borderRadius: "20px",
    fontSize: "13px",
    color: "#ffffff",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  doctorsGrid: {
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
  doctorCardHover: {
    transform: "translateY(-4px)",
    boxShadow: "0 20px 30px -12px rgba(0, 0, 0, 0.12)",
  },
  doctorHeader: {
    padding: "20px 24px",
    backgroundColor: "#fafcfd",
    borderBottom: "1px solid #eef2f6",
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  doctorAvatar: {
    width: "56px",
    height: "56px",
    background: "linear-gradient(135deg, #e8f5e9 0%, #d4ede8 100%)",
    borderRadius: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "600",
    color: "#1e6f5c",
  },
  doctorHeaderInfo: {
    flex: 1,
  },
  doctorSpecialty: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1a2c3e",
    marginBottom: "4px",
  },
  doctorId: {
    fontSize: "12px",
    color: "#5e7a93",
  },
  doctorBio: {
    padding: "20px 24px",
    borderBottom: "1px solid #eef2f6",
    fontSize: "14px",
    color: "#5e7a93",
    lineHeight: "1.5",
  },
  availabilitySection: {
    padding: "20px 24px",
    borderBottom: "1px solid #eef2f6",
  },
  availabilityTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#1a2c3e",
    marginBottom: "12px",
  },
  slotsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  slot: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 12px",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    fontSize: "13px",
  },
  slotDay: {
    fontWeight: "500",
    color: "#1a2c3e",
  },
  slotTime: {
    color: "#5e7a93",
  },
  moreSlots: {
    fontSize: "12px",
    color: "#1e6f5c",
    marginTop: "4px",
    textAlign: "center",
  },
  noAvailability: {
    fontSize: "13px",
    color: "#9aaebf",
    textAlign: "center",
    padding: "12px",
  },
  bookBtn: {
    margin: "0 24px 24px 24px",
    width: "calc(100% - 48px)",
    padding: "12px",
    backgroundColor: "#e8f5e9",
    color: "#1e6f5c",
    border: "none",
    borderRadius: "40px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "inherit",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    textDecoration: "none",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
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
};