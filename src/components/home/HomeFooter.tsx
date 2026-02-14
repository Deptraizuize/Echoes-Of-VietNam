import logo from "@/assets/logo.png";

const HomeFooter = () => (
  <footer className="py-10 px-6 md:px-12 bg-background border-t border-border relative">
    <div className="absolute inset-0 wave-pattern opacity-20 pointer-events-none" />
    <div className="container mx-auto relative z-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="w-7 h-7 rounded-md object-contain" />
          <span className="font-semibold">Echoes of Vietnam</span>
        </div>
        <p className="text-sm text-muted-foreground">
          © 2026 EchoesOfVN.com — Giữ gìn và lan tỏa lịch sử
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
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default HomeFooter;
