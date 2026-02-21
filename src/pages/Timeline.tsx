import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import TimelinePeriod from "@/components/timeline/TimelinePeriod";
import { timelineData, Period, Phase, Milestone } from "@/data/timelineData";
import { supabase } from "@/integrations/supabase/client";
import UserHeader from "@/components/layout/UserHeader";
import logo from "@/assets/logo.png";

const Timeline = () => {
  const [dbMilestones, setDbMilestones] = useState<any[] | null>(null);

  useEffect(() => {
    const fetchMilestones = async () => {
      const { data } = await supabase
        .from("milestones")
        .select("id, title, period_id, phase_id, sort_order, year")
        .order("sort_order");
      setDbMilestones(data);
    };
    fetchMilestones();
  }, []);

  // Merge DB milestones with static period structure
  const mergedData: Period[] = useMemo(() => {
    if (!dbMilestones) return timelineData; // Fallback to static while loading

    // Group DB milestones by period_id → phase_id
    const byPeriodPhase: Record<string, Record<string, Milestone[]>> = {};
    dbMilestones.forEach((m) => {
      if (!byPeriodPhase[m.period_id]) byPeriodPhase[m.period_id] = {};
      if (!byPeriodPhase[m.period_id][m.phase_id]) byPeriodPhase[m.period_id][m.phase_id] = [];
      byPeriodPhase[m.period_id][m.phase_id].push({
        id: m.id,
        title: m.title,
        year: m.year || undefined,
      });
    });

    return timelineData.map((period) => ({
      ...period,
      phases: period.phases.map((phase) => ({
        ...phase,
        milestones: byPeriodPhase[period.id]?.[phase.id] || phase.milestones,
      })),
    }));
  }, [dbMilestones]);

  const totalMilestones = mergedData.reduce(
    (sum, p) => sum + p.phases.reduce((s, ph) => s + ph.milestones.length, 0), 0
  );

  return (
    <div className="min-h-screen bg-background">
      <UserHeader />

      {/* Hero */}
      <section className="relative py-20 md:py-32 px-6 md:px-12 overflow-hidden bg-foreground">
        <div className="absolute inset-0 heritage-pattern opacity-5" />
        <div className="absolute inset-0 dong-son-pattern opacity-20" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-4 lotus-border opacity-60" />

        <div className="container mx-auto relative z-10">
          <div className="grid md:grid-cols-12 gap-8 items-end">
            <div className="md:col-span-7">
              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-3 mb-5">
                <div className="w-8 h-[2px] bg-accent" />
                <p className="text-accent uppercase tracking-wider text-xs font-medium">Khám phá</p>
              </motion.div>
              <motion.h2 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-primary-foreground mb-4 leading-tight">
                Dòng chảy{" "}<span className="italic text-accent">lịch sử</span>
              </motion.h2>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="flex items-start gap-4">
                <div className="w-10 h-[2px] bg-accent mt-3 flex-shrink-0" />
                <p className="text-primary-foreground/50 text-base md:text-lg max-w-md leading-relaxed">
                  Từ buổi bình minh của nền văn minh sông Hồng đến thời đại đổi mới — hành trình bốn ngàn năm lịch sử.
                </p>
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="md:col-span-4 md:col-start-9">
              <div className="grid grid-cols-2 gap-8">
                <div className="border-l-2 border-accent/40 pl-4">
                  <div className="text-4xl font-bold text-primary-foreground mb-1">{totalMilestones}</div>
                  <div className="text-sm text-primary-foreground/40">Cột mốc</div>
                </div>
                <div className="border-l-2 border-accent/40 pl-4">
                  <div className="text-4xl font-bold text-primary-foreground mb-1">4000+</div>
                  <div className="text-sm text-primary-foreground/40">Năm văn hiến</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="py-12 md:py-24 px-6 md:px-12 relative">
        <div className="absolute inset-0 dong-son-pattern opacity-[0.02] pointer-events-none" />
        <div className="container mx-auto max-w-4xl relative z-10">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="flex items-center gap-3 mb-8 md:mb-10">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <p className="text-sm text-muted-foreground">Chọn thời kỳ để khám phá chi tiết từng cột mốc lịch sử</p>
          </motion.div>

          <div className="space-y-4">
            {mergedData.map((period, index) => (
              <motion.div key={period.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 + index * 0.08 }}>
                <TimelinePeriod period={period} />
              </motion.div>
            ))}
          </div>

          <div className="mt-16 flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-accent/30 text-xs tracking-[0.5em]">✦ ✦ ✦</span>
            <div className="flex-1 h-px bg-border" />
          </div>
        </div>
      </main>

      <footer className="py-8 px-6 md:px-12 border-t border-border relative">
        <div className="absolute inset-0 wave-pattern opacity-20 pointer-events-none" />
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="w-6 h-6 rounded-md object-contain" />
            <span className="text-base font-semibold">Echoes of <span className="italic text-accent">Vietnam</span></span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 ✦ Tryyourbest — Giữ gìn lịch sử dân tộc</p>
        </div>
      </footer>
    </div>
  );
};

export default Timeline;
