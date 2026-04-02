import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { register, saveSession, googleLogin, clearSession } from "../../api/auth";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "PATIENT",
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const goByRoleAfterRegister = (data) => {
    // PATIENT and ADMIN can enter immediately
    if (data.role === "PATIENT") {
      navigate("/patient");
      return;
    }

    if (data.role === "ADMIN") {
      navigate("/admin");
      return;
    }

    // DOCTOR must wait for admin verification
    if (data.role === "DOCTOR" && !data.doctorVerified) {
      clearSession();
      alert("Doctor account created successfully. Please wait until an admin verifies your account before logging in.");
      navigate("/login");
      return;
    }

    // fallback
    if (data.role === "DOCTOR") navigate("/doctor");
    else navigate("/");
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const data = await register(form);
      saveSession(data);
      goByRoleAfterRegister(data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setGoogleLoading(true);

      const data = await googleLogin({
        credential: credentialResponse.credential,
        role: form.role,
      });

      saveSession(data);
      goByRoleAfterRegister(data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Google signup failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    alert("Google signup failed");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.brand}>
            <div style={styles.brandIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15 8H22L16 12L19 18L12 14L5 18L8 12L2 8H9L12 2Z" fill="currentColor"/>
              </svg>
            </div>
            <div style={styles.brandText}>
              Medi<span style={styles.brandSpan}>Book</span>
            </div>
          </div>
          <h1 style={styles.title}>Create account</h1>
          <p style={styles.subtitle}>Join our medical community</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full name</label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Dr. Sarah Johnson"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email address</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="sarah@medical.com"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Phone number</label>
            <input
              name="phone"
              type="text"
              value={form.phone}
              onChange={handleChange}
              style={styles.input}
              placeholder="+94XXXXXXXXX"
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
              placeholder="Create a strong password"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Account type</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="PATIENT">Patient - Book appointments</option>
              <option value="DOCTOR">Doctor - Manage patients</option>
              <option value="ADMIN">Administrator - System management</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
          >
            {loading ? (
              <>
                <span style={styles.spinner}></span>
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={styles.dividerWrap}>
          <div style={styles.divider}></div>
          <span style={styles.dividerText}>or continue with</span>
          <div style={styles.divider}></div>
        </div>

        {/* Google Register */}
        <div style={styles.googleSection}>
          <div style={styles.googleRoleHint}>
            <span>Sign up with Google as:</span>
            <span style={styles.roleBadge}>{form.role}</span>
          </div>

          <div style={styles.googleButtonWrap}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_blue"
              size="large"
              text="continue_with"
              shape="pill"
              width="100%"
            />
          </div>

          {googleLoading && (
            <div style={styles.googleLoadingText}>Signing up with Google...</div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.registerText}>
            Already have an account?
            <Link to="/login" style={styles.registerLink}> Sign in</Link>
          </p>
          <div style={styles.medicalBadge}>
            <span>🔒 Secure registration</span>
            <span>⚕️ HIPAA compliant</span>
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
    maxWidth: "480px",
    width: "90%",
    backgroundColor: "#ffffff",
    borderRadius: "32px",
    boxShadow: "0 20px 35px -12px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.02)",
    overflow: "hidden",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
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
    fontSize: "20px",
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
    margin: "0 0 24px 0",
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
    transition: "all 0.2s ease",
    outline: "none",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "15px",
    fontFamily: "inherit",
    border: "1.5px solid #e2e8f0",
    borderRadius: "16px",
    backgroundColor: "#ffffff",
    color: "#1a2c3e",
    transition: "all 0.2s ease",
    outline: "none",
    cursor: "pointer",
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
    transition: "all 0.2s ease",
    marginTop: "8px",
    marginBottom: "24px",
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
    padding: "0 32px 20px 32px",
  },
  divider: {
    flex: 1,
    height: "1px",
    backgroundColor: "#e2e8f0",
  },
  dividerText: {
    fontSize: "12px",
    color: "#8aa0b3",
    whiteSpace: "nowrap",
  },
  googleSection: {
    padding: "0 32px 20px 32px",
  },
  googleRoleHint: {
    fontSize: "13px",
    color: "#5e7a93",
    marginBottom: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  roleBadge: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "999px",
    backgroundColor: "#e8f5e9",
    color: "#1e6f5c",
    fontWeight: "600",
    fontSize: "12px",
  },
  googleButtonWrap: {
    display: "flex",
    justifyContent: "center",
  },
  googleLoadingText: {
    marginTop: "10px",
    textAlign: "center",
    fontSize: "13px",
    color: "#5e7a93",
  },
  footer: {
    padding: "0 32px 32px 32px",
    borderTop: "1px solid #eef2f6",
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
    transition: "color 0.2s",
  },
  medicalBadge: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    fontSize: "12px",
    color: "#8aa0b3",
    flexWrap: "wrap",
  },
};

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
  
  button:hover:not(:disabled) {
    background-color: #155a4b !important;
    transform: translateY(-1px);
    box-shadow: 0 8px 16px -6px rgba(30, 111, 92, 0.25);
  }
  
  a:hover {
    color: #155a4b !important;
    text-decoration: underline;
  }
  
  select:hover {
    border-color: #cbd5e1;
  }
`;

if (typeof document !== "undefined") {
  document.head.appendChild(styleSheet);
}