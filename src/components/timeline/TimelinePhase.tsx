import { Phase } from "@/data/timelineData";
import MilestoneCard from "./MilestoneCard";

interface TimelinePhaseProps {
  phase: Phase;
  phaseIndex: number;
}

const TimelinePhase = ({ phase, phaseIndex }: TimelinePhaseProps) => {
  return (
    <div className="relative">
      {/* Phase header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold flex-shrink-0">
          {phaseIndex + 1}
        </div>
        <h4 className="text-sm font-semibold text-foreground tracking-wide">
          {phase.name}
        </h4>
        <div className="flex-1 h-px bg-border/60" />
      </div>

      {/* Milestones grid */}
      <div className="ml-3.5 border-l-2 border-accent/15 pl-5 space-y-0">
        {phase.milestones.map((milestone) => (
          <MilestoneCard key={milestone.id} milestone={milestone} />
        ))}
      </div>
    </div>
  );
};

export default TimelinePhase;
