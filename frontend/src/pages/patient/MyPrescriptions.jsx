import { useEffect, useState } from "react";
import axios from "axios";
import { authHeaders } from "../../api/client";

export default function MyPrescriptions() {
 const [list, setList] = useState([]);

 useEffect(() => {
   axios
     .get("http://localhost:4002/patients/me/prescriptions", { headers: authHeaders() })
     .then((res) => setList(res.data))
     .catch(() => alert("Failed to load prescriptions"));
 }, []);

 return (
   <div>
     <h2>My Prescriptions</h2>
     {list.length === 0 && <p>No prescriptions yet.</p>}
     {list.map((p) => (
       <div key={p._id} style={{ border: "1px solid #ccc", padding: 10, margin: 10 }}>
         <p><b>DoctorId:</b> {p.doctorId}</p>
         <p><b>PatientId:</b> {p.patientId}</p>
         <p><b>Date:</b> {new Date(p.createdAt).toLocaleString()}</p>
         <p><b>Meds:</b> {p.meds}</p>
         <p><b>Notes:</b> {p.notes}</p>
       </div>
     ))}
   </div>
 );
}
