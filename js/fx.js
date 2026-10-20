/* Igor Carvalho - interatividades (v1.1). Só a home usa este arquivo.
   Ajustes rápidos: procure os comentários "AJUSTE". */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
const touch=matchMedia('(hover:none),(pointer:coarse)').matches;

/* ================= vibração (haptics) =================
   Android: navigator.vibrate. iPhone: truque do "switch" (só funciona dentro de um toque).
   Só dispara depois da primeira interação do usuário (exigência dos navegadores). */
let userActive=false,lastH=0,hapLabel=null;
['pointerdown','touchstart','keydown'].forEach(t=>addEventListener(t,()=>{userActive=true},{once:true,passive:true}));
function iosTick(){
  try{
    if(!hapLabel){
      hapLabel=document.createElement('label');hapLabel.className='hap-sw';hapLabel.setAttribute('aria-hidden','true');
      const i=document.createElement('input');i.type='checkbox';i.setAttribute('switch','');i.tabIndex=-1;
      hapLabel.appendChild(i);document.body.appendChild(hapLabel);
    }
    hapLabel.click();
  }catch(e){}
}
window.hap=function(p){
  if(!touch||reduce||!userActive)return;
  const n=performance.now();if(n-lastH<70)return;lastH=n;
  try{if(navigator.vibrate)navigator.vibrate(p);else iosTick()}catch(e){}
};
const hap=window.hap;

/* vibração leve ao entrar em cada seção */
if('IntersectionObserver' in window&&touch){
  let lastS=null;
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting&&e.target!==lastS){lastS=e.target;hap(6)}}),{rootMargin:'-45% 0px -45% 0px'});
  document.querySelectorAll('header.hero,section').forEach(s=>io.observe(s));
}

/* ================= 2. marcador de serviços ================= */
(function(){
  const sec=$('servicos'),mk=$('svmark'),num=$('svnum'),track=$('svtrack');
  if(!sec||!mk)return;
  const svs=[...sec.querySelectorAll('.sv')];
  let x=0,y=0,cs=1,act=-2,tx=0,ty=0,raf=0,vis=false,W=0,R=28,anchors=[],size=56;
  function measure(){
    size=mk.offsetWidth;W=sec.clientWidth;R=Math.max(28,W/2-562);if(W<=820)R=28;
    const sr=sec.getBoundingClientRect();
    anchors=svs.map(s=>{const r=s.getBoundingClientRect();return r.top-sr.top});
    /* trilho: linha fina por onde o marcador anda */
    if(track&&svs.length){
      const last=svs[svs.length-1].getBoundingClientRect();
      const top=anchors[0]+30+size/2,bot=last.bottom-sr.top-30;
      track.style.top=top+'px';track.style.height=Math.max(0,bot-top)+'px';track.style.right=(R+size/2)+'px';
    }
  }
  function target(){
    const sr=sec.getBoundingClientRect(),line=innerHeight*.58-sr.top; /* AJUSTE: .58 = altura da "linha de leitura" na tela */
    let a=-1;anchors.forEach((t,i)=>{if(t<=line)a=i});
    if(a!==act){
      if(act!==-2&&a>=0)hap(8);
      act=a;num.textContent='0'+(Math.max(a,0)+1);
      num.classList.remove('tick');void num.offsetWidth;num.classList.add('tick');
    }
    if(a<0){tx=0;ty=0}else{tx=-R;ty=anchors[a]+30}
    if(track)track.classList.toggle('on',a>=0);
  }
  function frame(){
    target();
    if(reduce){x=tx;y=ty;cs=1}else{
      const k=.13;x+=(tx-x)*k;
      const dy=ty-y;y+=dy*k;
      const st=clamp(Math.abs(dy)/500,0,.28); /* estica ao andar rápido, assenta ao parar */
      cs+=((1+st)-cs)*.25;
    }
    mk.style.transform=`translate3d(${x}px,${y}px,0) scale(${(1/cs).toFixed(3)},${cs.toFixed(3)})`;
    const moving=Math.abs(tx-x)>.2||Math.abs(ty-y)>.2||Math.abs(cs-1)>.003;
    if(vis||moving)raf=requestAnimationFrame(frame);else raf=0;
  }
  function kick(){if(!raf)raf=requestAnimationFrame(frame)}
  measure();target();x=tx;y=ty;
  addEventListener('resize',()=>{measure();kick()});
  addEventListener('load',()=>{measure();kick()});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{measure();kick()});
  addEventListener('scroll',kick,{passive:true});
  new IntersectionObserver(es=>{vis=es[0].isIntersecting;if(vis)kick()},{rootMargin:'200px 0px'}).observe(sec);
  kick();
})();

/* ================= 1. chuva de partículas quadradas (hero) ================= */
const wind={x:0}; /* o giroscópio/mouse empurra a chuva */
(function(){
  const hero=$('inicio'),cv=$('rain');
  if(!hero||!cv||reduce)return;
  const mq=hero.querySelector('.mq'),ctx=cv.getContext('2d');
  let w=0,h=0,dpr=1,parts=[],vis=true,raf=0,cMut='#6b6a66',cAcc='#CA271C',frameN=0,last=0;
  const MAX=()=>Math.round(clamp(w/18,28,90)); /* AJUSTE: quantidade máxima de partículas */
  function size(){
    dpr=Math.min(devicePixelRatio||1,2);w=hero.clientWidth;h=Math.max(0,hero.clientHeight-(mq?mq.offsetHeight:0));
    cv.style.height=h+'px';cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  function colors(){const s=getComputedStyle(document.documentElement);cMut=s.getPropertyValue('--mut').trim()||cMut;cAcc=s.getPropertyValue('--acc').trim()||cAcc}
  function spawn(init){
    const s=Math.random()<.5?2:Math.random()<.7?3:5; /* AJUSTE: tamanhos 2, 3 e 5 px */
    parts.push({x:Math.random()*w,y:init?Math.random()*h:-s-Math.random()*40,s,vy:1.1+Math.random()*1.8,vx:0,
      a:.35+Math.random()*.5,c:Math.random()<.28?1:0,land:0,rest:false});
  }
  function step(t){
    const dt=Math.min(2.2,(t-last)/16.67||1);last=t;frameN++;
    if(frameN%90===1)colors();
    ctx.clearRect(0,0,w,h);
    const max=MAX();
    if(parts.length<max&&Math.random()<.5*dt)spawn(false);
    for(let i=parts.length-1;i>=0;i--){
      const p=parts[i];
      if(!p.rest){
        p.vy+=.045*dt;p.vx+=(wind.x*.9-p.vx)*.04*dt;
        p.x+=p.vx*dt*1.6;p.y+=p.vy*dt;
        if(p.x<-6)p.x=w+6;else if(p.x>w+6)p.x=-6;
        if(p.y+p.s>=h){ /* chão = topo da faixa com o slide automático */
          p.y=h-p.s;
          if(p.vy>1.6){p.vy*=-.28;p.vx*=.5}else{p.rest=true;p.vy=0}
        }
      }else{p.land+=dt;p.a-=.012*dt;if(p.a<=0){parts.splice(i,1);continue}}
      ctx.globalAlpha=Math.max(0,p.a);ctx.fillStyle=p.c?cAcc:cMut;ctx.fillRect(Math.round(p.x),Math.round(p.y),p.s,p.s);
    }
    ctx.globalAlpha=1;
    raf=vis?requestAnimationFrame(step):0;
  }
  size();for(let i=0;i<MAX()*.5;i++)spawn(true);
  addEventListener('resize',()=>{size();parts.length=Math.min(parts.length,MAX())});
  addEventListener('load',size);
  new IntersectionObserver(es=>{vis=es[0].isIntersecting;if(vis&&!raf){last=performance.now();raf=requestAnimationFrame(step)}}).observe(hero);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){vis=false}else{vis=true;if(!raf){last=performance.now();raf=requestAnimationFrame(step)}}});
  raf=requestAnimationFrame(step);
})();

/* ================= 4. giroscópio (mobile) / mouse (desktop): hero e newsletter ================= */
(function(){
  const defs=[
    {el:$('inicio'),layers:[['.lab',6,3],['h1',16,9],['.row',9,5]],wind:true},
    {el:$('newsletter'),layers:[['.ic',24,14],['.mid h2',12,7],['.mid p',6,4],['.badge',10,6],['#r1',-30,-10],['#r2',30,10]]}
  ].filter(d=>d.el);
  if(!defs.length||reduce)return;
  defs.forEach(d=>{d.layers=d.layers.map(l=>({n:[...d.el.querySelectorAll(l[0])],dx:l[1],dy:l[2]})).filter(l=>l.n.length);d.vis=false;d.x=0;d.y=0});
  let tx=0,ty=0,raf=0,have=false,baseB=null;
  function anyVis(){return defs.some(d=>d.vis)}
  function loop(){
    let moving=false;
    defs.forEach(d=>{
      if(!d.vis)return;
      let gx=tx,gy=ty;
      if(fine){ /* mouse: y relativo ao centro da seção */
        const r=d.el.getBoundingClientRect();gy=clamp((mouseY-(r.top+r.height/2))/(innerHeight/2),-1,1);
      }
      d.x+=(gx-d.x)*.08;d.y+=(gy-d.y)*.08;
      if(Math.abs(gx-d.x)>.002||Math.abs(gy-d.y)>.002)moving=true;
      d.layers.forEach(l=>l.n.forEach(n=>{n.style.translate=(d.x*l.dx).toFixed(2)+'px '+(d.y*l.dy).toFixed(2)+'px'}));
      if(d.wind)wind.x=d.x;
    });
    raf=(anyVis()&&(moving||fine||have))?requestAnimationFrame(loop):0;
  }
  const kick=()=>{if(!raf)raf=requestAnimationFrame(loop)};
  defs.forEach(d=>new IntersectionObserver(es=>{d.vis=es[0].isIntersecting;if(d.vis)kick();else if(d.wind)wind.x=0}).observe(d.el));
  let mouseY=innerHeight/2;
  if(fine){
    addEventListener('mousemove',e=>{tx=clamp((e.clientX-innerWidth/2)/(innerWidth/2),-1,1);mouseY=e.clientY;kick()},{passive:true});
  }else if('DeviceOrientationEvent' in window){
    const onOri=e=>{
      if(e.gamma==null||e.beta==null)return;
      const portrait=innerHeight>=innerWidth;
      let g=portrait?e.gamma:e.beta,b=portrait?e.beta:-e.gamma;
      if(baseB===null)baseB=b;baseB+=(b-baseB)*.015; /* recalibra devagar: o "neutro" acompanha a sua postura */
      tx=clamp(g/22,-1,1);ty=clamp((b-baseB)/22,-1,1);have=true;kick();
    };
    const attach=()=>addEventListener('deviceorientation',onOri,{passive:true});
    if(typeof DeviceOrientationEvent.requestPermission==='function'){
      /* iPhone: o iOS exige uma permissão, pedida no primeiro toque na página */
      let asked=false;
      const ask=()=>{if(asked)return;asked=true;try{DeviceOrientationEvent.requestPermission().then(s=>{if(s==='granted')attach()}).catch(()=>{})}catch(e){}};
      addEventListener('touchend',ask,{once:true,passive:true});
    }else attach();
  }
})();

/* ================= 3. capas dos projetos no touch: scroll + pinça ================= */
(function(){
  if(!touch)return;
  const cards=[...document.querySelectorAll('.sc[data-cover]')];
  if(!cards.length)return;
  const P=[0,.5,1]; /* 0 = só cor, .5 = capa pequena (igual ao hover), 1 = capa cheia */
  const st=new Map();cards.forEach(c=>st.set(c,{p:0,manual:false}));
  function setP(c,p,ani){
    const s=st.get(c);s.p=p;
    c.style.setProperty('--p',p);
    c.classList.toggle('full',p>=.75);
  }
  function snap(c){
    const p=st.get(c).p,t=p<.25?0:p<.75?1:2;setP(c,P[t]);return t;
  }
  /* automático: a capa pequena aparece quando o card entra na tela (e some ao voltar) */
  let ticking=false;
  function auto(){
    ticking=false;
    cards.forEach(c=>{
      const s=st.get(c);if(s.manual)return;
      const r=c.getBoundingClientRect(),inView=r.top<innerHeight*.62&&r.bottom>innerHeight*.12;
      const want=inView?.5:0;
      if(want!==s.p){setP(c,want);if(want)hap(8)}
    });
  }
  addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(auto)}},{passive:true});
  addEventListener('resize',auto);auto();
  /* pinça: abrir com dois dedos revela a capa (acompanha o dedo), fechar esconde */
  cards.forEach(c=>{
    let d0=0,p0=0,on=false,lastT=-1;
    const dist=e=>Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
    c.addEventListener('touchstart',e=>{
      if(e.touches.length===2){on=true;d0=dist(e);p0=st.get(c).p;lastT=-1;c.classList.add('pinching');st.get(c).manual=true;e.preventDefault()}
    },{passive:false});
    c.addEventListener('touchmove',e=>{
      if(!on||e.touches.length!==2)return;e.preventDefault();
      const p=clamp(p0+(dist(e)/d0-1)*1.2,0,1);setP(c,p);
      const t=p<.25?0:p<.75?1:2;if(t!==lastT){if(lastT!==-1)hap(10);lastT=t}
    },{passive:false});
    const end=e=>{
      if(!on)return;if(e.touches.length>=2)return;
      on=false;c.classList.remove('pinching');const t=snap(c);hap(t===0?[6]:t===2?[12,30,12]:[8]);
    };
    c.addEventListener('touchend',end);c.addEventListener('touchcancel',end);
    ['gesturestart','gesturechange'].forEach(g=>c.addEventListener(g,e=>e.preventDefault())); /* Safari: evita o zoom da página */
  });
})();
})();
