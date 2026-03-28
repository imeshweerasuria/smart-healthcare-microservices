import { useEffect, useState } from "react";
import axios from "axios";
import { API, authHeaders } from "../../api/client";

export default function AdminPaymentSummary() {
 const [summary, setSummary] = useState(null);

 useEffect(() => {
   axios
     .get(`${API.payment}/payments/summary`, { headers: authHeaders() })
     .then((res) => setSummary(res.data))
     .catch((err) => {
       console.error(err);
       alert("Failed to load payment summary");
     });
 }, []);

 if (!summary) return <div style={{ padding: 24 }}>Loading...</div>;

 return (
   <div style={{ padding: 24 }}>
     <h2>Payment Summary</h2>

     <div style={{ border: "1px solid #ccc", padding: 12 }}>
       <p><b>Total Payments:</b> {summary.totalCount}</p>
       <p><b>Paid:</b> {summary.paidCount}</p>
       <p><b>Pending:</b> {summary.pendingCount}</p>
       <p><b>Failed:</b> {summary.failedCount}</p>
       <p><b>Total Revenue:</b> {summary.totalRevenue} {summary.currency}</p>
     </div>
   </div>
 );
}
