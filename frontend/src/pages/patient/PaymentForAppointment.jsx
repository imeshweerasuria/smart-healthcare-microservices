import { useState } from "react";
import axios from "axios";

export default function PaymentForAppointment() {
 const [appointmentId, setAppointmentId] = useState("");
 const [amount, setAmount] = useState(1000);

 const createPayment = async () => {
   const token = localStorage.getItem("token");
   const res = await axios.post(
     "http://localhost:4007/payments/for-appointment",
     { appointmentId, amount },
     { headers: { Authorization: `Bearer ${token}` } }
   );
   alert("Payment record created: " + res.data.payment._id);
 };

 return (
   <div>
     <h2>Create Payment (Demo)</h2>
     <input
       placeholder="AppointmentId"
       value={appointmentId}
       onChange={(e) => setAppointmentId(e.target.value)}
     />
     <input
       type="number"
       value={amount}
       onChange={(e) => setAmount(Number(e.target.value))}
     />
     <button onClick={createPayment} disabled={!appointmentId}>
       Create Payment Record
     </button>
   </div>
 );
}
