import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { API } from "../../api/client";

export default function BrowseDoctors() {
 const [doctors, setDoctors] = useState([]);
 const [specialty, setSpecialty] = useState("");
 const [loading, setLoading] = useState(false);

 const load = async (specialtyValue = "") => {
   try {
     setLoading(true);
     const url = specialtyValue
       ? `${API.doctor}/doctors?specialty=${encodeURIComponent(specialtyValue)}`
       : `${API.doctor}/doctors`;

     const res = await axios.get(url);
     setDoctors(res.data);
   } catch (err) {
     console.error(err);
     alert("Failed to load doctors");
   } finally {
     setLoading(false);
   }
 };

 useEffect(() => {
   load();
 }, []);

 return (
   <div style={{ padding: 24 }}>
     <h2>Browse Doctors</h2>

     <input
       value={specialty}
       onChange={(e) => setSpecialty(e.target.value)}
       placeholder="Search by specialty"
     />
     <button onClick={() => load(specialty)} style={{ marginLeft: 8 }}>
       Search
     </button>
     <button onClick={() => { setSpecialty(""); load(""); }} style={{ marginLeft: 8 }}>
       Clear
     </button>

     {loading && <p>Loading...</p>}
     {!loading && doctors.length === 0 && <p>No doctors found.</p>}

     <ul>
       {doctors.map((d) => (
         <li key={d._id} style={{ marginBottom: 16 }}>
           <b>{d.specialty || "No specialty"}</b> — {d.bio || "No bio"}
           <br />
           Doctor UserId: <code>{d.userId}</code>
           <br />
           <Link to={`/patient/book/${d.userId}`}>Book Appointment</Link>
         </li>
       ))}
     </ul>
   </div>
 );
}
