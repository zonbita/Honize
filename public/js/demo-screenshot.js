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
      var settled = false;
      var timer = setTimeout(function () {
        if (settled) return;
        settled = true;
        reject(new Error('Tải html2canvas quá lâu'));
      }, 15000);
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
      script.async = true;
      script.onload = function () {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (window.html2canvas) resolve(window.html2canvas);
        else reject(new Error('Không tải được html2canvas'));
      };
      script.onerror = function () {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
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

  function withTimeout(promise, ms) {
    return new Promise(function (resolve) {
      var settled = false;
      var timer = setTimeout(function () {
        if (settled) return;
        settled = true;
        resolve();
      }, ms);
      Promise.resolve(promise).then(
        function () {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          resolve();
        },
        function () {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          resolve();
        },
      );
    });
  }

  function waitForCaptureAssets() {
    // Lazy images below the fold never fire load until scrolled into view —
    // force them to start loading, then wait briefly (never hang forever).
    Array.prototype.forEach.call(document.images, function (image) {
      try {
        if (image.loading === 'lazy') image.loading = 'eager';
        if (!image.complete && image.dataset && image.dataset.src && !image.getAttribute('src')) {
          image.src = image.dataset.src;
        }
      } catch (err) {
        /* ignore */
      }
    });

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

    return withTimeout(Promise.all([fontsReady, Promise.all(imagesReady)]), 5000).then(
      function () {
        return new Promise(function (resolve) {
          requestAnimationFrame(function () {
            requestAnimationFrame(resolve);
          });
        });
      },
    );
  }

  function pickGradientFallbackColor(style) {
    var bg = (style && style.backgroundImage) || '';
    var hex = bg.match(/#(?:[0-9a-fA-F]{3,4}){1,2}\b/);
    if (hex) return hex[0];
    var rgb = bg.match(/rgba?\([^)]+\)/);
    if (rgb) return rgb[0];
    return '#c9a227';
  }

  /**
   * html2canvas does not support background-clip:text — it paints the full
   * gradient as a solid block (e.g. HRM "Hiện đại & Hiệu quả").
   */
  function flattenBackgroundClipText(clonedDocument) {
    if (!clonedDocument || !clonedDocument.body || !document.body) return;
    var originals = document.body.querySelectorAll('*');
    var clones = clonedDocument.body.querySelectorAll('*');
    var len = Math.min(originals.length, clones.length);
    for (var i = 0; i < len; i++) {
      var style = window.getComputedStyle(originals[i]);
      var clip = style.webkitBackgroundClip || style.backgroundClip;
      if (clip !== 'text') continue;
      var color = pickGradientFallbackColor(style);
      var clone = clones[i];
      clone.style.setProperty('background', 'none', 'important');
      clone.style.setProperty('background-image', 'none', 'important');
      clone.style.setProperty('-webkit-background-clip', 'border-box', 'important');
      clone.style.setProperty('background-clip', 'border-box', 'important');
      clone.style.setProperty('color', color, 'important');
      clone.style.setProperty('-webkit-text-fill-color', color, 'important');
    }
  }

  function revealAosInClone(clonedDocument) {
    Array.prototype.forEach.call(
      clonedDocument.querySelectorAll('[data-aos]'),
      function (el) {
        el.classList.add('aos-animate');
        el.style.setProperty('opacity', '1', 'important');
        el.style.setProperty('transform', 'none', 'important');
        el.style.setProperty('visibility', 'visible', 'important');
      },
    );
  }

  function prepareCloneForCapture(clonedDocument) {
    Array.prototype.forEach.call(
      clonedDocument.querySelectorAll('canvas'),
      function (canvas) {
        if (!canvas.width || !canvas.height) canvas.style.display = 'none';
      },
    );
    Array.prototype.forEach.call(
      clonedDocument.querySelectorAll(
        '.oris-sticky-call, .vivu-float, [data-demo-capture-hide]',
      ),
      function (el) {
        el.style.display = 'none';
      },
    );
    flattenBackgroundClipText(clonedDocument);
    revealAosInClone(clonedDocument);
  }

  function replyToParent(source, origin, payload) {
    if (!source) return false;
    var target = origin && origin !== 'null' ? origin : '*';
    try {
      source.postMessage(payload, target);
      return true;
    } catch (err) {
      try {
        source.postMessage(payload, '*');
        return true;
      } catch (err2) {
        return false;
      }
    }
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

  function maybeDownscaleCanvas(source, maxWidth, maxHeight) {
    var sw = source.width;
    var sh = source.height;
    if (!sw || !sh) return source;
    var scale = Math.min(1, maxWidth / sw, maxHeight / sh);
    if (scale >= 0.999) return source;

    var canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(sw * scale));
    canvas.height = Math.max(1, Math.round(sh * scale));
    var ctx = canvas.getContext('2d');
    if (!ctx) return source;
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    return canvas;
  }

  function canvasToBlob(canvas, mimeType, quality) {
    return new Promise(function (resolve, reject) {
      if (canvas.toBlob) {
        canvas.toBlob(
          function (blob) {
            if (blob) resolve(blob);
            else reject(new Error('Không tạo được blob ảnh'));
          },
          mimeType,
          quality,
        );
        return;
      }
      try {
        var dataUrl = canvas.toDataURL(mimeType, quality);
        var parts = dataUrl.split(',');
        var binary = atob(parts[1] || '');
        var buffer = new Uint8Array(binary.length);
        for (var i = 0; i < binary.length; i++) buffer[i] = binary.charCodeAt(i);
        resolve(new Blob([buffer], { type: mimeType }));
      } catch (err) {
        reject(err);
      }
    });
  }

  function uploadCaptureBlob(blob, mimeType) {
    var extension = mimeType === 'image/jpeg' ? 'jpg' : 'png';
    var formData = new FormData();
    formData.append('file', blob, 'demo-thumbnail.' + extension);
    return fetch('/api/upload', {
      method: 'POST',
      body: formData,
      credentials: 'same-origin',
    }).then(function (res) {
      return res.json().then(function (payload) {
        if (!res.ok) {
          throw new Error((payload && payload.message) || 'Upload thất bại');
        }
        if (!payload || !payload.url) {
          throw new Error('Upload không trả về URL');
        }
        return payload.url;
      });
    });
  }

  function blobToDataUrl(blob) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.onerror = function () {
        reject(new Error('Không đọc được blob ảnh'));
      };
      reader.readAsDataURL(blob);
    });
  }

  function notifyParentReady() {
    if (!window.parent || window.parent === window) return;
    try {
      window.parent.postMessage({ type: 'demo-capture-ready' }, '*');
    } catch (err) {
      /* ignore */
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', notifyParentReady);
  } else {
    notifyParentReady();
  }
  window.addEventListener('load', notifyParentReady);

  window.addEventListener('message', function (event) {
    var data = event.data;
    if (!data) return;

    if (data.type === 'demo-capture-ping') {
      notifyParentReady();
      return;
    }

    if (data.type !== 'demo-capture') return;

    // Parent may have clicked before this listener existed; always answer.
    if (!event.source) return;

    replyToParent(event.source, event.origin, {
      type: 'demo-capture-progress',
      stage: 'started',
    });

    var viewportWidth = data.viewportWidth || SCREENSHOT_VIEWPORT;
    var outputWidth = data.outputWidth || viewportWidth;
    var viewportHeight = Math.max(1, Math.round(data.viewportHeight || window.innerHeight));
    var pixelRatio = Math.min(data.pixelRatio || 1, 2);
    var exportWidth;
    var exportHeight;
    var captureHeight;
    var maxCaptureHeight = Math.max(1, data.maxCaptureHeight || 8000);

    Promise.resolve()
      .then(function () {
        window.scrollTo(0, 0);
        applyCaptureViewport(viewportWidth);
        return waitForCaptureAssets();
      })
      .then(function () {
        replyToParent(event.source, event.origin, {
          type: 'demo-capture-progress',
          stage: 'rendering',
        });
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
        captureHeight = data.fullPage
          ? Math.min(documentHeight, maxCaptureHeight)
          : viewportHeight;
        exportWidth = Math.round(outputWidth * pixelRatio);
        exportHeight = Math.round((data.outputHeight || captureHeight) * pixelRatio);

        // Full-page: render already near thumbnail size to avoid multi‑MB canvases.
        var renderScale = pixelRatio;
        if (data.fullPage) {
          var maxW = data.maxOutputWidth || 1280;
          var maxH = data.maxOutputHeight || 2400;
          renderScale = Math.min(
            pixelRatio,
            maxW / Math.max(1, viewportWidth),
            maxH / Math.max(1, captureHeight),
          );
          renderScale = Math.max(0.2, renderScale);
        }

        return renderWithSafePatterns(function () {
          return html2canvas(target, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: data.fullPage ? '#ffffff' : null,
            logging: false,
            imageTimeout: 5000,
            scale: renderScale,
            scrollX: 0,
            scrollY: 0,
            width: viewportWidth,
            height: data.captureViewport || data.fullPage
              ? captureHeight
              : Math.min(captureHeight, Math.max(target.scrollHeight, target.offsetHeight)),
            windowWidth: viewportWidth,
            windowHeight: viewportHeight,
            onclone: function (clonedDocument) {
              prepareCloneForCapture(clonedDocument);
            },
          });
        }).then(function (canvas) {
          if (!canvas.width || !canvas.height) {
            throw new Error('Vùng chụp chưa có kích thước');
          }
          // Full-page thumbs: keep html2canvas output and downscale later.
          // Avoid a second full-height canvas that can OOM / blow postMessage.
          if (data.fullPage && !data.outputHeight) {
            return canvas;
          }
          return fitCanvas(canvas, exportWidth, exportHeight, data.objectPosition || 'top center');
        });
      })
      .then(function (canvas) {
        var mimeType = data.fullPage ? 'image/jpeg' : 'image/png';
        var quality = data.fullPage ? 0.78 : 0.9;
        var prepared = maybeDownscaleCanvas(
          canvas,
          data.maxOutputWidth || (data.fullPage ? 1280 : exportWidth),
          data.maxOutputHeight || (data.fullPage ? 2400 : exportHeight),
        );

        return canvasToBlob(prepared, mimeType, quality).then(function (blob) {
          if (!blob || !blob.size) {
            throw new Error('Không tạo được file ảnh từ vùng chụp');
          }

          // Prefer upload inside the iframe so we never postMessage a huge data URL.
          return uploadCaptureBlob(blob, mimeType)
            .then(function (url) {
              replyToParent(event.source, event.origin, {
                type: 'demo-capture-result',
                ok: true,
                url: url,
              });
            })
            .catch(function () {
              if (
                replyToParent(event.source, event.origin, {
                  type: 'demo-capture-result',
                  ok: true,
                  blob: blob,
                })
              ) {
                return;
              }
              // Last resort: heavily compressed data URL (may still fail if huge).
              var tiny = maybeDownscaleCanvas(prepared, 960, 1600);
              return canvasToBlob(tiny, 'image/jpeg', 0.62).then(function (smallBlob) {
                return blobToDataUrl(smallBlob).then(function (dataUrl) {
                  replyToParent(event.source, event.origin, {
                    type: 'demo-capture-result',
                    ok: true,
                    dataUrl: dataUrl,
                  });
                });
              });
            });
        });
      })
      .catch(function (err) {
        replyToParent(event.source, event.origin, {
          type: 'demo-capture-result',
          ok: false,
          error: err && err.message ? err.message : 'Chụp ảnh thất bại',
        });
      })
      .finally(function () {
        clearCaptureViewport();
      });
  });
})();
