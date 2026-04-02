import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { login, googleLogin, saveSession } from "../../api/auth";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const redirectByRole = (data) => {
    if (data.role === "PATIENT") navigate("/patient");
    else if (data.role === "DOCTOR") navigate("/doctor");
    else if (data.role === "ADMIN") navigate("/admin");
    else navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const data = await login(form);
      saveSession(data);
      redirectByRole(data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      if (!credentialResponse?.credential) {
        alert("Google login failed");
        return;
      }

      setGoogleLoading(true);

      const data = await googleLogin(credentialResponse.credential);
      saveSession(data);
      redirectByRole(data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Google login failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    alert("Google login failed");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.brand}>
            <div style={styles.brandIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15 8H22L16 12L19 18L12 14L5 18L8 12L2 8H9L12 2Z" fill="currentColor" />
              </svg>
            </div>
            <div style={styles.brandText}>
              Medi<span style={styles.brandSpan}>Book</span>
            </div>
          </div>
          <h1 style={styles.title}>Welcome back</h1>
          <p style={styles.subtitle}>Sign in to manage appointments</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email address</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="doctor@example.com"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            style={loading || googleLoading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
          >
            {loading ? (
              <>
                <span style={styles.spinner}></span>
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <div style={styles.dividerWrap}>
          <div style={styles.divider}></div>
          <span style={styles.dividerText}>or</span>
          <div style={styles.divider}></div>
        </div>

        <div style={styles.googleWrap}>
          {googleLoading ? (
            <button disabled style={{ ...styles.googleLoadingBtn, ...styles.buttonDisabled }}>
              <span style={styles.spinner}></span>
              Signing in with Google...
            </button>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_blue"
              size="large"
              text="continue_with"
              shape="pill"
              width="376"
            />
          )}
        </div>

        <div style={styles.footer}>
          <p style={styles.registerText}>
            Don't have an account?
            <Link to="/register" style={styles.registerLink}> Create account</Link>
          </p>
          <div style={styles.medicalBadge}>
            <span>🔒 HIPAA Compliant</span>
            <span>⚕️ Secure Portal</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100vw",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #f5f7fa 0%, #e9eef3 100%)",
    fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    margin: 0,
    padding: 0,
    overflow: "auto",
  },
  card: {
    maxWidth: "440px",
    width: "90%",
    backgroundColor: "#ffffff",
    borderRadius: "32px",
    boxShadow: "0 20px 35px -12px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.02)",
    overflow: "hidden",
    margin: "20px",
  },
  header: {
    padding: "40px 32px 0 32px",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "32px",
  },
  brandIcon: {
    width: "40px",
    height: "40px",
    backgroundColor: "#1e6f5c",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
  },
  brandText: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#1a2c3e",
    letterSpacing: "-0.3px",
  },
  brandSpan: {
    fontWeight: "400",
    color: "#1e6f5c",
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
    margin: "0 0 32px 0",
    lineHeight: "1.4",
  },
  form: {
    padding: "0 32px",
  },
  inputGroup: {
    marginBottom: "24px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "500",
    color: "#2c3e50",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "15px",
    fontFamily: "inherit",
    border: "1.5px solid #e2e8f0",
    borderRadius: "16px",
    backgroundColor: "#ffffff",
    color: "#1a2c3e",
    outline: "none",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "14px 24px",
    fontSize: "16px",
    fontWeight: "600",
    fontFamily: "inherit",
    color: "#ffffff",
    backgroundColor: "#1e6f5c",
    border: "none",
    borderRadius: "24px",
    cursor: "pointer",
    marginTop: "8px",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  googleLoadingBtn: {
    width: "100%",
    padding: "14px 24px",
    fontSize: "16px",
    fontWeight: "600",
    fontFamily: "inherit",
    color: "#ffffff",
    backgroundColor: "#4285F4",
    border: "none",
    borderRadius: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  buttonDisabled: {
    backgroundColor: "#b8cfc7",
    cursor: "not-allowed",
    opacity: 0.7,
  },
  spinner: {
    display: "inline-block",
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderRadius: "50%",
    borderTopColor: "#ffffff",
    animation: "spin 0.6s linear infinite",
  },
  dividerWrap: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "0 32px",
    marginBottom: "20px",
  },
  divider: {
    flex: 1,
    height: "1px",
    backgroundColor: "#e2e8f0",
  },
  dividerText: {
    fontSize: "13px",
    color: "#8aa0b3",
  },
  googleWrap: {
    padding: "0 32px 8px 32px",
    display: "flex",
    justifyContent: "center",
  },
  footer: {
    padding: "0 32px 32px 32px",
    borderTop: "1px solid #eef2f6",
    marginTop: "12px",
  },
  registerText: {
    textAlign: "center",
    fontSize: "14px",
    color: "#5e7a93",
    margin: "20px 0 16px 0",
  },
  registerLink: {
    color: "#1e6f5c",
    textDecoration: "none",
    fontWeight: "600",
    marginLeft: "4px",
  },
  medicalBadge: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    fontSize: "12px",
    color: "#8aa0b3",
  },
};

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
    background-color: #155a4b !important;
    transform: translateY(-1px);
    box-shadow: 0 8px 16px -6px rgba(30, 111, 92, 0.25);
  }

  a:hover {
    color: #155a4b !important;
    text-decoration: underline;
  }
`;

if (typeof document !== "undefined") {
  document.head.appendChild(styleSheet);
}