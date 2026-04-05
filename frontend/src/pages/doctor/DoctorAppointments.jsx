import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { API, authHeaders } from "../../api/client";

export default function DoctorAppointments() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  // Helper function to check if payment is paid (case-insensitive)
  const isPaid = (status) => {
    return status && status.toUpperCase() === "PAID";
  };

  // Helper functions to safely format dates
  const formatSafeDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "-";

    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatSafeTime = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "-";

    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const load = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API.appointment}/appointments/doctor/me`, {
        headers: authHeaders(),
      });
      setList(
        [...res.data].sort((a, b) => {
          if ((a.slotNumber || 0) !== (b.slotNumber || 0)) {
            return (a.slotNumber || 0) - (b.slotNumber || 0);
          }
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        })
      );
    } catch (e) {
      console.error(e);
      alert("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `${API.appointment}/appointments/${id}/status`,
        { status },
        { headers: authHeaders() }
      );
      alert(`Marked ${status}`);
      load();
    } catch (e) {
      console.error(e);
      alert("Update failed");
    }
  };

  const completeAppointment = async (id) => {
    try {
      await axios.patch(
        `${API.appointment}/appointments/${id}/complete`,
        {},
        { headers: authHeaders() }
      );
      alert("Appointment completed");
      load();
    } catch (e) {
      console.error(e);
      alert("Complete failed");
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "PENDING": return { bg: "#fff3e0", color: "#ed6c02", label: "Pending" };
      case "ACCEPTED": return { bg: "#e3f2fd", color: "#0288d1", label: "Accepted" };
      case "CONFIRMED": return { bg: "#e8f5e9", color: "#2e7d32", label: "Confirmed" };
      case "REJECTED": return { bg: "#ffebee", color: "#c62828", label: "Rejected" };
      case "COMPLETED": return { bg: "#e8f5e9", color: "#2e7d32", label: "Completed" };
      default: return { bg: "#f5f5f5", color: "#757575", label: status };
    }
  };

  const getPaymentStatusColor = (status) => {
    const upperStatus = status?.toUpperCase();
    switch(upperStatus) {
      case "PAID": return { bg: "#e8f5e9", color: "#2e7d32" };
      case "PENDING": return { bg: "#fff3e0", color: "#ed6c02" };
      case "FAILED": return { bg: "#ffebee", color: "#c62828" };
      default: return { bg: "#f5f5f5", color: "#757575" };
    }
  };

  const filteredList = activeFilter === "all" 
    ? list 
    : list.filter(a => a.status === activeFilter);

  const stats = {
    total: list.length,
    pending: list.filter(a => a.status === "PENDING").length,
    accepted: list.filter(a => a.status === "ACCEPTED").length,
    confirmed: list.filter(a => a.status === "CONFIRMED").length,
    completed: list.filter(a => a.status === "COMPLETED").length,
    rejected: list.filter(a => a.status === "REJECTED").length,
  };

  const liveQueueAppointments = list
    .filter((a) => ["ACCEPTED", "CONFIRMED"].includes(a.status))
    .sort((a, b) => (a.slotNumber || 0) - (b.slotNumber || 0));

  const currentRunningAppointment = liveQueueAppointments.length
    ? liveQueueAppointments[0]
    : null;

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
              <div style={styles.userRole}>Appointments</div>
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
          <div style={styles.navItemActive}>
            <span style={styles.navIcon}>📋</span>
            <span>Appointment Requests</span>
          </div>
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
            <h1 style={styles.title}>Appointment Requests</h1>
            <p style={styles.subtitle}>Manage and respond to patient appointment requests</p>
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
              <div style={styles.statLabel}>Total</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{...styles.statIcon, backgroundColor: "#fff3e0"}}>⏳</div>
            <div>
              <div style={styles.statValue}>{stats.pending}</div>
              <div style={styles.statLabel}>Pending</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{...styles.statIcon, backgroundColor: "#e3f2fd"}}>✓</div>
            <div>
              <div style={styles.statValue}>{stats.accepted}</div>
              <div style={styles.statLabel}>Accepted</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{...styles.statIcon, backgroundColor: "#e8f5e9"}}>✅</div>
            <div>
              <div style={styles.statValue}>{stats.completed}</div>
              <div style={styles.statLabel}>Completed</div>
            </div>
          </div>
        </div>

        {/* Live Queue Summary Card */}
        <div style={styles.tabSection}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#1a2c3e" }}>Live Queue</div>
              <div style={{ fontSize: "13px", color: "#5e7a93", marginTop: "4px" }}>
                {currentRunningAppointment
                  ? `Current running slot: ${currentRunningAppointment.slotNumber}`
                  : "No live queue running now"}
              </div>
            </div>

            {currentRunningAppointment && (
              <div style={{
                padding: "10px 16px",
                borderRadius: "40px",
                backgroundColor: "#e8f5e9",
                color: "#1e6f5c",
                fontSize: "13px",
                fontWeight: "600",
              }}>
                Running Slot {currentRunningAppointment.slotNumber}
              </div>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={styles.tabSection}>
          <div style={styles.tabs}>
            <button 
              onClick={() => setActiveFilter("all")}
              style={activeFilter === "all" ? {...styles.tab, ...styles.tabActive} : styles.tab}
            >
              All
              {stats.total > 0 && <span style={styles.badge}>{stats.total}</span>}
            </button>
            <button 
              onClick={() => setActiveFilter("PENDING")}
              style={activeFilter === "PENDING" ? {...styles.tab, ...styles.tabActive} : styles.tab}
            >
              Pending
              {stats.pending > 0 && <span style={styles.badge}>{stats.pending}</span>}
            </button>
            <button 
              onClick={() => setActiveFilter("ACCEPTED")}
              style={activeFilter === "ACCEPTED" ? {...styles.tab, ...styles.tabActive} : styles.tab}
            >
              Accepted
            </button>
            <button 
              onClick={() => setActiveFilter("CONFIRMED")}
              style={activeFilter === "CONFIRMED" ? {...styles.tab, ...styles.tabActive} : styles.tab}
            >
              Confirmed
            </button>
            <button 
              onClick={() => setActiveFilter("COMPLETED")}
              style={activeFilter === "COMPLETED" ? {...styles.tab, ...styles.tabActive} : styles.tab}
            >
              Completed
            </button>
            <button 
              onClick={() => setActiveFilter("REJECTED")}
              style={activeFilter === "REJECTED" ? {...styles.tab, ...styles.tabActive} : styles.tab}
            >
              Rejected
            </button>
          </div>
        </div>

        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading appointments...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📭</div>
            <p style={styles.emptyText}>No appointments found</p>
            <p style={styles.emptySubtext}>
              {activeFilter === "all" 
                ? "You don't have any appointment requests yet" 
                : `No ${activeFilter.toLowerCase()} appointments to display`}
            </p>
          </div>
        ) : (
          <div style={styles.appointmentsGrid}>
            {filteredList.map((a) => {
              const statusStyle = getStatusColor(a.status);
              const paymentStyle = getPaymentStatusColor(a.paymentStatus);
              return (
                <div key={a._id} style={styles.appointmentCard}>
                  <div style={styles.cardHeader}>
                    <div style={styles.patientInfo}>
                      <div style={styles.patientAvatar}>
                        {a.patientName?.charAt(0) || "P"}
                      </div>
                      <div>
                        <div style={styles.patientId}>Patient ID: {a.patientId}</div>
                        <div style={styles.appointmentDate}>
                          📅 Requested on: {formatSafeDate(a.createdAt)}
                        </div>
                        <div style={styles.appointmentTime}>
                          ⏰ Requested at: {formatSafeTime(a.createdAt)} • Slot {a.slotNumber ?? "-"}
                        </div>
                      </div>
                    </div>
                    <div style={{...styles.statusBadge, backgroundColor: statusStyle.bg, color: statusStyle.color}}>
                      {statusStyle.label}
                    </div>
                  </div>

                  <div style={styles.cardContent}>
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Reason for visit:</span>
                      <span style={styles.infoValue}>{a.reason || "Not specified"}</span>
                    </div>
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Payment Status:</span>
                      <span style={{...styles.paymentBadge, backgroundColor: paymentStyle.bg, color: paymentStyle.color}}>
                        {a.paymentStatus ? a.paymentStatus.toUpperCase() : "PENDING"}
                      </span>
                    </div>
                    
                    {/* Queue Status */}
                    {a.queue?.currentRunningSlot !== null && ["ACCEPTED", "CONFIRMED"].includes(a.status) && (
                      <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Queue Status:</span>
                        <span style={styles.infoValue}>
                          Slot {a.queue.currentRunningSlot} running now
                          {a.queue.isCurrentTurn
                            ? " • This patient is now running"
                            : a.queue.isNextTurn
                            ? " • Next patient"
                            : ` • Patients ahead: ${a.queue.patientsAhead}`}
                        </span>
                      </div>
                    )}
                    
                    {a.telemedicineLink && !["COMPLETED", "REJECTED"].includes(a.status) && (
                      <div style={styles.telemedicineSection}>
                        <span style={styles.infoLabel}>Telemedicine Link:</span>
                        <a 
                          href={a.telemedicineLink} 
                          target="_blank" 
                          rel="noreferrer" 
                          style={styles.telemedicineLink}
                        >
                          🎥 Join Video Call
                        </a>
                      </div>
                    )}
                  </div>

                  <div style={styles.cardActions}>
                    {/* Issue Prescription + Complete for ACCEPTED and CONFIRMED */}
                    {["ACCEPTED", "CONFIRMED"].includes(a.status) && (
                      <>
                        <Link to={`/doctor/prescribe/${a.patientId}?appointmentId=${a._id}`} style={styles.prescribeBtn}>
                          Issue Prescription
                        </Link>
                        <button onClick={() => completeAppointment(a._id)} style={styles.completeBtn}>
                          ✓ Mark Completed
                        </button>
                      </>
                    )}

                    {/* Accept/Reject only for PENDING + PAID */}
                    {a.status === "PENDING" && isPaid(a.paymentStatus) && (
                      <div style={styles.actionButtons}>
                        <button onClick={() => updateStatus(a._id, "ACCEPTED")} style={styles.acceptBtn}>✓ Accept</button>
                        <button onClick={() => updateStatus(a._id, "REJECTED")} style={styles.rejectBtn}>✗ Reject</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {!loading && filteredList.length > 0 && (
          <div style={styles.footerStats}>
            Showing {filteredList.length} of {list.length} appointments
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    height: "100vh",          // Force full viewport height
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
    height: "100%",           // Take full height of container
    overflowY: "auto",        // Scroll if content overflows
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
  tabSection: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "20px",
    marginBottom: "32px",
  },
  tabs: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  tab: {
    padding: "8px 20px",
    backgroundColor: "#f8fafc",
    border: "1.5px solid #e2e8f0",
    borderRadius: "40px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#5e7a93",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  tabActive: {
    backgroundColor: "#1e6f5c",
    borderColor: "#1e6f5c",
    color: "#ffffff",
  },
  badge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: "2px 8px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  appointmentsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  appointmentCard: {
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  cardHeader: {
    padding: "20px 24px",
    backgroundColor: "#fafcfd",
    borderBottom: "1px solid #eef2f6",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "12px",
  },
  patientInfo: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
  },
  patientAvatar: {
    width: "56px",
    height: "56px",
    backgroundColor: "#e8f5e9",
    borderRadius: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "600",
    color: "#1e6f5c",
  },
  patientId: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1a2c3e",
    marginBottom: "4px",
  },
  appointmentDate: {
    fontSize: "13px",
    color: "#5e7a93",
    marginBottom: "2px",
  },
  appointmentTime: {
    fontSize: "13px",
    color: "#5e7a93",
  },
  statusBadge: {
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
  },
  cardContent: {
    padding: "20px 24px",
    borderBottom: "1px solid #eef2f6",
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
    flexWrap: "wrap",
  },
  infoLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#5e7a93",
    minWidth: "120px",
  },
  infoValue: {
    fontSize: "14px",
    color: "#1a2c3e",
    flex: 1,
  },
  paymentBadge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
  },
  telemedicineSection: {
    marginTop: "12px",
    paddingTop: "12px",
    borderTop: "1px solid #eef2f6",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  telemedicineLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    backgroundColor: "#e3f2fd",
    color: "#0288d1",
    textDecoration: "none",
    borderRadius: "40px",
    fontSize: "13px",
    fontWeight: "500",
    transition: "all 0.2s ease",
  },
  cardActions: {
    padding: "20px 24px",
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  prescribeBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
    textDecoration: "none",
    borderRadius: "40px",
    fontSize: "13px",
    fontWeight: "600",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
  },
  actionButtons: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  acceptBtn: {
    padding: "10px 24px",
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
    border: "none",
    borderRadius: "40px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
  },
  rejectBtn: {
    padding: "10px 24px",
    backgroundColor: "#ffebee",
    color: "#c62828",
    border: "none",
    borderRadius: "40px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
  },
  completeBtn: {
    padding: "10px 24px",
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
    border: "none",
    borderRadius: "40px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
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

// Add global styles to ensure full height
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    /* Ensure html and body take full height */
    html, body, #root {
      margin: 0;
      padding: 0;
      height: 100%;
      width: 100%;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    button:hover:not(:disabled), .refresh-btn:hover, .prescribe-btn:hover, .telemedicine-link:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .nav-item:hover, .appointment-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    }
    
    a:hover {
      background-color: #f8fafc;
    }
    
    .accept-btn:hover {
      background-color: #c8e6c9;
    }
    
    .reject-btn:hover {
      background-color: #ffcdd2;
    }
    
    input:focus {
      border-color: #1e6f5c !important;
      box-shadow: 0 0 0 3px rgba(30, 111, 92, 0.08) !important;
      outline: none;
    }
  `;
  document.head.appendChild(styleSheet);
}