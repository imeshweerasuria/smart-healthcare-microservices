import { useState } from "react"; 
import { useParams } from "react-router-dom"; 
import axios from "axios"; 
import { API, authHeaders } from "../../api/client"; 
 
export default function IssuePrescription() { 
 const { patientId } = useParams(); 
 const [meds, setMeds] = useState(""); 
 const [notes, setNotes] = useState(""); 
 
 const submit = async () => { 
   try { 
     await axios.post( 
       `${API.doctor}/prescriptions`, 
       { patientId, meds, notes }, 
       { headers: authHeaders() } 
     ); 
     alert("Prescription issued"); 
     setMeds(""); 
     setNotes(""); 
   } catch (err) { 
     console.error(err); 
     alert("Failed to issue prescription"); 
   } 
 }; 
 
 return ( 
   <div style={{ padding: 24 }}> 
     <h2>Issue Prescription</h2> 
     <p>PatientId: <code>{patientId}</code></p> 
 
     <input 
       value={meds} 
       onChange={(e) => setMeds(e.target.value)} 
       placeholder="Meds: Paracetamol 500mg..." 
     /> 
 
     <br /><br /> 
 
     <input 
       value={notes} 
       onChange={(e) => setNotes(e.target.value)} 
       placeholder="Notes..." 
     /> 
 
     <br /><br /> 
 
     <button onClick={submit} disabled={!meds}> 
       Submit 
     </button> 
   </div> 
 ); 
} 