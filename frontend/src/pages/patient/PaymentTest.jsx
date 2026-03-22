import { useState } from "react";
import axios from "axios";

export default function PaymentTest() {
 const [paymentId, setPaymentId] = useState("");

 const create = async () => {
   const token = localStorage.getItem("token");
   const res = await axios.post(
     "http://localhost:4007/payments/create-intent",
     { appointmentId: "DEMO_APPT_1", amount: 1000 },
     { headers: { Authorization: `Bearer ${token}` } }
   );
   setPaymentId(res.data.paymentId);
 };

 return (
   <div>
     <h2>Payment Test</h2>
     <button onClick={create}>Create Intent</button>
     {paymentId && <p>PaymentId: {paymentId}</p>}
   </div>
 );
}
