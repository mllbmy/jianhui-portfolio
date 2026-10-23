(() => {
  'use strict';
  const canvas = document.getElementById('particle-field'), ctx = canvas.getContext('2d', {alpha:true});
  if (!ctx) return;
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const state = {scene:0,blend:0,energy:0,frames:0,enabled:!media.matches};
  let w=0,h=0,dpr=1,raf=0,last=0,time=0,px=0,py=0,tx=0,ty=0,small=false,ghost=null;
  const scenes=[...document.querySelectorAll('.scene')];
  scenes[0]?.prepend(canvas);
  const stars = Array.from({length:100},(_,i)=>({x:Math.sin(i*127.1)*.5+.5,y:Math.cos(i*311.7)*.5+.5,z:.2+(i%11)/12,r:.4+(i%5)*.22}));
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function resize(){w=innerWidth;h=innerHeight;small=w<761;dpr=Math.min(devicePixelRatio||1,small?1.5:2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);if(!state.enabled)draw(0);}
  function draw(dt){
    time+=dt;state.frames++;state.energy*=.91;state.blend+=(state.scene-state.blend)*.075;px+=(tx-px)*.055;py+=(ty-py)*.055;
    ctx.clearRect(0,0,w,h);
    const hero=state.scene===0, light=state.scene===2||state.scene===5;
    const cx=w*(small?.55:.75)+px*(small?5:25), cy=h*(small?(hero?.68:.63):.48)+py*20;
    const size=small?Math.min(w*.36,hero?h*.18:h*.23):Math.min(w*.23,h*.38);
    const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,size*1.5);
    glow.addColorStop(0,`rgba(68,120,255,${hero?.09:.025})`);glow.addColorStop(.5,'rgba(49,97,220,.025)');glow.addColorStop(1,'rgba(30,70,170,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
    for(const s of stars){let sx=(s.x*w+time*3*s.z+px*9*s.z)%w,sy=(s.y*h+time*2*s.z+py*9*s.z)%h;let a=(light?.1:.23)*s.z;ctx.fillStyle=`rgba(150,193,255,${a})`;ctx.beginPath();ctx.arc(sx,sy,s.r,0,Math.PI*2);ctx.fill();if(state.energy>.3){ctx.strokeStyle=`rgba(105,168,255,${Math.min(.22,state.energy*.08)})`;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx+(sx-w/2)*state.energy*.05,sy+(sy-h/2)*state.energy*.08);ctx.stroke();}}
    const count=small?120:210,bands=small?6:9;const spin=time*.12+state.blend*.24, rx=-.45+py*.1, ry=.28+px*.12;
    const cosX=Math.cos(rx),sinX=Math.sin(rx),cosY=Math.cos(ry),sinY=Math.sin(ry);
    const gain=hero?1:(state.scene===1?.32:.18), burst=1+state.energy*.32;
    for(let b=0;b<bands;b++){
      const lane=b/(bands-1),offset=(lane-.5)*.4;
      let previous=null;
      for(let n=0;n<count;n++){
        const u=n/count*Math.PI*2, phase=u+spin;
        // A twisted current, with real depth projection rather than a flat dotted ring.
        const wave=Math.sin(phase*3+time*.18), radius=1+.12*wave;
        let x=Math.cos(phase)*(radius+offset*Math.cos(phase*2+time*.18)), y=Math.sin(phase)*(radius+offset*Math.cos(phase*2+time*.18))*.77;
        let z=offset*Math.sin(phase*2+time*.18)+.2*Math.sin(phase*2);
        const field=Math.min(1,state.blend*.18);
        if(state.scene===3){y=y*.6+Math.sin(phase*4+time)*.18;}
        if(state.scene===4){y=y*.3+Math.sin(phase*7+lane)*.12;z+=Math.sin(phase*3)*.15;}
        x+=Math.sin(phase*2+time*.3)*field*.07;
        const y1=y*cosX-z*sinX,z1=y*sinX+z*cosX,x1=x*cosY+z1*sinY,z2=-x*sinY+z1*cosY;
        const perspective=2.8/(2.8-z2),sx=cx+x1*size*perspective*burst,sy=cy+y1*size*perspective*burst;
        const depth=clamp((z2+.5)/1.1,.1,1),alpha=(.14+.65*depth)*gain;
        if(previous && n%3!==0){ctx.beginPath();ctx.strokeStyle=`rgba(91,158,255,${alpha*.23})`;ctx.lineWidth=.55;ctx.moveTo(previous.x,previous.y);ctx.lineTo(sx,sy);ctx.stroke();}
        ctx.fillStyle=`rgba(${Math.round(92+depth*92)},${Math.round(145+depth*85)},255,${alpha})`;ctx.beginPath();ctx.arc(sx,sy,(small?.65:.8)+depth*.65,0,Math.PI*2);ctx.fill();
        if(n%31===0&&b%3===0){ctx.fillStyle=`rgba(186,232,255,${alpha*.13})`;ctx.beginPath();ctx.arc(sx,sy,5+depth*3,0,Math.PI*2);ctx.fill();}
        previous={x:sx,y:sy};
      }
    }
    if(state.energy>.08){const r=size*(.7+(2-state.energy)*.6);ctx.beginPath();ctx.ellipse(cx,cy,r,r*.68,-.35,0,Math.PI*2);ctx.lineWidth=1;ctx.strokeStyle=`rgba(124,187,255,${state.energy*.1})`;ctx.stroke();}
  }
  function loop(now){raf=0;if(!state.enabled||document.hidden)return;const elapsed=now-last;if(elapsed>(small?30:15)){draw(Math.min(elapsed/1000,.05));last=now;}raf=requestAnimationFrame(loop);}
  function start(){if(!raf&&state.enabled&&!document.hidden){last=performance.now();raf=requestAnimationFrame(loop);}}
  function preferences(){state.enabled=!media.matches;if(!state.enabled){cancelAnimationFrame(raf);raf=0;state.energy=0;draw(0);}else start();}
  addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;tx=(e.clientX/w-.5)*2;ty=(e.clientY/h-.5)*2;},{passive:true});
  addEventListener('resize',resize,{passive:true});document.addEventListener('visibilitychange',()=>{document.body.classList.toggle('motion-paused',document.hidden);if(document.hidden){cancelAnimationFrame(raf);raf=0;}else start();});media.addEventListener('change',preferences);
  window.portfolioParticles={setScene(index){
    ghost?.remove();ghost=null;
    if(canvas.parentElement!==scenes[index]){
      ghost=document.createElement('canvas');ghost.className='particle-echo';ghost.setAttribute('aria-hidden','true');ghost.width=canvas.width;ghost.height=canvas.height;ghost.getContext('2d').drawImage(canvas,0,0);canvas.parentElement.prepend(ghost);scenes[index].prepend(canvas);
    }
    state.scene=index;state.energy=media.matches?0:1.8;if(!state.enabled)draw(0);
  },finishTransition(){ghost?.remove();ghost=null;},pulse(value=1){state.energy=Math.max(state.energy,value);},getState(){return {...state};}};
  resize();start();
})();
