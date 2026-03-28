import { useEffect, useState } from "react";
import axios from "axios";
import { API, authHeaders } from "../../api/client";

export default function DoctorPrescriptions() {
 const [list, setList] = useState([]);

 useEffect(() => {
   axios
     .get(`${API.doctor}/prescriptions/doctor/me`, { headers: authHeaders() })
     .then((res) => setList(res.data))
     .catch((err) => {
       console.error(err);
       alert("Failed to load prescriptions");
     });
 }, []);

 return (
   <div style={{ padding: 24 }}>
     <h2>My Issued Prescriptions</h2>

     {list.length === 0 && <p>No prescriptions yet.</p>}

     {list.map((p) => (
       <div key={p._id} style={{ border: "1px solid #ccc", padding: 12, marginBottom: 12 }}>
         <p><b>Patient ID:</b> {p.patientId}</p>
         <p><b>Appointment ID:</b> {p.appointmentId || "-"}</p>
         <p><b>Meds:</b> {p.meds}</p>
         <p><b>Notes:</b> {p.notes}</p>
         <p><b>Date:</b> {new Date(p.createdAt).toLocaleString()}</p>
       </div>
     ))}
   </div>
 );
}
