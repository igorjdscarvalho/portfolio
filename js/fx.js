/* Igor Carvalho - interatividades (v1.2). Só a home usa este arquivo.
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

/* ================= progresso dos serviços: cinco segmentos acompanham a etapa visível ================= */
(function(){
  const sec=$('servicos'),progress=$('sv-progress');
  if(!sec||!progress)return;
  const segments=[...progress.querySelectorAll('.sv-progress-lines span')];
  const icons=[...progress.querySelectorAll('.sv-progress-icon')];
  const svs=[...sec.querySelectorAll('.sv')];
  let raf=0;
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  function update(){
    raf=0;
    let amount=0;
    if(innerWidth<=820){
      const sectionRect=sec.getBoundingClientRect();
      if(sectionRect.bottom<=0)amount=segments.length;
      else if(sectionRect.top<innerHeight){
        const focusY=Math.min(innerHeight-8,Math.max(progress.getBoundingClientRect().bottom+12,innerHeight*.68));
        const rects=svs.map(s=>s.getBoundingClientRect());
        let current=-1;
        rects.forEach((r,i)=>{if(r.top<=focusY)current=i});
        if(current>=0){
          const r=rects[current];
          amount=clamp(current+clamp((focusY-r.top)/Math.max(1,r.height),0,1),0,segments.length);
        }
      }
      progress.classList.add('has-icons');
    }else{
      const top=sec.getBoundingClientRect().top+scrollY;
      const range=Math.max(1,sec.offsetHeight-innerHeight);
      amount=clamp((scrollY-top)/range,0,1)*segments.length;
      progress.classList.toggle('has-icons',amount>0.001);
    }
    segments.forEach((segment,i)=>segment.style.setProperty('--fill',clamp(amount-i,0,1)));
    /* no desktop, cada ícone aparece quando sua barra começa a encher; no mobile, todos permanecem visíveis no cabeçalho fixo */
    const current=amount>0?Math.min(Math.floor(amount),icons.length-1):-1;
    icons.forEach((icon,i)=>{icon.classList.toggle('on',amount-i>0.001);icon.classList.toggle('now',i===current)});
  }
  function schedule(){if(!raf)raf=requestAnimationFrame(update)}
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule,{passive:true});
  addEventListener('load',schedule,{once:true});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(schedule);
  update();
})();

/* ================= 3. capas dos projetos no touch ================= */
(function(){
  if(!touch)return;
  const legacyCards=[...document.querySelectorAll('.sc[data-cover]')];
  const homeCards=[...document.querySelectorAll('.work .pc[data-tags]')];

  /* ---------- 3a. cartões antigos (.sc): rolagem + pinça ---------- */
  const P=[0,.5,1]; /* 0 = só cor, .5 = capa pequena (igual ao hover), 1 = capa cheia */
  const st=new Map();legacyCards.forEach(c=>st.set(c,{p:0,manual:false}));
  function setP(c,p){
    const s=st.get(c);s.p=p;
    c.style.setProperty('--p',p);
    c.classList.toggle('full',p>=.75);
  }
  function snap(c){
    const p=st.get(c).p,t=p<.25?0:p<.75?1:2;setP(c,P[t]);return t;
  }
  if(legacyCards.length){
    const autoLegacy=()=>legacyCards.forEach(c=>{
      const s=st.get(c);if(s.manual)return;
      const r=c.getBoundingClientRect(),inView=r.top<innerHeight*.62&&r.bottom>innerHeight*.12;
      const want=inView?.5:0;
      if(want!==s.p){setP(c,want);if(want)hap(8)}
    });
    addEventListener('scroll',autoLegacy,{passive:true});autoLegacy();
  }
  /* pinça: abrir com dois dedos revela a capa (acompanha o dedo), fechar esconde */
  legacyCards.forEach(c=>{
    let d0=0,p0=0,on=false,lastT=-1;
    const dist=e=>Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
    c.addEventListener('touchstart',e=>{
      if(e.touches.length===2){on=true;d0=dist(e);p0=st.get(c).p;lastT=-1;c.classList.add('pinching');st.get(c).manual=true;e.preventDefault()}
    },{passive:false});
    c.addEventListener('touchmove',e=>{
      if(!on||e.touches.length!==2)return;e.preventDefault();
      const p=clamp(p0+(dist(e)/Math.max(1,d0)-1)*1.2,0,1);setP(c,p);
      const t=p<.25?0:p<.75?1:2;if(t!==lastT){if(lastT!==-1)hap(10);lastT=t}
    },{passive:false});
    const end=e=>{
      if(!on)return;if(e.touches.length>=2)return;
      on=false;c.classList.remove('pinching');const t=snap(c);hap(t===0?[6]:t===2?[12,30,12]:[8]);
    };
    c.addEventListener('touchend',end);c.addEventListener('touchcancel',end);
    ['gesturestart','gesturechange'].forEach(g=>c.addEventListener(g,e=>e.preventDefault())); /* Safari: evita o zoom da página */
  });

  /* ---------- 3b. lista de projetos da home: a capa abre embaixo da linha em foco ----------
     Como funciona (ajustes: procure "AJUSTE"):
     - Existe UMA linha de foco fixa na tela (LINE). O dono da capa é a última linha do projeto cujo topo já
       passou dessa linha. Isso só depende da posição de cada linha, nunca do tamanho das capas, então abrir
       ou fechar uma capa não muda quem é o dono (era isso que fazia a lista "pular" de projeto).
     - A capa do dono abre embaixo da linha dele. Capas antigas NÃO fecham enquanto o dedo/inércia rolam
       (fechar uma capa acima da tela empurraria o conteúdo para cima); fecham quando a rolagem para.
     - Quando uma capa fecha acima da linha em foco, a rolagem é compensada a cada quadro, então o que está
       na tela fica no mesmo lugar.
     - Sem scroll-snap: ele reposicionava a página toda vez que o layout mudava.
     - Em rolagem muito rápida a capa espera desacelerar; em rolagem por link (menu/busca) nada abre até parar. */
  if(!homeCards.length)return;
  const cta=document.querySelector('.work .pc.cta');
  const rows=[...homeCards,...(cta?[cta]:[])]; /* a última linha é o CTA, que não tem capa */
  const rowOf=c=>c.querySelector('.pc-row');
  const OPEN_MS=reduce?0:620,CLOSE_MS=reduce?0:460; /* AJUSTE: duração de abrir / recolher a capa */
  const HYS=14;   /* AJUSTE: faixa (px) em volta da linha de foco que evita abrir/fechar repetido */
  const FAST=1.6; /* AJUSTE: px/ms; acima disso a rolagem é considerada "passando direto" */
  const easeOut=t=>1-Math.pow(1-t,3),easeIO=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  const S=new Map(homeCards.map(c=>[c,{h:0,from:0,to:0,t0:0,dur:0,tw:false}]));
  homeCards.forEach(c=>{const i=c.querySelector('img');if(i)i.loading='eager'}); /* a capa já está pronta quando abre */

  let owner=-1,LINE=0,anchor=null,anchorY=0,raf=0,ticking=false;
  let fingerDown=false,hold=false,lastY=scrollY,lastT=performance.now(),vel=0,idleTimer=0,slowTimer=0;

  const coverH=c=>{
    const w=c.getBoundingClientRect().width;
    return Math.round(c.dataset.preview==='post'?Math.min(w*1.25,520,innerHeight*.56):Math.min(w*.62,380));
  };
  /* AJUSTE: a linha de foco fica no ponto em que a linha do projeto + a capa mais alta cabem na tela */
  function measureLine(){
    const r=rowOf(homeCards[0]).getBoundingClientRect().height||186;
    const tall=Math.min(homeCards[0].getBoundingClientRect().width*1.25,520,innerHeight*.56);
    LINE=clamp(innerHeight-r-tall-28,96,innerHeight*.4);
  }
  const apply=c=>c.style.setProperty('--cover-height',S.get(c).h.toFixed(1)+'px');
  const rowTop=i=>rowOf(rows[i]).getBoundingClientRect().top;

  function anchorPrep(){
    if(anchor)return;
    let i=owner;
    if(i<0)i=0;
    anchor=rowOf(rows[i]);anchorY=anchor.getBoundingClientRect().top+scrollY;
  }
  function tweenTo(c,to,ms){
    const s=S.get(c);s.from=s.h;s.to=to;s.t0=performance.now();s.dur=ms;s.tw=true;
    if(!ms){s.h=to;s.tw=false;apply(c);return}
    if(!raf)raf=requestAnimationFrame(tick);
  }
  function tick(now){
    raf=0;let busy=false;
    homeCards.forEach(c=>{
      const s=S.get(c);if(!s.tw)return;
      const k=s.dur?Math.min(1,(now-s.t0)/s.dur):1;
      s.h=s.from+(s.to-s.from)*(s.to>s.from?easeOut(k):easeIO(k));
      if(k>=1){s.h=s.to;s.tw=false}else busy=true;
      apply(c);
    });
    /* compensação: se a linha-âncora mudou de lugar NO DOCUMENTO (capa fechando acima dela), rola o mesmo tanto */
    if(anchor){
      const y=anchor.getBoundingClientRect().top+scrollY,d=y-anchorY;
      if(Math.abs(d)>.25)scrollTo({top:scrollY+d,left:0,behavior:'instant'});
      anchorY=y;
    }
    if(busy)raf=requestAnimationFrame(tick);else anchor=null;
  }

  function ownerNow(){
    let n=owner;
    while(n+1<rows.length&&rowTop(n+1)<=LINE-HYS)n++;
    while(n>=0&&rowTop(n)>LINE+HYS)n--;
    return n;
  }
  function openOwner(){
    const c=homeCards[owner];
    if(!c||hold||vel>FAST)return;
    const s=S.get(c);
    if(s.to>0)return; /* já aberta ou abrindo */
    anchorPrep();
    c.classList.add('is-open');
    tweenTo(c,coverH(c),OPEN_MS);hap(8);
  }
  function evaluate(){
    const n=ownerNow();
    if(n!==owner){owner=n;homeCards.forEach((c,i)=>c.classList.toggle('is-active',i===owner))}
    openOwner();
  }
  /* a rolagem parou: recolhe as capas que não são a do dono */
  function settle(){
    if(fingerDown)return;
    hold=false;vel=0;
    evaluate();
    const keep=homeCards[owner];
    homeCards.forEach(c=>{
      if(c===keep)return;
      const s=S.get(c);if(s.to<=0)return;
      anchorPrep();
      c.classList.remove('is-open');
      tweenTo(c,0,CLOSE_MS);
    });
  }

  addEventListener('scroll',()=>{
    const now=performance.now(),dt=Math.max(1,now-lastT);
    vel=vel*.5+(Math.abs(scrollY-lastY)/dt)*.5;lastY=scrollY;lastT=now;
    if(!ticking){ticking=true;requestAnimationFrame(()=>{ticking=false;evaluate()})}
    clearTimeout(slowTimer);slowTimer=setTimeout(()=>{vel=0;evaluate()},90);
    clearTimeout(idleTimer);idleTimer=setTimeout(settle,180);
  },{passive:true});
  addEventListener('touchstart',()=>{fingerDown=true},{passive:true});
  ['touchend','touchcancel'].forEach(t=>addEventListener(t,()=>{fingerDown=false;clearTimeout(idleTimer);idleTimer=setTimeout(settle,180)},{passive:true}));
  /* rolagem por link (menu, busca da hero): nada abre durante o deslize, para o destino não andar */
  const nativeScrollIntoView=Element.prototype.scrollIntoView;
  Element.prototype.scrollIntoView=function(){
    hold=true;clearTimeout(idleTimer);idleTimer=setTimeout(settle,600);
    return nativeScrollIntoView.apply(this,arguments);
  };
  function remeasure(){
    measureLine();
    homeCards.forEach(c=>{const s=S.get(c);if(s.to>0){s.h=s.to=coverH(c);s.tw=false;apply(c)}});
    evaluate();
  }
  addEventListener('resize',remeasure,{passive:true});
  addEventListener('load',()=>{remeasure();settle()},{once:true});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{remeasure()});
  measureLine();settle();
})();

/* ================= scroll suave (desktop) ================= */
(function(){
  /* scroll suave e sutil (desktop). No celular o deslizar nativo já é fluido. */
  if(!fine||reduce)return;
  let target=scrollY,cur=scrollY,raf=0,wheeling=false;
  const max=()=>document.documentElement.scrollHeight-innerHeight;
  function loop(){
    cur+=(target-cur)*.14; /* AJUSTE: .14 = suavidade (menor = mais deslizante) */
    if(Math.abs(target-cur)<.4){cur=target;wheeling=false}
    scrollTo({top:cur,behavior:'instant'});
    raf=wheeling?requestAnimationFrame(loop):0;
  }
  addEventListener('wheel',e=>{
    if(e.ctrlKey)return;
    e.preventDefault();
    if(!wheeling)target=cur=scrollY;
    const d=e.deltaMode===1?e.deltaY*32:e.deltaY;
    target=clamp(target+d,0,max());wheeling=true;if(!raf)raf=requestAnimationFrame(loop);
  },{passive:false});
  addEventListener('scroll',()=>{if(!wheeling){target=cur=scrollY}},{passive:true});
})();

/* ================= logo (volta ao topo deslizando) + transição para páginas de projeto ================= */
(function(){
  const logo=document.querySelector('nav .logo');
  if(logo)logo.addEventListener('click',e=>{
    if(e.metaKey||e.ctrlKey||e.shiftKey||e.button)return;
    e.preventDefault();
    scrollTo({top:0,behavior:'smooth'});
  });
  addEventListener('pageshow',e=>{if(e.persisted)document.querySelectorAll('.pt-out').forEach(o=>o.remove())});
  document.addEventListener('click',e=>{
    const a=e.target.closest&&e.target.closest('a[href*="projetos/"]');
    if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||e.button||a.target==='_blank')return;
    e.preventDefault();
    try{sessionStorage.setItem('pt','1');sessionStorage.setItem('projScroll',String(Math.round(window.scrollY)))}catch(x){} /* posição exata da listagem, para o botão Voltar */
    const os=['#0d0d0c','#f4f3ef','#CA271C'].map((c,i)=>{const o=document.createElement('div');o.className='pt-out';o.style.background=c;o.style.transitionDelay=(i*.07)+'s';o.setAttribute('aria-hidden','true');document.body.appendChild(o);return o});
    void document.body.offsetWidth;os.forEach(o=>o.classList.add('on'));hap&&hap([8,50,8]);
    setTimeout(()=>{location.href=a.href},reduce?0:560); /* AJUSTE: tempo até abrir o projeto (ms); casar com .42s no fx.css */
  });
})();
})();
