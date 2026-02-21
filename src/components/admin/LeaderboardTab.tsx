import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Star, Award, Shield, Crown, Search, Medal, TrendingUp, Users } from "lucide-react";

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

  const totalUsers = userProfiles.length;
  const totalBadges = Object.values(badgeCounts).reduce((s, c) => s + c.milestone + c.phase + c.period, 0);
  const avgPoints = totalUsers > 0 ? Math.round(userProfiles.reduce((s, p) => s + p.total_points, 0) / totalUsers) : 0;
  const activeUsers = userProfiles.filter(p => p.total_points > 0).length;

  // Top 3 for podium
  const top3 = userProfiles.slice(0, 3);

  const podiumOrder = top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3;
  const podiumHeights = ["h-20", "h-28", "h-16"];
  const podiumColors = [
    "from-muted to-muted/60 border-muted-foreground/20",
    "from-accent/20 to-accent/10 border-accent/40",
    "from-muted to-muted/40 border-muted-foreground/10",
  ];
  const podiumIcons = [
    <Medal className="w-5 h-5 text-muted-foreground" />,
    <Trophy className="w-6 h-6 text-accent" />,
    <Medal className="w-5 h-5 text-muted-foreground/60" />,
  ];
  const podiumRanks = [2, 1, 3];

  const stats = [
    { icon: <Users className="w-4 h-4" />, value: totalUsers, label: "Tổng người dùng", color: "text-foreground" },
    { icon: <TrendingUp className="w-4 h-4" />, value: avgPoints, label: "Điểm trung bình", color: "text-accent" },
    { icon: <Award className="w-4 h-4" />, value: totalBadges, label: "Tổng huy hiệu", color: "text-foreground" },
    { icon: <Star className="w-4 h-4" />, value: activeUsers, label: "Đang hoạt động", color: "text-accent" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-1">
          <Trophy className="w-5 h-5 text-accent" /> Bảng xếp hạng & Huy hiệu
        </h3>
        <p className="text-sm text-muted-foreground">Tổng quan điểm và huy hiệu người dùng (không bao gồm Admin).</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <Card key={i} className="border-border/60 shadow-none hover:shadow-sm transition-shadow">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/8 flex items-center justify-center text-accent">
                {s.icon}
              </div>
              <div>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-[11px] text-muted-foreground leading-tight">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top 3 Podium */}
      {top3.length >= 3 && (
        <Card className="border-border/60 shadow-none overflow-hidden">
          <CardContent className="p-6 pb-2">
            <h4 className="text-sm font-semibold text-muted-foreground mb-6 text-center uppercase tracking-wider">Top 3 người dẫn đầu</h4>
            <div className="flex items-end justify-center gap-3 max-w-md mx-auto">
              {podiumOrder.map((user, i) => {
                const bc = badgeCounts[user.user_id] || { milestone: 0, phase: 0, period: 0 };
                const totalB = bc.milestone + bc.phase + bc.period;
                return (
                  <div key={user.user_id} className="flex flex-col items-center flex-1">
                    {/* Avatar area */}
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-b ${podiumColors[i]} border-2 flex items-center justify-center mb-2`}>
                      {podiumIcons[i]}
                    </div>
                    <span className="text-xs font-medium text-foreground text-center truncate max-w-[90px] mb-0.5">
                      {user.display_name || "Ẩn danh"}
                    </span>
                    <span className="text-lg font-bold text-accent">{user.total_points}</span>
                    <span className="text-[10px] text-muted-foreground mb-2">{totalB} huy hiệu</span>
                    {/* Podium bar */}
                    <div className={`w-full ${podiumHeights[i]} rounded-t-lg bg-gradient-to-t ${podiumColors[i]} border border-b-0 flex items-center justify-center`}>
                      <span className="text-2xl font-bold text-muted-foreground/40">#{podiumRanks[i]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên người dùng..."
          className="pl-9 h-10"
          maxLength={100}
        />
      </div>

      {/* Table */}
      <Card className="border-border/60 shadow-none overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-14 text-center">#</TableHead>
              <TableHead>Người dùng</TableHead>
              <TableHead className="text-right">Điểm</TableHead>
              <TableHead className="text-center hidden sm:table-cell">
                <span className="inline-flex items-center gap-1 text-xs"><Award className="w-3 h-3 text-accent" /> Mốc</span>
              </TableHead>
              <TableHead className="text-center hidden sm:table-cell">
                <span className="inline-flex items-center gap-1 text-xs"><Shield className="w-3 h-3 text-blue-500" /> GĐ</span>
              </TableHead>
              <TableHead className="text-center hidden sm:table-cell">
                <span className="inline-flex items-center gap-1 text-xs"><Crown className="w-3 h-3 text-amber-500" /> TK</span>
              </TableHead>
              <TableHead className="text-center w-16">Tổng</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? filtered.map((p) => {
              const bc = badgeCounts[p.user_id] || { milestone: 0, phase: 0, period: 0 };
              const total = bc.milestone + bc.phase + bc.period;
              const rank = userProfiles.findIndex(u => u.user_id === p.user_id) + 1;

              return (
                <TableRow key={p.user_id} className="group">
                  <TableCell className="text-center">
                    {rank <= 3 ? (
                      <span className={`inline-flex w-7 h-7 rounded-full items-center justify-center text-xs font-bold ${
                        rank === 1 ? "bg-accent/15 text-accent ring-1 ring-accent/30" :
                        rank === 2 ? "bg-muted text-muted-foreground ring-1 ring-border" :
                        "bg-muted/60 text-muted-foreground"
                      }`}>
                        {rank}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">{rank}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{p.display_name || "Ẩn danh"}</span>
                      {p.is_premium && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 font-medium">Premium</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-bold text-accent tabular-nums">{p.total_points.toLocaleString()}</span>
                  </TableCell>
                  <TableCell className="text-center hidden sm:table-cell">
                    <span className={`text-sm tabular-nums ${bc.milestone > 0 ? "font-semibold text-foreground" : "text-muted-foreground/50"}`}>
                      {bc.milestone}
                    </span>
                  </TableCell>
                  <TableCell className="text-center hidden sm:table-cell">
                    <span className={`text-sm tabular-nums ${bc.phase > 0 ? "font-semibold text-blue-600" : "text-muted-foreground/50"}`}>
                      {bc.phase}
                    </span>
                  </TableCell>
                  <TableCell className="text-center hidden sm:table-cell">
                    <span className={`text-sm tabular-nums ${bc.period > 0 ? "font-semibold text-amber-600" : "text-muted-foreground/50"}`}>
                      {bc.period}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
                      total > 0 ? "bg-accent/10 text-accent" : "text-muted-foreground/40"
                    }`}>
                      {total}
                    </span>
                  </TableCell>
                </TableRow>
              );
            }) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Không tìm thấy người dùng</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default LeaderboardTab;
