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

/* ================= progresso dos serviços (só desktop): cinco segmentos acompanham a rolagem da seção ================= */
(function(){
  const sec=$('servicos'),progress=$('sv-progress');
  if(!sec||!progress)return;
  const segments=[...progress.querySelectorAll('.sv-progress-lines span')];
  let raf=0;
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  function update(){
    raf=0;
    if(innerWidth<=820)return;
    const top=sec.getBoundingClientRect().top+scrollY;
    const range=Math.max(1,sec.offsetHeight-innerHeight);
    const amount=clamp((scrollY-top)/range,0,1)*segments.length;
    segments.forEach((segment,i)=>segment.style.setProperty('--fill',clamp(amount-i,0,1)));
  }
  function schedule(){if(!raf)raf=requestAnimationFrame(update)}
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule,{passive:true});
  addEventListener('load',schedule,{once:true});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(schedule);
  update();
})();

/* ================= 2. serviços (só mobile): retângulo vermelho que preenche o bloco ativo ================= */
(function(){
  const sec=$('servicos'),mk=$('svmark');
  if(!sec||!mk)return;
  const svs=[...sec.querySelectorAll('.sv')];
  const on=()=>innerWidth<=820;
  let rects=[],act=-2,y=0,hh=0,ty=0,th=0,raf=0,vis=false,opa=0,top=0;
  function measure(){
    const sr=sec.getBoundingClientRect();
    rects=svs.map(s=>{const r=s.getBoundingClientRect();return{t:r.top-sr.top,h:r.height,l:r.left-sr.left,w:r.width}});
    if(rects.length){mk.style.left=(rects[0].l-10)+'px';mk.style.width=(rects[0].w+20)+'px'}
  }
  function target(){
    const sr=sec.getBoundingClientRect(),line=innerHeight*.55-sr.top; /* AJUSTE: .55 = linha de leitura */
    let a=-1;rects.forEach((r,i)=>{if(r.t<=line)a=i});
    const L=rects[rects.length-1];const after=!!L&&line>L.t+L.h;if(after)a=-1;
    if(a!==act){
      if(act!==-2&&a>=0)hap(8);
      act=a;svs.forEach((s,i)=>s.classList.toggle('act',i===a));
    }
    if(a<0){th=0;opa=0;if(rects[0]){ty=after?L.t+L.h:rects[0].t}} /* saída: desce até sumir; entrada: nasce no 1º bloco */
    else{ty=rects[a].t+2;th=rects[a].h-2;opa=1} /* +2/-2: não cobre a linha divisória de cima */
  }
  function frame(){
    if(!on()){raf=0;mk.style.opacity=0;return}
    target();
    const k=reduce?1:.16;
    y+=(ty-y)*k;hh+=(th-hh)*k;
    mk.style.transform=`translate3d(0,${y.toFixed(1)}px,0)`;
    mk.style.height=Math.max(0,hh).toFixed(1)+'px';
    mk.style.opacity=hh>1?1:0;
    const moving=Math.abs(ty-y)>.3||Math.abs(th-hh)>.3;
    raf=(vis||moving)?requestAnimationFrame(frame):0;
  }
  const kick=()=>{if(!raf&&on())raf=requestAnimationFrame(frame)};
  measure();target();y=ty;hh=0;
  addEventListener('resize',()=>{measure();kick()});
  addEventListener('load',()=>{measure();kick()});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{measure();kick()});
  addEventListener('scroll',kick,{passive:true});
  new IntersectionObserver(es=>{vis=es[0].isIntersecting;if(vis)kick()},{rootMargin:'200px 0px'}).observe(sec);
  kick();
})();

/* ================= 3. capas dos projetos no touch: scroll + pinça ================= */
(function(){
  if(!touch)return;
  const legacyCards=[...document.querySelectorAll('.sc[data-cover]')];
  const homeCards=[...document.querySelectorAll('.work .pc[data-tags]')];
  const cards=[...legacyCards,...homeCards];
  if(!cards.length)return;
  const P=[0,.5,1]; /* 0 = só cor, .5 = capa pequena (igual ao hover), 1 = capa cheia */
  const st=new Map();cards.forEach(c=>st.set(c,{p:0,manual:false}));
  function setP(c,p,ani){
    const s=st.get(c);s.p=p;
    c.style.setProperty('--p',p);
    c.classList.toggle('full',p>=.75);
    if(c.matches('.work .pc[data-tags]')){
      const width=c.getBoundingClientRect().width;
      const height=Math.round((c.dataset.preview==='post'?Math.min(width*1.25,520):Math.min(width*.62,380))*p);
      c.style.setProperty('--cover-height',height+'px');
      c.classList.toggle('is-active',p>.02);
    }
  }
  function snap(c){
    const p=st.get(c).p,t=p<.25?0:p<.75?1:2;setP(c,P[t]);return t;
  }
  /* Na lista mobile, cada linha de projeto é um ponto de parada da rolagem. */
  let ticking=false,snapSuppressed=false,homeTargetIndex=-1,lastHomeY=scrollY;
  const homeFocusLine=()=>innerHeight*.5+(parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)||0)*.5;
  function updateHomeSnap(){
    if(!homeCards.length)return;
    const first=homeCards[0].querySelector('.pc-row'),last=document.querySelector('.work .pc.cta .pc-row')||homeCards[homeCards.length-1].querySelector('.pc-row');
    if(!first||!last)return;
    const a=first.getBoundingClientRect(),b=last.getBoundingClientRect();
    const inList=a.top<innerHeight*.72&&b.bottom>innerHeight*.28;
    if(!inList)snapSuppressed=false;
    document.documentElement.classList.toggle('work-snap',inList&&!snapSuppressed);
  }
  function findHomeTarget(){
    const section=document.querySelector('.work'),list=document.querySelector('.project-list');
    if(!section||!list)return null;
    const line=homeFocusLine(),bounds=section.getBoundingClientRect(),listBounds=list.getBoundingClientRect();
    if(!(bounds.top<line&&bounds.bottom>line)||line<listBounds.top-100||line>listBounds.bottom){homeTargetIndex=-1;lastHomeY=scrollY;return null}
    const rowCenter=card=>{const row=card&&card.querySelector('.pc-row');if(!row)return Infinity;const r=row.getBoundingClientRect();return(r.top+r.bottom)/2};
    const cta=list.querySelector('.pc.cta .pc-row'),ctaCenter=rowCenter(cta&&cta.closest('.pc'));
    if(cta&&Math.abs(ctaCenter-line)<Math.max(70,innerHeight*.12)){homeTargetIndex=-1;lastHomeY=scrollY;return null}
    const direction=Math.sign(scrollY-lastHomeY);lastHomeY=scrollY;
    if(homeTargetIndex<0||!homeCards[homeTargetIndex]||homeCards[homeTargetIndex].hidden){
      let nearest=-1,minDistance=Infinity;
      homeCards.forEach((card,index)=>{if(card.hidden)return;const distance=Math.abs(rowCenter(card)-line);if(distance<minDistance){minDistance=distance;nearest=index}});
      if(minDistance<Math.max(100,innerHeight*.3))homeTargetIndex=nearest;
      return homeCards[homeTargetIndex]||null;
    }
    const anchorBuffer=Math.max(24,Math.min(48,innerHeight*.045));
    if(direction>0&&homeTargetIndex<homeCards.length-1&&rowCenter(homeCards[homeTargetIndex+1])<=line+anchorBuffer)homeTargetIndex++;
    else if(direction<0&&homeTargetIndex>0&&rowCenter(homeCards[homeTargetIndex-1])>=line-anchorBuffer)homeTargetIndex--;
    return homeCards[homeTargetIndex]||null;
  }
  function setHomeTarget(target){
    homeTargetIndex=target?homeCards.indexOf(target):-1;
    if(!target)lastHomeY=scrollY;
    homeCards.forEach(c=>{
      const want=c===target?1:0,s=st.get(c);
      if(s.p!==want){setP(c,want);if(want)hap(8)}
    });
  }
  function auto(){
    ticking=false;
    updateHomeSnap();
    legacyCards.forEach(c=>{
      const s=st.get(c);if(s.manual)return;
      const r=c.getBoundingClientRect(),inView=r.top<innerHeight*.62&&r.bottom>innerHeight*.12;
      const want=inView?.5:0;
      if(want!==s.p){setP(c,want);if(want)hap(8)}
    });
    if(homeCards.length)setHomeTarget(findHomeTarget());
  }
  addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(auto)}},{passive:true});
  addEventListener('resize',()=>{homeCards.forEach(c=>setP(c,st.get(c).p));auto()});auto();
  document.addEventListener('click',e=>{
    if(!e.target.closest('a[href^="#"]'))return;
    snapSuppressed=true;document.documentElement.classList.remove('work-snap');
  });
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
