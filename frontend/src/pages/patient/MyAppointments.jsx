import { useEffect, useState } from "react";
import axios from "axios";

export default function MyAppointments() {
  const [list, setList] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:4004/appointments/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (isMounted) {
        setList(res.data);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div>
      <h2>My Appointments</h2>

      {list.length === 0 && <p>No appointments yet.</p>}

      <ul>
        {list.map((a) => (
          <li key={a._id}>
            <b>Status:</b> {a.status} <br />
            <b>DoctorId:</b> {a.doctorId} <br />
            <b>Date:</b> {new Date(a.datetime).toLocaleString()} <br />
            <b>Reason:</b> {a.reason}
          </li>
        ))}
      </ul>
    </div>
  );
}