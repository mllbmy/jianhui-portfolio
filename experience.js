(() => {
 'use strict';
 const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
 const scenes=$$('.scene'), reduce=matchMedia('(prefers-reduced-motion: reduce)'), gs=window.gsap;
 const ids=scenes.map(s=>s.id), names=scenes.map(s=>s.dataset.name);
 let current=0,busy=false,turn=null,openingTimeline=null,opening=false,lastWheel=0,lastWheelMagnitude=0,wheelDirection=0,wheelLatched=false,lastFocus=null,driftTween=null;
 const sceneState={startedAt:0,completedAt:0,transitions:0};
 const aliases={'career-case':2,'exhibition':2,'soundlane':3,'ai-method':1,'about':6};
 const resolveHash=()=>{const key=decodeURIComponent(location.hash.slice(1));return aliases[key]??Math.max(0,ids.indexOf(key));};
 function hasDialog(){return !!$('dialog[open]');}
 function setHeader(index){document.body.classList.toggle('light-scene',scenes[index].dataset.tone==='light');$('#scene-number').textContent=String(index+1).padStart(2,'0');$('#scene-name').textContent=names[index];$('#prev-scene').disabled=index===0;$('#next-scene').disabled=index===scenes.length-1;$('.scene-progress span').style.width=((index+1)/scenes.length*100)+'%';$$('.scene-dots button').forEach((b,i)=>{if(i===index)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});$$('.site-header nav a').forEach(a=>{if(a.hash==='#'+ids[index]||(a.hash==='#projects'&&index===3))a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});$('#scene-announcer').textContent=`第 ${index+1} 个板块，共 ${scenes.length} 个：${names[index]}`;}
 function cleanScene(scene){if(gs){gs.set(scene,{clearProps:'transform,clipPath,filter,zIndex'});gs.set($$('.reveal-item,.line-inner,.scene-art',scene),{clearProps:'transform,opacity,filter'});}scene.style.visibility='hidden';scene.style.opacity='0';scene.classList.remove('is-active');scene.inert=true;scene.setAttribute('aria-hidden','true');}
 function settle(index){driftTween?.kill();driftTween=null;scenes.forEach((scene,i)=>{if(i!==index)cleanScene(scene);});const s=scenes[index];if(gs){gs.set(s,{clearProps:'transform,clipPath,filter,zIndex'});gs.set($$('.reveal-item,.line-inner,.scene-art',s),{clearProps:'transform,opacity,filter'});}s.style.visibility='visible';s.style.opacity='1';s.classList.add('is-active');s.inert=false;s.removeAttribute('aria-hidden');current=index;busy=false;document.body.classList.remove('is-turning');document.documentElement.dataset.scene=String(index);sceneState.completedAt=performance.now();setHeader(index);window.portfolioParticles?.finishTransition();gs&&gs.set($('.cine-flash'),{opacity:0});}
 function navigate(index,options={}){
  index=Math.max(0,Math.min(scenes.length-1,index));if(hasDialog())return false;
  if(opening)finishOpening();
  if(index===current&&!busy)return false;
  if(busy){if(!options.interrupt)return false;turn?.kill();settle(current);}
  driftTween?.kill();driftTween=null;
  const from=scenes[current],to=scenes[index],direction=index>current?1:-1;
  current=index;busy=true;sceneState.startedAt=performance.now();sceneState.transitions++;document.documentElement.dataset.scene=String(index);document.body.classList.add('is-turning');
  from.inert=true;from.setAttribute('aria-hidden','true');to.inert=false;to.removeAttribute('aria-hidden');to.classList.add('is-active');setHeader(index);window.portfolioParticles?.setScene(index);
  if(options.history!=='none'){const href='#'+ids[index];if(options.history==='push')history.pushState(null,'',href);else history.replaceState(null,'',href);}
  if(!gs||reduce.matches||options.instant){settle(index);return true;}
  const content=$$('.reveal-item',to),art=$('.scene-art',to),lines=$$('.line-inner',to),others=content.filter(el=>!el.matches('h1,h2')),beam=$('.transition-beam');
  const mode=['rise','orbit','sweep','rise','orbit','sweep','rise'][index];
  document.documentElement.dataset.transition=mode;
  const mobile=innerWidth<761,origin=mobile?'54% 58%':'72% 48%',lateral=[0,-25,70,-55,15,45,-20][index];
  const maskStart=mode==='orbit'?`circle(0% at ${origin})`:mode==='sweep'?'polygon(0% 100%,100% 70%,100% 100%,0% 100%)':'inset(0% 0% 0% 0% round 28px)';
  const maskEnd=mode==='orbit'?`circle(150% at ${origin})`:mode==='sweep'?'polygon(0% 0%,100% 0%,100% 100%,0% 100%)':'inset(0% 0% 0% 0% round 0px)';
  gs.set(to,{visibility:'visible',opacity:1,zIndex:4,yPercent:direction*(mode==='rise'?100:16),z:mode==='orbit'?-160:0,scale:mode==='rise'?.87:1,rotationX:mode==='rise'?-14*direction:0,transformOrigin:'50% 50%',clipPath:maskStart});
  gs.set(from,{zIndex:3,transformOrigin:'50% 50%'});
  gs.set(lines,{yPercent:110});gs.set(others,{y:direction*20,opacity:0});
  gs.set(art,{x:lateral,y:direction*48,z:-170,rotationY:mode==='orbit'?12:-8,scale:.9,opacity:.2});
  gs.set(beam,{visibility:'hidden'});gs.set('.cine-flash',{opacity:0});
  window.portfolioFX?.play(index,direction,mode);
  turn=gs.timeline({onComplete:()=>settle(index),defaults:{overwrite:'auto'}});
  turn.to(from,{yPercent:-direction*14,z:-180,scale:.86,rotationX:direction*7,opacity:.1,duration:.46,ease:'power2.in'},0)
   .to(to,{yPercent:0,z:0,scale:1,rotationX:0,clipPath:maskEnd,duration:.72,ease:'power3.out'},0)
   .to(art,{x:0,y:0,z:0,rotationY:0,scale:1,opacity:1,duration:.66,ease:'power3.out'},.10)
   .to(lines,{yPercent:0,duration:.53,stagger:.04,ease:'expo.out'},.12)
   .to(others,{y:0,opacity:1,duration:.38,stagger:.025,ease:'power3.out'},.19);
  return true;
 }
 function finishOpening(){openingTimeline?.kill();openingTimeline=null;opening=false;$('.opening').classList.remove('is-playing');$('.opening').setAttribute('aria-hidden','true');$('#skip-opening').tabIndex=-1;if(gs)gs.set($$('.reveal-item,.line-inner,.scene-art',scenes[current]),{clearProps:'transform,opacity'});}
 function playOpening(){
  if(reduce.matches||!gs){finishOpening();return;}
  if(hasDialog()||busy)return;
  opening=true;const overlay=$('.opening');overlay.classList.add('is-playing');overlay.removeAttribute('aria-hidden');$('#skip-opening').tabIndex=0;
  gs.set('.opening-shutter',{yPercent:0});gs.set('.opening-word',{y:14,opacity:0,scale:.96});gs.set('.opening-line',{scaleX:0,opacity:1});
  openingTimeline=gs.timeline({onComplete:finishOpening});openingTimeline.to('.opening-word',{y:0,opacity:1,scale:1,duration:.28,ease:'power2.out'},0).to('.opening-line',{scaleX:1,duration:.3,ease:'power3.inOut'},.23).to('.opening-word',{opacity:0,scale:1.08,duration:.2},.46).to('.shutter-top',{yPercent:-101,duration:.55,ease:'power3.inOut'},.45).to('.shutter-bottom',{yPercent:101,duration:.55,ease:'power3.inOut'},.45).to('.opening-line',{opacity:0,duration:.25},.61).fromTo($$('.reveal-item',scenes[current]),{y:24,opacity:0},{y:0,opacity:1,duration:.45,stagger:.025,ease:'power3.out'},.56);
  window.portfolioParticles?.pulse(2);gs.delayedCall(.4,()=>{if(opening)window.portfolioFX?.play(current,1,'orbit');});
 }
 // premium motion: split every headline into masked lines so each row can rise on its own
 $$('.scene h1, .scene h2').forEach(function(h){if(h.dataset.lines)return;var parts=h.innerHTML.split(/<br\s*\/?>/i);h.innerHTML=parts.map(function(p){return '<span class="line-mask"><span class="line-inner">'+p+'</span></span>';}).join('');h.dataset.lines='1';});
 (function(){
  if(!gs||reduce.matches)return;
  var glow=$('.cursor-glow');
  if(glow&&matchMedia('(pointer:fine)').matches){
   var gx=gs.quickTo(glow,'x',{duration:.55,ease:'power3.out'}),gy=gs.quickTo(glow,'y',{duration:.55,ease:'power3.out'});
   gs.set(glow,{x:innerWidth*.5,y:innerHeight*.45,opacity:0});
   addEventListener('pointermove',function(e){gx(e.clientX);gy(e.clientY);glow.style.opacity='1';},{passive:true});
  }
  $$('.button.primary').forEach(function(b){
   b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();gs.to(b,{x:(e.clientX-r.left-r.width/2)*.14,y:(e.clientY-r.top-r.height/2)*.2,duration:.35,ease:'power2.out',overwrite:'auto'});});
   b.addEventListener('pointerleave',function(){gs.to(b,{x:0,y:0,duration:.5,ease:'power3.out',overwrite:'auto'});});
  });
 })();
 ids.forEach((id,i)=>{const b=document.createElement('button');b.dataset.go=String(i);b.setAttribute('aria-label',`第 ${i+1} 个板块：${names[i]}`);$('.scene-dots').append(b);});
 $('#prev-scene').onclick=()=>navigate(current-1);$('#next-scene').onclick=()=>navigate(current+1);$('#skip-opening').onclick=finishOpening;$('#replay-opening').onclick=playOpening;
 document.addEventListener('click',event=>{const go=event.target.closest('[data-go]');if(go){navigate(Number(go.dataset.go),{history:'push',interrupt:true});return;}const a=event.target.closest('a[href^="#"]');if(!a)return;const key=a.hash.slice(1),index=aliases[key]??ids.indexOf(key);if(index<0)return;event.preventDefault();navigate(index,{history:'push',interrupt:true});});
 addEventListener('wheel',e=>{
  if(hasDialog()||e.ctrlKey||e.metaKey||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
  if(e.cancelable)e.preventDefault();const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1);if(Math.abs(delta)<2)return;
  const now=performance.now(),gap=now-lastWheel,dir=Math.sign(delta);lastWheel=now;
  const magnitude=Math.abs(delta),fresh=dir!==wheelDirection||gap>850||(gap>190&&magnitude>=lastWheelMagnitude);wheelDirection=dir;lastWheelMagnitude=magnitude;
  if(busy){wheelLatched=true;return;}
  if(wheelLatched&&!fresh)return;
  wheelLatched=true;navigate(current+dir);
 },{passive:false});
 let touch=null;
 addEventListener('touchstart',e=>{if(hasDialog()||e.touches.length!==1){touch=null;return;}touch={x:e.touches[0].clientX,y:e.touches[0].clientY,fired:false};},{passive:true});
 addEventListener('touchmove',e=>{if(!touch||hasDialog()||e.touches.length!==1)return;const dx=e.touches[0].clientX-touch.x,dy=e.touches[0].clientY-touch.y;if(Math.abs(dx)>Math.abs(dy))return;if(Math.abs(dy)>6&&e.cancelable)e.preventDefault();if(Math.abs(dy)>16&&!touch.fired){touch.fired=true;wheelLatched=false;navigate(current+(dy<0?1:-1));}},{passive:false});
 addEventListener('touchend',()=>{touch=null;},{passive:true});
 addEventListener('keydown',e=>{if(hasDialog())return;if(e.key==='Escape'&&opening){finishOpening();return;}if(e.ctrlKey||e.metaKey||e.altKey||e.target.closest('button,a,input,textarea,select,[role="tab"]'))return;let n;if(['ArrowDown','PageDown',' '].includes(e.key))n=current+1;if(['ArrowUp','PageUp'].includes(e.key))n=current-1;if(e.key==='Home')n=0;if(e.key==='End')n=scenes.length-1;if(n!==undefined){e.preventDefault();navigate(n);}});
 addEventListener('popstate',()=>navigate(resolveHash(),{history:'none',interrupt:true}));
 addEventListener('hashchange',()=>navigate(resolveHash(),{history:'none',interrupt:true}));
 reduce.addEventListener('change',()=>{if(reduce.matches){finishOpening();turn?.kill();window.portfolioFX?.stop();settle(current);gs?.set('.transition-beam',{visibility:'hidden'});}});
 window.portfolioExperience={go:navigate,replay:playOpening,getState(){return {current,busy,opening,count:scenes.length,...sceneState};}};

 // Tabs describe real contributions; their content stays within the scene.
 const methods=[
  ['01 / 定义问题','先明确要解决什么。','把需求拆成可执行任务，给出目标、边界和验收方式，再交给 AI 辅助实现。'],
  ['02 / 组织分工','让不同 AI 各有任务。','按开发、分析、文稿等任务分配工作，共享必要上下文，再汇总各部分输出。'],
  ['03 / 人工复核','生成之后，由我判断。','审核代码、逻辑与文稿，比较不同输出，定位问题并提出具体修改要求。'],
  ['04 / 测试迭代','把结果放回场景检验。','运行功能、检查数据与图表，依据测试反馈修正，再推进作品与稿件。']
 ];
 const research=[
  ['01 / 研究问题','从一个值得验证的问题开始。','围绕祁连山生态安全评价，考察观测频率对评价与预测可靠性的影响，确定研究问题与分析路径。',['生态安全','观测频率','预测可靠性']],
  ['02 / 数据准备','把历史观测整理成分析输入。','使用 Python 处理 2005—2023 年历史观测数据，组织生态指标与分析流程，由我驱动 AI 实现并复核。',['Python','历史观测','数据处理']],
  ['03 / 模型与验证','比较模型，也检验适用范围。','比较 GM(1,1)、NGBM 与 ARIMA，开展滚动验证、敏感性分析与空间对照，检查预测的可靠性。',['3 类模型','滚动验证','敏感性分析']],
  ['04 / 多 AI 协作','三个 AI 分工，我负责统筹。','由我分配代码、分析、图表和文稿等工作，汇总并审核不同输出，反复检查与迭代。',['任务分工','交叉检查','人工审核']],
  ['05 / 期刊投稿','把完整研究整理成稿件。','完成正文、方法、图表与参考文献，以第一作者向 Journal of Mountain Science 投稿。目前处于期刊投稿中。',['第一作者','完整稿件','投稿中']]
 ];
 function animatePanel(panel){if(gs&&!reduce.matches)gs.fromTo(panel,{y:10,opacity:.3},{y:0,opacity:1,duration:.3,ease:'power2.out',overwrite:true});}
 function bindTabs(attribute,panelId,data,tabPrefix){const tabs=$$(`[${attribute}]`),panel=$(panelId);function select(index,focus=false){tabs.forEach((b,i)=>{b.setAttribute('aria-selected',String(i===index));b.tabIndex=i===index?0:-1;});panel.setAttribute('aria-labelledby',tabPrefix+index);$('.panel-marker',panel).textContent=data[index][0];$('h3',panel).textContent=data[index][1];$('p',panel).textContent=data[index][2];const tags=$('.research-tags',panel);if(tags)tags.replaceChildren(...data[index][3].map(t=>{const s=document.createElement('span');s.textContent=t;return s;}));animatePanel(panel);window.portfolioParticles?.pulse(.7);if(focus)tabs[index].focus();}tabs.forEach((b,i)=>{b.onclick=()=>select(i);b.onkeydown=e=>{let n;if(e.key==='ArrowRight'||e.key==='ArrowDown')n=(i+1)%tabs.length;if(e.key==='ArrowLeft'||e.key==='ArrowUp')n=(i-1+tabs.length)%tabs.length;if(e.key==='Home')n=0;if(e.key==='End')n=tabs.length-1;if(n!==undefined){e.preventDefault();e.stopPropagation();select(n,true);}};});}
 bindTabs('data-method','#method-panel',methods,'method-tab-');bindTabs('data-research','#research-panel',research,'research-tab-');
 const phoneAssets=['home','navigation','guard'],phoneNames=['首页','导航界面','守护人界面'];
 $$('[data-phone]').forEach(b=>b.addEventListener('click',()=>{const i=Number(b.dataset.phone),img=$('#phone-main-image');$$('.phone-switch button').forEach((p,n)=>p.setAttribute('aria-pressed',String(n===i)));img.src=`assets/images/soundlane-${phoneAssets[i]}.jpg`;img.alt='SoundLane '+phoneNames[i];if(gs&&!reduce.matches)gs.fromTo(img,{opacity:.3,scale:1.04},{opacity:1,scale:1,duration:.3,ease:'power2.out',overwrite:true});window.portfolioParticles?.pulse(.8);}));
 const honors=[
  {event:'第八届码蹄杯全国大学生程序设计大赛',result:'国赛银奖 / 省赛金奖',task:'个人赛，限定时间内完成算法题，通过在线评测检验代码。',practice:'使用 Python 拆解问题、编程与调试，依据评测反馈检查边界条件。',proof:'mati-national-silver'},
  {event:'第十七届中国大学生服务外包创新创业大赛',result:'全国赛三等奖 / 初赛小组第一',task:'围绕企业需求，开发辅助职业探索与规划的智能体作品。',practice:'独立开发网站，整合岗位探索、发展路径、成长方案与 AI 简历解析。',proof:'outsourcing-national-third'},
  {event:'中国高校计算机大赛 · 移动应用创新赛',result:'华南赛区一等奖',task:'从视障出行场景出发，完成 SoundLane 移动应用交互原型。',practice:'独立推进需求、交互、AI 辅助开发、功能测试、作品文档与答辩。',proof:'soundlane-mobile-first'},
  {event:'广东省大学生计算机设计大赛',result:'机器人视觉系统挑战赛初赛三等奖',task:'围绕视觉识别、标定与抓取场景，开展软硬件联调。',practice:'担任队长，参与补充光照样本、调整标定参数及现场调试。',proof:'robot-vision-third'}
 ];
 let honorIndex=0;
 function selectHonor(index){honorIndex=(index+honors.length)%honors.length;const a=honors[honorIndex];['event','result','task','practice'].forEach(k=>$('#honor-'+k).textContent=a[k]);$('#honor-image').src=`assets/certificates/${a.proof}.jpg`;$('#honor-image').alt=a.event+'，'+a.result;$('#honor-proof').dataset.proof=a.proof;$('#honor-count').textContent=String(honorIndex+1).padStart(2,'0')+' / 04';$$('[data-honor]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===honorIndex)));animatePanel($('.honor-narrative'));if(gs&&!reduce.matches)gs.fromTo('.featured-certificate',{rotationY:-27,rotationZ:0,opacity:.25},{rotationY:-10,rotationZ:3,opacity:1,duration:.45,ease:'power3.out',overwrite:true});window.portfolioParticles?.pulse(.7);}
 $('#honor-prev').onclick=()=>selectHonor(honorIndex-1);$('#honor-next').onclick=()=>selectHonor(honorIndex+1);$$('[data-honor]').forEach(b=>b.onclick=()=>selectHonor(Number(b.dataset.honor)));

 const detailData={
  method:{label:'多 AI 协作方法',title:'我定义目标，也审核结果。',html:'<p class="detail-lead">我的习惯是先组织任务，再驱动 AI 实现。AI 参与开发与研究，我负责定义方向、协调过程和复核结果。</p><div class="detail-facts"><span>ChatGPT</span><span>DeepSeek Harness</span><span>WorkBuddy</span><span>Qoder</span><span>TRAE</span></div>'+methods.map(a=>`<h3>${a[1]}</h3><p>${a[2]}</p>`).join('')+'<h3>在真实项目里运用</h3><p>职业规划智能体与 SoundLane 中，我使用 AI 辅助完成需求到作品的开发流程；在论文研究中，驱动 3 个 AI 分工推进代码、数据分析、图表和文稿，并由我审核、修改与提交。</p>'},
  career:{label:'作品一 · 独立开发',title:'职业规划智能体',html:'<p class="detail-lead">把企业提出的职业规划需求，整理成能够运行的网站。2026 年 4 月开展。</p><div class="detail-facts"><span>独立开发</span><span>TRAE 辅助编码</span><span>人工审核与测试</span></div><h3>从需求开始</h3><p>围绕岗位探索、晋升与转岗路径、成长方案和 AI 简历解析，拆分功能，梳理页面、交互和信息流程。</p><h3>构建可运行的网站</h3><p>独立完成网站开发。把具体需求交给 TRAE 辅助实现，再亲自审核生成结果，检查功能是否符合预期，持续修正与测试。</p><h3>在竞赛中验证作品</h3><p>第十七届中国大学生服务外包创新创业大赛：初赛小组第一名，全国赛企业命题类三等奖。</p><button class="detail-proof" data-proof="outsourcing-national-third">查看获奖证明 ↗</button>'},
  soundlane:{label:'作品二 · 独立完成',title:'SoundLane：从场景到交互',html:'<p class="detail-lead">面向视障出行，探索如何将视觉识别、语音反馈、导航与守护人协同整合为连贯的交互体验。2026 年 8 月开展。</p><div class="detail-facts"><span>需求与交互设计</span><span>AI 辅助开发</span><span>测试 · 文档 · 答辩</span></div><h3>先理解用户问题</h3><p>梳理使用场景、需求与竞品，从用户的问题倒推功能和交互，组织导航、AI 视觉、语音反馈及守护人模块。</p><h3>独立推进完整流程</h3><p>独立完成需求分析、交互设计、AI 辅助编码、功能测试、作品说明和答辩。原型使用 HTML、CSS、JavaScript，并围绕 TensorFlow.js 视觉识别、地图交互及语音能力进行整合。</p><h3>作品成果与阶段</h3><p>第十一届（2026 年）中国高校计算机大赛移动应用创新赛，启明赛道（高教组）华南赛区一等奖。作品是可运行、可点击的交互原型，尚未投入实际出行使用。</p><button class="detail-proof" data-proof="soundlane-mobile-first">查看获奖证明 ↗</button>'},
  research:{label:'第一作者 · 期刊投稿中',title:'与 AI 协作，从研究问题到投稿',html:'<p class="detail-lead">Observation frequency and forecast reliability of ecological security indices in the Qilian Mountain region, China</p><div class="detail-facts"><span>第一作者</span><span>Journal of Mountain Science</span><span>投稿中</span></div>'+research.map(a=>`<h3>${a[1]}</h3><p>${a[2]}</p>`).join('')+'<h3>我的贡献</h3><p>研究各环节由我驱动 AI 协同完成。我分配三个 AI 的任务、汇总输出，审核代码、分析、图表与写作，并迭代稿件。</p>'}
 };
 let certificates=[],certIndex=0;
 const certReady=fetch('assets/certificates.json?v=6').then(r=>{if(!r.ok)throw Error('certificates');return r.json();}).then(data=>certificates=data).catch(()=>{certificates=[];return [];});
 function showDialog(dialog){lastFocus=document.activeElement;dialog.showModal();if(gs&&!reduce.matches)gs.fromTo(dialog,{y:35,scale:.97,opacity:0},{y:0,scale:1,opacity:1,duration:.3,ease:'power3.out',overwrite:true});}
 async function openDetail(key){
  if(opening)finishOpening();const dialog=$('#detail-dialog');
  if(key==='honors'){await certReady;$('#detail-label').textContent='竞赛经历与认证';$('#detail-title').textContent='获奖背后的任务与实践';const box=document.createElement('div');box.className='detail-grid';certificates.forEach(c=>{const card=document.createElement('article');card.className='award-entry';const image=document.createElement('img');image.src=c.image;image.alt=c.title+'证书';image.loading='lazy';const title=document.createElement('h3');title.textContent=c.title;const result=document.createElement('strong');result.textContent=c.id==='robot-vision-third'?'智能机器人视觉系统挑战赛初赛三等奖':c.award;const context=document.createElement('p');context.textContent=c.context+' '+c.experience;const button=document.createElement('button');button.dataset.proof=c.id;button.textContent='查看证书 ↗';card.append(image,title,result,context,button);box.append(card);});const math=document.createElement('article');math.className='award-entry';math.innerHTML='<h3>高教社杯全国大学生数学建模竞赛</h3><strong>广东省二等奖</strong><p>将实际问题转化为可分析的模型，实践数学建模与问题求解。</p>';box.append(math);$('#detail-content').replaceChildren(box);
  }else{const d=detailData[key];if(!d)return;$('#detail-label').textContent=d.label;$('#detail-title').textContent=d.title;$('#detail-content').innerHTML=d.html;}
  if(!dialog.open)showDialog(dialog);$('.detail-scroll').scrollTop=0;
 }
 function renderCertificate(index){certIndex=(index+certificates.length)%certificates.length;const c=certificates[certIndex];$('#certificate-title').textContent=c.title;$('#certificate-image').src=c.image;$('#certificate-image').alt=c.title+'，'+c.award;$('#certificate-caption').textContent=`${c.id==='robot-vision-third'?'智能机器人视觉系统挑战赛初赛三等奖':c.award} · ${certIndex+1} / ${certificates.length}`;}
 async function openProof(id){await certReady;if(!certificates.length){toast('证书暂未加载，请稍后重试');return;}const i=certificates.findIndex(c=>c.id===id);if(i<0)return;renderCertificate(i);showDialog($('#certificate-dialog'));}
 document.addEventListener('click',e=>{const detail=e.target.closest('[data-detail]');if(detail){openDetail(detail.dataset.detail);return;}const proof=e.target.closest('[data-proof]');if(proof){openProof(proof.dataset.proof);return;}const close=e.target.closest('[data-close]');if(close)document.getElementById(close.dataset.close).close();});
 $$('dialog').forEach(dialog=>{dialog.addEventListener('close',()=>{gs?.set(dialog,{clearProps:'transform,opacity'});wheelLatched=false;lastWheel=0;});dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dialog.close();});});
 $('#certificate-prev').onclick=()=>renderCertificate(certIndex-1);$('#certificate-next').onclick=()=>renderCertificate(certIndex+1);$('#certificate-dialog').addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();renderCertificate(certIndex+(e.key==='ArrowRight'?1:-1));}});
 let toastTimer;function toast(message){$('.toast').textContent=message;$('.toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('.toast').classList.remove('visible'),3000);}
 $('.copy-email').onclick=async()=>{try{await navigator.clipboard.writeText('3282016034@qq.com');toast('邮箱已复制');}catch{toast('邮箱：3282016034@qq.com');}};
 $$('[data-tilt]').forEach(el=>{el.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||reduce.matches||!gs||busy||hasDialog())return;const b=el.getBoundingClientRect(),x=(e.clientX-b.left)/b.width-.5,y=(e.clientY-b.top)/b.height-.5;gs.to(el,{rotationY:x*8,rotationX:-y*6,duration:.45,ease:'power2.out',overwrite:true});});el.addEventListener('pointerleave',()=>{if(gs)gs.to(el,{rotationX:0,rotationY:0,duration:.6,ease:'power3.out',overwrite:true});});});
 // Decode scene artwork up front so the first transition never stalls on image decode.
 const warm=()=>$$('.scene img').forEach(img=>{if(img.decode)img.decode().catch(()=>{});});
 if('requestIdleCallback' in window)requestIdleCallback(warm,{timeout:1400});else setTimeout(warm,700);
 current=resolveHash();settle(current);window.portfolioParticles?.setScene(current);
 let seen=false;try{seen=sessionStorage.getItem('jianhui-opening-v8')==='1';sessionStorage.setItem('jianhui-opening-v8','1');}catch{}
 if(!seen&&!location.hash&&!reduce.matches)playOpening();else finishOpening();
})();
