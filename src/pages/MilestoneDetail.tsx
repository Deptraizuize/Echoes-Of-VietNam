import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, User, Award, BookOpen, Sparkles, ExternalLink, FileText, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import UserHeader from "@/components/layout/UserHeader";
import AIChatButton from "@/components/ai/AIChatButton";
import milestonePlaceholder from "@/assets/milestone-placeholder.jpg";
import { motion, AnimatePresence } from "framer-motion";

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

      {/* Hero Image */}
      <section className="relative overflow-hidden">
        <div className="relative h-[45vh] md:h-[55vh]">
          <img src={heroImage} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-background" />
          <div className="absolute inset-0 dong-son-pattern opacity-[0.04]" />

          {/* Back button on image */}
          <div className="absolute top-4 left-4 md:top-6 md:left-8 z-10">
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/timeline")}
                className="bg-black/30 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/50 border border-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Title card - separate from image */}
      <section className="relative z-10 -mt-20 px-6 md:px-12 mb-8">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-6 md:p-10 shadow-elevated relative overflow-hidden"
          >
            <div className="absolute inset-0 dong-son-pattern opacity-[0.02] pointer-events-none" />
            <div className="relative">
              <p className="text-accent uppercase tracking-[0.2em] text-xs md:text-sm mb-3 font-medium">Cột mốc lịch sử</p>
              <h1 className="text-foreground text-2xl md:text-3xl lg:text-4xl mb-4 leading-[1.2] font-bold tracking-tight text-balance [word-break:keep-all] [overflow-wrap:anywhere]">
                {detail?.title || milestoneTitle}
              </h1>
              {detail?.summary && (
                <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-2xl">
                  {detail.summary}
                </p>
              )}
              <div className="absolute top-0 right-0 w-20 h-20 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            </div>
          </motion.div>
        </div>
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
              {detail.image_urls && detail.image_urls.length > 1 && (() => {
                const galleryImages = detail.image_urls!.slice(1);
                const galleryCaptions = detail.image_captions?.slice(1) || [];

                const GalleryCarousel = () => {
                  const [current, setCurrent] = useState(0);
                  const count = galleryImages.length;

                  const go = useCallback((dir: 1 | -1) => {
                    setCurrent((prev) => (prev + dir + count) % count);
                  }, [count]);

                  return (
                    <div className="relative select-none">
                      {/* Main slide with caption below */}
                      <div className="space-y-0 rounded-2xl overflow-hidden border border-border bg-card shadow-heritage">
                        {/* Image area */}
                        <div className="relative aspect-[16/10] sm:aspect-[16/9] overflow-hidden bg-muted">
                          <AnimatePresence mode="popLayout">
                            <motion.div
                              key={current}
                              initial={{ opacity: 0, x: 60 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -60 }}
                              transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
                              className="absolute inset-0"
                            >
                              <img
                                src={galleryImages[current]}
                                alt={galleryCaptions[current] || `Tư liệu ${current + 1}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </motion.div>
                          </AnimatePresence>

                          {/* Counter pill */}
                          <div className="absolute top-3 right-3 z-10 bg-black/40 backdrop-blur-sm text-white/80 text-xs px-2.5 py-1 rounded-full font-medium">
                            {current + 1} / {count}
                          </div>

                          {/* Nav arrows */}
                          {count > 1 && (
                            <>
                              <button onClick={() => go(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/25 backdrop-blur-sm text-white/80 flex items-center justify-center hover:bg-black/50 transition-all hover:scale-110">
                                <ChevronLeft className="w-5 h-5" />
                              </button>
                              <button onClick={() => go(1)} className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/25 backdrop-blur-sm text-white/80 flex items-center justify-center hover:bg-black/50 transition-all hover:scale-110">
                                <ChevronRight className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </div>

                        {/* Caption area - outside image */}
                        <div className="border-t border-border bg-card px-5 py-4 min-h-[3.5rem] flex items-center gap-4">
                          <AnimatePresence mode="wait">
                            <motion.p
                              key={`cap-${current}`}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }}
                              transition={{ duration: 0.25 }}
                              className="text-muted-foreground text-sm md:text-base italic leading-relaxed flex-1"
                            >
                              {galleryCaptions[current] || `Hình ${current + 1}`}
                            </motion.p>
                          </AnimatePresence>

                          {/* Dot indicators */}
                          {count > 1 && count <= 8 && (
                            <div className="flex gap-1.5 shrink-0">
                              {galleryImages.map((_, i) => (
                                <button
                                  key={i}
                                  onClick={() => setCurrent(i)}
                                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                    i === current ? "bg-accent w-5" : "bg-border hover:bg-muted-foreground/40"
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Thumbnail strip */}
                      {count > 1 && (
                        <div className="flex gap-2 mt-4 justify-center overflow-x-auto py-1 px-2 scrollbar-none">
                          {galleryImages.map((url, i) => (
                            <button
                              key={i}
                              onClick={() => setCurrent(i)}
                              className={`relative shrink-0 w-14 h-10 sm:w-[4.5rem] sm:h-12 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                                i === current
                                  ? "border-accent shadow-gold-glow scale-105"
                                  : "border-transparent opacity-40 hover:opacity-75 grayscale hover:grayscale-0"
                              }`}
                            >
                              <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                };

                return (
                  <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                  >
                    <SectionHeading icon={BookOpen} title="Hình ảnh tư liệu" />
                    <GalleryCarousel />
                  </motion.section>
                );
              })()}

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
