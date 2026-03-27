import { useEffect, useState } from "react";
import axios from "axios";
import { API, authHeaders } from "../../api/client";

export default function PatientProfile() {
 const [form, setForm] = useState({
   dateOfBirth: "",
   gender: "",
   phone: "",
   address: "",
   medicalHistory: "",
   allergies: "",
   chronicConditions: "",
 });
 const [loading, setLoading] = useState(true);

 const load = async () => {
   try {
     setLoading(true);
     const res = await axios.get(`${API.patient}/patients/me`, {
       headers: authHeaders(),
     });

     setForm({
       dateOfBirth: res.data.dateOfBirth || "",
       gender: res.data.gender || "",
       phone: res.data.phone || "",
       address: res.data.address || "",
       medicalHistory: res.data.medicalHistory || "",
       allergies: Array.isArray(res.data.allergies) ? res.data.allergies.join(", ") : "",
       chronicConditions: Array.isArray(res.data.chronicConditions)
         ? res.data.chronicConditions.join(", ")
         : "",
     });
   } catch (err) {
     console.error(err);
     alert("Failed to load profile");
   } finally {
     setLoading(false);
   }
 };

 useEffect(() => {
   load();
 }, []);

 const handleChange = (e) => {
   setForm((prev) => ({
     ...prev,
     [e.target.name]: e.target.value,
   }));
 };

 const save = async (e) => {
   e.preventDefault();

   try {
     await axios.put(
       `${API.patient}/patients/me`,
       {
         ...form,
         allergies: form.allergies
           .split(",")
           .map((x) => x.trim())
           .filter(Boolean),
         chronicConditions: form.chronicConditions
           .split(",")
           .map((x) => x.trim())
           .filter(Boolean),
       },
       { headers: authHeaders() }
     );

     alert("Profile updated");
   } catch (err) {
     console.error(err);
     alert("Update failed");
   }
 };

 if (loading) return <div style={{ padding: 24 }}>Loading...</div>;

 return (
   <div style={{ padding: 24 }}>
     <h2>My Profile</h2>

     <form onSubmit={save} style={{ maxWidth: 500 }}>
       <div>
         <label>Date of Birth</label>
         <br />
         <input name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
       </div>

       <br />

       <div>
         <label>Gender</label>
         <br />
         <input name="gender" value={form.gender} onChange={handleChange} />
       </div>

       <br />

       <div>
         <label>Phone</label>
         <br />
         <input name="phone" value={form.phone} onChange={handleChange} />
       </div>

       <br />

       <div>
         <label>Address</label>
         <br />
         <input name="address" value={form.address} onChange={handleChange} />
       </div>

       <br />

       <div>
         <label>Medical History</label>
         <br />
         <textarea name="medicalHistory" value={form.medicalHistory} onChange={handleChange} rows={4} />
       </div>

       <br />

       <div>
         <label>Allergies (comma separated)</label>
         <br />
         <input name="allergies" value={form.allergies} onChange={handleChange} />
       </div>

       <br />

       <div>
         <label>Chronic Conditions (comma separated)</label>
         <br />
         <input
           name="chronicConditions"
           value={form.chronicConditions}
           onChange={handleChange}
         />
       </div>

       <br />

       <button type="submit">Save Profile</button>
     </form>
   </div>
 );
}
