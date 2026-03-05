import { useState } from "react";
import axios from "axios";

export default function UploadReports() {
 const [file, setFile] = useState(null);

 const upload = async () => {
   try {
     const token = localStorage.getItem("token");
     if (!token) return alert("Please login first");

     const form = new FormData();
     form.append("report", file); // "report" MUST match multer field name

     await axios.post("http://localhost:4002/patients/me/reports", form, {
       headers: {
         Authorization: `Bearer ${token}`,
         // DO NOT manually set Content-Type; axios will set it with boundary
       },
     });

     alert("Uploaded");
     setFile(null);
   } catch (err) {
     console.log(err);
     alert("Upload failed");
   }
 };

 return (
   <div>
     <h2>Upload Report</h2>
     <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
     <button onClick={upload} disabled={!file}>
       Upload
     </button>
   </div>
 );
}
