import { useNavigate } from "react-router-dom";
import { Milestone } from "@/data/timelineData";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

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
    <motion.button
      onClick={handleClick}
      whileHover={{ x: 3 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="group w-full text-left py-2.5 px-3 rounded-lg
        hover:bg-accent/5 transition-all duration-200 cursor-pointer 
        flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-1.5 h-1.5 rounded-full bg-accent/40 group-hover:bg-accent group-hover:scale-125 transition-all flex-shrink-0" />
        <h4 className="text-sm font-medium text-foreground group-hover:text-accent transition-colors leading-snug line-clamp-2">
          {milestone.title}
        </h4>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {milestone.year && (
          <span className="text-[10px] md:text-xs font-medium text-accent/70 bg-accent/8 px-2 py-0.5 rounded-md whitespace-nowrap border border-accent/10">
            {milestone.year}
          </span>
        )}
        <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/20 group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
      </div>
    </motion.button>
  );
};

export default MilestoneCard;
