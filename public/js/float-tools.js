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
    var chatHistory = [];
    var chatBusy = false;

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
      if (!chatMessages) return null;
      var el = document.createElement('div');
      el.className = 'ai-msg ai-msg-' + type;
      el.textContent = text;
      chatMessages.appendChild(el);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      return el;
    }

    function setTyping(show) {
      if (!chatMessages) return;
      var existing = chatMessages.querySelector('.ai-msg-typing');
      if (existing) existing.remove();
      if (!show) return;
      var el = document.createElement('div');
      el.className = 'ai-msg ai-msg-bot ai-msg-typing';
      el.textContent = 'Đang soạn trả lời…';
      chatMessages.appendChild(el);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function askChatApi(message) {
      return fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          history: chatHistory,
        }),
      }).then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok) {
            throw new Error(
              (data && typeof data.error === 'string' && data.error) ||
                (data && typeof data.message === 'string' && data.message) ||
                'Chat tạm thời không khả dụng.',
            );
          }
          if (!data || !data.reply) {
            throw new Error('Trợ lý AI chưa trả lời được.');
          }
          return data.reply;
        });
      });
    }

    if (chatForm && chatInput) {
      chatForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (chatBusy) return;
        var text = chatInput.value.trim();
        if (!text) return;

        chatBusy = true;
        chatInput.disabled = true;
        appendMessage(text, 'me');
        chatInput.value = '';
        setTyping(true);

        askChatApi(text)
          .then(function (reply) {
            setTyping(false);
            appendMessage(reply, 'bot');
            chatHistory.push({ role: 'user', content: text });
            chatHistory.push({ role: 'assistant', content: reply });
            if (chatHistory.length > 16) {
              chatHistory = chatHistory.slice(-16);
            }
          })
          .catch(function (err) {
            setTyping(false);
            appendMessage(
              (err && err.message) ||
                'Xin lỗi, trợ lý AI tạm thời gián đoạn. Bạn vui lòng thử lại hoặc gửi form tại /lien-he.',
              'bot',
            );
          })
          .finally(function () {
            chatBusy = false;
            chatInput.disabled = false;
            if (isChatOpen()) chatInput.focus();
          });
      });
    }
  });
})();
