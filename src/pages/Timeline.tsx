import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import TimelinePeriod from "@/components/timeline/TimelinePeriod";
import { timelineData } from "@/data/timelineData";
import UserHeader from "@/components/layout/UserHeader";

const Timeline = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <UserHeader />

      {/* Hero */}
      <section className="py-20 px-6 md:px-12 border-b border-border">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-12 gap-8">
            <div className="md:col-span-6 fade-in-up">
              <p className="text-muted-foreground uppercase tracking-wider text-sm mb-4">
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
                  <div className="font-serif text-4xl text-foreground mb-1">41</div>
                  <div className="text-sm text-muted-foreground">Cột mốc</div>
                </div>
                <div>
                  <div className="font-serif text-4xl text-foreground mb-1">4000+</div>
                  <div className="text-sm text-muted-foreground">Năm</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="py-16 px-6 md:px-12">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-4">
            {timelineData.map((period, index) => (
              <div
                key={period.id}
                className="fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
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
          <span className="font-serif text-lg">Echoes of Vietnam</span>
          <p className="text-sm text-muted-foreground">© 2024</p>
        </div>
      </footer>
    </div>
  );
};

export default Timeline;
