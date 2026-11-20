/* Igor Carvalho - portfólio. Este arquivo serve a home e as páginas de projeto.
   Onde editar: bolhas ("items"), etapas do processo ("steps") e e-mail (procure por igorjdscarvalho). */
const $=id=>document.getElementById(id);
const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
const cur=$('cur'),cur2=$('cur2'),pv=$('pv');
const curs=[cur,cur2],cl=(n,on)=>curs.forEach(c=>c&&c.classList.toggle(n,on));
function setLabel(t){cl('tag',!!t);cl('blk',t==='Arrastar'||t==='Agendar conversa');cl('action',t==='Agendar conversa');cur.firstElementChild.textContent=t||''}

/* ===== projetos: voltar restaura a posição exata da listagem =====
   - fx.js grava window.scrollY em sessionStorage('projScroll') ao abrir um projeto;
   - o botão "← Voltar" (páginas de projeto) volta para a home e a posição é restaurada, sem passar pelo topo;
   - sem posição gravada (acesso direto), o link normal leva à seção #projetos. */
document.addEventListener('click',e=>{
  const a=e.target.closest&&e.target.closest('.det>a.btn.o[href$="#projetos"]');
  if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||e.button)return;
  try{if(sessionStorage.getItem('projScroll')===null)return;sessionStorage.setItem('projBack','1')}catch(x){return}
  e.preventDefault();location.href=a.href.split('#')[0];
});
if(window.__rs!=null){
  const y=window.__rs,de=document.documentElement;let done=false;
  const go=()=>scrollTo({top:y,left:0,behavior:'instant'});
  const fin=()=>{if(done)return;done=true;go();de.classList.remove('rs')};
  go();
  addEventListener('load',()=>{go();const f=document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve();f.then(()=>{go();requestAnimationFrame(()=>{go();fin()})})});
  setTimeout(fin,2500); /* segurança: nunca deixa a página escondida */
}

/* bolhas */
if($('grid')){
/* bubbles */
const items=[["Trajetória","Formação","Formado em Publicidade e Design Gráfico."],["Profissão","Multidisciplinar","Atuo entre branding, direção de arte e UI Design."],["Curiosidade","100% remoto","Trabalho remotamente desde meu primeiro estágio."],["Personalidade","Autodidata","Aprendo explorando, testando e criando."],["Especialidade","Tipografia","Tenho um carinho especial pelas formas das letras."],["Pessoal","Arte desde cedo","Desenho e pintura fazem parte da minha vida desde a infância."],["Processo","Além do logo","Crio sistemas visuais que vão além de símbolos."],["Especialidade","Digital","Transformo ideias em interfaces e experiências digitais."],["Inspiração","Olhar visual","Fotografia e audiovisual alimentam minha criatividade."],["Pessoal","Colecionador de sons","Vinis, música e descobertas sonoras fazem parte do meu universo."]];
const panel=$('panel'),grid=$('grid');let popped=0,card=null,ac;
function snd(){try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime;o.frequency.setValueAtTime(520,t);o.frequency.exponentialRampToValueAtTime(140,t+.09);g.gain.setValueAtTime(.2,t);g.gain.exponentialRampToValueAtTime(.001,t+.12);o.connect(g).connect(ac.destination);o.start();o.stop(t+.13)}catch(e){}}
function showCard(b,d){if(card)card.remove();const p=panel.getBoundingClientRect(),r=b.getBoundingClientRect();card=document.createElement('div');card.className='card';card.innerHTML=`<button aria-label="Fechar">×</button><span class="mono tagc">${d[0]}</span><h3>${d[1]}</h3><p>${d[2]}</p>`;panel.appendChild(card);const w=card.offsetWidth,h=card.offsetHeight;let l=r.left-p.left+r.width+10,t=r.top-p.top+r.height/2-h/2;if(l+w>p.width-8)l=r.left-p.left-w-10;l=Math.max(8,l);t=Math.max(8,Math.min(t,p.height-h-8));card.style.left=l+'px';card.style.top=t+'px';card.querySelector('button').onclick=()=>{card.remove();card=null}}
items.forEach((d,i)=>{const b=document.createElement('button');b.className='b';b.setAttribute('aria-label','Bolha '+(i+1));b.onclick=()=>{if(b.classList.contains('p')){showCard(b,d);return}b.classList.add('p');snd();window.hap&&hap(10);const p=panel.getBoundingClientRect(),r=b.getBoundingClientRect(),cx=r.left-p.left+r.width/2,cy=r.top-p.top+r.height/2;for(let k=0;k<8;k++){const s=document.createElement('i');s.className='sp';const a=Math.PI*2*k/8,dd=24+Math.random()*24;s.style.cssText=`left:${cx-4}px;top:${cy-4}px;--x:${Math.cos(a)*dd}px;--y:${Math.sin(a)*dd}px`;panel.appendChild(s);setTimeout(()=>s.remove(),500)}$('cnt').textContent=++popped+' / 10';$('stk').classList.add('off');if(popped===10)$('rst').hidden=false;setTimeout(()=>showCard(b,d),170)};grid.appendChild(b)});
$('rst').onclick=()=>{grid.querySelectorAll('.b').forEach(b=>b.classList.remove('p'));popped=0;$('cnt').textContent='0 / 10';$('stk').classList.remove('off');$('rst').hidden=true;if(card){card.remove();card=null}};
}

/* projetos: capa inline e preview flutuante ao passar o cursor no desktop. */
if(fine){
  const cards=[...document.querySelectorAll('.sc[data-cover],.work .pc[data-cover]')],warm=[];
  let previewHideTimer=0;
  cards.forEach(c=>{
    c.addEventListener('mouseenter',()=>{clearTimeout(previewHideTimer);const u=c.dataset.cover;pv.style.backgroundImage=u?`url("${u}")`:'none';pv.classList.toggle('ph',!u);pv.classList.toggle('post',c.dataset.preview==='post');pv.classList.add('on');cl('hid',true)});
    c.addEventListener('mouseleave',()=>{pv.classList.remove('on');clearTimeout(previewHideTimer);previewHideTimer=setTimeout(()=>{if(!pv.classList.contains('on'))pv.classList.remove('post','ph')},270);cl('hid',false)})});
  /* pré-carrega e decodifica as capas em segundo plano (uma por vez, com o navegador ocioso): o primeiro hover já encontra a imagem pronta */
  const idle=window.requestIdleCallback||(f=>setTimeout(f,300));
  const warmUp=()=>cards.forEach((c,i)=>{const u=c.dataset.cover;if(!u)return;
    setTimeout(()=>idle(()=>{const im=new Image();im.decoding='async';im.src=u;warm.push(im);if(im.decode)im.decode().catch(()=>{})}),i*150)});
  if(document.readyState==='complete')warmUp();else addEventListener('load',warmUp,{once:true});
}

/* processo: a rolagem conduz, de forma contínua, o cursor “Igor” pelo trilho, o preenchimento da linha-guia, os números e os textos.
   A posição exibida persegue a rolagem com suavização, então nada “pula” quando a etapa muda. */
{
const section=$('processo');
if(section){
  const copy=$('process-copy'),visual=$('process-visual'),track=$('process-track'),pointer=$('process-collab-pointer'),fill=$('process-fill');
  const items=[...copy.querySelectorAll('.process-step')],rows=[...track.querySelectorAll('.process-row')],dots=[...track.querySelectorAll('.process-dot')];
  const N=rows.length;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mq=matchMedia('(max-width:820px)');
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const ease=t=>t*t*(3-2*t);
  let target=0,shown=0,raf=0,last=0,geo=[],arrived=-1,pressTimer=0,primed=false;
  const nav=document.querySelector('body > nav');
  function syncAnchorOffset(){section.style.scrollMarginTop=((nav?.getBoundingClientRect().height||61)-70)+'px'}
  syncAnchorOffset();
  function goTo(index){
    const distance=Math.max(1,section.offsetHeight-innerHeight);
    scrollTo({top:section.getBoundingClientRect().top+scrollY+distance*((index+.06)/N),behavior:reduced?'auto':'smooth'});
  }
  rows.forEach((row,i)=>row.addEventListener('click',()=>goTo(i)));
  /* centro de cada marcador, relativo à área do trilho */
  function measure(){
    const vb=visual.getBoundingClientRect();
    geo=dots.map(d=>{const r=d.getBoundingClientRect();return [r.left-vb.left+r.width/2,r.top-vb.top+r.height/2]});
  }
  /* posição contínua (0 a N-1): descansa no marcador, viaja até o próximo no meio de cada trecho de rolagem */
  function posAt(scaled){
    const i=Math.min(N-1,Math.floor(scaled)),f=clamp(scaled-i,0,1);
    if(i===N-1||f<.12)return i;
    if(f>.88)return i+1;
    return i+ease((f-.12)/.76);
  }
  function press(index){
    pointer.classList.add('is-pressing');rows[index].classList.add('is-pressed');
    clearTimeout(pressTimer);
    pressTimer=setTimeout(()=>{pointer.classList.remove('is-pressing');rows[index].classList.remove('is-pressed')},150);
    if(window.hap)window.hap(16);
  }
  function draw(pos){
    if(!geo.length)measure();
    const near=Math.round(pos);
    items.forEach((it,i)=>{
      const d=pos-i,ad=Math.abs(d);
      const w=reduced?(ad<.5?1:0):clamp((.62-ad)/.34,0,1);
      it.style.opacity=w.toFixed(3);
      it.style.visibility=w<.01?'hidden':'visible';
      it.style.transform=reduced?'none':'translate3d(0,'+(-d*30).toFixed(1)+'px,0)';
      it.style.filter=reduced||w>.98?'none':'blur('+((1-w)*4).toFixed(1)+'px)';
      it.setAttribute('aria-hidden',i===near?'false':'true');
    });
    rows.forEach((row,i)=>{
      const ad=Math.abs(pos-i);
      row.style.setProperty('--a',(reduced?(i===near?1:0):clamp(1-ad*1.4,0,1)).toFixed(3));
      if(i===near)row.setAttribute('aria-current','step');else row.removeAttribute('aria-current');
    });
    dots.forEach((d,i)=>d.classList.toggle('is-done',pos>=i-.001));
    const i0=Math.min(N-1,Math.floor(pos)),i1=Math.min(N-1,i0+1),t=pos-i0;
    const x=geo[i0][0]+(geo[i1][0]-geo[i0][0])*t,y=geo[i0][1]+(geo[i1][1]-geo[i0][1])*t;
    const horizontal=mq.matches;
    const a0=horizontal?geo[0][0]:geo[0][1],a1=horizontal?geo[N-1][0]:geo[N-1][1],ac=horizontal?x:y;
    fill.parentNode.style.setProperty('--fill',clamp((ac-a0)/Math.max(1,a1-a0),0,1).toFixed(4));
    /* a mãozinha fica centralizada no quadradinho (x-19 = metade da largura dela) e logo abaixo dele, só encostando na beirada, como se puxasse para baixo (y-1); para subir ou descer a mão, mude o y-1 */
    pointer.style.left=(x-19)+'px';pointer.style.top=(y-1)+'px';
    const b=section.getBoundingClientRect();
    pointer.classList.toggle('is-visible',b.bottom>0&&b.top<innerHeight);
    /* “clique” ao chegar em cada marcador */
    if(Math.abs(pos-near)<.02&&near!==arrived){if(arrived!==-1)press(near);arrived=near}
  }
  function frame(now){
    raf=0;
    const dt=Math.min(64,now-(last||now));last=now;
    const diff=target-shown;
    shown=(reduced||Math.abs(diff)<.00015)?target:shown+diff*(1-Math.exp(-dt/110));
    draw(posAt(shown*N));
    if(shown!==target)raf=requestAnimationFrame(frame);else last=0;
  }
  function onScroll(){
    const bounds=section.getBoundingClientRect(),distance=Math.max(1,section.offsetHeight-innerHeight);
    target=clamp(-bounds.top/distance,0,1);
    if(!primed){shown=target;primed=true}
    if(!raf)raf=requestAnimationFrame(frame);
  }
  const remeasure=()=>{syncAnchorOffset();measure();onScroll()};
  addEventListener('scroll',onScroll,{passive:true});
  addEventListener('resize',remeasure,{passive:true});
  mq.addEventListener('change',remeasure);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(remeasure);
  remeasure();
}
}

/* copiar e-mail: seção Contato (#mail) e rodapé de todas as páginas (mesma lógica) */
{
const mails=[...document.querySelectorAll('#mail,footer .ct a[href^="mailto:"]')],tEl=$('toast');
if(mails.length&&tEl){
const em='igorjdscarvalho@gmail.com';
const legacy=()=>{const t=document.createElement('textarea');t.value=em;t.setAttribute('readonly','');t.style.cssText='position:fixed;opacity:0;top:0;left:0';document.body.appendChild(t);t.select();t.setSelectionRange(0,em.length);try{document.execCommand('copy')}catch(x){}t.remove()};
mails.forEach(mail=>{
 if(!mail.hasAttribute('data-cur'))mail.setAttribute('data-cur','Copiar'); /* indicador de cópia no hover (cursor) */
 mail.onclick=e=>{e.preventDefault();const done=()=>{window.hap&&hap([8,40,8]);tEl.classList.add('on');setTimeout(()=>tEl.classList.remove('on'),1600);if(fine){setLabel('Copiado!');setTimeout(()=>mail.matches(':hover')&&setLabel('Copiar'),1200)}};
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(em).then(done,()=>{legacy();done()})}else{legacy();done()}};
});
}
}

/* cursor quadrado + camada "negativa" sobre vermelho */
const RED='.btn.a,.sc.t1,.work .pc.cta,.process-stage,.sb:hover,.ig-fx:hover,.project-cta,.hero-space .btn:not(.o):not(:hover):not(:focus-visible),.hero-space .btn.o:hover,.hero-space .btn.o:focus-visible,.hero-assistant-input-wrap button:not(:hover):not(:focus-visible)',NOT='.card,.stk,.cnt,.rst';
function redUnder(){const c=cur.getBoundingClientRect(),hits=[];document.querySelectorAll(RED).forEach(el=>{
  if(el.closest(NOT))return;const b=el.getBoundingClientRect(),left=Math.max(c.left,b.left),top=Math.max(c.top,b.top),right=Math.min(c.right,b.right),bottom=Math.min(c.bottom,b.bottom);
  if(right<=left||bottom<=top)return;const visible=document.elementFromPoint((left+right)/2,(top+bottom)/2);
  if(!visible||visible.closest(NOT)||!(el===visible||el.contains(visible)))return;
  hits.push({left,top,right,bottom})});return hits}
if(fine){let mx=innerWidth/2,my=innerHeight/2,cx=mx,cy=my,px=mx,py=my;const clip=document.querySelector('.curclip');
 addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;mx=e.clientX;my=e.clientY;cl('vis',true)}) /* pointermove (não mousemove): continua disparando durante o arrastar da caixa do hero */;
 document.addEventListener('mouseleave',()=>cl('vis',false));
 /* recalcula a interseção com superfícies vermelhas apenas enquanto há movimento recente */
 let until=0;const wake=()=>{until=performance.now()+700};
 ['pointermove','scroll','resize','mouseover','click','transitionend','animationend'].forEach(t=>addEventListener(t,wake,{passive:true,capture:true}));
 document.addEventListener('mouseover',e=>{const t=e.target.closest('[data-cur]'),h=e.target.closest('a,button,.b,.hero-word,.hero-shot,[data-cur]');cl('big',!!h&&!t);setLabel(t?t.dataset.cur:null)});
 (function loop(){const vx=mx-cx;
  if(Math.abs(vx)<.05&&Math.abs(my-cy)<.05&&Math.abs(mx-px)<.05&&Math.abs(my-py)<.05&&performance.now()>until){requestAnimationFrame(loop);return}
  cx+=vx*.2;cy+=(my-cy)*.2;px+=(mx-px)*.1;py+=(my-py)*.1;
  const rot=Math.max(-35,Math.min(35,vx*.6)),pr=Math.max(-8,Math.min(8,(mx-px)*.05));
  const tr=`translate(${cx}px,${cy}px) translate(-50%,-50%) rotate(${rot}deg)`;cur.style.transform=tr;cur2.style.transform=tr;
  pv.style.transform=`translate(${px}px,${py}px) translate(-50%,-50%) rotate(${pr}deg)`;
  const rs=cur.classList.contains('hid')?[]:redUnder();
  clip.style.clipPath=rs.length?'path("'+rs.map(r=>`M${r.left} ${r.top}H${r.right}V${r.bottom}H${r.left}Z`).join('')+'")':'inset(50%)';
  requestAnimationFrame(loop)})()}

/* menu e tema */
/* menu hambúrguer */
const hb=$('hb'),lk=$('links');
hb.onclick=()=>{const o=lk.classList.toggle('open');hb.classList.toggle('open',o);hb.setAttribute('aria-expanded',o)};
lk.addEventListener('click',e=>{if(e.target.closest('a')){lk.classList.remove('open');hb.classList.remove('open');hb.setAttribute('aria-expanded',false)}});
/* tema */
const root=document.documentElement,tg=$('tg');
function curT(){return root.dataset.theme||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light')}
function setT(t){root.dataset.theme=t;tg.textContent=t==='dark'?'☀ Claro':'☾ Escuro';try{localStorage.setItem('theme',t)}catch(e){}}
try{const s=localStorage.getItem('theme');if(s)root.dataset.theme=s}catch(e){}
setT(curT());tg.onclick=()=>setT(curT()==='dark'?'light':'dark');

/* ===== URLs limpas (só no site publicado): /portfolio/sobre em vez de /portfolio/index.html#sobre =====
   - clicar em Sobre, Serviços... rola até a seção e o endereço vira /portfolio/sobre (e /portfolio/ no nome/início);
   - abrir um endereço limpo direto (link compartilhado) funciona, pelo 404.html;
   - nas páginas de projeto, o ".html" some do endereço (só no GitHub Pages; em outro domínio veja o COMO-ADICIONAR-PROJETO.md).
   Abrindo o arquivo direto no computador (file://), nada disso roda e tudo continua normal. */
(function () {
  if (!/^https?:$/.test(location.protocol)) return;
  var SEC = ['projetos', 'servicos', 'processo', 'sobre', 'contato'];
  var CLEAN_PROJECTS = window.CLEAN_PROJECT_URLS !== undefined ? window.CLEAN_PROJECT_URLS : /github\.io$/.test(location.hostname);
  var me = document.querySelector('script[src*="main.js"]');
  if (!me) return;
  var BASE = new URL('../', me.src).pathname;                       // ex.: /portfolio/
  var url = function (slug) { return BASE + (slug || ''); };
  var slugFromPath = function () {
    var r = location.pathname.slice(BASE.length).replace(/\/+$/, '').replace(/\.html$/, '');
    return SEC.indexOf(r) > -1 ? r : '';
  };
  var home = document.getElementById('inicio') && document.getElementById('sobre');

  if (!home) {                                                        // páginas de projeto: tira o .html
    if (CLEAN_PROJECTS && /\.html$/.test(location.pathname))
      history.replaceState(null, '', location.pathname.replace(/\.html$/, '') + location.search + location.hash);
    return;
  }

  var q = (location.search.match(/[?&]go=([a-z]+)/) || [])[1], h = location.hash.replace('#', '');
  var start = SEC.indexOf(q) > -1 ? q : SEC.indexOf(h) > -1 ? h : slugFromPath();
  addEventListener('load', function () {
    if (start) {
      var go = function () { var el = document.getElementById(start); if (el && scrollY < 80) el.scrollIntoView({ behavior: 'auto' }); };
      requestAnimationFrame(go);
    }
    history.replaceState(null, '', url(start));
  });

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) return;
    var id = a.getAttribute('href').slice(1);
    if (id !== 'inicio' && SEC.indexOf(id) < 0) return;
    e.preventDefault();
    var el = document.getElementById(id);
    if (id === 'inicio' || !el) scrollTo({ top: 0, behavior: 'smooth' }); else el.scrollIntoView({ behavior: 'smooth' });
    history.pushState(null, '', url(id === 'inicio' ? '' : id));
  });
  addEventListener('popstate', function () {
    var s = slugFromPath(), el = s && document.getElementById(s);
    if (el) el.scrollIntoView({ behavior: 'auto' }); else scrollTo(0, 0);
  });
})();
