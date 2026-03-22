import { useState } from "react"; 
import { useParams } from "react-router-dom"; 
import axios from "axios"; 
import { authHeaders } from "../../api/client"; 
export default function IssuePrescription() { 
const { patientId } = useParams(); 
const [meds, setMeds] = useState(""); 
const [notes, setNotes] = useState(""); 
const submit = async () => { 
await axios.post( 
"http://localhost:4003/prescriptions", 
{ patientId, meds, notes }, 
{ headers: authHeaders() } 
); 
alert("Prescription issued"); 
   setMeds(""); 
   setNotes(""); 
 }; 
 
 return ( 
   <div> 
     <h2>Issue Prescription</h2> 
     <p>PatientId: <code>{patientId}</code></p> 
     <input value={meds} onChange={(e) => setMeds(e.target.value)} 
placeholder="Meds: Paracetamol 500mg..." /> 
     <br /><br /> 
     <input value={notes} onChange={(e) => setNotes(e.target.value)} 
placeholder="Notes..." /> 
     <br /><br /> 
     <button onClick={submit} disabled={!meds}>Submit</button> 
   </div> 
 ); 
} 