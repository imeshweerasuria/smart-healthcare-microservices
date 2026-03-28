import { useEffect, useState } from "react";
import axios from "axios";
import { API, authHeaders } from "../../api/client";
import { clearSession, getName } from "../../api/auth";
import { useNavigate, Link } from "react-router-dom";

export default function AdminDashboard() {
const navigate = useNavigate();
const [users, setUsers] = useState([]);
const [pendingDoctors, setPendingDoctors] = useState([]);
const [loading, setLoading] = useState(true);

const load = async () => {
try {
setLoading(true);

const [usersRes, pendingRes] = await Promise.all([
axios.get(`${API.auth}/auth/users`, { headers: authHeaders() }),
axios.get(`${API.auth}/auth/doctors/pending`, { headers: authHeaders() }),
]);

setUsers(usersRes.data);
setPendingDoctors(pendingRes.data);
} catch (err) {
console.error(err);
alert("Failed to load admin data");
} finally {
setLoading(false);
}
};

useEffect(() => {
load();
}, []);

const verifyDoctor = async (doctorId) => {
try {
await axios.patch(
`${API.auth}/auth/doctors/${doctorId}/verify`,
{},
{ headers: authHeaders() }
);
alert("Doctor verified");
load();
} catch (err) {
console.error(err);
alert("Verify failed");
}
};

const toggleDisable = async (userId) => {
try {
await axios.patch(
`${API.auth}/auth/users/${userId}/toggle-disable`,
{},
{ headers: authHeaders() }
);
alert("User status updated");
load();
} catch (err) {
console.error(err);
alert("Failed to update user status");
}
};

const logout = () => {
clearSession();
navigate("/login");
};

return (
<div style={{ padding: 24 }}>
<h1>Admin Dashboard</h1>
<p>Welcome, {getName() || "Admin"}</p>

<button onClick={logout}>Logout</button>

<div style={{ marginTop: 16, marginBottom: 16 }}>
<Link to="/admin/appointments">View All Appointments</Link>
<span style={{ marginLeft: 16 }} />
<Link to="/admin/payments">View Payment Summary</Link>
</div>

{loading && <p>Loading...</p>}

<h2>Pending Doctors</h2>
{pendingDoctors.length === 0 && <p>No pending doctors.</p>}
{pendingDoctors.map((d) => (
<div key={d._id} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
<p><b>Name:</b> {d.name}</p>
<p><b>Email:</b> {d.email}</p>
<button onClick={() => verifyDoctor(d._id)}>Verify</button>
</div>
))}

<h2>All Users</h2>
{users.length === 0 && <p>No users found.</p>}
{users.map((u) => (
<div key={u._id} style={{ border: "1px solid #ddd", padding: 10, marginBottom: 10 }}>
<p><b>Name:</b> {u.name}</p>
<p><b>Email:</b> {u.email}</p>
<p><b>Role:</b> {u.role}</p>
<p><b>Doctor Verified:</b> {String(u.doctorVerified)}</p>
<p><b>Disabled:</b> {String(u.isDisabled)}</p>
<button onClick={() => toggleDisable(u._id)}>
{u.isDisabled ? "Enable User" : "Disable User"}
</button>
</div>
))}
</div>
);
}
