(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var topBtn = document.getElementById('btn-back-top');
    var chatBtn = document.getElementById('btn-ai-chat');
    var chatPopup = document.getElementById('ai-chat-popup');
    var chatClose = document.getElementById('btn-ai-close');
    var chatForm = document.getElementById('ai-chat-form');
    var chatInput = document.getElementById('ai-chat-input');
    var chatMessages = document.getElementById('ai-chat-messages');

    function getScrollTop() {
      var root = document.scrollingElement || document.documentElement;
      var top =
        window.scrollY ||
        window.pageYOffset ||
        root.scrollTop ||
        document.body.scrollTop ||
        0;
      if (window.visualViewport && window.visualViewport.pageTop) {
        top = Math.max(top, window.visualViewport.pageTop);
      }
      return top;
    }

    function scrollToTop() {
      var root = document.scrollingElement || document.documentElement;
      try {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      } catch (e) {
        root.scrollTop = 0;
        document.body.scrollTop = 0;
      }
    }

    function scrollThreshold() {
      return window.matchMedia('(max-width: 639px)').matches ? 180 : 420;
    }

    function showTopBtn() {
      if (!topBtn) return;
      if (getScrollTop() > scrollThreshold()) {
        topBtn.classList.add('is-visible');
      } else {
        topBtn.classList.remove('is-visible');
      }
    }

    function bindScrollWatch() {
      window.addEventListener('scroll', showTopBtn, { passive: true });
      document.addEventListener('scroll', showTopBtn, { passive: true, capture: true });
      window.addEventListener('resize', showTopBtn, { passive: true });
      window.addEventListener('orientationchange', showTopBtn, { passive: true });
      if (window.visualViewport) {
        window.visualViewport.addEventListener('scroll', showTopBtn, { passive: true });
        window.visualViewport.addEventListener('resize', showTopBtn, { passive: true });
      }
    }

    if (topBtn) {
      topBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        scrollToTop();
      });
      bindScrollWatch();
      showTopBtn();
      setTimeout(showTopBtn, 300);
    }

    function isChatOpen() {
      return !!(chatPopup && chatPopup.classList.contains('is-open'));
    }

    function openChat() {
      if (!chatPopup || !chatBtn) return;
      chatPopup.classList.add('is-open');
      chatPopup.setAttribute('aria-hidden', 'false');
      chatBtn.setAttribute('aria-expanded', 'true');
      chatBtn.classList.add('is-active');
      setTimeout(function () {
        if (chatInput) chatInput.focus();
      }, 50);
    }

    function closeChat() {
      if (!chatPopup || !chatBtn) return;
      chatPopup.classList.remove('is-open');
      chatPopup.setAttribute('aria-hidden', 'true');
      chatBtn.setAttribute('aria-expanded', 'false');
      chatBtn.classList.remove('is-active');
    }

    if (chatBtn && chatPopup) {
      chatBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (isChatOpen()) closeChat();
        else openChat();
      });
    }

    if (chatClose) {
      chatClose.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        closeChat();
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isChatOpen()) closeChat();
    });

    document.addEventListener('click', function (e) {
      if (!isChatOpen() || !chatPopup || !chatBtn) return;
      var target = e.target;
      if (chatPopup.contains(target) || chatBtn.contains(target)) return;
      closeChat();
    });

    function appendMessage(text, type) {
      if (!chatMessages) return;
      var el = document.createElement('div');
      el.className = 'ai-msg ai-msg-' + type;
      el.textContent = text;
      chatMessages.appendChild(el);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function botReply(userText) {
      var q = (userText || '').toLowerCase();
      if (/giá|báo giá|chi phí|bao nhiêu|gói/.test(q)) {
        return 'Website trọn gói bắt đầu từ khoảng 2.200.000đ (Basic). Gói Business ~10.999.000đ phù hợp doanh nghiệp. Bạn có thể xem chi tiết tại mục Bảng giá hoặc để lại SĐT để tư vấn.';
      }
      if (/seo|google|tìm kiếm/.test(q)) {
        return 'Chúng tôi thiết kế chuẩn SEO on-page, cấu trúc heading rõ ràng, tối ưu tốc độ và Core Web Vitals. Bạn muốn ưu tiên SEO hay UI trước?';
      }
      if (/tốc độ|nhanh|tối ưu|page ?speed|mobile/.test(q)) {
        return 'Dịch vụ tối ưu giúp cải thiện Mobile & Desktop Speed, giảm tỷ lệ thoát và nâng điểm PageSpeed. Bạn đang gặp chậm trên mobile hay desktop?';
      }
      if (/liên hệ|phone|sđt|zalo|email/.test(q)) {
        return 'Bạn có thể liên hệ qua số điện thoại hoặc form Liên hệ ở cuối trang. Hoặc mô tả nhu cầu website để tôi gợi ý gói phù hợp.';
      }
      if (/xin chào|hello|hi\b|chào/.test(q)) {
        return 'Chào bạn! Mình có thể hỗ trợ về thiết kế website, báo giá, SEO và tối ưu tốc độ. Bạn đang cần gì trước?';
      }
      return 'Cảm ơn câu hỏi của bạn. Honize hỗ trợ thiết kế website chuyên nghiệp, responsive, SEO và tối ưu tốc độ. Bạn muốn xem bảng giá, mẫu dự án hay tư vấn UI/UX?';
    }

    if (chatForm && chatInput) {
      chatForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var text = chatInput.value.trim();
        if (!text) return;
        appendMessage(text, 'me');
        chatInput.value = '';
        setTimeout(function () {
          appendMessage(botReply(text), 'bot');
        }, 450 + Math.random() * 350);
      });
    }
  });
})();
