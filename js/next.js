/* Igor Carvalho - páginas de projeto: card "próximo projeto" (capa por scroll/pinça no touch) + transição */
(function(){
'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const touch=matchMedia('(hover:none),(pointer:coarse)').matches;
let lastH=0;
const hap=p=>{if(!touch||reduce)return;const n=performance.now();if(n-lastH<70)return;lastH=n;try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}};
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

/* ================= tela de carregamento + scroll suave ================= */
(function(){
  const ld=$('ld'),n=$('ldn'),b=$('ldb'),root=document.documentElement;
  if(ld&&root.classList.contains('noload')){ld.classList.add('gone')}
  else if(ld){
    root.classList.add('loading');
    const t0=performance.now(),MIN=reduce?200:1700; /* AJUSTE: tempo mínimo da tela de carregamento (ms) */
    let loaded=document.readyState==='complete',shown=0,done=false;
    addEventListener('load',()=>{loaded=true});
    (function tick(t){
      const el=t-t0;
      let goal=Math.min(el/MIN,1)*100;
      if(!loaded)goal=Math.min(goal,92); /* espera o site carregar de verdade */
      shown+=(goal-shown)*.12;if(goal>=100&&shown>99.5)shown=100;
      n.textContent=Math.round(shown);b.style.transform='scaleX('+(shown/100)+')';
      if(shown>=100&&!done){
        done=true;
        setTimeout(()=>{ld.classList.add('out');hap&&hap([10,40,10]);
          setTimeout(()=>{root.classList.remove('loading');ld.classList.add('gone')},950)},220);
        return;
      }
      requestAnimationFrame(tick);
    })(performance.now());
  }
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
    if(e.ctrlKey||root.classList.contains('loading'))return;
    e.preventDefault();
    if(!wheeling)target=cur=scrollY;
    const d=e.deltaMode===1?e.deltaY*32:e.deltaY;
    target=clamp(target+d,0,max());wheeling=true;if(!raf)raf=requestAnimationFrame(loop);
  },{passive:false});
  addEventListener('scroll',()=>{if(!wheeling){target=cur=scrollY}},{passive:true});
})();
/* transição ao abrir outro projeto (mesma da home) */
addEventListener('pageshow',e=>{if(e.persisted)document.querySelectorAll('.pt-out').forEach(o=>o.remove())});
document.addEventListener('click',e=>{
  const a=e.target.closest&&e.target.closest('.next a.sc-link');
  if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||e.button)return;
  e.preventDefault();try{sessionStorage.setItem('pt','1')}catch(x){}
  const os=['#0d0d0c','#f4f3ef','#CA271C'].map((c,i)=>{const o=document.createElement('div');o.className='pt-out';o.style.background=c;o.style.transitionDelay=(i*.07)+'s';document.body.appendChild(o);return o});
  void document.body.offsetWidth;os.forEach(o=>o.classList.add('on'));hap([8,50,8]);
  setTimeout(()=>{location.href=a.href},reduce?0:560);
});
})();
