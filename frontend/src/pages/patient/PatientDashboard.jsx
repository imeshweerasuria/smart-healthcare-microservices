import { Link, useNavigate } from "react-router-dom";
import { clearSession, getName } from "../../api/auth";

export default function PatientDashboard() {
const navigate = useNavigate();

const logout = () => {
clearSession();
navigate("/login");
};

return (
<div style={{ padding: 24 }}>
<h1>Patient Dashboard</h1>
<p>Welcome, {getName() || "Patient"}</p>

<button onClick={logout}>Logout</button>

<ul>
<li><Link to="/patient/profile">My Profile</Link></li>
<li><Link to="/patient/medical-record">My Medical Record</Link></li>
<li><Link to="/patient/doctors">Browse Doctors</Link></li>
<li><Link to="/patient/appointments">My Appointments</Link></li>
<li><Link to="/patient/upload">Upload Medical Reports</Link></li>
<li><Link to="/patient/reports">My Reports</Link></li>
<li><Link to="/patient/prescriptions">My Prescriptions</Link></li>
<li><Link to="/patient/payments">My Payments</Link></li>
</ul>
</div>
);
}
