/* Igor Carvalho - blocos horizontais (.hs) e vídeos das páginas de projeto. Não precisa editar. */
(function(){
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
if(!reduce)[].forEach.call(document.querySelectorAll('.hs'),function(hs){
  var tr=hs.querySelector('.hs-track');if(!tr)return;
  var st=tr.parentNode,dist=0,top=60,raf=0,lead=0,tail=0;
  /* PAUSAS: quanto a página fica parada com o bloco fixo ANTES de deslizar (HOLD_START) e DEPOIS de acabar (HOLD_END),
     como fração da altura do bloco. Para mudar numa página só: <section class="hs" data-hold-start="0.8" data-hold-end="0.4"> */
  var HOLD_START=parseFloat(hs.getAttribute('data-hold-start')),HOLD_END=parseFloat(hs.getAttribute('data-hold-end'));
  if(isNaN(HOLD_START))HOLD_START=0.55;if(isNaN(HOLD_END))HOLD_END=0.3;
  function draw(){raf=0;var p=dist?Math.min(1,Math.max(0,(top-hs.getBoundingClientRect().top-lead)/dist)):0;tr.style.transform='translate3d('+(-p*dist).toFixed(1)+'px,0,0)'}
  function size(){top=parseFloat(getComputedStyle(st).top)||0;dist=Math.max(0,tr.scrollWidth-st.clientWidth);lead=dist?Math.max(200,Math.round(st.offsetHeight*HOLD_START)):0;tail=dist?Math.round(st.offsetHeight*HOLD_END):0;
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
})();
