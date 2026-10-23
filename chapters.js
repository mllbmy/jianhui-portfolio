(() => {
  'use strict';
  const deck = document.querySelector('.exhibition');
  const pages = [...deck.querySelectorAll('.lift-page')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const landscape = matchMedia('(max-height:550px) and (orientation:landscape)');
  let measurements = [], deckTop = 0, pending = false;
  const clamp = x => Math.max(0, Math.min(1, x));
  function measure() {
    const enabled = !reduced.matches && !landscape.matches;
    document.documentElement.classList.toggle('exhibit-motion', enabled);
    deckTop = deck.getBoundingClientRect().top + scrollY;
    let top = 0;
    measurements = pages.map(page => {
      const height = page.offsetHeight;
      const pin = Math.min(innerWidth <= 760 ? 75 : 90, innerHeight - height - 22);
      page.style.setProperty('--pin-top', pin + 'px');
      const result = {top, height, pin}; top += height + parseFloat(getComputedStyle(page).marginBottom);
      return result;
    });
    render();
  }
  function render() {
    pending = false;
    const enabled = !reduced.matches && !landscape.matches;
    pages.forEach((page, i) => {
      const next = measurements[i + 1];
      const cover = enabled && next ? clamp((innerHeight - (deckTop + next.top - scrollY)) / (innerHeight - 80)) : 0;
      const depth = cover * cover * (3 - 2 * cover);
      page.style.setProperty('--recede-scale', (1 - .065 * depth).toFixed(4));
      page.style.setProperty('--recede-y', (-38 * depth).toFixed(2) + 'px');
      page.style.setProperty('--surface-light', (1 - .27 * depth).toFixed(3));
      page.style.setProperty('--surface-soften', (1.4 * depth).toFixed(2) + 'px');
      page.dataset.covered = cover > .95 ? 'true' : 'false';
    });
  }
  function queue() {if (!pending) {pending = true;requestAnimationFrame(render);}}
  function scrollToTarget(target, behavior = 'smooth') {
    const page = target.closest('.lift-page');
    if (!page) return false;
    const i = pages.indexOf(page);
    const bounds = page.getBoundingClientRect(), scale = bounds.width / page.offsetWidth;
    const local = target === page ? 0 : (target.getBoundingClientRect().top - bounds.top) / scale;
    const y = deckTop + measurements[i].top + Math.max(0, local) - (innerWidth <= 760 ? 75 : 90);
    if(window.portfolioPager && behavior !== 'instant')window.portfolioPager.toY(y);
    else scrollTo({top:y,behavior:reduced.matches ? 'instant' : behavior});
    return true;
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || link.getAttribute('href') === '#') return;
    const target = document.getElementById(decodeURIComponent(link.getAttribute('href').slice(1)));
    if (!target || !scrollToTarget(target)) return;
    event.preventDefault(); history.pushState(null,'',link.getAttribute('href'));
    if (link.classList.contains('skip-link')) {target.tabIndex = -1; target.focus({preventScroll:true});}
  });
  document.addEventListener('focusin', event => {
    const page = event.target.closest('.lift-page');
    if (page?.dataset.covered === 'true') scrollToTarget(event.target,'instant');
  });
  new ResizeObserver(measure).observe(deck);
  pages.forEach(page => new ResizeObserver(measure).observe(page));
  addEventListener('scroll',queue,{passive:true});
  addEventListener('resize',measure,{passive:true});
  reduced.addEventListener('change',measure);landscape.addEventListener('change',measure);
  measure(); document.fonts.ready.then(measure);
  const initial = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if(initial) requestAnimationFrame(() => scrollToTarget(initial,'instant'));

  const achievements = [
    {event:'第八届码蹄杯全国大学生程序设计大赛',title:'把复杂问题，\n拆成可执行的步骤。',result:'国赛银奖 / 省赛金奖',task:'个人赛，在限定时间内完成算法题的设计、编码与调试，通过在线评测检验结果。',practice:'使用 Python 解题；整理题型与解题思路，依据评测反馈检查边界条件、定位错误并反复调试。',growth:'练习问题拆解、程序实现与限时调试，让解题过程更有条理。',proof:'mati-national-silver',alt:'码蹄杯国赛银奖证书'},
    {event:'第十七届中国大学生服务外包创新创业大赛',title:'从企业需求，\n走到独立完成的网站。',result:'全国赛三等奖 / 初赛小组第一名',task:'根据企业提出的要求，开发能够辅助职业探索与规划的智能体作品。',practice:'独立开发职业规划网站，整合岗位探索、晋升转岗路径、成长方案与 AI 简历解析；驱动 TRAE 辅助实现，逐项审核和测试。',growth:'把企业需求拆成具体功能，实践从功能构建到验证迭代的过程。',proof:'outsourcing-national-third',alt:'服务外包创新创业大赛全国赛三等奖证书'},
    {event:'第十一届中国高校计算机大赛移动应用创新赛',title:'从用户问题出发，\n把作品做完整。',result:'启明赛道（高教组）华南赛区一等奖',task:'围绕移动应用创新，完成产品方案、功能实现、测试及作品演示材料。',practice:'独立完成 SoundLane 的需求、交互、AI 辅助编码、测试、文档和答辩；根据用户场景调整功能，形成可运行的交互原型。',growth:'从堆叠功能转向分析使用场景，也练习把作品、方案和个人贡献讲清楚。',proof:'soundlane-mobile-first',alt:'移动应用创新赛华南赛区一等奖证书'},
    {event:'2026年广东省大学生计算机设计大赛',title:'让视觉识别，\n经得起现场检验。',result:'智能机器人视觉系统挑战赛初赛三等奖',task:'围绕机器人视觉识别、标定与抓取场景，完成软硬件联调。',practice:'担任队长。面对现场识别效果与实验室的差异，参与补充光照样本、调整标定参数和现场调试。',growth:'认识到环境变化会影响识别与执行，把真实场景验证纳入后续项目的测试过程。',proof:'robot-vision-third',alt:'智能机器人视觉系统挑战赛获奖证书'}
  ];
  const tabs = [...document.querySelectorAll('[data-achievement]')];
  function select(index, focus=false) {
    const data=achievements[index];
    tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
    document.querySelector('#achievement-panel').setAttribute('aria-labelledby',tabs[index].id);
    for(const key of ['event','title','result','task','practice','growth']) document.getElementById('achievement-'+key).textContent=data[key];
    const image=document.querySelector('#achievement-image');image.src='assets/certificates/'+data.proof+'.jpg';image.alt=data.alt;
    const proof=document.querySelector('.achievement-proof');proof.dataset.proof=data.proof;proof.setAttribute('aria-label','放大查看：'+data.alt);
    if(!reduced.matches) document.querySelector('.achievement-copy').animate([{opacity:.3,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:350,easing:'cubic-bezier(.2,.75,.25,1)'});
    if(focus)tabs[index].focus();
  }
  tabs.forEach((tab,i)=>{
    tab.addEventListener('click',()=>select(i));
    tab.addEventListener('keydown',event=>{
      let next;
      if(event.key==='ArrowRight')next=(i+1)%tabs.length;
      if(event.key==='ArrowLeft')next=(i-1+tabs.length)%tabs.length;
      if(event.key==='Home')next=0;if(event.key==='End')next=tabs.length-1;
      if(next!==undefined){event.preventDefault();select(next,true);}
    });
  });
})();
