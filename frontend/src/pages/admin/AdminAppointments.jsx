import { useEffect, useState } from "react";
import axios from "axios";
import { API, authHeaders } from "../../api/client";

export default function AdminAppointments() {
const [list, setList] = useState([]);

const load = async () => {
try {
const res = await axios.get(`${API.appointment}/appointments/admin/all`, {
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

return (
<div style={{ padding: 24 }}>
<h2>All Appointments</h2>

{list.length === 0 && <p>No appointments found.</p>}

{list.map((a) => (
<div key={a._id} style={{ border: "1px solid #ccc", padding: 12, marginBottom: 12 }}>
<p><b>Appointment ID:</b> {a._id}</p>
<p><b>Patient ID:</b> {a.patientId}</p>
<p><b>Doctor ID:</b> {a.doctorId}</p>
<p><b>Status:</b> {a.status}</p>
<p><b>Payment:</b> {a.paymentStatus}</p>
<p><b>Date:</b> {new Date(a.datetime).toLocaleString()}</p>
<p><b>Reason:</b> {a.reason}</p>
{a.telemedicineLink && (
<p>
<a href={a.telemedicineLink} target="_blank" rel="noreferrer">
Open Telemedicine Link
</a>
</p>
)}
</div>
))}
</div>
);
}
