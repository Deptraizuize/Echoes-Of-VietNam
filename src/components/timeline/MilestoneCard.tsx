import { Milestone } from "@/data/timelineData";
import { Lock } from "lucide-react";

interface MilestoneCardProps {
  milestone: Milestone;
  onClick: (milestone: Milestone) => void;
}

const MilestoneCard = ({ milestone, onClick }: MilestoneCardProps) => {
  return (
    <button
      onClick={() => onClick(milestone)}
      className="group w-full text-left p-4 rounded-lg bg-card/80 border border-border/50 
        hover:border-accent/50 hover:bg-card hover:shadow-heritage 
        transition-all duration-300 cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
            {milestone.title}
          </h4>
          {milestone.year && (
            <span className="inline-block mt-1 text-sm text-accent font-medium">
              {milestone.year}
            </span>
          )}
        </div>
        <div className="flex-shrink-0 mt-1">
          <Lock className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
        </div>
      </div>
    </button>
  );
};

export default MilestoneCard;
