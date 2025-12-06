import { Navigate } from "react-router-dom";
import authService from "../services/authService";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login/student" replace />;
  }

  // allowedRoles example: ["TEACHER"] or ["STUDENT"]
  if (allowedRoles && !allowedRoles.includes(user.userType)) {
    // If wrong role, redirect to their main page
    if (user.userType === "STUDENT") return <Navigate to="/ai-evaluate" replace />;
    if (user.userType === "TEACHER") return <Navigate to="/teacher/classroom" replace />;
    return <Navigate to="/login/student" replace />;
  }

  return children;
};

export default ProtectedRoute;
