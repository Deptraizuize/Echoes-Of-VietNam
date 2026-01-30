import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowRight,
  ArrowUpRight,
  Mail,
  MapPin,
  Play,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { teamMembers, projectInfo, contactInfo } from "@/data/teamData";
import { timelineData } from "@/data/timelineData";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Fixed Header - Magazine Style */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <a href="#" className="flex items-center gap-3">
              <div className="relative w-10 h-10 lg:w-12 lg:h-12 rounded-full overflow-hidden border-2 border-accent/30 bg-muted flex items-center justify-center">
                <img
                  src={logo}
                  alt="Echoes of Vietnam"
                  className="w-8 h-8 lg:w-10 lg:h-10 object-contain"
                />
              </div>
              <div className="hidden sm:block">
                <span className="font-serif text-lg lg:text-xl font-medium text-foreground">
                  Echoes
                </span>
                <span className="font-serif text-lg lg:text-xl italic text-accent ml-1">
                  Vietnam
                </span>
              </div>
            </a>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8 lg:gap-12">
              {[
                { label: "Dòng thời gian", href: "#timeline" },
                { label: "Đội ngũ", href: "#team" },
                { label: "Về dự án", href: "#about" },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* CTA */}
            <Button 
              size="sm"
              onClick={() => navigate("/auth")}
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium"
            >
              Đăng nhập
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section - Magazine Cover Style */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground to-accent/30" />
        
        {/* Decorative Elements */}
        <div className="absolute top-20 right-0 w-1/2 h-full opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, hsl(var(--accent)) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }} />
        </div>

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Content */}
            <div className="order-2 lg:order-1">
              <div className="fade-in-up">
                <Badge variant="outline" className="border-accent/50 text-accent bg-accent/10 mb-6">
                  Khám phá lịch sử Việt Nam
                </Badge>
              </div>
              
              <h1 className="text-primary-foreground mb-6 fade-in-up delay-100">
                <span className="block">Echoes of</span>
                <span className="block italic text-accent">Vietnam</span>
              </h1>
              
              <p className="text-primary-foreground/70 text-lg lg:text-xl leading-relaxed mb-8 max-w-lg fade-in-up delay-200">
                Hành trình xuyên suốt hơn 4000 năm lịch sử, từ thời dựng nước đến kỷ nguyên hiện đại. Khám phá những câu chuyện đã định hình nên dân tộc.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 mb-12 fade-in-up delay-300">
                <Button
                  size="lg"
                  onClick={() => navigate("/timeline")}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium group"
                >
                  Bắt đầu khám phá
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Xem giới thiệu
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 fade-in-up delay-400">
                {[
                  { value: "4000+", label: "Năm lịch sử" },
                  { value: "13", label: "Thời kỳ chính" },
                  { value: "100+", label: "Sự kiện quan trọng" },
                ].map((stat, index) => (
                  <div key={index} className="text-center lg:text-left">
                    <div className="font-serif text-2xl lg:text-3xl text-accent font-semibold">
                      {stat.value}
                    </div>
                    <div className="text-xs lg:text-sm text-primary-foreground/50 mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Hero Image/Logo */}
            <div className="order-1 lg:order-2 flex justify-center fade-in-up delay-200">
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-accent/20 blur-[80px] rounded-full scale-125" />
                
                {/* Logo Container */}
                <div className="relative">
                  {/* Outer Ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-accent/20 scale-110 animate-pulse" />
                  
                  {/* Main Circle with Logo */}
                  <div className="relative w-64 h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96 rounded-full bg-gradient-to-br from-accent/20 via-primary-foreground/5 to-accent/10 border border-primary-foreground/10 flex items-center justify-center backdrop-blur-sm overflow-hidden">
                    {/* Inner decorative ring */}
                    <div className="absolute inset-4 rounded-full border border-primary-foreground/10" />
                    
                    {/* Logo - Positioned to show full image */}
                    <img
                      src={logo}
                      alt="Echoes of Vietnam"
                      className="w-[85%] h-[85%] object-contain float-gentle relative z-10"
                    />
                  </div>
                  
                  {/* Decorative dots */}
                  <div className="absolute -top-4 -right-4 w-3 h-3 rounded-full bg-accent" />
                  <div className="absolute -bottom-2 -left-6 w-4 h-4 rounded-full bg-accent/50" />
                  <div className="absolute top-1/2 -right-8 w-2 h-2 rounded-full bg-primary-foreground/30" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 fade-in-up delay-500">
          <div className="flex flex-col items-center gap-2 text-primary-foreground/40">
            <span className="text-xs tracking-widest uppercase">Cuộn xuống</span>
            <div className="w-px h-8 bg-gradient-to-b from-primary-foreground/40 to-transparent" />
          </div>
        </div>
      </section>

      {/* Timeline Section - Magazine Grid */}
      <section id="timeline" className="py-24 lg:py-32 px-6 lg:px-12 bg-background">
        <div className="container mx-auto">
          {/* Section Header */}
          <div className="max-w-3xl mb-16 fade-in-up">
            <Badge variant="outline" className="mb-4">Dòng thời gian</Badge>
            <h2 className="text-foreground mb-4">
              Hành trình qua các thời kỳ lịch sử
            </h2>
            <p className="text-muted-foreground text-lg">
              Từ buổi bình minh dựng nước đến thời đại đổi mới, khám phá những cột mốc đã định hình nên dân tộc Việt Nam.
            </p>
          </div>

          {/* Timeline Grid - Magazine Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
            {timelineData.slice(0, 6).map((period, index) => (
              <div
                key={period.id}
                onClick={() => navigate("/timeline")}
                className="group cursor-pointer fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative h-full bg-card border border-border rounded-lg p-6 lg:p-8 hover:border-accent/50 hover:shadow-lg transition-all duration-300">
                  {/* Period Number */}
                  <div className="absolute top-6 right-6 font-serif text-5xl lg:text-6xl text-muted/50 group-hover:text-accent/30 transition-colors">
                    {period.number}
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <p className="text-sm text-accent font-medium mb-2">
                      {period.timeRange}
                    </p>
                    <h3 className="text-foreground mb-3 group-hover:text-accent transition-colors">
                      {period.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                      {period.focus}
                    </p>
                    
                    {/* Arrow */}
                    <div className="flex items-center text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-sm font-medium">Khám phá thêm</span>
                      <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center fade-in-up">
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/timeline")}
              className="group"
            >
              Xem toàn bộ dòng thời gian
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Team Section - Modern Grid */}
      <section id="team" className="py-24 lg:py-32 px-6 lg:px-12 bg-muted/30">
        <div className="container mx-auto">
          {/* Section Header */}
          <div className="max-w-3xl mb-16 fade-in-up">
            <Badge variant="outline" className="mb-4">Đội ngũ phát triển</Badge>
            <h2 className="text-foreground mb-4">
              Team Tryyourbest
            </h2>
            <p className="text-muted-foreground text-lg">
              Những người trẻ đam mê lịch sử và công nghệ, cùng nhau xây dựng cầu nối giữa quá khứ và hiện tại.
            </p>
          </div>

          {/* Team Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
            {teamMembers.map((member, index) => {
              const initials = member.name.split(" ").map((n) => n[0]).join("").toUpperCase();

              return (
                <div
                  key={member.id}
                  className="group fade-in-up text-center"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Avatar */}
                  <div className="relative w-24 h-24 lg:w-32 lg:h-32 mx-auto mb-4">
                    <Avatar className="w-full h-full border-2 border-border group-hover:border-accent transition-colors">
                      <AvatarImage src={member.avatar} alt={member.name} className="object-cover" />
                      <AvatarFallback className="bg-foreground text-background font-serif text-xl lg:text-2xl">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    {/* Hover ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-accent scale-110 opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                  
                  {/* Info */}
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

      {/* About Section */}
      <section id="about" className="py-24 lg:py-32 px-6 lg:px-12 bg-background">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Left - About */}
            <div className="fade-in-up">
              <Badge variant="outline" className="mb-4">Về dự án</Badge>
              <h2 className="text-foreground mb-6">
                Echoes of Vietnam
              </h2>
              
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                {projectInfo.description}
              </p>
              
              {/* Technologies */}
              <div>
                <p className="text-sm font-medium text-foreground mb-3">
                  Công nghệ sử dụng
                </p>
                <div className="flex flex-wrap gap-2">
                  {projectInfo.technologies.map((tech) => (
                    <Badge
                      key={tech}
                      variant="secondary"
                      className="font-normal"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Right - Contact */}
            <div className="fade-in-up delay-200">
              <div className="bg-card border border-border rounded-lg p-8">
                <h4 className="text-foreground mb-6">Liên hệ với chúng tôi</h4>
                
                <div className="space-y-6">
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Email</p>
                      <p className="text-foreground group-hover:text-accent transition-colors">
                        {contactInfo.email}
                      </p>
                    </div>
                  </a>

                  {contactInfo.address && (
                    <div className="flex items-center gap-4 p-4 rounded-lg">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-muted-foreground" />
                      </div>
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

      {/* CTA Section */}
      <section className="py-24 lg:py-32 px-6 lg:px-12 bg-foreground">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-primary-foreground mb-6 fade-in-up">
              Bắt đầu hành trình khám phá
            </h2>
            <p className="text-primary-foreground/60 text-lg mb-10 fade-in-up delay-100">
              Đăng ký miễn phí để truy cập đầy đủ nội dung chi tiết về các cột mốc lịch sử quan trọng của Việt Nam.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in-up delay-200">
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium"
              >
                Đăng ký miễn phí
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/timeline")}
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                Xem Timeline
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 lg:px-12 bg-background border-t border-border">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-accent/30 bg-muted flex items-center justify-center">
                <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
              </div>
              <span className="font-serif text-xl">
                Echoes of <span className="italic text-accent">Vietnam</span>
              </span>
            </div>
            
            {/* Copyright */}
            <p className="text-sm text-muted-foreground">
              © 2024 Echoes of Vietnam — Team Tryyourbest
            </p>
            
            {/* Links */}
            <div className="flex gap-6">
              {[
                { label: "Timeline", href: "#timeline" },
                { label: "Team", href: "#team" },
                { label: "About", href: "#about" },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
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
