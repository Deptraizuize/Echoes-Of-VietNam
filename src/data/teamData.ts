export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  email?: string;
  phone?: string;
  description?: string;
}

export interface ProjectInfo {
  name: string;
  description: string;
  version: string;
  technologies: string[];
  repository?: string;
  website?: string;
}

export interface ContactInfo {
  email: string;
  phone?: string;
  address?: string;
  facebook?: string;
  github?: string;
}

export const teamMembers: TeamMember[] = [
  {
    id: "member-1",
    name: "Thành viên 1",
    role: "Team Leader / Project Manager",
    email: "member1@tryyourbest.com",
    description: "Quản lý dự án và điều phối nhóm",
  },
  {
    id: "member-2",
    name: "Thành viên 2",
    role: "Frontend Developer",
    email: "member2@tryyourbest.com",
    description: "Phát triển giao diện người dùng",
  },
  {
    id: "member-3",
    name: "Thành viên 3",
    role: "Backend Developer",
    email: "member3@tryyourbest.com",
    description: "Phát triển hệ thống backend",
  },
  {
    id: "member-4",
    name: "Thành viên 4",
    role: "UI/UX Designer",
    email: "member4@tryyourbest.com",
    description: "Thiết kế giao diện và trải nghiệm người dùng",
  },
  {
    id: "member-5",
    name: "Thành viên 5",
    role: "Content Writer / Researcher",
    email: "member5@tryyourbest.com",
    description: "Nghiên cứu và biên soạn nội dung lịch sử",
  },
  {
    id: "member-6",
    name: "Thành viên 6",
    role: "QA / Tester",
    email: "member6@tryyourbest.com",
    description: "Kiểm thử và đảm bảo chất lượng sản phẩm",
  },
];

export const projectInfo: ProjectInfo = {
  name: "Echoes of Vietnam",
  description:
    "Dự án web ứng dụng giáo dục về lịch sử Việt Nam, giúp người dùng khám phá và tìm hiểu về các giai đoạn lịch sử quan trọng của dân tộc thông qua giao diện tương tác hiện đại.",
  version: "1.0.0",
  technologies: ["React", "TypeScript", "Tailwind CSS", "Vite", "Supabase"],
  repository: "https://github.com/tryyourbest/echoes-of-vietnam",
  website: "https://echoesofvietnam.com",
};

export const contactInfo: ContactInfo = {
  email: "contact@tryyourbest.com",
  phone: "+84 123 456 789",
  address: "Việt Nam",
  facebook: "https://facebook.com/tryyourbest",
  github: "https://github.com/tryyourbest",
};
