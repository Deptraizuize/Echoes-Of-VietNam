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
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-foreground text-background text-xs font-bold flex-shrink-0">
          {phaseIndex + 1}
        </div>
        <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          {phase.name}
        </h4>
      </div>

      {/* Milestones grid */}
      <div className="ml-3.5 border-l-2 border-border pl-6 space-y-0">
        {phase.milestones.map((milestone) => (
          <MilestoneCard key={milestone.id} milestone={milestone} />
        ))}
      </div>
    </div>
  );
};

export default TimelinePhase;
