import { useEffect, useState } from "react";
import axios from "axios";
import { API, authHeaders } from "../../api/client";

export default function MyReports() {
 const [reports, setReports] = useState([]);

 useEffect(() => {
   axios
     .get(`${API.patient}/patients/me/reports`, { headers: authHeaders() })
     .then((res) => setReports(res.data))
     .catch((err) => {
       console.error(err);
       alert("Failed to load reports");
     });
 }, []);

 return (
   <div style={{ padding: 24 }}>
     <h2>My Reports</h2>
     {reports.length === 0 && <p>No reports yet.</p>}

     <ul>
       {reports.map((r, index) => (
         <li key={index} style={{ marginBottom: 10 }}>
           <b>{r.originalName}</b> — {new Date(r.uploadedAt).toLocaleString()}
         </li>
       ))}
     </ul>
   </div>
 );
}
