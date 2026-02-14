import logo from "@/assets/logo.png";

const HomeFooter = () => (
  <footer className="py-10 md:py-14 px-6 md:px-12 bg-foreground text-primary-foreground relative overflow-hidden">
    {/* Heritage patterns */}
    <div className="absolute inset-0 wave-pattern opacity-10 pointer-events-none" />
    <div className="absolute inset-0 dong-son-pattern opacity-[0.04] pointer-events-none" />
    
    <div className="container mx-auto relative z-10">
      {/* Cultural separator */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 h-px bg-primary-foreground/10" />
        <span className="text-accent/40 text-xs tracking-[0.5em]">✦ ✦ ✦</span>
        <div className="flex-1 h-px bg-primary-foreground/10" />
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="w-8 h-8 rounded-lg object-contain" />
          <div>
            <span className="font-semibold text-primary-foreground block">Echoes of <span className="italic text-accent">Vietnam</span></span>
            <span className="text-xs text-primary-foreground/30">Hành trình xuyên thời gian</span>
          </div>
        </div>
        
        <p className="text-sm text-primary-foreground/40 text-center">
          © 2026 EchoesOfVN — Giữ gìn và lan tỏa lịch sử dân tộc
        </p>
        
        <div className="flex gap-6">
          {[
            { label: "Timeline", href: "#timeline" },
            { label: "Nhóm", href: "#team" },
            { label: "Về dự án", href: "#about" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-primary-foreground/40 hover:text-accent transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>

      {/* Bottom quote */}
      <div className="mt-8 pt-6 border-t border-primary-foreground/5 text-center">
        <p className="text-xs text-primary-foreground/20 italic">
          "Dân ta phải biết sử ta, cho tường gốc tích nước nhà Việt Nam" — Hồ Chí Minh
        </p>
      </div>
    </div>
  </footer>
);

export default HomeFooter;
