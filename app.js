(() => {
  'use strict';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const compactViewport = matchMedia('(max-height: 550px) and (orientation: landscape)');
  document.documentElement.classList.toggle('static-story', compactViewport.matches);
  window.portfolioStaticStory = compactViewport.matches;
  if (!reducedMotion) document.documentElement.classList.add('js-motion');
  const $ = (s, scope = document) => scope.querySelector(s);
  const $$ = (s, scope = document) => [...scope.querySelectorAll(s)];
  const story = $('#story'), frame = $('.story-frame');
  let chapter = -1, pendingScroll = false;
  function setChapter(next, force = false) {
    if (next === chapter && !force) return;
    chapter = next;
    frame.dataset.chapter = next;
    $$('.chapter').forEach((panel, i) => {
      const active = i === next || reducedMotion || compactViewport.matches;
      panel.classList.toggle('active', active);
      panel.inert = !active;
      panel.setAttribute('aria-hidden', String(!active));
    });
    $$('.chapter-nav button').forEach((button, i) => {
      button.classList.toggle('active', i === next);
      if (i === next) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    document.dispatchEvent(new CustomEvent('portfolio:chapter', { detail: { chapter: next } }));
  }
  function updateScroll() {
    pendingScroll = false;
    const scrollable = document.documentElement.scrollHeight - innerHeight;
    $('.reading-progress').style.transform = `scaleX(${Math.min(1, scrollY / Math.max(1, scrollable))})`;
    const range = story.offsetHeight - innerHeight;
    const progress = Math.max(0, Math.min(.9999, (scrollY - story.offsetTop) / Math.max(1, range)));
    window.portfolioProgress = progress;
    setChapter(Math.min(3, Math.floor(progress * 4)));
  }
  addEventListener('scroll', () => { if (!pendingScroll) { pendingScroll = true; requestAnimationFrame(updateScroll); } }, { passive: true });
  addEventListener('resize', updateScroll, { passive: true });
  compactViewport.addEventListener('change', () => {
    document.documentElement.classList.toggle('static-story', compactViewport.matches);
    window.portfolioStaticStory = compactViewport.matches;
    setChapter(Math.max(0, chapter), true);
    updateScroll();
  });
  $$('.chapter-nav button').forEach(button => button.addEventListener('click', () => {
    const index = Number(button.dataset.go);
    scrollTo({ top: story.offsetTop + (story.offsetHeight - innerHeight) * (index / 4 + .022), behavior: reducedMotion ? 'instant' : 'smooth' });
  }));
  updateScroll();

  const menu = $('.menu-toggle'), nav = $('#main-nav');
  function closeMenu() { menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', '打开导航'); nav.classList.remove('open'); }
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? '关闭导航' : '打开导航'); nav.classList.toggle('open', open);
  });
  $$('a', nav).forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  $$('.detail-toggle').forEach(button => button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(expanded)); $('#' + button.getAttribute('aria-controls')).hidden = !expanded;
  }));

  const workflow = [
    { label: '01 / RESEARCH QUESTION', title: '先确定要回答的问题。', text: '围绕祁连山区域生态安全，研究观测频率与评价、预测可靠性之间的关系，明确数据范围、指标体系与验证思路。', tags: ['研究问题', '指标体系', '实验设计'] },
    { label: '02 / DATA PREPARATION', title: '把原始数据，整理成可分析的输入。', text: '处理 2005–2023 年土地覆盖与气候数据，使用 Python 开展空间对齐、裁剪和指标计算。借助 AI 编写处理代码，由我检查数据与输出结果。', tags: ['Python', 'rasterio / xarray', '空间数据处理'] },
    { label: '03 / MODELS & VALIDATION', title: '比较模型，也检查预测是否可靠。', text: '比较 GM(1,1)、NGBM 与 ARIMA，开展滚动预测验证、敏感性分析及空间对照检查。用验证结果判断适用范围，保留模型未持续优于简单基线的发现。', tags: ['3 类预测模型', '滚动验证', '敏感性分析'] },
    { label: '04 / HUMAN × AI WORKFLOW', title: '我分配任务，也对最终结果负责。', text: '由我驱动 3 个 AI 分工协作，完成代码、数据分析、图表与文稿；汇总不同输出，逐项复核并迭代。研究判断、任务协调和最终稿件由我把关。', tags: ['多 AI 协作', '代码与图表', '人工审核与迭代'] },
    { label: '05 / JOURNAL SUBMISSION', title: '把研究整理成完整的期刊稿件。', text: '完成正文、方法、图表与参考文献的整理，以第一作者向 Journal of Mountain Science 投稿。目前为期刊投稿中，研究流程与实践在此展示。', tags: ['第一作者', 'Journal of Mountain Science', '投稿中'] }
  ];
  const tabs = $$('[data-step]');
  function selectStep(index, focus = false) {
    tabs.forEach((tab, i) => { tab.setAttribute('aria-selected', String(i === index)); tab.tabIndex = i === index ? 0 : -1; });
    const content = workflow[index], panel = $('#workflow-panel');
    panel.setAttribute('aria-labelledby', tabs[index].id);
    $('.panel-label', panel).textContent = content.label;
    $('h4', panel).textContent = content.title; $('p', panel).textContent = content.text;
    $('.workflow-tags', panel).replaceChildren(...content.tags.map(tag => { const span = document.createElement('span'); span.textContent = tag; return span; }));
    if (focus) tabs[index].focus();
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectStep(i));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (i + 1) % tabs.length;
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); selectStep(next, true); }
    });
  });

  const grid = $('#certificate-grid'), dialog = $('#certificate-dialog');
  let certificates = [], visibleCertificates = [], openedIndex = 0, lastCertificateButton;
  function showCertificate(index) {
    openedIndex = (index + visibleCertificates.length) % visibleCertificates.length;
    const certificate = visibleCertificates[openedIndex];
    $('#dialog-image').src = certificate.image;
    $('#dialog-image').alt = certificate.title + '，' + certificate.award;
    $('#certificate-dialog-title').textContent = certificate.title;
    $('#dialog-caption').textContent = `${certificate.award} · ${openedIndex + 1} / ${visibleCertificates.length}`;
  }
  function renderCertificates(filter = 'all') {
    visibleCertificates = certificates.filter(c => filter === 'all' || c.category === filter);
    $('#gallery-count').textContent = visibleCertificates.length;
    grid.replaceChildren(...visibleCertificates.map((certificate, index) => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'certificate-card';
      button.setAttribute('aria-label', '放大查看：' + certificate.title + '，' + certificate.award);
      const wrap = document.createElement('span'); wrap.className = 'certificate-image';
      const img = document.createElement('img'); img.src = certificate.image; img.alt = certificate.title + '证书'; img.width = certificate.width; img.height = certificate.height; img.loading = 'lazy';
      wrap.append(img);
      const title = document.createElement('h3'); title.textContent = certificate.title;
      const caption = document.createElement('p'); caption.textContent = certificate.award;
      button.append(wrap, title, caption);
      button.addEventListener('click', () => { lastCertificateButton = button; showCertificate(index); dialog.showModal(); document.body.classList.add('modal-open'); });
      return button;
    }));
  }
  fetch('assets/certificates.json').then(response => { if (!response.ok) throw new Error('certificate manifest'); return response.json(); }).then(data => { certificates = data; renderCertificates(); }).catch(() => {
    const p = document.createElement('p'); p.textContent = '证书图片暂未加载，请刷新后重试。'; grid.append(p);
  });
  $$('[data-filter]').forEach(button => button.addEventListener('click', () => {
    $$('[data-filter]').forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); }); renderCertificates(button.dataset.filter);
  }));
  $('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); lastCertificateButton?.focus({ preventScroll: true }); });
  dialog.addEventListener('click', event => { if (event.target === dialog) { const bounds = dialog.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close(); } });
  $('#certificate-prev').addEventListener('click', () => showCertificate(openedIndex - 1));
  $('#certificate-next').addEventListener('click', () => showCertificate(openedIndex + 1));
  dialog.addEventListener('keydown', event => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); showCertificate(openedIndex + (event.key === 'ArrowRight' ? 1 : -1)); } });
  let toastTimer;
  $('.copy-email').addEventListener('click', async () => {
    let message;
    try { await navigator.clipboard.writeText('3282016034@qq.com'); message = '邮箱已复制'; }
    catch { message = '联系邮箱：3282016034@qq.com'; }
    const toast = $('.toast'); toast.textContent = message; toast.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('visible'), 3500);
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); } }), { threshold: .08 });
    $$('.reveal').forEach(el => observer.observe(el));
  } else $$('.reveal').forEach(el => el.classList.add('in-view'));

  // The material renderer is isolated in experience.js.
})();
