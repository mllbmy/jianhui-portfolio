(() => {
 'use strict';
 const gs=window.gsap;
 let saved=[],index=0,active=false;
 const modes=['orbit','collaboration','browser','phones','terrain','certificates','signature'];
 function stop(){for(const [el,style] of saved){if(style===null)el.removeAttribute('style');else el.setAttribute('style',style);}saved=[];active=false;}
 function remember(el){if(!saved.some(x=>x[0]===el))saved.push([el,el.getAttribute('style')]);}
 function compose(timeline,scene,next,direction=1){
  stop();index=next;active=true;const travel=innerWidth<761?24:46;
  function enter(selector,props,at=.08,duration=.68){
   const els=[...scene.querySelectorAll(selector)];els.forEach(remember);
   if(els.length)timeline.from(els,{...props,duration,ease:'power3.out',stagger:els.length>1?.025:0,immediateRender:true},at);
  }
  if(next===0){enter('.hero-visual',{scale:.78,rotationY:-18,opacity:.2});}
  if(next===1){
   enter('.method-orbit',{rotationX:66,scale:.62,opacity:.15,transformOrigin:'50% 50%'});
   enter('.human-core',{scale:.55,y:travel*.5,opacity:.2},.12,.62);
   enter('.method-selectors',{y:14,opacity:0},.22,.44);
  }
  if(next===2){
   enter('.browser-sculpture',{rotationY:-48,rotationX:13,scale:.83,y:travel,opacity:.3},.04,.74);
   enter('.feature-a',{x:24,y:-12,scale:.76,opacity:0},.22,.5);
   enter('.feature-b',{x:-24,y:12,scale:.76,opacity:0},.25,.5);
  }
  if(next===3){
   enter('.phone-center',{y:travel,scale:.78,opacity:.35},.04,.72);
   enter('.phone-left',{x:'+=65',rotationY:0,rotationZ:0,scale:.74,opacity:0},.13,.64);
   enter('.phone-right',{x:'-=65',rotationY:0,rotationZ:0,scale:.74,opacity:0},.16,.62);
   enter('.audio-wave',{scaleX:.1,opacity:0,transformOrigin:'0% 50%'},.26,.45);
  }
  if(next===4){
   scene.querySelectorAll('.research-scan path').forEach((el,i)=>{remember(el);const length=el.getTotalLength();timeline.fromTo(el,{strokeDasharray:length,strokeDashoffset:length},{strokeDashoffset:0,duration:.66,ease:'power2.inOut'},.08+i*.035);});
   enter('.research-tabs',{y:12,opacity:0},.22,.4);
   enter('.research-panel',{y:18,opacity:.15},.26,.45);
  }
  if(next===5){
   enter('.back-one',{rotationZ:3,x:0,y:travel*.5,scale:.85,opacity:0},.08,.68);
   enter('.back-two',{rotationZ:3,x:0,y:travel*.5,scale:.88,opacity:0},.11,.65);
   enter('.featured-certificate',{rotationY:-32,rotationZ:-9,y:travel,scale:.85,opacity:.25},.04,.74);
  }
  if(next===6){
   enter('.closing-rings',{scale:.35,rotationZ:-36,opacity:0},.04,.74);
   enter('.closing-mark',{y:travel*.5,rotationY:20,scale:.86,opacity:0},.13,.6);
   enter('.closing-caption',{y:10,opacity:0},.25,.42);
  }
 }
 window.portfolioFX={compose,stop,getState:()=>({index,mode:modes[index],active})};
})();
