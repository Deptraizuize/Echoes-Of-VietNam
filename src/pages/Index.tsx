import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight, Mail, MapPin, Heart, Star, Zap, Crown } from "lucide-react";
import { teamMembers, projectInfo, contactInfo } from "@/data/teamData";
import Timeline3DCarousel from "@/components/timeline/Timeline3DCarousel";
import { useAuth } from "@/contexts/AuthContext";
import HomeHeader from "@/components/home/HomeHeader";
import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import HomeFooter from "@/components/home/HomeFooter";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <HomeHeader />
      <HeroSection />
      <FeaturesSection />

      {/* Timeline Section */}
      <section id="timeline" className="py-16 md:py-24 px-4 md:px-12 bg-muted/30 overflow-hidden">
        <div className="container mx-auto">
          <div className="flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-8 mb-10 md:mb-16">
            <div className="md:col-span-5 fade-in-up">
              <p className="text-muted-foreground uppercase tracking-wider text-xs md:text-sm mb-2 md:mb-3">
                Dòng thời gian
              </p>
              <h2 className="text-foreground text-2xl md:text-4xl font-bold">
                Khám phá <span className="text-accent">5 thời kỳ</span>
              </h2>
            </div>
            <div className="md:col-span-5 md:col-start-8 flex items-end fade-in-up delay-200">
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                Từ buổi bình minh dựng nước đến thời đại đổi mới — mỗi thời kỳ mang một sắc màu riêng biệt.
              </p>
            </div>
          </div>

          <div className="fade-in-up delay-300">
            <Timeline3DCarousel />
          </div>

          <div className="mt-8 md:mt-12 pt-5 md:pt-6 border-t border-border fade-in-up delay-400 text-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/timeline")}
              className="text-sm group w-full sm:w-auto"
            >
              Xem toàn bộ timeline
              <ArrowRight className="w-4 h-4 ml-3 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-16 md:py-24 px-4 md:px-12 bg-background">
        <div className="container mx-auto">
          <div className="flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-8 mb-10 md:mb-16">
            <div className="md:col-span-4 fade-in-up">
              <p className="text-muted-foreground uppercase tracking-wider text-xs md:text-sm mb-2 md:mb-3">
                Đội ngũ
              </p>
              <h2 className="text-foreground text-2xl md:text-4xl font-bold">
                Nhóm phát triển
              </h2>
            </div>
            <div className="md:col-span-6 md:col-start-7 flex items-end fade-in-up delay-200">
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                <span className="text-foreground font-medium">Tryyourbest</span>{" "}
                — Những người trẻ đam mê lịch sử và công nghệ.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
            {teamMembers.map((member, index) => {
              const initials = member.name.split(" ").map((n) => n[0]).join("").toUpperCase();
              return (
                <div
                  key={member.id}
                  className="group fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="aspect-[3/4] bg-muted mb-3 md:mb-4 overflow-hidden rounded-lg">
                    <Avatar className="w-full h-full rounded-none">
                      <AvatarImage src={member.avatar} alt={member.name} className="object-cover" />
                      <AvatarFallback className="rounded-none bg-foreground text-background text-2xl md:text-3xl font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <h4 className="text-foreground font-semibold text-sm md:text-base mb-0.5">{member.name}</h4>
                  <p className="text-xs md:text-sm text-muted-foreground">{member.role}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 md:py-24 px-4 md:px-12 bg-muted/30">
        <div className="container mx-auto">
          <div className="flex flex-col md:grid md:grid-cols-12 gap-8 md:gap-12">
            <div className="md:col-span-5 fade-in-up">
              <p className="text-muted-foreground uppercase tracking-wider text-xs md:text-sm mb-2 md:mb-3">
                Về dự án
              </p>
              <h2 className="text-foreground text-2xl md:text-4xl font-bold mb-6 md:mb-8">
                Sứ mệnh của chúng tôi
              </h2>
              <div className="space-y-5 md:space-y-6">
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                  {projectInfo.description}
                </p>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground mb-3">Công nghệ</p>
                  <div className="flex flex-wrap gap-2">
                    {projectInfo.technologies.map((tech) => (
                      <Badge key={tech} variant="outline" className="rounded-md text-xs">{tech}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="md:col-span-5 md:col-start-8 fade-in-up delay-200">
              <div className="border-l-2 border-accent/30 pl-6 md:pl-8">
                <p className="text-xs md:text-sm text-muted-foreground mb-6 md:mb-8">Liên hệ</p>
                <div className="space-y-6 md:space-y-8">
                  <a href={`mailto:${contactInfo.email}`} className="flex items-start gap-3 md:gap-4 group">
                    <Mail className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Email</p>
                      <p className="text-sm md:text-base text-foreground group-hover:text-accent transition-colors break-all">
                        {contactInfo.email}
                      </p>
                    </div>
                  </a>
                  {contactInfo.address && (
                    <div className="flex items-start gap-3 md:gap-4">
                      <MapPin className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Địa điểm</p>
                        <p className="text-sm md:text-base text-foreground">{contactInfo.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Section */}
      <section className="py-16 md:py-24 px-4 md:px-12 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto">
          <div className="flex flex-col md:grid md:grid-cols-12 gap-8 md:gap-12 items-center">
            <div className="md:col-span-5 fade-in-up">
              <Badge className="bg-accent/10 text-accent border-accent/20 mb-4">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
              <h2 className="text-foreground text-2xl md:text-4xl font-bold mb-3 md:mb-4">
                Người Yêu Sử
              </h2>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-6 md:mb-8">
                Nâng cấp trải nghiệm với những đặc quyền dành riêng cho người yêu thích lịch sử Việt Nam.
              </p>
              <Button
                size="lg"
                onClick={() => navigate(user ? "/profile" : "/auth")}
                className="bg-accent hover:bg-accent/90 text-accent-foreground text-sm py-5 md:py-6 group w-full sm:w-auto"
              >
                {user ? "Xem đặc quyền" : "Nâng cấp ngay"}
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
            <div className="md:col-span-6 md:col-start-7 fade-in-up delay-200 w-full">
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {[
                  { icon: <Heart className="w-4 h-4 md:w-5 md:h-5 text-destructive" />, title: "10 Tim mỗi ngày", desc: "Gấp đôi số tim, thêm cơ hội làm quiz" },
                  { icon: <Zap className="w-4 h-4 md:w-5 md:h-5 text-accent" />, title: "Nhân đôi điểm", desc: "x2 điểm khi đạt 6/10 trở lên" },
                  { icon: <Star className="w-4 h-4 md:w-5 md:h-5 text-accent" />, title: "Huy hiệu đặc biệt", desc: "Huy hiệu vàng và khung avatar Premium" },
                  { icon: <Crown className="w-4 h-4 md:w-5 md:h-5 text-accent" />, title: "Truy cập sớm", desc: "Xem trước nội dung và tính năng mới" },
                ].map((perk, i) => (
                  <div key={i} className="p-3.5 md:p-5 bg-card border border-border rounded-lg hover:border-accent/30 transition-colors">
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-muted flex items-center justify-center mb-2.5 md:mb-3">
                      {perk.icon}
                    </div>
                    <h4 className="font-semibold text-foreground text-xs md:text-sm mb-1">{perk.title}</h4>
                    <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed">{perk.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 px-4 md:px-12 bg-foreground text-primary-foreground">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-2xl md:text-4xl font-bold text-primary-foreground mb-4 md:mb-6 fade-in-up">
            {user ? "Tiếp tục hành trình" : "Bắt đầu hành trình"}
          </h2>
          <p className="text-primary-foreground/50 text-sm md:text-base mb-8 md:mb-10 fade-in-up delay-200">
            {user
              ? "Khám phá thêm nhiều cột mốc lịch sử và thử sức với các bài quiz."
              : "Đăng ký để truy cập đầy đủ nội dung chi tiết về các cột mốc lịch sử."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center fade-in-up delay-300">
            {user ? (
              <>
                <Button size="lg" onClick={() => navigate("/timeline")} className="bg-accent hover:bg-accent/90 text-accent-foreground text-sm py-5 md:py-6">
                  Khám phá Timeline
                </Button>
                <Button size="lg" onClick={() => navigate("/profile")} className="bg-primary-foreground/10 border border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 text-sm py-5 md:py-6">
                  Xem hồ sơ
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" onClick={() => navigate("/auth")} className="bg-accent hover:bg-accent/90 text-accent-foreground text-sm py-5 md:py-6">
                  Đăng ký miễn phí
                </Button>
                <Button size="lg" onClick={() => navigate("/timeline")} className="bg-primary-foreground/10 border border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 text-sm py-5 md:py-6">
                  Xem Timeline
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      <HomeFooter />
    </div>
  );
};

export default Index;
