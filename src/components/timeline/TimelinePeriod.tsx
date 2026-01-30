import { Period, Milestone } from "@/data/timelineData";
import TimelinePhase from "./TimelinePhase";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowUpRight } from "lucide-react";

interface TimelinePeriodProps {
  period: Period;
  onMilestoneClick: (milestone: Milestone) => void;
}

const TimelinePeriod = ({ period, onMilestoneClick }: TimelinePeriodProps) => {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem 
        value={period.id} 
        className="border border-border bg-card overflow-hidden"
      >
        <AccordionTrigger className="px-6 py-6 hover:no-underline hover:bg-muted/30 transition-colors group">
          <div className="flex items-center gap-6 w-full text-left">
            <span className="font-serif text-4xl text-muted-foreground/40 group-hover:text-accent transition-colors">
              {period.number}
            </span>
            <div className="flex-1">
              <h3 className="font-serif text-xl text-foreground group-hover:text-accent transition-colors mb-1">
                {period.title}
              </h3>
              <p className="text-sm text-muted-foreground">{period.timeRange}</p>
            </div>
            <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
          </div>
        </AccordionTrigger>
        
        <AccordionContent className="px-6 pb-6">
          <div className="pt-6 border-t border-border">
            <p className="text-muted-foreground mb-8">{period.focus}</p>
            {period.phases.map((phase, index) => (
              <TimelinePhase
                key={phase.id}
                phase={phase}
                phaseIndex={index}
                onMilestoneClick={onMilestoneClick}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default TimelinePeriod;
