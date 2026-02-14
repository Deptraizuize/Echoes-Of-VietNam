import { useState } from "react";
import { Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AIChatPanel from "./AIChatPanel";

const AIChatButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-accent text-accent-foreground shadow-lg flex items-center justify-center hover:bg-accent/90 transition-colors"
        aria-label="AI Trợ lý Lịch sử"
      >
        <Bot className="w-6 h-6" />
      </motion.button>

      <AnimatePresence>
        {open && <AIChatPanel onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
};

export default AIChatButton;
