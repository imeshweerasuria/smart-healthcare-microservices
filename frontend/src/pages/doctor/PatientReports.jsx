import { useState } from "react";
import axios from "axios";
import { API, authHeaders } from "../../api/client";

export default function PatientReports() {
 const [patientId, setPatientId] = useState("");
 const [profile, setProfile] = useState(null);
 const [reports, setReports] = useState([]);

 const loadPatientData = async () => {
   try {
     const [profileRes, reportsRes] = await Promise.all([
       axios.get(`${API.doctor}/doctors/patient/${patientId}/profile`, {
         headers: authHeaders(),
       }),
       axios.get(`${API.doctor}/doctors/patient/${patientId}/reports`, {
         headers: authHeaders(),
       }),
     ]);

     setProfile(profileRes.data);
     setReports(reportsRes.data);
   } catch (err) {
     console.error(err);
     alert("Failed to load patient data");
   }
 };

 return (
   <div style={{ padding: 24 }}>
     <h2>Patient Reports & Profile</h2>

     <input
       placeholder="Enter patient userId"
       value={patientId}
       onChange={(e) => setPatientId(e.target.value)}
     />
     <button onClick={loadPatientData} disabled={!patientId} style={{ marginLeft: 8 }}>
       Load Patient Data
     </button>

     <br /><br />

     {profile && (
       <div style={{ border: "1px solid #ccc", padding: 12, marginBottom: 16 }}>
         <h3>Patient Profile</h3>
         <p><b>Date of Birth:</b> {profile.dateOfBirth || "-"}</p>
         <p><b>Gender:</b> {profile.gender || "-"}</p>
         <p><b>Phone:</b> {profile.phone || "-"}</p>
         <p><b>Address:</b> {profile.address || "-"}</p>
         <p><b>Medical History:</b> {profile.medicalHistory || "-"}</p>
         <p><b>Allergies:</b> {(profile.allergies || []).join(", ") || "-"}</p>
         <p><b>Chronic Conditions:</b> {(profile.chronicConditions || []).join(", ") || "-"}</p>
       </div>
     )}

     <h3>Reports</h3>
     {reports.length === 0 && <p>No reports loaded.</p>}

     <ul>
       {reports.map((r, index) => (
         <li key={index}>
           <b>{r.originalName}</b> — {new Date(r.uploadedAt).toLocaleString()}
           {r.downloadUrl && (
             <>
               {" "}
               —{" "}
               <a href={r.downloadUrl} target="_blank" rel="noreferrer">
                 Open
               </a>
             </>
           )}
         </li>
       ))}
     </ul>
   </div>
 );
}
