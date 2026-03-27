import { useState } from "react";
import axios from "axios";
import { API, authHeaders } from "../../api/client";

export default function UploadReports() {
 const [file, setFile] = useState(null);
 const [loading, setLoading] = useState(false);

 const upload = async () => {
   try {
     if (!file) return alert("Choose a file first");

     setLoading(true);

     const form = new FormData();
     form.append("report", file);

     await axios.post(`${API.patient}/patients/me/reports`, form, {
       headers: {
         ...authHeaders(),
       },
     });

     alert("Uploaded successfully");
     setFile(null);
   } catch (err) {
     console.error(err);
     alert(err.response?.data?.message || "Upload failed");
   } finally {
     setLoading(false);
   }
 };

 return (
   <div style={{ padding: 24 }}>
     <h2>Upload Report</h2>
     <p>Allowed: PDF, JPG, PNG. Max 5MB.</p>

     <input
       type="file"
       onChange={(e) => setFile(e.target.files?.[0] || null)}
     />

     <br /><br />

     <button onClick={upload} disabled={!file || loading}>
       {loading ? "Uploading..." : "Upload"}
     </button>
   </div>
 );
}
