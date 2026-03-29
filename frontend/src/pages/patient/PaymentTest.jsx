import { useState } from "react";
import axios from "axios";
import { API, authHeaders } from "../../api/client";

export default function PaymentTest() {
  const [paymentId, setPaymentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const create = async () => {
    setLoading(true);
    setError("");
    setPaymentId("");
    
    try {
      const res = await axios.post(
        `${API.payment}/payments/create-intent`,
        { appointmentId: "DEMO_APPT_1", amount: 1000 },
        { headers: authHeaders() }
      );
      setPaymentId(res.data.paymentId);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to create payment test");
      alert("Failed to create payment test");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (paymentId) {
      navigator.clipboard.writeText(paymentId);
      alert("Payment ID copied to clipboard!");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Payment Test</h1>
            <p style={styles.subtitle}>Test payment intent creation</p>
          </div>
        </div>

        {/* Test Card */}
        <div style={styles.card}>
          <div style={styles.cardIcon}>🧪</div>
          
          <div style={styles.testInfo}>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Test Appointment ID:</span>
              <span style={styles.infoValue}>DEMO_APPT_1</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Test Amount:</span>
              <span style={styles.infoValue}>₹1,000.00</span>
            </div>
          </div>

          <button
            onClick={create}
            disabled={loading}
            style={{
              ...styles.testBtn,
              ...(loading ? styles.testBtnDisabled : {})
            }}
          >
            {loading ? (
              <>
                <div style={styles.spinner}></div>
                Creating Intent...
              </>
            ) : (
              <>
                <span>💳</span>
                Create Payment Intent
              </>
            )}
          </button>

          {/* Error Display */}
          {error && (
            <div style={styles.errorBox}>
              <div style={styles.errorBoxIcon}>⚠️</div>
              <div style={styles.errorBoxContent}>
                <div style={styles.errorBoxTitle}>Error</div>
                <div style={styles.errorBoxText}>{error}</div>
              </div>
            </div>
          )}

          {/* Payment ID Display */}
          {paymentId && (
            <div style={styles.successBox}>
              <div style={styles.successBoxIcon}>✅</div>
              <div style={styles.successBoxContent}>
                <div style={styles.successBoxTitle}>Payment Intent Created</div>
                <div style={styles.paymentIdContainer}>
                  <div style={styles.paymentIdLabel}>Payment ID:</div>
                  <div style={styles.paymentIdValue}>{paymentId}</div>
                  <button
                    onClick={copyToClipboard}
                    style={styles.copyBtn}
                    title="Copy to clipboard"
                  >
                    📋
                  </button>
                </div>
                <div style={styles.successBoxText}>
                  This payment intent is ready for processing.
                </div>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div style={styles.infoBox}>
            <div style={styles.infoIcon}>ℹ️</div>
            <div style={styles.infoContent}>
              <div style={styles.infoTitle}>Test Mode</div>
              <div style={styles.infoText}>
                This creates a test payment intent with a demo appointment ID. 
                Use this for testing payment flow before integrating with real appointments.
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {paymentId && (
            <div style={styles.quickActions}>
              <div style={styles.quickActionsTitle}>Quick Actions:</div>
              <div style={styles.quickActionsButtons}>
                <button
                  onClick={copyToClipboard}
                  style={styles.quickActionBtn}
                >
                  📋 Copy Payment ID
                </button>
                <button
                  onClick={() => {
                    setPaymentId("");
                    setError("");
                  }}
                  style={styles.quickActionBtn}
                >
                  🧹 Clear Result
                </button>
              </div>
            </div>
          )}
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
  testInfo: {
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "24px",
    border: "1px solid #eef2f6",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    fontSize: "14px",
  },
  infoLabel: {
    color: "#5e7a93",
    fontWeight: "500",
  },
  infoValue: {
    color: "#1a2c3e",
    fontWeight: "600",
    fontFamily: "monospace",
  },
  testBtn: {
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
  testBtnDisabled: {
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
  errorBox: {
    display: "flex",
    gap: "12px",
    padding: "16px",
    backgroundColor: "#ffebee",
    borderRadius: "12px",
    marginBottom: "24px",
    textAlign: "left",
  },
  errorBoxIcon: {
    fontSize: "20px",
    flexShrink: 0,
  },
  errorBoxContent: {
    flex: 1,
  },
  errorBoxTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#c62828",
    marginBottom: "4px",
  },
  errorBoxText: {
    fontSize: "12px",
    color: "#c62828",
    lineHeight: 1.5,
  },
  successBox: {
    display: "flex",
    gap: "12px",
    padding: "16px",
    backgroundColor: "#e8f5e9",
    borderRadius: "12px",
    marginBottom: "24px",
    textAlign: "left",
  },
  successBoxIcon: {
    fontSize: "20px",
    flexShrink: 0,
  },
  successBoxContent: {
    flex: 1,
  },
  successBoxTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#2e7d32",
    marginBottom: "8px",
  },
  paymentIdContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#ffffff",
    padding: "8px 12px",
    borderRadius: "8px",
    marginBottom: "8px",
    flexWrap: "wrap",
  },
  paymentIdLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#2e7d32",
  },
  paymentIdValue: {
    fontSize: "13px",
    fontFamily: "monospace",
    color: "#1a2c3e",
    wordBreak: "break-all",
    flex: 1,
  },
  copyBtn: {
    padding: "4px 8px",
    backgroundColor: "#e8f5e9",
    border: "1px solid #c8e6c9",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
  },
  successBoxText: {
    fontSize: "12px",
    color: "#2e7d32",
    lineHeight: 1.5,
  },
  infoBox: {
    display: "flex",
    gap: "12px",
    padding: "16px",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    borderLeft: "4px solid #1e6f5c",
    marginBottom: "24px",
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
  quickActions: {
    borderTop: "1px solid #eef2f6",
    paddingTop: "20px",
  },
  quickActionsTitle: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#5e7a93",
    marginBottom: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  quickActionsButtons: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  quickActionBtn: {
    padding: "8px 16px",
    backgroundColor: "#ffffff",
    border: "1.5px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#1e6f5c",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
};

// Add global styles for hover effects and animations, and remove parent layout constraints
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(30, 111, 92, 0.2);
  }
  
  .quick-action-btn:hover {
    background-color: #f8fafc;
    border-color: #1e6f5c;
    transform: translateY(-1px);
  }
  
  .copy-btn:hover {
    background-color: #c8e6c9;
    transform: scale(1.05);
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
  [class*="Layout"],
  [class*="dashboard"],
  [class*="Dashboard"] {
    display: none !important;
  }
`;

if (typeof document !== "undefined") {
  document.head.appendChild(styleSheet);
}