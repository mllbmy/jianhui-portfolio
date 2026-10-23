(() => {
  'use strict';
  const scene = document.querySelector('.collaboration-scene');
  const bench = scene.querySelector('.workbench');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const buttons = [...scene.querySelectorAll('[data-scene-step]')];
  const phaseCopy = [
    ['目标由我定义。', '把想法拆成可以推进的任务。', '01 / 需求进入协作流程'],
    ['多 AI，分工推进。', '代码、数据、文稿按任务并行协作。', '02 / 拆解任务，选择工具，分工实现'],
    ['生成之后，由我把关。', '检查结果，整合输出，测试并迭代。', '03 / 人工审核、整合与功能验证'],
    ['让协作，留下真实成果。', '独立完成的项目，是能力的证明。', '04 / 作品产出，成果可以点击查看']
  ];
  const briefs = ['把职业规划需求，做成可运行的网站。','把需求做成作品，也把作品做到能展示。','把复杂工作，拆成可以协作推进的任务。','用 Python 与多 AI 协作，推进研究与验证。'];
  let phase = 0, visible = true, lockedUntil = 0, pointerRaf = 0;
  function setPhase(next, manual = false) {
    phase = next;
    if (manual) lockedUntil = Date.now() + 10000;
    bench.dataset.phase = next;
    buttons.forEach((button, i) => { button.classList.toggle('active', i === next); button.setAttribute('aria-pressed', String(i === next)); });
    document.querySelector('#scene-verb').textContent = phaseCopy[next][0];
    document.querySelector('#scene-explanation').textContent = phaseCopy[next][1];
    document.querySelector('#scene-status').textContent = phaseCopy[next][2];
    bench.classList.remove('phase-pulse');
    if (!reduced) requestAnimationFrame(() => bench.classList.add('phase-pulse'));
  }
  buttons.forEach(button => button.addEventListener('click', () => setPhase(Number(button.dataset.sceneStep), true)));
  scene.querySelector('.scene-replay').addEventListener('click', () => { lockedUntil = 0; setPhase(0); });
  document.addEventListener('portfolio:chapter', event => {
    const chapter = event.detail.chapter;
    document.querySelector('#scene-brief').textContent = briefs[chapter];
    setPhase(chapter === 1 ? 3 : chapter === 2 ? 1 : chapter === 3 ? 2 : 0);
  });
  setPhase(0);
  if (!reduced) setInterval(() => { if (visible && !document.hidden && Date.now() > lockedUntil) setPhase((phase + 1) % 4); }, 4600);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; scene.classList.toggle('scene-paused', !visible); }).observe(document.querySelector('.story'));
  document.addEventListener('visibilitychange', () => scene.classList.toggle('scene-paused', document.hidden || !visible));
  if (!coarse && !reduced) {
    scene.addEventListener('pointermove', event => {
      if (pointerRaf) cancelAnimationFrame(pointerRaf);
      pointerRaf = requestAnimationFrame(() => {
        const rect = scene.getBoundingClientRect(), x = (event.clientX - rect.left) / rect.width - .5, y = (event.clientY - rect.top) / rect.height - .5;
        bench.style.setProperty('--pointer-x', `${x * 8}deg`); bench.style.setProperty('--pointer-y', `${-y * 7}deg`);
        scene.style.setProperty('--light-x', `${(x + .5) * 100}%`); scene.style.setProperty('--light-y', `${(y + .5) * 100}%`);
      });
    });
    scene.addEventListener('pointerleave', () => { bench.style.setProperty('--pointer-x', '0deg'); bench.style.setProperty('--pointer-y', '0deg'); });
    document.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('pointermove', event => { const r = card.getBoundingClientRect(), x = (event.clientX - r.left) / r.width - .5, y = (event.clientY - r.top) / r.height - .5; card.style.transform = `perspective(1200px) rotateX(${-y * 3}deg) rotateY(${x * 4}deg) translateY(-5px)`; });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }
  window.portfolioGraphics = 'interactive-workflow';
})();
