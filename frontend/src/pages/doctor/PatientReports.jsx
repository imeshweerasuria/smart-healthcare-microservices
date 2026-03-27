import { useState } from "react"; 
import axios from "axios"; 
import { API, authHeaders } from "../../api/client"; 
 
export default function PatientReports() { 
 const [patientId, setPatientId] = useState(""); 
 const [reports, setReports] = useState([]); 
 
 const loadReports = async () => { 
   try { 
     const res = await axios.get( 
       `${API.doctor}/doctors/patient/${patientId}/reports`, 
       { headers: authHeaders() } 
     ); 
     setReports(res.data); 
   } catch (err) { 
     console.error(err); 
     alert("Failed to load patient reports"); 
   } 
 }; 
 
 return ( 
   <div style={{ padding: 24 }}> 
     <h2>Patient Reports</h2> 
 
     <input 
       placeholder="Enter patient userId" 
       value={patientId} 
       onChange={(e) => setPatientId(e.target.value)} 
     /> 
     <button onClick={loadReports} disabled={!patientId} style={{ marginLeft: 8 }}> 
       Load Reports 
     </button> 
 
     <br /><br /> 
 
     {reports.length === 0 && <p>No reports loaded.</p>} 
 
     <ul> 
       {reports.map((r, index) => ( 
         <li key={index}> 
           <b>{r.originalName}</b> — {new Date(r.uploadedAt).toLocaleString()} 
         </li> 
       ))} 
     </ul> 
   </div> 
 ); 
} 