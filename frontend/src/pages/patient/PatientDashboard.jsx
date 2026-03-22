export default function PatientDashboard() {
 return (
   <div>
     <h1>Patient Dashboard</h1>
     <ul>
       <li><Link to="/patient/upload">Upload Medical Report</Link></li>
       <li><Link to="/patient/appointments">My Appointments</Link></li>
     </ul>
   </div>
 );
}
