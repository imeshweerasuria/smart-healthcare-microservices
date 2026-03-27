import { useState } from "react";
import axios from "axios";
import { API, authHeaders } from "../../api/client";

export default function PaymentTest() {
 const [paymentId, setPaymentId] = useState("");

 const create = async () => {
   try {
     const res = await axios.post(
       `${API.payment}/payments/create-intent`,
       { appointmentId: "DEMO_APPT_1", amount: 1000 },
       { headers: authHeaders() }
     );
     setPaymentId(res.data.paymentId);
   } catch (err) {
     console.error(err);
     alert("Failed to create payment test");
   }
 };

 return (
   <div style={{ padding: 24 }}>
     <h2>Payment Test</h2>
     <button onClick={create}>Create Intent</button>
     {paymentId && <p>PaymentId: {paymentId}</p>}
   </div>
 );
}
