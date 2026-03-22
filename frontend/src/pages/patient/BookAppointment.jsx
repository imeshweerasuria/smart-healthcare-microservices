import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function BookAppointment() {
 const { doctorId } = useParams();
 const navigate = useNavigate();

 const [datetime, setDatetime] = useState("");
 const [reason, setReason] = useState("");

 const book = async () => {
   try {
     const token = localStorage.getItem("token");
     if (!token) return alert("Login first");

     await axios.post(
       "http://localhost:4004/appointments",
       { doctorId, datetime, reason },
       { headers: { Authorization: `Bearer ${token}` } }
     );

     alert("Appointment requested!");
     navigate("/patient/appointments");
   } catch (e) {
     console.log(e);
     alert("Booking failed");
   }
 };

 return (
   <div>
     <h2>Book Appointment</h2>
     <p>DoctorId: <code>{doctorId}</code></p>

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

     <button onClick={book} disabled={!datetime}>
       Book
     </button>
   </div>
 );
}
