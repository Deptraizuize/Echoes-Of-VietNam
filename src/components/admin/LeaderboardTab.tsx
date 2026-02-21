import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Trophy, Star, Award, Shield, Crown, Search, Medal } from "lucide-react";

interface UserRanking {
  user_id: string;
  display_name: string | null;
  total_points: number;
  is_premium: boolean;
  badge_count: number;
  milestone_badges: number;
  phase_badges: number;
  period_badges: number;
}

interface Props {
  profiles: { user_id: string; display_name: string | null; total_points: number; is_premium: boolean }[];
  adminUserIds: string[];
}

const LeaderboardTab = ({ profiles, adminUserIds }: Props) => {
  const [search, setSearch] = useState("");
  const [badgeCounts, setBadgeCounts] = useState<Record<string, { milestone: number; phase: number; period: number }>>({});

  useEffect(() => {
    const fetchBadges = async () => {
      const { data } = await supabase.from("badges").select("user_id, badge_type");
      if (!data) return;
      const counts: Record<string, { milestone: number; phase: number; period: number }> = {};
      data.forEach((b) => {
        if (!counts[b.user_id]) counts[b.user_id] = { milestone: 0, phase: 0, period: 0 };
        const type = b.badge_type as "milestone" | "phase" | "period";
        if (counts[b.user_id][type] !== undefined) counts[b.user_id][type]++;
      });
      setBadgeCounts(counts);
    };
    fetchBadges();
  }, []);

  const userProfiles = profiles
    .filter(p => !adminUserIds.includes(p.user_id))
    .sort((a, b) => b.total_points - a.total_points);

  const filtered = search.trim()
    ? userProfiles.filter(p => p.display_name?.toLowerCase().includes(search.toLowerCase()))
    : userProfiles;

  const getRankStyle = (i: number) => {
    if (i === 0) return "bg-amber-500 text-white";
    if (i === 1) return "bg-gray-400 text-white";
    if (i === 2) return "bg-amber-700 text-white";
    return "bg-muted text-muted-foreground";
  };

  // Stats
  const totalUsers = userProfiles.length;
  const totalBadges = Object.values(badgeCounts).reduce((s, c) => s + c.milestone + c.phase + c.period, 0);
  const avgPoints = totalUsers > 0 ? Math.round(userProfiles.reduce((s, p) => s + p.total_points, 0) / totalUsers) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-xl flex items-center gap-2 mb-1">
          <Trophy className="w-5 h-5 text-accent" /> Bảng xếp hạng & Huy hiệu
        </h3>
        <p className="text-sm text-muted-foreground">Tổng quan điểm và huy hiệu người dùng (không bao gồm Admin).</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: <Star className="w-4 h-4 text-accent" />, value: totalUsers, label: "Người dùng", bg: "bg-accent/5" },
          { icon: <Trophy className="w-4 h-4 text-accent" />, value: avgPoints, label: "Điểm TB", bg: "bg-accent/5" },
          { icon: <Award className="w-4 h-4 text-accent" />, value: totalBadges, label: "Tổng huy hiệu", bg: "bg-accent/5" },
          { icon: <Medal className="w-4 h-4 text-accent" />, value: userProfiles.filter(p => p.total_points > 0).length, label: "Có điểm", bg: "bg-accent/5" },
        ].map((s, i) => (
          <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${s.bg} border border-border/50`}>
            <div className="w-9 h-9 rounded-lg bg-background flex items-center justify-center shadow-sm">{s.icon}</div>
            <div>
              <div className="text-xl font-bold text-foreground">{s.value}</div>
              <div className="text-[11px] text-muted-foreground">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm người dùng..."
          className="pl-9"
          maxLength={100}
        />
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Người dùng</TableHead>
              <TableHead className="text-center">Điểm</TableHead>
              <TableHead className="text-center">
                <span className="inline-flex items-center gap-1"><Award className="w-3 h-3" /> Mốc</span>
              </TableHead>
              <TableHead className="text-center">
                <span className="inline-flex items-center gap-1"><Shield className="w-3 h-3" /> Giai đoạn</span>
              </TableHead>
              <TableHead className="text-center">
                <span className="inline-flex items-center gap-1"><Crown className="w-3 h-3" /> Thời kỳ</span>
              </TableHead>
              <TableHead className="text-center">Tổng HH</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? filtered.map((p, i) => {
              const bc = badgeCounts[p.user_id] || { milestone: 0, phase: 0, period: 0 };
              const total = bc.milestone + bc.phase + bc.period;
              const rank = userProfiles.findIndex(u => u.user_id === p.user_id) + 1;
              return (
                <TableRow key={p.user_id} className="hover:bg-muted/30">
                  <TableCell>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getRankStyle(rank - 1)}`}>
                      {rank}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{p.display_name || "Ẩn danh"}</span>
                      {p.is_premium && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">Premium</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-bold text-accent">{p.total_points}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`text-sm ${bc.milestone > 0 ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                      {bc.milestone}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`text-sm ${bc.phase > 0 ? "font-medium text-blue-600" : "text-muted-foreground"}`}>
                      {bc.phase}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`text-sm ${bc.period > 0 ? "font-medium text-amber-600" : "text-muted-foreground"}`}>
                      {bc.period}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`text-sm font-bold ${total > 0 ? "text-foreground" : "text-muted-foreground"}`}>
                      {total}
                    </span>
                  </TableCell>
                </TableRow>
              );
            }) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Không tìm thấy người dùng
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LeaderboardTab;
