/* Igor Carvalho - blocos horizontais (.hs) e vídeos das páginas de projeto. Não precisa editar. */
(function(){
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
if(!reduce)[].forEach.call(document.querySelectorAll('.hs'),function(hs){
  var tr=hs.querySelector('.hs-track');if(!tr)return;
  var st=tr.parentNode,dist=0,top=60,raf=0,lead=0,tail=0,N=tr.children.length;
  /* indicador de que há mais mídias: barra de progresso + contador (01 / 06) */
  var ui=document.createElement('div');ui.className='hs-ui';ui.setAttribute('aria-hidden','true');
  ui.innerHTML='<i class="hs-bar"><b></b></i><span class="hs-n"></span>';st.appendChild(ui);
  var fill=ui.querySelector('b'),num=ui.querySelector('.hs-n'),pad=function(n){return(n<10?'0':'')+n};
  /* PAUSAS: quanto a página fica parada com o bloco fixo ANTES de deslizar (HOLD_START) e DEPOIS de acabar (HOLD_END),
     como fração da altura do bloco. Para mudar numa página só: <section class="hs" data-hold-start="0.8" data-hold-end="0.4"> */
  var HOLD_START=parseFloat(hs.getAttribute('data-hold-start')),HOLD_END=parseFloat(hs.getAttribute('data-hold-end'));
  if(isNaN(HOLD_START))HOLD_START=0.55;if(isNaN(HOLD_END))HOLD_END=0.3;
  function draw(){raf=0;var p=dist?Math.min(1,Math.max(0,(top-hs.getBoundingClientRect().top-lead)/dist)):0;tr.style.transform='translate3d('+(-p*dist).toFixed(1)+'px,0,0)';
    fill.style.transform='scaleX('+p.toFixed(4)+')';num.textContent=pad(Math.min(N,Math.floor(p*(N-1)+.5)+1))+' / '+pad(N)}
  function size(){top=parseFloat(getComputedStyle(st).top)||0;dist=Math.max(0,tr.scrollWidth-st.clientWidth);ui.style.display=dist?'':'none';lead=dist?Math.max(200,Math.round(st.offsetHeight*HOLD_START)):0;tail=dist?Math.round(st.offsetHeight*HOLD_END):0;
    hs.style.height=(st.offsetHeight+lead+dist+tail)+'px';draw()}
  function req(){if(!raf)raf=requestAnimationFrame(draw)}
  addEventListener('scroll',req,{passive:true});addEventListener('resize',size);addEventListener('load',size);
  if(window.ResizeObserver)new ResizeObserver(size).observe(tr);
  [].forEach.call(tr.querySelectorAll('img'),function(i){i.addEventListener('load',size)});
  [].forEach.call(tr.querySelectorAll('video'),function(v){v.addEventListener('loadedmetadata',size)});
  size();
});
/* vídeos: mudos, em loop, sem controles; tocam só enquanto aparecem na tela */
var vids=[].slice.call(document.querySelectorAll('.hs video,.gal video'));
function play(v){var r=v.play();if(r&&r.catch)r.catch(function(){})}
vids.forEach(function(v){v.muted=true;v.loop=true;v.playsInline=true;v.removeAttribute('controls')});
if(reduce){vids.forEach(function(v){v.pause()})}
else if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){e.isIntersecting?play(e.target):e.target.pause()})},{threshold:.05});vids.forEach(function(v){io.observe(v)})}
else vids.forEach(play);
if(!reduce)document.addEventListener('touchstart',function(){vids.forEach(function(v){if(v.paused)play(v)})},{once:true,passive:true});

/* ampliar imagem ao toque (só celular/tablet): toque numa imagem da galeria para abrir grande; arraste para explorar; ✕ fecha */
if(window.matchMedia&&matchMedia('(pointer:coarse)').matches&&document.querySelector('.gal img')){
  var box=document.createElement('div');box.className='lb';box.hidden=true;
  box.innerHTML='<button class="lb-x" type="button" aria-label="Fechar">✕</button><div class="lb-s"><img alt=""></div>';
  document.body.appendChild(box);
  var big=box.querySelector('img'),scr=box.querySelector('.lb-s');
  function close(){box.hidden=true;document.documentElement.classList.remove('lb-open')}
  document.addEventListener('click',function(e){
    var t=e.target.closest&&e.target.closest('.gal img');if(!t)return;
    big.src=t.currentSrc||t.src;big.alt=t.alt;box.hidden=false;document.documentElement.classList.add('lb-open');
    var c=function(){scr.scrollLeft=(scr.scrollWidth-scr.clientWidth)/2;scr.scrollTop=0};c();big.onload=c;
  });
  box.querySelector('.lb-x').addEventListener('click',close);
  addEventListener('keydown',function(e){if(e.key==='Escape')close()});
}
})();
