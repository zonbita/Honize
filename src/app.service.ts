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

    return {
      layout: 'demo',
      year: new Date().getFullYear(),
      brand: site.brand,
      tmvBase,
      tmvActive: slug === 'tham-my-vien' ? 'home' : null,
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
      items: customView ? this.getDemoItems(templateSlug) : [],
      features: customView ? this.getDemoFeatures(templateSlug) : [],
      services: customView ? this.getDemoServices(templateSlug) : [],
      stats: customView ? this.getDemoStats(templateSlug) : [],
      tours: customView ? this.getDemoTours(templateSlug) : [],
      courses: customView ? this.getDemoCourses(templateSlug) : [],
      testimonials: customView ? this.getDemoTestimonials(templateSlug) : [],
      destinations: customView ? this.getDemoDestinations(templateSlug) : [],
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
      tmvBase: `/du-an/demo/${slug}`,
      tmvActive: config.nav,
      tmvHeaderSolid: true,
      tmvHeroBg:
        config.heroBg ?? `/images/ThamMyVien/tmv-bg-${subpage}.png`,
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
          label: 'Hành trình',
          icon: icon('<path d="M4 19V5M4 19h16M8 17v-4M12 17V9M16 17v-6"/>'),
        },
        {
          value: '50+',
          label: 'Điểm đến',
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
        image: '/images/Vivu/vivu%20(4).png',
        icon: icon('<path d="M3 18l4-6 4 3 5-8 5 11H3z"/>'),
      },
      {
        name: 'Đà Nẵng',
        image: '/images/Vivu/vivu%20(3).png',
        icon: icon('<path d="M4 18h16M8 18V8l4-4 4 4v10"/>'),
      },
      {
        name: 'Hội An',
        image: '/images/Vivu/vivu%20(5).png',
        icon: icon('<rect x="8" y="6" width="8" height="12" rx="1"/><path d="M12 6V4"/>'),
      },
      {
        name: 'Đà Lạt',
        image: '/images/Vivu/vivu%20(6).png',
        icon: icon('<path d="M4 20l6-14 4 8 3-5 3 11H4z"/>'),
      },
      {
        name: 'Phú Quốc',
        image: '/images/Vivu/vivu%20(7).png',
        icon: icon('<path d="M2 14c3-2 6-2 10 0s7 2 10 0"/><path d="M6 10c2-3 4-4 6-4s4 1 6 4"/>'),
      },
      {
        name: 'Sa Pa',
        image: '/images/Vivu/vivu%20(8).png',
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
          name: 'Nguyễn Minh Châu',
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
    const mk = (title: string, cat: string, bg: string, image: string) => ({
      title,
      price: '590.000đ',
      cat,
      bg,
      image,
    });
    return [
      mk(
        'Áo sơ mi linen',
        'a',
        '#eceff3',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&h=600&q=80',
      ),
      mk(
        'Váy hoa mùa hè',
        'b',
        '#f7d6de',
        'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&h=600&q=80',
      ),
      mk(
        'Quần ống rộng',
        'c',
        '#e7e1f5',
        'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=600&h=600&q=80',
      ),
      mk(
        'Túi tote canvas',
        'd',
        '#e8f0fa',
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&h=600&q=80',
      ),
      mk(
        'Áo khoác nhẹ',
        'a',
        '#efe9e2',
        'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=600&h=600&q=80',
      ),
      mk(
        'Đầm suông pastel',
        'b',
        '#f3e8f5',
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&h=600&q=80',
      ),
      mk(
        'Quần jeans ống đứng',
        'c',
        '#e6f4ea',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&h=600&q=80',
      ),
      mk(
        'Khăn lụa họa tiết',
        'd',
        '#fdeedc',
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&h=600&q=80',
      ),
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
        `${seoTitle} — ${site.brand}`,
        description,
        path,
        site.brand,
      ),
      heading: pageTitle,
    };
  }
}
