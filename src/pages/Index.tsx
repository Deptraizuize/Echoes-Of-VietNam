import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight, Mail, MapPin, Heart, Star, Zap, Crown, LogOut, User } from "lucide-react";
import logo from "@/assets/logo.png";
import vietnamMap from "@/assets/vietnam-map.jpg";
import { teamMembers, projectInfo, contactInfo } from "@/data/teamData";
import Timeline3DCarousel from "@/components/timeline/Timeline3DCarousel";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-foreground/95 backdrop-blur-sm border-b border-primary-foreground/10">
        <div className="container mx-auto px-6 md:px-12 py-4">
          <div className="flex items-center justify-between">
            <a href="#" className="flex items-center gap-3">
              <img src={logo} alt="Logo" className="w-8 h-8 rounded-lg object-contain" />
              <span className="text-lg font-semibold text-primary-foreground">
                Echoes of <span className="italic text-accent">Vietnam</span>
              </span>
            </a>

            <nav className="hidden md:flex items-center gap-8">
              {["Timeline", "Team", "About"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  {item}
                </a>
              ))}
            </nav>

            {user ? (
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/profile")}
                  className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 text-sm gap-2"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{user.user_metadata?.full_name || user.email?.split("@")[0] || "Profile"}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={async () => { await signOut(); }}
                  className="text-primary-foreground/50 hover:text-primary-foreground hover:bg-primary-foreground/10 w-8 h-8"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/auth")}
                className="text-primary-foreground border border-primary-foreground/20 hover:bg-primary-foreground hover:text-foreground text-sm"
              >
                Đăng nhập
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-foreground">
        {/* Vietnam map background */}
        <div className="absolute inset-0">
          <img src={vietnamMap} alt="" className="absolute right-0 top-0 h-full w-auto object-cover opacity-30 md:opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/90 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground via-transparent to-foreground/60" />
        </div>
        <div className="absolute inset-0 heritage-pattern opacity-5" />

        <div className="container mx-auto px-6 md:px-12 relative z-10 pt-20">
          <div className="max-w-2xl">
            <p className="text-primary-foreground/50 uppercase tracking-wider text-sm mb-6 fade-in-up">
              Hành trình lịch sử
            </p>

            <div className="flex items-center gap-5 mb-8 fade-in-up delay-100">
              <img src={logo} alt="Logo" className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-contain" />
              <h1 className="text-primary-foreground text-4xl md:text-6xl lg:text-7xl font-extrabold leading-none">
                Echoes of
                <br />
                <span className="italic text-accent">Vietnam</span>
              </h1>
            </div>

            <div className="flex items-start gap-4 mb-10 fade-in-up delay-300">
              <div className="w-10 h-[2px] bg-accent mt-3 flex-shrink-0" />
              <p className="text-primary-foreground/60 text-lg max-w-md leading-relaxed">
                Khám phá hàng nghìn năm lịch sử hào hùng qua từng trang sử vàng son
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-16 fade-in-up delay-400">
              <Button
                size="lg"
                onClick={() => navigate("/timeline")}
                className="bg-accent hover:bg-accent/90 text-accent-foreground text-sm py-6 group"
              >
                Khám phá ngay
                <ArrowRight className="w-4 h-4 ml-3 transition-transform group-hover:translate-x-1" />
              </Button>
              {!user && (
                <Button
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="border border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 text-sm py-6 min-w-[160px]"
                >
                  ✦ Đăng ký miễn phí
                </Button>
              )}
              {user && (
                <Button
                  size="lg"
                  onClick={() => navigate("/profile")}
                  className="border border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 text-sm py-6 min-w-[160px]"
                >
                  Xem hồ sơ của tôi
                </Button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="pt-8 border-t border-primary-foreground/10 fade-in-up delay-500">
            <div className="grid grid-cols-3 gap-8 max-w-lg">
              {[
                { value: "5", label: "Thời kỳ" },
                { value: "41", label: "Cột mốc" },
                { value: "4000+", label: "Năm lịch sử" },
              ].map((stat, index) => (
                <div key={index}>
                  <div className="text-3xl md:text-4xl font-bold text-accent mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-primary-foreground/40">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section id="timeline" className="py-24 px-6 md:px-12 bg-background overflow-hidden">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-12 gap-8 mb-16">
            <div className="md:col-span-5 fade-in-up">
              <p className="text-muted-foreground uppercase tracking-wider text-sm mb-3">
                01 / Timeline
              </p>
              <h2 className="text-foreground text-3xl md:text-4xl font-bold">
                Dòng thời gian
              </h2>
            </div>
            <div className="md:col-span-5 md:col-start-8 flex items-end fade-in-up delay-200">
              <p className="text-muted-foreground leading-relaxed">
                Từ buổi bình minh dựng nước đến thời đại đổi mới. Khám phá
                những cột mốc đã định hình nên dân tộc Việt Nam.
              </p>
            </div>
          </div>

          {/* 3D Carousel */}
          <div className="fade-in-up delay-300">
            <Timeline3DCarousel />
          </div>

          <div className="mt-12 pt-6 border-t border-border fade-in-up delay-400 text-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/timeline")}
              className="text-sm group"
            >
              Xem toàn bộ timeline
              <ArrowRight className="w-4 h-4 ml-3 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-24 px-6 md:px-12 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-12 gap-8 mb-16">
            <div className="md:col-span-4 fade-in-up">
              <p className="text-muted-foreground uppercase tracking-wider text-sm mb-3">
                02 / Team
              </p>
              <h2 className="text-foreground text-3xl md:text-4xl font-bold">
                Nhóm phát triển
              </h2>
            </div>
            <div className="md:col-span-6 md:col-start-7 flex items-end fade-in-up delay-200">
              <p className="text-muted-foreground leading-relaxed">
                <span className="text-foreground font-medium">Tryyourbest</span>{" "}
                — Những người trẻ đam mê lịch sử và công nghệ.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {teamMembers.map((member, index) => {
              const initials = member.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase();

              return (
                <div
                  key={member.id}
                  className="group fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="aspect-[3/4] bg-muted mb-4 overflow-hidden rounded-lg">
                    <Avatar className="w-full h-full rounded-none">
                      <AvatarImage
                        src={member.avatar}
                        alt={member.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="rounded-none bg-foreground text-background text-3xl font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <h4 className="text-foreground font-semibold mb-0.5">
                    {member.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6 md:px-12 bg-background">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-12 gap-12">
            <div className="md:col-span-5 fade-in-up">
              <p className="text-muted-foreground uppercase tracking-wider text-sm mb-3">
                03 / About
              </p>
              <h2 className="text-foreground text-3xl md:text-4xl font-bold mb-8">
                Về dự án
              </h2>

              <div className="space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                  {projectInfo.description}
                </p>

                <div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Công nghệ
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {projectInfo.technologies.map((tech) => (
                      <Badge
                        key={tech}
                        variant="outline"
                        className="rounded-md text-xs"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 md:col-start-8 fade-in-up delay-200">
              <div className="border-l-2 border-accent/30 pl-8">
                <p className="text-sm text-muted-foreground mb-8">Liên hệ</p>

                <div className="space-y-8">
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="flex items-start gap-4 group"
                  >
                    <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Email
                      </p>
                      <p className="text-foreground group-hover:text-accent transition-colors">
                        {contactInfo.email}
                      </p>
                    </div>
                  </a>

                  {contactInfo.address && (
                    <div className="flex items-start gap-4">
                      <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Địa điểm
                        </p>
                        <p className="text-foreground">{contactInfo.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Section - "Người Yêu Sử" */}
      <section className="py-24 px-6 md:px-12 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-5 fade-in-up">
              <Badge className="bg-accent/10 text-accent border-accent/20 mb-4">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
              <h2 className="text-foreground text-3xl md:text-4xl font-bold mb-4">
                Người Yêu Sử
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Nâng cấp trải nghiệm học lịch sử với những đặc quyền dành riêng cho người yêu thích khám phá văn hóa Việt Nam.
              </p>
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="bg-accent hover:bg-accent/90 text-accent-foreground text-sm py-6 group"
              >
                Nâng cấp ngay
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

            <div className="md:col-span-6 md:col-start-7 fade-in-up delay-200">
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  {
                    icon: <Heart className="w-5 h-5 text-destructive" />,
                    title: "10 Tim mỗi ngày",
                    desc: "Gấp đôi số tim, thêm cơ hội làm quiz mỗi ngày",
                  },
                  {
                    icon: <Zap className="w-5 h-5 text-accent" />,
                    title: "Nhân đôi điểm",
                    desc: "Tự động x2 điểm khi đạt 6/10 trở lên (2 lần/ngày)",
                  },
                  {
                    icon: <Star className="w-5 h-5 text-accent" />,
                    title: "Huy hiệu đặc biệt",
                    desc: "Nhận huy hiệu vàng và khung avatar Premium",
                  },
                  {
                    icon: <Crown className="w-5 h-5 text-accent" />,
                    title: "Truy cập sớm",
                    desc: "Xem trước nội dung mới và tính năng độc quyền",
                  },
                ].map((perk, i) => (
                  <div
                    key={i}
                    className="p-5 bg-card border border-border rounded-lg hover:border-accent/30 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center mb-3">
                      {perk.icon}
                    </div>
                    <h4 className="font-semibold text-foreground text-sm mb-1">
                      {perk.title}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {perk.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 md:px-12 bg-foreground text-primary-foreground">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6 fade-in-up">
            {user ? "Tiếp tục hành trình" : "Bắt đầu hành trình"}
          </h2>
          <p className="text-primary-foreground/50 mb-10 fade-in-up delay-200">
            {user ? "Khám phá thêm nhiều cột mốc lịch sử và thử sức với các bài quiz." : "Đăng ký để truy cập đầy đủ nội dung chi tiết về các cột mốc lịch sử."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in-up delay-300">
            {user ? (
              <>
                <Button
                  size="lg"
                  onClick={() => navigate("/timeline")}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground text-sm py-6"
                >
                  Khám phá Timeline
                </Button>
                <Button
                  size="lg"
                  onClick={() => navigate("/profile")}
                  className="bg-primary-foreground/10 border border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 text-sm py-6"
                >
                  Xem hồ sơ
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground text-sm py-6"
                >
                  Đăng ký miễn phí
                </Button>
                <Button
                  size="lg"
                  onClick={() => navigate("/timeline")}
                  className="bg-primary-foreground/10 border border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 text-sm py-6"
                >
                  Xem Timeline
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 md:px-12 bg-background border-t border-border">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Logo" className="w-7 h-7 rounded-md object-contain" />
              <span className="font-semibold">Echoes of Vietnam</span>
            </div>

            <p className="text-sm text-muted-foreground">
              © 2024 — Giữ gìn và lan tỏa lịch sử
            </p>

            <div className="flex gap-6">
              {["Timeline", "Team", "About"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
