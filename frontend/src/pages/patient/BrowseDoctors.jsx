import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function BrowseDoctors() {
 const [doctors, setDoctors] = useState([]);

 useEffect(() => {
   axios.get("http://localhost:4003/doctors").then((res) => setDoctors(res.data));
 }, []);

 return (
   <div>
     <h2>Browse Doctors</h2>
     {doctors.length === 0 && <p>No doctors yet.</p>}

     <ul>
       {doctors.map((d) => (
         <li key={d._id}>
           <b>{d.specialty || "No specialty"}</b> — {d.bio || "No bio"}
           <br />
           Doctor UserId: <code>{d.userId}</code>
           <br />
           <Link to={`/patient/book/${d.userId}`}>Book</Link>
         </li>
       ))}
     </ul>
   </div>
 );
}
