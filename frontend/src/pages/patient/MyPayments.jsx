import { useEffect, useState } from "react";
import axios from "axios";
import { API, authHeaders } from "../../api/client";

export default function MyPayments() {
 const [list, setList] = useState([]);

 useEffect(() => {
   axios
     .get(`${API.payment}/payments/me`, { headers: authHeaders() })
     .then((res) => setList(res.data))
     .catch((err) => {
       console.error(err);
       alert("Failed to load payments");
     });
 }, []);

 return (
   <div style={{ padding: 24 }}>
     <h2>My Payments</h2>

     {list.length === 0 && <p>No payments yet.</p>}

     {list.map((p) => (
       <div key={p._id} style={{ border: "1px solid #ccc", padding: 12, marginBottom: 12 }}>
         <p><b>Payment ID:</b> {p._id}</p>
         <p><b>Appointment ID:</b> {p.appointmentId}</p>
         <p><b>Amount:</b> {p.amount} {p.currency}</p>
         <p><b>Status:</b> {p.status}</p>
         <p><b>Provider:</b> {p.provider}</p>
         <p><b>Created:</b> {new Date(p.createdAt).toLocaleString()}</p>
       </div>
     ))}
   </div>
 );
}
