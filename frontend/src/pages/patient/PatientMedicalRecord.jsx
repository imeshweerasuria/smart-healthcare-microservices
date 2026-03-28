import { useEffect, useState } from "react";
import axios from "axios";
import { API, authHeaders } from "../../api/client";

export default function PatientMedicalRecord() {
  const [profile, setProfile] = useState(null);
  const [reports, setReports] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, reportsRes, prescriptionsRes] = await Promise.all([
          axios.get(`${API.patient}/patients/me`, { headers: authHeaders() }),
          axios.get(`${API.patient}/patients/me/reports`, { headers: authHeaders() }),
          axios.get(`${API.patient}/patients/me/prescriptions`, { headers: authHeaders() }),
        ]);

        setProfile(profileRes.data);
        setReports(reportsRes.data);
        setPrescriptions(prescriptionsRes.data);
      } catch (err) {
        console.error(err);
        alert("Failed to load medical record");
      }
    };

    load();
  }, []);

  if (!profile) return <div style={{ padding: 24 }}>Loading...</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2>My Medical Record</h2>

      <div style={{ border: "1px solid #ccc", padding: 12, marginBottom: 16 }}>
        <p><b>Date of Birth:</b> {profile.dateOfBirth || "-"}</p>
        <p><b>Gender:</b> {profile.gender || "-"}</p>
        <p><b>Phone:</b> {profile.phone || "-"}</p>
        <p><b>Address:</b> {profile.address || "-"}</p>
        <p><b>Medical History:</b> {profile.medicalHistory || "-"}</p>
        <p><b>Allergies:</b> {(profile.allergies || []).join(", ") || "-"}</p>
        <p><b>Chronic Conditions:</b> {(profile.chronicConditions || []).join(", ") || "-"}</p>
      </div>

      <div style={{ border: "1px solid #ccc", padding: 12, marginBottom: 16 }}>
        <h3>Reports Summary</h3>
        <p>Total Reports: {reports.length}</p>
      </div>

      <div style={{ border: "1px solid #ccc", padding: 12 }}>
        <h3>Prescriptions Summary</h3>
        <p>Total Prescriptions: {prescriptions.length}</p>
      </div>
    </div>
  );
}