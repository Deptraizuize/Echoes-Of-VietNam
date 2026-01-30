import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import TimelinePeriod from "@/components/timeline/TimelinePeriod";
import LoginPromptDialog from "@/components/timeline/LoginPromptDialog";
import { timelineData, Milestone } from "@/data/timelineData";
import logo from "@/assets/logo.png";

const Timeline = () => {
  const navigate = useNavigate();
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleMilestoneClick = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedMilestone(null);
  };

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
                  Dòng thời gian lịch sử
                </h1>
                <p className="text-sm text-muted-foreground">
                  Khám phá 5 thời kỳ chính của lịch sử Việt Nam
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
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Timeline Lịch Sử</span>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Hành trình qua các thời kỳ lịch sử
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Từ buổi bình minh của nền văn minh sông Hồng đến thời đại đổi mới,
            hãy cùng khám phá những cột mốc quan trọng đã định hình nên dân tộc Việt Nam.
          </p>
        </section>

        {/* Timeline Periods */}
        <section className="max-w-4xl mx-auto space-y-6">
          {timelineData.map((period, index) => (
            <div
              key={period.id}
              className="fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <TimelinePeriod
                period={period}
                onMilestoneClick={handleMilestoneClick}
              />
            </div>
          ))}
        </section>

        {/* CTA Section */}
        <section className="text-center mt-16 fade-in-up">
          <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="font-serif text-2xl font-bold text-foreground mb-4">
              Muốn khám phá sâu hơn?
            </h3>
            <p className="text-muted-foreground mb-6">
              Đăng nhập để truy cập nội dung chi tiết của từng cột mốc lịch sử,
              bao gồm hình ảnh, video và tài liệu tham khảo.
            </p>
            <Button variant="gold" size="lg" onClick={() => navigate("/auth")}>
              Đăng nhập để khám phá
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/50 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          © 2024 Echoes of Vietnam. Giữ gìn và lan tỏa lịch sử Việt Nam.
        </div>
      </footer>

      {/* Login Prompt Dialog */}
      <LoginPromptDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        milestone={selectedMilestone}
      />
    </div>
  );
};

export default Timeline;
