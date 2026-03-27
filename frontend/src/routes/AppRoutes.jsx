import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { getRole, isLoggedIn } from "../api/auth";

// Pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// Patient pages
import PatientDashboard from "../pages/patient/PatientDashboard";
import PatientProfile from "../pages/patient/PatientProfile";
import BrowseDoctors from "../pages/patient/BrowseDoctors";
import BookAppointment from "../pages/patient/BookAppointment";
import MyAppointments from "../pages/patient/MyAppointments";
import UploadReports from "../pages/patient/UploadReports";
import MyReports from "../pages/patient/MyReports";
import MyPrescriptions from "../pages/patient/MyPrescriptions";
import MyPayments from "../pages/patient/MyPayments";

// Doctor pages
import DoctorDashboard from "../pages/doctor/DoctorDashboard";
import DoctorAppointments from "../pages/doctor/DoctorAppointments";
import DoctorProfile from "../pages/doctor/DoctorProfile";
import DoctorAvailability from "../pages/doctor/DoctorAvailability";
import PatientReports from "../pages/doctor/PatientReports";
import IssuePrescription from "../pages/doctor/IssuePrescription";

// Admin
import AdminDashboard from "../pages/admin/AdminDashboard";

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
       <Route
         path="/patient"
         element={
           <ProtectedRoute roles={["PATIENT"]}>
             <PatientDashboard />
           </ProtectedRoute>
         }
       />
       <Route
         path="/patient/profile"
         element={
           <ProtectedRoute roles={["PATIENT"]}>
             <PatientProfile />
           </ProtectedRoute>
         }
       />
       <Route
         path="/patient/doctors"
         element={
           <ProtectedRoute roles={["PATIENT"]}>
             <BrowseDoctors />
           </ProtectedRoute>
         }
       />
       <Route
         path="/patient/book/:doctorId"
         element={
           <ProtectedRoute roles={["PATIENT"]}>
             <BookAppointment />
           </ProtectedRoute>
         }
       />
       <Route
         path="/patient/appointments"
         element={
           <ProtectedRoute roles={["PATIENT"]}>
             <MyAppointments />
           </ProtectedRoute>
         }
       />
       <Route
         path="/patient/upload"
         element={
           <ProtectedRoute roles={["PATIENT"]}>
             <UploadReports />
           </ProtectedRoute>
         }
       />
       <Route
         path="/patient/reports"
         element={
           <ProtectedRoute roles={["PATIENT"]}>
             <MyReports />
           </ProtectedRoute>
         }
       />
       <Route
         path="/patient/prescriptions"
         element={
           <ProtectedRoute roles={["PATIENT"]}>
             <MyPrescriptions />
           </ProtectedRoute>
         }
       />
       <Route
         path="/patient/payments"
         element={
           <ProtectedRoute roles={["PATIENT"]}>
             <MyPayments />
           </ProtectedRoute>
         }
       />

       {/* DOCTOR */}
       <Route
         path="/doctor"
         element={
           <ProtectedRoute roles={["DOCTOR"]}>
             <DoctorDashboard />
           </ProtectedRoute>
         }
       />
       <Route
         path="/doctor/profile"
         element={
           <ProtectedRoute roles={["DOCTOR"]}>
             <DoctorProfile />
           </ProtectedRoute>
         }
       />
       <Route
         path="/doctor/availability"
         element={
           <ProtectedRoute roles={["DOCTOR"]}>
             <DoctorAvailability />
           </ProtectedRoute>
         }
       />
       <Route
         path="/doctor/appointments"
         element={
           <ProtectedRoute roles={["DOCTOR"]}>
             <DoctorAppointments />
           </ProtectedRoute>
         }
       />
       <Route
         path="/doctor/patient-reports"
         element={
           <ProtectedRoute roles={["DOCTOR", "ADMIN"]}>
             <PatientReports />
           </ProtectedRoute>
         }
       />
       <Route
         path="/doctor/prescribe/:patientId"
         element={
           <ProtectedRoute roles={["DOCTOR"]}>
             <IssuePrescription />
           </ProtectedRoute>
         }
       />

       {/* ADMIN */}
       <Route
         path="/admin"
         element={
           <ProtectedRoute roles={["ADMIN"]}>
             <AdminDashboard />
           </ProtectedRoute>
         }
       />

       <Route path="*" element={<div style={{ padding: 24 }}>404 - Not Found</div>} />
     </Routes>
   </BrowserRouter>
 );
}
