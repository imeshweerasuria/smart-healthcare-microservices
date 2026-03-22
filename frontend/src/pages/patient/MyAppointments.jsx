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
          <li key={a._id} style={{ marginBottom: "20px" }}>
            <b>Status:</b> {a.status} <br />
            <b>DoctorId:</b> {a.doctorId} <br />
            <b>Date:</b> {new Date(a.datetime).toLocaleString()} <br />
            <b>Reason:</b> {a.reason} <br />
            <b>Payment Status:</b> {a.paymentStatus || "NOT PAID"} <br />

            {a.telemedicineLink && (
              <div>
                <a href={a.telemedicineLink} target="_blank" rel="noreferrer">
                  Join Call
                </a>
              </div>
            )}

            {/* 🔥 Create Payment Button */}
            {a.status === "ACCEPTED" && a.paymentStatus !== "PAID" && (
              <button
                onClick={() => {
                  const token = localStorage.getItem("token");

                  fetch("http://localhost:4007/payments/for-appointment", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      appointmentId: a._id,
                      amount: 1000,
                    }),
                  })
                    .then((r) => r.json())
                    .then((data) => {
                      alert(
                        `Payment record created.\nPayment ID: ${data.paymentId}`
                      );
                    })
                    .catch(() => alert("Payment create failed"));
                }}
              >
                Pay (Create Payment Record)
              </button>
            )}

            {/* 🔥 Mark Paid Button (Demo) */}
            {a.status === "ACCEPTED" && a.paymentStatus !== "PAID" && (
              <button
                style={{ marginLeft: "10px" }}
                onClick={() => {
                  const token = localStorage.getItem("token");

                  const paymentId = prompt("Enter paymentId to mark PAID:");
                  if (!paymentId) return;

                  fetch("http://localhost:4007/payments/mark-paid", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ paymentId }),
                  })
                    .then((r) => r.json())
                    .then(() => {
                      alert("Marked paid. Refreshing...");
                      window.location.reload(); // quick refresh
                    })
                    .catch(() => alert("Mark paid failed"));
                }}
              >
                Mark Paid (Demo)
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}