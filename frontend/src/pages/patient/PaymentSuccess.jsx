import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { API, authHeaders } from "../../api/client";

export default function PaymentSuccess() {
 const [searchParams] = useSearchParams();
 const [status, setStatus] = useState("Confirming payment...");

 useEffect(() => {
   const paymentId = searchParams.get("paymentId");
   const sessionId = searchParams.get("session_id");

   const confirm = async () => {
     try {
       await axios.post(
         `${API.payment}/payments/confirm-stripe-success`,
         { paymentId, sessionId },
         { headers: authHeaders() }
       );
       setStatus("Payment confirmed successfully!");
     } catch (err) {
       console.error(err);
       setStatus(err.response?.data?.message || "Payment confirmation failed");
     }
   };

   if (paymentId && sessionId) {
     confirm();
   } else {
     setStatus("Missing payment confirmation details");
   }
 }, [searchParams]);

 return (
   <div style={{ padding: 24 }}>
     <h2>Stripe Payment Result</h2>
     <p>{status}</p>
     <Link to="/patient/appointments">Go back to My Appointments</Link>
   </div>
 );
}
