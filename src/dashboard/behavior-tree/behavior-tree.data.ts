import { BehaviorNode } from './behavior-tree.types';

export const dashboardBehaviorTree: BehaviorNode = {
  id: 'root',
  label: 'Dashboard CMS Root',
  type: 'root',
  children: [
    {
      id: 'task-selector',
      label: 'Chọn tác vụ (Selector)',
      type: 'selector',
      children: [
        {
          id: 'article-sequence',
          label: 'A. Sequence — Quản lý bài viết',
          type: 'sequence',
          children: [
            {
              id: 'has-articles',
              label: 'Có bài viết cần xử lý?',
              type: 'condition',
              evaluate: (ctx) => ctx.hasArticlesToProcess,
            },
            {
              id: 'article-status-selector',
              label: 'Trạng thái bài viết (Selector)',
              type: 'selector',
              children: [
                {
                  id: 'draft-sequence',
                  label: 'Bản nháp',
                  type: 'sequence',
                  children: [
                    {
                      id: 'open-edit',
                      label: 'Mở chỉnh sửa bài viết',
                      type: 'action',
                      action: () => 'Đang mở form chỉnh sửa bản nháp',
                    },
                    {
                      id: 'enough-content',
                      label: 'Đủ nội dung?',
                      type: 'condition',
                      evaluate: (ctx) => ctx.hasEnoughContent,
                    },
                    {
                      id: 'seo-reached',
                      label: 'SEO đạt yêu cầu?',
                      type: 'condition',
                      evaluate: (ctx) => ctx.seoScoreReached,
                    },
                    {
                      id: 'publish',
                      label: 'Xuất bản bài viết',
                      type: 'action',
                      action: () => 'Sẵn sàng xuất bản sau khi SEO đạt',
                    },
                  ],
                },
                {
                  id: 'published-action',
                  label: 'Đã xuất bản',
                  type: 'action',
                  evaluate: (ctx) => ctx.articleStatus === 'published',
                  action: () => 'Cập nhật nội dung bài đã xuất bản',
                },
                {
                  id: 'scheduled-action',
                  label: 'Đã lên lịch',
                  type: 'action',
                  evaluate: (ctx) => ctx.articleStatus === 'scheduled',
                  action: () => 'Kiểm tra lịch đăng bài',
                },
              ],
            },
          ],
        },
        {
          id: 'seo-sequence',
          label: 'B. Sequence — SEO Link',
          type: 'sequence',
          children: [
            {
              id: 'has-url',
              label: 'Có URL cần tối ưu?',
              type: 'condition',
              evaluate: (ctx) => ctx.hasUrlToOptimize,
            },
            {
              id: 'slug-valid',
              label: 'Slug hợp lệ?',
              type: 'condition',
              evaluate: (ctx) => ctx.slugValid,
            },
            {
              id: 'meta-complete',
              label: 'Meta title/description đầy đủ?',
              type: 'condition',
              evaluate: (ctx) => ctx.metaComplete,
            },
            {
              id: 'index-redirect',
              label: 'Index/Redirect đúng?',
              type: 'condition',
              evaluate: (ctx) => ctx.indexRedirectOk,
            },
            {
              id: 'update-seo',
              label: 'Cập nhật SEO Link',
              type: 'action',
              action: () => 'Cập nhật slug, meta và redirect',
            },
          ],
        },
        {
          id: 'performance-sequence',
          label: 'C. Sequence — Theo dõi hiệu suất',
          type: 'sequence',
          children: [
            {
              id: 'view-traffic',
              label: 'Xem lượt truy cập',
              type: 'action',
              action: () => 'Tải biểu đồ lưu lượng 7 ngày',
            },
            {
              id: 'view-top',
              label: 'Xem top bài viết',
              type: 'action',
              action: () => 'Hiển thị top 5 bài nhiều lượt xem',
            },
            {
              id: 'check-seo-score',
              label: 'Kiểm tra điểm SEO',
              type: 'action',
              action: () => 'Tính điểm SEO tổng thể trang',
            },
          ],
        },
      ],
    },
  ],
};

export const behaviorLegend = [
  { icon: 'flag', label: 'Bắt đầu', desc: 'Khởi chạy từ Root node' },
  { icon: 'selector', label: 'Selector (? )', desc: 'Chọn nhánh tác vụ phù hợp' },
  { icon: 'sequence', label: 'Sequence (→)', desc: 'Chạy tuần tự, tất cả phải thành công' },
  { icon: 'condition', label: 'Condition (✓)', desc: 'Kiểm tra trạng thái dữ liệu' },
  { icon: 'action', label: 'Action (⚙)', desc: 'Thực hiện thao tác trên dashboard' },
];

export const nodeStatuses = [
  { status: 'success', label: 'Thành công', color: 'bg-green-500' },
  { status: 'failure', label: 'Thất bại', color: 'bg-red-500' },
  { status: 'running', label: 'Đang xử lý', color: 'bg-orange-500' },
];

export const behaviorApplications = [
  'Gợi ý tự động bước tiếp theo cho editor',
  'Kiểm tra SEO trước khi xuất bản',
  'Chuẩn hóa luồng cập nhật SEO Link',
  'Theo dõi hiệu suất nội dung theo chu kỳ',
];

export const behaviorAdvantages = [
  'Logic rõ ràng, dễ mô tả luồng CMS',
  'Mở rộng thêm node mà không phá vỡ cấu trúc',
  'Dễ debug từng bước xử lý',
];

export const behaviorLimitations = [
  'Phức tạp khi số node tăng cao',
  'Phụ thuộc độ chính xác dữ liệu đầu vào',
  'Cần quản lý state giữa các lần chạy',
];

export const behaviorUseCases = [
  {
    title: 'Duyệt bài viết trước xuất bản',
    desc: 'Kiểm tra nội dung + SEO score trước khi publish',
    icon: 'document',
  },
  {
    title: 'Tự kiểm tra SEO bài viết',
    desc: 'Chạy checklist meta, heading, alt text tự động',
    icon: 'search',
  },
  {
    title: 'Kiểm tra lỗi URL / Redirect',
    desc: 'Phát hiện 404, redirect sai chuẩn SEO',
    icon: 'link',
  },
  {
    title: 'Theo dõi hiệu suất nội dung',
    desc: 'Traffic, top bài viết, điểm SEO theo thời gian',
    icon: 'chart',
  },
];
