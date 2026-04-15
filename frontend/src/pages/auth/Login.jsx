import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { login, googleLogin, saveSession } from "../../api/auth";
import healthcareBg from "../../assets/images/healthcare4.jpg";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showUnverifiedToast, setShowUnverifiedToast] = useState(false);
  const [unverifiedMessage, setUnverifiedMessage] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCloseUnverifiedToast = () => {
    setShowUnverifiedToast(false);
  };

  const redirectByRole = (data) => {
    if (data.role === "PATIENT") navigate("/patient/home");
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
      const errorMessage = err.response?.data?.message || "Login failed";
      
      // Check if error is about unverified doctor
      if (errorMessage.toLowerCase().includes("doctor not verified")) {
        setUnverifiedMessage(errorMessage);
        setShowUnverifiedToast(true);
      } else {
        alert(errorMessage);
      }
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

      const data = await googleLogin({
        credential: credentialResponse.credential,
      });
      saveSession(data);
      redirectByRole(data);
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || "Google login failed";
      
      // Check if error is about unverified doctor
      if (errorMessage.toLowerCase().includes("doctor not verified")) {
        setUnverifiedMessage(errorMessage);
        setShowUnverifiedToast(true);
      } else {
        alert(errorMessage);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    alert("Google login failed");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    const styleId = "login-page-styles";

    if (!document.getElementById(styleId)) {
      const styleSheet = document.createElement("style");
      styleSheet.id = styleId;
      styleSheet.textContent = `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        input:focus {
          border-color: rgba(30, 111, 92, 0.8) !important;
          box-shadow: 0 0 0 3px rgba(30, 111, 92, 0.2) !important;
          outline: none;
        }

        button:hover:not(:disabled) {
          opacity: 0.9 !important;
          transform: translateY(-1px);
        }

        input::placeholder {
          color: #9aaebf !important;
        }
        
        input {
          color: #1a2c3e !important;
          background: rgba(255, 255, 255, 0.9) !important;
        }
        
        input:focus {
          color: #1a2c3e !important;
        }
      `;
      document.head.appendChild(styleSheet);
    }
  }, []);

  return (
    <div style={styles.page}>
      {/* Background Image */}
      <div style={styles.backgroundImage}></div>
      
      <div style={styles.wrapper}>
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

          {/* Unverified Doctor Toast */}
          {showUnverifiedToast && (
            <div style={styles.toastOverlay}>
              <div style={styles.toastBox}>
                <div style={styles.toastHeader}>
                  <span style={styles.toastIcon}>⚠️</span>
                  <span style={styles.toastTitle}>Account Not Verified</span>
                </div>

                <p style={styles.toastMessage}>{unverifiedMessage}</p>

                <button onClick={handleCloseUnverifiedToast} style={styles.toastButton}>
                  OK
                </button>
              </div>
            </div>
          )}

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
              <div style={styles.passwordWrapper}>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  required
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  style={styles.passwordToggle}
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
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
                width="100%"
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
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    position: "relative",
    overflow: "auto",
  },
  
  // Background image (same as register)
  backgroundImage: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `url(${healthcareBg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
    zIndex: 0,
  },
  
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    position: "relative",
    zIndex: 1,
  },
  
  // Glass morphism card (same as register)
  card: {
    maxWidth: "440px",
    width: "90%",
    background: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(12px)",
    borderRadius: "32px",
    padding: "0",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2)",
    animation: "slideUp 0.5s ease-out",
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
    backgroundColor: "rgba(30, 111, 92, 0.9)",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
  },
  
  brandText: {
    fontSize: "24px",
    fontWeight: "600",
    background: "linear-gradient(135deg, #ffffff 0%, #e0f2fe 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "-0.3px",
  },
  
  brandSpan: {
    fontWeight: "400",
  },
  
  title: {
    fontSize: "32px",
    fontWeight: "600",
    color: "white",
    margin: "0 0 8px 0",
    letterSpacing: "-0.5px",
    textShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  
  subtitle: {
    fontSize: "15px",
    color: "rgba(255, 255, 255, 0.9)",
    margin: "0 0 32px 0",
    lineHeight: "1.4",
    textShadow: "0 1px 2px rgba(0,0,0,0.1)",
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
    color: "white",
    marginBottom: "8px",
    textShadow: "0 1px 2px rgba(0,0,0,0.1)",
  },
  
  input: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "15px",
    fontFamily: "inherit",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    borderRadius: "16px",
    background: "rgba(255, 255, 255, 0.9)",
    color: "#1a2c3e",
    outline: "none",
    boxSizing: "border-box",
    backdropFilter: "blur(5px)",
  },
  
  passwordWrapper: {
    position: "relative",
  },
  
  passwordInput: {
    width: "100%",
    padding: "12px 48px 12px 16px",
    fontSize: "15px",
    fontFamily: "inherit",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    borderRadius: "16px",
    background: "rgba(255, 255, 255, 0.9)",
    color: "#1a2c3e",
    outline: "none",
    boxSizing: "border-box",
    backdropFilter: "blur(5px)",
  },
  
  passwordToggle: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
    padding: "4px",
    color: "#5e7a93",
  },
  
  button: {
    width: "100%",
    padding: "14px 24px",
    fontSize: "16px",
    fontWeight: "600",
    fontFamily: "inherit",
    color: "#ffffff",
    background: "linear-gradient(135deg, rgba(30, 111, 92, 0.9) 0%, rgba(40, 150, 114, 0.9) 100%)",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: "24px",
    cursor: "pointer",
    marginTop: "8px",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    backdropFilter: "blur(5px)",
  },
  
  googleLoadingBtn: {
    width: "100%",
    padding: "14px 24px",
    fontSize: "16px",
    fontWeight: "600",
    fontFamily: "inherit",
    color: "#ffffff",
    backgroundColor: "#4285F4",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  
  buttonDisabled: {
    background: "rgba(30, 111, 92, 0.5)",
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
    background: "rgba(255, 255, 255, 0.3)",
  },
  
  dividerText: {
    fontSize: "13px",
    color: "rgba(255, 255, 255, 0.8)",
  },
  
  googleWrap: {
    padding: "0 32px 8px 32px",
    display: "flex",
    justifyContent: "center",
  },
  
  footer: {
    padding: "0 32px 32px 32px",
    borderTop: "1px solid rgba(255, 255, 255, 0.2)",
    marginTop: "12px",
  },
  
  registerText: {
    textAlign: "center",
    fontSize: "14px",
    color: "rgba(255, 255, 255, 0.9)",
    margin: "20px 0 16px 0",
    textShadow: "0 1px 2px rgba(0,0,0,0.1)",
  },
  
  registerLink: {
    color: "#e0f2fe",
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
    color: "rgba(255, 255, 255, 0.8)",
  },
  
  toastOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "20px",
  },
  
  toastBox: {
    width: "100%",
    maxWidth: "420px",
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
    textAlign: "center",
    animation: "slideUp 0.3s ease-out",
  },
  
  toastHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "14px",
  },
  
  toastIcon: {
    fontSize: "24px",
  },
  
  toastTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1a2c3e",
  },
  
  toastMessage: {
    fontSize: "14px",
    color: "#475569",
    lineHeight: "1.6",
    margin: "0 0 20px 0",
  },
  
  toastButton: {
    background: "linear-gradient(135deg, #1e6f5c 0%, #289672 100%)",
    color: "#fff",
    border: "none",
    padding: "12px 28px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
};