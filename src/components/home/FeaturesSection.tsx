import { useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, Map, Trophy } from "lucide-react";
import featureHistory from "@/assets/feature-history.jpg";
import featureExplore from "@/assets/feature-explore.jpg";
import featureQuiz from "@/assets/feature-quiz.jpg";
import AnimatedSection from "./AnimatedSection";

const features = [
  {
    number: "01",
    title: "Dòng lịch sử sống động",
    desc: "Trải nghiệm lịch sử Việt Nam qua timeline tương tác 3D, từ thời dựng nước đến hiện đại, mỗi cột mốc là một câu chuyện cuốn hút.",
    image: featureHistory,
    icon: <BookOpen className="w-5 h-5" />,
    cta: "Khám phá Timeline",
    link: "/timeline",
  },
  {
    number: "02",
    title: "Khám phá chi tiết",
    desc: "Mỗi sự kiện lịch sử được trình bày với hình ảnh, nhân vật, diễn biến và ý nghĩa — giúp bạn hiểu sâu từng giai đoạn.",
    image: featureExplore,
    icon: <Map className="w-5 h-5" />,
    cta: "Xem chi tiết",
    link: "/timeline",
  },
  {
    number: "03",
    title: "Thử sức với Quiz",
    desc: "Kiểm tra kiến thức qua hệ thống quiz thú vị với điểm số, huy hiệu và bảng xếp hạng. Bạn hiểu lịch sử đến đâu?",
    image: featureQuiz,
    icon: <Trophy className="w-5 h-5" />,
    cta: "Làm Quiz ngay",
    link: "/timeline",
  },
];

const FeaturesSection = () => {
  const navigate = useNavigate();

  return (
    <section id="features" className="py-16 md:py-28 px-4 md:px-12 bg-background overflow-hidden">
      <div className="container mx-auto">
        <AnimatedSection className="max-w-xl mb-12 md:mb-20">
          <p className="text-muted-foreground uppercase tracking-wider text-xs md:text-sm mb-2 md:mb-3">
            Tính năng nổi bật
          </p>
          <h2 className="text-foreground text-2xl md:text-4xl font-bold mb-4">
            Lịch sử chưa bao giờ
            <br />
            <span className="text-accent">thú vị đến thế</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            Ba trải nghiệm cốt lõi giúp bạn khám phá và yêu thêm lịch sử dân tộc.
          </p>
        </AnimatedSection>

        {/* Unconventional staggered layout */}
        <div className="space-y-12 md:space-y-20">
          {features.map((f, i) => {
            const isEven = i % 2 === 0;
            return (
              <AnimatedSection
                key={i}
                direction={isEven ? "left" : "right"}
                delay={0.1}
              >
                <div
                  className={`group cursor-pointer flex flex-col ${
                    isEven ? "md:flex-row" : "md:flex-row-reverse"
                  } gap-6 md:gap-10 items-center`}
                  onClick={() => navigate(f.link)}
                >
                  {/* Image - larger, cinematic */}
                  <div className="relative w-full md:w-[55%] aspect-[16/10] rounded-2xl overflow-hidden flex-shrink-0">
                    <img
                      src={f.image}
                      alt={f.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                    <div className="absolute top-4 left-4">
                      <div className="w-10 h-10 rounded-xl bg-accent/90 backdrop-blur-sm flex items-center justify-center text-accent-foreground">
                        {f.icon}
                      </div>
                    </div>
                    <div className="absolute bottom-4 right-4">
                      <span className="text-7xl md:text-8xl font-extrabold text-primary-foreground/10 leading-none select-none">
                        {f.number}
                      </span>
                    </div>
                  </div>

                  {/* Text content */}
                  <div className="w-full md:w-[45%] flex flex-col justify-center">
                    <div className="accent-bar mb-4 md:mb-5" />
                    <h3 className="text-foreground font-bold text-xl md:text-2xl mb-3 group-hover:text-accent transition-colors">
                      {f.title}
                    </h3>
                    <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-5">
                      {f.desc}
                    </p>
                    <span className="inline-flex items-center gap-2 text-accent text-sm font-semibold group-hover:gap-3 transition-all">
                      {f.cta}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
