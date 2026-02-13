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
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem
          value={period.id}
          className="border border-border rounded-xl bg-card overflow-hidden shadow-editorial hover:shadow-card transition-all duration-500 group/card"
        >
          <AccordionTrigger className="px-0 py-0 hover:no-underline [&>svg]:hidden">
            <div className="flex w-full">
              {/* Image thumbnail */}
              <div className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0 overflow-hidden">
                <img
                  src={period.image}
                  alt={period.title}
                  className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/20" />
                {/* Number overlay */}
                <div className="absolute bottom-1 right-2 text-xs font-bold text-background/80 bg-foreground/60 backdrop-blur-sm px-1.5 py-0.5 rounded">
                  {period.number}
                </div>
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0 px-5 md:px-6 py-4 md:py-5 flex items-center">
                <div className="flex-1 text-left">
                  <h3 className="text-sm md:text-base font-bold text-foreground group-hover/card:text-accent transition-colors mb-1 leading-snug">
                    {period.title}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {period.timeRange}
                  </p>
                </div>

                <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover/card:text-accent transition-all flex-shrink-0 ml-2" />
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="px-5 md:px-6 pb-6"
            >
              {/* Focus description */}
              <div className="flex items-start gap-3 mb-6 p-4 rounded-lg bg-accent/5 border border-accent/10">
                <div className="w-1 self-stretch bg-accent rounded-full flex-shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {period.focus}
                </p>
              </div>

              <div className="space-y-6">
                {period.phases.map((phase, index) => (
                  <motion.div
                    key={phase.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 + index * 0.08 }}
                  >
                    <TimelinePhase phase={phase} phaseIndex={index} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </motion.div>
  );
};

export default TimelinePeriod;
