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

/* ================= 1. chuva de partículas quadradas (hero) ================= */
const wind={x:0}; /* o giroscópio/mouse empurra a chuva */
(function(){
  const hero=$('inicio'),cv=$('rain');
  if(!hero||!cv||reduce)return;
  const mq=hero.querySelector('.mq'),ctx=cv.getContext('2d');
  const cvF=cv.cloneNode();cvF.id='rainFront';cvF.classList.add('front');cv.after(cvF);const ctxF=cvF.getContext('2d'); /* frente do texto: partículas que batem */
  let light=true,w=0,h=0,dpr=1,parts=[],vis=true,raf=0,cMut='#6b6a66',cAcc='#CA271C',frameN=0,last=0;
  const MAX=()=>Math.round(clamp(w/4.5,120,360)); /* AJUSTE: quantidade máxima de partículas */
  function size(){
    dpr=Math.min(devicePixelRatio||1,2);w=hero.clientWidth;h=Math.max(0,hero.clientHeight-(mq?mq.offsetHeight:0));
    [cv,cvF].forEach(c=>{c.style.height=h+'px';c.width=Math.round(w*dpr);c.height=Math.round(h*dpr)});ctx.setTransform(dpr,0,0,dpr,0,0);ctxF.setTransform(dpr,0,0,dpr,0,0);
  }
  /* retângulos de texto (h1 por linha, rótulo e botões) onde parte das partículas bate */
  let rects=[];
  function measureText(){
    rects=[];const hr=hero.getBoundingClientRect();
    hero.querySelectorAll('.lab b,.lab>span,h1,.row p,.row .btn').forEach(el=>{
      let list;
      if(el.tagName==='H1'){const rg=document.createRange();rg.selectNodeContents(el);list=[...rg.getClientRects()]}else list=[el.getBoundingClientRect()];
      list.forEach(r=>{if(r.width>8&&r.height>8)rects.push({l:r.left-hr.left,r:r.right-hr.left,t:r.top-hr.top+r.height*.12})});
    });
  }
  function colors(){const s=getComputedStyle(document.documentElement);const bg=s.getPropertyValue('--bg').trim().toLowerCase();light=/^#f/.test(bg);cMut=light?'#3a3935':(s.getPropertyValue('--mut').trim()||cMut); /* AJUSTE: cinza no modo claro */cAcc=s.getPropertyValue('--acc').trim()||cAcc}
  function spawn(init){
    const s=Math.random()<.5?2:Math.random()<.7?3:5; /* AJUSTE: tamanhos 2, 3 e 5 px */
    parts.push({x:Math.random()*w,y:init?Math.random()*h:-s-Math.random()*40,s,vy:1.1+Math.random()*1.8,vx:0,
      a:.35+Math.random()*.5,c:Math.random()<.5?1:0,land:0,rest:false,hit:Math.random()<.5,on:null});
  }
  function step(t){
    const dt=Math.min(2.2,(t-last)/16.67||1);last=t;frameN++;
    if(frameN%90===1)colors();
    ctx.clearRect(0,0,w,h);ctxF.clearRect(0,0,w,h);
    const max=MAX();
    if(parts.length<max&&Math.random()<2.4*dt)spawn(false);
    for(let i=parts.length-1;i>=0;i--){
      const p=parts[i];
      if(!p.rest){
        p.vy+=.045*dt;p.vx+=(wind.x*4-p.vx)*.04*dt;
        const py=p.y;p.x+=p.vx*dt*1.6;p.y+=p.vy*dt;
        if(p.hit){for(const r of rects){if(p.x+p.s>r.l&&p.x<r.r&&py+p.s<=r.t+2&&p.y+p.s>=r.t){p.y=r.t-p.s;if(p.vy>2.2){p.vy*=-.3;p.vx+=(Math.random()-.5)*1.4}else{p.rest=true;p.vy=0}break}}}
        if(p.x<-6)p.x=w+6;else if(p.x>w+6)p.x=-6;
        if(p.y+p.s>=h){ /* chão = topo da faixa com o slide automático */
          p.y=h-p.s;
          if(p.vy>1.6){p.vy*=-.28;p.vx*=.5}else{p.rest=true;p.vy=0}
        }
      }else{p.land+=dt;p.a-=.02*dt;if(p.a<=0){parts.splice(i,1);continue}}
      const cx=p.hit?ctxF:ctx;cx.globalAlpha=Math.min(1,Math.max(0,p.a)*(light?1.35:1));cx.fillStyle=p.c?cAcc:cMut;cx.fillRect(Math.round(p.x),Math.round(p.y),p.s,p.s);
    }
    ctx.globalAlpha=1;ctxF.globalAlpha=1;
    raf=vis?requestAnimationFrame(step):0;
  }
  window.rainMeasure=measureText; /* a caixa de seleção do h1 chama isto ao soltar, para a chuva bater no texto na nova posição */
  size();measureText();for(let i=0;i<MAX()*.5;i++)spawn(true);
  addEventListener('resize',()=>{size();measureText();parts.length=Math.min(parts.length,MAX())});
  addEventListener('load',()=>{size();measureText()});if(document.fonts&&document.fonts.ready)document.fonts.ready.then(measureText);
  new IntersectionObserver(es=>{vis=es[0].isIntersecting;if(vis&&!raf){last=performance.now();raf=requestAnimationFrame(step)}}).observe(hero);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){vis=false}else{vis=true;if(!raf){last=performance.now();raf=requestAnimationFrame(step)}}});
  raf=requestAnimationFrame(step);
})();

/* ================= caixa de seleção do hero (estilo Photoshop) =================
   O título é todo preto; só o que está debaixo da caixa fica vermelho. A caixa começa em volta do "funcionam." mas é livre: arraste o centro para mover, os 4 cantos para
   redimensionar (o canto oposto fica fixo), duplo clique volta ao original. Tudo que fica debaixo dela
   vira vermelho (cópia vermelha do h1, recortada no tamanho da caixa). Limite: só dentro do hero,
   acima da faixa de serviços. AJUSTE: MIN = tamanho mínimo (px). */
(function(){
  const hero=$('inicio'),h1=hero&&hero.querySelector('h1'),word=h1&&h1.querySelector('.acc'),mq=hero&&hero.querySelector('.mq');
  if(!word)return;
  const MIN=40;
  const box=document.createElement('span');box.className='sel';box.dataset.cur='Arrastar';box.setAttribute('aria-hidden','true');
  ['tl','tr','bl','br'].forEach(c=>{const i=document.createElement('i');i.className='sh '+c;i.dataset.c=c;i.dataset.cur='Redimensionar';box.appendChild(i)});
  const rl=document.createElement('span');rl.className='rl';rl.setAttribute('aria-hidden','true');
  rl.innerHTML=h1.innerHTML; /* cópia do título que fica vermelha (CSS .rl) e só aparece dentro da caixa */
  const bl=document.createElement('span');bl.className='bl'; /* texto preto: recortado debaixo da caixa, para não vazar um contorno preto em volta do vermelho */
  while(h1.firstChild)bl.appendChild(h1.firstChild);
  h1.append(bl,box,rl);
  let R={x:0,y:0,w:0,h:0},def=R,d=null,moved=false,lw=innerWidth;
  const apply=()=>{
    const{x,y,w,h}=R;
    box.style.cssText=`left:${x}px;top:${y}px;width:${w}px;height:${h}px`;
    rl.style.clipPath=`polygon(${x}px ${y}px,${x+w}px ${y}px,${x+w}px ${y+h}px,${x}px ${y+h}px)`;
    bl.style.clipPath=`path(evenodd,'M-9999 -9999H9999V9999H-9999Z M${x} ${y}h${w}v${h}h${-w}Z')`;
  };
  function place(){ /* posição inicial: em volta do "funcionam." (coordenadas relativas ao h1) */
    const hr=h1.getBoundingClientRect(),wr=word.getBoundingClientRect(),fs=parseFloat(getComputedStyle(h1).fontSize),h=fs*1.12;
    def={x:wr.left-hr.left-fs*.12,y:wr.top-hr.top+wr.height/2-h/2,w:wr.width+fs*.24,h};
    if(!moved){R={...def};apply()}
  }
  place();
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(place);addEventListener('load',place);
  box.addEventListener('pointerdown',e=>{
    if(e.button)return;e.preventDefault();
    const hr=hero.getBoundingClientRect(),r1=h1.getBoundingClientRect();
    d={c:(e.target.closest('.sh')||{dataset:{}}).dataset.c||'',id:e.pointerId,px:e.clientX,py:e.clientY,
       l:hr.left-r1.left,r:hr.right-r1.left,t:hr.top-r1.top,b:hr.bottom-r1.top-(mq?mq.offsetHeight:0)}; /* limites: o hero, acima da faixa de serviços */
    d.o={...R};
    try{box.setPointerCapture(e.pointerId)}catch(x){}
    box.classList.add('drag');window.selDrag=window.selLock=true;moved=true;
  });
  box.addEventListener('pointermove',e=>{
    if(!d||e.pointerId!==d.id)return;
    const dx=e.clientX-d.px,dy=e.clientY-d.py;let{x,y,w,h}=d.o;
    if(!d.c){x=clamp(x+dx,d.l,d.r-w);y=clamp(y+dy,d.t,d.b-h)}
    else{
      let x0=x,x1=x+w,y0=y,y1=y+h;
      if(d.c[1]==='l')x0=clamp(x0+dx,d.l,x1-MIN);else x1=clamp(x1+dx,x0+MIN,d.r);
      if(d.c[0]==='t')y0=clamp(y0+dy,d.t,y1-MIN);else y1=clamp(y1+dy,y0+MIN,d.b);
      x=x0;y=y0;w=x1-x0;h=y1-y0;
    }
    R={x,y,w,h};apply();
  });
  const end=e=>{
    if(!d||e.pointerId!==d.id)return;
    d=null;window.selDrag=window.selLock=false;box.classList.remove('drag');window.rainMeasure&&window.rainMeasure();
    (document.elementFromPoint(e.clientX,e.clientY)||box).dispatchEvent(new MouseEvent('mouseover',{bubbles:true})); /* reavalia o rótulo do cursor */
  };
  box.addEventListener('pointerup',end);box.addEventListener('pointercancel',end);
  box.addEventListener('dblclick',()=>{moved=false;R={...def};apply();window.rainMeasure&&window.rainMeasure()});
  box.addEventListener('dragstart',e=>e.preventDefault());
  addEventListener('resize',()=>{if(innerWidth!==lw){lw=innerWidth;moved=false;place()}}); addEventListener('langchange',()=>{moved=false;place();window.rainMeasure&&window.rainMeasure()}); /* o texto muda de largura ao trocar PT/EN */ /* a posição guardada não vale em outra largura */
})();

/* ================= 4. giroscópio (mobile) / mouse (desktop): hero e newsletter ================= */
(function(){
  const defs=[
    {el:$('inicio'),layers:[['.lab',24,12],['h1',64,34],['.row',34,18]],wind:true},
    {el:$('newsletter'),layers:[['.lab',40,22],['.ic',90,52],['.mid h2',50,28],['.mid p',24,15],['.badge',42,22],['#r1',-110,-36],['#r2',110,36]]}
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
      d.x+=(gx-d.x)*.11;d.y+=(gy-d.y)*.11;
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
    addEventListener('mousemove',e=>{if(window.selDrag)return; /* parallax pausa enquanto a caixa de seleção é arrastada */tx=clamp((e.clientX-innerWidth/2)/(innerWidth/2),-1,1);mouseY=e.clientY;kick()},{passive:true});
  }else if('DeviceOrientationEvent' in window){
    const onOri=e=>{
      if(e.gamma==null||e.beta==null)return;
      const portrait=innerHeight>=innerWidth;
      let g=portrait?e.gamma:e.beta,b=portrait?e.beta:-e.gamma;
      if(baseB===null)baseB=b;baseB+=(b-baseB)*.015; /* recalibra devagar: o "neutro" acompanha a sua postura */
      tx=clamp(g/9,-1,1);ty=clamp((b-baseB)/9,-1,1);have=true;kick();
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

/* ================= logo (volta ao topo deslizando) + transição para páginas de projeto ================= */
(function(){
  const logo=document.querySelector('nav .logo');
  if(logo)logo.addEventListener('click',e=>{
    if(e.metaKey||e.ctrlKey||e.shiftKey||e.button)return;
    e.preventDefault();try{sessionStorage.removeItem('ldSkip')}catch(x){}
    scrollTo({top:0,behavior:'smooth'});
  });
  addEventListener('pageshow',e=>{if(e.persisted)document.querySelectorAll('.pt-out').forEach(o=>o.remove())});
  document.addEventListener('click',e=>{
    const a=e.target.closest&&e.target.closest('a[href*="projetos/"]');
    if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||e.button||a.target==='_blank')return;
    e.preventDefault();
    try{sessionStorage.setItem('pt','1')}catch(x){}
    const os=['#0d0d0c','#f4f3ef','#CA271C'].map((c,i)=>{const o=document.createElement('div');o.className='pt-out';o.style.background=c;o.style.transitionDelay=(i*.07)+'s';o.setAttribute('aria-hidden','true');document.body.appendChild(o);return o});
    void document.body.offsetWidth;os.forEach(o=>o.classList.add('on'));hap&&hap([8,50,8]);
    setTimeout(()=>{location.href=a.href},reduce?0:560); /* AJUSTE: tempo até abrir o projeto (ms); casar com .42s no fx.css */
  });
})();
})();
