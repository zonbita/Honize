(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  const nodes = Array.from(document.querySelectorAll('[data-hero-parallax]'));
  if (!nodes.length) return;

  let raf = 0;
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  const onMove = (event) => {
    const { innerWidth, innerHeight } = window;
    targetX = (event.clientX / innerWidth - 0.5) * 2;
    targetY = (event.clientY / innerHeight - 0.5) * 2;
  };

  const tick = () => {
    currentX += (targetX - currentX) * 0.06;
    currentY += (targetY - currentY) * 0.06;

    nodes.forEach((node) => {
      const depth = Number(node.getAttribute('data-hero-parallax') || '0.03');
      const x = currentX * depth * 40;
      const y = currentY * depth * 28;
      node.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
    });

    raf = window.requestAnimationFrame(tick);
  };

  window.addEventListener('pointermove', onMove, { passive: true });
  raf = window.requestAnimationFrame(tick);

  window.addEventListener(
    'pagehide',
    () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
    },
    { once: true },
  );
})();
