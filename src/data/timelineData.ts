export interface Milestone {
  id: string; // matches DB milestone id
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
    id: "khoi-nguyen",
    number: "I",
    title: "KHỞI NGUYÊN & DỰNG NƯỚC",
    timeRange: "Từ nguồn gốc → 179 TCN",
    focus: "Văn minh sông Hồng và các nhà nước sơ khai.",
    phases: [
      {
        id: "tien-su",
        name: "Tiền sử trên đất nước Việt Nam",
        milestones: [
          { id: "tien-su", title: "Các di chỉ đồ đá cũ (Núi Đọ, Xuân Lộc)" },
          { id: "hoa-binh-bac-son", title: "Hòa Bình - Bắc Sơn: Bước ngoặt trồng trọt" },
        ],
      },
      {
        id: "hong-bang",
        name: "Thời đại Hồng Bàng (Văn Lang)",
        milestones: [
          { id: "van-lang", title: "Nhà nước Văn Lang ra đời" },
          { id: "trong-dong-dong-son", title: "Đời sống vật chất & tinh thần (Trống đồng Đông Sơn)" },
        ],
      },
      {
        id: "au-lac",
        name: "Nhà nước Âu Lạc",
        milestones: [
          { id: "au-lac", title: "Thục Phán lên ngôi, lập nước Âu Lạc" },
          { id: "co-loa", title: "Thành Cổ Loa và cuộc kháng chiến chống Triệu Đà" },
        ],
      },
    ],
  },
  {
    id: "bac-thuoc",
    number: "II",
    title: "BẮC THUỘC & ĐẤU TRANH GIÀNH ĐỘC LẬP",
    timeRange: "179 TCN → 938",
    focus: "Sự kiên cường chống đồng hóa và các cuộc khởi nghĩa lớn.",
    phases: [
      {
        id: "tk1-6",
        name: "Các cuộc khởi nghĩa thời đầu (Thế kỷ I - VI)",
        milestones: [
          { id: "hai-ba-trung", title: "Khởi nghĩa Hai Bà Trưng", year: "Năm 40" },
          { id: "ba-trieu", title: "Khởi nghĩa Bà Triệu", year: "Năm 248" },
          { id: "van-xuan", title: "Nhà nước Vạn Xuân (Lý Nam Đế)", year: "544" },
        ],
      },
      {
        id: "tk7-10",
        name: "Bước chuyển mình tiến tới độc lập (Thế kỷ VII - X)",
        milestones: [
          { id: "mai-thuc-loan", title: "Khởi nghĩa Mai Thúc Loan" },
          { id: "phung-hung", title: "Phùng Hưng" },
          { id: "ho-khuc", title: "Họ Khúc giành quyền tự chủ", year: "905" },
          { id: "bach-dang-938", title: "Ngô Quyền và Đại thắng Bạch Đằng", year: "938" },
        ],
      },
    ],
  },
  {
    id: "dai-viet",
    number: "III",
    title: "XÂY DỰNG & BẢO VỆ QUỐC GIA ĐẠI VIỆT",
    timeRange: "939 → 1858",
    focus: "Sự phát triển vượt bậc của các triều đại phong kiến.",
    phases: [
      {
        id: "cung-co",
        name: "Thời kỳ củng cố (Ngô - Đinh - Tiền Lê)",
        milestones: [
          { id: "dinh-bo-linh", title: "Đinh Bộ Lĩnh dẹp loạn 12 sứ quân, lập nước Đại Cồ Việt" },
          { id: "le-hoan-chong-tong", title: "Lê Hoàn kháng chiến chống Tống lần 1" },
        ],
      },
      {
        id: "vang-son",
        name: "Thời đại vàng son (Lý - Trần - Hồ)",
        milestones: [
          { id: "doi-do-thang-long", title: "Lý Công Uẩn dời đô về Thăng Long", year: "1010" },
          { id: "nhu-nguyet", title: "Kháng chiến chống Tống (Lý Thường Kiệt - Sông Như Nguyệt)" },
          { id: "chong-nguyen-mong", title: "3 lần kháng chiến chống Nguyên - Mông (Hào khí Đông A)" },
          { id: "ho-quy-ly", title: "Cải cách của Hồ Quý Ly" },
        ],
      },
      {
        id: "le-so",
        name: "Thời Lê Sơ & Nam Bắc Triều",
        milestones: [
          { id: "lam-son", title: "Khởi nghĩa Lam Sơn (10 năm nằm gai nếm mật)" },
          { id: "le-thanh-tong", title: "Đại Việt thời Lê Thánh Tông (Cực thịnh)" },
          { id: "trinh-nguyen", title: "Cuộc chiến Trịnh - Nguyễn phân tranh" },
        ],
      },
      {
        id: "tay-son",
        name: "Phong trào Tây Sơn & Nhà Nguyễn",
        milestones: [
          { id: "rach-gam", title: "Chiến thắng Rạch Gầm - Xoài Mút" },
          { id: "quang-trung", title: "Đại phá quân Thanh (Quang Trung)", year: "1789" },
          { id: "nha-nguyen", title: "Nhà Nguyễn thống nhất đất nước", year: "1802" },
        ],
      },
    ],
  },
  {
    id: "chong-phap",
    number: "IV",
    title: "KHÁNG CHIẾN CHỐNG PHÁP & GIẢI PHÓNG DÂN TỘC",
    timeRange: "1858 → 1945",
    focus: "Từ mất nước đến độc lập.",
    phases: [
      {
        id: "gd1",
        name: "Cuộc kháng chiến của nhân dân dưới triều Nguyễn",
        milestones: [
          { id: "phap-da-nang", title: "Phát súng tại Đà Nẵng", year: "1858" },
          { id: "can-vuong", title: "Phong trào Cần Vương (Ba Đình, Bãi Sậy, Hương Khê)" },
          { id: "yen-the", title: "Khởi nghĩa Yên Thế (Hoàng Hoa Thám)" },
        ],
      },
      {
        id: "gd2",
        name: "Tìm đường cứu nước & Cách mạng Tháng 8",
        milestones: [
          { id: "khai-thac-thuoc-dia", title: "Các cuộc khai thác thuộc địa của Pháp" },
          { id: "nguyen-ai-quoc", title: "Nguyễn Ái Quốc tìm ra con đường cứu nước", year: "1911 - 1920" },
          { id: "thanh-lap-dang", title: "Thành lập Đảng Cộng sản Việt Nam", year: "1930" },
          { id: "cach-mang-thang-8", title: "Cách mạng Tháng Tám & Tuyên ngôn Độc lập", year: "1945" },
        ],
      },
    ],
  },
  {
    id: "bao-ve",
    number: "V",
    title: "BẢO VỆ ĐỘC LẬP & ĐỔI MỚI",
    timeRange: "1945 → Nay",
    focus: "Hai cuộc kháng chiến trường kỳ và xây dựng đất nước.",
    phases: [
      {
        id: "chong-phap-2",
        name: "Kháng chiến chống Pháp (1946 - 1954)",
        milestones: [
          { id: "toan-quoc-khang-chien", title: "Toàn quốc kháng chiến", year: "1946" },
          { id: "bien-gioi-1950", title: "Chiến dịch Biên giới Thu Đông", year: "1950" },
          { id: "dien-bien-phu", title: "Chiến thắng Điện Biên Phủ", year: "1954" },
        ],
      },
      {
        id: "chong-my",
        name: "Kháng chiến chống Mỹ (1954 - 1975)",
        milestones: [
          { id: "dong-khoi", title: "Phong trào Đồng Khởi", year: "1960" },
          { id: "dien-bien-phu-tren-khong", title: "Chiến thắng 'Điện Biên Phủ trên không'", year: "1972" },
          { id: "chien-dich-hcm", title: "Chiến dịch Hồ Chí Minh lịch sử", year: "1975" },
        ],
      },
      {
        id: "doi-moi",
        name: "Đổi mới & Phát triển (1976 - Nay)",
        milestones: [
          { id: "thong-nhat", title: "Thống nhất đất nước về mặt nhà nước", year: "1976" },
          { id: "doi-moi-1986", title: "Công cuộc Đổi mới", year: "1986" },
          { id: "hoi-nhap", title: "Việt Nam hội nhập quốc tế sâu rộng" },
        ],
      },
    ],
  },
];
