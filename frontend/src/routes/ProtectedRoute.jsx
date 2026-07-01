import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const roleHierarchy = {
  superadmin: ["superadmin", "admin", "manager", "employee"],
  admin: ["admin", "manager", "employee"],
  manager: ["manager", "employee"],
  employee: ["employee"],
};

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user's hierarchical access covers any of the allowed roles for this route
  const userAccessLevel = roleHierarchy[user.role] || [];
  const hasAccess = allowedRoles.some((role) => userAccessLevel.includes(role));

  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
