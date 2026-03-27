import { Link, useNavigate } from "react-router-dom"; 
import { clearSession, getName } from "../../api/auth"; 
 
export default function DoctorDashboard() { 
 const navigate = useNavigate(); 
 
 const logout = () => { 
   clearSession(); 
   navigate("/login"); 
 }; 
 
 return ( 
   <div style={{ padding: 24 }}> 
     <h1>Doctor Dashboard</h1> 
     <p>Welcome, {getName() || "Doctor"}</p> 
 
     <button onClick={logout}>Logout</button> 
 
     <ul> 
       <li><Link to="/doctor/profile">My Profile</Link></li> 
       <li><Link to="/doctor/availability">My Availability</Link></li> 
       <li><Link to="/doctor/appointments">Appointment Requests</Link></li> 
       <li><Link to="/doctor/patient-reports">View Patient Reports</Link></li> 
     </ul> 
   </div> 
 ); 
} 