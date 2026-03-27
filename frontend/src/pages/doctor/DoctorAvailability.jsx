import { useEffect, useState } from "react"; 
import axios from "axios"; 
import { API, authHeaders } from "../../api/client"; 
 
export default function DoctorAvailability() { 
 const [availability, setAvailability] = useState([]); 
 const [day, setDay] = useState(""); 
 const [from, setFrom] = useState(""); 
 const [to, setTo] = useState(""); 
 
 const load = async () => { 
   try { 
     const res = await axios.get(`${API.doctor}/doctors/me`, { 
       headers: authHeaders(), 
     }); 
     setAvailability(res.data.availability || []); 
   } catch (err) { 
     console.error(err); 
     alert("Failed to load availability"); 
   } 
 }; 
 
 useEffect(() => { 
   load(); 
 }, []); 
 
 const addSlot = () => { 
   if (!day || !from || !to) return alert("Fill all fields"); 
   setAvailability((prev) => [...prev, { day, from, to }]); 
   setDay(""); 
   setFrom(""); 
   setTo(""); 
 }; 
 
 const removeSlot = (index) => { 
   setAvailability((prev) => prev.filter((_, i) => i !== index)); 
 }; 
 
 const save = async () => { 
   try { 
     await axios.put( 
       `${API.doctor}/doctors/me/availability`, 
       { availability }, 
       { headers: authHeaders() } 
     ); 
     alert("Availability updated"); 
   } catch (err) { 
     console.error(err); 
     alert("Save failed"); 
   } 
 }; 
 
 return ( 
   <div style={{ padding: 24 }}> 
     <h2>My Availability</h2> 
 
     <div> 
       <input placeholder="Day e.g. MON" value={day} onChange={(e) => 
setDay(e.target.value)} /> 
       <input placeholder="From e.g. 09:00" value={from} onChange={(e) => 
setFrom(e.target.value)} /> 
       <input placeholder="To e.g. 12:00" value={to} onChange={(e) => setTo(e.target.value)} 
/> 
       <button onClick={addSlot}>Add Slot</button> 
     </div> 
 
     <br /> 
 
     {availability.length === 0 && <p>No availability slots yet.</p>} 
 
     <ul> 
       {availability.map((slot, index) => ( 
         <li key={index}> 
           {slot.day} | {slot.from} - {slot.to} 
           <button onClick={() => removeSlot(index)} style={{ marginLeft: 8 }}> 
             Remove 
           </button> 
         </li> 
       ))} 
     </ul> 
 
     <br /> 
     <button onClick={save}>Save Availability</button> 
   </div> 
 ); 
} 