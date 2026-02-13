import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import notFoundImage from "@/assets/404-illustration.jpg";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md"
      >
        <motion.img
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          src={notFoundImage}
          alt="Page not found"
          className="w-48 h-48 mx-auto mb-8 rounded-2xl object-cover shadow-card"
        />
        <h1 className="text-6xl font-bold text-foreground mb-2">404</h1>
        <p className="text-xl text-muted-foreground mb-2">Trang không tồn tại</p>
        <p className="text-sm text-muted-foreground mb-8">
          Con đường bạn tìm đã bị thất lạc trong dòng lịch sử...
        </p>
        <Button
          onClick={() => navigate("/")}
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Về trang chủ
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFound;
