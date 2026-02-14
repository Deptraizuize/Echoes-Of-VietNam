import { useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, Map, Trophy } from "lucide-react";
import featureHistory from "@/assets/feature-history.jpg";
import featureExplore from "@/assets/feature-explore.jpg";
import featureQuiz from "@/assets/feature-quiz.jpg";

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
    <section className="py-16 md:py-28 px-4 md:px-12 bg-background">
      <div className="container mx-auto">
        <div className="max-w-xl mb-12 md:mb-20">
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
        </div>

        <div className="space-y-8 md:space-y-0 md:grid md:grid-cols-3 md:gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="group cursor-pointer"
              onClick={() => navigate(f.link)}
            >
              {/* Image */}
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4 md:mb-5">
                <img
                  src={f.image}
                  alt={f.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                <div className="absolute top-3 left-3">
                  <div className="w-9 h-9 rounded-lg bg-accent/90 backdrop-blur-sm flex items-center justify-center text-accent-foreground">
                    {f.icon}
                  </div>
                </div>
                <div className="absolute bottom-3 left-3">
                  <span className="text-6xl md:text-7xl font-extrabold text-primary-foreground/10 leading-none">
                    {f.number}
                  </span>
                </div>
              </div>

              {/* Text */}
              <h3 className="text-foreground font-bold text-base md:text-lg mb-2 group-hover:text-accent transition-colors">
                {f.title}
              </h3>
              <p className="text-muted-foreground text-xs md:text-sm leading-relaxed mb-3">
                {f.desc}
              </p>
              <span className="inline-flex items-center gap-1.5 text-accent text-xs md:text-sm font-semibold group-hover:gap-2.5 transition-all">
                {f.cta}
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
