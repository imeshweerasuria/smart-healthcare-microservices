import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { getRole, isLoggedIn } from "../api/auth";

// Pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// Patient pages
import PatientDashboard from "../pages/patient/PatientDashboard";
import PatientProfile from "../pages/patient/PatientProfile";
import PatientMedicalRecord from "../pages/patient/PatientMedicalRecord";
import BrowseDoctors from "../pages/patient/BrowseDoctors";
import BookAppointment from "../pages/patient/BookAppointment";
import MyAppointments from "../pages/patient/MyAppointments";
import UploadReports from "../pages/patient/UploadReports";
import MyReports from "../pages/patient/MyReports";
import MyPrescriptions from "../pages/patient/MyPrescriptions";
import MyPayments from "../pages/patient/MyPayments";
import PaymentSuccess from "../pages/patient/PaymentSuccess"; // ✅ added
import PaymentForAppointment from "../pages/patient/PaymentForAppointment";
import PaymentTest from "../pages/patient/PaymentTest";

// Doctor pages
import DoctorDashboard from "../pages/doctor/DoctorDashboard";
import DoctorAppointments from "../pages/doctor/DoctorAppointments";
import DoctorProfile from "../pages/doctor/DoctorProfile";
import DoctorAvailability from "../pages/doctor/DoctorAvailability";
import PatientReports from "../pages/doctor/PatientReports";
import DoctorPrescriptions from "../pages/doctor/DoctorPrescriptions";
import IssuePrescription from "../pages/doctor/IssuePrescription";

// Admin
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminAppointments from "../pages/admin/AdminAppointments";
import AdminPaymentSummary from "../pages/admin/AdminPaymentSummary";

function HomeRedirect() {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  const role = getRole();
  if (role === "PATIENT") return <Navigate to="/patient" replace />;
  if (role === "DOCTOR") return <Navigate to="/doctor" replace />;
  if (role === "ADMIN") return <Navigate to="/admin" replace />;
  return <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PATIENT */}
        <Route path="/patient" element={<ProtectedRoute roles={["PATIENT"]}><PatientDashboard /></ProtectedRoute>} />
        <Route path="/patient/profile" element={<ProtectedRoute roles={["PATIENT"]}><PatientProfile /></ProtectedRoute>} />
        <Route path="/patient/medical-record" element={<ProtectedRoute roles={["PATIENT"]}><PatientMedicalRecord /></ProtectedRoute>} />
        <Route path="/patient/doctors" element={<ProtectedRoute roles={["PATIENT"]}><BrowseDoctors /></ProtectedRoute>} />
        <Route path="/patient/book/:doctorId" element={<ProtectedRoute roles={["PATIENT"]}><BookAppointment /></ProtectedRoute>} />
        <Route path="/patient/appointments" element={<ProtectedRoute roles={["PATIENT"]}><MyAppointments /></ProtectedRoute>} />
        <Route path="/patient/upload" element={<ProtectedRoute roles={["PATIENT"]}><UploadReports /></ProtectedRoute>} />
        <Route path="/patient/reports" element={<ProtectedRoute roles={["PATIENT"]}><MyReports /></ProtectedRoute>} />
        <Route path="/patient/prescriptions" element={<ProtectedRoute roles={["PATIENT"]}><MyPrescriptions /></ProtectedRoute>} />
        <Route path="/patient/payments" element={<ProtectedRoute roles={["PATIENT"]}><MyPayments /></ProtectedRoute>} />
        <Route path="/patient/payments/create" element={<ProtectedRoute roles={["PATIENT"]}><PaymentForAppointment /></ProtectedRoute>}/>
        <Route path="/patient/payment/success" element={<ProtectedRoute roles={["PATIENT"]}><PaymentSuccess /></ProtectedRoute>}/>
        <Route path="/patient/payment-test" element={<ProtectedRoute roles={["PATIENT"]}><PaymentTest /></ProtectedRoute>}/>

        
        {/* DOCTOR */}
        <Route path="/doctor" element={<ProtectedRoute roles={["DOCTOR"]}><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/doctor/profile" element={<ProtectedRoute roles={["DOCTOR"]}><DoctorProfile /></ProtectedRoute>} />
        <Route path="/doctor/availability" element={<ProtectedRoute roles={["DOCTOR"]}><DoctorAvailability /></ProtectedRoute>} />
        <Route path="/doctor/appointments" element={<ProtectedRoute roles={["DOCTOR"]}><DoctorAppointments /></ProtectedRoute>} />
        <Route path="/doctor/patient-reports" element={<ProtectedRoute roles={["DOCTOR", "ADMIN"]}><PatientReports /></ProtectedRoute>} />
        <Route path="/doctor/prescriptions" element={<ProtectedRoute roles={["DOCTOR"]}><DoctorPrescriptions /></ProtectedRoute>} />
        <Route path="/doctor/prescribe/:patientId" element={<ProtectedRoute roles={["DOCTOR"]}><IssuePrescription /></ProtectedRoute>} />

        {/* ADMIN */}
        <Route path="/admin" element={<ProtectedRoute roles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/appointments" element={<ProtectedRoute roles={["ADMIN"]}><AdminAppointments /></ProtectedRoute>} />
        <Route path="/admin/payments" element={<ProtectedRoute roles={["ADMIN"]}><AdminPaymentSummary /></ProtectedRoute>} />

        <Route path="*" element={<div style={{ padding: 24 }}>404 - Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}