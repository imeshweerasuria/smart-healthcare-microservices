import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API, authHeaders } from "../../api/client";

export default function BookAppointment() {
 const { doctorId } = useParams();
 const navigate = useNavigate();

 const [doctor, setDoctor] = useState(null);
 const [datetime, setDatetime] = useState("");
 const [reason, setReason] = useState("");
 const [loading, setLoading] = useState(false);

 useEffect(() => {
   axios
     .get(`${API.doctor}/doctors/${doctorId}`)
     .then((res) => setDoctor(res.data))
     .catch((err) => {
       console.error(err);
       alert("Failed to load doctor details");
     });
 }, [doctorId]);

 const book = async () => {
   try {
     if (!datetime) return alert("Choose date and time first");

     const selected = new Date(datetime);
     if (selected <= new Date()) {
       return alert("Please choose a future date/time");
     }

     setLoading(true);

     await axios.post(
       `${API.appointment}/appointments`,
       { doctorId, datetime: selected.toISOString(), reason },
       { headers: authHeaders() }
     );

     alert("Appointment requested!");
     navigate("/patient/appointments");
   } catch (e) {
     console.error(e);
     alert(e.response?.data?.message || "Booking failed");
   } finally {
     setLoading(false);
   }
 };

 return (
   <div style={{ padding: 24 }}>
     <h2>Book Appointment</h2>

     {doctor && (
       <div style={{ border: "1px solid #ccc", padding: 12, marginBottom: 16 }}>
         <p><b>Specialty:</b> {doctor.specialty || "-"}</p>
         <p><b>Bio:</b> {doctor.bio || "-"}</p>
         <div>
           <b>Availability:</b>
           {doctor.availability?.length ? (
             <ul>
               {doctor.availability.map((slot, idx) => (
                 <li key={idx}>
                   {slot.day} | {slot.from} - {slot.to}
                 </li>
               ))}
             </ul>
           ) : (
             <p>No availability listed.</p>
           )}
         </div>
       </div>
     )}

     <label>Date & Time:</label>
     <input
       type="datetime-local"
       value={datetime}
       onChange={(e) => setDatetime(e.target.value)}
     />

     <br /><br />

     <label>Reason:</label>
     <input
       value={reason}
       onChange={(e) => setReason(e.target.value)}
       placeholder="Fever / Headache..."
     />

     <br /><br />

     <button onClick={book} disabled={loading || !datetime}>
       {loading ? "Booking..." : "Book"}
     </button>
   </div>
 );
}
