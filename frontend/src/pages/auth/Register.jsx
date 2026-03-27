import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register, saveSession } from "../../api/auth";

export default function Register() {
 const navigate = useNavigate();

 const [form, setForm] = useState({
   name: "",
   email: "",
   password: "",
   role: "PATIENT",
 });
 const [loading, setLoading] = useState(false);

 const handleChange = (e) => {
   setForm((prev) => ({
     ...prev,
     [e.target.name]: e.target.value,
   }));
 };

 const handleSubmit = async (e) => {
   e.preventDefault();

   try {
     setLoading(true);
     const data = await register(form);
     saveSession(data);

     if (data.role === "PATIENT") navigate("/patient");
     else if (data.role === "DOCTOR") navigate("/doctor");
     else if (data.role === "ADMIN") navigate("/admin");
     else navigate("/");
   } catch (err) {
     console.error(err);
     alert(err.response?.data?.message || "Register failed");
   } finally {
     setLoading(false);
   }
 };

 return (
   <div style={{ padding: 24 }}>
     <h1>Register</h1>

     <form onSubmit={handleSubmit} style={{ maxWidth: 450 }}>
       <div>
         <label>Name</label>
         <br />
         <input
           name="name"
           value={form.name}
           onChange={handleChange}
           required
         />
       </div>

       <br />

       <div>
         <label>Email</label>
         <br />
         <input
           name="email"
           type="email"
           value={form.email}
           onChange={handleChange}
           required
         />
       </div>

       <br />

       <div>
         <label>Password</label>
         <br />
         <input
           name="password"
           type="password"
           value={form.password}
           onChange={handleChange}
           required
         />
       </div>

       <br />

       <div>
         <label>Role</label>
         <br />
         <select name="role" value={form.role} onChange={handleChange}>
           <option value="PATIENT">PATIENT</option>
           <option value="DOCTOR">DOCTOR</option>
           <option value="ADMIN">ADMIN</option>
         </select>
       </div>

       <br />

       <button type="submit" disabled={loading}>
         {loading ? "Creating..." : "Register"}
       </button>
     </form>

     <br />
     <p>
       Already have an account? <Link to="/login">Login here</Link>
     </p>
   </div>
 );
}
