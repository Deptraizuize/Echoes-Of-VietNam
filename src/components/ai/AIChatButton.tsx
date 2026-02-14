import { useState, useEffect } from "react";
import { Bot, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AIChatPanel from "./AIChatPanel";
import { useNavigate } from "react-router-dom";

interface AIChatButtonProps {
  milestoneId?: string;
  milestoneTitle?: string;
}

const AIChatButton = ({ milestoneId, milestoneTitle }: AIChatButtonProps) => {
  const [open, setOpen] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showUpgradeHint, setShowUpgradeHint] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const check = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("is_premium")
        .eq("user_id", user.id)
        .single();
      if (data) setIsPremium(data.is_premium);
    };
    check();
  }, [user]);

  const handleClick = () => {
    if (!isPremium) {
      setShowUpgradeHint(true);
      setTimeout(() => setShowUpgradeHint(false), 3000);
      return;
    }
    setOpen(true);
  };

  return (
    <>
      {/* Upgrade hint tooltip */}
      <AnimatePresence>
        {showUpgradeHint && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 bg-card border border-accent/30 rounded-xl p-4 shadow-2xl max-w-[280px]"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Crown className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Tính năng Premium</p>
                <p className="text-xs text-muted-foreground mb-2">
                  Trợ lý AI Lịch sử chỉ dành cho Người Yêu Sử. Nâng cấp chỉ 19k/tháng!
                </p>
                <button
                  onClick={() => navigate("/upgrade")}
                  className="text-xs font-medium text-accent hover:underline"
                >
                  Nâng cấp ngay →
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleClick}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors ${
          isPremium
            ? "bg-accent text-accent-foreground hover:bg-accent/90"
            : "bg-muted text-muted-foreground hover:bg-muted/80 border border-border"
        }`}
        aria-label="AI Trợ lý Lịch sử"
      >
        <Bot className="w-6 h-6" />
        {!isPremium && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
            <Crown className="w-3 h-3 text-accent-foreground" />
          </div>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <AIChatPanel
            onClose={() => setOpen(false)}
            milestoneId={milestoneId}
            milestoneTitle={milestoneTitle}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatButton;
