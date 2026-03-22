import { useEffect, useState } from "react";
import axios from "axios";
import { authHeaders } from "../../api/client";

export default function MyReports() {
 const [reports, setReports] = useState([]);

 useEffect(() => {
   axios
     .get("http://localhost:4002/patients/me/reports", { headers: authHeaders() })
     .then((res) => setReports(res.data))
     .catch(() => alert("Failed to load reports"));
 }, []);

 return (
   <div>
     <h2>My Reports</h2>
     {reports.length === 0 && <p>No reports yet.</p>}
     <ul>
       {reports.map((r) => (
         <li key={r._id}>
           <b>{r.originalName}</b> — {new Date(r.uploadedAt).toLocaleString()}
         </li>
       ))}
     </ul>
   </div>
 );
}
