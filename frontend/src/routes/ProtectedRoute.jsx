import { Navigate } from "react-router-dom";
import { getRole, isLoggedIn } from "../api/auth";

export default function ProtectedRoute({ roles = [], children }) {
 if (!isLoggedIn()) return <Navigate to="/login" replace />;

 const role = getRole();
 if (roles.length > 0 && !roles.includes(role)) {
   return <Navigate to="/" replace />;
 }
 return children;
}
