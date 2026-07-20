(function () {
  var SCREENSHOT_VIEWPORT = 1280;
  var params = new URLSearchParams(window.location.search);

  if (params.has('screenshot')) {
    document.documentElement.classList.add('demo-screenshot-mode');
    window.__DEMO_DISABLE_AOS__ = true;
    window.scrollTo(0, 0);

    var style = document.createElement('style');
    style.id = 'demo-screenshot-viewport';
    style.textContent =
      'html.demo-screenshot-mode, html.demo-screenshot-mode body {' +
      'min-width: ' +
      SCREENSHOT_VIEWPORT +
      'px !important;' +
      '}';
    document.head.appendChild(style);
  }

  function loadHtml2Canvas() {
    if (window.html2canvas) return Promise.resolve(window.html2canvas);
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
      script.async = true;
      script.onload = function () {
        if (window.html2canvas) resolve(window.html2canvas);
        else reject(new Error('Không tải được html2canvas'));
      };
      script.onerror = function () {
        reject(new Error('Không tải được html2canvas'));
      };
      document.head.appendChild(script);
    });
  }

  function findCaptureTarget(selector) {
    if (selector) {
      var explicit = document.querySelector(selector);
      if (explicit) return explicit;
    }
    return (
      document.querySelector('.vivu-hero') ||
      document.querySelector('.tmv-hero') ||
      document.querySelector('#home') ||
      document.querySelector('section')
    );
  }

  function applyCaptureViewport(width) {
    var px = width + 'px';
    document.documentElement.style.width = px;
    document.documentElement.style.minWidth = px;
    document.body.style.width = px;
    document.body.style.minWidth = px;
  }

  function clearCaptureViewport() {
    document.documentElement.style.width = '';
    document.documentElement.style.minWidth = '';
    document.body.style.width = '';
    document.body.style.minWidth = '';
  }

  /** Cover-crop like object-cover; default aligns to top center (project cards). */
  function fitCanvas(source, width, height, objectPosition) {
    var sw = source.width;
    var sh = source.height;
    if (!sw || !sh || !width || !height) return source;

    var pos = objectPosition || 'top center';
    var alignY = pos.indexOf('bottom') >= 0 ? 'bottom' : pos.indexOf('center') >= 0 ? 'center' : 'top';
    var alignX = pos.indexOf('right') >= 0 ? 'right' : pos.indexOf('left') >= 0 ? 'left' : 'center';

    var targetAspect = width / height;
    var sourceAspect = sw / sh;
    var sx;
    var sy;
    var sWidth;
    var sHeight;

    if (sourceAspect > targetAspect) {
      sHeight = sh;
      sWidth = Math.round(sh * targetAspect);
      sy = 0;
      if (alignX === 'left') sx = 0;
      else if (alignX === 'right') sx = sw - sWidth;
      else sx = Math.round((sw - sWidth) / 2);
    } else {
      sWidth = sw;
      sHeight = Math.round(sw / targetAspect);
      sx = 0;
      if (alignY === 'top') sy = 0;
      else if (alignY === 'bottom') sy = sh - sHeight;
      else sy = Math.round((sh - sHeight) / 2);
    }

    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');
    if (!ctx) return source;
    ctx.drawImage(source, sx, sy, sWidth, sHeight, 0, 0, width, height);
    return canvas;
  }

  window.addEventListener('message', function (event) {
    var data = event.data;
    if (!data || data.type !== 'demo-capture') return;

    var viewportWidth = data.viewportWidth || SCREENSHOT_VIEWPORT;
    var outputWidth = data.outputWidth || 400;
    var outputHeight = data.outputHeight || 480;
    var pixelRatio = Math.min(data.pixelRatio || window.devicePixelRatio || 1, 2);
    var exportWidth = Math.round(outputWidth * pixelRatio);
    var exportHeight = Math.round(outputHeight * pixelRatio);

    Promise.resolve()
      .then(function () {
        window.scrollTo(0, 0);
        applyCaptureViewport(viewportWidth);
        return loadHtml2Canvas();
      })
      .then(function (html2canvas) {
        var target = findCaptureTarget(data.selector);
        if (!target) throw new Error('Không tìm thấy vùng chụp trên demo');

        return html2canvas(target, {
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
          scale: pixelRatio,
          scrollX: 0,
          scrollY: -window.scrollY,
          windowWidth: viewportWidth,
          windowHeight: Math.max(target.offsetHeight, window.innerHeight),
        }).then(function (canvas) {
          return fitCanvas(canvas, exportWidth, exportHeight, data.objectPosition || 'top center');
        });
      })
      .then(function (canvas) {
        var dataUrl = canvas.toDataURL('image/png', 0.92);
        event.source.postMessage(
          { type: 'demo-capture-result', ok: true, dataUrl: dataUrl },
          event.origin,
        );
      })
      .catch(function (err) {
        event.source.postMessage(
          {
            type: 'demo-capture-result',
            ok: false,
            error: err && err.message ? err.message : 'Chụp ảnh thất bại',
          },
          event.origin,
        );
      })
      .finally(function () {
        clearCaptureViewport();
      });
  });
})();
