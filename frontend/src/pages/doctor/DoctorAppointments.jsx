import { useEffect, useState } from "react"; 
import axios from "axios"; 
export default function DoctorAppointments() { 
const [list, setList] = useState([]); 
const load = async () => { 
const token = localStorage.getItem("token"); 
const res = await axios.get("http://localhost:4004/appointments/doctor/me", { 
headers: { Authorization: `Bearer ${token}` }, 
}); 
setList(res.data); 
}; 
useEffect(() => { 
load(); 
}, []); 
const updateStatus = async (id, status) => { 
try { 
const token = localStorage.getItem("token"); 
     await axios.put( 
       `http://localhost:4004/appointments/${id}/status`, 
       { status }, 
       { headers: { Authorization: `Bearer ${token}` } } 
     ); 
     alert(`Marked ${status}`); 
     load(); 
   } catch (e) { 
     console.log(e); 
     alert("Update failed"); 
   } 
 }; 
 
 return ( 
   <div> 
     <h2>Appointment Requests</h2> 
 
     {list.length === 0 && <p>No requests.</p>} 
 
     {list.map((a) => ( 
       <div key={a._id} style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}> 
         <p><b>Status:</b> {a.status}</p> 
         <p><b>PatientId:</b> {a.patientId}</p> 
         <p><b>Date:</b> {new Date(a.datetime).toLocaleString()}</p> 
         <p><b>Reason:</b> {a.reason}</p> 
 
         {a.status === "PENDING" && ( 
           <> 
             <button onClick={() => updateStatus(a._id, "ACCEPTED")}>Accept</button> 
             <button onClick={() => updateStatus(a._id, "REJECTED")}>Reject</button> 
           </> 
         )} 
       </div> 
     ))} 
   </div> 
 ); 
} 