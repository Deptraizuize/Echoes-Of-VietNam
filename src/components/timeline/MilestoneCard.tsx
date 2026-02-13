import { useNavigate } from "react-router-dom";
import { Milestone } from "@/data/timelineData";
import { ArrowUpRight } from "lucide-react";

interface MilestoneCardProps {
  milestone: Milestone;
  onClick?: (milestone: Milestone) => void;
}

const MilestoneCard = ({ milestone, onClick }: MilestoneCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(milestone);
    } else {
      navigate(`/milestone/${milestone.id}`);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="group w-full text-left py-3.5 px-4 rounded-lg
        hover:bg-accent/5 transition-all duration-300 cursor-pointer 
        flex items-center justify-between gap-4"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Dot connector */}
        <div className="w-2.5 h-2.5 rounded-full border-2 border-muted-foreground/30 group-hover:border-accent group-hover:bg-accent transition-colors flex-shrink-0" />

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-foreground group-hover:text-accent transition-colors leading-snug">
            {milestone.title}
          </h4>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {milestone.year && (
          <span className="text-xs font-medium text-accent/80 bg-accent/10 px-2.5 py-1 rounded-md">
            {milestone.year}
          </span>
        )}
        <ArrowUpRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-accent transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </button>
  );
};

export default MilestoneCard;
