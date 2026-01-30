import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Clock, 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  Github, 
  Facebook,
  ExternalLink,
  ArrowRight,
  Sparkles
} from "lucide-react";
import logo from "@/assets/logo.png";
import { teamMembers, projectInfo, contactInfo } from "@/data/teamData";
import { timelineData } from "@/data/timelineData";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <a href="#" className="flex items-center gap-3 group">
              <img 
                src={logo} 
                alt="Logo" 
                className="w-9 h-9 object-contain transition-transform duration-300 group-hover:scale-110" 
              />
              <span className="font-serif font-semibold text-foreground hidden sm:block">
                Echoes of Vietnam
              </span>
            </a>
            
            <nav className="hidden md:flex items-center gap-8">
              {[
                { href: "#timeline", label: "Dòng thời gian" },
                { href: "#team", label: "Đội ngũ" },
                { href: "#about", label: "Về dự án" },
                { href: "#contact", label: "Liên hệ" },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 relative group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/auth")}
                className="text-muted-foreground hover:text-foreground"
              >
                Đăng nhập
              </Button>
              <Button 
                variant="gold" 
                size="sm"
                onClick={() => navigate("/auth")}
              >
                Bắt đầu
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 heritage-pattern" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -right-32 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -left-32 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-6 pt-24 pb-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo */}
            <div className="float-gentle mb-10 fade-in-up">
              <img
                src={logo}
                alt="Echoes of Vietnam"
                className="w-40 h-40 md:w-52 md:h-52 mx-auto object-contain drop-shadow-2xl image-render-smooth"
              />
            </div>

            {/* Badge */}
            <div className="fade-in-up delay-100 mb-6">
              <Badge 
                variant="secondary" 
                className="px-4 py-1.5 text-xs font-medium bg-accent/10 text-accent border-accent/20 hover:bg-accent/15"
              >
                <Sparkles className="w-3 h-3 mr-1.5" />
                Khám phá lịch sử Việt Nam
              </Badge>
            </div>

            {/* Title */}
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-foreground mb-6 fade-in-up delay-200 text-balance">
              Echoes of{" "}
              <span className="text-gradient-gold">Vietnam</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground mb-10 fade-in-up delay-300 max-w-2xl mx-auto text-balance leading-relaxed">
              Hành trình khám phá hàng nghìn năm lịch sử hào hùng của dân tộc 
              <span className="text-foreground font-medium"> qua từng trang sử vàng son</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center fade-in-up delay-400">
              <Button
                variant="gold"
                size="lg"
                onClick={() => navigate("/timeline")}
                className="min-w-[200px] font-medium group"
              >
                Khám phá ngay
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                variant="outline-teal"
                size="lg"
                onClick={() => navigate("/auth")}
                className="min-w-[200px] font-medium"
              >
                Đăng nhập
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16 fade-in-up delay-500">
              {[
                { value: "5", label: "Thời kỳ lịch sử" },
                { value: "40+", label: "Cột mốc quan trọng" },
                { value: "4000+", label: "Năm lịch sử" },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 fade-in-up delay-600">
          <a 
            href="#timeline" 
            className="flex flex-col items-center gap-2 text-muted-foreground hover:text-accent transition-colors"
          >
            <span className="text-xs uppercase tracking-widest">Khám phá</span>
            <div className="w-5 h-8 border-2 border-current rounded-full flex justify-center pt-1.5">
              <div className="w-1 h-1.5 bg-current rounded-full animate-bounce" />
            </div>
          </a>
        </div>
      </section>

      {/* Timeline Preview Section */}
      <section id="timeline" className="py-24 md:py-32 px-6 bg-gradient-section">
        <div className="container mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="text-center mb-16 fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-6">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Dòng thời gian</span>
            </div>
            <h2 className="font-serif text-foreground mb-4 text-balance">
              Hành trình qua các thời kỳ
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Từ buổi bình minh dựng nước đến thời đại đổi mới, 
              khám phá những cột mốc định hình nên dân tộc Việt Nam.
            </p>
          </div>

          {/* Timeline Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {timelineData.map((period, index) => (
              <div
                key={period.id}
                onClick={() => navigate("/timeline")}
                className="group glass rounded-2xl p-6 cursor-pointer card-hover glow-hover border fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <span className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground font-serif font-bold text-lg group-hover:bg-accent transition-colors duration-300">
                    {period.number}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif font-semibold text-foreground text-base mb-1 line-clamp-2 group-hover:text-accent transition-colors">
                      {period.title}
                    </h3>
                    <p className="text-xs text-accent font-medium">{period.timeRange}</p>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {period.focus}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/50">
                  <span>{period.phases.length} giai đoạn</span>
                  <span className="flex items-center gap-1 text-accent group-hover:gap-2 transition-all">
                    Xem chi tiết
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-12 fade-in-up">
            <Button 
              variant="gold" 
              size="lg"
              onClick={() => navigate("/timeline")}
              className="group"
            >
              Xem toàn bộ dòng thời gian
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-24 md:py-32 px-6">
        <div className="container mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="text-center mb-16 fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-6">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Đội ngũ</span>
            </div>
            <h2 className="font-serif text-foreground mb-4">
              Nhóm Tryyourbest
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Những người trẻ đam mê lịch sử và công nghệ, 
              mang đến cách tiếp cận mới để khám phá lịch sử Việt Nam.
            </p>
          </div>

          {/* Team Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {teamMembers.map((member, index) => {
              const initials = member.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase();

              return (
                <div
                  key={member.id}
                  className="group text-center fade-in-up"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="relative mb-4">
                    <Avatar className="w-20 h-20 mx-auto ring-2 ring-border group-hover:ring-accent transition-all duration-300 shadow-card">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-serif text-lg">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 rounded-full bg-accent/10 scale-0 group-hover:scale-110 transition-transform duration-300 -z-10" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">
                    {member.name}
                  </h3>
                  <p className="text-accent text-xs font-medium leading-tight">
                    {member.role}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About & Contact Section */}
      <section id="about" className="py-24 md:py-32 px-6 bg-gradient-section">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-5 gap-8">
            {/* Project Info - Larger */}
            <div className="md:col-span-3 glass rounded-2xl p-8 border fade-in-up">
              <Badge variant="secondary" className="mb-4 bg-accent/10 text-accent">
                Về dự án
              </Badge>
              <h2 className="font-serif text-foreground mb-4">
                {projectInfo.name}
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                {projectInfo.description}
              </p>

              <div className="mb-6">
                <h4 className="text-sm font-semibold text-foreground mb-3">
                  Công nghệ sử dụng
                </h4>
                <div className="flex flex-wrap gap-2">
                  {projectInfo.technologies.map((tech) => (
                    <Badge
                      key={tech}
                      variant="outline"
                      className="bg-background/50 hover:bg-accent/10 hover:text-accent hover:border-accent/30 transition-colors"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 pt-6 border-t border-border/50">
                <span className="text-sm text-muted-foreground">Phiên bản</span>
                <Badge variant="secondary">{projectInfo.version}</Badge>
              </div>
            </div>

            {/* Contact Info - Smaller */}
            <div id="contact" className="md:col-span-2 glass rounded-2xl p-8 border fade-in-up delay-100">
              <Badge variant="secondary" className="mb-4 bg-accent/10 text-accent">
                Liên hệ
              </Badge>
              <h3 className="font-serif text-foreground mb-6">
                Kết nối với chúng tôi
              </h3>

              <div className="space-y-5">
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="flex items-center gap-3 group"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                    <p className="text-sm text-foreground truncate group-hover:text-accent transition-colors">
                      {contactInfo.email}
                    </p>
                  </div>
                </a>

                {contactInfo.phone && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 text-accent">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Điện thoại</p>
                      <p className="text-sm text-foreground">{contactInfo.phone}</p>
                    </div>
                  </div>
                )}

                {contactInfo.address && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 text-accent">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Địa chỉ</p>
                      <p className="text-sm text-foreground">{contactInfo.address}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-8 pt-6 border-t border-border/50">
                {contactInfo.facebook && (
                  <a
                    href={contactInfo.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted hover:bg-accent/10 hover:text-accent transition-colors"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {contactInfo.github && (
                  <a
                    href={contactInfo.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted hover:bg-accent/10 hover:text-accent transition-colors"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 px-6">
        <div className="container mx-auto max-w-3xl">
          <div className="relative rounded-3xl overflow-hidden fade-in-up">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-teal-dark" />
            <div className="absolute inset-0 heritage-pattern opacity-30" />
            
            {/* Content */}
            <div className="relative px-8 py-16 md:px-16 md:py-20 text-center">
              <h2 className="font-serif text-primary-foreground mb-4 text-balance">
                Sẵn sàng khám phá lịch sử?
              </h2>
              <p className="text-primary-foreground/80 mb-10 max-w-lg mx-auto">
                Đăng ký miễn phí để truy cập đầy đủ nội dung chi tiết về các cột mốc lịch sử, 
                hình ảnh và tài liệu tham khảo.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  onClick={() => navigate("/auth")}
                  className="bg-white text-primary hover:bg-white/90 font-medium"
                >
                  Đăng ký miễn phí
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate("/timeline")}
                  className="border-white/30 text-white hover:bg-white/10 font-medium"
                >
                  Xem dòng thời gian
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/30 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
              <span className="font-serif font-semibold text-foreground">
                Echoes of Vietnam
              </span>
            </div>
            
            <p className="text-sm text-muted-foreground text-center">
              © 2024 Echoes of Vietnam. Giữ gìn và lan tỏa lịch sử Việt Nam.
            </p>
            
            <div className="flex items-center gap-6">
              {[
                { href: "#timeline", label: "Timeline" },
                { href: "#team", label: "Team" },
                { href: "#contact", label: "Contact" },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  {link.label}
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
