import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Clock, 
  Users, 
  BookOpen, 
  Mail, 
  Phone, 
  MapPin, 
  Github, 
  Facebook,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import logo from "@/assets/logo.png";
import { teamMembers, projectInfo, contactInfo } from "@/data/teamData";
import { timelineData } from "@/data/timelineData";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-heritage heritage-pattern">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
              <span className="font-serif font-bold text-lg text-foreground hidden sm:block">
                Echoes of Vietnam
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#timeline" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Dòng thời gian
              </a>
              <a href="#team" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Đội ngũ
              </a>
              <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Về dự án
              </a>
              <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Liên hệ
              </a>
            </nav>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => navigate("/auth")}>
                Đăng nhập
              </Button>
              <Button variant="gold" onClick={() => navigate("/auth")}>
                Đăng ký
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 min-h-[90vh] flex flex-col items-center justify-center relative">
        {/* Decorative background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/3 rounded-full blur-3xl" />
        </div>

        <div className="text-center relative z-10 max-w-2xl mx-auto">
          {/* Logo with floating animation */}
          <div className="float-gentle mb-8 fade-in-up">
            <img
              src={logo}
              alt="Echoes of Vietnam"
              className="w-48 h-48 md:w-64 md:h-64 mx-auto object-contain drop-shadow-xl"
            />
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-primary mb-4 fade-in-up delay-100">
            Echoes of Vietnam
          </h1>

          {/* Decorative line */}
          <div className="flex items-center justify-center gap-4 mb-6 fade-in-up delay-200">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-accent" />
            <div className="w-2 h-2 rounded-full bg-accent" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-accent" />
          </div>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 fade-in-up delay-200 leading-relaxed">
            Hành trình khám phá lịch sử hào hùng của dân tộc Việt Nam
            <br />
            <span className="text-accent font-medium">qua từng trang sử vàng son</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center fade-in-up delay-300">
            <Button
              variant="gold"
              size="xl"
              onClick={() => navigate("/timeline")}
              className="min-w-[200px] font-semibold"
            >
              Khám phá ngay
            </Button>
            <Button
              variant="outline-teal"
              size="xl"
              onClick={() => navigate("/auth")}
              className="min-w-[200px] font-semibold"
            >
              Đăng nhập
            </Button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <a href="#timeline" className="text-muted-foreground hover:text-accent transition-colors">
            <ChevronRight className="w-6 h-6 rotate-90" />
          </a>
        </div>
      </section>

      {/* Timeline Preview Section */}
      <section id="timeline" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-6">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Dòng thời gian</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              5 Thời kỳ lịch sử Việt Nam
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Từ buổi bình minh dựng nước đến thời đại đổi mới, khám phá hành trình lịch sử vẻ vang của dân tộc.
            </p>
          </div>

          {/* Timeline Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {timelineData.slice(0, 5).map((period, index) => (
              <div
                key={period.id}
                className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-6 hover:shadow-heritage hover:border-accent/30 transition-all duration-300 fade-in-up cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => navigate("/timeline")}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-serif font-bold">
                    {period.number}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-serif font-semibold text-foreground text-sm">
                      {period.title}
                    </h3>
                    <p className="text-xs text-accent">{period.timeRange}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {period.focus}
                </p>
                <div className="mt-4 text-xs text-muted-foreground">
                  {period.phases.length} giai đoạn • {period.phases.reduce((acc, p) => acc + p.milestones.length, 0)} cột mốc
                </div>
              </div>
            ))}

            {/* CTA Card */}
            <div
              className="bg-gradient-to-br from-primary/10 to-accent/10 border border-accent/30 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-gold-glow transition-all duration-300"
              onClick={() => navigate("/timeline")}
            >
              <BookOpen className="w-12 h-12 text-accent mb-4" />
              <h3 className="font-serif font-semibold text-foreground mb-2">
                Xem đầy đủ
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Khám phá chi tiết tất cả các cột mốc lịch sử
              </p>
              <Button variant="gold" size="sm">
                Khám phá ngay
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-6">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Đội ngũ phát triển</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Nhóm Tryyourbest
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Chúng tôi là những người trẻ đam mê lịch sử và công nghệ,
              mong muốn mang đến cách tiếp cận mới để khám phá lịch sử Việt Nam.
            </p>
          </div>

          {/* Team Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {teamMembers.map((member, index) => {
              const initials = member.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase();

              return (
                <div
                  key={member.id}
                  className="group bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-4 text-center hover:shadow-heritage hover:border-accent/30 transition-all duration-300 fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Avatar className="w-16 h-16 mx-auto mb-3 ring-2 ring-accent/20 group-hover:ring-accent/40 transition-all">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-serif">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-foreground text-sm mb-1">
                    {member.name}
                  </h3>
                  <p className="text-accent text-xs font-medium">{member.role}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Project Section */}
      <section id="about" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Project Info */}
            <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-8 fade-in-up">
              <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
                {projectInfo.name}
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {projectInfo.description}
              </p>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Công nghệ sử dụng
                </h3>
                <div className="flex flex-wrap gap-2">
                  {projectInfo.technologies.map((tech) => (
                    <Badge
                      key={tech}
                      variant="secondary"
                      className="bg-accent/10 text-accent hover:bg-accent/20"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium">Phiên bản:</span>
                <Badge variant="outline">{projectInfo.version}</Badge>
              </div>
            </div>

            {/* Contact Info */}
            <div id="contact" className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-8 fade-in-up delay-100">
              <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
                Liên hệ
              </h2>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/10">
                    <Mail className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <a
                      href={`mailto:${contactInfo.email}`}
                      className="text-foreground hover:text-accent transition-colors"
                    >
                      {contactInfo.email}
                    </a>
                  </div>
                </div>

                {contactInfo.phone && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/10">
                      <Phone className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Điện thoại</p>
                      <p className="text-foreground">{contactInfo.phone}</p>
                    </div>
                  </div>
                )}

                {contactInfo.address && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/10">
                      <MapPin className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Địa chỉ</p>
                      <p className="text-foreground">{contactInfo.address}</p>
                    </div>
                  </div>
                )}
              </div>

              <h3 className="text-sm font-semibold text-foreground mb-4">
                Mạng xã hội
              </h3>
              <div className="flex flex-wrap gap-3">
                {contactInfo.facebook && (
                  <a
                    href={contactInfo.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 text-muted-foreground hover:bg-accent/10 hover:text-accent transition-all"
                  >
                    <Facebook className="w-4 h-4" />
                    <span className="text-sm">Facebook</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {contactInfo.github && (
                  <a
                    href={contactInfo.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 text-muted-foreground hover:bg-accent/10 hover:text-accent transition-all"
                  >
                    <Github className="w-4 h-4" />
                    <span className="text-sm">GitHub</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-2xl text-center fade-in-up">
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-accent/30 rounded-2xl p-8 md:p-12">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">
              Sẵn sàng khám phá lịch sử?
            </h2>
            <p className="text-muted-foreground mb-8">
              Đăng ký ngay để truy cập đầy đủ nội dung chi tiết về các cột mốc lịch sử,
              hình ảnh, video và tài liệu tham khảo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="gold" size="lg" onClick={() => navigate("/auth")}>
                Đăng ký miễn phí
              </Button>
              <Button variant="outline-teal" size="lg" onClick={() => navigate("/timeline")}>
                Xem dòng thời gian
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/50 backdrop-blur-sm py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
              <span className="font-serif font-semibold text-foreground">
                Echoes of Vietnam
              </span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              © 2024 Echoes of Vietnam. Giữ gìn và lan tỏa lịch sử Việt Nam.
            </p>
            <div className="flex items-center gap-4">
              <a href="#timeline" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                Timeline
              </a>
              <a href="#team" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                Team
              </a>
              <a href="#contact" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
