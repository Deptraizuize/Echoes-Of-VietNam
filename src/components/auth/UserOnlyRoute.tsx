/**
 * Route guard: chặn admin truy cập các trang chỉ dành cho user thường.
 * Admin sẽ được redirect về /admin.
 */
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const UserOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

export default UserOnlyRoute;
