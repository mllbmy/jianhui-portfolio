(() => {
  'use strict';
  const root = document.documentElement;
  const story = document.querySelector('.story');
  const deck = document.querySelector('.exhibition');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const landscape = matchMedia('(max-height:550px) and (orientation:landscape)');
  let stops = [], current = 0, busy = false, enabled = !landscape.matches;
  let animationFrame = 0, generation = 0, resizeFrame = 0, wheelTime = -10000, settledAt = -10000;
  let wheelLocked = false, wheelAmount = 0, wheelSign = 0, touch = null;
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const ease = t => t * t * t * (10 + t * (-15 + t * 6));
  const pilot = document.createElement('aside');
  pilot.className = 'page-pilot'; pilot.setAttribute('aria-label','逐屏浏览控制');
  pilot.innerHTML = '<div class="pilot-tip">轻滚一下，自动翻屏</div><div class="pilot-body"><button class="pilot-prev" aria-label="上一屏"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 14 6-6 6 6"/></svg></button><div class="pilot-position"><span class="pilot-label">能力总览</span><span class="pilot-count">01 / 01</span></div><button class="pilot-next" aria-label="下一屏"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 10 6 6 6-6"/></svg></button><button class="pilot-mode" aria-pressed="false">自由浏览</button><span class="pilot-progress" aria-hidden="true"></span></div><span class="pilot-announcement" role="status" aria-live="polite"></span>';
  document.body.append(pilot);
  const edge = document.createElement('div'); edge.className = 'page-turn-edge';edge.setAttribute('aria-hidden','true');document.body.append(edge);
  const previous = pilot.querySelector('.pilot-prev'), next = pilot.querySelector('.pilot-next');
  const label = pilot.querySelector('.pilot-label'), count = pilot.querySelector('.pilot-count');
  const mode = pilot.querySelector('.pilot-mode'), announcement = pilot.querySelector('.pilot-announcement');
  root.classList.add('has-page-pilot');
  function naturalTop(element) {return element.getBoundingClientRect().top + scrollY;}
  function rebuild() {
    const maximum = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const header = innerWidth <= 760 ? 75 : 90;
    const usable = Math.max(240, innerHeight - header - 20);
    const items = [];
    const add = (y, name, element, key, intro = null) => {
      y = clamp(Math.round(y),0,maximum);
      if(items.length && Math.abs(items[items.length-1].y-y)<24) {
        if(key.startsWith('contact'))items[items.length-1]={y,name:'关于我与联系',element,key,intro};
        return;
      }
      items.push({y,name,element,key,intro});
    };
    const introNames = ['能力总览','独立获奖作品','多 AI 协作方法','算法与研究'];
    if(!reduced.matches && !landscape.matches) {
      const range = story.offsetHeight - innerHeight, top = naturalTop(story);
      for(let i=0;i<4;i++) add(i ? top+range*(i/3.6+.018) : top,introNames[i],story,'intro-'+i,i);
    } else [...document.querySelectorAll('.chapter')].forEach((panel,i)=>add(naturalTop(panel)-header,introNames[i],panel,'intro-'+i,i));
    function readingStops(element, top, name, key) {
      const remainder = Math.max(0,element.offsetHeight-usable);
      const parts = Math.ceil(remainder/(usable*.88));
      for(let i=0;i<=parts;i++) add(top-header+(parts?remainder*i/parts:0),name+(parts?' · '+(i+1)+'/'+(parts+1):''),element,key+'-'+i);
    }
    let top = naturalTop(deck);
    [...deck.querySelectorAll('.lift-page')].forEach((page,i)=>{
      readingStops(page,top,['作品构建与成果','研究与 AI 协作','获奖任务与成长'][i],page.id);
      top += page.offsetHeight + parseFloat(getComputedStyle(page).marginBottom);
    });
    const about = document.querySelector('.about-strip'), contact = document.querySelector('#contact');
    readingStops(about,naturalTop(about),'关于我','about');
    readingStops(contact,naturalTop(contact),'联系我','contact');
    stops = items.sort((a,b)=>a.y-b.y);
    if(!busy)current=nearest(scrollY);
    update();
  }
  function nearest(y) {
    let best=0,distance=Infinity;
    stops.forEach((stop,i)=>{const d=Math.abs(stop.y-y);if(d<distance){distance=d;best=i;}});
    return best;
  }
  function update() {
    if(!stops.length)return;
    const stop=stops[current];
    label.textContent=stop.name; count.textContent=String(current+1).padStart(2,'0')+' / '+String(stops.length).padStart(2,'0');
    previous.disabled=busy||current===0;next.disabled=busy||current===stops.length-1;
    previous.setAttribute('aria-label','上一屏'+(stops[current-1]?'：'+stops[current-1].name:''));
    next.setAttribute('aria-label','下一屏'+(stops[current+1]?'：'+stops[current+1].name:''));
    pilot.classList.toggle('pilot-after-intro',scrollY>=naturalTop(deck)-innerHeight*.7);
    pilot.style.setProperty('--pilot-position',String(current/Math.max(1,stops.length-1)));
    root.classList.toggle('gesture-enabled',enabled);root.dataset.gesturePage=stop.key;
    root.dataset.gestureState=busy?'turning':'idle';
    mode.textContent=enabled?'自由浏览':'逐屏浏览';mode.setAttribute('aria-pressed',String(!enabled));
    pilot.querySelector('.pilot-tip').textContent=enabled?'轻滚一下，自动翻屏':'自由滚动 · 可随时切回逐屏浏览';
  }
  function cancel() {
    generation++;cancelAnimationFrame(animationFrame);animationFrame=0;busy=false;
    root.classList.remove('page-turning');root.style.setProperty('--turn-arc','0');
    current=nearest(scrollY);update();
  }
  function arrive(stop, old) {
    if(reduced.matches || !stop)return;
    if(stop.intro!==null) {
      const art=document.querySelector('.stage-art');
      art.getAnimations().forEach(animation=>animation.cancel());
      art.animate([{transform:'translate3d(0,50px,0) scale(.94)',filter:'blur(5px)',opacity:.65},{transform:'translate3d(0,0,0) scale(1)',filter:'blur(0)',opacity:1}],{duration:950,easing:'cubic-bezier(.16,1,.3,1)'});
      return;
    }
    if(stop.element===old?.element)return;
    const parts=[...stop.element.querySelectorAll('.section-heading h2,.section-heading>p,.project-card,.research-layout,.achievement-tabs,.achievement-panel,.contact-top,h2')];
    [...new Set(parts)].slice(0,7).forEach((element,i)=>{
      if(element.getBoundingClientRect().bottom<75)return;
      element.animate([{opacity:.25,transform:'translate3d(0,45px,0)',filter:'blur(5px)'},{opacity:1,transform:'translate3d(0,0,0)',filter:'blur(0)'}],{duration:750,delay:i*65,easing:'cubic-bezier(.16,1,.3,1)'});
    });
  }
  function toY(y, options={}) {
    if(!stops.length)rebuild();
    const maximum=Math.max(0,document.documentElement.scrollHeight-innerHeight);
    y=clamp(Math.round(y),0,maximum);
    const old=stops[nearest(scrollY)], destination=options.stop||stops[nearest(y)];
    cancel();const token=++generation;
    current=options.stop?stops.indexOf(options.stop):nearest(y);
    if(current<0)current=nearest(y);
    const start=scrollY, distance=y-start;
    if(Math.abs(distance)<2 || reduced.matches || options.instant) {
      scrollTo({top:y,behavior:'instant'});current=nearest(y);update();return;
    }
    busy=true;root.classList.add('page-turning');root.dataset.turnDirection=distance>0?'next':'previous';update();
    const duration=innerWidth<=760?1000:1120;let startTime=null,entered=false;
    function frame(now) {
      if(token!==generation)return;
      if(startTime===null)startTime=now;
      const phase=clamp((now-startTime)/duration,0,1),progress=ease(phase);
      scrollTo({top:start+distance*progress,behavior:'instant'});
      root.style.setProperty('--turn-arc',String(Math.sin(phase*Math.PI)));
      if(!entered && phase>.38){entered=true;arrive(destination,old);}
      if(phase<1){animationFrame=requestAnimationFrame(frame);return;}
      busy=false;settledAt=performance.now();animationFrame=0;scrollTo({top:y,behavior:'instant'});
      root.classList.remove('page-turning');root.style.setProperty('--turn-arc','0');
      current=nearest(y);update();announcement.textContent=stops[current]?.name||'';
    }
    animationFrame=requestAnimationFrame(frame);
  }
  function step(direction) {
    if(busy)return;
    current=nearest(scrollY);
    const index=clamp(current+direction,0,stops.length-1);
    if(index===current)return;
    toY(stops[index].y,{stop:stops[index]});
  }
  function overlayOpen() {return !!document.querySelector('dialog[open],#main-nav.open');}
  addEventListener('wheel',event=>{
    if(!enabled||event.ctrlKey||event.metaKey||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;
    if(overlayOpen())return;
    if(event.cancelable)event.preventDefault();
    const now=performance.now(),gap=now-wheelTime;wheelTime=now;
    if(busy || (wheelLocked&&(gap<450||now-settledAt<240)))return;
    if(gap>=450){wheelLocked=false;wheelAmount=0;wheelSign=0;}
    const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1),sign=Math.sign(delta);
    if(!sign)return;
    if(sign!==wheelSign){wheelAmount=0;wheelSign=sign;}
    wheelAmount+=Math.abs(delta);
    if(wheelAmount>=3){wheelLocked=true;wheelAmount=0;step(sign);}
  },{passive:false});
  addEventListener('touchstart',event=>{
    if(!enabled||event.touches.length!==1||overlayOpen()){touch=null;return;}
    touch={x:event.touches[0].clientX,y:event.touches[0].clientY,triggered:false};
  },{passive:true});
  addEventListener('touchmove',event=>{
    if(!touch||event.touches.length!==1||overlayOpen())return;
    const dx=event.touches[0].clientX-touch.x,dy=event.touches[0].clientY-touch.y;
    if(Math.abs(dy)<Math.abs(dx)||Math.abs(dy)<8)return;
    if(event.cancelable)event.preventDefault();
    if(!touch.triggered&&Math.abs(dy)>=28){touch.triggered=true;if(!busy)step(dy<0?1:-1);}
  },{passive:false});
  addEventListener('touchend',()=>{touch=null;},{passive:true});
  addEventListener('touchcancel',()=>{touch=null;},{passive:true});
  document.addEventListener('keydown',event=>{
    if(!enabled||event.defaultPrevented||overlayOpen()||event.ctrlKey||event.metaKey||event.altKey)return;
    if(event.target.closest('input,textarea,select,button,[contenteditable="true"],[role="tab"]'))return;
    let direction;
    if(['ArrowDown','PageDown',' '].includes(event.key))direction=event.shiftKey&&event.key===' '?-1:1;
    if(['ArrowUp','PageUp'].includes(event.key))direction=-1;
    if(direction){event.preventDefault();step(direction);}
    else if(event.key==='Home'||event.key==='End'){event.preventDefault();const stop=stops[event.key==='Home'?0:stops.length-1];toY(stop.y,{stop});}
  });
  previous.addEventListener('click',()=>step(-1));next.addEventListener('click',()=>step(1));
  mode.addEventListener('click',()=>{cancel();enabled=!enabled;wheelLocked=false;wheelTime=-10000;update();});
  document.addEventListener('click',event=>{
    if(event.defaultPrevented)return;
    const link=event.target.closest('a[href="#story"]');if(!link)return;
    event.preventDefault();history.pushState(null,'','#story');toY(0,{stop:stops[0]});
  });
  addEventListener('scroll',()=>{if(!busy){current=nearest(scrollY);update();}},{passive:true});
  addEventListener('resize',()=>{cancel();cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(rebuild);},{passive:true});
  reduced.addEventListener('change',()=>{cancel();requestAnimationFrame(rebuild);});
  landscape.addEventListener('change',()=>{cancel();enabled=!landscape.matches;requestAnimationFrame(rebuild);});
  const observer=new ResizeObserver(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(rebuild);});
  observer.observe(deck);observer.observe(story);observer.observe(document.querySelector('.about-strip'));observer.observe(document.querySelector('#contact'));
  document.fonts.ready.then(rebuild);
  window.portfolioPager={toY,intro(index){const stop=stops.find(s=>s.intro===index);if(stop)toY(stop.y,{stop});},refresh:rebuild,getState(){return{enabled,busy,current,stops:stops.map(({y,name,key})=>({y,name,key}))};}};
  rebuild();
})();
