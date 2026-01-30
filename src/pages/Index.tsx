import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-heritage heritage-pattern flex flex-col items-center justify-center p-6">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/3 rounded-full blur-3xl" />
      </div>

      <div className="text-center relative z-10 max-w-2xl mx-auto">
        {/* Logo with floating animation */}
        <div className="float-gentle mb-8 fade-in-up">
          <img
            src={logo}
            alt="Echoes of Vietnam"
            className="w-48 h-48 md:w-64 md:h-64 mx-auto object-contain drop-shadow-xl"
          />
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-primary mb-4 fade-in-up delay-100">
          Echoes of Vietnam
        </h1>

        {/* Decorative line */}
        <div className="flex items-center justify-center gap-4 mb-6 fade-in-up delay-200">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-accent" />
          <div className="w-2 h-2 rounded-full bg-accent" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-accent" />
        </div>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-muted-foreground mb-8 fade-in-up delay-200 leading-relaxed">
          Hành trình khám phá lịch sử hào hùng của dân tộc Việt Nam
          <br />
          <span className="text-accent font-medium">qua từng trang sử vàng son</span>
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center fade-in-up delay-300">
          <Button
            variant="gold"
            size="xl"
            onClick={() => navigate("/auth")}
            className="min-w-[200px] font-semibold"
          >
            Bắt đầu khám phá
          </Button>
          <Button
            variant="outline-teal"
            size="xl"
            onClick={() => navigate("/auth")}
            className="min-w-[200px] font-semibold"
          >
            Đăng nhập
          </Button>
        </div>

        {/* Features preview */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 fade-in-up delay-400">
          {[
            {
              title: "Dòng thời gian",
              description: "Khám phá lịch sử qua các thời kỳ",
              link: "/timeline",
            },
            {
              title: "Về chúng tôi",
              description: "Gặp gỡ nhóm phát triển",
              link: "/team",
            },
            {
              title: "Di sản văn hóa",
              description: "Tìm hiểu văn hóa truyền thống",
              link: "/auth",
            },
          ].map((feature, index) => (
            <button
              key={index}
              onClick={() => navigate(feature.link)}
              className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-5 text-center hover:shadow-heritage hover:border-accent/30 transition-all duration-300 cursor-pointer"
            >
              <h3 className="font-serif font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 text-center text-sm text-muted-foreground">
        © 2024 Echoes of Vietnam. Giữ gìn và lan tỏa lịch sử Việt Nam.
      </footer>
    </div>
  );
};

export default Index;
