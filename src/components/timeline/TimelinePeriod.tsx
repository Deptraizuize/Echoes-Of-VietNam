import { Period } from "@/data/timelineData";
import TimelinePhase from "./TimelinePhase";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface TimelinePeriodProps {
  period: Period;
}

const TimelinePeriod = ({ period }: TimelinePeriodProps) => {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem
        value={period.id}
        className="border border-border rounded-xl bg-card overflow-hidden shadow-editorial hover:shadow-card transition-all duration-500 group/card"
      >
        <AccordionTrigger className="px-0 py-0 hover:no-underline [&>svg]:hidden">
          <div className="flex w-full">
            {/* Image thumbnail */}
            <div className="relative w-24 h-24 md:w-36 md:h-36 flex-shrink-0 overflow-hidden">
              <img
                src={period.image}
                alt={period.title}
                className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/20" />
              {/* Number overlay with accent */}
              <div className="absolute bottom-1 right-2 md:bottom-2 md:right-3">
                <span className="text-2xl md:text-4xl font-extrabold text-accent/30 leading-none select-none">
                  {period.number}
                </span>
              </div>
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0 px-4 md:px-6 py-4 md:py-5 flex items-center">
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-5 h-[2px] bg-accent/60" />
                  <span className="text-[10px] md:text-xs text-accent/80 uppercase tracking-wider font-medium">
                    {period.timeRange}
                  </span>
                </div>
                <h3 className="text-sm md:text-base font-bold text-foreground group-hover/card:text-accent transition-colors leading-snug line-clamp-2">
                  {period.title}
                </h3>
              </div>

              <ChevronRight className="w-5 h-5 text-muted-foreground/40 group-hover/card:text-accent group-hover/card:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="px-4 md:px-6 pb-6"
          >
            {/* Focus description */}
            <div className="flex items-start gap-3 mb-6 p-4 rounded-lg bg-accent/5 border border-accent/10 relative overflow-hidden">
              <div className="absolute inset-0 dong-son-pattern opacity-[0.03] pointer-events-none" />
              <div className="w-1 self-stretch bg-accent rounded-full flex-shrink-0 relative z-10" />
              <p className="text-sm text-muted-foreground leading-relaxed relative z-10">
                {period.focus}
              </p>
            </div>

            <div className="space-y-6">
              {period.phases.map((phase, index) => (
                <motion.div
                  key={phase.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.12 + index * 0.06 }}
                >
                  <TimelinePhase phase={phase} phaseIndex={index} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default TimelinePeriod;
