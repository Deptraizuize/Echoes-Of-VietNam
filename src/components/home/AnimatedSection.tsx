import { useRef } from "react";
import { motion, useInView, Variant } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

type Direction = "up" | "left" | "right" | "scale";

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  direction?: Direction;
  delay?: number;
  once?: boolean;
  amount?: number;
}

const AnimatedSection = ({
  children,
  className = "",
  direction = "up",
  delay = 0,
  once = true,
  amount = 0.15,
}: AnimatedSectionProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount });
  const isMobile = useIsMobile();

  // Smaller motion distances on mobile to prevent text distortion
  const distance = isMobile ? 24 : 50;
  const scaleFrom = isMobile ? 0.95 : 0.9;

  const variants: Record<Direction, { hidden: Variant; visible: Variant }> = {
    up: {
      hidden: { opacity: 0, y: distance },
      visible: { opacity: 1, y: 0 },
    },
    left: {
      hidden: { opacity: 0, x: -distance },
      visible: { opacity: 1, x: 0 },
    },
    right: {
      hidden: { opacity: 0, x: distance },
      visible: { opacity: 1, x: 0 },
    },
    scale: {
      hidden: { opacity: 0, scale: scaleFrom },
      visible: { opacity: 1, scale: 1 },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants[direction]}
      transition={{
        duration: isMobile ? 0.5 : 0.7,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedSection;
