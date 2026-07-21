import { Injectable } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';
import { ArticlesService } from './articles/articles.service';
import { resolveProjectRoot } from './shared/content-path';
import { loadPublicSiteData, loadSiteSettings } from './shared/site-settings';

@Injectable()
export class AppService {
  constructor(private readonly articlesService: ArticlesService) {}

  getHomePageData() {
    const site = loadPublicSiteData();
    const settings = loadSiteSettings();
    const latest = this.articlesService.getLatestForBlog(settings.postsPerPage);
    const blogPosts = latest.map((a) => this.articlesService.toBlogPost(a));

    return {
      ...site,
      blogPosts,
      year: new Date().getFullYear(),
      pageTitle: `${site.brand} — ${site.tagline}`,
      seo: this.articlesService.buildStaticPageSeo(
        `${site.brand} — ${site.tagline}`,
        site.tagline,
        '/',
        site.brand,
        false,
      ),
    };
  }

  getAboutPageData() {
    const site = loadPublicSiteData();
    return this.buildStaticPage(
      'Giới thiệu',
      'Giới thiệu',
      `Giới thiệu ${site.brand} — đối tác công nghệ đáng tin cậy, thiết kế website trọn gói cho doanh nghiệp.`,
      '/gioi-thieu',
    );
  }

  getProcessPageData() {
    const site = loadPublicSiteData();
    return this.buildStaticPage(
      'Quy trình thiết kế website',
      'Quy trình thiết kế website',
      `6 bước tiến hành thiết kế web chuyên nghiệp cùng ${site.brand}.`,
      '/quy-trinh-thiet-ke-website',
    );
  }

  getDesignPageData() {
    const site = loadPublicSiteData();
    return this.buildStaticPage(
      'Tăng tốc và tối ưu website',
      'Tăng tốc và tối ưu website',
      `Dịch vụ tối ưu và tăng tốc website WordPress — cải thiện PageSpeed, Core Web Vitals cùng ${site.brand}.`,
      '/thiet-ke',
    );
  }

  getProjectsPageData(categorySlug?: string) {
    const site = loadPublicSiteData();
    const projects = categorySlug
      ? site.projects.filter((p) => p.categorySlug === categorySlug)
      : site.projects;

    return {
      ...this.buildStaticPage(
        'Dự án mẫu',
        'Dự án mẫu',
        `Tham khảo các dự án thiết kế website tiêu biểu do ${site.brand} thực hiện.`,
        categorySlug ? `/du-an?danh-muc=${categorySlug}` : '/du-an',
      ),
      projects,
      activeCategory: categorySlug || '',
    };
  }

  getKnowledgePageData() {
    const site = loadPublicSiteData();
    const articles = this.articlesService.getLatestForBlog(50);
    return {
      ...this.buildStaticPage(
        'Kiến thức',
        'Kiến thức',
        `Tin tức, hướng dẫn và xu hướng thiết kế web, SEO từ ${site.brand}`,
        '/kien-thuc',
      ),
      blogPosts: articles.map((a) => this.articlesService.toBlogPost(a)),
    };
  }

  getDemoIndexData(categorySlug?: string) {
    const site = loadPublicSiteData();
    const demos = categorySlug
      ? site.projects.filter((p) => p.categorySlug === categorySlug)
      : site.projects;

    return {
      ...this.buildStaticPage(
        'Demo giao diện',
        'Demo giao diện',
        `Thư viện demo giao diện website theo danh mục dự án của ${site.brand}.`,
        categorySlug ? `/du-an/demo?danh-muc=${categorySlug}` : '/du-an/demo',
      ),
      demos,
      activeCategory: categorySlug || '',
    };
  }

  getDemoPageData(slug: string) {
    const site = loadPublicSiteData();
    const projects = site.projects;
    const index = projects.findIndex((p) => p.slug === slug);
    if (index < 0) return null;

    const demo = projects[index];
    const prevDemo = index > 0 ? projects[index - 1] : null;
    const nextDemo = index < projects.length - 1 ? projects[index + 1] : null;
    const templateSlug = this.resolveDemoTemplateSlug(slug);
    const customView = this.resolveCustomDemoView(slug);
    const demoCss = existsSync(
      join(resolveProjectRoot(), 'public', 'demo', `${templateSlug}.css`),
    )
      ? `/demo/${templateSlug}.css`
      : null;

    const tmvBase = slug === 'tham-my-vien' ? `/du-an/demo/${slug}` : null;
    const novaBase = slug === 'hoc-tieng-anh' ? `/du-an/demo/${slug}` : null;
    const vivuBase = slug === 'vivu' ? `/du-an/demo/${slug}` : null;

    return {
      layout: 'demo',
      year: new Date().getFullYear(),
      brand: site.brand,
      tmvBase,
      tmvActive: slug === 'tham-my-vien' ? 'home' : null,
      novaBase,
      novaActive: slug === 'hoc-tieng-anh' ? 'home' : null,
      vivuBase,
      vivuActive: slug === 'vivu' ? 'home' : null,
      vivuHeaderSolid: false,
      pageTitle: `Demo ${demo.title} — ${site.brand}`,
      seo: this.articlesService.buildStaticPageSeo(
        `Demo ${demo.title} — ${site.brand}`,
        `Xem demo giao diện ${demo.title} (${demo.categoryName}) thiết kế bởi ${site.brand}.`,
        `/du-an/demo/${demo.slug}`,
        site.brand,
      ),
      demo,
      prevDemo,
      nextDemo,
      demoView: customView || 'demo/show',
      demoCss,
      products: customView ? this.getDemoProducts(templateSlug) : [],
      collections: customView ? this.getDemoCollections(templateSlug) : [],
      items: customView ? this.getDemoItems(templateSlug) : [],
      features: customView ? this.getDemoFeatures(templateSlug) : [],
      services: customView ? this.getDemoServices(templateSlug) : [],
      stats: customView ? this.getDemoStats(templateSlug) : [],
      tours: customView ? this.getDemoTours(templateSlug) : [],
      courses: customView ? this.getDemoCourses(templateSlug) : [],
      testimonials: customView ? this.getDemoTestimonials(templateSlug) : [],
      destinations: customView ? this.getDemoDestinations(templateSlug) : [],
      achievements: customView ? this.getDemoAchievements(templateSlug) : [],
      teachers: customView ? this.getDemoTeachers(templateSlug) : [],
      campuses: customView ? this.getDemoCampuses(templateSlug) : [],
      news: customView ? this.getDemoNews(templateSlug) : [],
      ...this.getNovaExtras(templateSlug),
      ...this.getVivuExtras(templateSlug),
    };
  }

  /** Multi-page demo sub-routes (slug → subpage → view + nav id). */
  private readonly demoSubpages: Record<
    string,
    Record<string, { view: string; nav: string; title: string; heroBg?: string }>
  > = {
    'tham-my-vien': {
      'gioi-thieu': {
        view: 'demo/pages/tham-my-vien/gioi-thieu',
        nav: 'about',
        title: 'Giới thiệu',
        heroBg: '/images/ThamMyVien/ssskfdfkdfdfk.png',
      },
      'dich-vu': {
        view: 'demo/pages/tham-my-vien/dich-vu',
        nav: 'services',
        title: 'Dịch vụ',
        heroBg: '/images/ThamMyVien/tmv-bg-dich-vu.png',
      },
      'cong-nghe': {
        view: 'demo/pages/tham-my-vien/cong-nghe',
        nav: 'technology',
        title: 'Công nghệ',
        heroBg: '/images/ThamMyVien/tmv-bg-cong-nghe.png',
      },
      'kien-thuc': {
        view: 'demo/pages/tham-my-vien/kien-thuc',
        nav: 'knowledge',
        title: 'Kiến thức',
        heroBg: '/images/ThamMyVien/tmv-bg-kien-thuc.png',
      },
      'lien-he': {
        view: 'demo/pages/tham-my-vien/lien-he',
        nav: 'contact',
        title: 'Liên hệ',
        heroBg: '/images/ThamMyVien/tmv-bg-lien-he.png',
      },
    },
    'hoc-tieng-anh': {
      'phuong-phap': {
        view: 'demo/pages/hoc-tieng-anh/phuong-phap',
        nav: 'method',
        title: 'Phương pháp',
      },
      'ket-qua': {
        view: 'demo/pages/hoc-tieng-anh/ket-qua',
        nav: 'results',
        title: 'Kết quả',
      },
      'giang-vien': {
        view: 'demo/pages/hoc-tieng-anh/giang-vien',
        nav: 'teachers',
        title: 'Giảng viên',
      },
      'hoc-vien': {
        view: 'demo/pages/hoc-tieng-anh/hoc-vien',
        nav: 'students',
        title: 'Học viên',
      },
      'tin-tuc': {
        view: 'demo/pages/hoc-tieng-anh/tin-tuc',
        nav: 'news',
        title: 'Tin tức',
      },
      've-nova': {
        view: 'demo/pages/hoc-tieng-anh/ve-nova',
        nav: 'about',
        title: 'Về NOVA',
      },
    },
    vivu: {
      'diem-den': {
        view: 'demo/pages/vivu/diem-den',
        nav: 'destinations',
        title: 'Điểm đến',
        heroBg: '/images/Vivu/01-hero-ha-long.png',
      },
      'tour-du-lich': {
        view: 'demo/pages/vivu/tour-du-lich',
        nav: 'tours',
        title: 'Tour du lịch',
        heroBg: '/images/Vivu/02-ha-long.png',
      },
      'trai-nghiem': {
        view: 'demo/pages/vivu/trai-nghiem',
        nav: 'experiences',
        title: 'Trải nghiệm',
        heroBg: '/images/Vivu/08-travel-couple.png',
      },
      'cam-nang': {
        view: 'demo/pages/vivu/cam-nang',
        nav: 'handbook',
        title: 'Cẩm nang',
        heroBg: '/images/Vivu/04-hoi-an.png',
      },
      'lien-he': {
        view: 'demo/pages/vivu/lien-he',
        nav: 'contact',
        title: 'Liên hệ',
        heroBg: '/images/Vivu/07-sa-pa.png',
      },
    },
  };

  getDemoSubpageData(slug: string, subpage: string) {
    const subpages = this.demoSubpages[slug];
    const config = subpages?.[subpage];
    if (!config) return null;

    const viewPath = join(
      resolveProjectRoot(),
      'views',
      ...config.view.split('/'),
    ).replace(/\.hbs$/, '') + '.hbs';
    if (!existsSync(viewPath)) return null;

    const base = this.getDemoPageData(slug);
    if (!base) return null;

    const demoTitle = base.demo?.title ?? slug;
    const path = `/du-an/demo/${slug}/${subpage}`;

    return {
      ...base,
      demoView: config.view,
      tmvBase: slug === 'tham-my-vien' ? `/du-an/demo/${slug}` : base.tmvBase,
      tmvActive: slug === 'tham-my-vien' ? config.nav : base.tmvActive,
      tmvHeaderSolid: slug === 'tham-my-vien',
      tmvHeroBg:
        config.heroBg ?? `/images/ThamMyVien/tmv-bg-${subpage}.png`,
      novaBase: slug === 'hoc-tieng-anh' ? `/du-an/demo/${slug}` : base.novaBase,
      novaActive: slug === 'hoc-tieng-anh' ? config.nav : base.novaActive,
      vivuBase: slug === 'vivu' ? `/du-an/demo/${slug}` : base.vivuBase,
      vivuActive: slug === 'vivu' ? config.nav : base.vivuActive,
      vivuHeaderSolid: slug === 'vivu',
      vivuHeroBg: slug === 'vivu' ? (config.heroBg ?? '/images/Vivu/01-hero-ha-long.png') : null,
      pageTitle: `${config.title} — ${demoTitle} — ${base.brand}`,
      seo: this.articlesService.buildStaticPageSeo(
        `${config.title} — ${demoTitle}`,
        `Trang ${config.title.toLowerCase()} của demo ${demoTitle} thiết kế bởi ${base.brand}.`,
        path,
        base.brand,
      ),
    };
  }

  /**
   * Projects that share the same mockup image reuse one HTML template.
   * Key = project slug, value = template slug under views/demo/pages/.
   */
  private resolveDemoTemplateSlug(slug: string): string {
    const aliases: Record<string, string> = {
      'thiet-ke-ngoai-that': 'shop-thoi-trang',
      'cong-ty-kien-truc': 'nha-hang-sai-gon',
      'showroom-noi-that': 'can-ho-cao-cap',
      'cafe-specialty': 'trung-tam-dao-tao',
      'cua-hang-dien-tu': 'spa-wellness',
      'du-an-dat-nen': 'tu-van-du-hoc',
    };
    return aliases[slug] || slug;
  }

  /** Custom interactive demo templates live in views/demo/pages/{slug}.hbs */
  resolveCustomDemoView(slug: string): string | null {
    const templateSlug = this.resolveDemoTemplateSlug(slug).replace(/[^a-z0-9-]/gi, '');
    if (!templateSlug) return null;
    const path = join(
      resolveProjectRoot(),
      'views',
      'demo',
      'pages',
      `${templateSlug}.hbs`,
    );
    return existsSync(path) ? `demo/pages/${templateSlug}` : null;
  }

  private getDemoServices(slug: string) {
    if (slug === 'tu-van-du-hoc') {
      return [
        {
          title: 'Tư vấn chọn trường',
          text: 'Phân tích hồ sơ, ngân sách và mục tiêu nghề nghiệp để đề xuất trường và chương trình phù hợp nhất.',
          highlight: false,
        },
        {
          title: 'Hỗ trợ hồ sơ & visa',
          text: 'Hướng dẫn chuẩn bị hồ sơ, luyện phỏng vấn và theo sát quy trình xin visa du học từng bước.',
          highlight: true,
        },
        {
          title: 'Định hướng nghề nghiệp',
          text: 'Tư vấn lộ trình học tập và cơ hội việc làm sau tốt nghiệp tại các thị trường quốc tế.',
          highlight: false,
        },
      ];
    }
    if (slug === 'giai-phap-so') return [];
  }

  private getDemoStats(slug: string) {
    if (slug === 'vivu') {
      const icon = (paths: string) =>
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">${paths}</svg>`;
      return [
        {
          value: '500+',
          label: 'Hành trình đã tổ chức',
          icon: icon('<path d="M4 19V5M4 19h16M8 17v-4M12 17V9M16 17v-6"/>'),
        },
        {
          value: '50+',
          label: 'Điểm đến hấp dẫn',
          icon: icon('<path d="M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>'),
        },
        {
          value: '98%',
          label: 'Khách hàng hài lòng',
          icon: icon('<path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7L12 16.8 5.7 21l2.3-7-6-4.6h7.6z"/>'),
        },
      ];
    }
    if (slug === 'tu-van-du-hoc') {
      return [
        { value: '2.500+', label: 'Hồ sơ thành công' },
        { value: '25+', label: 'Quốc gia đối tác' },
        { value: '2.000+', label: 'Học viên tin tưởng' },
      ];
    }
    if (slug === 'hoc-tieng-anh') {
      const icon = (paths: string) =>
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">${paths}</svg>`;
      return [
        {
          value: '12.000+',
          label: 'Học viên đạt mục tiêu',
          icon: icon('<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/>'),
        },
        {
          value: '7.0+',
          label: 'Điểm trung bình đầu ra',
          icon: icon('<path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7L12 16.8 5.7 21l2.3-7-6-4.6h7.6z"/>'),
        },
        {
          value: '96%',
          label: 'Học viên hài lòng',
          icon: icon('<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"/>'),
        },
        {
          value: '150+',
          label: 'Giảng viên & chuyên gia',
          icon: icon('<path d="M4 19V5M4 19h16M8 17v-4M12 17V9M16 17v-6"/>'),
        },
      ];
    }
    if (slug !== 'corporate-landing') return [];
    return [
      { value: '150+', label: 'Dự án hoàn thành' },
      { value: '15', label: 'Năm kinh nghiệm' },
      { value: '85', label: 'Giải thưởng thiết kế' },
      { value: '200+', label: 'Khách hàng hài lòng' },
    ];
  }

  private getDemoItems(slug: string) {
    if (slug === 'tour-da-nang') {
      return [
        {
          title: 'Bàn góc gỗ sồi',
          text: 'Kiểu dáng tối giản, phù hợp góc phòng khách hoặc phòng ngủ.',
          image:
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=500&h=500&q=80',
          size: 's',
        },
        {
          title: 'Ghế thư giãn',
          text: 'Nệm êm, khung gỗ chắc chắn — điểm nhấn ấm áp cho không gian sống.',
          image:
            'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&h=600&q=80',
          size: 'l',
        },
        {
          title: 'Cây trang trí',
          text: 'Mang sắc xanh tự nhiên, cân bằng cảm giác giữa các món nội thất.',
          image:
            'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=500&h=500&q=80',
          size: 's',
        },
        {
          title: 'Sofa góc hiện đại',
          text: 'Phom rộng rãi, dễ phối với gối và thảm tông trung tính.',
          image:
            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&h=600&q=80',
          size: 'l',
        },
        {
          title: 'Tủ buffet gỗ',
          text: 'Lưu trữ tiện dụng với vẻ ngoài vintage nhẹ nhàng.',
          image:
            'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=600&h=600&q=80',
          size: 'm',
        },
      ];
    }
    if (slug !== 'nha-hang-sai-gon') return [];
    return [
      {
        title: 'Mì ramen đặc biệt',
        price: '185.000đ',
        image:
          'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&h=600&q=80',
      },
      {
        title: 'Salad rau theo mùa',
        price: '120.000đ',
        image:
          'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&h=600&q=80',
      },
      {
        title: 'Sushi tổng hợp',
        price: '290.000đ',
        image:
          'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=600&h=600&q=80',
      },
      {
        title: 'Cá nướng chanh dây',
        price: '320.000đ',
        image:
          'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&h=600&q=80',
      },
    ];
  }

  private getDemoTours(slug: string) {
    if (slug === 'vivu') {
      return [
        {
          title: 'Hạ Long – Kỳ quan di sản',
          duration: '3N2Đ',
          price: '4.990.000đ',
          rating: '4.9',
          reviews: '128',
          badge: 'Bán chạy',
          image: '/images/Vivu/02-ha-long.png',
          highlights: ['Du thuyền 4 sao', 'Hang Sửng Sốt', 'Kayak vịnh'],
        },
        {
          title: 'Hội An – Phố cổ đêm',
          duration: '2N1Đ',
          price: '3.290.000đ',
          rating: '4.8',
          reviews: '96',
          badge: 'Ưu đãi',
          image: '/images/Vivu/04-hoi-an.png',
          highlights: ['Phố cổ về đêm', 'Thả đèn hoa đăng', 'Ẩm thực địa phương'],
        },
        {
          title: 'Phú Quốc – Biển xanh',
          duration: '4N3Đ',
          price: '6.490.000đ',
          rating: '4.9',
          reviews: '84',
          badge: '',
          image: '/images/Vivu/06-phu-quoc.png',
          highlights: ['Resort 5 sao', 'Lặn ngắm san hô', 'Sunset cocktail'],
        },
        {
          title: 'Sa Pa – Săn mây Tây Bắc',
          duration: '3N2Đ',
          price: '4.590.000đ',
          rating: '4.8',
          reviews: '112',
          badge: 'Yêu thích',
          image: '/images/Vivu/07-sa-pa.png',
          highlights: ['Fansipan', 'Bản Cát Cát', 'Homestay ấm cúng'],
        },
        {
          title: 'Đà Nẵng – Biển & Bà Nà',
          duration: '3N2Đ',
          price: '5.290.000đ',
          rating: '4.7',
          reviews: '76',
          badge: '',
          image: '/images/Vivu/03-da-nang.png',
          highlights: ['Cầu Vàng', 'Biển Mỹ Khê', 'Ẩm thực miền Trung'],
        },
        {
          title: 'Đà Lạt – Thành phố ngàn hoa',
          duration: '2N1Đ',
          price: '2.990.000đ',
          rating: '4.8',
          reviews: '91',
          badge: 'Cuối tuần',
          image: '/images/Vivu/05-da-lat.png',
          highlights: ['Đồi chè', 'Thác Datanla', 'Cafe view đồi'],
        },
      ];
    }
    if (slug !== 'spa-wellness') return [];
    return [
      {
        title: 'Sapa – Ruộng bậc thang',
        duration: '3 NGÀY 2 ĐÊM',
        image:
          'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      },
      {
        title: 'Vịnh Hạ Long',
        duration: '2 NGÀY 1 ĐÊM',
        image:
          'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
      },
      {
        title: 'Đà Nẵng – Bà Nà Hills',
        duration: '3 NGÀY 2 ĐÊM',
        image:
          'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80',
      },
    ];
  }

  private getDemoCourses(slug: string) {
    if (slug === 'hoc-tieng-anh') {
      return [
        {
          title: 'IELTS Người lớn',
          desc: 'Lộ trình cá nhân hóa từ 4.0 đến 7.5+ — tập trung kỹ năng thi và chiến lược làm bài.',
          image: '/images/TiengAnh/icon-course-ielts-adult.svg',
        },
        {
          title: 'IELTS THCS & THPT',
          desc: 'Chương trình song song lớp học, giúp học sinh nắm vững ngữ pháp và tư duy tiếng Anh.',
          image: '/images/TiengAnh/icon-course-backpack.svg',
        },
        {
          title: 'Kids (6–12 tuổi)',
          desc: 'Học qua trò chơi, phim hoạt hình và hoạt động nhóm — xây nền tảng tự nhiên.',
          image: '/images/TiengAnh/icon-course-kids.svg',
        },
        {
          title: 'SAT / GMAT / GRE',
          desc: 'Luyện thi chuẩn Mỹ với giáo trình quốc tế và mô phỏng đề thi thực tế.',
          image: '/images/TiengAnh/icon-course-chart.svg',
        },
        {
          title: 'TOEIC & Giao tiếp',
          desc: 'Tăng điểm TOEIC nhanh và tự tin giao tiếp trong môi trường công sở.',
          image: '/images/TiengAnh/icon-course-speak.svg',
        },
      ];
    }
    if (slug !== 'trung-tam-dao-tao') return [];
    return [
      {
        title: 'Thiết kế đồ họa',
        duration: '3 tháng',
        price: '4.500.000đ',
        desc: 'Làm chủ Photoshop, Illustrator và nguyên tắc thiết kế thương hiệu — xây portfolio chuyên nghiệp ngay trong khóa học.',
      },
      {
        title: 'Marketing số',
        duration: '2 tháng',
        price: '3.800.000đ',
        desc: 'Chiến lược nội dung, quảng cáo Facebook/Google và phân tích hiệu quả chiến dịch cho doanh nghiệp vừa và nhỏ.',
      },
      {
        title: 'Phát triển web cơ bản',
        duration: '4 tháng',
        price: '5.200.000đ',
        desc: 'HTML, CSS, JavaScript và WordPress — từ landing page đến website hoàn chỉnh, kèm dự án thực tế cuối khóa.',
      },
    ];
  }

  private getDemoDestinations(slug: string) {
    if (slug !== 'vivu') return [];
    const icon = (paths: string) =>
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">${paths}</svg>`;
    return [
      {
        name: 'Hạ Long',
        category: 'DI SẢN',
        desc: 'Di sản thiên nhiên thế giới',
        image: '/images/Vivu/02-ha-long.png',
        tours: '12',
        rating: '4.9',
        icon: icon('<path d="M3 18l4-6 4 3 5-8 5 11H3z"/>'),
      },
      {
        name: 'Đà Nẵng',
        category: 'BIỂN',
        desc: 'Thành phố biển năng động',
        image: '/images/Vivu/03-da-nang.png',
        tours: '15',
        rating: '4.8',
        icon: icon('<path d="M4 18h16M8 18V8l4-4 4 4v10"/>'),
      },
      {
        name: 'Hội An',
        category: 'DI SẢN',
        desc: 'Phố cổ yên bình',
        image: '/images/Vivu/04-hoi-an.png',
        tours: '10',
        rating: '4.9',
        icon: icon('<rect x="8" y="6" width="8" height="12" rx="1"/><path d="M12 6V4"/>'),
      },
      {
        name: 'Đà Lạt',
        category: 'THIÊN NHIÊN',
        desc: 'Thành phố ngàn hoa',
        image: '/images/Vivu/05-da-lat.png',
        tours: '9',
        rating: '4.7',
        icon: icon('<path d="M4 20l6-14 4 8 3-5 3 11H4z"/>'),
      },
      {
        name: 'Phú Quốc',
        category: 'BIỂN',
        desc: 'Biển xanh cát trắng',
        image: '/images/Vivu/06-phu-quoc.png',
        tours: '14',
        rating: '4.9',
        icon: icon('<path d="M2 14c3-2 6-2 10 0s7 2 10 0"/><path d="M6 10c2-3 4-4 6-4s4 1 6 4"/>'),
      },
      {
        name: 'Sa Pa',
        category: 'THIÊN NHIÊN',
        desc: 'Ruộng bậc thang mây trời',
        image: '/images/Vivu/07-sa-pa.png',
        tours: '11',
        rating: '4.8',
        icon: icon('<path d="M3 18h18M6 18l3-6 3 4 3-8 3 10"/>'),
      },
    ];
  }

  private getDemoTestimonials(slug: string) {
    if (slug === 'vivu') {
      return [
        {
          quote:
            'Chuyến đi Hội An thật tuyệt vời! Lịch trình hợp lý, hướng dẫn viên nhiệt tình và khách sạn view đẹp.',
          name: 'Nguyễn Linh Anh',
          location: 'Hà Nội',
          color: '#31899a',
        },
        {
          quote:
            'Gia đình mình rất hài lòng tour Phú Quốc — dịch vụ chu đáo, đưa đón đúng giờ và hoạt động phù hợp cả trẻ em.',
          name: 'Trần Hoài An',
          location: 'TP. Hồ Chí Minh',
          color: '#55a4ae',
        },
        {
          quote:
            'Sa Pa mùa lúa chín đẹp như tranh. VIVU sắp xếp homestay ấm cúng và trải nghiệm văn hóa địa phương rất chân thực.',
          name: 'Lê Phương Thảo',
          location: 'Đà Nẵng',
          color: '#718d78',
        },
        {
          quote:
            'Đặt tour Hạ Long qua VIVU nhanh gọn, báo giá rõ ràng. Du thuyền sang trọng, ẩm thực onboard ngon.',
          name: 'Phạm Quốc Bảo',
          location: 'Cần Thơ',
          color: '#236f80',
        },
      ];
    }
    if (slug === 'hoc-tieng-anh') {
      return [
        {
          quote:
            'Từ 5.5 lên 7.5 IELTS chỉ sau 4 tháng. Phương pháp Logic Path giúp mình hiểu bản chất thay vì học vẹt.',
          name: 'Nguyễn Minh Anh',
          score: '7.5',
          initials: 'MA',
          color: '#E31B23',
        },
        {
          quote:
            'Giảng viên nhiệt tình, lớp học sôi nổi. Mình tự tin giao tiếp tiếng Anh trong công việc sau khóa TOEIC.',
          name: 'Trần Hoàng Long',
          score: '850',
          initials: 'HL',
          color: '#1A1A1A',
        },
        {
          quote:
            'Con mình thích học Kids tại NOVA — về nhà còn kể chuyện bằng tiếng Anh cho cả nhà nghe.',
          name: 'Lê Thu Hương',
          score: 'Flyers',
          initials: 'TH',
          color: '#C4121F',
        },
        {
          quote:
            'LMS rất tiện — xem lại bài giảng, làm bài tập và thi thử mọi lúc. Điểm Speaking cải thiện rõ rệt.',
          name: 'Phạm Quốc Bảo',
          score: '8.0',
          initials: 'QB',
          color: '#333333',
        },
      ];
    }
    if (slug !== 'trung-tam-dao-tao') return [];
    return [
      {
        quote:
          'Sau khóa thiết kế đồ họa, mình tự tin ứng tuyển và nhận offer designer tại agency trong vòng 2 tháng.',
        name: 'Trần Thu Hà',
        role: 'Cựu học viên — Designer',
      },
      {
        quote:
          'Giảng viên nhiệt tình, lộ trình rõ ràng. Mình chuyển ngành sang marketing số mà không cảm thấy quá tải.',
        name: 'Lê Hoàng Nam',
        role: 'Cựu học viên — Digital Marketer',
      },
      {
        quote:
          'Dự án cuối khóa web giúp mình có sản phẩm thật để phỏng vấn — điều mà nhiều khóa online không có.',
        name: 'Phạm Minh Quân',
        role: 'Cựu học viên — Front-end Developer',
      },
    ];
  }

  private getDemoFeatures(slug: string) {
    if (slug === 'hoc-tieng-anh') {
      return [
        {
          num: '01',
          variant: 'red',
          title: 'Tư duy Logic',
          text: 'Trang bị tư duy phân tích – logic ngôn ngữ để hiểu bản chất vấn đề và áp dụng linh hoạt trong mọi dạng bài.',
          image: '/images/TiengAnh/icon-logic-bulb.svg',
        },
        {
          num: '02',
          variant: 'dark',
          title: 'Công nghệ học tập thông minh',
          text: 'Hệ thống AI cá nhân hóa, tự động điều chỉnh lộ trình, theo dõi tiến độ & nhắc nhở kịp thời.',
          image: '/images/TiengAnh/icon-tech-devices.svg',
        },
        {
          num: '03',
          variant: 'outline',
          title: 'Chương trình tinh gọn',
          text: 'Giáo trình độc quyền biên soạn dựa trên phân tích dữ liệu hàng nghìn bài thi thực tế.',
          image: '/images/TiengAnh/icon-curriculum-book.svg',
        },
      ];
    }
    if (slug !== 'can-ho-cao-cap') return [];
    const icon = (paths: string) =>
      `<svg viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`;
    return [
      {
        icon: icon(
          '<circle cx="12" cy="12" r="2"/><circle cx="12" cy="4" r="1.5"/><circle cx="12" cy="20" r="1.5"/><circle cx="4" cy="12" r="1.5"/><circle cx="20" cy="12" r="1.5"/><path d="M12 6v4M12 14v4M6 12h4M14 12h4"/>',
        ),
        title: 'Kết nối thông minh',
        text: 'Hệ thống tiện ích tích hợp giúp cư dân quản lý cuộc sống hàng ngày dễ dàng hơn.',
      },
      {
        icon: icon(
          '<circle cx="12" cy="12" r="9"/><path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20"/><path d="M16 8l2-2M8 16l-2 2"/>',
        ),
        title: 'Vị trí chiến lược',
        text: 'Kết nối nhanh đến trung tâm thương mại, trường học và trục giao thông chính.',
      },
      {
        icon: icon(
          '<path d="M7 11V7a5 5 0 0110 0v4"/><rect x="5" y="11" width="14" height="10" rx="2"/><circle cx="12" cy="16" r="1"/>',
        ),
        title: 'An ninh 24/7',
        text: 'Camera và đội ngũ bảo vệ chuyên nghiệp mang lại sự yên tâm tuyệt đối.',
      },
      {
        icon: icon(
          '<path d="M4 19V5M4 19h16M8 17v-4M12 17V9M16 17v-6"/>',
        ),
        title: 'Giá trị đầu tư',
        text: 'Thiết kế bền vững giúp căn hộ giữ vững giá trị theo thời gian.',
      },
      {
        icon: icon(
          '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>',
        ),
        title: 'Lịch bàn giao rõ ràng',
        text: 'Tiến độ minh bạch, hỗ trợ pháp lý và quy trình nhận nhà chuyên nghiệp.',
      },
    ];
  }

  private getDemoProducts(slug: string) {
    if (slug !== 'shop-thoi-trang') return [];
    return this.getDemoCollections(slug).flatMap((c) => c.products);
  }

  /** YaMe-style category blocks: title + tagline + chips + 4 products each. */
  private getDemoCollections(slug: string) {
    if (slug !== 'shop-thoi-trang') return [];
    const mk = (
      title: string,
      cat: string,
      price: string,
      originalPrice: string,
      image: string,
    ) => ({
      title,
      price,
      originalPrice,
      sale: true,
      cat,
      image,
    });
    return [
      {
        id: 'ao',
        title: 'ÁO LINEN & COTTON',
        tagline:
          'Chất liệu mềm mại, thoáng khí — phom dáng tối giản dễ phối mỗi ngày',
        chips: ['Tất cả', 'Sơ mi', 'Áo thun', 'Áo polo', 'Hàng mới'],
        seeAll: 'XEM TẤT CẢ ÁO',
        products: [
          mk(
            'Áo sơ mi oversized Trắng',
            'a',
            '590.000đ',
            '890.000đ',
            '/images/ThoiTrang/09-product-ao-so-mi.png',
          ),
          mk(
            'Áo linen cổ tròn Be',
            'a',
            '450.000đ',
            '690.000đ',
            '/images/ThoiTrang/17-product-ao-linen.png',
          ),
          mk(
            'Áo polo cotton Trắng',
            'a',
            '390.000đ',
            '590.000đ',
            '/images/ThoiTrang/21-product-ao-polo.png',
          ),
          mk(
            'Áo blouse linen Kem',
            'a',
            '520.000đ',
            '780.000đ',
            '/images/ThoiTrang/03-category-ao.png',
          ),
        ],
      },
      {
        id: 'vay',
        title: 'VÁY MÙA HÈ',
        tagline:
          'Phom suông, midi & wrap — thanh lịch từ công sở đến dạo phố',
        chips: ['Tất cả', 'Midi', 'Wrap', 'Hoa', 'Linen'],
        seeAll: 'XEM TẤT CẢ VÁY',
        products: [
          mk(
            'Váy midi linen Kem',
            'b',
            '890.000đ',
            '1.290.000đ',
            '/images/ThoiTrang/08-product-vay-midi.png',
          ),
          mk(
            'Váy wrap đen thanh lịch',
            'b',
            '990.000đ',
            '1.490.000đ',
            '/images/ThoiTrang/18-product-vay-den.png',
          ),
          mk(
            'Váy hoa pastel Hồng',
            'b',
            '790.000đ',
            '1.190.000đ',
            '/images/ThoiTrang/22-product-vay-hoa.png',
          ),
          mk(
            'Váy suông hoa Kem',
            'b',
            '850.000đ',
            '1.250.000đ',
            '/images/ThoiTrang/04-category-vay.png',
          ),
        ],
      },
      {
        id: 'quan',
        title: 'QUẦN DÀI KHOE DÁNG',
        tagline: 'Ống rộng, jeans suông — bền bỉ, đứng form, tôn dáng',
        chips: ['Tất cả', 'Ống rộng', 'Jeans', 'Linen', 'Bán chạy'],
        seeAll: 'XEM TẤT CẢ QUẦN',
        products: [
          mk(
            'Quần ống rộng Be',
            'c',
            '690.000đ',
            '990.000đ',
            '/images/ThoiTrang/10-product-quan-ong-rong.png',
          ),
          mk(
            'Quần jeans ống suông Xanh',
            'c',
            '790.000đ',
            '1.190.000đ',
            '/images/ThoiTrang/19-product-quan-jeans.png',
          ),
          mk(
            'Quần linen ống rộng Kem',
            'c',
            '650.000đ',
            '950.000đ',
            '/images/ThoiTrang/05-category-quan.png',
          ),
          mk(
            'Quần jeans ống đứng Xanh nhạt',
            'c',
            '750.000đ',
            '1.090.000đ',
            '/images/ThoiTrang/19-product-quan-jeans.png',
          ),
        ],
      },
      {
        id: 'phukien',
        title: 'PHỤ KIỆN THỜI TRANG',
        tagline: 'Túi xách & phụ kiện cao cấp — điểm nhấn hoàn thiện set đồ',
        chips: ['Tất cả', 'Túi xách', 'Kính', 'Giày', 'Sale'],
        seeAll: 'XEM TẤT CẢ PHỤ KIỆN',
        products: [
          mk(
            'Túi xách tay Veronica Đen',
            'd',
            '899.000đ',
            '1.798.000đ',
            '/images/ThoiTrang/07-product-tui-xach.png',
          ),
          mk(
            'Túi mini structured Kem',
            'd',
            '749.000đ',
            '1.498.000đ',
            '/images/ThoiTrang/20-product-tui-kem.png',
          ),
          mk(
            'Set phụ kiện silk & leather',
            'd',
            '599.000đ',
            '999.000đ',
            '/images/ThoiTrang/06-category-phukien.png',
          ),
          mk(
            'Túi xách Veronica Be',
            'd',
            '899.000đ',
            '1.798.000đ',
            '/images/ThoiTrang/20-product-tui-kem.png',
          ),
        ],
      },
    ];
  }

  getContactPageData(options?: {
    success?: boolean;
    error?: boolean;
    formValues?: {
      name?: string;
      email?: string;
      phone?: string;
      subject?: string;
      message?: string;
    };
    fieldErrors?: Record<string, string>;
  }) {
    const site = loadPublicSiteData();
    return {
      ...this.buildStaticPage(
        'Liên hệ',
        'Liên hệ',
        `Liên hệ ${site.brand} — tư vấn thiết kế website, báo giá và hỗ trợ kỹ thuật.`,
        '/lien-he',
      ),
      contactSuccess: Boolean(options?.success),
      contactError: Boolean(options?.error),
      formValues: options?.formValues ?? {},
      fieldErrors: options?.fieldErrors ?? {},
      zalo: site.phone,
      skype: '',
    };
  }

  private getDemoAchievements(slug: string) {
    if (slug !== 'hoc-tieng-anh') return [];
    return [
      {
        name: 'Nguyễn Thu Hà',
        score: '8.5',
        course: 'IELTS Intensive',
        duration: 'Học 5 tháng',
        image:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&h=520&q=80',
      },
      {
        name: 'Trần Minh Quân',
        score: '8.0',
        course: 'IELTS Advanced',
        duration: 'Học 4 tháng',
        image:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=520&q=80',
      },
      {
        name: 'Lê Phương Anh',
        score: '7.5',
        course: 'IELTS Foundation',
        duration: 'Học 6 tháng',
        image:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&h=520&q=80',
      },
      {
        name: 'Phạm Đức Huy',
        score: '8.0',
        course: 'IELTS Intensive',
        duration: 'Học 4 tháng',
        image:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&h=520&q=80',
      },
      {
        name: 'Hoàng Mai Linh',
        score: '7.5',
        course: 'IELTS THPT',
        duration: 'Học 5 tháng',
        image:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&h=520&q=80',
      },
      {
        name: 'Vũ Tiến Dũng',
        score: '8.5',
        course: 'IELTS Advanced',
        duration: 'Học 3 tháng',
        image:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=520&q=80',
      },
    ];
  }

  private getDemoTeachers(slug: string) {
    if (slug !== 'hoc-tieng-anh') return [];
    return [
      {
        name: 'Thầy Lê Hoàng Long',
        score: '8.5',
        experience: '12 năm kinh nghiệm',
        specialty: 'IELTS Speaking & Writing',
        image:
          'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&h=480&q=80',
      },
      {
        name: 'Cô Sarah Mitchell',
        score: '8.0',
        experience: '10 năm kinh nghiệm',
        specialty: 'IELTS Academic',
        image:
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&h=480&q=80',
      },
      {
        name: 'Thầy James Anderson',
        score: '8.5',
        experience: '8 năm kinh nghiệm',
        specialty: 'TOEIC & Business English',
        image:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&h=480&q=80',
      },
      {
        name: 'Cô Emily Chen',
        score: '8.0',
        experience: '9 năm kinh nghiệm',
        specialty: 'Giao tiếp & Phát âm',
        image:
          'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&h=480&q=80',
      },
      {
        name: 'Cô Nguyễn Thị Lan',
        score: '8.5',
        experience: '7 năm kinh nghiệm',
        specialty: 'IELTS Foundation',
        image:
          'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=400&h=480&q=80',
      },
      {
        name: 'Thầy Michael Brown',
        score: '8.0',
        experience: '11 năm kinh nghiệm',
        specialty: 'SAT & Academic English',
        image:
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&h=480&q=80',
      },
    ];
  }

  private getDemoCampuses(slug: string) {
    if (slug !== 'hoc-tieng-anh') return [];
    return [
      {
        name: 'NOVA Cầu Giấy',
        address: '123 Xuân Thủy, Cầu Giấy, Hà Nội',
        phone: '0241234567',
        phoneDisplay: '024 1234 567',
        image:
          'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&h=480&q=80',
      },
      {
        name: 'NOVA Hai Bà Trưng',
        address: '45 Bạch Mai, Hai Bà Trưng, Hà Nội',
        phone: '0242345678',
        phoneDisplay: '024 2345 678',
        image:
          'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&h=480&q=80',
      },
      {
        name: 'NOVA Thanh Xuân',
        address: '88 Nguyễn Trãi, Thanh Xuân, Hà Nội',
        phone: '0243456789',
        phoneDisplay: '024 3456 789',
        image:
          'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&h=480&q=80',
      },
      {
        name: 'NOVA Tây Hồ',
        address: '12 Lạc Long Quân, Tây Hồ, Hà Nội',
        phone: '0244567890',
        phoneDisplay: '024 4567 890',
        image:
          'https://images.unsplash.com/photo-1497366858526-0766cadbe8fa?auto=format&fit=crop&w=800&h=480&q=80',
      },
      {
        name: 'NOVA Hải Phòng',
        address: '56 Lê Lợi, Ngô Quyền, Hải Phòng',
        phone: '0226789012',
        phoneDisplay: '0226 789 012',
        image:
          'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=800&h=480&q=80',
      },
    ];
  }

  private getDemoNews(slug: string) {
    if (slug !== 'hoc-tieng-anh') return [];
    return [
      {
        title: 'Workshop IELTS Speaking — Bí quyết đạt 7.0+',
        tag: 'Workshop',
        date: '15/06/2026',
        image:
          'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&h=440&q=80',
      },
      {
        title: 'Học bổng 50% cho học viên mới đăng ký tháng 7',
        tag: 'Học bổng',
        date: '10/06/2026',
        image:
          'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=800&h=440&q=80',
      },
      {
        title: 'Khai giảng khóa IELTS Intensive tháng 7/2026',
        tag: 'Tin tức',
        date: '05/06/2026',
        image:
          'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&h=440&q=80',
      },
      {
        title: 'NOVA ký kết hợp tác chiến lược với British Council',
        tag: 'Sự kiện',
        date: '01/06/2026',
        image:
          'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&h=440&q=80',
      },
      {
        title: 'Tips luyện Listening IELTS hiệu quả tại nhà',
        tag: 'Kiến thức',
        date: '28/05/2026',
        image:
          'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&h=440&q=80',
      },
      {
        title: 'Cách xây dựng vốn từ vựng Academic trong 30 ngày',
        tag: 'Vocabulary',
        date: '22/05/2026',
        image:
          'https://images.unsplash.com/photo-1456513080880-7d93ddd4b2f6?auto=format&fit=crop&w=800&h=440&q=80',
      },
      {
        title: 'TOEIC 900+: Lộ trình luyện đề và quản lý thời gian',
        tag: 'TOEIC',
        date: '18/05/2026',
        image:
          'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&h=440&q=80',
      },
      {
        title: 'English for Kids — Học vui, nhớ lâu, tự tin giao tiếp',
        tag: 'Kids',
        date: '12/05/2026',
        image:
          'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=800&h=440&q=80',
      },
      {
        title: 'Grammar Lab: 5 lỗi ngữ pháp thường gặp trong Writing Task 2',
        tag: 'Grammar',
        date: '05/05/2026',
        image:
          'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&h=440&q=80',
      },
      {
        title: 'Study Tips: Lịch học 2 tiếng/ngày vẫn tiến bộ đều',
        tag: 'Study Tips',
        date: '28/04/2026',
        image:
          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&h=440&q=80',
      },
    ];
  }

  /** Deep-page extras for NOVA ENGLISH; empty for other demo slugs. */
  private getNovaExtras(slug: string) {
    if (slug !== 'hoc-tieng-anh') return {};

    const teachers = this.getDemoTeachers(slug);

    return {
      novaPhilosophy: [
        {
          title: 'Không học mẹo',
          text: 'Không dựa vào mẹo thi ngắn hạn. Học viên nắm nguyên tắc ngôn ngữ để xử lý mọi dạng đề và tình huống thực tế.',
          image: '/images/TiengAnh/icon-logic-bulb.svg',
        },
        {
          title: 'Không học thuộc lòng',
          text: 'Thay vì thuộc mẫu câu cứng, học viên hiểu cấu trúc và tự tạo câu đúng ngữ cảnh, đúng mục tiêu giao tiếp.',
          image: '/images/TiengAnh/icon-curriculum-book.svg',
        },
        {
          title: 'Xây nền tảng ngôn ngữ',
          text: 'Phát âm, ngữ pháp và từ vựng được xây có hệ thống trước khi tăng tốc luyện đề và kỹ năng chuyên sâu.',
          image: '/images/TiengAnh/icon-course-backpack.svg',
        },
        {
          title: 'Tư duy bằng tiếng Anh',
          text: 'Luyện phản xạ suy nghĩ bằng tiếng Anh để nói – viết tự nhiên, mạch lạc và thuyết phục hơn.',
          image: '/images/TiengAnh/icon-course-speak.svg',
        },
      ],
      novaLogicSteps: [
        {
          num: '01',
          title: 'Đánh giá đầu vào',
          text: 'Kiểm tra toàn diện 4 kỹ năng để xác định điểm mạnh, điểm yếu và mục tiêu đầu ra phù hợp.',
        },
        {
          num: '02',
          title: 'Lộ trình cá nhân hóa',
          text: 'Xây lộ trình theo mục tiêu IELTS, TOEIC, SAT hoặc giao tiếp — điều chỉnh theo tiến độ thực tế.',
        },
        {
          num: '03',
          title: 'Đánh giá tiến độ',
          text: 'Mock test định kỳ và báo cáo chi tiết giúp học viên thấy rõ mức tiến bộ và bước điều chỉnh tiếp theo.',
        },
      ],
      novaProcess: [
        { title: 'Kiểm tra đầu vào' },
        { title: 'Xếp lớp' },
        { title: 'Học' },
        { title: 'Luyện tập' },
        { title: 'Mock Test' },
        { title: 'Đạt mục tiêu' },
      ],
      novaLmsExtras: [
        {
          title: 'Video bài giảng',
          text: 'Xem lại bài giảng mọi lúc, củng cố kiến thức trước và sau giờ học trên lớp.',
        },
        {
          title: 'AI luyện phát âm',
          text: 'Công cụ AI phân tích âm, trọng âm và ngữ điệu — góp ý tức thì để nói chuẩn hơn.',
        },
        {
          title: 'Theo dõi tiến độ',
          text: 'Dashboard học tập ghi nhận điểm số, bài tập và mức hoàn thành lộ trình theo tuần.',
        },
        {
          title: 'Học trên điện thoại',
          text: 'Ứng dụng di động giúp luyện từ vựng, nghe và ôn bài mọi lúc, mọi nơi.',
        },
      ],
      novaWhyMethod: [
        {
          title: 'Giáo trình chuẩn',
          text: 'Nội dung bám sát đề thi thật và khung năng lực quốc tế, cập nhật theo xu hướng đề mới.',
        },
        {
          title: 'Giáo viên giàu kinh nghiệm',
          text: 'Đội ngũ IELTS 8.0+ và chuyên gia TOEIC/SAT với nhiều năm giảng dạy thực chiến.',
        },
        {
          title: 'AI hỗ trợ',
          text: 'Luyện phát âm, chấm bài Writing và gợi ý cải thiện cá nhân hóa bằng AI.',
        },
        {
          title: 'Báo cáo tiến độ',
          text: 'Phụ huynh và học viên nhận báo cáo định kỳ về điểm số, chuyên cần và kế hoạch tiếp theo.',
        },
        {
          title: 'Luyện nói',
          text: 'Lớp speaking nhỏ, phản xạ thật và feedback chi tiết từng phiên nói.',
        },
        {
          title: 'Mock Test',
          text: 'Thi thử định kỳ trong điều kiện gần với phòng thi thật để làm quen áp lực thời gian.',
        },
      ],
      novaAchievementsAll: [
        {
          name: 'Nguyễn Thu Hà',
          score: '8.5',
          course: 'IELTS Intensive',
          duration: 'Học 5 tháng',
          category: 'IELTS',
          image:
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&h=520&q=80',
        },
        {
          name: 'Trần Minh Quân',
          score: '8.0',
          course: 'IELTS Advanced',
          duration: 'Học 4 tháng',
          category: 'IELTS',
          image:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=520&q=80',
        },
        {
          name: 'Lê Phương Anh',
          score: '7.5',
          course: 'IELTS Foundation',
          duration: 'Học 6 tháng',
          category: 'IELTS',
          image:
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&h=520&q=80',
        },
        {
          name: 'Phạm Đức Huy',
          score: '8.0',
          course: 'IELTS Intensive',
          duration: 'Học 4 tháng',
          category: 'IELTS',
          image:
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&h=520&q=80',
        },
        {
          name: 'Hoàng Mai Linh',
          score: '7.5',
          course: 'IELTS THPT',
          duration: 'Học 5 tháng',
          category: 'IELTS',
          image:
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&h=520&q=80',
        },
        {
          name: 'Vũ Tiến Dũng',
          score: '8.5',
          course: 'IELTS Advanced',
          duration: 'Học 3 tháng',
          category: 'IELTS',
          image:
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=520&q=80',
        },
        {
          name: 'Đỗ Bảo Ngọc',
          score: '905',
          course: 'TOEIC Intensive',
          duration: 'Học 3 tháng',
          category: 'TOEIC',
          image:
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&h=520&q=80',
        },
        {
          name: 'Ngô Quốc Bảo',
          score: '870',
          course: 'TOEIC Business',
          duration: 'Học 4 tháng',
          category: 'TOEIC',
          image:
            'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&h=520&q=80',
        },
        {
          name: 'Mai Thanh Tú',
          score: '1450',
          course: 'SAT Prep',
          duration: 'Học 5 tháng',
          category: 'SAT',
          image:
            'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&h=520&q=80',
        },
        {
          name: 'Bùi Anh Khoa',
          score: '1380',
          course: 'SAT Advanced',
          duration: 'Học 4 tháng',
          category: 'SAT',
          image:
            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&h=520&q=80',
        },
        {
          name: 'Trịnh Khánh My',
          score: 'B2',
          course: 'Giao tiếp doanh nghiệp',
          duration: 'Học 4 tháng',
          category: 'Giao tiếp',
          image:
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&h=520&q=80',
        },
        {
          name: 'Lý Hoàng Nam',
          score: 'C1',
          course: 'Speaking Mastery',
          duration: 'Học 6 tháng',
          category: 'Giao tiếp',
          image:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=520&q=80',
        },
      ],
      novaCaseStudy: {
        name: 'Nguyễn Thu Hà',
        fromScore: '5.5',
        toScore: '8.5',
        course: 'IELTS Intensive',
        duration: '5 tháng',
        steps: [
          {
            title: 'Đánh giá đầu vào',
            text: 'Xác định điểm yếu Writing Task 2 và Speaking Part 3; đặt mục tiêu 8.0+ trong 5 tháng.',
          },
          {
            title: 'Xây nền tảng',
            text: 'Ôn ngữ pháp học thuật, mở rộng từ vựng theo chủ đề và chuẩn hóa phát âm từng âm khó.',
          },
          {
            title: 'Luyện kỹ năng chuyên sâu',
            text: 'Viết bài theo band descriptor, speaking mock hàng tuần và feedback 1-1 với giáo viên.',
          },
          {
            title: 'Mock Test & chốt điểm',
            text: 'Thi thử full test 4 lần, điều chỉnh chiến lược thời gian và đạt 8.5 Overall.',
          },
        ],
      },
      novaTeacherProfiles: teachers.map((t, i) => {
        const bios = [
          'Chuyên gia IELTS Speaking & Writing với hơn 12 năm đồng hành cùng học viên mục tiêu 7.0–8.5.',
          'Giảng viên Academic IELTS, từng hỗ trợ hàng trăm học viên đạt band mục tiêu trong 3–6 tháng.',
          'Chuyên TOEIC và tiếng Anh doanh nghiệp; phương pháp luyện đề rõ ràng, bám sát đề thi thật.',
          'Thế mạnh phát âm và giao tiếp tự tin; lớp học tương tác cao, phản xạ nhanh.',
          'Đồng hành học viên Foundation lên Intensive với lộ trình từng bước, dễ theo dõi tiến độ.',
          'Giảng viên SAT & Academic English; tập trung tư duy đề và chiến lược làm bài hiệu quả.',
        ];
        return { ...t, bio: bios[i] ?? '' };
      }),
      novaRecruitSteps: [
        { title: 'CV', text: 'Nộp hồ sơ và chứng chỉ chuyên môn (IELTS/TOEIC/TESOL…).' },
        { title: 'Interview', text: 'Phỏng vấn năng lực giảng dạy, mindset và văn hóa NOVA.' },
        { title: 'Teaching Demo', text: 'Demo một buổi dạy thật để đánh giá phương pháp và tương tác.' },
        { title: 'Training', text: 'Đào tạo giáo trình, quy trình lớp học và công cụ LMS nội bộ.' },
        { title: 'Official Teacher', text: 'Trở thành giáo viên chính thức và bắt đầu đồng hành cùng học viên.' },
      ],
      novaStudentFilters: ['Tất cả', 'IELTS', 'TOEIC', 'SAT', 'Giao tiếp'],
      novaBeforeAfter: [
        {
          name: 'Nguyễn Thu Hà',
          before: '5.5',
          after: '8.5',
          note: 'IELTS Overall sau 5 tháng Intensive',
        },
        {
          name: 'Đỗ Bảo Ngọc',
          before: '650',
          after: '905',
          note: 'TOEIC sau 3 tháng luyện đề có lộ trình',
        },
        {
          name: 'Mai Thanh Tú',
          before: '1180',
          after: '1450',
          note: 'SAT sau 5 tháng Prep chuyên sâu',
        },
      ],
      novaActivities: [
        {
          title: 'Workshop IELTS Speaking',
          image:
            'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&h=520&q=80',
        },
        {
          title: 'Speaking Club cuối tuần',
          image:
            'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&h=520&q=80',
        },
        {
          title: 'Lễ tốt nghiệp & vinh danh',
          image:
            'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=800&h=520&q=80',
        },
        {
          title: 'Orientation cho học viên mới',
          image:
            'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&h=520&q=80',
        },
        {
          title: 'Contest Speaking Challenge',
          image:
            'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&h=520&q=80',
        },
      ],
      novaNewsFeatured: {
        title: 'Workshop IELTS Speaking — Bí quyết đạt 7.0+',
        tag: 'Workshop',
        date: '15/06/2026',
        excerpt:
          'Buổi workshop thực chiến giúp học viên nắm tiêu chí band descriptor, cấu trúc câu trả lời và cách mở rộng ý trong Part 2–3.',
        image:
          'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&h=640&q=80',
      },
      novaNewsCategories: [
        'IELTS',
        'TOEIC',
        'Grammar',
        'Vocabulary',
        'Kids',
        'Study Tips',
      ],
      novaNewsPopular: [
        { title: 'Tips luyện Listening IELTS hiệu quả tại nhà', date: '28/05/2026' },
        { title: 'Cách xây dựng vốn từ vựng Academic trong 30 ngày', date: '22/05/2026' },
        { title: 'TOEIC 900+: Lộ trình luyện đề và quản lý thời gian', date: '18/05/2026' },
        { title: 'Grammar Lab: 5 lỗi ngữ pháp thường gặp trong Writing Task 2', date: '05/05/2026' },
        { title: 'Study Tips: Lịch học 2 tiếng/ngày vẫn tiến bộ đều', date: '28/04/2026' },
      ],
      novaAboutValues: [
        {
          title: 'Sứ mệnh',
          text: 'Giúp người học Việt Nam tư duy bằng tiếng Anh và đạt mục tiêu học tập – nghề nghiệp rõ ràng.',
        },
        {
          title: 'Tầm nhìn',
          text: 'Trở thành trung tâm tiếng Anh kết quả cao, nơi lộ trình cá nhân hóa là tiêu chuẩn cho mọi học viên.',
        },
        {
          title: 'Giá trị',
          text: 'Thật thà với tiến độ, kỷ luật với quy trình và luôn đặt chất lượng đầu ra lên trước.',
        },
        {
          title: 'Cam kết',
          text: 'Đồng hành đến mục tiêu với giáo viên chuyên môn, công cụ LMS và báo cáo tiến độ minh bạch.',
        },
      ],
      novaHistory: [
        { year: '2016', text: 'Thành lập NOVA ENGLISH với lớp IELTS đầu tiên tại Hà Nội.' },
        { year: '2018', text: 'Mở rộng chương trình TOEIC và giao tiếp doanh nghiệp.' },
        { year: '2020', text: 'Ra mắt LMS nội bộ hỗ trợ học online kết hợp offline.' },
        { year: '2023', text: 'Triển khai AI luyện phát âm và chấm Writing hỗ trợ học viên.' },
        { year: '2026', text: 'Hệ thống 5 cơ sở và hàng nghìn học viên đạt mục tiêu điểm số.' },
      ],
      novaCulture: [
        {
          title: 'Lấy học viên làm trung tâm',
          text: 'Mọi lộ trình, lớp học và công cụ đều hướng tới tiến bộ đo được của từng học viên.',
          image:
            'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&h=520&q=80',
        },
        {
          title: 'Đội ngũ chuyên môn cao',
          text: 'Giáo viên được đào tạo liên tục về giáo trình, phương pháp và tiêu chuẩn chấm điểm quốc tế.',
          image:
            'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&h=520&q=80',
        },
        {
          title: 'Văn hóa kết quả',
          text: 'Theo dõi mock test, phản hồi trung thực và điều chỉnh lộ trình cho đến khi đạt mục tiêu.',
          image:
            'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&h=520&q=80',
        },
      ],
    };
  }

  /** Deep-page extras for VIVU travel; empty for other demo slugs. */
  private getVivuExtras(slug: string) {
    if (slug !== 'vivu') return {};

    return {
      vivuHighlights: [
        {
          title: 'Thiên nhiên',
          text: 'Vịnh, núi, rừng và biển cả Việt Nam trong những hành trình chọn lọc.',
        },
        {
          title: 'Văn hóa',
          text: 'Di sản, làng nghề và phong tục bản địa được kể bằng trải nghiệm chân thực.',
        },
        {
          title: 'Ẩm thực',
          text: 'Món đặc sản từng vùng — từ hải sản vịnh đến cao lầu phố cổ.',
        },
        {
          title: 'Nghỉ dưỡng',
          text: 'Resort, du thuyền và không gian thư giãn chuẩn luxury travel.',
        },
        {
          title: 'Trải nghiệm địa phương',
          text: 'Homestay, workshop và hoạt động cùng cộng đồng nơi bạn đến.',
        },
        {
          title: 'Check-in nổi tiếng',
          text: 'Góc ảnh đẹp nhất được gợi ý trong lịch trình tối ưu.',
        },
      ],
      vivuTourBenefits: [
        {
          title: 'Giá minh bạch',
          text: 'Báo giá rõ ràng, không phát sinh ẩn — bạn biết trước mọi hạng mục.',
        },
        {
          title: 'Hướng dẫn viên chuyên nghiệp',
          text: 'Am hiểu địa phương, đồng hành nhiệt tình và truyền cảm hứng.',
        },
        {
          title: 'Hỗ trợ 24/7',
          text: 'Đội ngũ VIVU luôn sẵn sàng hỗ trợ trước và trong chuyến đi.',
        },
        {
          title: 'Thanh toán linh hoạt',
          text: 'Nhiều hình thức thanh toán, đặt cọc giữ chỗ và hỗ trợ doanh nghiệp.',
        },
      ],
      vivuExperiences: [
        { title: 'Văn hóa', text: 'Phố cổ, di sản và nghi lễ truyền thống', image: '/images/Vivu/04-hoi-an.png' },
        { title: 'Ẩm thực', text: 'Tour ăn uống cùng đầu bếp địa phương', image: '/images/Vivu/03-da-nang.png' },
        { title: 'Nghỉ dưỡng', text: 'Resort biển và spa thư giãn', image: '/images/Vivu/06-phu-quoc.png' },
        { title: 'Trekking', text: 'Đường mòn Tây Bắc và ruộng bậc thang', image: '/images/Vivu/07-sa-pa.png' },
        { title: 'Camping', text: 'Cắm trại dưới bầu trời cao nguyên', image: '/images/Vivu/05-da-lat.png' },
        { title: 'Diving', text: 'Lặn ngắm san hô biển đảo', image: '/images/Vivu/06-phu-quoc.png' },
        { title: 'Chèo Kayak', text: 'Khám phá vịnh bằng kayak', image: '/images/Vivu/02-ha-long.png' },
        { title: 'Photography', text: 'Tour chụp ảnh bình minh & hoàng hôn', image: '/images/Vivu/01-hero-ha-long.png' },
      ],
      vivuStories: [
        {
          title: 'Một ngày ở Hội An',
          excerpt: 'Từ phố cổ ban ngày đến thả đèn hoa đăng về đêm.',
          image: '/images/Vivu/04-hoi-an.png',
          date: '12/03/2026',
        },
        {
          title: 'Săn mây Sa Pa',
          excerpt: 'Bình minh trên đỉnh Fansipan và biển mây bồng bềnh.',
          image: '/images/Vivu/07-sa-pa.png',
          date: '05/03/2026',
        },
        {
          title: 'Bình minh Phú Quốc',
          excerpt: 'Cát trắng, nước trong và cocktail hoàng hôn trên bãi Sao.',
          image: '/images/Vivu/06-phu-quoc.png',
          date: '28/02/2026',
        },
        {
          title: 'Ẩm thực miền Trung',
          excerpt: 'Hành trình vị giác từ Đà Nẵng đến phố cổ Hội An.',
          image: '/images/Vivu/03-da-nang.png',
          date: '20/02/2026',
        },
      ],
      vivuArticles: [
        {
          title: 'Kinh nghiệm du lịch Hạ Long 3 ngày 2 đêm',
          category: 'Kinh nghiệm',
          date: '15/03/2026',
          datetime: '2026-03-15',
          excerpt: 'Gợi ý lịch trình, khách sạn và món ăn không thể bỏ qua khi khám phá vịnh di sản.',
          image: '/images/Vivu/02-ha-long.png',
        },
        {
          title: 'Top 10 món ăn phải thử khi đến Hội An',
          category: 'Ăn gì',
          date: '08/03/2026',
          datetime: '2026-03-08',
          excerpt: 'Từ cao lầu, mì Quảng đến bánh mì Phượng — hành trình ẩm thực phố cổ.',
          image: '/images/Vivu/04-hoi-an.png',
        },
        {
          title: 'Nên đi Phú Quốc tháng mấy?',
          category: 'Mẹo',
          date: '02/03/2026',
          datetime: '2026-03-02',
          excerpt: 'Thời tiết, giá vé và hoạt động theo mùa để chọn kỳ nghỉ lý tưởng.',
          image: '/images/Vivu/06-phu-quoc.png',
        },
        {
          title: 'Chi phí du lịch Đà Lạt tự túc 2026',
          category: 'Lịch trình',
          date: '22/02/2026',
          datetime: '2026-02-22',
          excerpt: 'Ngân sách tham khảo cho cặp đôi và gia đình — từ lưu trú đến ăn uống.',
          image: '/images/Vivu/05-da-lat.png',
        },
        {
          title: 'Sa Pa mùa lúa chín — Thời điểm đẹp nhất',
          category: 'Chơi gì',
          date: '28/02/2026',
          datetime: '2026-02-28',
          excerpt: 'Tháng 9–10 là lúc ruộng bậc thang chuyển vàng rực, lý tưởng cho trekking.',
          image: '/images/Vivu/07-sa-pa.png',
        },
        {
          title: 'Review du thuyền Hạ Long 4 sao',
          category: 'Review',
          date: '18/02/2026',
          datetime: '2026-02-18',
          excerpt: 'Không gian cabin, ẩm thực onboard và lịch trình tham quan hang động.',
          image: '/images/Vivu/01-hero-ha-long.png',
        },
      ],
      vivuFaq: [
        {
          q: 'Đặt tour trước bao lâu?',
          a: 'Nên đặt trước 2–4 tuần với tour thường. Mùa cao điểm (lễ, Tết, hè) nên đặt trước 1–2 tháng để giữ chỗ tốt nhất.',
        },
        {
          q: 'Có hoàn tiền không?',
          a: 'VIVU hỗ trợ hoàn/hủy theo chính sách từng tour. Hủy sớm thường được hoàn một phần hoặc đổi lịch miễn phí tùy điều kiện.',
        },
        {
          q: 'Có tour riêng không?',
          a: 'Có. Chúng tôi thiết kế tour riêng theo nhóm gia đình, cặp đôi hoặc doanh nghiệp — lịch trình và ngân sách linh hoạt.',
        },
        {
          q: 'Có hỗ trợ doanh nghiệp không?',
          a: 'Có. VIVU tổ chức teambuilding, incentive trip và hội nghị kết hợp tham quan với báo giá và hợp đồng rõ ràng.',
        },
      ],
    };
  }

  private buildStaticPage(
    pageTitle: string,
    seoTitle: string,
    description: string,
    path: string,
  ) {
    const site = loadPublicSiteData();
    const blogPosts = this.articlesService
      .getLatestForBlog(5)
      .map((a) => this.articlesService.toBlogPost(a));

    return {
      ...site,
      blogPosts,
      year: new Date().getFullYear(),
      pageTitle: `${seoTitle} — ${site.brand}`,
      seo: this.articlesService.buildStaticPageSeo(
        seoTitle,
        description,
        path,
        site.brand,
      ),
      heading: pageTitle,
    };
  }
}
