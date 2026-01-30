import { TeamMember } from "@/data/teamData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail } from "lucide-react";

interface TeamMemberCardProps {
  member: TeamMember;
}

const TeamMemberCard = ({ member }: TeamMemberCardProps) => {
  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="group bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-6 text-center hover:shadow-heritage hover:border-accent/30 transition-all duration-300">
      <Avatar className="w-20 h-20 mx-auto mb-4 ring-2 ring-accent/20 group-hover:ring-accent/40 transition-all">
        <AvatarImage src={member.avatar} alt={member.name} />
        <AvatarFallback className="bg-primary text-primary-foreground text-xl font-serif">
          {initials}
        </AvatarFallback>
      </Avatar>

      <h3 className="font-serif font-semibold text-lg text-foreground mb-1">
        {member.name}
      </h3>
      
      <p className="text-accent font-medium text-sm mb-2">{member.role}</p>
      
      {member.description && (
        <p className="text-muted-foreground text-sm mb-4">{member.description}</p>
      )}

      {member.email && (
        <a
          href={`mailto:${member.email}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
        >
          <Mail className="w-4 h-4" />
          <span>{member.email}</span>
        </a>
      )}
    </div>
  );
};

export default TeamMemberCard;
