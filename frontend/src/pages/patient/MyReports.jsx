import { useEffect, useState } from "react";
import axios from "axios";
import { API, authHeaders } from "../../api/client";

export default function MyReports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API.patient}/patients/me/reports`, {
          headers: authHeaders(),
        });
        setReports(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to load reports");
      }
    };

    load();
  }, []);

  const deleteReport = async (filename) => {
    try {
      await axios.delete(`${API.patient}/patients/me/reports/${filename}`, {
        headers: authHeaders(),
      });
      alert("Report deleted");
      // Reload reports after deletion by calling the load function
      // Since load is now inside useEffect, we need to fetch again
      const res = await axios.get(`${API.patient}/patients/me/reports`, {
        headers: authHeaders(),
      });
      setReports(res.data);
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>My Reports</h2>

      {reports.length === 0 && <p>No reports yet.</p>}

      <ul>
        {reports.map((r, index) => (
          <li key={index} style={{ marginBottom: 12 }}>
            <b>{r.originalName}</b> — {new Date(r.uploadedAt).toLocaleString()}
            <br />
            {r.downloadUrl && (
              <a href={r.downloadUrl} target="_blank" rel="noreferrer">
                Download / View
              </a>
            )}
            <button
              onClick={() => deleteReport(r.filename)}
              style={{ marginLeft: 12 }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}