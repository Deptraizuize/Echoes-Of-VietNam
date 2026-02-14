import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface ScrollIndicatorProps {
  targetId: string;
}

const ScrollIndicator = ({ targetId }: ScrollIndicatorProps) => {
  const handleClick = () => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 text-primary-foreground/30 hover:text-accent transition-colors group cursor-pointer"
      aria-label="Cuộn xuống"
    >
      <span className="text-[10px] uppercase tracking-widest">Khám phá</span>
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown className="w-5 h-5" />
      </motion.div>
    </motion.button>
  );
};

export default ScrollIndicator;
