import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { register, saveSession, googleLogin, clearSession } from "../../api/auth";
import healthcareBg from "../../assets/images/healthcare4.jpg";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "PATIENT",
  });
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [strength, setStrength] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showDoctorToast, setShowDoctorToast] = useState(false);
  const [doctorToastMessage, setDoctorToastMessage] = useState("");

  // Password strength validation function
  const isStrongPassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  // Password strength checker for live UI
  const checkPasswordStrength = (password) => {
    if (!password) return "";
    
    let score = 0;

    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;

    if (score <= 2) return "Weak";
    if (score <= 4) return "Medium";
    return "Strong";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Check strength when typing password
    if (name === "password") {
      setStrength(checkPasswordStrength(value));
    }
  };

  const handleCloseDoctorToast = () => {
    setShowDoctorToast(false);
    navigate("/login");
  };

  const goByRoleAfterRegister = (data) => {
    // PATIENT goes to home page
    if (data.role === "PATIENT") {
      navigate("/patient/home");
      return;
    }

    if (data.role === "ADMIN") {
      navigate("/admin");
      return;
    }

    // DOCTOR must wait for admin verification
    if (data.role === "DOCTOR" && !data.doctorVerified) {
      clearSession();
      setDoctorToastMessage(
        "Doctor account created successfully. Please wait until an admin verifies your account before logging in."
      );
      setShowDoctorToast(true);
      return;
    }

    // fallback
    if (data.role === "DOCTOR") navigate("/doctor");
    else navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!agreeTerms) {
      setError("Please agree to the Terms & Conditions");
      return;
    }

    // Check password match
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Check password strength
    if (!isStrongPassword(form.password)) {
      setError(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character (@$!%*?&)"
      );
      return;
    }

    try {
      setLoading(true);
      
      // Remove confirmPassword before sending
      //eslint-disable-next-line
      const { confirmPassword, ...dataToSend } = form;
      
      const data = await register(dataToSend);
      saveSession(data);
      goByRoleAfterRegister(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Register failed");
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
      setError(err.response?.data?.message || "Google signup failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google signup failed");
  };

  useEffect(() => {
    const styleId = "register-page-styles";

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

        input:focus, select:focus {
          border-color: rgba(30, 111, 92, 0.8) !important;
          box-shadow: 0 0 0 3px rgba(30, 111, 92, 0.2) !important;
          outline: none;
        }

        button:hover:not(:disabled) {
          opacity: 0.9 !important;
          transform: translateY(-1px);
        }

        .role-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.2);
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
          {/* Logo/Brand Section */}
          <div style={styles.brandSection}>
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
          </div>

          <h2 style={styles.heading}>Create Account</h2>
          <p style={styles.sub}>
            Join our platform to book appointments or manage your medical practice
          </p>

          {error && (
            <div style={styles.error}>
              <span style={styles.messageIcon}>⚠️</span>
              <span>{error}</span>
              <button onClick={() => setError("")} style={styles.closeBtn}>×</button>
            </div>
          )}

          {/* Doctor Registration Toast */}
          {showDoctorToast && (
            <div style={styles.toastOverlay}>
              <div style={styles.toastBox}>
                <div style={styles.toastHeader}>
                  <span style={styles.toastIcon}>✅</span>
                  <span style={styles.toastTitle}>Registration Successful</span>
                </div>

                <p style={styles.toastMessage}>{doctorToastMessage}</p>

                <button onClick={handleCloseDoctorToast} style={styles.toastButton}>
                  OK
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>👤</span>
                Full Name
              </label>
              <input
                style={styles.input}
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>📧</span>
                Email Address
              </label>
              <input
                style={styles.input}
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>📞</span>
                Phone Number
              </label>
              <input
                style={styles.input}
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+94XXXXXXXXX"
              />
            </div>

            {/* Password Field with Strength Indicator */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>🔒</span>
                Password
              </label>
              <div style={styles.passwordWrapper}>
                <input
                  style={styles.passwordInput}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  required
                />
                <button
                  type="button"
                  style={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              
              {/* Password Requirements Hint */}
              <p style={styles.passwordHint}>
                Password must include uppercase, lowercase, number, and special character (@$!%*?&)
              </p>

              {/* Live Password Strength Indicator */}
              {form.password && (
                <div style={styles.strengthContainer}>
                  <div
                    style={{
                      ...styles.strengthBar,
                      background:
                        strength === "Weak"
                          ? "#ef4444"
                          : strength === "Medium"
                          ? "#f59e0b"
                          : "#1e6f5c",
                      width:
                        strength === "Weak"
                          ? "33%"
                          : strength === "Medium"
                          ? "66%"
                          : "100%",
                    }}
                  ></div>
                  <p style={styles.strengthText}>
                    Strength: <strong style={{ color: 
                      strength === "Weak" ? "#ef4444" : 
                      strength === "Medium" ? "#f59e0b" : 
                      "#1e6f5c"
                    }}>{strength}</strong>
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>✓</span>
                Confirm Password
              </label>
              <div style={styles.passwordWrapper}>
                <input
                  style={styles.passwordInput}
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  style={styles.passwordToggle}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>

              {/* Live Password Match Indicator */}
              {form.confirmPassword && (
                <p style={{
                  ...styles.matchIndicator,
                  color: form.password === form.confirmPassword ? "#1e6f5c" : "#ef4444"
                }}>
                  {form.password === form.confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                </p>
              )}
            </div>

            {/* Role Selection */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>🎭</span>
                I want to join as a
              </label>
              <div style={styles.roleCards}>
                <div
                  style={{
                    ...styles.roleCard,
                    ...(form.role === "PATIENT" && styles.roleCardActive),
                  }}
                  onClick={() => setForm({ ...form, role: "PATIENT" })}
                >
                  <span style={styles.roleIcon}>👨‍⚕️</span>
                  <div>
                    <strong>Patient</strong>
                    <p style={styles.roleDesc}>Book appointments with doctors</p>
                  </div>
                </div>
                <div
                  style={{
                    ...styles.roleCard,
                    ...(form.role === "DOCTOR" && styles.roleCardActive),
                  }}
                  onClick={() => setForm({ ...form, role: "DOCTOR" })}
                >
                  <span style={styles.roleIcon}>👩‍⚕️</span>
                  <div>
                    <strong>Doctor</strong>
                    <p style={styles.roleDesc}>Manage patients and appointments</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div style={styles.termsGroup}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  style={styles.checkbox}
                />
                <span>
                  I agree to the <Link to="/terms" style={styles.termsLink}>Terms & Conditions</Link> and{" "}
                  <Link to="/privacy" style={styles.termsLink}>Privacy Policy</Link>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? (
                <span style={styles.btnContent}>
                  <span style={styles.spinner}></span>
                  Creating account...
                </span>
              ) : (
                <span style={styles.btnContent}>
                  <span>🚀</span>
                  Create Account
                </span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={styles.divider}>
            <span style={styles.dividerLine}></span>
            <span style={styles.dividerText}>or continue with</span>
            <span style={styles.dividerLine}></span>
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

          <div style={styles.loginSection}>
            <Link to="/login" style={styles.loginLink}>
              Already have an account? Sign In
            </Link>
            <p style={styles.loginText}>
              Welcome back! Login to continue your healthcare journey
            </p>
          </div>

          {/* Medical Benefits Info */}
          <div style={styles.benefitsInfo}>
            <div style={styles.benefitsHeader}>
              <span style={styles.benefitsIcon}>🏥</span>
              <span style={styles.benefitsTitle}>Why Choose MediBook?</span>
            </div>
            <div style={styles.benefitsGrid}>
              <div style={styles.benefitsPoint}>
                <span>✓</span>
                <span>Easy appointment booking</span>
              </div>
              <div style={styles.benefitsPoint}>
                <span>✓</span>
                <span>Secure medical records</span>
              </div>
              <div style={styles.benefitsPoint}>
                <span>✓</span>
                <span>24/7 doctor support</span>
              </div>
              <div style={styles.benefitsPoint}>
                <span>✓</span>
                <span>HIPAA compliant</span>
              </div>
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
  
  // Background image
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
  
  // Glass morphism card - TRUE GLASS EFFECT
  card: {
    width: "100%",
    maxWidth: "560px",
    background: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderRadius: "24px",
    padding: "40px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2)",
    animation: "slideUp 0.5s ease-out",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },
  
  // Updated brand section
  brandSection: {
    textAlign: "center",
    marginBottom: "32px",
  },
  
  brand: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "0",
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
  
  heading: {
    fontSize: "28px",
    fontWeight: "700",
    color: "white",
    margin: "0 0 8px 0",
    textAlign: "center",
    textShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  
  sub: {
    fontSize: "14px",
    color: "rgba(255, 255, 255, 0.9)",
    margin: "0 0 28px 0",
    textAlign: "center",
    textShadow: "0 1px 2px rgba(0,0,0,0.1)",
  },
  
  error: {
    background: "rgba(254, 226, 226, 0.95)",
    color: "#991b1b",
    padding: "12px 16px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
    borderLeft: "3px solid #ef4444",
    backdropFilter: "blur(5px)",
  },
  
  messageIcon: {
    fontSize: "18px",
  },
  
  closeBtn: {
    marginLeft: "auto",
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    color: "#991b1b",
    padding: "0 4px",
  },
  
  formGroup: {
    marginBottom: "20px",
  },
  
  label: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: "600",
    marginBottom: "8px",
    color: "white",
    fontSize: "14px",
    textShadow: "0 1px 2px rgba(0,0,0,0.1)",
  },
  
  labelIcon: {
    fontSize: "16px",
  },
  
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    fontSize: "14px",
    transition: "border-color 0.2s, box-shadow 0.2s",
    outline: "none",
    boxSizing: "border-box",
    background: "rgba(255, 255, 255, 0.9)",
    color: "#1a2c3e",
    backdropFilter: "blur(5px)",
  },
  
  passwordWrapper: {
    position: "relative",
  },
  
  passwordInput: {
    width: "100%",
    padding: "12px 14px",
    paddingRight: "44px",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    fontSize: "14px",
    transition: "border-color 0.2s, box-shadow 0.2s",
    outline: "none",
    boxSizing: "border-box",
    background: "rgba(255, 255, 255, 0.9)",
    color: "#1a2c3e",
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
  
  passwordHint: {
    fontSize: "11px",
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: "6px",
  },
  
  strengthContainer: {
    marginTop: "8px",
  },
  
  strengthBar: {
    height: "4px",
    borderRadius: "2px",
    transition: "width 0.3s ease",
    background: "rgba(255,255,255,0.3)",
  },
  
  strengthText: {
    fontSize: "11px",
    marginTop: "4px",
    color: "rgba(255, 255, 255, 0.8)",
  },
  
  matchIndicator: {
    fontSize: "11px",
    marginTop: "6px",
    color: "rgba(255, 255, 255, 0.8)",
  },
  
  roleCards: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  
  roleCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s",
    background: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(5px)",
    color: "white",
  },
  
  roleCardActive: {
    borderColor: "#1e6f5c",
    background: "rgba(30, 111, 92, 0.3)",
    boxShadow: "0 0 0 1px rgba(30,111,92,0.5)",
  },
  
  roleIcon: {
    fontSize: "28px",
  },
  
  roleDesc: {
    fontSize: "11px",
    color: "rgba(255, 255, 255, 0.8)",
    margin: "4px 0 0 0",
  },
  
  termsGroup: {
    marginBottom: "24px",
  },
  
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "13px",
    color: "white",
    cursor: "pointer",
    textShadow: "0 1px 2px rgba(0,0,0,0.1)",
  },
  
  checkbox: {
    width: "16px",
    height: "16px",
    cursor: "pointer",
    accentColor: "#1e6f5c",
  },
  
  termsLink: {
    color: "#e0f2fe",
    textDecoration: "none",
    fontWeight: "600",
  },
  
  button: {
    width: "100%",
    background: "linear-gradient(135deg, rgba(30, 111, 92, 0.9) 0%, rgba(40, 150, 114, 0.9) 100%)",
    color: "white",
    border: "1px solid rgba(255,255,255,0.3)",
    padding: "14px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "opacity 0.2s",
    backdropFilter: "blur(5px)",
  },
  
  btnContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  
  spinner: {
    width: "18px",
    height: "18px",
    border: "2px solid white",
    borderTopColor: "transparent",
    borderRadius: "50%",
    animation: "spin 0.6s linear infinite",
  },
  
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    margin: "24px 0 20px 0",
  },
  
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "rgba(255, 255, 255, 0.3)",
  },
  
  dividerText: {
    fontSize: "12px",
    color: "rgba(255, 255, 255, 0.8)",
  },
  
  googleSection: {
    marginBottom: "20px",
  },
  
  googleRoleHint: {
    fontSize: "13px",
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  
  roleBadge: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "999px",
    backgroundColor: "rgba(30, 111, 92, 0.8)",
    color: "white",
    fontWeight: "600",
    fontSize: "12px",
    backdropFilter: "blur(5px)",
  },
  
  googleButtonWrap: {
    display: "flex",
    justifyContent: "center",
  },
  
  googleLoadingText: {
    marginTop: "10px",
    textAlign: "center",
    fontSize: "13px",
    color: "rgba(255, 255, 255, 0.9)",
  },
  
  loginSection: {
    textAlign: "center",
    marginTop: "20px",
  },
  
  loginLink: {
    display: "inline-block",
    padding: "12px 24px",
    background: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(5px)",
    color: "white",
    textDecoration: "none",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "600",
    transition: "background 0.2s",
    marginBottom: "12px",
    border: "1px solid rgba(255,255,255,0.3)",
  },
  
  loginText: {
    fontSize: "12px",
    color: "rgba(255, 255, 255, 0.8)",
    margin: 0,
  },
  
  benefitsInfo: {
    marginTop: "24px",
    padding: "16px",
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(5px)",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  
  benefitsHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px",
  },
  
  benefitsIcon: {
    fontSize: "18px",
  },
  
  benefitsTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "white",
  },
  
  benefitsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "8px",
  },
  
  benefitsPoint: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    color: "rgba(255, 255, 255, 0.9)",
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

// Add placeholder text color for inputs
const inputStyle = document.createElement("style");
inputStyle.textContent = `
  input::placeholder, select::placeholder {
    color: #9aaebf !important;
  }
  
  input, select {
    color: #1a2c3e !important;
    background: rgba(255, 255, 255, 0.9) !important;
  }
  
  input:focus, select:focus {
    color: #1a2c3e !important;
  }
`;
document.head.appendChild(inputStyle);