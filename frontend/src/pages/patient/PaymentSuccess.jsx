import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { API, authHeaders } from "../../api/client";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("Confirming payment...");
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const paymentId = searchParams.get("paymentId");
    const sessionId = searchParams.get("session_id");

    const confirm = async () => {
      try {
        await axios.post(
          `${API.payment}/payments/confirm-stripe-success`,
          { paymentId, sessionId },
          { headers: authHeaders() }
        );
        setStatus("Payment confirmed successfully!");
        setIsSuccess(true);
      } catch (err) {
        console.error(err);
        const errorMsg = err.response?.data?.message || "Payment confirmation failed";
        setStatus(errorMsg);
        setErrorMessage(errorMsg);
        setIsSuccess(false);
      }
    };

    if (paymentId && sessionId) {
      confirm();
    } else {
      setStatus("Missing payment confirmation details");
      setErrorMessage("Required payment information is missing");
      setIsSuccess(false);
    }
  }, [searchParams]);

  // Show clean loading state while confirming
  if (status === "Confirming payment..." && !isSuccess && !errorMessage) {
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.card}>
            <div style={styles.loadingIcon}>
              <div style={styles.spinner}></div>
            </div>
            <h1 style={styles.loadingTitle}>Confirming Payment</h1>
            <p style={styles.loadingMessage}>
              Please wait while we verify your payment with Stripe...
            </p>
            <div style={styles.loadingHint}>
              <span style={styles.hintIcon}>⏳</span>
              <span>This should only take a few seconds</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show result state (success or failure)
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.card}>
          <div style={isSuccess ? styles.successIcon : styles.errorIcon}>
            {isSuccess ? "✓" : "✗"}
          </div>

          <h1 style={isSuccess ? styles.successTitle : styles.errorTitle}>
            {isSuccess ? "Payment Successful!" : "Payment Failed"}
          </h1>

          <p style={styles.statusMessage}>{status}</p>

          {errorMessage && !isSuccess && (
            <div style={styles.errorBox}>
              <div style={styles.errorBoxIcon}>⚠️</div>
              <div style={styles.errorBoxContent}>
                <div style={styles.errorBoxTitle}>Error Details</div>
                <div style={styles.errorBoxText}>{errorMessage}</div>
              </div>
            </div>
          )}

          {isSuccess && (
            <div style={styles.successBox}>
              <div style={styles.successBoxIcon}>✅</div>
              <div style={styles.successBoxContent}>
                <div style={styles.successBoxTitle}>Payment Confirmed</div>
                <div style={styles.successBoxText}>
                  Your payment has been successfully processed and recorded.
                </div>
              </div>
            </div>
          )}

          <div style={styles.actionButtons}>
            <Link to="/patient/appointments" style={styles.primaryButton}>
              <span>📅</span>
              Go to My Appointments
            </Link>
            <Link to="/" style={styles.secondaryButton}>
              <span>🏠</span>
              Back to Home
            </Link>
          </div>

          <div style={styles.helpText}>
            <span style={styles.helpIcon}>ℹ️</span>
            <span>
              If you have any questions about your payment, please contact our support team.
            </span>
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
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
    maxWidth: "500px",
    width: "100%",
    padding: "24px",
    boxSizing: "border-box",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    padding: "48px 32px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
    textAlign: "center",
  },
  loadingIcon: {
    width: "80px",
    height: "80px",
    backgroundColor: "#e3f2fd",
    borderRadius: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 24px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #e0e0e0",
    borderTop: "3px solid #1e6f5c",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingTitle: {
    fontSize: "28px",
    fontWeight: "600",
    color: "#1e6f5c",
    margin: "0 0 16px 0",
    letterSpacing: "-0.5px",
  },
  loadingMessage: {
    fontSize: "16px",
    color: "#5e7a93",
    margin: "0 0 24px 0",
    lineHeight: 1.5,
  },
  loadingHint: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    fontSize: "13px",
    color: "#5e7a93",
  },
  hintIcon: {
    fontSize: "16px",
  },
  successIcon: {
    width: "80px",
    height: "80px",
    backgroundColor: "#e8f5e9",
    borderRadius: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 24px",
    fontSize: "40px",
    fontWeight: "600",
    color: "#2e7d32",
  },
  errorIcon: {
    width: "80px",
    height: "80px",
    backgroundColor: "#ffebee",
    borderRadius: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 24px",
    fontSize: "40px",
    fontWeight: "600",
    color: "#c62828",
  },
  successTitle: {
    fontSize: "28px",
    fontWeight: "600",
    color: "#2e7d32",
    margin: "0 0 16px 0",
    letterSpacing: "-0.5px",
  },
  errorTitle: {
    fontSize: "28px",
    fontWeight: "600",
    color: "#c62828",
    margin: "0 0 16px 0",
    letterSpacing: "-0.5px",
  },
  statusMessage: {
    fontSize: "16px",
    color: "#5e7a93",
    margin: "0 0 24px 0",
    lineHeight: 1.5,
  },
  errorBox: {
    display: "flex",
    gap: "12px",
    padding: "16px",
    backgroundColor: "#ffebee",
    borderRadius: "12px",
    marginBottom: "32px",
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
    marginBottom: "32px",
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
    marginBottom: "4px",
  },
  successBoxText: {
    fontSize: "12px",
    color: "#2e7d32",
    lineHeight: 1.5,
  },
  actionButtons: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  primaryButton: {
    flex: 1,
    padding: "12px 24px",
    backgroundColor: "#1e6f5c",
    color: "#ffffff",
    textDecoration: "none",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    minWidth: "180px",
    cursor: "pointer",
  },
  secondaryButton: {
    flex: 1,
    padding: "12px 24px",
    backgroundColor: "#ffffff",
    color: "#1e6f5c",
    textDecoration: "none",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "600",
    border: "1.5px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    minWidth: "180px",
    cursor: "pointer",
  },
  helpText: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    fontSize: "12px",
    color: "#5e7a93",
  },
  helpIcon: {
    fontSize: "14px",
  },
};

// Add global styles for animations
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    div {
      animation: fadeIn 0.4s ease-out;
    }
    
    a:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    body {
      margin: 0;
      padding: 0;
      overflow-x: hidden;
    }
  `;
  document.head.appendChild(styleSheet);
}