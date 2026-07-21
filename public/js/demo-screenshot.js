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
    if (!selector) return document.body;
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
    document.documentElement.style.setProperty('width', px, 'important');
    document.documentElement.style.setProperty('min-width', px, 'important');
    document.body.style.setProperty('width', px, 'important');
    document.body.style.setProperty('min-width', px, 'important');
  }

  function clearCaptureViewport() {
    document.documentElement.style.removeProperty('width');
    document.documentElement.style.removeProperty('min-width');
    document.body.style.removeProperty('width');
    document.body.style.removeProperty('min-width');
  }

  function waitForCaptureAssets() {
    var fontsReady =
      document.fonts && document.fonts.ready
        ? document.fonts.ready.catch(function () {})
        : Promise.resolve();
    var imagesReady = Array.prototype.map.call(document.images, function (image) {
      if (image.complete) return Promise.resolve();
      return new Promise(function (resolve) {
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', resolve, { once: true });
      });
    });

    return Promise.all([fontsReady, Promise.all(imagesReady)]).then(function () {
      return new Promise(function (resolve) {
        requestAnimationFrame(function () {
          requestAnimationFrame(resolve);
        });
      });
    });
  }

  /**
   * html2canvas can create a temporary 0×0 canvas for zero-sized decorative
   * elements, then pass it to createPattern(). Chromium rejects that source.
   */
  function renderWithSafePatterns(render) {
    var proto = window.CanvasRenderingContext2D && window.CanvasRenderingContext2D.prototype;
    if (!proto || !proto.createPattern) return render();

    var originalCreatePattern = proto.createPattern;
    var transparentPixel = document.createElement('canvas');
    transparentPixel.width = 1;
    transparentPixel.height = 1;

    proto.createPattern = function (source, repetition) {
      if (
        source &&
        source.tagName === 'CANVAS' &&
        (!source.width || !source.height)
      ) {
        return originalCreatePattern.call(this, transparentPixel, repetition);
      }
      return originalCreatePattern.call(this, source, repetition);
    };

    return Promise.resolve()
      .then(render)
      .finally(function () {
        proto.createPattern = originalCreatePattern;
      });
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
    var outputWidth = data.outputWidth || viewportWidth;
    var viewportHeight = Math.max(1, Math.round(data.viewportHeight || window.innerHeight));
    var pixelRatio = Math.min(data.pixelRatio || 1, 2);
    var exportWidth;
    var exportHeight;
    var captureHeight;

    Promise.resolve()
      .then(function () {
        window.scrollTo(0, 0);
        applyCaptureViewport(viewportWidth);
        return waitForCaptureAssets();
      })
      .then(function () {
        return loadHtml2Canvas();
      })
      .then(function (html2canvas) {
        var target = findCaptureTarget(data.selector);
        if (!target) throw new Error('Không tìm thấy vùng chụp trên demo');

        var documentHeight = Math.max(
          document.documentElement.scrollHeight,
          document.documentElement.offsetHeight,
          document.body.scrollHeight,
          document.body.offsetHeight,
        );
        captureHeight = data.fullPage ? documentHeight : viewportHeight;
        exportWidth = Math.round(outputWidth * pixelRatio);
        exportHeight = Math.round((data.outputHeight || captureHeight) * pixelRatio);

        return renderWithSafePatterns(function () {
          return html2canvas(target, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: data.fullPage ? '#ffffff' : null,
            scale: pixelRatio,
            scrollX: 0,
            scrollY: 0,
            width: viewportWidth,
            height: data.captureViewport || data.fullPage
              ? captureHeight
              : Math.min(captureHeight, Math.max(target.scrollHeight, target.offsetHeight)),
            windowWidth: viewportWidth,
            windowHeight: viewportHeight,
            onclone: function (clonedDocument) {
              Array.prototype.forEach.call(
                clonedDocument.querySelectorAll('canvas'),
                function (canvas) {
                  if (!canvas.width || !canvas.height) canvas.style.display = 'none';
                },
              );
            },
          });
        }).then(function (canvas) {
          if (!canvas.width || !canvas.height) {
            throw new Error('Vùng chụp chưa có kích thước');
          }
          return fitCanvas(canvas, exportWidth, exportHeight, data.objectPosition || 'top center');
        });
      })
      .then(function (canvas) {
        var mimeType = data.fullPage ? 'image/jpeg' : 'image/png';
        var dataUrl = canvas.toDataURL(mimeType, 0.9);
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
