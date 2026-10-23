(() => {
  'use strict';
  const stage = document.querySelector('.product-showcase');
  const art = stage.querySelector('.stage-art');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const options = {
    overview: { type: '我的作品', title: '从需求，到有成果的作品。', href: '#projects', action: '查看构建与成果', awardLabel: '两个项目，独立开发', award: '以作品证明能力' },
    career: { type: '职业规划智能体 / 独立开发', title: '从企业命题，到独立构建的网站。', href: '#career-case', action: '构建与成果', awardLabel: '服务外包创新创业大赛', award: '全国赛三等奖' },
    soundlane: { type: 'SoundLane / 独立完成', title: '从用户问题，到完整作品流程。', href: '#soundlane-case', action: '构建与成果', awardLabel: '中国高校计算机大赛', award: '华南赛区一等奖' },
    research: { type: 'Python 与多 AI 协作研究', title: '数据、模型、验证，推进到完整稿件。', href: '#research', action: '研究过程', awardLabel: 'Journal of Mountain Science', award: '第一作者 · 期刊投稿中' }
  };
  function setFocus(key) {
    const selected = options[key]; if (!selected) return;
    stage.dataset.focus = key;
    stage.querySelectorAll('.stage-dock button').forEach(button => { const active = button.dataset.focus === key; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); });
    document.querySelector('#stage-type').textContent = selected.type;
    document.querySelector('#stage-title').textContent = selected.title;
    document.querySelector('#stage-award-label').textContent = selected.awardLabel;
    document.querySelector('#stage-award-value').textContent = selected.award;
    const link = document.querySelector('#stage-open');
    link.href = selected.href; link.querySelector('span').textContent = selected.action; link.setAttribute('aria-label', selected.action + '：' + selected.title);
    if (selected.href.startsWith('#')) { link.removeAttribute('target'); link.removeAttribute('rel'); }
    else { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
  }
  stage.querySelectorAll('.stage-dock button').forEach(button => button.addEventListener('click', () => setFocus(button.dataset.focus)));
  stage.querySelectorAll('[data-object]').forEach(button => button.addEventListener('click', () => setFocus(button.dataset.object)));
  document.addEventListener('portfolio:chapter', event => setFocus(['overview','career','soundlane','research'][event.detail.chapter]));
  function sizeStage() { const box = art.getBoundingClientRect(); const scale = Math.min(box.width / 650, box.height / 540) * 1.03; stage.style.setProperty('--scene-scale', Math.max(.1, scale).toFixed(4)); }
  new ResizeObserver(sizeStage).observe(art); sizeStage();
  stage.querySelector('.stage-hint').textContent = coarse ? '点选作品，查看真实界面与成果' : '点击切换作品 · 移动鼠标查看空间层次';
  setFocus('overview');
  window.portfolioGraphics = 'spatial-projects';
  if (reduced) return;
  let visible = true, raf = 0, previousTime = 0;
  const target = {x:0,y:0}, current = {x:0,y:0,drift:0,spread:0};
  if (!coarse) {
    stage.addEventListener('pointermove', event => { const box=stage.getBoundingClientRect(); target.x=((event.clientX-box.left)/box.width-.5)*8; target.y=-((event.clientY-box.top)/box.height-.5)*6; });
    stage.addEventListener('pointerleave', () => { target.x=0; target.y=0; });
  }
  function render(now) {
    if (!visible || document.hidden || window.portfolioStaticStory) { raf=0; return; }
    if (now-previousTime < (coarse?32:16)) { raf=requestAnimationFrame(render); return; } previousTime=now;
    const progress=window.portfolioProgress||0, local=(progress*4)%1;
    current.x+=(target.x-current.x)*.07; current.y+=(target.y-current.y)*.07;
    current.drift+=(Math.sin(local*Math.PI)*-16-current.drift)*.055;
    current.spread+=(Math.sin(local*Math.PI)-current.spread)*.055;
    stage.style.setProperty('--pointer-x',current.x.toFixed(3)+'deg'); stage.style.setProperty('--pointer-y',current.y.toFixed(3)+'deg');
    stage.style.setProperty('--travel',current.drift.toFixed(2)+'px'); stage.style.setProperty('--spread',current.spread.toFixed(3));
    raf=requestAnimationFrame(render);
  }
  function resume(){if(visible&&!document.hidden&&!raf){previousTime=0;raf=requestAnimationFrame(render);}}
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;resume();}).observe(document.querySelector('.story'));
  document.addEventListener('visibilitychange',resume);addEventListener('resize',resume,{passive:true});resume();
})();
