import { useEffect, useState } from "react"; 
import axios from "axios"; 
import { API, authHeaders } from "../../api/client"; 
 
export default function DoctorProfile() { 
 const [form, setForm] = useState({ 
   specialty: "", 
   bio: "", 
 }); 
 const [loading, setLoading] = useState(true); 
 
 const load = async () => { 
   try { 
     setLoading(true); 
     const res = await axios.get(`${API.doctor}/doctors/me`, { 
       headers: authHeaders(), 
     }); 
 
     setForm({ 
       specialty: res.data.specialty || "", 
       bio: res.data.bio || "", 
     }); 
   } catch (err) { 
     console.error(err); 
     alert("Failed to load doctor profile"); 
   } finally { 
     setLoading(false); 
   } 
 }; 
 
 useEffect(() => { 
   load(); 
 }, []); 
 
 const save = async (e) => { 
   e.preventDefault(); 
 
   try { 
     await axios.put( 
       `${API.doctor}/doctors/me`, 
       form, 
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
     <h2>Doctor Profile</h2> 
 
     <form onSubmit={save} style={{ maxWidth: 450 }}> 
       <div> 
         <label>Specialty</label> 
         <br /> 
         <input 
           name="specialty" 
           value={form.specialty} 
           onChange={(e) => setForm({ ...form, specialty: e.target.value })} 
         /> 
       </div> 
 
       <br /> 
 
       <div> 
         <label>Bio</label> 
         <br /> 
         <textarea 
           name="bio" 
           rows={4} 
           value={form.bio} 
           onChange={(e) => setForm({ ...form, bio: e.target.value })} 
         /> 
       </div> 
 
       <br /> 
 
       <button type="submit">Save Profile</button> 
     </form> 
   </div> 
 ); 
} 