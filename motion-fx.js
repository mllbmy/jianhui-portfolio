(() => {
 'use strict';
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),gs=window.gsap;
 const canvas=document.createElement('canvas');canvas.id='transition-particles';canvas.setAttribute('aria-hidden','true');document.body.append(canvas);
 const ctx=canvas.getContext('2d',{alpha:true,desynchronized:true});if(!ctx)return;
 let w=0,h=0,dpr=1,tween=null,raf=0,last=0;const fx={p:1,mode:'rise',direction:1,index:0};
 const seeds=Array.from({length:180},(_,i)=>({a:i*2.39996323,r:.13+(i%17)/20,z:.3+(i%11)/12}));
 function resize(){w=innerWidth;h=innerHeight;dpr=Math.min(devicePixelRatio||1,w<761?1:1.5);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}
 function clear(){ctx.clearRect(0,0,w,h);canvas.style.visibility='hidden';}
 function draw(){
  const p=fx.p,alpha=Math.sin(p*Math.PI);ctx.clearRect(0,0,w,h);if(alpha<.008)return;
  const mobile=w<761,cx=w*(mobile?.54:.7),cy=h*.48,span=Math.max(w,h),count=mobile?72:180;
  ctx.globalCompositeOperation='lighter';
  const light=fx.index===2||fx.index===5;
  ctx.strokeStyle=light?`rgba(38,111,246,${alpha*.65})`:`rgba(134,202,255,${alpha*.62})`;
  ctx.fillStyle=light?`rgba(54,119,248,${alpha*.6})`:`rgba(186,232,255,${alpha*.85})`;
  ctx.lineWidth=mobile?.8:1.1;
  if(fx.mode==='orbit'){
   const radius=(.08+Math.pow(p,.82)*1.6)*span;
   ctx.save();ctx.translate(cx,cy);ctx.rotate(-.35*fx.direction);
   for(let k=0;k<3;k++){ctx.beginPath();ctx.ellipse(0,0,radius+k*12,(radius+k*12)*.65,0,0,Math.PI*2);ctx.globalAlpha=(1-k*.28)*alpha*.65;ctx.stroke();}
   ctx.restore();ctx.globalAlpha=1;
   ctx.beginPath();for(let i=0;i<count;i++){const s=seeds[i],r=radius*(.4+s.r*.7),a=s.a+p*.65*fx.direction;const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.68;const tail=(12+60*p)*s.z;ctx.moveTo(x,y);ctx.lineTo(x-Math.cos(a)*tail,y-Math.sin(a)*tail*.68);}ctx.stroke();
  }else if(fx.mode==='sweep'){
   const edge=h*(1.2-p*1.45),skew=.22*fx.direction;
   const wash=ctx.createLinearGradient(0,edge-70,0,edge+20);wash.addColorStop(0,'rgba(71,125,255,0)');wash.addColorStop(.85,`rgba(71,125,255,${alpha*.18})`);wash.addColorStop(1,'rgba(71,125,255,0)');
   ctx.fillStyle=wash;ctx.beginPath();ctx.moveTo(0,edge-90);ctx.lineTo(w,edge-w*skew-90);ctx.lineTo(w,edge-w*skew+30);ctx.lineTo(0,edge+30);ctx.fill();
   ctx.beginPath();ctx.moveTo(0,edge);ctx.lineTo(w,edge-w*skew);ctx.stroke();
   ctx.beginPath();for(let i=0;i<count;i++){const s=seeds[i],x=(i/count)*w,y=edge-x*skew+Math.sin(s.a)*120*s.z;ctx.moveTo(x,y);ctx.lineTo(x+15*s.z*fx.direction,y-36*s.z);}ctx.stroke();
  }else{
   const speed=Math.pow(p,1.4),edge=h*(1.1-p*1.35);
   ctx.beginPath();for(let i=0;i<count;i++){const s=seeds[i],x=cx+Math.cos(s.a)*span*s.r*(.3+speed*1.1),y=cy+Math.sin(s.a)*h*s.r*(.3+speed)-p*h*.35*fx.direction;const l=(10+speed*100)*s.z;ctx.moveTo(x,y);ctx.lineTo(x+(x-cx)*.06,y+l*fx.direction);}ctx.stroke();
   ctx.beginPath();ctx.ellipse(cx,edge,w*.75,22+Math.sin(p*Math.PI)*42,-.08*fx.direction,0,Math.PI*2);ctx.globalAlpha=alpha*.5;ctx.stroke();ctx.globalAlpha=1;
  }
  ctx.globalCompositeOperation='source-over';
 }
 function render(now){raf=0;if(fx.p>=1||reduce.matches||document.hidden){clear();return;}if(now-last>(w<761?28:14)){draw();last=now;}raf=requestAnimationFrame(render);}
 function stop(){tween?.kill();tween=null;cancelAnimationFrame(raf);raf=0;fx.p=1;clear();}
 window.portfolioFX={play(index,direction=1,mode='rise'){stop();if(reduce.matches||!gs)return;Object.assign(fx,{p:0,index,direction,mode});canvas.style.visibility='visible';tween=gs.to(fx,{p:1,duration:.78,ease:'none',onComplete:clear});raf=requestAnimationFrame(render);},stop,getState(){return {p:fx.p,index:fx.index,direction:fx.direction,mode:fx.mode,active:fx.p<1};}};
 addEventListener('resize',resize,{passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});reduce.addEventListener('change',()=>{if(reduce.matches)stop();});resize();clear();
})();
