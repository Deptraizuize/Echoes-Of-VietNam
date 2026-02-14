import { useRef } from "react";
import { motion, useInView, Variant } from "framer-motion";

type Direction = "up" | "left" | "right" | "scale";

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  direction?: Direction;
  delay?: number;
  once?: boolean;
  amount?: number;
}

const variants: Record<Direction, { hidden: Variant; visible: Variant }> = {
  up: {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0 },
  },
  left: {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0 },
  },
  right: {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  },
};

const AnimatedSection = ({
  children,
  className = "",
  direction = "up",
  delay = 0,
  once = true,
  amount = 0.2,
}: AnimatedSectionProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants[direction]}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedSection;
