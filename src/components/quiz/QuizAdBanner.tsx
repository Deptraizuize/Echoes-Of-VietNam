import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Crown, ExternalLink } from "lucide-react";

interface AdBanner {
  id: string;
  title: string;
  image_url: string | null;
  link_url: string | null;
  description: string | null;
}

interface Props {
  onComplete: () => void;
}

const QuizAdBanner = ({ onComplete }: Props) => {
  const [countdown, setCountdown] = useState(10);
  const [banner, setBanner] = useState<AdBanner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanner = async () => {
      const { data } = await supabase
        .from("ad_banners")
        .select("id, title, image_url, link_url, description")
        .eq("is_active", true)
        .order("display_order")
        .limit(5);
      if (data && data.length > 0) {
        // Random pick one
        setBanner(data[Math.floor(Math.random() * data.length)]);
      }
      setLoading(false);
    };
    fetchBanner();
  }, []);

  useEffect(() => {
    if (loading) return;
    // If no banner, skip immediately
    if (!banner) {
      onComplete();
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, banner, onComplete]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!banner) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-foreground/95 flex items-center justify-center p-4"
    >
      <div className="max-w-lg w-full text-center">
        {/* Countdown */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full">
            <span className="text-sm text-accent">Quảng cáo</span>
            <span className="text-sm font-bold text-accent">{countdown}s</span>
          </div>
        </div>

        {/* Banner Content */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="bg-card rounded-2xl overflow-hidden border border-border shadow-hover"
        >
          {banner.image_url ? (
            <img
              src={banner.image_url}
              alt={banner.title}
              className="w-full h-48 md:h-64 object-cover"
            />
          ) : (
            <div className="w-full h-48 md:h-64 bg-accent/10 flex items-center justify-center">
              <Crown className="w-16 h-16 text-accent" />
            </div>
          )}
          <div className="p-6">
            <h3 className="text-xl font-bold text-foreground mb-2">{banner.title}</h3>
            {banner.description && (
              <p className="text-sm text-muted-foreground mb-4">{banner.description}</p>
            )}
            {banner.link_url && (
              <a
                href={banner.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
              >
                Tìm hiểu thêm <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </motion.div>

        {/* Skip Button - only shows after countdown */}
        {countdown === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              onClick={onComplete}
              className="mt-6 px-8 py-3 bg-accent text-accent-foreground font-medium rounded-xl hover:bg-accent/90 transition-colors text-sm"
            >
              Tiếp tục làm Quiz →
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default QuizAdBanner;
