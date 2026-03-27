import { useState } from "react";
import axios from "axios";
import { API, authHeaders } from "../../api/client";

export default function PaymentForAppointment() {
 const [appointmentId, setAppointmentId] = useState("");
 const [amount, setAmount] = useState(1000);

 const createPayment = async () => {
   try {
     const res = await axios.post(
       `${API.payment}/payments/for-appointment`,
       { appointmentId, amount },
       { headers: authHeaders() }
     );
     alert("Payment record created: " + res.data.payment._id);
   } catch (err) {
     console.error(err);
     alert("Failed to create payment");
   }
 };

 return (
   <div style={{ padding: 24 }}>
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
