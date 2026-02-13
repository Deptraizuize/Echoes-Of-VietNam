import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, User, Award, BookOpen } from "lucide-react";
import logo from "@/assets/logo.png";
import UserHeader from "@/components/layout/UserHeader";

interface MilestoneDetail {
  id: string;
  milestone_id: string;
  title: string;
  summary: string | null;
  events: string | null;
  results: string | null;
  significance: string | null;
  hero_names: string[] | null;
  landmark_names: string[] | null;
  image_urls: string[] | null;
}

const MilestoneDetail = () => {
  const { milestoneId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [detail, setDetail] = useState<MilestoneDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [milestoneTitle, setMilestoneTitle] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchDetail = async () => {
      if (!milestoneId) return;

      // Get milestone title
      const { data: milestone } = await supabase
        .from("milestones")
        .select("title")
        .eq("id", milestoneId)
        .single();

      if (milestone) setMilestoneTitle(milestone.title);

      // Get detail content
      const { data } = await supabase
        .from("milestone_details")
        .select("*")
        .eq("milestone_id", milestoneId)
        .single();

      setDetail(data);
      setLoading(false);
    };

    fetchDetail();
  }, [milestoneId, user, authLoading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <UserHeader />

      {/* Hero */}
      <section className="relative py-20 px-6 md:px-12 bg-foreground text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 heritage-pattern opacity-10" />
        <div className="container mx-auto relative z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/timeline")}
            className="text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10 mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại Timeline
          </Button>

          <div className="max-w-3xl">
            <p className="text-accent uppercase tracking-wider text-sm mb-4">Cột mốc lịch sử</p>
            <h1 className="text-primary-foreground text-3xl md:text-5xl mb-6">
              {detail?.title || milestoneTitle}
            </h1>
            {detail?.summary && (
              <p className="text-primary-foreground/70 text-lg leading-relaxed">
                {detail.summary}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="py-16 px-6 md:px-12">
        <div className="container mx-auto max-w-4xl">
          {detail ? (
            <div className="space-y-16">
              {/* Diễn biến */}
              {detail.events && (
                <section className="fade-in-up">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-accent" />
                    </div>
                    <h2 className="font-serif text-2xl text-foreground">Diễn biến</h2>
                  </div>
                  <div className="pl-[52px] border-l-2 border-accent/20">
                    <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-line">
                      {detail.events}
                    </p>
                  </div>
                </section>
              )}

              {/* Kết quả */}
              {detail.results && (
                <section className="fade-in-up delay-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <Award className="w-5 h-5 text-accent" />
                    </div>
                    <h2 className="font-serif text-2xl text-foreground">Kết quả</h2>
                  </div>
                  <div className="pl-[52px] border-l-2 border-accent/20">
                    <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-line">
                      {detail.results}
                    </p>
                  </div>
                </section>
              )}

              {/* Ý nghĩa */}
              {detail.significance && (
                <section className="fade-in-up delay-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <Award className="w-5 h-5 text-accent" />
                    </div>
                    <h2 className="font-serif text-2xl text-foreground">Ý nghĩa lịch sử</h2>
                  </div>
                  <div className="pl-[52px]">
                    <div className="bg-accent/5 border border-accent/20 p-6 rounded-lg">
                      <p className="text-foreground leading-relaxed text-lg whitespace-pre-line">
                        {detail.significance}
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* Anh hùng & Di tích */}
              <div className="grid md:grid-cols-2 gap-8 fade-in-up delay-300">
                {detail.hero_names && detail.hero_names.length > 0 && (
                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <User className="w-5 h-5 text-accent" />
                      <h3 className="font-serif text-xl text-foreground">Nhân vật lịch sử</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {detail.hero_names.map((name) => (
                        <Badge key={name} variant="outline" className="text-sm py-1.5 px-3">
                          {name}
                        </Badge>
                      ))}
                    </div>
                  </section>
                )}

                {detail.landmark_names && detail.landmark_names.length > 0 && (
                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <MapPin className="w-5 h-5 text-accent" />
                      <h3 className="font-serif text-xl text-foreground">Di tích liên quan</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {detail.landmark_names.map((name) => (
                        <Badge key={name} variant="secondary" className="text-sm py-1.5 px-3">
                          {name}
                        </Badge>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* Quiz CTA */}
              {user && (
                <section className="fade-in-up delay-400">
                  <div className="bg-gradient-to-r from-accent/10 via-accent/5 to-transparent border border-accent/20 rounded-xl p-8 text-center">
                    <h3 className="font-serif text-2xl text-foreground mb-3">
                      Kiểm tra kiến thức của bạn! 🎯
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Trả lời 10 câu hỏi để nhận điểm tích lũy và huy hiệu
                    </p>
                    <Button
                      size="lg"
                      onClick={() => navigate(`/quiz/${milestoneId}`)}
                      className="bg-accent text-accent-foreground hover:bg-accent/90 text-sm"
                    >
                      Bắt đầu Quiz
                    </Button>
                  </div>
                </section>
              )}

              {!user && (
                <section className="fade-in-up delay-400">
                  <div className="bg-muted/50 border border-border rounded-xl p-8 text-center">
                    <h3 className="font-serif text-2xl text-foreground mb-3">
                      Đăng nhập để làm Quiz 🔒
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Đăng nhập để kiểm tra kiến thức và nhận điểm tích lũy
                    </p>
                    <Button
                      size="lg"
                      onClick={() => navigate("/auth")}
                      className="bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      Đăng nhập
                    </Button>
                  </div>
                </section>
              )}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg mb-4">
                Nội dung chi tiết cho cột mốc này đang được cập nhật.
              </p>
              <Button variant="outline" onClick={() => navigate("/timeline")}>
                Quay lại Timeline
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MilestoneDetail;
