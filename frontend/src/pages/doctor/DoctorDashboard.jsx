import { Link } from "react-router-dom";

export default function DoctorDashboard() {
  return (
    <div>
      <h1>Doctor Dashboard</h1>
      <ul>
        <li><Link to="/doctor/appointments">Appointment Requests</Link></li>
        <li><Link to="/doctor/profile">My Profile</Link></li>
      </ul>
    </div>
  );
}