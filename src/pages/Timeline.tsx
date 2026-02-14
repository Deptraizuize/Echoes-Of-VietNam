import { motion } from "framer-motion";
import TimelinePeriod from "@/components/timeline/TimelinePeriod";
import { timelineData } from "@/data/timelineData";
import UserHeader from "@/components/layout/UserHeader";


const Timeline = () => {
  return (
    <div className="min-h-screen bg-background">
      <UserHeader />

      {/* Hero */}
      <section className="relative py-24 md:py-32 px-6 md:px-12 overflow-hidden bg-foreground">
        <div className="absolute inset-0 heritage-pattern opacity-5" />
        <div className="absolute inset-0 dong-son-pattern opacity-30" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />

        <div className="container mx-auto relative z-10">
          <div className="grid md:grid-cols-12 gap-8 items-end">
            <div className="md:col-span-7">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-3 mb-6"
              >
                <div className="w-8 h-[2px] bg-accent" />
                <p className="text-accent uppercase tracking-wider text-xs font-medium">
                  Khám phá
                </p>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-primary-foreground mb-4 leading-tight"
              >
                Dòng chảy{" "}
                <span className="italic text-accent">lịch sử</span>
              </motion.h2>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex items-start gap-4"
              >
                <div className="w-10 h-[2px] bg-accent mt-3 flex-shrink-0" />
                <p className="text-primary-foreground/50 text-lg max-w-md">
                  Từ buổi bình minh của nền văn minh sông Hồng đến thời đại đổi mới.
                </p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="md:col-span-4 md:col-start-9"
            >
              <div className="grid grid-cols-2 gap-8">
                <div className="border-l-2 border-accent/40 pl-4">
                  <div className="text-4xl font-bold text-primary-foreground mb-1">41</div>
                  <div className="text-sm text-primary-foreground/40">Cột mốc</div>
                </div>
                <div className="border-l-2 border-accent/40 pl-4">
                  <div className="text-4xl font-bold text-primary-foreground mb-1">4000+</div>
                  <div className="text-sm text-primary-foreground/40">Năm</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="py-16 md:py-24 px-6 md:px-12">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-3 mb-10"
          >
            <div className="w-3 h-3 rounded-full bg-accent" />
            <p className="text-sm text-muted-foreground">
              Chọn thời kỳ để khám phá chi tiết từng cột mốc lịch sử
            </p>
          </motion.div>

          <div className="space-y-4">
            {timelineData.map((period) => (
              <TimelinePeriod key={period.id} period={period} />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 md:px-12 border-t border-border relative">
        <div className="absolute inset-0 wave-pattern opacity-30" />
        <div className="container mx-auto flex items-center justify-between relative z-10">
          <span className="text-lg font-semibold">
            Echoes of <span className="italic text-accent">Vietnam</span>
          </span>
          <p className="text-sm text-muted-foreground">© 2025 ✦ Tryyourbest</p>
        </div>
      </footer>
      
    </div>
  );
};

export default Timeline;
