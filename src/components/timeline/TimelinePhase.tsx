import { Phase } from "@/data/timelineData";
import MilestoneCard from "./MilestoneCard";

interface TimelinePhaseProps {
  phase: Phase;
  phaseIndex: number;
}

const TimelinePhase = ({ phase, phaseIndex }: TimelinePhaseProps) => {
  return (
    <div className="relative pl-8 pb-8 last:pb-0">
      {/* Timeline connector */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />
      
      {/* Phase dot */}
      <div className="absolute left-0 top-2 w-2 h-2 -translate-x-1/2 rounded-full bg-accent" />
      
      {/* Phase content */}
      <div>
        <h3 className="text-base font-semibold text-foreground mb-4">
          Giai đoạn {phaseIndex + 1}: {phase.name}
        </h3>
        
        <div className="grid gap-3">
          {phase.milestones.map((milestone) => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimelinePhase;
