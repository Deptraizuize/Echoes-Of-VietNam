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
      className="group w-full text-left py-4 px-4 -mx-4 border-b border-border/50 last:border-b-0 
        hover:bg-muted/30 transition-all duration-300 cursor-pointer flex items-start justify-between gap-4"
    >
      <div className="flex-1">
        <h4 className="font-medium text-foreground group-hover:text-accent transition-colors">
          {milestone.title}
        </h4>
        {milestone.year && (
          <span className="inline-block mt-1 text-sm text-muted-foreground">
            {milestone.year}
          </span>
        )}
      </div>
      <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-all flex-shrink-0 mt-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </button>
  );
};

export default MilestoneCard;
