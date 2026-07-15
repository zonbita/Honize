(function () {
  var form = document.querySelector('.contact-form');
  if (!form) return;

  var messages = {
    name: {
      valueMissing: 'Vui lòng nhập họ và tên.',
      tooShort: 'Họ và tên cần ít nhất 2 ký tự.',
    },
    email: {
      valueMissing: 'Vui lòng nhập email.',
      typeMismatch: 'Email không hợp lệ.',
      patternMismatch: 'Email không hợp lệ.',
    },
    phone: {
      valueMissing: 'Vui lòng nhập số điện thoại.',
      tooShort: 'Số điện thoại không hợp lệ.',
    },
    subject: {
      valueMissing: 'Vui lòng nhập chủ đề.',
    },
    message: {
      valueMissing: 'Vui lòng nhập nội dung.',
      tooShort: 'Nội dung cần ít nhất 10 ký tự.',
    },
  };

  function vietnameseMessage(el) {
    var rules = messages[el.name] || {};
    var v = el.validity;
    if (v.valueMissing) return rules.valueMissing || 'Vui lòng điền trường này.';
    if (v.typeMismatch) return rules.typeMismatch || 'Giá trị không đúng định dạng.';
    if (v.patternMismatch) return rules.patternMismatch || 'Giá trị không đúng định dạng.';
    if (v.tooShort) return rules.tooShort || 'Nội dung quá ngắn.';
    if (v.tooLong) return 'Nội dung quá dài.';
    return 'Vui lòng kiểm tra lại thông tin.';
  }

  function refreshValidity(el) {
    if (!el || !el.willValidate) return;
    el.setCustomValidity('');
    if (!el.checkValidity()) {
      el.setCustomValidity(vietnameseMessage(el));
    }
  }

  form.querySelectorAll('input, textarea, select').forEach(function (el) {
    el.addEventListener('invalid', function () {
      refreshValidity(el);
    });
    el.addEventListener('input', function () {
      el.setCustomValidity('');
    });
    el.addEventListener('blur', function () {
      refreshValidity(el);
    });
  });

  form.addEventListener('submit', function (e) {
    var firstInvalid = null;
    form.querySelectorAll('input, textarea, select').forEach(function (el) {
      refreshValidity(el);
      if (!el.checkValidity() && !firstInvalid) firstInvalid = el;
    });
    if (firstInvalid) {
      e.preventDefault();
      firstInvalid.focus();
      firstInvalid.reportValidity();
    }
  });
})();
