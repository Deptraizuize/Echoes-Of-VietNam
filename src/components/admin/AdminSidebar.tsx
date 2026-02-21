import { cn } from "@/lib/utils";
import {
  Crown, MessageSquare, HelpCircle, BookOpen, Image, Gift, Users, CreditCard, BarChart3, DollarSign,
  ChevronDown, Menu, X, Trophy,
} from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

interface Props {
  active: string;
  onSelect: (id: string) => void;
  stats: { pendingUpgrades: number; newFeedback: number };
}

const groups: NavGroup[] = [
  {
    title: "Quản lý người dùng",
    items: [
      { id: "premium", label: "Yêu cầu nâng cấp", icon: Crown },
      { id: "users", label: "Người dùng", icon: Users },
      { id: "leaderboard", label: "Xếp hạng & Huy hiệu", icon: Trophy },
      { id: "feedback", label: "Góp ý", icon: MessageSquare },
    ],
  },
  {
    title: "Nội dung",
    items: [
      { id: "milestone-details", label: "Bài viết", icon: BookOpen },
      { id: "milestones", label: "Cột mốc", icon: BarChart3 },
      { id: "questions", label: "Câu hỏi quiz", icon: HelpCircle },
    ],
  },
  {
    title: "Vận hành",
    items: [
      { id: "banners", label: "Banner QC", icon: Image },
      { id: "rewards", label: "Đổi thưởng", icon: Gift },
      { id: "payment", label: "Thanh toán", icon: CreditCard },
      { id: "revenue", label: "Doanh thu", icon: DollarSign },
    ],
  },
];

const AdminSidebar = ({ active, onSelect, stats }: Props) => {
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);

  const getBadge = (id: string) => {
    if (id === "premium" && stats.pendingUpgrades > 0) return stats.pendingUpgrades;
    if (id === "feedback" && stats.newFeedback > 0) return stats.newFeedback;
    return undefined;
  };

  const nav = (
    <nav className="flex flex-col gap-6 p-4">
      {groups.map((group) => (
        <div key={group.title}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-2">
            {group.title}
          </p>
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const badge = getBadge(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => { onSelect(item.id); if (isMobile) setMobileOpen(false); }}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors text-left w-full",
                    active === item.id
                      ? "bg-accent/10 text-accent font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {badge && (
                    <span className="bg-accent text-accent-foreground text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="fixed bottom-4 right-4 z-50 bg-accent text-accent-foreground p-3 rounded-full shadow-lg"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        {mobileOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setMobileOpen(false)} />
            <div className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-card border-r border-border overflow-y-auto">
              {nav}
            </div>
          </>
        )}
      </>
    );
  }

  return (
    <aside className="w-56 shrink-0 border-r border-border bg-card min-h-[calc(100vh-52px)] sticky top-[52px] overflow-y-auto">
      {nav}
    </aside>
  );
};

export default AdminSidebar;
