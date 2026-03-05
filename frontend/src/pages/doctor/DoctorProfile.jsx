import React, { useState } from "react";
import axios from "axios";

const DoctorProfile = () => {
  const [doctor, setDoctor] = useState({
    name: "",
    email: "",
    specialization: "",
    phone: "",
  });

  const handleChange = (e) => {
    setDoctor({
      ...doctor,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        "http://localhost:4003/doctors/update",
        doctor
      );

      alert("Profile updated successfully");
      console.log(response.data);
    } catch (error) {
      console.error("Error updating profile", error);
      alert("Failed to update profile");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Doctor Profile</h2>

      <form onSubmit={handleSubmit} style={{ maxWidth: "400px" }}>
        <div>
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={doctor.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={doctor.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Specialization</label>
          <input
            type="text"
            name="specialization"
            value={doctor.specialization}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Phone</label>
          <input
            type="text"
            name="phone"
            value={doctor.phone}
            onChange={handleChange}
            required
          />
        </div>

        <br />

        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
};

export default DoctorProfile;