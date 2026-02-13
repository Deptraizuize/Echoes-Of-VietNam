import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight, ArrowUpRight, Mail, MapPin } from "lucide-react";
import logo from "@/assets/logo.png";
import { teamMembers, projectInfo, contactInfo } from "@/data/teamData";
import { timelineData } from "@/data/timelineData";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-foreground/95 backdrop-blur-sm border-b border-primary-foreground/10">
        <div className="container mx-auto px-6 md:px-12 py-4">
          <div className="flex items-center justify-between">
            <a href="#" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-accent/30 bg-muted flex items-center justify-center">
                <img src={logo} alt="Logo" className="w-6 h-6 object-contain" />
              </div>
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

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/auth")}
              className="text-primary-foreground border border-primary-foreground/20 hover:bg-primary-foreground hover:text-foreground text-sm"
            >
              Đăng nhập
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-foreground">
        <div className="absolute inset-0 heritage-pattern opacity-10" />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-foreground to-transparent" />

        <div className="container mx-auto px-6 md:px-12 relative z-10 pt-20">
          <div className="grid md:grid-cols-12 gap-8 items-center">
            {/* Text content */}
            <div className="md:col-span-7 order-2 md:order-1">
              <p className="text-primary-foreground/50 uppercase tracking-wider text-sm mb-6 fade-in-up">
                Hành trình lịch sử
              </p>

              <h1 className="text-primary-foreground text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 fade-in-up delay-200">
                Echoes of
                <br />
                <span className="italic text-accent">Vietnam</span>
              </h1>

              <div className="flex items-start gap-4 mb-10 fade-in-up delay-300">
                <div className="w-10 h-[2px] bg-accent mt-3 flex-shrink-0" />
                <p className="text-primary-foreground/60 text-lg max-w-md leading-relaxed">
                  Khám phá hàng nghìn năm lịch sử hào hùng qua từng trang sử
                  vàng son
                </p>
              </div>

              <Button
                size="lg"
                onClick={() => navigate("/timeline")}
                className="bg-accent hover:bg-accent/90 text-accent-foreground text-sm py-6 group fade-in-up delay-400"
              >
                Khám phá ngay
                <ArrowRight className="w-4 h-4 ml-3 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

            {/* Logo */}
            <div className="md:col-span-5 order-1 md:order-2 flex justify-center fade-in-up delay-100">
              <div className="relative">
                <div className="absolute inset-0 bg-accent/10 blur-[60px] rounded-full scale-125" />
                <div className="relative w-48 h-48 md:w-72 md:h-72 lg:w-80 lg:h-80 rounded-full bg-gradient-to-br from-primary-foreground/10 via-transparent to-accent/10 border border-primary-foreground/10 flex items-center justify-center float-gentle">
                  <img
                    src={logo}
                    alt="Echoes of Vietnam"
                    className="w-[75%] h-[75%] object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 pt-8 border-t border-primary-foreground/10 fade-in-up delay-500">
            <div className="grid grid-cols-3 gap-8">
              {[
                { value: "5", label: "Thời kỳ" },
                { value: "40+", label: "Cột mốc" },
                { value: "4000", label: "Năm lịch sử" },
              ].map((stat, index) => (
                <div key={index}>
                  <div className="text-3xl md:text-4xl font-bold text-primary-foreground mb-1">
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
      <section id="timeline" className="py-24 px-6 md:px-12 bg-background">
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

          {/* Timeline Items */}
          <div className="space-y-0">
            {timelineData.map((period, index) => (
              <div
                key={period.id}
                onClick={() => navigate("/timeline")}
                className="group cursor-pointer fade-in-up"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="grid md:grid-cols-12 gap-4 py-6 border-t border-border hover:bg-muted/30 transition-colors duration-300 px-4 -mx-4">
                  <div className="md:col-span-1">
                    <span className="text-3xl font-light text-muted-foreground/30 group-hover:text-accent transition-colors">
                      {period.number}
                    </span>
                  </div>
                  <div className="md:col-span-5">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors mb-1">
                      {period.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {period.timeRange}
                    </p>
                  </div>
                  <div className="md:col-span-4">
                    <p className="text-sm text-muted-foreground">
                      {period.focus}
                    </p>
                  </div>
                  <div className="md:col-span-2 flex items-center justify-end">
                    <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-6 border-t border-border fade-in-up">
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

      {/* CTA Section */}
      <section className="py-24 px-6 md:px-12 bg-foreground text-primary-foreground">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 fade-in-up">
            Bắt đầu hành trình
          </h2>
          <p className="text-primary-foreground/50 mb-10 fade-in-up delay-200">
            Đăng ký để truy cập đầy đủ nội dung chi tiết về các cột mốc lịch
            sử.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in-up delay-300">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="bg-accent hover:bg-accent/90 text-accent-foreground text-sm py-6"
            >
              Đăng ký miễn phí
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/timeline")}
              className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground hover:text-foreground text-sm py-6"
            >
              Xem Timeline
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 md:px-12 bg-background border-t border-border">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full overflow-hidden border border-accent/30 bg-muted flex items-center justify-center">
                <img
                  src={logo}
                  alt="Logo"
                  className="w-5 h-5 object-contain"
                />
              </div>
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
