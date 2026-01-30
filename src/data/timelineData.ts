export interface Milestone {
  id: string;
  title: string;
  year?: string;
  description?: string;
}

export interface Phase {
  id: string;
  name: string;
  milestones: Milestone[];
}

export interface Period {
  id: string;
  number: string;
  title: string;
  timeRange: string;
  focus: string;
  phases: Phase[];
}

export const timelineData: Period[] = [
  {
    id: "period-1",
    number: "I",
    title: "KHỞI NGUYÊN & DỰNG NƯỚC",
    timeRange: "Từ nguồn gốc → 179 TCN",
    focus: "Văn minh sông Hồng và các nhà nước sơ khai.",
    phases: [
      {
        id: "p1-phase-1",
        name: "Tiền sử trên đất nước Việt Nam",
        milestones: [
          { id: "m1-1", title: "Các di chỉ đồ đá cũ (Núi Đọ, Xuân Lộc)" },
          { id: "m1-2", title: "Hòa Bình - Bắc Sơn: Bước ngoặt trồng trọt" },
        ],
      },
      {
        id: "p1-phase-2",
        name: "Thời đại Hồng Bàng (Văn Lang)",
        milestones: [
          { id: "m1-3", title: "Nhà nước Văn Lang ra đời" },
          { id: "m1-4", title: "Đời sống vật chất & tinh thần (Trống đồng Đông Sơn)" },
        ],
      },
      {
        id: "p1-phase-3",
        name: "Nhà nước Âu Lạc",
        milestones: [
          { id: "m1-5", title: "Thục Phán lên ngôi, lập nước Âu Lạc" },
          { id: "m1-6", title: "Thành Cổ Loa và cuộc kháng chiến chống Triệu Đà" },
        ],
      },
    ],
  },
  {
    id: "period-2",
    number: "II",
    title: "BẮC THUỘC & ĐẤU TRANH GIÀNH ĐỘC LẬP",
    timeRange: "179 TCN → 938",
    focus: "Sự kiên cường chống đồng hóa và các cuộc khởi nghĩa lớn.",
    phases: [
      {
        id: "p2-phase-1",
        name: "Các cuộc khởi nghĩa thời đầu (Thế kỷ I - VI)",
        milestones: [
          { id: "m2-1", title: "Khởi nghĩa Hai Bà Trưng", year: "Năm 40" },
          { id: "m2-2", title: "Khởi nghĩa Bà Triệu", year: "Năm 248" },
          { id: "m2-3", title: "Nhà nước Vạn Xuân (Lý Nam Đế)", year: "544" },
        ],
      },
      {
        id: "p2-phase-2",
        name: "Bước chuyển mình tiến tới độc lập (Thế kỷ VII - X)",
        milestones: [
          { id: "m2-4", title: "Khởi nghĩa Mai Thúc Loan & Phùng Hưng" },
          { id: "m2-5", title: "Họ Khúc giành quyền tự chủ", year: "905" },
          { id: "m2-6", title: "Ngô Quyền và Đại thắng Bạch Đằng", year: "938" },
        ],
      },
    ],
  },
  {
    id: "period-3",
    number: "III",
    title: "XÂY DỰNG & BẢO VỆ QUỐC GIA ĐẠI VIỆT",
    timeRange: "939 → 1858",
    focus: "Sự phát triển vượt bậc của các triều đại phong kiến.",
    phases: [
      {
        id: "p3-phase-1",
        name: "Thời kỳ củng cố (Ngô - Đinh - Tiền Lê)",
        milestones: [
          { id: "m3-1", title: "Đinh Bộ Lĩnh dẹp loạn 12 sứ quân, lập nước Đại Cồ Việt" },
          { id: "m3-2", title: "Lê Hoàn kháng chiến chống Tống lần 1" },
        ],
      },
      {
        id: "p3-phase-2",
        name: "Thời đại vàng son (Lý - Trần - Hồ)",
        milestones: [
          { id: "m3-3", title: "Lý Công Uẩn dời đô về Thăng Long", year: "1010" },
          { id: "m3-4", title: "Kháng chiến chống Tống (Lý Thường Kiệt - Sông Như Nguyệt)" },
          { id: "m3-5", title: "3 lần kháng chiến chống Nguyên - Mông (Hào khí Đông A)" },
          { id: "m3-6", title: "Cải cách của Hồ Quý Ly" },
        ],
      },
      {
        id: "p3-phase-3",
        name: "Thời Lê Sơ & Nam Bắc Triều",
        milestones: [
          { id: "m3-7", title: "Khởi nghĩa Lam Sơn (10 năm nằm gai nếm mật)" },
          { id: "m3-8", title: "Đại Việt thời Lê Thánh Tông (Cực thịnh)" },
          { id: "m3-9", title: "Cuộc chiến Trịnh - Nguyễn phân tranh (Chia cắt Đàng Trong - Đàng Ngoài)" },
        ],
      },
      {
        id: "p3-phase-4",
        name: "Phong trào Tây Sơn & Nhà Nguyễn",
        milestones: [
          { id: "m3-10", title: "Chiến thắng Rạch Gầm - Xoài Mút" },
          { id: "m3-11", title: "Đại phá quân Thanh (Quang Trung)", year: "1789" },
          { id: "m3-12", title: "Nhà Nguyễn thống nhất đất nước", year: "1802" },
        ],
      },
    ],
  },
  {
    id: "period-4",
    number: "IV",
    title: "KHÁNG CHIẾN CHỐNG PHÁP & GIẢI PHÓNG DÂN TỘC",
    timeRange: "1858 → 1945",
    focus: "Từ mất nước đến độc lập.",
    phases: [
      {
        id: "p4-phase-1",
        name: "Cuộc kháng chiến của nhân dân dưới triều Nguyễn",
        milestones: [
          { id: "m4-1", title: "Phát súng tại Đà Nẵng", year: "1858" },
          { id: "m4-2", title: "Phong trào Cần Vương (Ba Đình, Bãi Sậy, Hương Khê)" },
          { id: "m4-3", title: "Khởi nghĩa Yên Thế (Hoàng Hoa Thám)" },
        ],
      },
      {
        id: "p4-phase-2",
        name: "Tìm đường cứu nước & Cách mạng Tháng 8",
        milestones: [
          { id: "m4-4", title: "Các cuộc khai thác thuộc địa của Pháp" },
          { id: "m4-5", title: "Nguyễn Ái Quốc tìm ra con đường cứu nước", year: "1911 - 1920" },
          { id: "m4-6", title: "Thành lập Đảng Cộng sản Việt Nam", year: "1930" },
          { id: "m4-7", title: "Cách mạng Tháng Tám & Tuyên ngôn Độc lập", year: "1945" },
        ],
      },
    ],
  },
  {
    id: "period-5",
    number: "V",
    title: "BẢO VỆ ĐỘC LẬP & ĐỔI MỚI",
    timeRange: "1945 → Nay",
    focus: "Hai cuộc kháng chiến trường kỳ và xây dựng đất nước.",
    phases: [
      {
        id: "p5-phase-1",
        name: "Kháng chiến chống Pháp (1946 - 1954)",
        milestones: [
          { id: "m5-1", title: "Toàn quốc kháng chiến", year: "1946" },
          { id: "m5-2", title: "Chiến dịch Biên giới Thu Đông", year: "1950" },
          { id: "m5-3", title: "Chiến thắng Điện Biên Phủ", year: "1954" },
        ],
      },
      {
        id: "p5-phase-2",
        name: "Kháng chiến chống Mỹ (1954 - 1975)",
        milestones: [
          { id: "m5-4", title: "Phong trào Đồng Khởi", year: "1960" },
          { id: "m5-5", title: "Chiến thắng 'Điện Biên Phủ trên không'", year: "1972" },
          { id: "m5-6", title: "Chiến dịch Hồ Chí Minh lịch sử", year: "1975" },
        ],
      },
      {
        id: "p5-phase-3",
        name: "Đổi mới & Phát triển (1976 - Nay)",
        milestones: [
          { id: "m5-7", title: "Thống nhất đất nước về mặt nhà nước", year: "1976" },
          { id: "m5-8", title: "Công cuộc Đổi mới", year: "1986" },
          { id: "m5-9", title: "Việt Nam hội nhập quốc tế sâu rộng" },
        ],
      },
    ],
  },
];
