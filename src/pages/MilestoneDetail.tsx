import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, User, Award, BookOpen, Sparkles, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";
import UserHeader from "@/components/layout/UserHeader";
import AIChatButton from "@/components/ai/AIChatButton";
import milestonePlaceholder from "@/assets/milestone-placeholder.jpg";
import { motion } from "framer-motion";

interface MilestoneDetailData {
  id: string;
  milestone_id: string;
  title: string;
  summary: string | null;
  events: string | null;
  results: string | null;
  significance: string | null;
  hero_names: string[] | null;
  landmark_names: string[] | null;
  hero_urls: string[] | null;
  landmark_urls: string[] | null;
  image_urls: string[] | null;
}

const MilestoneDetail = () => {
  const { milestoneId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [detail, setDetail] = useState<MilestoneDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [milestoneTitle, setMilestoneTitle] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }

    const fetchDetail = async () => {
      if (!milestoneId) return;
      const { data: milestone } = await supabase.from("milestones").select("title").eq("id", milestoneId).single();
      if (milestone) setMilestoneTitle(milestone.title);
      const { data } = await supabase.from("milestone_details").select("*").eq("milestone_id", milestoneId).single();
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

  const heroImage = detail?.image_urls?.[0] || milestonePlaceholder;

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 dong-son-pattern opacity-[0.015] pointer-events-none" />
      <UserHeader />

      {/* Hero with image */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-foreground/75" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/50 to-transparent" />
          <div className="absolute inset-0 dong-son-pattern opacity-[0.06]" />
        </div>

        <div className="relative z-10 py-20 md:py-28 px-6 md:px-12">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/timeline")}
                className="text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10 mb-8"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại Timeline
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="max-w-3xl"
            >
              <p className="text-accent uppercase tracking-wider text-sm mb-4 font-medium">Cột mốc lịch sử</p>
              <h1 className="text-primary-foreground text-3xl md:text-5xl mb-6 leading-tight">
                {detail?.title || milestoneTitle}
              </h1>
              {detail?.summary && (
                <p className="text-primary-foreground/60 text-lg leading-relaxed max-w-2xl">
                  {detail.summary}
                </p>
              )}
            </motion.div>
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
                <motion.section
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-accent" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Diễn biến</h2>
                  </div>
                  <div className="pl-[52px] border-l-2 border-accent/20">
                    <div className="text-muted-foreground leading-relaxed text-lg prose prose-lg max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground">
                      <ReactMarkdown>{detail.events}</ReactMarkdown>
                    </div>
                  </div>
                </motion.section>
              )}

              {/* Kết quả */}
              {detail.results && (
                <motion.section
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <Award className="w-5 h-5 text-accent" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Kết quả</h2>
                  </div>
                  <div className="pl-[52px] border-l-2 border-accent/20">
                    <div className="text-muted-foreground leading-relaxed text-lg prose prose-lg max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground">
                      <ReactMarkdown>{detail.results}</ReactMarkdown>
                    </div>
                  </div>
                </motion.section>
              )}

              {/* Ý nghĩa */}
              {detail.significance && (
                <motion.section
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-accent" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Ý nghĩa lịch sử</h2>
                  </div>
                  <div className="pl-[52px]">
                    <div className="bg-accent/5 border border-accent/20 p-6 rounded-xl">
                      <div className="text-foreground leading-relaxed text-lg prose prose-lg max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground">
                        <ReactMarkdown>{detail.significance}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </motion.section>
              )}

              {/* Anh hùng & Di tích */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="grid md:grid-cols-2 gap-8"
              >
                {detail.hero_names && detail.hero_names.length > 0 && (
                  <section className="bg-card border border-border rounded-xl p-5 md:p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <User className="w-5 h-5 text-accent" />
                      <h3 className="text-lg font-bold text-foreground">Nhân vật lịch sử</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {detail.hero_names.map((name, i) => {
                        const url = detail.hero_urls?.[i] || `https://vi.wikipedia.org/wiki/${encodeURIComponent(name.replace(/ /g, "_"))}`;
                        return (
                          <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="group">
                            <Badge variant="outline" className="text-sm py-1.5 px-3 cursor-pointer hover:border-accent hover:text-accent transition-colors gap-1.5">
                              {name}
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Badge>
                          </a>
                        );
                      })}
                    </div>
                  </section>
                )}
                {detail.landmark_names && detail.landmark_names.length > 0 && (
                  <section className="bg-card border border-border rounded-xl p-5 md:p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MapPin className="w-5 h-5 text-accent" />
                      <h3 className="text-lg font-bold text-foreground">Di tích liên quan</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {detail.landmark_names.map((name, i) => {
                        const url = detail.landmark_urls?.[i] || `https://vi.wikipedia.org/wiki/${encodeURIComponent(name.replace(/ /g, "_"))}`;
                        return (
                          <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="group">
                            <Badge variant="secondary" className="text-sm py-1.5 px-3 cursor-pointer hover:border-accent hover:text-accent transition-colors gap-1.5">
                              <MapPin className="w-3 h-3" />
                              {name}
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Badge>
                          </a>
                        );
                      })}
                    </div>
                  </section>
                )}
              </motion.div>

              {/* Quiz CTA - ẩn với admin */}
              {!isAdmin && (
                <motion.section
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="bg-gradient-to-br from-accent/10 via-accent/5 to-transparent border border-accent/20 rounded-xl p-8 md:p-10 text-center relative overflow-hidden">
                    <div className="absolute inset-0 dong-son-pattern opacity-[0.04] pointer-events-none" />
                    <div className="relative z-10">
                      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-accent" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-3">
                        Kiểm tra kiến thức của bạn!
                      </h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Trả lời 10 câu hỏi để nhận điểm tích lũy và huy hiệu
                      </p>
                      <Button
                        size="lg"
                        onClick={() => navigate(`/quiz/${milestoneId}`)}
                        className="bg-accent text-accent-foreground hover:bg-accent/90 text-sm"
                      >
                        Bắt đầu Quiz ✦
                      </Button>
                    </div>
                  </div>
                </motion.section>
              )}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <img src={milestonePlaceholder} alt="" className="w-32 h-32 mx-auto mb-6 rounded-xl object-cover opacity-50" />
              <p className="text-muted-foreground text-lg mb-4">
                Nội dung chi tiết cho cột mốc này đang được cập nhật.
              </p>
              <Button variant="outline" onClick={() => navigate("/timeline")}>
                Quay lại Timeline
              </Button>
            </motion.div>
          )}
        </div>
      </main>
      {!isAdmin && <AIChatButton milestoneId={milestoneId} milestoneTitle={detail?.title || milestoneTitle} />}
    </div>
  );
};

export default MilestoneDetail;
