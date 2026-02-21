import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, User, Award, BookOpen, Sparkles, ExternalLink, FileText, ChevronUp } from "lucide-react";
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
  image_captions: string[] | null;
  source_references: string | null;
}

const SectionHeading = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center ring-1 ring-accent/20">
      <Icon className="w-5 h-5 text-accent" />
    </div>
    <h2 className="text-2xl font-bold text-foreground">{title}</h2>
    <div className="flex-1 h-px bg-gradient-to-r from-accent/20 to-transparent ml-2" />
  </div>
);

const proseClasses = "prose prose-lg max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground prose-a:text-accent prose-blockquote:border-accent/30 prose-blockquote:text-muted-foreground/80";

const MilestoneDetail = () => {
  const { milestoneId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [detail, setDetail] = useState<MilestoneDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }

    const fetchDetail = async () => {
      if (!milestoneId) return;
      const { data: milestone } = await supabase.from("milestones").select("title").eq("id", milestoneId).single();
      if (milestone) setMilestoneTitle(milestone.title);
      const { data } = await supabase.from("milestone_details").select("*").eq("milestone_id", milestoneId).single();
      setDetail(data as MilestoneDetailData | null);
      setLoading(false);
    };
    fetchDetail();
  }, [milestoneId, user, authLoading, navigate]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="" className="w-full h-full object-cover scale-105" />
          <div className="absolute inset-0 bg-foreground/70 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-foreground/40 to-transparent" />
          <div className="absolute inset-0 dong-son-pattern opacity-[0.06]" />
        </div>

        <div className="relative z-10 py-20 md:py-32 px-6 md:px-12">
          <div className="container mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
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
              <p className="text-accent uppercase tracking-[0.2em] text-sm mb-4 font-medium">Cột mốc lịch sử</p>
              <h1 className="text-primary-foreground text-3xl md:text-4xl lg:text-5xl mb-6 leading-[1.15] font-bold tracking-tight text-balance [word-break:keep-all] [overflow-wrap:anywhere]">
                {detail?.title || milestoneTitle}
              </h1>
              {detail?.summary && (
                <p className="text-primary-foreground/60 text-lg md:text-xl leading-relaxed max-w-2xl">
                  {detail.summary}
                </p>
              )}
            </motion.div>
          </div>
        </div>

        {/* Gradient transition to content */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Content */}
      <main className="py-12 md:py-20 px-6 md:px-12">
        <div className="container mx-auto max-w-4xl">
          {detail ? (
            <div className="space-y-16 md:space-y-20">
              {/* Diễn biến */}
              {detail.events && (
                <motion.section
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <SectionHeading icon={BookOpen} title="Diễn biến" />
                  <div className="pl-[52px] border-l-2 border-accent/20">
                    <div className={`text-muted-foreground leading-relaxed text-lg ${proseClasses}`}>
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
                  <SectionHeading icon={Award} title="Kết quả" />
                  <div className="pl-[52px] border-l-2 border-accent/20">
                    <div className={`text-muted-foreground leading-relaxed text-lg ${proseClasses}`}>
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
                  <SectionHeading icon={Sparkles} title="Ý nghĩa lịch sử" />
                  <div className="pl-[52px]">
                    <div className="bg-accent/5 border border-accent/20 p-6 md:p-8 rounded-xl">
                      <div className={`text-foreground leading-relaxed text-lg ${proseClasses} prose-p:text-foreground prose-li:text-foreground`}>
                        <ReactMarkdown>{detail.significance}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </motion.section>
              )}

              {/* Anh hùng & Di tích */}
              {((detail.hero_names && detail.hero_names.length > 0) || (detail.landmark_names && detail.landmark_names.length > 0)) && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="grid md:grid-cols-2 gap-6"
                >
                  {detail.hero_names && detail.hero_names.length > 0 && (
                    <section className="bg-card border border-border rounded-xl p-5 md:p-6 hover:border-accent/30 transition-colors">
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
                    <section className="bg-card border border-border rounded-xl p-5 md:p-6 hover:border-accent/30 transition-colors">
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
              )}

              {/* Image Gallery with captions */}
              {detail.image_urls && detail.image_urls.length > 1 && (
                <motion.section
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <SectionHeading icon={BookOpen} title="Hình ảnh tư liệu" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {detail.image_urls.slice(1).map((url, i) => {
                      const caption = detail.image_captions?.[i + 1] || null;
                      return (
                        <motion.figure
                          key={i}
                          initial={{ opacity: 0, scale: 0.95 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: i * 0.1 }}
                          className="overflow-hidden rounded-xl border border-border bg-card group"
                        >
                          <div className="overflow-hidden">
                            <img
                              src={url}
                              alt={caption || `Tư liệu ${i + 1}`}
                              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                          </div>
                          {caption && (
                            <figcaption className="px-4 py-3 text-sm text-muted-foreground italic border-t border-border bg-muted/30">
                              {caption}
                            </figcaption>
                          )}
                        </motion.figure>
                      );
                    })}
                  </div>
                </motion.section>
              )}

              {/* References + Quiz CTA */}
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                {/* Nguồn tham khảo */}
                {detail.source_references && (
                  <div>
                    <SectionHeading icon={FileText} title="Nguồn tham khảo" />
                    <div className="pl-[52px]">
                      <div className="bg-muted/30 border border-border rounded-xl p-6">
                        <div className="text-muted-foreground text-sm leading-relaxed [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-1.5 [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2 [&_strong]:text-foreground [&_em]:text-muted-foreground/90 [&_li]:pl-1">
                          <ReactMarkdown>{detail.source_references}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quiz CTA - ẩn với admin */}
                {!isAdmin && (
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
                )}
              </motion.section>
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

      {/* Scroll to top */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full bg-accent text-accent-foreground shadow-lg flex items-center justify-center hover:bg-accent/90 transition-colors"
        >
          <ChevronUp className="w-5 h-5" />
        </motion.button>
      )}

      {!isAdmin && <AIChatButton milestoneId={milestoneId} milestoneTitle={detail?.title || milestoneTitle} />}
    </div>
  );
};

export default MilestoneDetail;
