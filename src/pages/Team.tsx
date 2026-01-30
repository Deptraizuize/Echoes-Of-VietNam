import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import TeamMemberCard from "@/components/team/TeamMemberCard";
import ProjectInfoSection from "@/components/team/ProjectInfo";
import ContactSection from "@/components/team/ContactSection";
import { teamMembers, projectInfo, contactInfo } from "@/data/teamData";
import logo from "@/assets/logo.png";

const Team = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-heritage heritage-pattern">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="hover:bg-muted"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
              <div>
                <h1 className="font-serif font-bold text-lg text-foreground">
                  Đội ngũ phát triển
                </h1>
                <p className="text-sm text-muted-foreground">
                  Nhóm Tryyourbest
                </p>
              </div>
            </div>
            <Button variant="gold" onClick={() => navigate("/auth")}>
              Đăng nhập
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12 fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-6">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Về chúng tôi</span>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Nhóm Tryyourbest
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Chúng tôi là những người trẻ đam mê lịch sử và công nghệ,
            mong muốn mang đến một cách tiếp cận mới để khám phá lịch sử Việt Nam.
          </p>
        </section>

        {/* Team Members */}
        <section className="mb-16 fade-in-up delay-100">
          <h2 className="font-serif text-2xl font-bold text-foreground mb-8 text-center">
            Thành viên nhóm
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {teamMembers.map((member, index) => (
              <div
                key={member.id}
                className="fade-in-up"
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                <TeamMemberCard member={member} />
              </div>
            ))}
          </div>
        </section>

        {/* Project Info & Contact */}
        <section className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="fade-in-up delay-200">
            <ProjectInfoSection project={projectInfo} />
          </div>
          <div className="fade-in-up delay-300">
            <ContactSection contact={contactInfo} />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/50 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          © 2024 Echoes of Vietnam. Giữ gìn và lan tỏa lịch sử Việt Nam.
        </div>
      </footer>
    </div>
  );
};

export default Team;
