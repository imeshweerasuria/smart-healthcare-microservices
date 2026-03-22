import { Link } from "react-router-dom";

export default function PatientDashboard() {
 return (
   <div>
     <h1>Patient Dashboard</h1>
     <ul>
       <li><Link to="/patient/doctors">Browse Doctors</Link></li>
       <li><Link to="/patient/appointments">My Appointments</Link></li>
       <li><Link to="/patient/upload">Upload Medical Reports</Link></li>
     </ul>
   </div>
 );
}
