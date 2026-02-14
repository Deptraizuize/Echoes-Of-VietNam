import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";
import vietnamMap from "@/assets/vietnam-map.jpg";
import { useAuth } from "@/contexts/AuthContext";
import ScrollIndicator from "./ScrollIndicator";

const HeroSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="relative min-h-[92vh] md:min-h-screen flex items-center overflow-hidden bg-foreground">
      {/* Vietnam map background */}
      <div className="absolute inset-0">
        <img src={vietnamMap} alt="" className="absolute right-0 top-0 h-full w-auto object-cover opacity-20 md:opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/95 md:via-foreground/90 to-foreground/60 md:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground via-transparent to-foreground/60" />
      </div>

      <div className="absolute inset-0 heritage-pattern opacity-[0.03]" />
      <div className="absolute inset-0 dong-son-pattern opacity-[0.06]" />

      <div className="container mx-auto px-5 md:px-12 relative z-10 pt-20 pb-8 md:pt-24 md:pb-12">
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-primary-foreground/40 uppercase tracking-wider text-xs md:text-sm mb-4 md:mb-6"
          >
            Hành trình xuyên thời gian
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex items-center gap-4 md:gap-6 mb-5 md:mb-8"
          >
            <img
              src={logo}
              alt="Logo"
              className="w-14 h-14 md:w-20 md:h-20 rounded-xl object-contain flex-shrink-0"
            />
            <h1 className="text-primary-foreground text-4xl md:text-7xl lg:text-8xl font-extrabold leading-[0.95]">
              Echoes of
              <br />
              <span className="italic text-accent">Vietnam</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex items-start gap-3 md:gap-4 mb-8 md:mb-12"
          >
            <div className="w-10 md:w-14 h-[2px] bg-accent mt-3 flex-shrink-0" />
            <p className="text-primary-foreground/50 text-sm md:text-xl max-w-lg leading-relaxed">
              Khám phá hàng nghìn năm lịch sử hào hùng — từ thời Hồng Bàng đến
              thời đại đổi mới, qua từng trang sử vàng son
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-14 md:mb-20"
          >
            <Button
              size="lg"
              onClick={() => navigate("/timeline")}
              className="bg-accent hover:bg-accent/90 text-accent-foreground text-sm md:text-base py-6 md:py-7 px-8 group"
            >
              Bắt đầu hành trình
              <ArrowRight className="w-4 h-4 ml-3 transition-transform group-hover:translate-x-1" />
            </Button>
            {!user && (
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="border border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 text-sm md:text-base py-6 md:py-7 px-8"
              >
                ✦ Đăng ký miễn phí
              </Button>
            )}
            {user && (
              <Button
                size="lg"
                onClick={() => navigate("/profile")}
                className="border border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 text-sm md:text-base py-6 md:py-7 px-8"
              >
                Xem hồ sơ của tôi
              </Button>
            )}
          </motion.div>
        </div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="pt-6 md:pt-8 border-t border-primary-foreground/10"
        >
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-lg">
            {[
              { value: "5", label: "Thời kỳ lịch sử" },
              { value: "41", label: "Cột mốc quan trọng" },
              { value: "4000+", label: "Năm văn hiến" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 + index * 0.15 }}
              >
                <div className="text-2xl md:text-4xl font-bold text-accent mb-1">
                  {stat.value}
                </div>
                <div className="text-[10px] md:text-sm text-primary-foreground/40">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <ScrollIndicator targetId="features" />
    </section>
  );
};

export default HeroSection;
