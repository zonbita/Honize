export interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

export interface Service {
  icon: string;
  title: string;
  description: string;
}

export interface ProjectCategory {
  name: string;
  slug: string;
}

export interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
}

export interface SiteData {
  brand: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  nav: NavItem[];
  services: Service[];
  projectCategories: ProjectCategory[];
  blogPosts: BlogPost[];
}

export const siteData: SiteData = {
  brand: 'Honize™',
  tagline: 'Thiết kế web chuyên nghiệp - Sang trọng - Chuẩn SEO',
  phone: '(+84) 2873 040 030',
  email: 'info@honize.vn',
  address:
    '104/4A Nhất Chi Mai, Phường Tân Bình, Thành Phố Hồ Chí Minh, Việt Nam',
  nav: [
    {
      label: 'Báo giá',
      href: '#pricing',
      children: [
        { label: 'Các cấp độ web', href: '#pricing' },
        { label: 'Báo giá trọn gói', href: '#pricing' },
      ],
    },
    { label: 'Giới thiệu', href: '#about' },
    { label: 'Thiết kế', href: '#services' },
    { label: 'Bảo trì', href: '#services' },
    { label: 'Tối ưu', href: '#optimize' },
    { label: 'Hosting', href: '#services' },
    { label: 'Dự án mẫu', href: '#projects' },
    { label: 'Kiến thức', href: '#blog' },
    { label: 'Tuyển dụng', href: '#contact' },
  ],
  services: [
    {
      icon: 'design',
      title: 'Thiết Kế Website',
      description:
        'Nhiều năm kinh nghiệm thiết kế web ở nhiều lĩnh vực, chúng tôi sẵn sàng tư vấn chi tiết cho quý khách, cùng với quý khách thiết kế website chuyên nghiệp, sang trọng, hiệu quả và ổn định.',
    },
    {
      icon: 'maintenance',
      title: 'Bảo Trì Website',
      description:
        'Dịch vụ bảo trì website nhằm hỗ trợ và chăm sóc website của bạn khi phát hiện các vấn đề liên quan đến: lỗi virus, lỗi SEO, lỗi hệ thống web — nhanh chóng và kịp thời.',
    },
    {
      icon: 'hosting',
      title: 'Host Cao Cấp',
      description:
        'Cung cấp môi trường ổn định, an toàn, tốc độ để website của quý khách phát huy tác dụng trong việc quảng bá sản phẩm, dịch vụ. Cung cấp nền tảng hạ tầng cho các dự án công nghệ.',
    },
  ],
  projectCategories: [
    { name: 'Ăn uống', slug: 'an-uong' },
    { name: 'Bán hàng', slug: 'ban-hang' },
    { name: 'Bất động sản', slug: 'bat-dong-san' },
    { name: 'Đào tạo', slug: 'dao-tao' },
    { name: 'Dịch vụ', slug: 'dich-vu' },
    { name: 'Du học', slug: 'du-hoc' },
    { name: 'Du lịch', slug: 'du-lich' },
    { name: 'Giải pháp', slug: 'giai-phap' },
    { name: 'Giới thiệu công ty', slug: 'gioi-thieu-cong-ty' },
    { name: 'Kiến trúc', slug: 'kien-truc' },
    { name: 'Ngoại thất', slug: 'ngoai-that' },
    { name: 'Nội thất', slug: 'noi-that' },
    { name: 'Thiết kế', slug: 'thiet-ke' },
    { name: 'Tin tức', slug: 'tin-tuc' },
    { name: 'Xây dựng', slug: 'xay-dung' },
  ],
  blogPosts: [
    {
      title: 'Tối ưu hay thao túng AI – AEO hay AIM?',
      slug: 'toi-uu-hay-thao-tung-ai',
      excerpt:
        'Trong kỷ nguyên công cụ tìm kiếm dựa trên AI, cách chúng ta tối ưu hóa nội dung đang thay đổi rất nhanh. Từ SEO truyền thống, thị trường bước sang AEO (Answer Engine Optimization).',
    },
    {
      title: 'Answer Engine Optimization (AEO) là gì?',
      slug: 'answer-engine-optimization-aeo-la-gi',
      excerpt:
        'Kỹ thuật tối ưu nội dung để các Answer Engines – như ChatGPT, Google SGE, Gemini, Perplexity – có thể hiểu và sử dụng nội dung của bạn làm câu trả lời chính xác.',
    },
    {
      title: 'Bootstrap vs Tailwind CSS',
      slug: 'bootstrap-vs-tailwind-css',
      excerpt:
        'So sánh Bootstrap vs Tailwind CSS theo từng tiêu chí cụ thể, giúp bạn dễ dàng lựa chọn CSS framework phù hợp cho dự án phát triển giao diện web.',
    },
    {
      title: 'Báo giá thiết kế website trọn gói',
      slug: 'bao-gia-thiet-ke-website-tron-goi',
      excerpt:
        'Một website chuyên nghiệp không chỉ là bộ mặt thương hiệu mà còn là công cụ quan trọng để bán hàng và chăm sóc khách hàng.',
    },
    {
      title: 'Dịch vụ bảo trì web – 10 công việc quan trọng',
      slug: '10-viec-quan-trong-dich-vu-bao-tri-web',
      excerpt:
        'Website chuyên nghiệp cần được bảo trì định kỳ để đảm bảo hoạt động liên tục, an toàn và hiệu quả.',
    },
    {
      title: 'Dịch vụ SEO cho website lên top',
      slug: 'dich-vu-seo-cho-website',
      excerpt:
        'Tại sao website của bạn không thấy ở bất kỳ trang nào trong kết quả tìm kiếm Google? Tìm hiểu giải pháp SEO hiệu quả.',
    },
  ],
};
