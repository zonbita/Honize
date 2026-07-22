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
    const orisBase = slug === 'nha-khoa' ? `/du-an/demo/${slug}` : null;
    const elaraBase =
      slug === 'shop-thoi-trang' || templateSlug === 'shop-thoi-trang'
        ? `/du-an/demo/${slug}`
        : null;
    const voltixBase =
      slug === 'cua-hang-dien-tu' || templateSlug === 'cua-hang-dien-tu'
        ? `/du-an/demo/${slug}`
        : null;
    const orgBase = slug === 'nong-san' ? `/du-an/demo/${slug}` : null;
    const snBase = slug === 'showroom-noi-that' ? `/du-an/demo/${slug}` : null;

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
      orisBase,
      orisActive: slug === 'nha-khoa' ? 'home' : null,
      orisHeaderSolid: false,
      orisHeroBg: null,
      ...this.getOrisHomeData(slug),
      elaraBase,
      elaraActive: elaraBase ? 'home' : null,
      elaraHeaderSolid: false,
      elaraHeroBg: null,
      elaraCollection: null,
      voltixBase,
      voltixFeatured:
        slug === 'cua-hang-dien-tu' ? this.getVoltixFeatured() : null,
      voltixCategories:
        slug === 'cua-hang-dien-tu' ? this.getVoltixCategories() : null,
      orgBase,
      orgActive: slug === 'nong-san' ? 'home' : null,
      orgCategories:
        slug === 'nong-san' ? this.getNongSanCategories() : null,
      orgIconCategories:
        slug === 'nong-san' ? this.getNongSanIconCategories() : null,
      snBase,
      snCategories:
        slug === 'showroom-noi-that' ? this.getShowroomCategories() : null,
      snNewProducts:
        slug === 'showroom-noi-that' ? this.getShowroomNewProducts() : null,
      snFeaturedProducts:
        slug === 'showroom-noi-that' ? this.getShowroomFeaturedProducts() : null,
      snProjects:
        slug === 'showroom-noi-that' ? this.getShowroomProjects() : null,
      snHeroSlides:
        slug === 'showroom-noi-that' ? this.getShowroomHeroSlides() : null,
      snHeroCategories:
        slug === 'showroom-noi-that' ? this.getShowroomHeroCategories() : null,
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
        heroBg: '/images/Demo/ThamMyVien/ssskfdfkdfdfk.png',
      },
      'dich-vu': {
        view: 'demo/pages/tham-my-vien/dich-vu',
        nav: 'services',
        title: 'Dịch vụ',
        heroBg: '/images/Demo/ThamMyVien/tmv-bg-dich-vu.png',
      },
      'cong-nghe': {
        view: 'demo/pages/tham-my-vien/cong-nghe',
        nav: 'technology',
        title: 'Công nghệ',
        heroBg: '/images/Demo/ThamMyVien/tmv-bg-cong-nghe.png',
      },
      'kien-thuc': {
        view: 'demo/pages/tham-my-vien/kien-thuc',
        nav: 'knowledge',
        title: 'Kiến thức',
        heroBg: '/images/Demo/ThamMyVien/tmv-bg-kien-thuc.png',
      },
      'lien-he': {
        view: 'demo/pages/tham-my-vien/lien-he',
        nav: 'contact',
        title: 'Liên hệ',
        heroBg: '/images/Demo/ThamMyVien/tmv-bg-lien-he.png',
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
        heroBg: '/images/Demo/Vivu/01-hero-ha-long.png',
      },
      'tour-du-lich': {
        view: 'demo/pages/vivu/tour-du-lich',
        nav: 'tours',
        title: 'Tour du lịch',
        heroBg: '/images/Demo/Vivu/02-ha-long.png',
      },
      'trai-nghiem': {
        view: 'demo/pages/vivu/trai-nghiem',
        nav: 'experiences',
        title: 'Trải nghiệm',
        heroBg: '/images/Demo/Vivu/08-travel-couple.png',
      },
      'cam-nang': {
        view: 'demo/pages/vivu/cam-nang',
        nav: 'handbook',
        title: 'Cẩm nang',
        heroBg: '/images/Demo/Vivu/04-hoi-an.png',
      },
      'lien-he': {
        view: 'demo/pages/vivu/lien-he',
        nav: 'contact',
        title: 'Liên hệ',
        heroBg: '/images/Demo/Vivu/07-sa-pa.png',
      },
    },
    'shop-thoi-trang': {
      ao: {
        view: 'demo/pages/shop-thoi-trang/ao',
        nav: 'ao',
        title: 'Áo',
        heroBg: '/images/Demo/ThoiTrang/03-category-ao.png',
      },
      vay: {
        view: 'demo/pages/shop-thoi-trang/vay',
        nav: 'vay',
        title: 'Váy',
        heroBg: '/images/Demo/ThoiTrang/04-category-vay.png',
      },
      quan: {
        view: 'demo/pages/shop-thoi-trang/quan',
        nav: 'quan',
        title: 'Quần',
        heroBg: '/images/Demo/ThoiTrang/05-category-quan.png',
      },
      'phu-kien': {
        view: 'demo/pages/shop-thoi-trang/phu-kien',
        nav: 'phu-kien',
        title: 'Phụ kiện',
        heroBg: '/images/Demo/ThoiTrang/06-category-phukien.png',
      },
      bst: {
        view: 'demo/pages/shop-thoi-trang/bst',
        nav: 'bst',
        title: 'Bộ sưu tập',
        heroBg: '/images/Demo/ThoiTrang/11-collection-banner-bg.png',
      },
      sale: {
        view: 'demo/pages/shop-thoi-trang/sale',
        nav: 'sale',
        title: 'Sale',
        heroBg: '/images/Demo/ThoiTrang/12-newsletter-bg.png',
      },
      'lien-he': {
        view: 'demo/pages/shop-thoi-trang/lien-he',
        nav: 'contact',
        title: 'Liên hệ',
        heroBg: '/images/Demo/ThoiTrang/16-lifestyle-editorial.png',
      },
    },
    'nha-khoa': {
      'gioi-thieu': {
        view: 'demo/pages/nha-khoa/gioi-thieu',
        nav: 'about',
        title: 'Giới thiệu',
        heroBg: '/images/Demo/NhaKhoa/13-bg-gioi-thieu.png',
      },
      'dich-vu': {
        view: 'demo/pages/nha-khoa/dich-vu',
        nav: 'services',
        title: 'Dịch vụ',
        heroBg: '/images/Demo/NhaKhoa/14-bg-dich-vu.png',
      },
      'bac-si': {
        view: 'demo/pages/nha-khoa/bac-si',
        nav: 'doctors',
        title: 'Bác sĩ',
        heroBg: '/images/Demo/NhaKhoa/15-bg-bac-si.png',
      },
      'cong-nghe': {
        view: 'demo/pages/nha-khoa/cong-nghe',
        nav: 'technology',
        title: 'Công nghệ',
        heroBg: '/images/Demo/NhaKhoa/16-bg-cong-nghe.png',
      },
      'kien-thuc': {
        view: 'demo/pages/nha-khoa/kien-thuc',
        nav: 'knowledge',
        title: 'Kiến thức',
        heroBg: '/images/Demo/NhaKhoa/17-bg-kien-thuc.png',
      },
      'lien-he': {
        view: 'demo/pages/nha-khoa/lien-he',
        nav: 'contact',
        title: 'Liên hệ',
        heroBg: '/images/Demo/NhaKhoa/18-bg-lien-he.png',
      },
    },
    'nong-san': {
      'gioi-thieu': {
        view: 'demo/pages/nong-san/gioi-thieu',
        nav: 'about',
        title: 'Giới thiệu',
        heroBg: '/images/Demo/NongSan/about-farm.jpg',
      },
      'lien-he': {
        view: 'demo/pages/nong-san/lien-he',
        nav: 'contact',
        title: 'Liên hệ',
        heroBg: '/images/Demo/NongSan/hero.jpg',
      },
      'chinh-sach-doi-tra': {
        view: 'demo/pages/nong-san/chinh-sach-doi-tra',
        nav: 'policy',
        title: 'Chính sách đổi trả',
        heroBg: '/images/Demo/NongSan/promo-farm.jpg',
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
        config.heroBg ?? `/images/Demo/ThamMyVien/tmv-bg-${subpage}.png`,
      novaBase: slug === 'hoc-tieng-anh' ? `/du-an/demo/${slug}` : base.novaBase,
      novaActive: slug === 'hoc-tieng-anh' ? config.nav : base.novaActive,
      vivuBase: slug === 'vivu' ? `/du-an/demo/${slug}` : base.vivuBase,
      vivuActive: slug === 'vivu' ? config.nav : base.vivuActive,
      vivuHeaderSolid: slug === 'vivu',
      vivuHeroBg: slug === 'vivu' ? (config.heroBg ?? '/images/Demo/Vivu/01-hero-ha-long.png') : null,
      orisBase: slug === 'nha-khoa' ? `/du-an/demo/${slug}` : base.orisBase,
      orisActive: slug === 'nha-khoa' ? config.nav : base.orisActive,
      orisHeaderSolid: slug === 'nha-khoa',
      orisHeroBg:
        slug === 'nha-khoa'
          ? (config.heroBg ?? '/images/Demo/NhaKhoa/13-bg-gioi-thieu.png')
          : null,
      elaraBase:
        slug === 'shop-thoi-trang' ? `/du-an/demo/${slug}` : base.elaraBase,
      elaraActive: slug === 'shop-thoi-trang' ? config.nav : base.elaraActive,
      elaraHeaderSolid: slug === 'shop-thoi-trang',
      elaraHeroBg:
        slug === 'shop-thoi-trang'
          ? (config.heroBg ?? '/images/Demo/ThoiTrang/01-hero-bg.png')
          : null,
      elaraCollection:
        slug === 'shop-thoi-trang'
          ? this.getElaraCollectionForSubpage(subpage)
          : null,
      orgBase: slug === 'nong-san' ? `/du-an/demo/${slug}` : base.orgBase,
      orgActive: slug === 'nong-san' ? config.nav : base.orgActive,
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
    if (slug === 'nong-san') {
      return [
        { value: '120+', label: 'Hộ nông dân đối tác' },
        { value: '5.000+', label: 'Khách hàng tin dùng' },
        { value: '2h', label: 'Giao hàng nội thành' },
        { value: '98%', label: 'Hài lòng dịch vụ' },
      ];
    }
    if (slug === 'showroom-noi-that') {
      return [
        { value: '350+', label: 'Mẫu nội thất' },
        { value: '12', label: 'Năm kinh nghiệm' },
        { value: '2.800+', label: 'Khách hàng tin tưởng' },
        { value: '98%', label: 'Hài lòng dịch vụ' },
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
          image: '/images/Demo/Vivu/02-ha-long.png',
          highlights: ['Du thuyền 4 sao', 'Hang Sửng Sốt', 'Kayak vịnh'],
        },
        {
          title: 'Hội An – Phố cổ đêm',
          duration: '2N1Đ',
          price: '3.290.000đ',
          rating: '4.8',
          reviews: '96',
          badge: 'Ưu đãi',
          image: '/images/Demo/Vivu/04-hoi-an.png',
          highlights: ['Phố cổ về đêm', 'Thả đèn hoa đăng', 'Ẩm thực địa phương'],
        },
        {
          title: 'Phú Quốc – Biển xanh',
          duration: '4N3Đ',
          price: '6.490.000đ',
          rating: '4.9',
          reviews: '84',
          badge: '',
          image: '/images/Demo/Vivu/06-phu-quoc.png',
          highlights: ['Resort 5 sao', 'Lặn ngắm san hô', 'Sunset cocktail'],
        },
        {
          title: 'Sa Pa – Săn mây Tây Bắc',
          duration: '3N2Đ',
          price: '4.590.000đ',
          rating: '4.8',
          reviews: '112',
          badge: 'Yêu thích',
          image: '/images/Demo/Vivu/07-sa-pa.png',
          highlights: ['Fansipan', 'Bản Cát Cát', 'Homestay ấm cúng'],
        },
        {
          title: 'Đà Nẵng – Biển & Bà Nà',
          duration: '3N2Đ',
          price: '5.290.000đ',
          rating: '4.7',
          reviews: '76',
          badge: '',
          image: '/images/Demo/Vivu/03-da-nang.png',
          highlights: ['Cầu Vàng', 'Biển Mỹ Khê', 'Ẩm thực miền Trung'],
        },
        {
          title: 'Đà Lạt – Thành phố ngàn hoa',
          duration: '2N1Đ',
          price: '2.990.000đ',
          rating: '4.8',
          reviews: '91',
          badge: 'Cuối tuần',
          image: '/images/Demo/Vivu/05-da-lat.png',
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
          image: '/images/Demo/TiengAnh/icon-course-ielts-adult.svg',
        },
        {
          title: 'IELTS THCS & THPT',
          desc: 'Chương trình song song lớp học, giúp học sinh nắm vững ngữ pháp và tư duy tiếng Anh.',
          image: '/images/Demo/TiengAnh/icon-course-backpack.svg',
        },
        {
          title: 'Kids (6–12 tuổi)',
          desc: 'Học qua trò chơi, phim hoạt hình và hoạt động nhóm — xây nền tảng tự nhiên.',
          image: '/images/Demo/TiengAnh/icon-course-kids.svg',
        },
        {
          title: 'SAT / GMAT / GRE',
          desc: 'Luyện thi chuẩn Mỹ với giáo trình quốc tế và mô phỏng đề thi thực tế.',
          image: '/images/Demo/TiengAnh/icon-course-chart.svg',
        },
        {
          title: 'TOEIC & Giao tiếp',
          desc: 'Tăng điểm TOEIC nhanh và tự tin giao tiếp trong môi trường công sở.',
          image: '/images/Demo/TiengAnh/icon-course-speak.svg',
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
        image: '/images/Demo/Vivu/02-ha-long.png',
        tours: '12',
        rating: '4.9',
        icon: icon('<path d="M3 18l4-6 4 3 5-8 5 11H3z"/>'),
      },
      {
        name: 'Đà Nẵng',
        category: 'BIỂN',
        desc: 'Thành phố biển năng động',
        image: '/images/Demo/Vivu/03-da-nang.png',
        tours: '15',
        rating: '4.8',
        icon: icon('<path d="M4 18h16M8 18V8l4-4 4 4v10"/>'),
      },
      {
        name: 'Hội An',
        category: 'DI SẢN',
        desc: 'Phố cổ yên bình',
        image: '/images/Demo/Vivu/04-hoi-an.png',
        tours: '10',
        rating: '4.9',
        icon: icon('<rect x="8" y="6" width="8" height="12" rx="1"/><path d="M12 6V4"/>'),
      },
      {
        name: 'Đà Lạt',
        category: 'THIÊN NHIÊN',
        desc: 'Thành phố ngàn hoa',
        image: '/images/Demo/Vivu/05-da-lat.png',
        tours: '9',
        rating: '4.7',
        icon: icon('<path d="M4 20l6-14 4 8 3-5 3 11H4z"/>'),
      },
      {
        name: 'Phú Quốc',
        category: 'BIỂN',
        desc: 'Biển xanh cát trắng',
        image: '/images/Demo/Vivu/06-phu-quoc.png',
        tours: '14',
        rating: '4.9',
        icon: icon('<path d="M2 14c3-2 6-2 10 0s7 2 10 0"/><path d="M6 10c2-3 4-4 6-4s4 1 6 4"/>'),
      },
      {
        name: 'Sa Pa',
        category: 'THIÊN NHIÊN',
        desc: 'Ruộng bậc thang mây trời',
        image: '/images/Demo/Vivu/07-sa-pa.png',
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
    if (slug === 'nong-san') {
      return [
        {
          quote:
            'Rau củ tươi, giao đúng giờ. Combo tuần tiết kiệm thời gian nấu ăn cho cả gia đình.',
          name: 'Chị Minh Thu',
          role: 'Quận 7, TP.HCM',
        },
        {
          quote:
            'Thích nhất phần truy xuất nguồn gốc — biết rõ nông trại nào cung cấp, ăn yên tâm hơn.',
          name: 'Anh Quốc Bảo',
          role: 'Quận 3, TP.HCM',
        },
        {
          quote:
            'Gạo ST25 hữu cơ thơm, dẻo. Đặt định kỳ mỗi tháng, giá ổn định và ship nhanh.',
          name: 'Chị Lan Anh',
          role: 'Quận Bình Thạnh, TP.HCM',
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
    if (slug === 'nong-san') {
      const icon = (paths: string) =>
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">${paths}</svg>`;
      return [
        {
          icon: icon('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9.5 12l1.8 1.8L15 10"/>'),
          title: 'An toàn tuyệt đối',
          text: 'Kiểm định 3 lớp trước khi xuất kho, đảm bảo không vượt ngưỡng hóa chất.',
        },
        {
          icon: icon('<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>'),
          title: 'Giao trong 2 giờ',
          text: 'Đơn nội thành được xử lý ưu tiên, giữ độ tươi tối đa đến tay khách.',
        },
        {
          icon: icon('<path d="M4 19V5M4 19h16M8 17v-4M12 17V9M16 17v-6"/>'),
          title: 'Truy xuất QR',
          text: 'Quét mã trên bao bì để xem nông trại, ngày thu hoạch và chứng nhận.',
        },
        {
          icon: icon('<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"/>'),
          title: 'Hỗ trợ tận tâm',
          text: 'Tư vấn combo theo nhu cầu gia đình, đổi trả trong 24h nếu không hài lòng.',
        },
      ];
    }
    if (slug === 'hoc-tieng-anh') {
      return [
        {
          num: '01',
          variant: 'red',
          title: 'Tư duy Logic',
          text: 'Trang bị tư duy phân tích – logic ngôn ngữ để hiểu bản chất vấn đề và áp dụng linh hoạt trong mọi dạng bài.',
          image: '/images/Demo/TiengAnh/icon-logic-bulb.svg',
        },
        {
          num: '02',
          variant: 'dark',
          title: 'Công nghệ học tập thông minh',
          text: 'Hệ thống AI cá nhân hóa, tự động điều chỉnh lộ trình, theo dõi tiến độ & nhắc nhở kịp thời.',
          image: '/images/Demo/TiengAnh/icon-tech-devices.svg',
        },
        {
          num: '03',
          variant: 'outline',
          title: 'Chương trình tinh gọn',
          text: 'Giáo trình độc quyền biên soạn dựa trên phân tích dữ liệu hàng nghìn bài thi thực tế.',
          image: '/images/Demo/TiengAnh/icon-curriculum-book.svg',
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

  private formatVnd(amount: number): string {
    return `${amount.toLocaleString('vi-VN')} ₫`;
  }

  private voltixDefaultDiscount(id: string, price: number): number {
    if (price < 1000000) return 0;
    const hash = id.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    const rates = [8, 10, 12, 15, 18, 20, 23, 25];
    return rates[hash % rates.length];
  }

  private voltixImageFor(category: string, id: string): string {
    const byCategory: Record<string, string[]> = {
      laptop: [
        '/images/Demo/DienTu/laptop-3d.webp',
        '/images/Demo/DienTu/hero-products-transparent.png',
      ],
      phone: [
        '/images/Demo/DienTu/mobile-3d.webp',
        '/images/Demo/DienTu/hero-products-transparent.png',
      ],
      audio: [
        '/images/Demo/DienTu/audio-3d.webp',
        '/images/Demo/DienTu/promotion-products-transparent.png',
      ],
      smartwatch: [
        '/images/Demo/DienTu/mobile-3d.webp',
        '/images/Demo/DienTu/hero-products-transparent.png',
      ],
      tablet: [
        '/images/Demo/DienTu/laptop-3d.webp',
        '/images/Demo/DienTu/mobile-3d.webp',
      ],
      accessories: [
        '/images/Demo/DienTu/audio-3d.webp',
        '/images/Demo/DienTu/smart-home-3d.webp',
      ],
      monitor: [
        '/images/Demo/DienTu/laptop-3d.webp',
        '/images/Demo/DienTu/promotion-products-transparent.png',
      ],
      'smart-home': [
        '/images/Demo/DienTu/smart-home-3d.webp',
        '/images/Demo/DienTu/promotion-products-transparent.png',
      ],
    };
    const pool = byCategory[category] ?? byCategory.laptop;
    const hash = id.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    return pool[hash % pool.length];
  }

  private voltixResolveImage(image: string, category: string, id: string): string {
    if (/\/product-[^/]+\.png$/.test(image) || /\/category-[^/]+\.png$/.test(image)) {
      return this.voltixImageFor(category, id);
    }
    return image;
  }

  private voltixProduct(
    id: string,
    name: string,
    spec: string,
    price: number,
    image: string,
    category: string,
    options?: { discount?: number; installment?: boolean },
  ) {
    const discount =
      options?.discount ?? this.voltixDefaultDiscount(id, price);
    const installment = options?.installment ?? price >= 3000000;
    return {
      id,
      name,
      spec,
      price,
      priceDisplay: this.formatVnd(price),
      image: this.voltixResolveImage(image, category, id),
      category,
      discount,
      discountLabel: discount > 0 ? `Giảm ${discount}%` : null,
      installment,
      installmentLabel: installment ? 'Trả góp 0%' : null,
    };
  }

  private getVoltixFeatured() {
    const p = this.voltixProduct.bind(this);
    return [
      p('macbook-air-m3', 'MacBook Air M3 13 inch', '16GB / 512GB', 28990000, '/images/Demo/DienTu/product-laptop.png', 'laptop'),
      p('macbook-pro-m3', 'MacBook Pro M3 Pro 14 inch', '18GB / 512GB', 52990000, '/images/Demo/DienTu/laptop-3d.webp', 'laptop'),
      p('dell-xps-15', 'Dell XPS 15 OLED', '32GB / 1TB SSD', 41990000, '/images/Demo/DienTu/product-laptop.png', 'laptop'),
      p('iphone-15-pro-max', 'iPhone 15 Pro Max 256GB', 'Titan Tự Nhiên', 32990000, '/images/Demo/DienTu/product-phone.png', 'phone'),
      p('samsung-s24-ultra', 'Samsung Galaxy S24 Ultra', '256GB / Titanium Gray', 28990000, '/images/Demo/DienTu/mobile-3d.webp', 'phone'),
      p('google-pixel-8-pro', 'Google Pixel 8 Pro', '128GB / Obsidian', 22990000, '/images/Demo/DienTu/product-phone.png', 'phone'),
      p('sony-wh1000xm5', 'Sony WH-1000XM5', 'Tai nghe chống ồn', 7990000, '/images/Demo/DienTu/product-headphones.png', 'audio'),
      p('airpods-pro-2', 'AirPods Pro 2', 'USB-C / ANC', 5990000, '/images/Demo/DienTu/audio-3d.webp', 'audio'),
      p('apple-watch-s9', 'Apple Watch Series 9', 'GPS 45mm', 10990000, '/images/Demo/DienTu/product-smartwatch.png', 'smartwatch'),
      p('galaxy-watch-6', 'Samsung Galaxy Watch 6', '44mm Bluetooth', 7490000, '/images/Demo/DienTu/product-smartwatch.png', 'smartwatch'),
      p('ipad-air-m2', 'iPad Air M2 11 inch', '128GB Wi-Fi', 16990000, '/images/Demo/DienTu/product-tablet.png', 'tablet'),
      p('galaxy-tab-s9', 'Samsung Galaxy Tab S9', '256GB Wi-Fi', 14990000, '/images/Demo/DienTu/product-tablet.png', 'tablet'),
      p('logitech-mx-master', 'Logitech MX Master 3S', 'Chuột không dây', 2490000, '/images/Demo/DienTu/category-accessories.png', 'accessories'),
      p('lg-ultragear-27', 'LG UltraGear 27 inch', 'QHD 165Hz IPS', 8990000, '/images/Demo/DienTu/category-monitor.png', 'monitor'),
      p('google-nest-hub', 'Google Nest Hub Max', 'Màn hình thông minh 10"', 6990000, '/images/Demo/DienTu/smart-home-3d.webp', 'smart-home'),
    ];
  }

  private getVoltixCategories() {
    const p = this.voltixProduct.bind(this);
    return [
      {
        id: 'laptop',
        title: 'Laptop',
        sectionTitleId: 'vx-cat-laptop-title',
        linkHref: '#category-laptop',
        products: [
          p('macbook-air-m3', 'MacBook Air M3 13 inch', '16GB / 512GB', 28990000, '/images/Demo/DienTu/product-laptop.png', 'laptop'),
          p('macbook-pro-m3', 'MacBook Pro M3 Pro 14 inch', '18GB / 512GB', 52990000, '/images/Demo/DienTu/laptop-3d.webp', 'laptop'),
          p('dell-xps-15', 'Dell XPS 15 OLED', '32GB / 1TB SSD', 41990000, '/images/Demo/DienTu/product-laptop.png', 'laptop'),
          p('asus-rog-zephyrus', 'ASUS ROG Zephyrus G14', 'Ryzen 9 / RTX 4060', 38990000, '/images/Demo/DienTu/laptop-3d.webp', 'laptop'),
          p('lenovo-thinkpad-x1', 'Lenovo ThinkPad X1 Carbon', '32GB / 1TB', 44990000, '/images/Demo/DienTu/product-laptop.png', 'laptop'),
        ],
      },
      {
        id: 'phone',
        title: 'Điện thoại',
        sectionTitleId: 'vx-cat-phone-title',
        linkHref: '#category-phone',
        products: [
          p('iphone-15-pro-max', 'iPhone 15 Pro Max 256GB', 'Titan Tự Nhiên', 32990000, '/images/Demo/DienTu/product-phone.png', 'phone'),
          p('samsung-s24-ultra', 'Samsung Galaxy S24 Ultra', '256GB / Titanium Gray', 28990000, '/images/Demo/DienTu/mobile-3d.webp', 'phone'),
          p('google-pixel-8-pro', 'Google Pixel 8 Pro', '128GB / Obsidian', 22990000, '/images/Demo/DienTu/product-phone.png', 'phone'),
          p('xiaomi-14-pro', 'Xiaomi 14 Pro', '512GB / Titanium', 19990000, '/images/Demo/DienTu/mobile-3d.webp', 'phone'),
          p('oppo-find-x7', 'OPPO Find X7 Ultra', '256GB / 5G', 24990000, '/images/Demo/DienTu/product-phone.png', 'phone'),
        ],
      },
      {
        id: 'audio',
        title: 'Âm thanh',
        sectionTitleId: 'vx-cat-audio-title',
        linkHref: '#category-audio',
        products: [
          p('sony-wh1000xm5', 'Sony WH-1000XM5', 'Tai nghe chống ồn', 7990000, '/images/Demo/DienTu/product-headphones.png', 'audio'),
          p('airpods-pro-2', 'AirPods Pro 2', 'USB-C / ANC', 5990000, '/images/Demo/DienTu/audio-3d.webp', 'audio'),
          p('bose-qc-ultra', 'Bose QuietComfort Ultra', 'Headphones cao cấp', 8990000, '/images/Demo/DienTu/product-headphones.png', 'audio'),
          p('jbl-flip-6', 'JBL Flip 6', 'Loa Bluetooth chống nước', 2790000, '/images/Demo/DienTu/audio-3d.webp', 'audio'),
          p('marshall-acton-3', 'Marshall Acton III', 'Loa Bluetooth cổ điển', 6490000, '/images/Demo/DienTu/product-headphones.png', 'audio'),
        ],
      },
      {
        id: 'smartwatch',
        title: 'Smartwatch',
        sectionTitleId: 'vx-cat-smartwatch-title',
        linkHref: '#category-smartwatch',
        products: [
          p('apple-watch-s9', 'Apple Watch Series 9', 'GPS 45mm', 10990000, '/images/Demo/DienTu/product-smartwatch.png', 'smartwatch'),
          p('galaxy-watch-6', 'Samsung Galaxy Watch 6', '44mm Bluetooth', 7490000, '/images/Demo/DienTu/product-smartwatch.png', 'smartwatch'),
          p('garmin-fenix-7', 'Garmin Fenix 7', 'Đa môn thể thao', 15990000, '/images/Demo/DienTu/product-smartwatch.png', 'smartwatch'),
          p('huawei-watch-gt4', 'Huawei Watch GT 4', 'Pin 14 ngày', 5990000, '/images/Demo/DienTu/product-smartwatch.png', 'smartwatch'),
          p('amazfit-gtr-4', 'Amazfit GTR 4', 'Theo dõi sức khỏe', 4490000, '/images/Demo/DienTu/product-smartwatch.png', 'smartwatch'),
        ],
      },
      {
        id: 'accessories',
        title: 'Phụ kiện',
        sectionTitleId: 'vx-cat-accessories-title',
        linkHref: '#category-accessories',
        products: [
          p('logitech-mx-master', 'Logitech MX Master 3S', 'Chuột không dây', 2490000, '/images/Demo/DienTu/category-accessories.png', 'accessories'),
          p('anker-powercore', 'Anker PowerCore 20K', 'Sạc dự phòng 65W', 1290000, '/images/Demo/DienTu/category-accessories.png', 'accessories'),
          p('baseus-gan-charger', 'Baseus GaN Charger 100W', 'Sạc nhanh 3 cổng', 890000, '/images/Demo/DienTu/category-accessories.png', 'accessories'),
          p('ugreen-usb-hub', 'Ugreen USB-C Hub 7-in-1', 'Hub đa năng', 990000, '/images/Demo/DienTu/category-accessories.png', 'accessories'),
          p('apple-pencil-pro', 'Apple Pencil Pro', 'Bút cảm ứng thế hệ mới', 3990000, '/images/Demo/DienTu/category-accessories.png', 'accessories'),
        ],
      },
      {
        id: 'tablet',
        title: 'Máy tính bảng',
        sectionTitleId: 'vx-cat-tablet-title',
        linkHref: '#category-tablet',
        products: [
          p('ipad-air-m2', 'iPad Air M2 11 inch', '128GB Wi-Fi', 16990000, '/images/Demo/DienTu/product-tablet.png', 'tablet'),
          p('galaxy-tab-s9', 'Samsung Galaxy Tab S9', '256GB Wi-Fi', 14990000, '/images/Demo/DienTu/product-tablet.png', 'tablet'),
          p('ipad-pro-m2', 'iPad Pro M2 12.9 inch', '256GB Wi-Fi', 28990000, '/images/Demo/DienTu/product-tablet.png', 'tablet'),
          p('lenovo-tab-p12', 'Lenovo Tab P12 Pro', '128GB / OLED', 11990000, '/images/Demo/DienTu/product-tablet.png', 'tablet'),
          p('surface-pro-9', 'Microsoft Surface Pro 9', 'i7 / 16GB / 256GB', 32990000, '/images/Demo/DienTu/product-tablet.png', 'tablet'),
        ],
      },
      {
        id: 'monitor',
        title: 'Màn hình',
        sectionTitleId: 'vx-cat-monitor-title',
        linkHref: '#category-monitor',
        products: [
          p('lg-ultragear-27', 'LG UltraGear 27 inch', 'QHD 165Hz IPS', 8990000, '/images/Demo/DienTu/category-monitor.png', 'monitor'),
          p('samsung-odyssey-g9', 'Samsung Odyssey G9', '49 inch Curved DQHD', 24990000, '/images/Demo/DienTu/category-monitor.png', 'monitor'),
          p('dell-ultrasharp-32', 'Dell UltraSharp 32 inch', '4K IPS Black', 18990000, '/images/Demo/DienTu/category-monitor.png', 'monitor'),
          p('asus-proart-27', 'ASUS ProArt PA279CRV', '4K chuyên đồ họa', 15990000, '/images/Demo/DienTu/category-monitor.png', 'monitor'),
          p('benq-mobiuz-32', 'BenQ MOBIUZ EX321UX', '4K 144Hz Mini LED', 21990000, '/images/Demo/DienTu/category-monitor.png', 'monitor'),
        ],
      },
      {
        id: 'smart-home',
        title: 'Thiết bị thông minh',
        sectionTitleId: 'vx-cat-smart-home-title',
        linkHref: '#category-smart-home',
        products: [
          p('google-nest-hub', 'Google Nest Hub Max', 'Màn hình thông minh 10"', 6990000, '/images/Demo/DienTu/smart-home-3d.webp', 'smart-home'),
          p('amazon-echo-show', 'Amazon Echo Show 10', 'Loa thông minh xoay', 5990000, '/images/Demo/DienTu/category-smart-home.png', 'smart-home'),
          p('philips-hue-starter', 'Philips Hue Starter Kit', 'Bộ đèn thông minh', 3490000, '/images/Demo/DienTu/smart-home-3d.webp', 'smart-home'),
          p('xiaomi-smart-camera', 'Xiaomi Smart Camera 2K', 'Camera an ninh Wi-Fi', 890000, '/images/Demo/DienTu/category-smart-home.png', 'smart-home'),
          p('apple-homepod-mini', 'Apple HomePod mini', 'Loa thông minh Siri', 2290000, '/images/Demo/DienTu/smart-home-3d.webp', 'smart-home'),
        ],
      },
    ];
  }

  private getNongSanCategories() {
    return [
      {
        id: 'hai-san-nhap-khau',
        name: 'Hải sản nhập khẩu',
        icon: '/images/Demo/NongSan/categories/hai-san.jpg',
      },
      {
        id: 'hai-san-tuoi',
        name: 'Hải sản tươi',
        icon: '/images/Demo/NongSan/categories/hai-san.jpg',
      },
      {
        id: 'hoa-qua-nhap-khau',
        name: 'Hoa quả nhập khẩu',
        icon: '/images/Demo/NongSan/categories/trai-cay.jpg',
      },
      {
        id: 'rau-cu',
        name: 'Rau, củ sạch',
        icon: '/images/Demo/NongSan/categories/rau-cu.jpg',
      },
      {
        id: 'thit-tuoi',
        name: 'Thịt tươi',
        icon: '/images/Demo/NongSan/categories/thit-sach.jpg',
      },
      {
        id: 'dong-lanh',
        name: 'Thực phẩm đông lạnh',
        icon: '/images/Demo/NongSan/categories/dong-lanh.jpg',
      },
      {
        id: 'trai-cay',
        name: 'Trái cây tươi',
        icon: '/images/Demo/NongSan/categories/trai-cay.jpg',
      },
      {
        id: 'do-uong',
        name: 'Đồ uống',
        icon: '/images/Demo/NongSan/categories/do-uong.jpg',
      },
    ];
  }

  /** 6 icon-grid categories mapped to sidebar category ids (comma-separated filter). */
  private getNongSanIconCategories() {
    return [
      {
        id: 'rau-cu',
        name: 'Rau củ',
        icon: '/images/Demo/NongSan/categories/rau-cu.jpg',
        filter: 'rau-cu',
        count: 5,
      },
      {
        id: 'trai-cay',
        name: 'Trái cây',
        icon: '/images/Demo/NongSan/categories/trai-cay.jpg',
        filter: 'trai-cay,hoa-qua-nhap-khau',
        count: 10,
      },
      {
        id: 'gao-ngu-coc',
        name: 'Gạo & ngũ cốc',
        icon: '/images/Demo/NongSan/categories/gao-ngu-coc.jpg',
        filter: 'dong-lanh',
        tag: 'gao',
        count: 3,
      },
      {
        id: 'thit-sach',
        name: 'Thịt sạch',
        icon: '/images/Demo/NongSan/categories/thit-sach.jpg',
        filter: 'thit-tuoi',
        count: 5,
      },
      {
        id: 'sua-trung',
        name: 'Sữa & trứng',
        icon: '/images/Demo/NongSan/categories/sua-trung.jpg',
        filter: 'do-uong',
        tag: 'sua-trung',
        count: 3,
      },
      {
        id: 'dac-san',
        name: 'Đặc sản',
        icon: '/images/Demo/NongSan/categories/dac-san.jpg',
        filter: 'hai-san-nhap-khau,hai-san-tuoi,dong-lanh',
        tag: 'dac-san',
        count: 11,
      },
    ];
  }

  private getShowroomHeroSlides() {
    return [
      {
        headline: 'KHÔNG GIAN SỐNG',
        scriptLine: 'Đẳng cấp & Tinh tế',
        tagline: 'Kiến tạo không gian sống hoàn hảo cho bạn',
        image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1920&h=900&q=85',
        cta: 'XEM MẪU',
        href: '#san-pham-moi',
      },
      {
        headline: 'PHÒNG KHÁCH',
        scriptLine: 'Sang trọng & Ấm áp',
        tagline: 'Sofa, kệ tivi và bàn trà — phối màu tinh tế cho không gian sum vầy',
        image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1920&h=900&q=85',
        cta: 'XEM MẪU',
        href: '#danh-muc',
      },
      {
        headline: 'PHÒNG NGỦ',
        scriptLine: 'Thư giãn & Bình yên',
        tagline: 'Giường ngủ, tủ quần áo và ánh sáng dịu — nghỉ ngơi trọn vẹn mỗi đêm',
        image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1920&h=900&q=85',
        cta: 'XEM MẪU',
        href: '#san-pham-moi',
      },
    ];
  }

  private getShowroomHeroCategories() {
    return [
      {
        name: 'Phòng khách',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=480&h=360&q=80',
        href: '#san-pham-moi',
      },
      {
        name: 'Phòng ngủ',
        image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=480&h=360&q=80',
        href: '#san-pham-moi',
      },
      {
        name: 'Phòng bếp',
        image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=480&h=360&q=80',
        href: '#san-pham-moi',
      },
      {
        name: 'Bàn ghế',
        image: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=480&h=360&q=80',
        href: '#san-pham-moi',
      },
      {
        name: 'Phụ kiện',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=480&h=360&q=80',
        href: '#san-pham-moi',
      },
    ];
  }

  private getShowroomCategories() {
    const icon = (d: string) =>
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${d}</svg>`;
    return [
      {
        id: 'phong-khach',
        name: 'Nội thất phòng khách',
        icon: icon('<path d="M4 19V5M4 19h16M8 17v-4M12 17V9M16 17v-6"/>'),
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&h=300&q=80',
      },
      {
        id: 'phong-ngu',
        name: 'Nội thất phòng ngủ',
        icon: icon('<path d="M3 7h18v10H3zM7 7V5h10v2"/>'),
        image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&h=300&q=80',
      },
      {
        id: 'phong-bep',
        name: 'Nội thất phòng bếp',
        icon: icon('<rect x="3" y="8" width="18" height="12" rx="1"/><path d="M8 8V5M16 8V5"/>'),
        image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=400&h=300&q=80',
      },
      {
        id: 'phong-tam',
        name: 'Nội thất phòng tắm',
        icon: icon('<path d="M4 12h16M6 12v6M18 12v6M8 6h8v6H8z"/>'),
        image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=400&h=300&q=80',
      },
      {
        id: 'van-phong',
        name: 'Nội thất văn phòng',
        icon: icon('<rect x="3" y="4" width="18" height="16" rx="1"/><path d="M7 8h4M7 12h10M7 16h6"/>'),
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&h=300&q=80',
      },
      {
        id: 'truong-hoc',
        name: 'Nội thất trường học',
        icon: icon('<path d="M12 3L2 8l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>'),
        image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=400&h=300&q=80',
      },
      {
        id: 'nhua',
        name: 'Nội thất nhựa',
        icon: icon('<path d="M12 2l8 4v12l-8 4-8-4V6l8-4z"/>'),
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&h=300&q=80',
      },
      {
        id: 'chan-ga',
        name: 'Chăn ga gối đệm',
        icon: icon('<path d="M4 10h16v8H4zM8 10V7h8v3"/>'),
        image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=400&h=300&q=80',
      },
    ];
  }

  private getShowroomNewProducts() {
    const p = (
      title: string,
      priceOld: string,
      price: string,
      sale: string,
      image: string,
    ) => ({ title, priceOld, price, sale, image });
    return [
      p('Tủ bếp — 002', '2.500.000₫', '1.800.000₫', '-28%', 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=600&h=600&q=80'),
      p('Tủ bếp — 001', '2.300.000₫', '1.700.000₫', '-26%', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&h=600&q=80'),
      p('Bàn ăn — BA002', '2.700.000₫', '1.600.000₫', '-41%', 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=600&h=600&q=80'),
      p('Bàn ăn — BA001', '3.000.000₫', '1.800.000₫', '-40%', 'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?auto=format&fit=crop&w=600&h=600&q=80'),
      p('Bộ giường ngủ 03', '3.000.000₫', '1.700.000₫', '-43%', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&h=600&q=80'),
      p('Bộ phòng ngủ 02', '3.000.000₫', '1.700.000₫', '-43%', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=600&h=600&q=80'),
      p('Bộ giường ngủ 01', '2.500.000₫', '1.700.000₫', '-32%', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&h=600&q=80'),
      p('Kệ tivi 003', '2.000.000₫', '1.700.000₫', '-15%', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&h=600&q=80'),
    ];
  }

  private getShowroomFeaturedProducts() {
    return [
      {
        title: 'Bộ giường ngủ 01',
        priceOld: '2.500.000₫',
        price: '1.700.000₫',
        sale: '-32%',
        image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&h=600&q=80',
      },
      {
        title: 'Bàn ăn — BA002',
        priceOld: '2.700.000₫',
        price: '1.600.000₫',
        sale: '-41%',
        image: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=600&h=600&q=80',
      },
      {
        title: 'Bộ giường ngủ 03',
        priceOld: '3.000.000₫',
        price: '1.700.000₫',
        sale: '-43%',
        image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&h=600&q=80',
      },
      {
        title: 'Sofa 001',
        priceOld: '2.000.000₫',
        price: '1.700.000₫',
        sale: '-15%',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&h=600&q=80',
      },
      {
        title: 'Tủ bếp — 002',
        priceOld: '2.500.000₫',
        price: '1.800.000₫',
        sale: '-28%',
        image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=600&h=600&q=80',
      },
    ];
  }

  private getShowroomProjects() {
    return [
      {
        title: 'Thi công nội thất nhà Anh Bình — Phong Nha',
        image: '/images/Demo/House/house%20(2).png',
      },
      {
        title: 'Trọn bộ nội thất phòng ngủ Anh Nam — Đồng Hới',
        image: '/images/Demo/House/house%20(3).png',
      },
      {
        title: 'Trọn bộ phòng bếp chung cư Anh Đạt — Hoàn Lão',
        image: '/images/Demo/House/house%20(5).png',
      },
    ];
  }

  private getNongSanProducts() {
    const img = (file: string) => `/images/Demo/NongSan/products/${file}`;
    const p = (
      id: string,
      title: string,
      categoryId: string,
      category: string,
      priceNum: number,
      image: string,
      extra: Record<string, unknown> = {},
    ) => ({
      id,
      title,
      categoryId,
      category,
      priceNum,
      price: `${priceNum.toLocaleString('vi-VN')}đ`,
      rating: '4.8',
      reviews: '50',
      badge: '',
      originalPrice: null as string | null,
      image,
      ...extra,
    });

    return [
      // Hải sản nhập khẩu ×5
      p('ns-001', 'Cá hồi Na Uy fillet', 'hai-san-nhap-khau', 'Hải sản nhập khẩu', 389000, img('ca-hoi.jpg'), { rating: '4.9', reviews: '72', badge: 'Nhập khẩu' }),
      p('ns-002', 'Tôm hùm Canada size L', 'hai-san-nhap-khau', 'Hải sản nhập khẩu', 890000, img('tom-hum.jpg'), { rating: '5.0', reviews: '28', badge: 'Premium' }),
      p('ns-003', 'Bạch tuộc Hàn Quốc', 'hai-san-nhap-khau', 'Hải sản nhập khẩu', 245000, img('bach-tuoc.jpg'), { reviews: '41' }),
      p('ns-004', 'Sò điệp Nhật Bản', 'hai-san-nhap-khau', 'Hải sản nhập khẩu', 320000, img('so-diep.jpg'), { reviews: '35' }),
      p('ns-005', 'Cua hoàng đế Alaska', 'hai-san-nhap-khau', 'Hải sản nhập khẩu', 1250000, img('cua-hoang-de.jpg'), { badge: 'HOT' }),
      // Hải sản tươi ×5
      p('ns-006', 'Tôm sú tươi sống', 'hai-san-tuoi', 'Hải sản tươi', 285000, img('tom-su.jpg'), { rating: '4.9', reviews: '96' }),
      p('ns-007', 'Cá lóc tươi làm sạch', 'hai-san-tuoi', 'Hải sản tươi', 98000, img('ca-loc.jpg'), { reviews: '54' }),
      p('ns-008', 'Mực ống tươi', 'hai-san-tuoi', 'Hải sản tươi', 165000, img('muc-ong.jpg'), { reviews: '63' }),
      p('ns-009', 'Nghêu lụa tươi', 'hai-san-tuoi', 'Hải sản tươi', 45000, img('ngheu.jpg'), { reviews: '88' }),
      p('ns-010', 'Cá thu tươi cắt khúc', 'hai-san-tuoi', 'Hải sản tươi', 125000, img('ca-thu.jpg'), { badge: 'Mới' }),
      // Hoa quả nhập khẩu ×5
      p('ns-011', 'Táo Envy New Zealand', 'hoa-qua-nhap-khau', 'Hoa quả nhập khẩu', 95000, img('tao.jpg'), { rating: '4.8', reviews: '86', badge: '-20%', originalPrice: '120.000đ' }),
      p('ns-012', 'Nho xanh Mỹ không hạt', 'hoa-qua-nhap-khau', 'Hoa quả nhập khẩu', 145000, img('nho-xanh.jpg'), { reviews: '67' }),
      p('ns-013', 'Cherry Mỹ size Jumbo', 'hoa-qua-nhap-khau', 'Hoa quả nhập khẩu', 420000, img('cherry.jpg'), { badge: 'Theo mùa' }),
      p('ns-014', 'Kiwi vàng Zespri', 'hoa-qua-nhap-khau', 'Hoa quả nhập khẩu', 78000, img('kiwi.jpg'), { reviews: '112' }),
      p('ns-015', 'Lê Nam Phi', 'hoa-qua-nhap-khau', 'Hoa quả nhập khẩu', 68000, img('le.jpg'), { reviews: '45' }),
      // Rau củ ×5
      p('ns-016', 'Combo rau hữu cơ tuần', 'rau-cu', 'Rau, củ sạch', 189000, img('combo-rau.jpg'), { rating: '4.9', reviews: '128', badge: 'Bán chạy', originalPrice: '249.000đ' }),
      p('ns-017', 'Cà chua bi Đà Lạt', 'rau-cu', 'Rau, củ sạch', 35000, img('ca-chua.jpg'), { reviews: '63' }),
      p('ns-018', 'Xà lách xoong hữu cơ', 'rau-cu', 'Rau, củ sạch', 28000, img('xa-lach.jpg'), { reviews: '71' }),
      p('ns-019', 'Cải ngọt baby', 'rau-cu', 'Rau, củ sạch', 32000, img('cai-ngot.jpg'), { reviews: '58' }),
      p('ns-020', 'Bí đao non', 'rau-cu', 'Rau, củ sạch', 22000, img('bi-dao.jpg'), { reviews: '42' }),
      // Thịt tươi ×5
      p('ns-021', 'Thịt heo sạch đùi', 'thit-tuoi', 'Thịt tươi', 145000, img('thit-heo.jpg'), { rating: '4.7', reviews: '52', badge: 'Mới', originalPrice: '165.000đ' }),
      p('ns-022', 'Thịt bò Úc thăn ngoại', 'thit-tuoi', 'Thịt tươi', 385000, img('thit-bo.jpg'), { reviews: '38' }),
      p('ns-023', 'Thịt gà ta nguyên con', 'thit-tuoi', 'Thịt tươi', 195000, img('thit-ga.jpg'), { reviews: '77' }),
      p('ns-024', 'Sườn non heo sạch', 'thit-tuoi', 'Thịt tươi', 175000, img('suon-heo.jpg'), { reviews: '44' }),
      p('ns-025', 'Ba chỉ bò Mỹ slice', 'thit-tuoi', 'Thịt tươi', 265000, img('ba-chi-bo.jpg'), { badge: 'Sale' }),
      // Đông lạnh ×5 (gạo/ngũ cốc + đặc sản đông)
      p('ns-026', 'Gạo hữu cơ ST25', 'dong-lanh', 'Thực phẩm đông lạnh', 58000, img('gao.jpg'), { rating: '5.0', reviews: '214', badge: 'Hữu cơ', tag: 'gao' }),
      p('ns-027', 'Yến mạch Úc hữu cơ', 'dong-lanh', 'Thực phẩm đông lạnh', 89000, img('yen-mach.jpg'), { reviews: '89', tag: 'gao' }),
      p('ns-028', 'Mật ong rừng U Minh', 'dong-lanh', 'Thực phẩm đông lạnh', 320000, img('mat-ong.jpg'), { rating: '4.8', reviews: '41', badge: 'Sale', originalPrice: '380.000đ', tag: 'dac-san' }),
      p('ns-029', 'Rau củ đông lạnh mix', 'dong-lanh', 'Thực phẩm đông lạnh', 65000, img('rau-dong-lanh.jpg'), { reviews: '56' }),
      p('ns-030', 'Ngũ cốc ăn sáng hữu cơ', 'dong-lanh', 'Thực phẩm đông lạnh', 72000, img('ngu-coc.jpg'), { reviews: '33', tag: 'gao' }),
      // Trái cây tươi ×5
      p('ns-031', 'Cam sành Cao Phong', 'trai-cay', 'Trái cây tươi', 68000, img('cam.jpg'), { rating: '4.9', reviews: '118', badge: 'Theo mùa', originalPrice: '85.000đ' }),
      p('ns-032', 'Thanh long ruột đỏ', 'trai-cay', 'Trái cây tươi', 42000, img('thanh-long.jpg'), { reviews: '91' }),
      p('ns-033', 'Xoài cát Hòa Lộc', 'trai-cay', 'Trái cây tươi', 55000, img('xoai.jpg'), { reviews: '105' }),
      p('ns-034', 'Dưa hấu không hạt', 'trai-cay', 'Trái cây tươi', 38000, img('dua-hau.jpg'), { reviews: '76' }),
      p('ns-035', 'Chuối sáp già', 'trai-cay', 'Trái cây tươi', 28000, img('chuoi.jpg'), { reviews: '64' }),
      // Đồ uống ×5 (sữa/trứng + nước)
      p('ns-036', 'Trứng gà ta hữu cơ', 'do-uong', 'Đồ uống', 42000, img('trung.jpg'), { rating: '4.9', reviews: '97', tag: 'sua-trung' }),
      p('ns-037', 'Sữa tươi nguyên chất 1L', 'do-uong', 'Đồ uống', 38000, img('sua-tuoi.jpg'), { reviews: '82', tag: 'sua-trung' }),
      p('ns-038', 'Nước ép cam cold-press', 'do-uong', 'Đồ uống', 45000, img('nuoc-ep-cam.jpg'), { reviews: '59' }),
      p('ns-039', 'Sữa hạt óc chó', 'do-uong', 'Đồ uống', 52000, img('sua-hat.jpg'), { reviews: '47', tag: 'sua-trung' }),
      p('ns-040', 'Trà xanh matcha Nhật', 'do-uong', 'Đồ uống', 125000, img('matcha.jpg'), { reviews: '31' }),
    ];
  }

  private getDemoProducts(slug: string) {
    if (slug === 'nong-san') {
      return this.getNongSanProducts();
    }
    if (slug !== 'shop-thoi-trang') return [];
    return this.getDemoCollections(slug).flatMap((c) => c.products);
  }

  private getElaraCollectionForSubpage(subpage: string) {
    const map: Record<string, string> = {
      ao: 'ao',
      vay: 'vay',
      quan: 'quan',
      'phu-kien': 'phukien',
    };
    const id = map[subpage];
    if (!id) return null;
    return (
      this.getDemoCollections('shop-thoi-trang').find((c) => c.id === id) ??
      null
    );
  }

  /** YaMe-style category blocks: title + tagline + chips + 4 products each. */
  private getDemoCollections(slug: string) {
    if (slug !== 'shop-thoi-trang') return [];
    const base = '/du-an/demo/shop-thoi-trang';
    const mk = (
      title: string,
      cat: string,
      price: string,
      originalPrice: string,
      image: string,
      tags: string[],
      href: string,
    ) => ({
      title,
      price,
      originalPrice,
      sale: true,
      cat,
      image,
      tags,
      href,
    });
    return [
      {
        id: 'ao',
        title: 'ÁO LINEN & COTTON',
        tagline:
          'Chất liệu mềm mại, thoáng khí — phom dáng tối giản dễ phối mỗi ngày',
        chips: [
          { label: 'Tất cả', key: 'all' },
          { label: 'Sơ mi', key: 'so-mi' },
          { label: 'Áo thun', key: 'ao-thun' },
          { label: 'Áo polo', key: 'ao-polo' },
          { label: 'Hàng mới', key: 'hang-moi' },
        ],
        seeAll: 'XEM TẤT CẢ ÁO',
        seeAllHref: `${base}/ao`,
        products: [
          mk(
            'Áo sơ mi oversized Trắng',
            'a',
            '590.000đ',
            '890.000đ',
            '/images/Demo/ThoiTrang/09-product-ao-so-mi.png',
            ['so-mi', 'hang-moi'],
            `${base}/ao`,
          ),
          mk(
            'Áo linen cổ tròn Be',
            'a',
            '450.000đ',
            '690.000đ',
            '/images/Demo/ThoiTrang/17-product-ao-linen.png',
            ['ao-thun', 'hang-moi'],
            `${base}/ao`,
          ),
          mk(
            'Áo polo cotton Trắng',
            'a',
            '390.000đ',
            '590.000đ',
            '/images/Demo/ThoiTrang/21-product-ao-polo.png',
            ['ao-polo'],
            `${base}/ao`,
          ),
          mk(
            'Áo blouse linen Kem',
            'a',
            '520.000đ',
            '780.000đ',
            '/images/Demo/ThoiTrang/03-category-ao.png',
            ['so-mi'],
            `${base}/ao`,
          ),
        ],
      },
      {
        id: 'vay',
        title: 'VÁY MÙA HÈ',
        tagline:
          'Phom suông, midi & wrap — thanh lịch từ công sở đến dạo phố',
        chips: [
          { label: 'Tất cả', key: 'all' },
          { label: 'Midi', key: 'midi' },
          { label: 'Wrap', key: 'wrap' },
          { label: 'Hoa', key: 'hoa' },
          { label: 'Linen', key: 'linen' },
        ],
        seeAll: 'XEM TẤT CẢ VÁY',
        seeAllHref: `${base}/vay`,
        products: [
          mk(
            'Váy midi linen Kem',
            'b',
            '890.000đ',
            '1.290.000đ',
            '/images/Demo/ThoiTrang/08-product-vay-midi.png',
            ['midi', 'linen'],
            `${base}/vay`,
          ),
          mk(
            'Váy wrap đen thanh lịch',
            'b',
            '990.000đ',
            '1.490.000đ',
            '/images/Demo/ThoiTrang/18-product-vay-den.png',
            ['wrap'],
            `${base}/vay`,
          ),
          mk(
            'Váy hoa pastel Hồng',
            'b',
            '790.000đ',
            '1.190.000đ',
            '/images/Demo/ThoiTrang/22-product-vay-hoa.png',
            ['hoa', 'midi'],
            `${base}/vay`,
          ),
          mk(
            'Váy suông hoa Kem',
            'b',
            '850.000đ',
            '1.250.000đ',
            '/images/Demo/ThoiTrang/04-category-vay.png',
            ['hoa', 'linen'],
            `${base}/vay`,
          ),
        ],
      },
      {
        id: 'quan',
        title: 'QUẦN DÀI KHOE DÁNG',
        tagline: 'Ống rộng, jeans suông — bền bỉ, đứng form, tôn dáng',
        chips: [
          { label: 'Tất cả', key: 'all' },
          { label: 'Ống rộng', key: 'ong-rong' },
          { label: 'Jeans', key: 'jeans' },
          { label: 'Linen', key: 'linen' },
          { label: 'Bán chạy', key: 'ban-chay' },
        ],
        seeAll: 'XEM TẤT CẢ QUẦN',
        seeAllHref: `${base}/quan`,
        products: [
          mk(
            'Quần ống rộng Be',
            'c',
            '690.000đ',
            '990.000đ',
            '/images/Demo/ThoiTrang/10-product-quan-ong-rong.png',
            ['ong-rong', 'ban-chay'],
            `${base}/quan`,
          ),
          mk(
            'Quần jeans ống suông Xanh',
            'c',
            '790.000đ',
            '1.190.000đ',
            '/images/Demo/ThoiTrang/19-product-quan-jeans.png',
            ['jeans', 'ban-chay'],
            `${base}/quan`,
          ),
          mk(
            'Quần linen ống rộng Kem',
            'c',
            '650.000đ',
            '950.000đ',
            '/images/Demo/ThoiTrang/05-category-quan.png',
            ['ong-rong', 'linen'],
            `${base}/quan`,
          ),
          mk(
            'Quần jeans ống đứng Xanh nhạt',
            'c',
            '750.000đ',
            '1.090.000đ',
            '/images/Demo/ThoiTrang/19-product-quan-jeans.png',
            ['jeans'],
            `${base}/quan`,
          ),
        ],
      },
      {
        id: 'phukien',
        title: 'PHỤ KIỆN THỜI TRANG',
        tagline: 'Túi xách & phụ kiện cao cấp — điểm nhấn hoàn thiện set đồ',
        chips: [
          { label: 'Tất cả', key: 'all' },
          { label: 'Túi xách', key: 'tui-xach' },
          { label: 'Kính', key: 'kinh' },
          { label: 'Giày', key: 'giay' },
          { label: 'Sale', key: 'sale' },
        ],
        seeAll: 'XEM TẤT CẢ PHỤ KIỆN',
        seeAllHref: `${base}/phu-kien`,
        products: [
          mk(
            'Túi xách tay Veronica Đen',
            'd',
            '899.000đ',
            '1.798.000đ',
            '/images/Demo/ThoiTrang/07-product-tui-xach.png',
            ['tui-xach', 'sale'],
            `${base}/phu-kien`,
          ),
          mk(
            'Túi mini structured Kem',
            'd',
            '749.000đ',
            '1.498.000đ',
            '/images/Demo/ThoiTrang/20-product-tui-kem.png',
            ['tui-xach', 'sale'],
            `${base}/phu-kien`,
          ),
          mk(
            'Set phụ kiện silk & leather',
            'd',
            '599.000đ',
            '999.000đ',
            '/images/Demo/ThoiTrang/06-category-phukien.png',
            ['kinh', 'sale'],
            `${base}/phu-kien`,
          ),
          mk(
            'Túi xách Veronica Be',
            'd',
            '899.000đ',
            '1.798.000đ',
            '/images/Demo/ThoiTrang/20-product-tui-kem.png',
            ['tui-xach', 'giay', 'sale'],
            `${base}/phu-kien`,
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
    if (slug === 'showroom-noi-that') {
      return [
        {
          title: 'Cách sử dụng vách ngăn phòng trong không gian nhỏ',
          date: '03/11/2025',
          datetime: '2025-11-03',
          excerpt: 'Nếu bạn có một không gian nhỏ, vách ngăn thông minh giúp phân tách khu vực mà không làm chật phòng.',
          image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&h=380&q=80',
        },
        {
          title: '5 Cách làm ấm không gian nhà bạn vào mùa thu',
          date: '03/11/2025',
          datetime: '2025-11-03',
          excerpt: 'Mùa thu len lỏi vào từng góc nhà — thêm gối, thảm và ánh sáng vàng ấm để không gian ấm áp hơn.',
          image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&h=380&q=80',
        },
        {
          title: '4 Thủ thuật sắp xếp đồ đạc như một chuyên gia',
          date: '03/11/2025',
          datetime: '2025-11-03',
          excerpt: 'Bắt tay dọn dẹp có thể khó hơn dự tính — bắt đầu từ khu vực nhỏ và phân loại theo tần suất sử dụng.',
          image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&h=380&q=80',
        },
        {
          title: 'Bí mật tối đa hóa diện tích phòng khách nhỏ',
          date: '03/11/2025',
          datetime: '2025-11-03',
          excerpt: 'Với căn hộ một phòng, phòng khách phải đảm nhiệm nhiều chức năng — chọn nội thất đa năng là chìa khóa.',
          image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=600&h=380&q=80',
        },
        {
          title: 'Hướng dẫn vệ sinh ghế sofa vải đơn giản',
          date: '03/11/2025',
          datetime: '2025-11-03',
          excerpt: 'Trong mỗi phòng khách đều có ghế sofa — bảo quản đúng cách giúp kéo dài tuổi thọ và vẻ đẹp ban đầu.',
          image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=600&h=380&q=80',
        },
        {
          title: 'Thi công nội thất chung cư 70m² tông trắng',
          date: '03/11/2025',
          datetime: '2025-11-03',
          excerpt: 'Gam trắng làm tông chủ đạo từ phòng khách đến phòng ngủ — tạo cảm giác rộng rãi và sáng sủa.',
          image: '/images/Demo/House/house%20(4).png',
        },
      ];
    }
    if (slug === 'nong-san') {
      return [
        {
          id: 'blog-1',
          title: '5 cách bảo quản rau xanh tươi lâu hơn',
          date: '18/06/2026',
          datetime: '2026-06-18',
          excerpt: 'Mẹo đơn giản giúp rau củ giữ độ tươi 5–7 ngày trong tủ lạnh gia đình.',
          image: '/images/Demo/NongSan/news/bao-quan-rau.jpg',
          body:
            'Rau xanh thường bị héo sau 2–3 ngày nếu bảo quản không đúng cách. Hãy rửa sạch, lau khô hoàn toàn rồi bọc khăn ẩm trước khi cho vào hộp kín. Nhiệt độ tủ lạnh nên duy trì 2–4°C, tách riêng rau lá mềm và củ quả. Organico giao rau trong túi thở có lỗ thoát khí giúp kéo dài độ tươi thêm 2 ngày so với bao thường.',
        },
        {
          id: 'blog-2',
          title: 'Lợi ích của thực phẩm hữu cơ với trẻ em',
          date: '12/06/2026',
          datetime: '2026-06-12',
          excerpt: 'Tại sao nhiều phụ huynh chọn combo rau hữu cơ cho bữa ăn hàng ngày của con.',
          image: '/images/Demo/NongSan/news/huu-co-tre-em.jpg',
          body:
            'Thực phẩm hữu cơ hạn chế tiếp xúc hóa chất bảo vệ thực vật, phù hợp hệ tiêu hóa còn non của trẻ. Combo rau Organico được kiểm định 3 lớp, có mã QR truy xuất nguồn gốc để phụ huynh yên tâm. Nhiều gia đình chọn gói combo tuần để đa dạng rau củ mà không cần lo kế hoạch mua sắm.',
        },
        {
          id: 'blog-3',
          title: 'Tour tham quan nông trại Organico cuối tuần',
          date: '05/06/2026',
          datetime: '2026-06-05',
          excerpt: 'Trải nghiệm thu hoạch và tìm hiểu quy trình canh tác hữu cơ tại Đà Lạt.',
          image: '/images/Demo/NongSan/news/tour-nong-trai.jpg',
          body:
            'Cuối tuần này, Organico mở tour tham quan nông trại tại Đà Lạt dành cho khách hàng đặt combo lần đầu. Bạn sẽ được trải nghiệm thu hoạch rau, tìm hiểu quy trình VietGAP và thưởng thức bữa trưa farm-to-table. Đăng ký trước qua hotline 1900 6868 — miễn phí cho 2 người/đơn combo tuần.',
        },
      ];
    }
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
          image: '/images/Demo/TiengAnh/icon-logic-bulb.svg',
        },
        {
          title: 'Không học thuộc lòng',
          text: 'Thay vì thuộc mẫu câu cứng, học viên hiểu cấu trúc và tự tạo câu đúng ngữ cảnh, đúng mục tiêu giao tiếp.',
          image: '/images/Demo/TiengAnh/icon-curriculum-book.svg',
        },
        {
          title: 'Xây nền tảng ngôn ngữ',
          text: 'Phát âm, ngữ pháp và từ vựng được xây có hệ thống trước khi tăng tốc luyện đề và kỹ năng chuyên sâu.',
          image: '/images/Demo/TiengAnh/icon-course-backpack.svg',
        },
        {
          title: 'Tư duy bằng tiếng Anh',
          text: 'Luyện phản xạ suy nghĩ bằng tiếng Anh để nói – viết tự nhiên, mạch lạc và thuyết phục hơn.',
          image: '/images/Demo/TiengAnh/icon-course-speak.svg',
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
        { title: 'Văn hóa', text: 'Phố cổ, di sản và nghi lễ truyền thống', image: '/images/Demo/Vivu/04-hoi-an.png' },
        { title: 'Ẩm thực', text: 'Tour ăn uống cùng đầu bếp địa phương', image: '/images/Demo/Vivu/03-da-nang.png' },
        { title: 'Nghỉ dưỡng', text: 'Resort biển và spa thư giãn', image: '/images/Demo/Vivu/06-phu-quoc.png' },
        { title: 'Trekking', text: 'Đường mòn Tây Bắc và ruộng bậc thang', image: '/images/Demo/Vivu/07-sa-pa.png' },
        { title: 'Camping', text: 'Cắm trại dưới bầu trời cao nguyên', image: '/images/Demo/Vivu/05-da-lat.png' },
        { title: 'Diving', text: 'Lặn ngắm san hô biển đảo', image: '/images/Demo/Vivu/06-phu-quoc.png' },
        { title: 'Chèo Kayak', text: 'Khám phá vịnh bằng kayak', image: '/images/Demo/Vivu/02-ha-long.png' },
        { title: 'Photography', text: 'Tour chụp ảnh bình minh & hoàng hôn', image: '/images/Demo/Vivu/01-hero-ha-long.png' },
      ],
      vivuStories: [
        {
          title: 'Một ngày ở Hội An',
          excerpt: 'Từ phố cổ ban ngày đến thả đèn hoa đăng về đêm.',
          image: '/images/Demo/Vivu/04-hoi-an.png',
          date: '12/03/2026',
        },
        {
          title: 'Săn mây Sa Pa',
          excerpt: 'Bình minh trên đỉnh Fansipan và biển mây bồng bềnh.',
          image: '/images/Demo/Vivu/07-sa-pa.png',
          date: '05/03/2026',
        },
        {
          title: 'Bình minh Phú Quốc',
          excerpt: 'Cát trắng, nước trong và cocktail hoàng hôn trên bãi Sao.',
          image: '/images/Demo/Vivu/06-phu-quoc.png',
          date: '28/02/2026',
        },
        {
          title: 'Ẩm thực miền Trung',
          excerpt: 'Hành trình vị giác từ Đà Nẵng đến phố cổ Hội An.',
          image: '/images/Demo/Vivu/03-da-nang.png',
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
          image: '/images/Demo/Vivu/02-ha-long.png',
        },
        {
          title: 'Top 10 món ăn phải thử khi đến Hội An',
          category: 'Ăn gì',
          date: '08/03/2026',
          datetime: '2026-03-08',
          excerpt: 'Từ cao lầu, mì Quảng đến bánh mì Phượng — hành trình ẩm thực phố cổ.',
          image: '/images/Demo/Vivu/04-hoi-an.png',
        },
        {
          title: 'Nên đi Phú Quốc tháng mấy?',
          category: 'Mẹo',
          date: '02/03/2026',
          datetime: '2026-03-02',
          excerpt: 'Thời tiết, giá vé và hoạt động theo mùa để chọn kỳ nghỉ lý tưởng.',
          image: '/images/Demo/Vivu/06-phu-quoc.png',
        },
        {
          title: 'Chi phí du lịch Đà Lạt tự túc 2026',
          category: 'Lịch trình',
          date: '22/02/2026',
          datetime: '2026-02-22',
          excerpt: 'Ngân sách tham khảo cho cặp đôi và gia đình — từ lưu trú đến ăn uống.',
          image: '/images/Demo/Vivu/05-da-lat.png',
        },
        {
          title: 'Sa Pa mùa lúa chín — Thời điểm đẹp nhất',
          category: 'Chơi gì',
          date: '28/02/2026',
          datetime: '2026-02-28',
          excerpt: 'Tháng 9–10 là lúc ruộng bậc thang chuyển vàng rực, lý tưởng cho trekking.',
          image: '/images/Demo/Vivu/07-sa-pa.png',
        },
        {
          title: 'Review du thuyền Hạ Long 4 sao',
          category: 'Review',
          date: '18/02/2026',
          datetime: '2026-02-18',
          excerpt: 'Không gian cabin, ẩm thực onboard và lịch trình tham quan hang động.',
          image: '/images/Demo/Vivu/01-hero-ha-long.png',
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

  private getOrisHomeData(slug: string) {
    if (slug !== 'nha-khoa') {
      return {
        orisNav: null,
        orisStats: null,
        orisServices: null,
        orisAboutBenefits: null,
        orisTechnologies: null,
        orisResults: null,
        orisDoctors: null,
        orisTestimonials: null,
      };
    }

    const base = `/du-an/demo/${slug}`;
    const icon = (paths: string) =>
      `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.7">${paths}</svg>`;

    return {
      orisNav: [
        { key: 'home', label: 'Trang chủ', href: base },
        { key: 'about', label: 'Giới thiệu', href: `${base}/gioi-thieu` },
        { key: 'services', label: 'Dịch vụ', href: `${base}/dich-vu` },
        { key: 'technology', label: 'Công nghệ', href: `${base}/cong-nghe` },
        { key: 'doctors', label: 'Bác sĩ', href: `${base}/bac-si` },
        { key: 'knowledge', label: 'Kiến thức', href: `${base}/kien-thuc` },
        { key: 'contact', label: 'Liên hệ', href: `${base}/lien-he` },
      ],
      orisStats: [
        {
          isRating: true,
          stars: [1, 2, 3, 4, 5],
          value: '4.9 / 5',
          label: '2.400+ đánh giá Google',
        },
        {
          isRating: false,
          value:
            '<span class="oris-count" data-count="12000" data-separator="." data-suffix="+">0</span>',
          label: 'Khách hàng tin tưởng',
          icon: icon(
            '<path d="M16 19v-1.2A3.8 3.8 0 0012.2 14H7.8A3.8 3.8 0 004 17.8V19"/><circle cx="10" cy="8" r="3.2"/><path d="M19.5 19v-1a3 3 0 00-2.2-2.9"/><path d="M15.5 5.2a3.2 3.2 0 010 5.6"/>',
          ),
        },
        {
          isRating: false,
          value:
            '<span class="oris-count" data-count="10" data-suffix="+ năm">0</span>',
          label: 'Kinh nghiệm lâm sàng',
          icon: icon(
            '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9.5 12l1.8 1.8L15 10"/>',
          ),
        },
        {
          isRating: false,
          value: 'ISO',
          label: 'Quy trình vô khuẩn chuẩn',
          icon: icon(
            '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v5l3 1.8"/><path d="M8.2 4.2l1.2 2.2M15.8 4.2l-1.2 2.2"/>',
          ),
        },
      ],
      orisServices: [
        {
          title: 'Trồng răng Implant',
          text: 'Phục hồi răng mất bằng trụ titanium chuẩn quốc tế — ăn nhai chắc chắn, thẩm mỹ tự nhiên.',
          image: '/images/Demo/NhaKhoa/03-service-implant.png',
          alt: 'Trồng răng Implant tại ORIS',
          href: `${base}/dich-vu`,
        },
        {
          title: 'Niềng răng thẩm mỹ',
          text: 'Khí cụ trong suốt kín đáo, điều chỉnh khớp cắn nhẹ nhàng với kế hoạch số hóa rõ ràng.',
          image: '/images/Demo/NhaKhoa/04-service-ortho.png',
          alt: 'Niềng răng thẩm mỹ tại ORIS',
          href: `${base}/dich-vu`,
        },
        {
          title: 'Răng sứ thẩm mỹ',
          text: 'Phục hình sứ cao cấp giúp nụ cười đều, sáng và hài hòa với khuôn mặt.',
          image: '/images/Demo/NhaKhoa/05-service-whitening.png',
          alt: 'Răng sứ thẩm mỹ tại ORIS',
          href: `${base}/dich-vu`,
        },
        {
          title: 'Nha khoa tổng quát',
          text: 'Khám, lấy cao răng, điều trị sâu răng và chăm sóc định kỳ cho cả gia đình.',
          image: '/images/Demo/NhaKhoa/06-service-checkup.png',
          alt: 'Nha khoa tổng quát tại ORIS',
          href: `${base}/dich-vu`,
        },
      ],
      orisAboutBenefits: [
        'Quy trình vô khuẩn nghiêm ngặt theo tiêu chuẩn lâm sàng',
        'Trang thiết bị số hóa hỗ trợ chẩn đoán chính xác',
        'Tư vấn minh bạch — kế hoạch điều trị cá nhân hóa',
      ],
      orisTechnologies: [
        {
          featured: true,
          title: 'Công nghệ CT Cone Beam 3D',
          text: 'Hình ảnh 3D chi tiết hỗ trợ lập kế hoạch implant và phẫu thuật an toàn.',
          image: '/images/Demo/NhaKhoa/08-tech-digital.png',
          alt: 'Công nghệ CT Cone Beam 3D tại ORIS',
          href: `${base}/cong-nghe`,
        },
        {
          featured: false,
          title: 'Máy quét dấu răng kỹ thuật số',
          text: 'Quét intraoral nhanh, chính xác — không khó chịu như lấy dấu truyền thống.',
          image: '/images/Demo/NhaKhoa/01-hero-bg.png',
          alt: 'Máy quét dấu răng kỹ thuật số',
          href: `${base}/cong-nghe`,
        },
        {
          featured: false,
          title: 'Công nghệ thiết kế nụ cười',
          text: 'Mô phỏng kết quả thẩm mỹ trước điều trị để bạn chủ động quyết định.',
          image: '/images/Demo/NhaKhoa/16-bg-cong-nghe.png',
          alt: 'Thiết kế nụ cười số tại ORIS',
          href: `${base}/cong-nghe`,
        },
        {
          featured: false,
          title: 'Quy trình vô khuẩn tiêu chuẩn',
          text: 'Kiểm soát nhiễm khuẩn nghiêm ngặt trong toàn bộ quy trình lâm sàng.',
          image: '/images/Demo/NhaKhoa/07-clinic-space.png',
          alt: 'Quy trình vô khuẩn tại phòng khám ORIS',
          href: `${base}/cong-nghe`,
        },
      ],
      orisResults: [
        {
          title: 'Niềng răng thẩm mỹ',
          text: 'Răng đều đẹp, khớp cắn chuẩn và tự nhiên.',
          image: '/images/Demo/NhaKhoa/25-ba-ortho.png',
          alt: 'Kết quả trước và sau niềng răng thẩm mỹ',
        },
        {
          title: 'Trồng răng Implant',
          text: 'Phục hồi răng mất — ăn nhai chắc chắn.',
          image: '/images/Demo/NhaKhoa/26-ba-implant.png',
          alt: 'Kết quả trước và sau trồng răng Implant',
        },
        {
          title: 'Răng sứ thẩm mỹ',
          text: 'Nụ cười sáng khỏe, hài hòa khuôn mặt.',
          image: '/images/Demo/NhaKhoa/24-ba-whitening.png',
          alt: 'Kết quả trước và sau răng sứ thẩm mỹ',
        },
      ],
      orisDoctors: [
        {
          name: 'BS. Nguyễn Minh Khoa',
          role: 'Trưởng khoa Implant',
          image: '/images/Demo/NhaKhoa/19-doctor-1.png',
          href: `${base}/bac-si`,
          points: ['10+ năm kinh nghiệm', 'Chuyên sâu Implant', '2.000+ ca thành công'],
        },
        {
          name: 'BS. Trần Thu Hà',
          role: 'Chỉnh nha & thẩm mỹ',
          image: '/images/Demo/NhaKhoa/20-doctor-2.png',
          href: `${base}/bac-si`,
          points: ['Chuyên gia chỉnh nha', 'Niềng trong suốt', 'Thẩm mỹ nụ cười'],
        },
        {
          name: 'BS. Lê Hoàng Nam',
          role: 'Nha khoa tổng quát',
          image: '/images/Demo/NhaKhoa/21-doctor-3.png',
          href: `${base}/bac-si`,
          points: ['Điều trị toàn diện', 'Chăm sóc gia đình', 'Tư vấn tận tâm'],
        },
      ],
      orisTestimonials: [
        {
          name: 'Lan Anh',
          treatment: 'Implant',
          text: 'Quy trình rõ ràng, bác sĩ giải thích kỹ từng bước. Tôi hoàn toàn yên tâm khi điều trị tại ORIS.',
          initials: 'LA',
        },
        {
          name: 'Minh Tú',
          treatment: 'Niềng răng',
          text: 'Niềng trong suốt rất kín đáo, kết quả khớp cắn đẹp hơn mong đợi sau liệu trình.',
          initials: 'MT',
          featured: true,
        },
        {
          name: 'Hoài Phương',
          treatment: 'Thẩm mỹ',
          text: 'Không gian sạch sẽ, đội ngũ chuyên nghiệp. Nụ cười sáng khỏe chỉ sau một liệu trình.',
          initials: 'HP',
        },
      ],
    };
  }
}
