import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { API, authHeaders } from "../../api/client";
import { clearSession, getName } from "../../api/auth";

export default function MyAppointments() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [editingId, setEditingId] = useState(null);
  const [editReason, setEditReason] = useState("");
  const [loadingMap, setLoadingMap] = useState({});
  const toastTimeout = useRef();

  const showToast = (message, type = "success") => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setToast({ show: true, message, type });
    toastTimeout.current = setTimeout(() => {
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
      const res = await axios.get(`${API.appointment}/appointments/me`, {
        headers: authHeaders(),
      });
      setList(res.data);
    } catch (err) {
      console.error(err);
      showToast("Failed to load appointments", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Helper to toggle per-action loading
  const setActionLoading = (id, action, value) => {
    setLoadingMap(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [action]: value
      }
    }));
  };

  const updateReason = async (appointmentId) => {
    setActionLoading(appointmentId, "edit", true);
    try {
      await axios.patch(
        `${API.appointment}/appointments/${appointmentId}/reason`,
        { reason: editReason },
        { headers: authHeaders() }
      );

      showToast("Reason updated successfully", "success");
      setEditingId(null);

      // Optimistic update instead of full reload
      setList(prev => prev.map(a => 
        a._id === appointmentId ? { ...a, reason: editReason } : a
      ));
    } catch (err) {
      console.error(err);
      showToast("Failed to update reason", "error");
    } finally {
      setActionLoading(appointmentId, "edit", false);
    }
  };

  const startStripeCheckout = async (appointmentId, doctorProfession) => {
    setActionLoading(appointmentId, "pay", true);
    try {
      const amount = doctorFees[doctorProfession] || 1000; // default if not found

      const res = await axios.post(
        `${API.payment}/payments/checkout-session`,
        { appointmentId, amount },
        { headers: authHeaders() }
      );

      if (res.data.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      } else {
        showToast("No checkout URL returned", "error");
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Stripe checkout failed", "error");
    } finally {
      setActionLoading(appointmentId, "pay", false);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    setActionLoading(appointmentId, "cancel", true);
    try {
      await axios.patch(
        `${API.appointment}/appointments/${appointmentId}/cancel`,
        {},
        { headers: authHeaders() }
      );
      showToast("Appointment cancelled successfully", "success");

      // Optimistic update
      setList(prev => prev.map(a => 
        a._id === appointmentId ? { ...a, status: "CANCELLED" } : a
      ));
    } catch (err) {
      console.error(err);
      showToast("Failed to cancel appointment", "error");
    } finally {
      setActionLoading(appointmentId, "cancel", false);
    }
  };

   const doctorFees = {
      "Cardiology": 9000,
      "Dermatology": 10000,
      "Neurology": 7000,
      "Pediatrics": 8000,
      "Psychiatry": 5000,
      "Orthopedics": 7000,
      "Ophthalmology": 9000,
      "Gynecology": 7000,
      "Urology": 8000,
      "General Medicine": 8000,
      "Family Medicine": 5000,
      "Emergency Medicine": 7000,
      "Radiology": 7000,
      "Anesthesiology": 8000,
      "Surgery": 9000,
    };

  const navItems = [
    { path: "/patient/profile", label: "My Profile", icon: "👤" },
    { path: "/patient/medical-record", label: "My Medical Record", icon: "📋" },
    { path: "/patient/doctors", label: "Browse Doctors", icon: "👨‍⚕️" },
    { path: "/patient/appointments", label: "My Appointments", icon: "📅", active: true },
    { path: "/patient/upload", label: "Upload Medical Reports", icon: "📤" },
    { path: "/patient/reports", label: "My Reports", icon: "📊" },
    { path: "/patient/prescriptions", label: "My Prescriptions", icon: "💊" },
    { path: "/patient/payments", label: "My Payments", icon: "💰" },
  ];

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "CONFIRMED":
      case "ACCEPTED":
        return { bg: "#e8f5e9", color: "#2e7d32", label: "Confirmed" };
      case "PENDING":
        return { bg: "#fff3e0", color: "#ed6c02", label: "Pending" };
      case "CANCELLED":
        return { bg: "#ffebee", color: "#c62828", label: "Cancelled" };
      case "COMPLETED":
        return { bg: "#e3f2fd", color: "#0288d1", label: "Completed" };
      default:
        return { bg: "#f5f5f5", color: "#757575", label: status };
    }
  };
  // Refund handler
const refundAppointment = async (a) => {
  if (a.paymentStatus !== "PAID") return alert("Only PAID payments can be refunded!");
  if (a.status !== "REJECTED") return alert("Only REJECTED appointments can be refunded!");

  try {
    setActionLoading(a._id, "refund", true);

    await axios.post(
      `${API.payment}/payments/refund`,
      { appointmentId: a._id },
      { headers: authHeaders() }
    );

     // Update UI: change paymentStatus to REFUNDED and hide refund button
    setList(prev => prev.map(app => 
      app._id === a._id ? { ...app, paymentStatus: "REFUNDED" } : app
    ));

    showToast("Refund successful!");
  } catch (err) {
    console.error(err.response?.data || err.message);
    showToast(`Refund failed: ${err.response?.data?.message || err.message}`, "error");
  } finally {
    setActionLoading(a._id, "refund", false);
  }
};

  const getPaymentStatusStyle = (status) => {
    switch (status) {
      case "PAID":
        return { bg: "#e8f5e9", color: "#2e7d32", label: "Paid" };
      case "UNPAID":
        return { bg: "#ffebee", color: "#c62828", label: "Unpaid" };
        case "REFUNDED":
        return { bg: "#e0f7fa", color: "#006064", label: "Refunded" }; 
      default:
        return { bg: "#f5f5f5", color: "#757575", label: status || "Unpaid" };
    }
  };

  const stats = {
    total: list.length,
    confirmed: list.filter(a => a.status === "CONFIRMED" || a.status === "ACCEPTED").length,
    pending: list.filter(a => a.status === "PENDING").length,
    cancelled: list.filter(a => a.status === "CANCELLED").length,
    completed: list.filter(a => a.status === "COMPLETED").length,
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <div style={styles.logo}>
              <div style={styles.logoIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15 8H22L16 12L19 18L12 14L5 18L8 12L2 8H9L12 2Z" fill="currentColor" />
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
            <p style={styles.loadingText}>Loading appointments...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
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

      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15 8H22L16 12L19 18L12 14L5 18L8 12L2 8H9L12 2Z" fill="currentColor" />
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
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>My Appointments</h1>
            <p style={styles.subtitle}>Track and manage your scheduled appointments</p>
          </div>
          <Link to="/patient/doctors" style={styles.newAppointmentBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4V20M20 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            New Appointment
          </Link>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, backgroundColor: "#e3f2fd" }}>📅</div>
            <div>
              <div style={styles.statValue}>{stats.total}</div>
              <div style={styles.statLabel}>Total Appointments</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, backgroundColor: "#e8f5e9" }}>✓</div>
            <div>
              <div style={styles.statValue}>{stats.confirmed}</div>
              <div style={styles.statLabel}>Confirmed</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, backgroundColor: "#fff3e0" }}>⏳</div>
            <div>
              <div style={styles.statValue}>{stats.pending}</div>
              <div style={styles.statLabel}>Pending</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, backgroundColor: "#ffebee" }}>❌</div>
            <div>
              <div style={styles.statValue}>{stats.cancelled}</div>
              <div style={styles.statLabel}>Cancelled</div>
            </div>
          </div>
        </div>

        {list.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📅</div>
            <p style={styles.emptyText}>No appointments yet</p>
            <p style={styles.emptySubtext}>Book your first appointment with a doctor</p>
            <Link to="/patient/doctors" style={styles.emptyBtn}>
              Browse Doctors
            </Link>
          </div>
        ) : (
          <div style={styles.appointmentsGrid}>
            {list.map((a) => {
                console.log(a.paymentStatus); // <-- add this line here

              const statusStyle = getStatusBadgeStyle(a.status);
              const paymentStyle = getPaymentStatusStyle(a.paymentStatus);

              return (
                <div key={a._id} className="appointment-card" style={styles.appointmentCard}>
                  <div style={styles.cardHeader}>
                    <div style={styles.doctorInfo}>
                      <div style={styles.doctorAvatar}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 21V19C20 16.8 18.2 15 16 15H8C5.8 15 4 16.8 4 19V21M16 7C16 9.2 14.2 11 12 11C9.8 11 8 9.2 8 7C8 4.8 9.8 3 12 3C14.2 3 16 4.8 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div>
                        <div style={styles.doctorIdText}>Doctor ID: {a.doctorId?.slice(-6) || "N/A"}</div>
                      </div>
                    </div>
                    <div style={{ ...styles.statusBadge, backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                      {statusStyle.label}
                    </div>
                  </div>

                  <div style={styles.cardContent}>
                    <div style={styles.infoRow}>
                      <span style={styles.infoIcon}>🎯</span>
                      <div>
                        <div style={styles.infoLabel}>Slot Number</div>
                        <div style={styles.infoValue}>Slot {a.slotNumber}</div>
                      </div>
                    </div>

                    <div style={styles.infoRow}>
                      <span style={styles.infoIcon}>📝</span>
                      <div style={{ width: "100%" }}>
                        <div style={styles.infoLabel}>Reason</div>

                        {editingId === a._id ? (
                          <>
                            <input
                              value={editReason}
                              onChange={(e) => setEditReason(e.target.value)}
                              style={styles.editInput}
                              disabled={loadingMap[a._id]?.edit}
                            />

                            <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
                              <button
                                onClick={() => updateReason(a._id)}
                                style={styles.saveBtn}
                                disabled={loadingMap[a._id]?.edit}
                              >
                                {loadingMap[a._id]?.edit ? "Saving..." : "Save"}
                              </button>

                              <button
                                onClick={() => setEditingId(null)}
                                style={styles.cancelSmallBtn}
                                disabled={loadingMap[a._id]?.edit}
                              >
                                Cancel
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div style={styles.infoValue}>
                              {a.reason || "No reason provided"}
                            </div>

                            {a.status === "PENDING" && a.paymentStatus !== "PAID" && (
                              <button
                                onClick={() => {
                                  setEditingId(a._id);
                                  setEditReason(a.reason || "");
                                }}
                                style={styles.editBtn}
                              >
                                ✏️ Edit
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div style={styles.infoRow}>
                      <span style={styles.infoIcon}>💰</span>
                      <div>
                        <div style={styles.infoLabel}>Payment Status</div>
                        <div style={{ ...styles.paymentBadge, backgroundColor: paymentStyle.bg, color: paymentStyle.color }}>
                          {paymentStyle.label}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={styles.cardActions}>
                    {a.telemedicineLink && !["CANCELLED", "COMPLETED"].includes(a.status) && (

                      <a
                        href={a.telemedicineLink}
                        target="_blank"
                        rel="noreferrer"
                        style={styles.joinCallBtn}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M23 7L16 12L23 17V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          <rect x="1" y="5" width="15" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        Join Video Call
                      </a>
                    )}

{a.status !== "CANCELLED" && a.paymentStatus !== "PAID" && a.paymentStatus !== "REFUNDED" && (
  <button
    onClick={() => startStripeCheckout(a._id, a.doctorProfession)}
    style={styles.payBtn}
    disabled={loadingMap[a._id]?.pay}
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 10H21M7 15H11M7 18H14M5 4H19C20.1046 4 21 4.89543 21 6V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" />
                        </svg>

    {loadingMap[a._id]?.pay ? "Processing..." : "Pay with Stripe"}
  </button>
)}

{a.status !== "CANCELLED" && a.status !== "COMPLETED" && a.status !== "REJECTED" && a.paymentStatus !== "PAID" && (  <button
    onClick={() => cancelAppointment(a._id)}
    style={styles.cancelBtn}
    disabled={loadingMap[a._id]?.cancel}
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>

    {loadingMap[a._id]?.cancel ? "Cancelling..." : "Cancel Appointment"}
  </button>
)}

{a.status === "REJECTED" && a.paymentStatus === "PAID" && (
  <button
    onClick={() => refundAppointment(a)}
    style={styles.refundBtn}
    disabled={loadingMap[a._id]?.refund}
  >
     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3C13.76 3 15.4 3.5 16.77 4.37M21 3L16 8M21 3H16M21 3V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
    {loadingMap[a._id]?.refund ? "Processing..." : "Refund"}
  </button>
)}
                  </div>
                </div>
              );
            })}
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
        
        button:hover:not(:disabled), a:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .appointment-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }
        
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
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
  newAppointmentBtn: {
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
  appointmentsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    width: "100%",
  },
  appointmentCard: {
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
    justifyContent: "space-between",
    alignItems: "center",
  },
  doctorInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  doctorAvatar: {
    width: "40px",
    height: "40px",
    backgroundColor: "#e8f5e9",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#1e6f5c",
  },
  doctorIdText: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#1a2c3e",
  },
  statusBadge: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  cardContent: {
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  infoRow: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
  },
  infoIcon: {
    fontSize: "18px",
    marginTop: "2px",
  },
  infoLabel: {
    fontSize: "12px",
    color: "#5e7a93",
    marginBottom: "4px",
  },
  infoValue: {
    fontSize: "14px",
    color: "#1a2c3e",
  },
  paymentBadge: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
    display: "inline-block",
  },
  cardActions: {
    padding: "20px 24px",
    borderTop: "1px solid #eef2f6",
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  joinCallBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: "#e3f2fd",
    color: "#0288d1",
    border: "none",
    borderRadius: "40px",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    textDecoration: "none",
    transition: "all 0.2s ease",
  },
  payBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
    border: "none",
    borderRadius: "40px",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
  },
  cancelBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
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
  editBtn: {
    marginTop: "6px",
    border: "none",
    background: "transparent",
    color: "#1e6f5c",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
  },
  editInput: {
    width: "100%",
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
    fontSize: "13px",
  },
  saveBtn: {
    padding: "6px 14px",
    borderRadius: "20px",
    border: "none",
    background: "#e8f5e9",
    color: "#2e7d32",
    cursor: "pointer",
    fontSize: "12px",
  },
  cancelSmallBtn: {
    padding: "6px 14px",
    borderRadius: "20px",
    border: "none",
    background: "#ffebee",
    color: "#c62828",
    cursor: "pointer",
    fontSize: "12px",
  },
 refundBtn: {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "10px 20px",
  backgroundColor: "#fff3e0", // Light orange background to match warning style
  color: "#ed6c02", // Orange text color
  border: "none",
  borderRadius: "40px",
  fontSize: "13px",
  fontWeight: "500",
  cursor: "pointer",
  transition: "all 0.2s ease",
  fontFamily: "inherit",
},
};