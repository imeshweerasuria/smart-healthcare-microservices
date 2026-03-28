import { useState } from "react";
import axios from "axios";
import { API, authHeaders } from "../../api/client";

export default function PaymentForAppointment() {
  const [appointmentId, setAppointmentId] = useState("");
  const [amount, setAmount] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const createPayment = async () => {
    if (!appointmentId.trim()) {
      setError("Please enter an appointment ID");
      return;
    }
    
    if (amount <= 0) {
      setError("Amount must be greater than 0");
      return;
    }
    
    setError("");
    setLoading(true);
    
    try {
      const res = await axios.post(
        `${API.payment}/payments/for-appointment`,
        { appointmentId, amount },
        { headers: authHeaders() }
      );
      alert("Payment record created: " + res.data.payment._id);
      setAppointmentId("");
      setAmount(1000);
    } catch (err) {
      console.error(err);
      alert("Failed to create payment");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && appointmentId && !loading) {
      createPayment();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Create Payment</h1>
            <p style={styles.subtitle}>Record a new payment transaction</p>
          </div>
        </div>

        {/* Form Card */}
        <div style={styles.card}>
          <div style={styles.cardIcon}>💰</div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Appointment ID
              <span style={styles.required}>*</span>
            </label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>📋</span>
              <input
                placeholder="Enter appointment ID"
                value={appointmentId}
                onChange={(e) => {
                  setAppointmentId(e.target.value);
                  if (error) setError("");
                }}
                onKeyPress={handleKeyPress}
                style={styles.input}
                disabled={loading}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Amount
              <span style={styles.required}>*</span>
            </label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(Number(e.target.value));
                  if (error) setError("");
                }}
                onKeyPress={handleKeyPress}
                style={styles.input}
                disabled={loading}
                min="0"
                step="100"
              />
            </div>
            <p style={styles.helperText}>Minimum amount: ₹100</p>
          </div>

          {error && (
            <div style={styles.errorMessage}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={createPayment}
            disabled={!appointmentId || loading}
            style={{
              ...styles.submitBtn,
              ...((!appointmentId || loading) ? styles.submitBtnDisabled : {})
            }}
          >
            {loading ? (
              <>
                <div style={styles.spinner}></div>
                Processing...
              </>
            ) : (
              <>
                <span>✨</span>
                Create Payment Record
              </>
            )}
          </button>

          <div style={styles.infoBox}>
            <div style={styles.infoIcon}>ℹ️</div>
            <div style={styles.infoContent}>
              <div style={styles.infoTitle}>Demo Mode</div>
              <div style={styles.infoText}>
                This creates a payment record in the system. In production, this would integrate with Stripe payment gateway.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    width: "100vw",
    maxWidth: "100%",
    background: "#f5f7fa",
    fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflowY: "auto",
    zIndex: 9999,
    margin: 0,
    padding: 0,
  },
  content: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "48px 24px",
    width: "100%",
    boxSizing: "border-box",
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
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    padding: "32px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  cardIcon: {
    fontSize: "48px",
    marginBottom: "24px",
    textAlign: "center",
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
    marginLeft: "4px",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: "14px",
    fontSize: "16px",
    color: "#9aaebf",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: "12px 14px 12px 42px",
    fontSize: "15px",
    border: "1.5px solid #e2e8f0",
    borderRadius: "12px",
    fontFamily: "inherit",
    outline: "none",
    transition: "all 0.2s ease",
    backgroundColor: "#ffffff",
    color: "#1a2c3e",
    boxSizing: "border-box",
  },
  helperText: {
    fontSize: "12px",
    color: "#5e7a93",
    marginTop: "6px",
    marginBottom: 0,
  },
  errorMessage: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px",
    backgroundColor: "#ffebee",
    borderRadius: "12px",
    marginBottom: "24px",
    fontSize: "13px",
    color: "#c62828",
    fontWeight: "500",
  },
  submitBtn: {
    width: "100%",
    padding: "14px",
    backgroundColor: "#1e6f5c",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginBottom: "24px",
  },
  submitBtnDisabled: {
    backgroundColor: "#cbd5e1",
    cursor: "not-allowed",
    transform: "none",
  },
  spinner: {
    width: "18px",
    height: "18px",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderTopColor: "#ffffff",
    borderRadius: "50%",
    animation: "spin 0.6s linear infinite",
  },
  infoBox: {
    display: "flex",
    gap: "12px",
    padding: "16px",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    borderLeft: "4px solid #1e6f5c",
  },
  infoIcon: {
    fontSize: "18px",
    flexShrink: 0,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#1a2c3e",
    marginBottom: "4px",
  },
  infoText: {
    fontSize: "12px",
    color: "#5e7a93",
    lineHeight: 1.5,
  },
};

// Add global styles for hover effects and animations, and remove parent layout constraints
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
  
  button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(30, 111, 92, 0.2);
  }
  
  .card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }
  
  /* Remove any sidebar or layout containers when this component mounts */
  body {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }
  
  /* Hide any sidebar elements */
  [class*="sidebar"], 
  [class*="Sidebar"],
  [class*="layout"],
  [class*="Layout"] {
    display: none !important;
  }
`;

if (typeof document !== "undefined") {
  document.head.appendChild(styleSheet);
}