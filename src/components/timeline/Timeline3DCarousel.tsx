import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { timelineData } from "@/data/timelineData";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const Timeline3DCarousel = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [active, setActive] = useState(0);
  const total = timelineData.length;

  const go = useCallback(
    (dir: number) => {
      setActive((prev) => (prev + dir + total) % total);
    },
    [total]
  );

  // Auto-play
  useEffect(() => {
    const timer = setInterval(() => go(1), 5000);
    return () => clearInterval(timer);
  }, [go]);

  // Touch swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const getCardStyle = (index: number) => {
    const diff = (index - active + total) % total;
    const mapped = diff <= Math.floor(total / 2) ? diff : diff - total;
    const absMap = Math.abs(mapped);
    const sign = mapped >= 0 ? 1 : -1;

    const xSpread = isMobile ? 180 : 320;
    const xFar = isMobile ? 280 : 520;

    if (absMap > 2)
      return { opacity: 0, scale: 0.5, x: sign * 600, z: -400, rotateY: sign * -45, zIndex: 0 };

    const configs: Record<number, { x: number; z: number; scale: number; rotateY: number; opacity: number; zIndex: number }> = {
      0: { x: 0, z: 0, scale: 1, rotateY: 0, opacity: 1, zIndex: 30 },
      1: { x: sign * xSpread, z: -150, scale: 0.78, rotateY: sign * -15, opacity: 0.6, zIndex: 20 },
      2: { x: sign * xFar, z: -280, scale: 0.6, rotateY: sign * -25, opacity: 0.25, zIndex: 10 },
    };

    return configs[absMap];
  };

  const cardWidth = isMobile ? 260 : 380;
  const stageHeight = isMobile ? 360 : 480;

  return (
    <div className="relative w-full">
      {/* 3D Stage */}
      <div
        className="relative mx-auto"
        style={{ perspective: "1200px", height: `${stageHeight}px`, maxWidth: "1100px", overflow: "visible" }}
        onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchStart === null) return;
          const diff = e.changedTouches[0].clientX - touchStart;
          if (Math.abs(diff) > 50) go(diff > 0 ? -1 : 1);
          setTouchStart(null);
        }}
      >
        {/* Clip wrapper to hide overflowing side cards */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="relative w-full h-full">
            {timelineData.map((period, index) => {
              const style = getCardStyle(index);
              if (!style) return null;
              const isActive = index === active;

              return (
                <motion.div
                  key={period.id}
                  className="absolute cursor-pointer"
                  style={{
                    transformStyle: "preserve-3d",
                    width: `${cardWidth}px`,
                    left: "50%",
                    top: "50%",
                    zIndex: style.zIndex,
                  }}
                  animate={{
                    x: (style.x ?? 0) - cardWidth / 2,
                    y: -(stageHeight / 2 - 20),
                    z: style.z,
                    scale: style.scale,
                    rotateY: style.rotateY,
                    opacity: style.opacity,
                  }}
                  transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
                  onClick={() => {
                    if (isActive) navigate("/timeline");
                    else {
                      const d = (index - active + total) % total;
                      go(d <= Math.floor(total / 2) ? d : d - total);
                    }
                  }}
                  whileHover={isActive ? { scale: 1.04 } : {}}
                >
                  <div
                    className={`relative rounded-2xl overflow-hidden transition-shadow duration-500 ${
                      isActive
                        ? "shadow-[0_20px_60px_-10px_hsl(var(--accent)/0.35)] ring-2 ring-accent/20"
                        : ""
                    }`}
                  >
                    {/* Image */}
                    <div className={`relative overflow-hidden ${isMobile ? "h-[180px]" : "h-[280px]"}`}>
                      <img
                        src={period.image}
                        alt={period.title}
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/40 to-transparent" />

                      {/* Number badge */}
                      <div className="absolute top-3 left-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-accent/90 backdrop-blur-sm flex items-center justify-center">
                          <span className="text-lg md:text-xl font-bold text-accent-foreground">
                            {period.number}
                          </span>
                        </div>
                      </div>

                      {/* Time range */}
                      <div className="absolute top-3 right-3">
                        <span className="text-[10px] md:text-xs font-medium text-primary-foreground/80 bg-foreground/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
                          {period.timeRange}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="bg-card p-4 md:p-5">
                      <h3 className="text-xs md:text-sm font-bold text-foreground mb-1.5 line-clamp-1">
                        {period.title}
                      </h3>
                      <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-2">
                        {period.focus}
                      </p>

                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="flex items-center gap-1.5 text-accent text-[10px] md:text-xs font-semibold"
                        >
                          Khám phá ngay
                          <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 md:gap-6 mt-4 md:mt-6">
        <button
          onClick={() => go(-1)}
          className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-border bg-card hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all flex items-center justify-center"
          aria-label="Previous"
        >
          <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
        </button>

        <div className="flex items-center gap-1.5 md:gap-2">
          {timelineData.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                const d = (i - active + total) % total;
                go(d <= Math.floor(total / 2) ? d : d - total);
              }}
              className={`transition-all duration-300 rounded-full ${
                i === active
                  ? "w-6 md:w-8 h-2 md:h-2.5 bg-accent"
                  : "w-2 md:w-2.5 h-2 md:h-2.5 bg-border hover:bg-muted-foreground/40"
              }`}
              aria-label={`Period ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => go(1)}
          className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-border bg-card hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all flex items-center justify-center"
          aria-label="Next"
        >
          <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>
    </div>
  );
};

export default Timeline3DCarousel;
