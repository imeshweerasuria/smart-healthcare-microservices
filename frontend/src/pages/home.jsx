import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getName } from "../api/auth";

import img1 from "../assets/images/healthcare1.jpg";
import img2 from "../assets/images/healthcare2.jpg";
import img3 from "../assets/images/healthcare3.jpg";

export default function PatientHome() {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [email, setEmail] = useState("");
  const [showSubscribeSuccess, setShowSubscribeSuccess] = useState(false);
  const patientName = getName() || "Patient";

  const carouselImages = [
    {
      url: img1,
      title: "Expert Medical Care",
      description: "Connect with top-rated specialists"
    },
    {
      url: img2,
      title: "Modern Facilities",
      description: "State-of-the-art healthcare technology"
    },
    {
      url: img3,
      title: "Compassionate Care",
      description: "Your health, our priority"
    }
  ];

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".animate-on-scroll");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Auto-slide carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [carouselImages.length]);

  const goToDashboard = () => {
    navigate("/patient");
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setShowSubscribeSuccess(true);
      setEmail("");
      setTimeout(() => setShowSubscribeSuccess(false), 3000);
    }
  };

  const goToAppointments = () => {
    navigate("/patient/appointments");
  };

  return (
    <div style={styles.container}>
      {/* Soft Animated Background */}
      <div style={styles.animatedBg}>
        <div style={styles.gradientBg}></div>
        <div style={styles.floatingShape1}></div>
        <div style={styles.floatingShape2}></div>
        <div style={styles.floatingShape3}></div>
        <div style={styles.floatingShape4}></div>
      </div>

      <nav style={styles.nav}>
        <div style={styles.navContent}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15 8H22L16 12L19 18L12 14L5 18L8 12L2 8H9L12 2Z" fill="currentColor" />
              </svg>
            </div>
            <span style={styles.logoText}>Medi<span style={styles.logoAccent}>Book</span></span>
          </div>
          <div style={styles.navRight}>
            <div style={styles.patientName}>
              <span style={styles.welcomeText}>Welcome Back,</span>
              <span style={styles.nameText}>{patientName}</span>
            </div>
            <button onClick={handleLogout} style={styles.logoutButton}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main style={styles.main}>
        {/* Full Width Immersive Carousel */}
        <div style={styles.heroWrapper}>
          <div style={styles.carouselImageWrapper}>
            <img
              src={carouselImages[currentImageIndex].url}
              alt={carouselImages[currentImageIndex].title}
              style={styles.carouselImage}
            />
            <div style={styles.carouselOverlay}>
              <div style={styles.carouselContent}>
                <h2 style={styles.carouselTitle}>
                  {carouselImages[currentImageIndex].title}
                </h2>
                <p style={styles.carouselDescription}>
                  {carouselImages[currentImageIndex].description}
                </p>
              </div>
            </div>
          </div>
          
          <div style={styles.carouselDots}>
            {carouselImages.map((_, idx) => (
              <button
                key={idx}
                style={{
                  ...styles.dot,
                  ...(idx === currentImageIndex ? styles.activeDot : {}),
                }}
                onClick={() => setCurrentImageIndex(idx)}
              />
            ))}
          </div>
        </div>

        {/* Welcome Section - Glass morphism */}
        <div className="animate-on-scroll" style={styles.welcomeSection}>
          <h1 style={styles.heroTitle}>
            Your health journey
            <span style={styles.heroAccent}> starts here</span>
          </h1>
          <p style={styles.heroDesc}>
            Manage appointments, access medical records, and connect with trusted healthcare providers.
          </p>
          <button onClick={goToDashboard} style={styles.ctaButton}>
            Go to Dashboard
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Stats Section - Glass cards */}
        <div className="animate-on-scroll" style={styles.statsSection}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>👨‍⚕️</div>
            <div style={styles.statNumber}>500+</div>
            <div style={styles.statLabel}>Expert Doctors</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>🏥</div>
            <div style={styles.statNumber}>50+</div>
            <div style={styles.statLabel}>Specialties</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>❤️</div>
            <div style={styles.statNumber}>15k+</div>
            <div style={styles.statLabel}>Happy Patients</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>⭐</div>
            <div style={styles.statNumber}>4.9</div>
            <div style={styles.statLabel}>Patient Rating</div>
          </div>
        </div>

        {/* Quick Actions - Glass cards */}
        <div className="animate-on-scroll" style={styles.quickActions}>
          <h2 style={styles.sectionTitle}>Quick Actions</h2>
          <div style={styles.actionGrid}>
            <div style={styles.actionCard} onClick={goToDashboard}>
              <div style={styles.actionIcon}>📅</div>
              <h3>Book Appointment</h3>
              <p>Schedule your next visit</p>
            </div>
            <div style={styles.actionCard} onClick={goToAppointments}>
              <div style={styles.actionIcon}>📋</div>
              <h3>My Appointments</h3>
              <p>View upcoming visits</p>
            </div>
            <div style={styles.actionCard} onClick={goToDashboard}>
              <div style={styles.actionIcon}>💊</div>
              <h3>Prescriptions</h3>
              <p>Access your medications</p>
            </div>
            <div style={styles.actionCard} onClick={goToDashboard}>
              <div style={styles.actionIcon}>📊</div>
              <h3>Health Records</h3>
              <p>View medical history</p>
            </div>
          </div>
        </div>

        {/* Features - Glass cards */}
        <div className="animate-on-scroll" style={styles.features}>
          <h2 style={styles.sectionTitle}>Why Choose MediBook?</h2>
          <div style={styles.featuresGrid}>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>🔒</div>
              <h3>Secure & Private</h3>
              <p>HIPAA compliant with bank-grade encryption</p>
            </div>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>⚡</div>
              <h3>Instant Access</h3>
              <p>24/7 access to your health information</p>
            </div>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>💬</div>
              <h3>Direct Messaging</h3>
              <p>Chat with your healthcare providers</p>
            </div>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>📱</div>
              <h3>Mobile Friendly</h3>
              <p>Access from any device, anywhere</p>
            </div>
          </div>
        </div>

        {/* Newsletter - Gradient */}
        <div className="animate-on-scroll" style={styles.newsletter}>
          <div style={styles.newsletterContent}>
            <div style={styles.newsletterIcon}>📧</div>
            <h3>Health Tips & Updates</h3>
            <p>Enter your email to Get personalized health insights delivered to your inbox</p>
            <form onSubmit={handleSubscribe} style={styles.newsletterForm}>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.newsletterInput} 
              />
              <button type="submit" style={styles.newsletterButton}>Subscribe</button>
            </form>
            {showSubscribeSuccess && (
              <div style={styles.successMessage}>
                ✓ Successfully subscribed!
              </div>
            )}
          </div>
        </div>

        <footer style={styles.footer}>
          <div style={styles.footerContent}>
            <div style={styles.footerLogo}>
              <div style={styles.logoIconSmall}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15 8H22L16 12L19 18L12 14L5 18L8 12L2 8H9L12 2Z" fill="currentColor" />
                </svg>
              </div>
              <span>MediBook</span>
            </div>
            <div style={styles.footerLinks}>
              <a href="#" style={styles.footerLink}>About Us</a>
              <a href="#" style={styles.footerLink}>Privacy Policy</a>
              <a href="#" style={styles.footerLink}>Terms of Service</a>
              <a href="#" style={styles.footerLink}>Contact</a>
            </div>
            <p style={styles.copyright}>© 2025 MediBook. All rights reserved.</p>
          </div>
        </footer>
      </main>

      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-20px) translateX(15px); }
          66% { transform: translateY(20px) translateX(-15px); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(15px) translateX(-10px); }
          66% { transform: translateY(-15px) translateX(10px); }
        }
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(40px);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .animate-on-scroll.visible {
          opacity: 1;
          transform: translateY(0);
        }
        button:hover {
          transform: translateY(-2px);
          transition: all 0.2s ease;
        }
        button:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    position: "relative",
    overflowX: "hidden",
    fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  },
  animatedBg: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    overflow: "hidden",
  },
  gradientBg: {
    position: "absolute",
    top: "-50%",
    left: "-50%",
    width: "200%",
    height: "200%",
    background: "linear-gradient(135deg, #e0f2fe 0%, #f0fdf4 25%, #dcfce7 50%, #f0fdf4 75%, #e0f2fe 100%)",
    animation: "gradientShift 15s ease infinite",
    backgroundSize: "200% 200%",
  },
  floatingShape1: {
    position: "absolute",
    top: "10%",
    left: "5%",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(30,111,92,0.1) 0%, rgba(30,111,92,0) 70%)",
    animation: "float 12s ease-in-out infinite",
  },
  floatingShape2: {
    position: "absolute",
    bottom: "15%",
    right: "8%",
    width: "250px",
    height: "250px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(30,111,92,0.08) 0%, rgba(30,111,92,0) 70%)",
    animation: "float 15s ease-in-out infinite reverse",
  },
  floatingShape3: {
    position: "absolute",
    top: "40%",
    right: "15%",
    width: "200px",
    height: "200px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(40,155,130,0.08) 0%, rgba(40,155,130,0) 70%)",
    animation: "floatSlow 18s ease-in-out infinite",
  },
  floatingShape4: {
    position: "absolute",
    bottom: "30%",
    left: "10%",
    width: "250px",
    height: "250px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(30,111,92,0.06) 0%, rgba(30,111,92,0) 70%)",
    animation: "float 20s ease-in-out infinite",
  },
  nav: {
    position: "relative",
    zIndex: 10,
    padding: "20px 40px",
    backgroundColor: "rgba(255,255,255,0.95)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 2px 20px rgba(0,0,0,0.05)",
  },
  navContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logoIcon: {
    width: "36px",
    height: "36px",
    backgroundColor: "#1e6f5c",
    borderRadius: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
  },
  logoText: {
    fontSize: "22px",
    fontWeight: "600",
    color: "#1a2c3e",
    letterSpacing: "-0.3px",
  },
  logoAccent: {
    fontWeight: "400",
    color: "#1e6f5c",
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  },
  patientName: {
    display: "flex",
    alignItems: "baseline",
    gap: "8px",
    padding: "6px 16px",
    backgroundColor: "#e6f7f3",
    borderRadius: "40px",
  },
  welcomeText: {
    fontSize: "13px",
    color: "#64748b",
  },
  nameText: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1e6f5c",
  },
  logoutButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 20px",
    backgroundColor: "#fff",
    border: "1.5px solid #e2e8f0",
    borderRadius: "40px",
    color: "#475569",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  main: {
    position: "relative",
    zIndex: 5,
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 40px 40px 40px",
  },
  heroWrapper: {
    margin: "0 -40px 60px -40px",
    position: "relative",
  },
  carouselImageWrapper: {
    position: "relative",
    width: "100%",
    height: "600px",
    overflow: "hidden",
  },
  carouselImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  carouselOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(135deg, rgba(26,44,62,0.6) 0%, rgba(30,111,92,0.4) 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  carouselContent: {
    textAlign: "center",
    color: "#fff",
    maxWidth: "700px",
    padding: "40px",
  },
  carouselTitle: {
    fontSize: "56px",
    fontWeight: "800",
    marginBottom: "20px",
    textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
  },
  carouselDescription: {
    fontSize: "20px",
    opacity: 0.95,
    lineHeight: "1.5",
    textShadow: "1px 1px 2px rgba(0,0,0,0.2)",
  },
  carouselDots: {
    position: "absolute",
    bottom: "30px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: "12px",
    zIndex: 10,
  },
  dot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.5)",
    cursor: "pointer",
    transition: "all 0.3s ease",
    border: "none",
    padding: 0,
  },
  activeDot: {
    width: "32px",
    borderRadius: "6px",
    backgroundColor: "#1e6f5c",
  },
  welcomeSection: {
    textAlign: "center",
    padding: "60px 40px",
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(10px)",
    borderRadius: "30px",
    marginBottom: "40px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(255, 255, 255, 0.8)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },
  heroTitle: {
    fontSize: "52px",
    fontWeight: "700",
    color: "#1a2c3e",
    marginBottom: "20px",
  },
  heroAccent: {
    color: "#1e6f5c",
  },
  heroDesc: {
    fontSize: "18px",
    color: "#475569",
    maxWidth: "600px",
    margin: "0 auto 30px auto",
  },
  ctaButton: {
    backgroundColor: "#1e6f5c",
    color: "#fff",
    border: "none",
    borderRadius: "40px",
    padding: "14px 32px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "12px",
    transition: "all 0.2s",
    boxShadow: "0 4px 15px rgba(30,111,92,0.3)",
  },
  statsSection: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "24px",
    padding: "40px 0",
    marginBottom: "40px",
  },
  statCard: {
    textAlign: "center",
    padding: "30px",
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    transition: "all 0.3s",
    cursor: "pointer",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
    border: "1px solid rgba(255,255,255,0.8)",
  },
  statIcon: {
    fontSize: "45px",
    marginBottom: "15px",
  },
  statNumber: {
    fontSize: "36px",
    fontWeight: "700",
    color: "#1e6f5c",
    marginBottom: "8px",
  },
  statLabel: {
    fontSize: "14px",
    color: "#64748b",
  },
  quickActions: {
    padding: "40px 0",
  },
  sectionTitle: {
    textAlign: "center",
    fontSize: "36px",
    fontWeight: "700",
    color: "#1a2c3e",
    marginBottom: "50px",
  },
  actionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "24px",
  },
  actionCard: {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(10px)",
    padding: "35px 25px",
    borderRadius: "20px",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.3s",
    border: "1px solid rgba(255,255,255,0.8)",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
    color: "#1a2c3e",
  },
  actionIcon: {
    fontSize: "55px",
    marginBottom: "15px",
  },
  features: {
    padding: "40px 0",
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "24px",
  },
  featureCard: {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(10px)",
    padding: "35px 25px",
    borderRadius: "20px",
    textAlign: "center",
    transition: "all 0.3s",
    border: "1px solid rgba(255,255,255,0.8)",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
    color: "#1a2c3e",
  },
  featureIcon: {
    fontSize: "50px",
    marginBottom: "15px",
  },
  newsletter: {
    margin: "60px 0",
    background: "linear-gradient(135deg, #1e6f5c 0%, #289b82 100%)",
    borderRadius: "30px",
    padding: "60px",
    color: "#fff",
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
  },
  newsletterContent: {
    textAlign: "center",
    maxWidth: "500px",
    margin: "0 auto",
  },
  newsletterIcon: {
    fontSize: "55px",
    marginBottom: "20px",
  },
  newsletterForm: {
    display: "flex",
    gap: "12px",
    marginTop: "30px",
  },
  newsletterInput: {
    flex: 1,
    padding: "14px 20px",
    borderRadius: "40px",
    border: "none",
    fontSize: "14px",
    outline: "none",
  },
  newsletterButton: {
    backgroundColor: "#1a2c3e",
    color: "#fff",
    border: "none",
    borderRadius: "40px",
    padding: "14px 28px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  successMessage: {
    marginTop: "20px",
    padding: "10px",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: "8px",
    fontSize: "14px",
  },
  footer: {
    borderTop: "1px solid rgba(0,0,0,0.1)",
    padding: "40px 0 20px 0",
    marginTop: "40px",
  },
  footerContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
  },
  footerLogo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "16px",
    fontWeight: "500",
    color: "#1a2c3e",
  },
  logoIconSmall: {
    width: "28px",
    height: "28px",
    backgroundColor: "#1e6f5c",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
  },
  footerLinks: {
    display: "flex",
    gap: "24px",
  },
  footerLink: {
    color: "#64748b",
    textDecoration: "none",
    fontSize: "14px",
    transition: "color 0.2s",
  },
  copyright: {
    fontSize: "12px",
    color: "#94a3b8",
  },
};