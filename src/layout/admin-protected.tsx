import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";

const AdminProtected = () => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/auth/signin" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
};

export default AdminProtected;
