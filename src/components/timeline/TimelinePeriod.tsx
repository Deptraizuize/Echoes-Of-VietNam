import { Period } from "@/data/timelineData";
import TimelinePhase from "./TimelinePhase";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronRight } from "lucide-react";

interface TimelinePeriodProps {
  period: Period;
}

const TimelinePeriod = ({ period }: TimelinePeriodProps) => {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem
        value={period.id}
        className="border border-border rounded-lg bg-card overflow-hidden shadow-editorial hover:shadow-card transition-shadow duration-500"
      >
        <AccordionTrigger className="px-6 md:px-8 py-6 md:py-8 hover:no-underline hover:bg-muted/20 transition-colors group [&[data-state=open]]:border-b [&[data-state=open]]:border-border">
          <div className="flex items-center gap-5 md:gap-8 w-full text-left">
            {/* Big Roman numeral with accent background */}
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors flex items-center justify-center">
                <span className="text-2xl md:text-3xl font-bold text-accent">
                  {period.number}
                </span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-base md:text-lg font-bold text-foreground group-hover:text-accent transition-colors mb-1 leading-snug">
                {period.title}
              </h3>
              <p className="text-sm text-muted-foreground font-medium">
                {period.timeRange}
              </p>
            </div>

            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-all flex-shrink-0 group-data-[state=open]:rotate-90" />
          </div>
        </AccordionTrigger>

        <AccordionContent className="px-6 md:px-8 pb-6 md:pb-8">
          <div className="pt-6">
            {/* Focus description */}
            <div className="flex items-start gap-3 mb-8 p-4 rounded-lg bg-accent/5 border border-accent/10">
              <div className="w-1 h-full min-h-[20px] bg-accent rounded-full flex-shrink-0" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                {period.focus}
              </p>
            </div>

            <div className="space-y-6">
              {period.phases.map((phase, index) => (
                <TimelinePhase
                  key={phase.id}
                  phase={phase}
                  phaseIndex={index}
                />
              ))}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default TimelinePeriod;
