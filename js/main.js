/* Igor Carvalho - portfólio. Este arquivo serve a home e as páginas de projeto.
   Onde editar: bolhas ("items"), etapas do processo ("steps") e e-mail (procure por igorjdscarvalho). */
const $=id=>document.getElementById(id);
const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
const cur=$('cur'),cur2=$('cur2'),pv=$('pv');
const curs=[cur,cur2],cl=(n,on)=>curs.forEach(c=>c&&c.classList.toggle(n,on));
function setLabel(t){cl('tag',!!t);cur.firstElementChild.textContent=t||''}

/* marquee hero */
if($('mq')){const mqItems=['Identidade visual','Naming','Estruturação de perfil','Gestão de redes sociais','Landing page','Edição de vídeos','Direção de arte','UI Design','Tipografia'];
const mqH=mqItems.map(t=>`<span class="mono">${t}</span>`).join('');$('mq').innerHTML=mqH+mqH}

/* bolhas */
if($('grid')){
/* bubbles */
const items=[["Trajetória","Formação","Formado em Publicidade e Design Gráfico."],["Profissão","Multidisciplinar","Atuo entre branding, direção de arte e UI Design."],["Curiosidade","100% remoto","Trabalho remotamente desde meu primeiro estágio."],["Personalidade","Autodidata","Aprendo explorando, testando e criando."],["Especialidade","Tipografia","Tenho um carinho especial pelas formas das letras."],["Pessoal","Arte desde cedo","Desenho e pintura fazem parte da minha vida desde a infância."],["Processo","Além do logo","Crio sistemas visuais que vão além de símbolos."],["Especialidade","Digital","Transformo ideias em interfaces e experiências digitais."],["Inspiração","Olhar visual","Fotografia e audiovisual alimentam minha criatividade."],["Pessoal","Colecionador de sons","Vinis, música e descobertas sonoras fazem parte do meu universo."]];
const panel=$('panel'),grid=$('grid');let popped=0,card=null,ac;
function snd(){try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime;o.frequency.setValueAtTime(520,t);o.frequency.exponentialRampToValueAtTime(140,t+.09);g.gain.setValueAtTime(.2,t);g.gain.exponentialRampToValueAtTime(.001,t+.12);o.connect(g).connect(ac.destination);o.start();o.stop(t+.13)}catch(e){}}
function showCard(b,d){if(card)card.remove();const p=panel.getBoundingClientRect(),r=b.getBoundingClientRect();card=document.createElement('div');card.className='card';card.innerHTML=`<button aria-label="Fechar">×</button><span class="mono tagc">${d[0]}</span><h3>${d[1]}</h3><p>${d[2]}</p>`;panel.appendChild(card);const w=card.offsetWidth,h=card.offsetHeight;let l=r.left-p.left+r.width/2-w/2,t=r.top-p.top+r.height+8;l=Math.max(8,Math.min(l,p.width-w-8));if(t+h>p.height-8)t=r.top-p.top-h-8;card.style.left=l+'px';card.style.top=Math.max(8,t)+'px';card.querySelector('button').onclick=()=>{card.remove();card=null}}
items.forEach((d,i)=>{const b=document.createElement('button');b.className='b';b.setAttribute('aria-label','Bolha '+(i+1));b.onclick=()=>{if(b.classList.contains('p')){showCard(b,d);return}b.classList.add('p');snd();window.hap&&hap(10);const p=panel.getBoundingClientRect(),r=b.getBoundingClientRect(),cx=r.left-p.left+r.width/2,cy=r.top-p.top+r.height/2;for(let k=0;k<8;k++){const s=document.createElement('i');s.className='sp';const a=Math.PI*2*k/8,dd=24+Math.random()*24;s.style.cssText=`left:${cx-4}px;top:${cy-4}px;--x:${Math.cos(a)*dd}px;--y:${Math.sin(a)*dd}px`;panel.appendChild(s);setTimeout(()=>s.remove(),500)}$('cnt').textContent=++popped+' / 10';$('stk').classList.add('off');if(popped===10)$('rst').hidden=false;setTimeout(()=>showCard(b,d),170)};grid.appendChild(b)});
$('rst').onclick=()=>{grid.querySelectorAll('.b').forEach(b=>b.classList.remove('p'));popped=0;$('cnt').textContent='0 / 10';$('stk').classList.remove('off');$('rst').hidden=true;if(card){card.remove();card=null}};
}

/* projetos: imagem só no hover (desktop). O card inteiro é um link. */
if(fine)document.querySelectorAll('.sc').forEach(c=>{
  c.addEventListener('mouseenter',()=>{const u=c.dataset.cover;pv.style.backgroundImage=u?`url("${u}")`:'none';pv.classList.toggle('ph',!u);pv.classList.add('on');cl('hid',true)});
  c.addEventListener('mouseleave',()=>{pv.classList.remove('on');cl('hid',false)})});

/* processo (roda) + faixas da newsletter */
const wheel=$('wheel');
if(wheel){
/* process wheel */
const steps=[["Descoberta","Entendo os objetivos, o público e o contexto antes de definir qualquer direção criativa."],["Estratégia","Organizo ideias, referências e conceitos para encontrar o caminho mais adequado ao projeto."],["Criação","Transformo a estratégia em soluções visuais, explorando formas, cores, tipografia e experiências."],["Entrega","Finalizo os arquivos e entrego tudo pronto para uso."]];
const wheel=$('wheel'),nodes=steps.map((s,i)=>{const n=document.createElement('div');n.className='node';n.textContent='0'+(i+1);wheel.appendChild(n);return n});
$('dots').innerHTML=steps.map(()=>'<i></i>').join('');
function place(rot,R){nodes.forEach((n,i)=>{const a=(i*90-90)*Math.PI/180;n.style.transform=`translate(${Math.cos(a)*R}px,${Math.sin(a)*R}px) rotate(${-rot}deg)`})}
let last=-1;
function upd(){const s=document.querySelector('.proc'),r=s.getBoundingClientRect(),p=Math.max(0,Math.min(1,-r.top/(r.height-innerHeight)));const rot=-p*270;wheel.style.transform=`rotate(${rot}deg)`;place(rot,wheel.offsetWidth/2*.99);nodes[3].style.opacity=Math.min(1,p/.1);const k=Math.round(p*3);if(k!==last){if(last!==-1&&window.hap)hap(16);last=k;nodes.forEach((n,i)=>n.classList.toggle('on',i===k));document.querySelectorAll('#dots i').forEach((d,i)=>d.classList.toggle('on',i<=k));$('step').innerHTML=`<span class="mono" style="color:var(--acc)">Etapa 0${k+1}</span><h3>${steps[k][0]}</h3><p>${steps[k][1]}</p>`}
 /* newsletter text */
 const n=$('newsletter').getBoundingClientRect(),q=(innerHeight-n.top)/(innerHeight+n.height);$('r1').style.transform=`translateX(${-q*900}px)`;$('r2').style.transform=`translateX(${-900+q*900}px)`}
addEventListener('scroll',upd,{passive:true});addEventListener('resize',upd);
upd();
}

/* copiar e-mail */
if($('mail')){
/* contact: copy email */
const mail=$('mail'),tEl=$('toast');
mail.onclick=e=>{e.preventDefault();const em='igorjdscarvalho@gmail.com';const done=()=>{window.hap&&hap([8,40,8]);tEl.classList.add('on');setTimeout(()=>tEl.classList.remove('on'),1600);if(fine){setLabel('Copiado!');setTimeout(()=>mail.matches(':hover')&&setLabel('Copiar'),1200)}};
 if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(em).then(done,()=>{})}else{const t=document.createElement('textarea');t.value=em;document.body.appendChild(t);t.select();try{document.execCommand('copy')}catch(x){}t.remove();done()}};
}

/* cursor quadrado + camada "negativa" sobre vermelho */
const RED='.btn.a,.sc.t1,.panel,.news .ic,.node.on,.sb:hover,.ig-fx:hover',NOT='.card,.stk,.cnt,.rst';
function redUnder(x,y,h){const s=new Set();for(const[dx,dy]of[[0,0],[-h,0],[h,0],[0,-h],[0,h],[-h,-h],[h,-h],[-h,h],[h,h]]){
  const el=document.elementFromPoint(x+dx,y+dy);if(!el||el.closest(NOT))continue;const r=el.closest(RED);if(r)s.add(r)}return[...s]}
if(fine){let mx=innerWidth/2,my=innerHeight/2,cx=mx,cy=my,px=mx,py=my;const clip=document.querySelector('.curclip');
 addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cl('vis',true)});
 document.addEventListener('mouseleave',()=>cl('vis',false));
 document.addEventListener('mouseover',e=>{const t=e.target.closest('[data-cur]'),h=e.target.closest('a,button,.b,[data-cur]');cl('big',!!h&&!t);setLabel(t?t.dataset.cur:null)});
 (function loop(){const vx=mx-cx;cx+=vx*.2;cy+=(my-cy)*.2;px+=(mx-px)*.1;py+=(my-py)*.1;
  const rot=Math.max(-35,Math.min(35,vx*.6)),pr=Math.max(-8,Math.min(8,(mx-px)*.05));
  const tr=`translate(${cx}px,${cy}px) translate(-50%,-50%) rotate(${rot}deg)`;cur.style.transform=tr;cur2.style.transform=tr;
  pv.style.transform=`translate(${px}px,${py}px) translate(-50%,-50%) rotate(${pr}deg)`;
  const rs=cur.classList.contains('hid')?[]:redUnder(cx,cy,cur.offsetWidth/2);
  clip.style.clipPath=rs.length?'path("'+rs.map(r=>{const b=r.getBoundingClientRect();return`M${b.left} ${b.top}H${b.right}V${b.bottom}H${b.left}Z`}).join('')+'")':'inset(50%)';
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
