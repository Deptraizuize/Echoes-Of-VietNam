import { Period, Milestone } from "@/data/timelineData";
import TimelinePhase from "./TimelinePhase";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface TimelinePeriodProps {
  period: Period;
  onMilestoneClick: (milestone: Milestone) => void;
}

const TimelinePeriod = ({ period, onMilestoneClick }: TimelinePeriodProps) => {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem 
        value={period.id} 
        className="border border-border/50 rounded-xl bg-card/60 backdrop-blur-sm overflow-hidden"
      >
        <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-muted/30 transition-colors">
          <div className="flex flex-col items-start text-left gap-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-serif font-bold text-lg">
                {period.number}
              </span>
              <div>
                <h2 className="font-serif font-bold text-xl text-foreground">
                  {period.title}
                </h2>
                <p className="text-sm text-accent font-medium">{period.timeRange}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{period.focus}</p>
          </div>
        </AccordionTrigger>
        
        <AccordionContent className="px-6 pb-6">
          <div className="pt-4 border-t border-border/50">
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
