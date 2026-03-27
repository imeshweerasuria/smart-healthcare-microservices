import { useEffect, useState } from "react"; 
import axios from "axios"; 
import { Link } from "react-router-dom"; 
import { API, authHeaders } from "../../api/client"; 
 
export default function DoctorAppointments() { 
 const [list, setList] = useState([]); 
 
 const load = async () => { 
   try { 
     const res = await axios.get(`${API.appointment}/appointments/doctor/me`, { 
       headers: authHeaders(), 
     }); 
     setList(res.data); 
   } catch (e) { 
     console.error(e); 
     alert("Failed to load appointments"); 
   } 
 }; 
 
 useEffect(() => { 
   load(); 
 }, []); 
 
 const updateStatus = async (id, status) => { 
   try { 
     await axios.put( 
       `${API.appointment}/appointments/${id}/status`, 
       { status }, 
       { headers: authHeaders() } 
     ); 
     alert(`Marked ${status}`); 
     load(); 
   } catch (e) { 
     console.error(e); 
     alert("Update failed"); 
   } 
 }; 
 
 const completeAppointment = async (id) => { 
   try { 
     await axios.patch( 
       `${API.appointment}/appointments/${id}/complete`, 
       {}, 
       { headers: authHeaders() } 
     ); 
     alert("Appointment completed"); 
     load(); 
   } catch (e) { 
     console.error(e); 
     alert("Complete failed"); 
   } 
 }; 
 
 return ( 
   <div style={{ padding: 24 }}> 
     <h2>Appointment Requests</h2> 
 
     {list.length === 0 && <p>No requests.</p>} 
 
     {list.map((a) => ( 
       <div key={a._id} style={{ border: "1px solid #ccc", marginBottom: 12, padding: 12 }}> 
         <p><b>Status:</b> {a.status}</p> 
         <p><b>PatientId:</b> {a.patientId}</p> 
         <p><b>Date:</b> {new Date(a.datetime).toLocaleString()}</p> 
         <p><b>Reason:</b> {a.reason}</p> 
         <p><b>Payment:</b> {a.paymentStatus}</p> 
 
         {a.telemedicineLink && ( 
           <div> 
             <a href={a.telemedicineLink} target="_blank" rel="noreferrer"> 
               Open Call Link 
             </a> 
           </div> 
         )} 
 
         <div style={{ marginTop: 8 }}> 
           <Link to={`/doctor/prescribe/${a.patientId}`}>Issue Prescription</Link> 
         </div> 
 
         {a.status === "PENDING" && ( 
           <div style={{ marginTop: 8 }}> 
             <button onClick={() => updateStatus(a._id, "ACCEPTED")}>Accept</button> 
             <button onClick={() => updateStatus(a._id, "REJECTED")} style={{ marginLeft: 8 }}> 
               Reject 
             </button> 
           </div> 
         )} 
 
         {a.status === "CONFIRMED" && ( 
           <div style={{ marginTop: 8 }}> 
             <button onClick={() => completeAppointment(a._id)}> 
               Mark Completed 
             </button> 
           </div> 
         )} 
       </div> 
     ))} 
   </div> 
 ); 
} 