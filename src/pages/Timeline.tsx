import { useNavigate } from "react-router-dom";
import TimelinePeriod from "@/components/timeline/TimelinePeriod";
import { timelineData } from "@/data/timelineData";
import UserHeader from "@/components/layout/UserHeader";

const Timeline = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <UserHeader />

      {/* Hero */}
      <section className="relative py-24 md:py-32 px-6 md:px-12 overflow-hidden bg-foreground">
        <div className="absolute inset-0 heritage-pattern opacity-5" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />

        <div className="container mx-auto relative z-10">
          <div className="grid md:grid-cols-12 gap-8 items-end">
            <div className="md:col-span-7 fade-in-up">
              <p className="text-primary-foreground/40 uppercase tracking-wider text-sm mb-4">
                Khám phá
              </p>
              <h2 className="text-primary-foreground mb-4 leading-tight">
                Dòng chảy{" "}
                <span className="italic text-accent">lịch sử</span>
              </h2>
              <div className="flex items-start gap-4">
                <div className="w-10 h-[2px] bg-accent mt-3 flex-shrink-0" />
                <p className="text-primary-foreground/50 text-lg max-w-md">
                  Từ buổi bình minh của nền văn minh sông Hồng đến thời đại đổi mới.
                </p>
              </div>
            </div>

            <div className="md:col-span-4 md:col-start-9 fade-in-up delay-200">
              <div className="grid grid-cols-2 gap-8">
                <div className="border-l-2 border-accent/40 pl-4">
                  <div className="text-4xl font-bold text-primary-foreground mb-1">41</div>
                  <div className="text-sm text-primary-foreground/40">Cột mốc</div>
                </div>
                <div className="border-l-2 border-accent/40 pl-4">
                  <div className="text-4xl font-bold text-primary-foreground mb-1">4000+</div>
                  <div className="text-sm text-primary-foreground/40">Năm</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="py-16 md:py-24 px-6 md:px-12">
        <div className="container mx-auto max-w-5xl">
          {/* Period Navigation Hint */}
          <div className="flex items-center gap-3 mb-10 fade-in-up">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <p className="text-sm text-muted-foreground">
              Chọn thời kỳ để khám phá chi tiết từng cột mốc lịch sử
            </p>
          </div>

          <div className="space-y-6">
            {timelineData.map((period, index) => (
              <div
                key={period.id}
                className="fade-in-up"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <TimelinePeriod period={period} />
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 md:px-12 border-t border-border">
        <div className="container mx-auto flex items-center justify-between">
          <span className="text-lg font-semibold">
            Echoes of <span className="italic text-accent">Vietnam</span>
          </span>
          <p className="text-sm text-muted-foreground">© 2024</p>
        </div>
      </footer>
    </div>
  );
};

export default Timeline;
