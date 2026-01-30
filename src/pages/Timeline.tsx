import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 md:px-12 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="hover:bg-muted"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
                <div>
                  <h1 className="font-serif text-xl text-foreground">
                    Dòng thời gian
                  </h1>
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/auth")}
              className="uppercase tracking-widest text-xs"
            >
              Đăng nhập
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-6 md:px-12 border-b border-border">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-12 gap-8">
            <div className="md:col-span-6 fade-in-up">
              <p className="text-muted-foreground uppercase tracking-[0.3em] text-sm mb-4">
                Khám phá
              </p>
              <h2 className="text-foreground mb-6">
                5 Thời kỳ lịch sử Việt Nam
              </h2>
              <p className="text-muted-foreground text-lg max-w-lg">
                Từ buổi bình minh của nền văn minh sông Hồng đến thời đại đổi mới.
              </p>
            </div>
            <div className="md:col-span-4 md:col-start-9 flex items-end fade-in-up delay-200">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="font-serif text-4xl text-foreground mb-1">40+</div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wider">Cột mốc</div>
                </div>
                <div>
                  <div className="font-serif text-4xl text-foreground mb-1">4000</div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wider">Năm</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="py-16 px-6 md:px-12">
        <div className="container mx-auto max-w-4xl">
          {/* Timeline Periods */}
          <div className="space-y-4">
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
          </div>
        </div>
      </main>

      {/* CTA Section */}
      <section className="py-20 px-6 md:px-12 bg-muted/30 border-t border-border">
        <div className="container mx-auto max-w-2xl text-center">
          <h3 className="text-foreground mb-4 fade-in-up">
            Muốn khám phá sâu hơn?
          </h3>
          <p className="text-muted-foreground mb-8 fade-in-up delay-100">
            Đăng nhập để xem nội dung chi tiết của từng cột mốc.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate("/auth")}
            className="bg-foreground text-background hover:bg-foreground/90 uppercase tracking-widest text-sm fade-in-up delay-200"
          >
            Đăng nhập ngay
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 md:px-12 border-t border-border">
        <div className="container mx-auto flex items-center justify-between">
          <span className="font-serif text-lg">Echoes of Vietnam</span>
          <p className="text-sm text-muted-foreground">
            © 2024
          </p>
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
