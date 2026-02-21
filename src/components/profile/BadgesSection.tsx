import { Award, Shield, Crown, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface BadgeData {
  id: string;
  badge_name: string;
  badge_icon: string | null;
  badge_type: string;
  phase_id: string | null;
  period_id: string | null;
  milestone_id: string;
  earned_at: string;
}

interface BadgesSectionProps {
  badges: BadgeData[];
  formatDate: (dateStr: string) => string;
}

const BADGE_CONFIGS = {
  milestone: {
    label: "Mốc lịch sử",
    icon: <Award className="w-4 h-4" />,
    gradient: "from-accent/20 to-accent/5",
    border: "border-accent/20",
    iconBg: "bg-accent/20 text-accent",
    dotColor: "bg-accent",
  },
  phase: {
    label: "Giai đoạn",
    icon: <Shield className="w-4 h-4" />,
    gradient: "from-blue-500/20 to-blue-500/5",
    border: "border-blue-500/20",
    iconBg: "bg-blue-500/20 text-blue-500",
    dotColor: "bg-blue-500",
  },
  period: {
    label: "Thời kỳ",
    icon: <Crown className="w-4 h-4" />,
    gradient: "from-amber-500/20 to-amber-500/5",
    border: "border-amber-500/20",
    iconBg: "bg-amber-500/20 text-amber-500",
    dotColor: "bg-amber-500",
  },
};

const BadgeCard = ({ badge, config, formatDate }: { badge: BadgeData; config: typeof BADGE_CONFIGS.milestone; formatDate: (s: string) => string }) => {
  const navigate = useNavigate();
  const isClickable = badge.badge_type === "milestone";

  return (
    <button
      onClick={() => isClickable && navigate(`/milestone/${badge.milestone_id}`)}
      className={`w-full flex items-center gap-3 p-3 bg-gradient-to-r ${config.gradient} border ${config.border} rounded-xl transition-all ${isClickable ? "hover:scale-[1.02] hover:shadow-sm cursor-pointer" : "cursor-default"}`}
    >
      <div className={`w-9 h-9 rounded-lg ${config.iconBg} flex items-center justify-center shrink-0`}>
        {badge.badge_type === "milestone" && <Award className="w-4.5 h-4.5" />}
        {badge.badge_type === "phase" && <Shield className="w-4.5 h-4.5" />}
        {badge.badge_type === "period" && <Crown className="w-4.5 h-4.5" />}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="text-sm font-medium text-foreground truncate">{badge.badge_name}</p>
        <p className="text-xs text-muted-foreground">{formatDate(badge.earned_at)}</p>
      </div>
    </button>
  );
};

const BadgesSection = ({ badges, formatDate }: BadgesSectionProps) => {
  const milestoneBadges = badges.filter((b) => b.badge_type === "milestone");
  const phaseBadges = badges.filter((b) => b.badge_type === "phase");
  const periodBadges = badges.filter((b) => b.badge_type === "period");

  const sections = [
    { key: "period", items: periodBadges, config: BADGE_CONFIGS.period },
    { key: "phase", items: phaseBadges, config: BADGE_CONFIGS.phase },
    { key: "milestone", items: milestoneBadges, config: BADGE_CONFIGS.milestone },
  ];

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Award className="w-5 h-5 text-accent" /> Huy hiệu
        <span className="text-xs font-normal text-muted-foreground ml-auto">
          {badges.length} đã nhận
        </span>
      </h2>

      {badges.length === 0 ? (
        <div className="p-6 bg-muted/30 rounded-xl border border-border text-center">
          <Award className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Hoàn thành quiz 8/10 để nhận huy hiệu!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sections.map(({ key, items, config }) => (
            <div key={key}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${config.dotColor}`} />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {config.label}
                </span>
                <span className="text-xs text-muted-foreground">({items.length})</span>
              </div>
              {items.length > 0 ? (
                <div className="space-y-2">
                  {items.map((b) => (
                    <BadgeCard key={b.id} badge={b} config={config} formatDate={formatDate} />
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg border border-border/50">
                  <Lock className="w-3.5 h-3.5 text-muted-foreground/40" />
                  <span className="text-xs text-muted-foreground/60">
                    {key === "period" && "Hoàn thành tất cả mốc trong một thời kỳ"}
                    {key === "phase" && "Hoàn thành tất cả mốc trong một giai đoạn"}
                    {key === "milestone" && "Đạt 8/10 trong quiz mốc lịch sử"}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.section>
  );
};

export default BadgesSection;
