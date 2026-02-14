import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { timelineData } from "@/data/timelineData";
import { useNavigate } from "react-router-dom";

const Timeline3DCarousel = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(0);
  const total = timelineData.length;

  const go = useCallback(
    (dir: number) => {
      setDirection(dir);
      setActive((prev) => (prev + dir + total) % total);
    },
    [total]
  );

  // Auto-play
  useEffect(() => {
    const timer = setInterval(() => go(1), 5000);
    return () => clearInterval(timer);
  }, [go]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [go]);

  const getCardStyle = (index: number) => {
    const diff = ((index - active + total) % total);
    // Map to positions: 0=center, 1=right, 2=far-right, ... last positions=left
    const mapped = diff <= Math.floor(total / 2) ? diff : diff - total;

    const absMap = Math.abs(mapped);
    const sign = mapped >= 0 ? 1 : -1;

    if (absMap > 2) return { opacity: 0, scale: 0.6, x: sign * 600, z: -400, rotateY: sign * -45 };

    const configs: Record<number, { x: number; z: number; scale: number; rotateY: number; opacity: number }> = {
      0: { x: 0, z: 0, scale: 1, rotateY: 0, opacity: 1 },
      1: { x: sign * 320, z: -120, scale: 0.82, rotateY: sign * -18, opacity: 0.7 },
      2: { x: sign * 520, z: -220, scale: 0.65, rotateY: sign * -30, opacity: 0.35 },
    };

    return configs[absMap];
  };

  return (
    <div className="relative w-full">
      {/* 3D Stage */}
      <div
        className="relative mx-auto overflow-hidden"
        style={{ perspective: "1200px", height: "480px", maxWidth: "1100px" }}
      >
        {timelineData.map((period, index) => {
          const style = getCardStyle(index);
          if (!style) return null;
          const isActive = index === active;

          return (
            <motion.div
              key={period.id}
              className="absolute left-1/2 top-1/2 cursor-pointer"
              style={{ transformStyle: "preserve-3d", width: "380px" }}
              animate={{
                x: (style.x ?? 0) - 190,
                y: -210,
                z: style.z,
                scale: style.scale,
                rotateY: style.rotateY,
                opacity: style.opacity,
              }}
              transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
              onClick={() => {
                if (isActive) navigate("/timeline");
                else {
                  const diff = ((index - active + total) % total);
                  go(diff <= Math.floor(total / 2) ? diff : diff - total);
                }
              }}
              whileHover={isActive ? { scale: 1.03, y: -218 } : {}}
            >
              <div
                className={`relative rounded-2xl overflow-hidden transition-shadow duration-500 ${
                  isActive
                    ? "shadow-[0_20px_60px_-10px_hsl(var(--accent)/0.4)] ring-2 ring-accent/30"
                    : "shadow-card"
                }`}
              >
                {/* Image */}
                <div className="relative h-[280px] overflow-hidden">
                  <img
                    src={period.image}
                    alt={period.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/40 to-transparent" />

                  {/* Number badge */}
                  <div className="absolute top-4 left-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/90 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-xl font-bold text-accent-foreground">
                        {period.number}
                      </span>
                    </div>
                  </div>

                  {/* Time range pill */}
                  <div className="absolute top-4 right-4">
                    <span className="text-xs font-medium text-primary-foreground/80 bg-foreground/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      {period.timeRange}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="bg-card p-5">
                  <h3 className="text-sm font-bold text-foreground mb-2 line-clamp-1">
                    {period.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                    {period.focus}
                  </p>

                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center gap-2 text-accent text-xs font-semibold"
                    >
                      Khám phá ngay
                      <ArrowRight className="w-3.5 h-3.5" />
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 mt-6">
        <button
          onClick={() => go(-1)}
          className="w-10 h-10 rounded-full border border-border bg-card hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all flex items-center justify-center"
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Dots */}
        <div className="flex items-center gap-2">
          {timelineData.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                const diff = ((i - active + total) % total);
                go(diff <= Math.floor(total / 2) ? diff : diff - total);
              }}
              className={`transition-all duration-300 rounded-full ${
                i === active
                  ? "w-8 h-2.5 bg-accent"
                  : "w-2.5 h-2.5 bg-border hover:bg-muted-foreground/40"
              }`}
              aria-label={`Go to period ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => go(1)}
          className="w-10 h-10 rounded-full border border-border bg-card hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all flex items-center justify-center"
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Timeline3DCarousel;
