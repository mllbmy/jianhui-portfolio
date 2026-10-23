/* 庄剑辉 · 个人作品集 — 交互与滚动编排 */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const C = window.SITE_CONTENT || { methods: [], research: [], honors: [], detailData: {} };

  /* ---------- 标题按行遮罩升起 ---------- */
  $$('.display').forEach(h => {
    const lines = h.innerHTML.split(/<br\s*\/?>/i);
    h.innerHTML = lines.map(t => '<span class="ln"><i>' + t + '</i></span>').join('');
  });

  /* ---------- 内容渲染 ---------- */
  const split = (marker) => {
    const m = String(marker).split('/');
    return [m[0].trim(), (m[1] || '').trim()];
  };

  const steps = $('#method-steps');
  if (steps) {
    steps.innerHTML = C.methods.map((m, i) => {
      const [n, label] = split(m[0]);
      return '<li class="step rv" style="--i:' + i + '"><span class="n">' + n + ' — ' + label + '</span><h3>' + m[1] + '</h3><p>' + m[2] + '</p></li>';
    }).join('');
  }

  const timeline = $('#research-steps');
  if (timeline) {
    timeline.innerHTML = C.research.map((r) => {
      const [n, label] = split(r[0]);
      return '<li class="rv"><span class="n">' + n + ' — ' + label + '</span><h3>' + r[1] + '</h3><p>' + r[2] + '</p></li>';
    }).join('');
  }

  const honorList = $('#honor-list');
  if (honorList) {
    honorList.innerHTML = C.honors.map((h) => (
      '<article class="honor rv"><p>' + h.event + '</p><b>' + h.result + '</b><em>' + h.task + '</em><p class="practice">' + h.practice + '</p></article>'
    )).join('');
  }

  /* ---------- 证书 ---------- */
  let certificates = [];
  let certIndex = 0;
  const certReady = fetch('assets/certificates.json?v=8')
    .then(r => { if (!r.ok) throw new Error('cert'); return r.json(); })
    .then(d => { certificates = d; return d; })
    .catch(() => { certificates = []; return []; });

  certReady.then(list => {
    const gallery = $('#cert-gallery');
    if (!gallery || !list.length) return;
    gallery.innerHTML = list.map((c, i) => (
      '<button class="cert rv" data-cert="' + i + '" aria-label="查看' + c.title + '证书"><img src="' + c.image + '" alt="' + c.title + '" loading="lazy"><span>' + c.title + '</span></button>'
    )).join('');
    observe($$('.cert'));
  });

  /* ---------- 弹层 ---------- */
  const detailDialog = $('#detail-dialog');
  const certDialog = $('#certificate-dialog');

  function openDialog(d) {
    if (typeof d.showModal === 'function') d.showModal();
    else d.setAttribute('open', '');
    document.documentElement.classList.add('is-locked');
  }
  function closeDialog(d) {
    if (typeof d.close === 'function') d.close();
    else d.removeAttribute('open');
    document.documentElement.classList.remove('is-locked');
  }
  $$('[data-close]').forEach(b => b.addEventListener('click', () => closeDialog($('#' + b.dataset.close))));
  $$('dialog').forEach(d => d.addEventListener('click', e => { if (e.target === d) closeDialog(d); }));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') $$('dialog[open]').forEach(closeDialog); });

  function renderCertificate(i) {
    if (!certificates.length) return;
    certIndex = (i + certificates.length) % certificates.length;
    const c = certificates[certIndex];
    $('#certificate-title').textContent = c.title;
    const img = $('#certificate-image');
    img.src = c.image; img.alt = c.title + '，' + c.award;
    $('#certificate-caption').textContent = c.award;
  }

  async function openDetail(key) {
    await certReady;
    if (key === 'honors') {
      $('#detail-label').textContent = '竞赛经历与认证';
      $('#detail-title').textContent = '获奖背后的任务与实践';
      const box = document.createElement('div');
      box.className = 'detail-grid';
      certificates.forEach(c => {
        const a = document.createElement('article');
        a.className = 'award-entry';
        a.innerHTML = '<h4>' + c.title + '</h4><p>' + c.award + '</p>' + (c.note ? '<p>' + c.note + '</p>' : '');
        box.appendChild(a);
      });
      const host = $('#detail-content');
      host.innerHTML = '';
      host.appendChild(box);
    } else {
      const d = C.detailData[key];
      if (!d) return;
      $('#detail-label').textContent = d.label;
      $('#detail-title').textContent = d.title;
      $('#detail-content').innerHTML = d.html;
    }
    if (!detailDialog.open) openDialog(detailDialog);
    $('.modal-scroll').scrollTop = 0;
  }

  document.addEventListener('click', async e => {
    const d = e.target.closest('[data-detail]');
    if (d) { openDetail(d.dataset.detail); return; }
    const p = e.target.closest('[data-proof]');
    if (p) {
      await certReady;
      const i = certificates.findIndex(c => c.id === p.dataset.proof);
      if (i < 0) { toast('证书暂未加载，请稍后重试'); return; }
      renderCertificate(i); openDialog(certDialog); return;
    }
    const c = e.target.closest('[data-cert]');
    if (c) { renderCertificate(Number(c.dataset.cert)); openDialog(certDialog); return; }
  });
  const prev = $('#certificate-prev'), next = $('#certificate-next');
  if (prev) prev.addEventListener('click', () => renderCertificate(certIndex - 1));
  if (next) next.addEventListener('click', () => renderCertificate(certIndex + 1));

  /* ---------- 手机界面切换 ---------- */
  const phoneAssets = ['home', 'navigation', 'guard'];
  $$('[data-phone]').forEach(b => b.addEventListener('click', () => {
    const i = Number(b.dataset.phone);
    const img = $('#phone-main-image');
    if (img) img.src = 'assets/images/soundlane-' + phoneAssets[i] + '.jpg';
    $$('.phone-switch button').forEach((p, n) => p.setAttribute('aria-pressed', String(n === i)));
  }));

  /* ---------- 复制邮箱 ---------- */
  let toastTimer;
  function toast(msg) {
    const t = $('.toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
  }
  const copyBtn = $('.copy');
  if (copyBtn) copyBtn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText('3282016034@qq.com'); toast('邮箱已复制'); }
    catch { toast('请手动复制：3282016034@qq.com'); }
  });

  /* ---------- 滚动露出 ---------- */
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        entries.forEach(en => {
          if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 })
    : null;
  function observe(list) {
    list.forEach((el, i) => {
      if (!el) return;
      el.style.setProperty('--i', String(i % 6));
      if (io) io.observe(el); else el.classList.add('in');
    });
  }
  observe($$('.rv'));
  observe($$('.display'));
  observe($$('.project-media'));

  /* ---------- 阅读进度 ---------- */
  const bar = $('.progress i');
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const h = document.documentElement.scrollHeight - innerHeight;
      const p = h > 0 ? Math.min(1, Math.max(0, scrollY / h)) : 0;
      if (bar) bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
      ticking = false;
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 导航高亮 ---------- */
  const links = $$('.nav-links a');
  const targets = links.map(a => $(a.hash)).filter(Boolean);
  if (targets.length && 'IntersectionObserver' in window) {
    const navIo = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        links.forEach(a => a.classList.toggle('is-active', a.hash === '#' + en.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    targets.forEach(t => navIo.observe(t));
  }

  /* ---------- 侧边索引 ---------- */
  const rail = $('.rail');
  if (rail) {
    const ids = ['hero', 'method', 'work', 'research', 'honors', 'contact'];
    rail.innerHTML = ids.map((id) => {
      const sec = document.getElementById(id);
      const num = sec && sec.querySelector('.kicker span') ? sec.querySelector('.kicker span').textContent.trim() : '';
      const name = sec && sec.querySelector('.kicker') ? sec.querySelector('.kicker').textContent.replace(num, '').trim() : id;
      return '<a href="#' + id + '" data-rail="' + id + '" aria-label="' + name + '">' + num + '</a>';
    }).join('');
    if ('IntersectionObserver' in window) {
      const spy = new IntersectionObserver((entries) => {
        entries.forEach(en => {
          if (!en.isIntersecting) return;
          $$('.rail a').forEach(a => a.classList.toggle('is-on', a.dataset.rail === en.target.id));
        });
      }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
      ids.forEach(id => { const el = document.getElementById(id); if (el) spy.observe(el); });
    }
  }

  /* ---------- 光标 ---------- */
  const cursor = $('.cursor');
  if (cursor && matchMedia('(pointer:fine)').matches) {
    const dot = $('.dot', cursor), ring = $('.ring', cursor);
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('pointermove', e => {
      mx = e.clientX; my = e.clientY;
      cursor.classList.add('on');
      dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
      cursor.classList.toggle('is-hot', !!e.target.closest('a,button,.cert,.phone'));
    }, { passive: true });
    (function loop() {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- 跳转 ---------- */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const el = $(a.hash);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', a.hash);
  });
})();
