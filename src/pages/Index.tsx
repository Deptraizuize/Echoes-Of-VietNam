import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowRight,
  ArrowUpRight,
  Mail,
  MapPin,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { teamMembers, projectInfo, contactInfo } from "@/data/teamData";
import { timelineData } from "@/data/timelineData";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Fixed Header - Minimal Editorial */}
      <header className="fixed top-0 left-0 right-0 z-50 mix-blend-difference">
        <div className="container mx-auto px-6 md:px-12 py-6">
          <div className="flex items-center justify-between">
            <a href="#" className="flex items-center gap-3">
              <span className="font-serif text-xl text-white">
                Echoes
              </span>
            </a>
            
            <nav className="hidden md:flex items-center gap-10">
              {["Timeline", "Team", "About"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-sm text-white/80 hover:text-white transition-colors"
                >
                  {item}
                </a>
              ))}
            </nav>

            <Button 
              variant="ghost"
              size="sm"
              onClick={() => navigate("/auth")}
              className="text-white border border-white/20 hover:bg-white hover:text-foreground text-sm"
            >
              Đăng nhập
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section - Editorial Layout */}
      <section className="relative min-h-screen flex items-end pb-20 overflow-hidden">
        {/* Background Image Placeholder */}
        <div className="absolute inset-0 bg-foreground">
          <div className="absolute inset-0 heritage-pattern opacity-20" />
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-foreground to-transparent" />
        </div>

        {/* Logo Floating - Improved circular design */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-accent/10 blur-[80px] rounded-full scale-150" />
            
            {/* Outer decorative ring */}
            <div className="absolute inset-0 rounded-full border border-primary-foreground/10 scale-125" />
            
            {/* Main circle */}
            <div className="relative w-[300px] h-[300px] md:w-[450px] md:h-[450px] rounded-full bg-gradient-to-br from-primary-foreground/10 via-transparent to-accent/10 border border-primary-foreground/10 flex items-center justify-center float-gentle">
              <img
                src={logo}
                alt=""
                className="w-[80%] h-[80%] object-contain"
              />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="grid md:grid-cols-12 gap-8 items-end">
            {/* Main Title */}
            <div className="md:col-span-8">
              <div className="fade-in-up">
                <p className="text-primary-foreground/60 uppercase tracking-wider text-sm mb-6">
                  Hành trình lịch sử
                </p>
              </div>
              
              <h1 className="text-primary-foreground fade-in-up delay-200">
                Echoes of
                <br />
                <span className="italic">Vietnam</span>
              </h1>
              
              <div className="mt-8 flex items-center gap-6 fade-in-up delay-400">
                <div className="accent-bar" />
                <p className="text-primary-foreground/70 max-w-md">
                  Khám phá hàng nghìn năm lịch sử hào hùng qua từng trang sử vàng son
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="md:col-span-4 fade-in-up delay-600">
              <Button
                size="lg"
                onClick={() => navigate("/timeline")}
                className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground text-sm py-6 group"
              >
                Khám phá ngay
                <ArrowRight className="w-4 h-4 ml-3 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="mt-20 pt-8 border-t border-primary-foreground/10 fade-in-up delay-700">
            <div className="grid grid-cols-3 gap-8">
              {[
                { value: "5", label: "Thời kỳ" },
                { value: "40+", label: "Cột mốc" },
                { value: "4000", label: "Năm lịch sử" },
              ].map((stat, index) => (
                <div key={index}>
                  <div className="font-serif text-4xl md:text-5xl text-primary-foreground mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-primary-foreground/50">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section - Editorial Grid */}
      <section id="timeline" className="py-32 px-6 md:px-12 bg-background">
        <div className="container mx-auto">
          {/* Section Header */}
          <div className="grid md:grid-cols-12 gap-8 mb-20">
            <div className="md:col-span-4 fade-in-up">
              <p className="text-muted-foreground uppercase tracking-wider text-sm mb-4">
                01 / Timeline
              </p>
              <h2 className="text-foreground">
                Dòng thời gian
              </h2>
            </div>
            <div className="md:col-span-6 md:col-start-7 fade-in-up delay-200">
              <p className="text-muted-foreground text-lg leading-relaxed">
                Từ buổi bình minh dựng nước đến thời đại đổi mới. 
                Khám phá những cột mốc đã định hình nên dân tộc Việt Nam.
              </p>
            </div>
          </div>

          {/* Timeline Items */}
          <div className="space-y-1">
            {timelineData.map((period, index) => (
              <div
                key={period.id}
                onClick={() => navigate("/timeline")}
                className="group cursor-pointer fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="grid md:grid-cols-12 gap-4 py-8 border-t border-border hover:bg-muted/30 transition-colors duration-300 px-4 -mx-4">
                  {/* Number */}
                  <div className="md:col-span-1">
                    <span className="font-serif text-5xl text-muted-foreground/30 group-hover:text-accent transition-colors duration-300">
                      {period.number}
                    </span>
                  </div>
                  
                  {/* Title */}
                  <div className="md:col-span-5">
                    <h3 className="text-foreground group-hover:text-accent transition-colors duration-300 mb-2">
                      {period.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {period.timeRange}
                    </p>
                  </div>
                  
                  {/* Description */}
                  <div className="md:col-span-4">
                    <p className="text-muted-foreground">
                      {period.focus}
                    </p>
                  </div>
                  
                  {/* Arrow */}
                  <div className="md:col-span-2 flex items-center justify-end">
                    <ArrowUpRight className="w-6 h-6 text-muted-foreground group-hover:text-accent transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 pt-8 border-t border-border fade-in-up">
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

      {/* Team Section - Editorial Portrait Grid */}
      <section id="team" className="py-32 px-6 md:px-12 bg-muted/30">
        <div className="container mx-auto">
          {/* Section Header */}
          <div className="grid md:grid-cols-12 gap-8 mb-20">
            <div className="md:col-span-4 fade-in-up">
              <p className="text-muted-foreground uppercase tracking-wider text-sm mb-4">
                02 / Team
              </p>
              <h2 className="text-foreground">
                Nhóm phát triển
              </h2>
            </div>
            <div className="md:col-span-6 md:col-start-7 fade-in-up delay-200">
              <p className="text-muted-foreground text-lg leading-relaxed">
                <span className="text-foreground font-medium">Tryyourbest</span> — 
                Những người trẻ đam mê lịch sử và công nghệ.
              </p>
            </div>
          </div>

          {/* Team Grid - 2 rows of 3 */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {teamMembers.map((member, index) => {
              const initials = member.name.split(" ").map((n) => n[0]).join("").toUpperCase();

              return (
                <div
                  key={member.id}
                  className="group fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="aspect-[3/4] bg-muted mb-4 overflow-hidden">
                    <Avatar className="w-full h-full rounded-none">
                      <AvatarImage src={member.avatar} alt={member.name} className="object-cover" />
                      <AvatarFallback className="rounded-none bg-foreground text-background font-serif text-4xl">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <h4 className="text-foreground font-medium mb-1">
                    {member.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {member.role}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section - Asymmetric Layout */}
      <section id="about" className="py-32 px-6 md:px-12 bg-background">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-12 gap-12">
            {/* Left - Large Title */}
            <div className="md:col-span-5 fade-in-up">
              <p className="text-muted-foreground uppercase tracking-wider text-sm mb-4">
                03 / About
              </p>
              <h2 className="text-foreground mb-8">
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
                        className="rounded-none text-xs"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Contact */}
            <div className="md:col-span-5 md:col-start-8 fade-in-up delay-200">
              <div className="border-l border-border pl-8">
                <p className="text-sm text-muted-foreground mb-8">
                  Liên hệ
                </p>
                
                <div className="space-y-8">
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="flex items-start gap-4 group"
                  >
                    <Mail className="w-5 h-5 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Email</p>
                      <p className="text-foreground group-hover:text-accent transition-colors">
                        {contactInfo.email}
                      </p>
                    </div>
                  </a>

                  {contactInfo.address && (
                    <div className="flex items-start gap-4">
                      <MapPin className="w-5 h-5 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Địa điểm</p>
                        <p className="text-foreground">
                          {contactInfo.address}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Full Width */}
      <section className="py-32 px-6 md:px-12 bg-foreground text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="mb-8 fade-in-up">
            Bắt đầu hành trình
          </h2>
          <p className="text-primary-foreground/60 max-w-lg mx-auto mb-12 fade-in-up delay-200">
            Đăng ký để truy cập đầy đủ nội dung chi tiết về các cột mốc lịch sử.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in-up delay-400">
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

      {/* Footer - Minimal */}
      <footer className="py-12 px-6 md:px-12 bg-background border-t border-border">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-accent/30 bg-muted flex items-center justify-center">
                <img src={logo} alt="Logo" className="w-6 h-6 object-contain" />
              </div>
              <span className="font-serif text-xl">
                Echoes of Vietnam
              </span>
            </div>
            
            <div className="md:col-span-4 text-center">
              <p className="text-sm text-muted-foreground">
                © 2024 — Giữ gìn và lan tỏa lịch sử
              </p>
            </div>
            
            <div className="md:col-span-4 flex justify-end gap-8">
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
