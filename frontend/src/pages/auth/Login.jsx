import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, saveSession } from "../../api/auth";

export default function Login() {
 const navigate = useNavigate();

 const [form, setForm] = useState({
   email: "",
   password: "",
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
     const data = await login(form);

     saveSession(data);

     if (data.role === "PATIENT") navigate("/patient");
     else if (data.role === "DOCTOR") navigate("/doctor");
     else if (data.role === "ADMIN") navigate("/admin");
     else navigate("/");
   } catch (err) {
     console.error(err);
     alert(err.response?.data?.message || "Login failed");
   } finally {
     setLoading(false);
   }
 };

 return (
   <div style={{ padding: 24 }}>
     <h1>Login</h1>

     <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
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

       <button type="submit" disabled={loading}>
         {loading ? "Logging in..." : "Login"}
       </button>
     </form>

     <br />
     <p>
       No account? <Link to="/register">Register here</Link>
     </p>
   </div>
 );
}
