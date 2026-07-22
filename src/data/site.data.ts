export interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

export interface Service {
  icon: string;
  image: string;
  title: string;
  description: string;
}

export interface ProjectCategory {
  name: string;
  slug: string;
}

export interface Project {
  title: string;
  slug: string;
  categorySlug: string;
  categoryName: string;
  image: string;
  url: string;
}

export interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
}

export interface DesignProcessStep {
  step: number;
  title: string;
  paragraphs: string[];
  quote?: string;
  link?: { label: string; href: string };
}

export const designProcessSteps: DesignProcessStep[] = [
  {
    step: 1,
    title: 'Lấy yêu cầu của khách hàng',
    paragraphs: [
      'Nhân viên chúng tôi sẽ gởi quý khách bản khảo sát qua email. Quý khách có thể yêu cầu gặp nhân viên để cùng hiểu rõ các yêu cầu của bản khảo sát.',
      'Bản khảo sát là một tài liệu quan trọng giúp chúng tôi hiểu được nhu cầu khách hàng nhằm xây dựng được hệ thống hiệu quả và phù hợp với chi phí.',
    ],
    quote:
      'Quý khách vui lòng bỏ thời gian điền càng đầy đủ thông tin của bảng khảo sát càng chi tiết càng tốt.',
    link: { label: 'Tải về bản khảo sát', href: '/#contact' },
  },
  {
    step: 2,
    title: 'Gợi ý các mẫu giao diện theo phong cách Châu Âu',
    paragraphs: [
      'Khách hàng đều hài lòng với các mẫu website của www.themeforest.net. Các mẫu này đều có bản quyền và được thiết kế đúng chuẩn mực từ màu sắc tới kích thước.',
    ],
  },
  {
    step: 3,
    title: 'Cài đặt hệ thống WordPress',
    paragraphs: [
      'WordPress nổi tiếng với trên 409 triệu người truy cập hơn 14 tỷ trang web mỗi tháng. Tỷ lệ người Việt Nam tham gia là 1.1% đứng thứ 9 toàn cầu.',
    ],
  },
  {
    step: 4,
    title: 'Điều chỉnh website',
    paragraphs: [
      'Thay đổi hình ảnh banner, thay đổi menu, thay đổi thông tin liên lạc, biên tập cấu trúc nội dung.',
    ],
  },
  {
    step: 5,
    title: 'Hướng dẫn sử dụng',
    paragraphs: [
      'Sau khi hoàn thành, chúng tôi sẽ có một buổi hướng dẫn sử dụng trong vòng 2 giờ.',
    ],
  },
  {
    step: 6,
    title: 'Bảo hành 1 năm',
    paragraphs: [
      'Hiệu chỉnh lại các lỗi phát sinh, hiệu chỉnh các phần giao diện bị sai lệch, trả lời thắc mắc về cách post bài, quản trị.',
    ],
  },
];

export interface OptimizePackage {
  name: string;
  price: string;
  featured?: boolean;
  includesNote?: string;
  features: string[];
}

export interface OptimizePageContent {
  introTitle: string;
  introParagraphs: string[];
  packagesTitle: string;
  packages: OptimizePackage[];
  promoNote: string;
}

export const optimizePageContent: OptimizePageContent = {
  introTitle: 'Dịch vụ tối ưu và tăng tốc website WordPress là gì?',
  introParagraphs: [
    'Công cụ tìm kiếm (như Google) luôn ưu tiên các website tải nhanh hơn so với các trang tải chậm. Nếu bạn muốn cải thiện vị trí website trên các công cụ tìm kiếm, việc đầu tiên cần làm là cải thiện tốc độ tải trang.',
    'Một số nghiên cứu cho thấy tốc độ tải trang web là một trong những nguyên nhân dẫn đến khoảng 70% khách truy cập thoát trang. Đây chính là lý do chúng tôi ra mắt dịch vụ “Dịch vụ tối ưu Website WordPress” nhằm giúp website của bạn tăng tốc, qua đó lưu giữ khách hàng tốt hơn.',
  ],
  packagesTitle: 'Chi tiết Dịch Vụ Tối Ưu Website',
  packages: [
    {
      name: 'Gói cơ bản',
      price: '4.990.000đ',
      features: [
        'Cấu hình tùy chỉnh Cache tối ưu cơ bản',
        'Nâng cao bộ nhớ của WordPress',
        'Tối ưu WordPress cơ bản',
        'Chỉnh cài đặt plugin – tối ưu hóa cài đặt',
        'Chuyển đổi bảng dữ liệu database công nghệ InnoDB',
        'Kích hoạt và thiết lập tối ưu tính năng Adaptive Images',
        'Tối ưu hóa Gutenberg block nếu không sử dụng',
        'Sử dụng preconnect tối ưu',
        'Loại bỏ các file không sử dụng',
        'Tối ưu hóa favicon',
        'Tối ưu hóa iframes',
      ],
    },
    {
      name: 'Gói phổ thông',
      price: '9.990.000đ',
      featured: true,
      includesNote: 'Bao gồm công việc của gói Cơ bản và:',
      features: [
        'Tăng tốc wp – admin cao cấp',
        'Delay các javascript không làm vỡ giao diện website của bạn',
        'Server cấu hình tự chuyển ảnh sang định dạng webp',
        'Cài đặt bảo mật cho website',
        'Vô hiệu hóa lập chỉ mục và duyệt thư mục',
        'Loại bỏ Query String trong WordPress',
        'Xóa các chuyển hướng lỗi trong website',
      ],
    },
    {
      name: 'Gói nâng cao',
      price: '14.990.000đ',
      includesNote: 'Bao gồm công việc của gói Phổ thông và:',
      features: [
        'Backup toàn bộ website',
        'Tối ưu DNS',
        'Giảm HTTP requests',
        'Làm sạch WordPress',
        'Sử dụng object cache giúp tăng tốc backend',
        'Tối ưu Core web vitals',
        'Tối ưu hóa WebFont',
        'Tối ưu cho Woocommerce (nếu có)',
        'Tăng tốc nút đặt hàng',
        'Một số kỹ thuật tối ưu nâng cao khác',
      ],
    },
  ],
  promoNote:
    'ĐẶC BIỆT: Giảm giá 20% nếu dùng hosting của chúng tôi. Vui lòng liên hệ để được tư vấn chi tiết.',
};

export interface AboutHighlight {
  title: string;
  description: string;
  icon: 'people' | 'branch' | 'infra' | 'partner';
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
}

export interface AboutBenefit {
  title: string;
  description: string;
}

export interface AboutPageContent {
  heroTitle: string;
  heroTitleHighlight: string;
  heroIntro: string;
  companyTitle: string;
  companyParagraphs: string[];
  highlights: AboutHighlight[];
  teamTitle: string;
  teamIntro: string;
  teamMembers: TeamMember[];
  benefitsTitle: string;
  benefitsIntro: string;
  benefits: AboutBenefit[];
  partnersTitle: string;
  partnerNames: string[];
}

export const aboutPageContent: AboutPageContent = {
  heroTitle: 'Đối tác công nghệ đáng tin cậy',
  heroTitleHighlight: 'cho doanh nghiệp',
  heroIntro:
    'Nắm bắt được nhu cầu thiết kế website ngày càng tăng nhanh của khách hàng, chúng tôi cung cấp giải pháp thiết kế website trọn gói cho doanh nghiệp Việt. Với sự hiểu biết cùng kinh nghiệm lâu năm về lĩnh vực Marketing, đã giúp hàng ngàn khách hàng có được trang web hoạt động hiệu quả, tăng doanh số bán hàng.',
  companyTitle: 'Giới thiệu công ty thiết kế web',
  companyParagraphs: [
    'Thành lập năm 2014 với đội ngũ nhân lực giàu kinh nghiệm trên 10 năm trong lĩnh vực công nghệ thông tin. Với mong muốn ứng dụng CNTT vào doanh nghiệp nhằm nâng cao quy trình quản lý, tăng hiệu quả kinh doanh, giảm chi phí, tiết kiệm thời gian và bảo vệ môi trường.',
    'Với kinh nghiệm về lập trình cùng kinh nghiệm quản lý doanh nghiệp, chúng tôi sẵn sàng cùng quý khách xây dựng phần mềm từ các ý tưởng kinh doanh, quản lý, marketing. Chúng tôi là đối tác tin cậy về các giải pháp outsource phần mềm cho doanh nghiệp.',
    'Chúng tôi cung cấp môi trường ổn định, nền tảng cơ sở hạ tầng để hệ thống IT cũng như các dự án công nghệ của quý khách phát huy tác dụng.',
  ],
  highlights: [
    {
      title: 'Nhân sự',
      description:
        'Sở hữu đội ngũ chuyên môn cao với 15 chuyên viên cố định và 20 chuyên viên dự án.',
      icon: 'people',
    },
    {
      title: 'Chi nhánh',
      description:
        'Trụ sở chính tại TP. Hồ Chí Minh và chi nhánh quốc tế. Thực hiện xuyên suốt dự án trong nước và quốc tế.',
      icon: 'branch',
    },
    {
      title: 'Hạ tầng',
      description:
        'Cơ sở hạ tầng IT được xây dựng riêng với 5 Server đặt tại ODS, 50 máy chủ ảo.',
      icon: 'infra',
    },
    {
      title: 'Đối tác',
      description:
        'Là đối tác của các nhà cung cấp hosting lớn nhất Việt Nam hiện nay, PA Việt Nam và Mắt Bão – ODS.',
      icon: 'partner',
    },
  ],
  teamTitle: 'Đội ngũ',
  teamIntro:
    'Sở hữu đội ngũ có chiều sâu, nhiều kinh nghiệm, chuyên môn cao ở mọi vị trí.',
  teamMembers: [
    {
      name: 'Ngô Hoài Linh',
      role: 'Leader',
      bio: 'Kỹ sư CNTT, 4 năm kinh nghiệm xây dựng hệ thống nội dung CMS.',
    },
    {
      name: 'An Nguyễn',
      role: 'Web Developer',
      bio: 'Nhiều năm kinh nghiệm bảo mật thông tin, cố vấn giải pháp, hạ tầng và chính sách bảo mật. Kiến trúc sư phát triển phần mềm.',
    },
    {
      name: 'Thuý Hằng',
      role: 'Tech Lead',
      bio: '5 năm kinh nghiệm quản lý dự án. Leader dự án Startup Portal của Chính phủ Brunei.',
    },
    {
      name: 'Như Tạo',
      role: 'WordPress Developer',
      bio: 'Kỹ sư CNTT, 2 năm kinh nghiệm nền tảng CMS WordPress. Nhiệt tình và nỗ lực học hỏi không ngừng.',
    },
    {
      name: 'Hardy Le',
      role: 'UI/UX Designer',
      bio: 'Cử nhân CNTT, 6 năm kinh nghiệm thiết kế & phát triển giao diện website, ứng dụng di động và phần mềm.',
    },
    {
      name: 'Thảo Dương',
      role: 'Finance Director',
      bio: 'Chuyên gia quản lý tài chính doanh nghiệp và các dự án CNTT.',
    },
  ],
  benefitsTitle: 'Lợi ích của dịch vụ thiết kế website trọn gói',
  benefitsIntro:
    'Tự hào đã thực hiện thành công nhiều dự án lớn giúp nâng tầm doanh nghiệp bằng công nghệ.',
  benefits: [
    {
      title: 'Quảng bá thương hiệu, cập nhật thông tin rộng rãi',
      description:
        'Giúp bạn xây dựng thương hiệu đến mọi đối tượng, không giới hạn về không gian và thời gian. Từ đó tăng cơ hội thương hiệu tiếp cận với khách hàng.',
    },
    {
      title: 'Chiến dịch Marketing tối ưu hiệu suất',
      description:
        'Hiển thị quảng cáo sinh động, tính tương tác cao, hình ảnh chuyên nghiệp. Cho phép đo lường kỹ càng từng chỉ số và từ đó tối ưu hiệu suất cho chiến dịch.',
    },
    {
      title: 'Ưu đãi và khuyến mãi miễn phí',
      description:
        'Tặng miễn phí 1 năm sử dụng tên miền và hosting đối với khách hàng thiết kế web — bạn hoàn toàn có thể yên tâm khi lựa chọn dịch vụ.',
    },
    {
      title: 'Giao diện chuyên nghiệp, thu hút',
      description:
        'Đội ngũ hỗ trợ chuyên nghiệp, nhiều năm kinh nghiệm trong lĩnh vực phần mềm, máy chủ, website chắc chắn sẽ mang lại sự phục vụ tốt nhất, nhanh nhất, tiện lợi nhất.',
    },
    {
      title: 'Tư vấn và Chăm sóc khách hàng dễ dàng',
      description:
        'Khả năng tương tác mạnh mẽ hơn giữa bạn và khách hàng. Tăng khả năng tư vấn, báo giá, khuyến mãi, chốt đơn ngay trên web. Hệ thống dữ liệu lưu trữ trên web giúp chăm sóc khách hàng hiệu quả hơn.',
    },
    {
      title: 'Tính năng và chức năng phong phú',
      description:
        'Thiết kế web phù hợp với nhu cầu doanh nghiệp hay cá nhân: giới thiệu sản phẩm, tin tức, bất động sản, thanh toán trực tuyến… theo yêu cầu từng lĩnh vực.',
    },
    {
      title: 'Tiết kiệm chi phí so với cửa hàng offline',
      description:
        'Website là kênh bán hàng giúp mở rộng kinh doanh từ offline sang online, tiếp cận thị trường với hàng chục triệu khách hàng ưa chuộng mua sắm trực tuyến.',
    },
    {
      title: 'Hạn chế các vấn đề phát sinh',
      description:
        'Dịch vụ thiết kế website trọn gói hạn chế tối đa các vấn đề phát sinh như giao diện không đồng nhất giữa PC và Mobile trong quá trình xây dựng.',
    },
  ],
  partnersTitle: 'Khách Hàng & Đối Tác',
  partnerNames: [
    'PA Việt Nam',
    'Mắt Bão – ODS',
    'ThemeForest',
    'WordPress',
    'Google Cloud',
    'Brunei Portal',
  ],
};

export interface SiteLayoutData {
  nav: NavItem[];
  services: Service[];
  projectCategories: ProjectCategory[];
  projects: Project[];
}

export interface SiteData extends SiteLayoutData {
  brand: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  blogPosts: BlogPost[];
}

/** Dữ liệu mặc định khi chưa có content/projects.json */
export const defaultProjectsData: Pick<SiteLayoutData, 'projectCategories' | 'projects'> = {
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
  projects: [
    {
      title: 'Website nhà hàng',
      slug: 'nha-hang-sai-gon',
      categorySlug: 'an-uong',
      categoryName: 'Ăn uống',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
      url: '/du-an/demo/nha-hang-sai-gon',
    },
    {
      title: 'KAZE — Nhà hàng Nhật Bản',
      slug: 'nhahang',
      categorySlug: 'an-uong',
      categoryName: 'Ăn uống',
      image: '/images/Demo/NhaHang/00-landingpage-concept.png',
      url: '/du-an/demo/nhahang',
    },
    {
      title: 'Shop thời trang online',
      slug: 'shop-thoi-trang',
      categorySlug: 'ban-hang',
      categoryName: 'Bán hàng',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
      url: '/du-an/demo/shop-thoi-trang',
    },
    {
      title: 'Dự án căn hộ cao cấp',
      slug: 'can-ho-cao-cap',
      categorySlug: 'bat-dong-san',
      categoryName: 'Bất động sản',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop',
      url: '/du-an/demo/can-ho-cao-cap',
    },
    {
      title: 'Aurelia Estates',
      slug: 'aurelia-estates',
      categorySlug: 'bat-dong-san',
      categoryName: 'Bất động sản',
      image: '/images/Demo/House/house%20(1).png',
      url: '/du-an/demo/aurelia-estates',
    },
    {
      title: 'Tour du lịch Đà Nẵng',
      slug: 'tour-da-nang',
      categorySlug: 'du-lich',
      categoryName: 'Du lịch',
      image: 'https://images.unsplash.com/photo-1559592413-7cec4b0ef90f?w=800&h=600&fit=crop',
      url: '/du-an/demo/tour-da-nang',
    },
    {
      title: 'Spa & Wellness',
      slug: 'spa-wellness',
      categorySlug: 'dich-vu',
      categoryName: 'Dịch vụ',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&h=600&fit=crop',
      url: '/du-an/demo/spa-wellness',
    },
    {
      title: 'Aesthetic Clinic — Thẩm mỹ viện',
      slug: 'tham-my-vien',
      categorySlug: 'dich-vu',
      categoryName: 'Dịch vụ',
      image: '/images/Demo/ThamMyVien/thammyvien%20(4).png',
      url: '/du-an/demo/tham-my-vien',
    },
    {
      title: 'ORIS — Nha Khoa',
      slug: 'nha-khoa',
      categorySlug: 'dich-vu',
      categoryName: 'Dịch vụ',
      image: '/images/Demo/NhaKhoa/07-clinic-space.png',
      url: '/du-an/demo/nha-khoa',
    },
    {
      title: 'Corporate landing page',
      slug: 'corporate-landing',
      categorySlug: 'gioi-thieu-cong-ty',
      categoryName: 'Giới thiệu công ty',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
      url: '/du-an/demo/corporate-landing',
    },
    {
      title: 'Tin tức công nghệ',
      slug: 'tin-cong-nghe',
      categorySlug: 'tin-tuc',
      categoryName: 'Tin tức',
      image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop',
      url: '/du-an/demo/tin-cong-nghe',
    },
    {
      title: 'Portfolio thiết kế',
      slug: 'portfolio-thiet-ke',
      categorySlug: 'thiet-ke',
      categoryName: 'Thiết kế',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
      url: '/du-an/demo/portfolio-thiet-ke',
    },
    {
      title: 'ORIA — Cà phê specialty',
      slug: 'cafe-specialty',
      categorySlug: 'an-uong',
      categoryName: 'Ăn uống',
      image: '/images/Demo/Cafe/00-landingpage-concept.png',
      url: '/du-an/demo/cafe-specialty',
    },
  ],
};

/** Nội dung tĩnh trang chủ — thông tin liên hệ lấy từ content/settings.json, dự án từ content/projects.json */
export const siteLayout: SiteLayoutData = {
  nav: [
    { label: 'Trang chủ', href: '/' },
    { label: 'Giới thiệu', href: '/gioi-thieu' },
    { label: 'Thiết kế', href: '/thiet-ke' },
    { label: 'Dự án mẫu', href: '/du-an' },
    { label: 'Kiến thức', href: '/kien-thuc' },
    { label: 'Liên Hệ', href: '/lien-he' },
  ],
  services: [
    {
      icon: 'web',
      image: '/images/icon4.png',
      title: 'Thiết Kế Website',
      description:
        'Nhiều năm kinh nghiệm thiết kế web ở nhiều lĩnh vực, chúng tôi sẵn sàng tư vấn chi tiết cho quý khách, cùng với quý khách thiết kế website chuyên nghiệp, sang trọng, hiệu quả và ổn định.',
    },
    {
      icon: 'maintain',
      image: '/images/icon5.png',
      title: 'Bảo Trì Website',
      description:
        'Dịch vụ bảo trì website nhằm hỗ trợ và chăm sóc website của bạn khi phát hiện các vấn đề liên quan đến: lỗi virus, lỗi SEO, lỗi hệ thống web. nhanh chóng và kịp thời.',
    },
    {
      icon: 'host',
      image: '/images/icon6.png',
      title: 'Host Cao Cấp',
      description:
        'Cung cấp môi trường ổn định, an toàn, tốc độ để website của quý khách phát huy tác dụng trong việc quảng bá sản phẩm, dịch vụ. Cung cấp nền tảng hạ tầng cho các dự án công nghệ.',
    },
  ],
  projectCategories: defaultProjectsData.projectCategories,
  projects: defaultProjectsData.projects,
};
