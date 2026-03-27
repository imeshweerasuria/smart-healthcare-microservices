import { useEffect, useState } from "react";
import axios from "axios";
import { API, authHeaders } from "../../api/client";

export default function MyAppointments() {
 const [list, setList] = useState([]);

 const load = async () => {
   try {
     const res = await axios.get(`${API.appointment}/appointments/me`, {
       headers: authHeaders(),
     });
     setList(res.data);
   } catch (err) {
     console.error(err);
     alert("Failed to load appointments");
   }
 };

 useEffect(() => {
   load();
 }, []);

 const createPayment = async (appointmentId) => {
   try {
     const res = await axios.post(
       `${API.payment}/payments/for-appointment`,
       { appointmentId, amount: 1000 },
       { headers: authHeaders() }
     );
     alert(`Payment record created.\nPayment ID: ${res.data.paymentId}`);
   } catch (err) {
     console.error(err);
     alert("Payment create failed");
   }
 };

 const markPaid = async () => {
   try {
     const paymentId = prompt("Enter paymentId to mark PAID:");
     if (!paymentId) return;

     await axios.post(
       `${API.payment}/payments/mark-paid`,
       { paymentId },
       { headers: authHeaders() }
     );

     alert("Marked paid. Refreshing...");
     load();
   } catch (err) {
     console.error(err);
     alert("Mark paid failed");
   }
 };

 const cancelAppointment = async (appointmentId) => {
   try {
     await axios.patch(
       `${API.appointment}/appointments/${appointmentId}/cancel`,
       {},
       { headers: authHeaders() }
     );
     alert("Appointment cancelled");
     load();
   } catch (err) {
     console.error(err);
     alert("Cancel failed");
   }
 };

 return (
   <div style={{ padding: 24 }}>
     <h2>My Appointments</h2>

     {list.length === 0 && <p>No appointments yet.</p>}

     <ul>
       {list.map((a) => (
         <li key={a._id} style={{ marginBottom: "20px" }}>
           <b>Status:</b> {a.status} <br />
           <b>DoctorId:</b> {a.doctorId} <br />
           <b>Date:</b> {new Date(a.datetime).toLocaleString()} <br />
           <b>Reason:</b> {a.reason} <br />
           <b>Payment Status:</b> {a.paymentStatus || "UNPAID"} <br />

           {a.telemedicineLink && (
             <div>
               <a href={a.telemedicineLink} target="_blank" rel="noreferrer">
                 Join Call
               </a>
             </div>
           )}

           {a.status === "ACCEPTED" && a.paymentStatus !== "PAID" && (
             <div style={{ marginTop: 8 }}>
               <button onClick={() => createPayment(a._id)}>
                 Pay (Create Payment Record)
               </button>
               <button onClick={markPaid} style={{ marginLeft: 8 }}>
                 Mark Paid (Demo)
               </button>
             </div>
           )}

           {["PENDING", "ACCEPTED"].includes(a.status) && (
             <div style={{ marginTop: 8 }}>
               <button onClick={() => cancelAppointment(a._id)}>Cancel Appointment</button>
             </div>
           )}
         </li>
       ))}
     </ul>
   </div>
 );
}
