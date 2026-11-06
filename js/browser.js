/* Igor Carvalho - bloco "navegador" (.bw) das páginas de projeto. Não precisa editar.
   Lê os parâmetros do <section class="bw" ...> e monta sozinho: janela de navegador + landing page dentro + botões Desktop/Mobile.
   Parâmetros (todos data-* no próprio <section>):
     data-src            caminho do HTML da landing page (obrigatório)           ex.: ../assets/landing-pages/lopes-arq.html
     data-url            endereço mostrado na barra                               ex.: lopesarq.com.br
     data-title          descrição para leitores de tela (opcional)
     data-default        tela inicial: "desktop" ou "mobile" (sem ele: desktop, e mobile em celular)
     data-desktop-width  largura "virtual" do desktop em px (padrão 1280)
     data-desktop-height altura "virtual" do desktop em px (padrão 800)
     data-mobile-width   largura do celular em px (padrão 390)
     data-mobile-height  altura do celular em px (padrão 844)
     data-mobile-max     altura máxima em tela do celular no desktop, em px (padrão 720)
   Em celular/tablet o bloco abre direto no mobile; se a pessoa tocar em Desktop, a tela escurece com um aviso recomendando computador.
   A landing roda numa tela "virtual" (ex.: 1280 px) reduzida para caber na janela: assim os breakpoints dela disparam de verdade. */
(function(){
var blocks=[].slice.call(document.querySelectorAll('.bw[data-src]'));
if(!blocks.length)return;
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
var coarse=window.matchMedia&&matchMedia('(pointer:coarse)').matches;
var fine=window.matchMedia&&matchMedia('(hover:hover) and (pointer:fine)').matches;
var cursors=[document.getElementById('cur'),document.getElementById('cur2')];
function num(el,k,d){var v=parseFloat(el.getAttribute('data-'+k));return isNaN(v)?d:v}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;')}

blocks.forEach(function(bw){
  var src=bw.getAttribute('data-src');
  var url=bw.getAttribute('data-url')||src.split('/').pop().replace(/\.html?$/,'');
  var title=bw.getAttribute('data-title')||'Pré-visualização da landing page';
  var mode=bw.getAttribute('data-default')==='mobile'?'mobile':'desktop';
  /* sem data-default, em celular de verdade a tela inicial já é a mobile (a desktop fica minúscula) */
  if(!bw.hasAttribute('data-default')&&(bw.clientWidth||innerWidth)<=700)mode='mobile';
  var DW=num(bw,'desktop-width',1280),DH=num(bw,'desktop-height',800);
  var MW=num(bw,'mobile-width',390),MH=num(bw,'mobile-height',844),MMAX=num(bw,'mobile-max',720);

  bw.innerHTML=
   '<div class="bw-win">'+
    '<div class="bw-bar mono">'+
     '<span class="bw-dots" aria-hidden="true"><i></i><i></i><i></i></span>'+
     '<span class="bw-url"><svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><rect x="2" y="5.2" width="8" height="5.6"/><path d="M3.8 5.2V3.6a2.2 2.2 0 014.4 0v1.6"/></svg><span>'+esc(url)+'</span></span>'+
     '<span class="bw-sw" role="group" aria-label="Tamanho da tela">'+
      '<button type="button" data-m="desktop" aria-pressed="'+(mode==='desktop')+'"><svg width="14" height="12" viewBox="0 0 14 12" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><rect x="1" y="1" width="12" height="8"/><path d="M5 11h4"/></svg><span>Desktop</span></button>'+
      '<button type="button" data-m="mobile" aria-pressed="'+(mode==='mobile')+'"><svg width="14" height="12" viewBox="0 0 14 12" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><rect x="4" y="0.8" width="6" height="10.4"/><path d="M6.4 9.6h1.2"/></svg><span>Mobile</span></button>'+
     '</span>'+
    '</div>'+
    '<div class="bw-stage"><div class="bw-view">'+
     '<iframe title="'+esc(title)+'" referrerpolicy="no-referrer"></iframe>'+
     '<div class="bw-load mono">Carregando…</div>'+
     '<button type="button" class="bw-cover" data-cur="Interagir" aria-label="Ativar a landing page para rolar e clicar"><span class="bw-hint mono"><span class="f">Clique para interagir</span><span class="t">Toque para interagir</span></span></button>'+
     '<div class="bw-warn" aria-hidden="true"><p class="mono">Para ver a versão desktop, o ideal é usar um computador ou notebook.</p></div>'+
     '<button type="button" class="bw-x">✕ Sair</button>'+
    '</div></div>'+
   '</div>';

  var win=bw.querySelector('.bw-win'),stage=bw.querySelector('.bw-stage'),view=bw.querySelector('.bw-view'),
      fr=bw.querySelector('iframe'),btns=[].slice.call(bw.querySelectorAll('.bw-sw button')),
      cover=bw.querySelector('.bw-cover'),exit=bw.querySelector('.bw-x');
  bw.setAttribute('data-mode',mode);

  /* ---- tamanho: a landing roda numa tela virtual (vw x vh) e é reduzida (scale) para caber ---- */
  var lastW=0;
  function layout(){
    var hand=win.clientWidth<=520; /* celular de verdade: sem moldura em volta */
    win.classList.toggle('is-hand',hand);
    var cs=getComputedStyle(stage),avail=stage.clientWidth-(parseFloat(cs.paddingLeft)||0)-(parseFloat(cs.paddingRight)||0);
    if(avail<=0)return;
    var vw,vh,s;
    if(mode==='desktop'){
      vw=DW;s=Math.min(1,avail/vw);
      /* em telas baixas, a "janela" fica mais baixa em vez de empurrar a página */
      vh=Math.round(Math.min(DH,Math.max(420,(innerHeight-170)/s)));
    }else{
      vw=MW;
      var maxH=Math.min(MMAX,innerHeight*.85);
      if(hand){s=avail/vw;vh=Math.round(maxH/s)}
      else{s=Math.min(1,avail/vw,maxH/MH);vh=MH}
    }
    view.style.width=Math.round(vw*s)+'px';view.style.height=Math.round(vh*s)+'px';
    fr.style.width=vw+'px';fr.style.height=vh+'px';fr.style.transform='scale('+s.toFixed(4)+')';
    lastW=win.clientWidth;
    bw.classList.toggle('is-warn',mode==='desktop'&&(innerWidth<=700||(coarse&&innerWidth<=1024)));
  }
  function setMode(m){
    if(m===mode)return;
    mode=m;live(false);
    btns.forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-m')===m)});
    var apply=function(){bw.setAttribute('data-mode',m);layout();view.classList.remove('sw')};
    if(reduce){apply();return}
    view.classList.add('sw');setTimeout(apply,160);
  }
  btns.forEach(function(b){b.addEventListener('click',function(){setMode(b.getAttribute('data-m'))})});

  /* ---- "ao vivo": a landing só recebe rolagem/clique depois de um clique (não prende a rolagem da página) ---- */
  var isLive=false;
  function live(on){
    if(on===isLive)return;isLive=on;
    bw.classList.toggle('is-live',on);
    cursors.forEach(function(c){if(c)c.classList.toggle('hid',on)});
    if(on){try{fr.contentWindow.focus()}catch(e){}}
  }
  cover.addEventListener('click',function(){live(true)});
  exit.addEventListener('click',function(){live(false)});
  if(fine)view.addEventListener('mouseleave',function(){live(false)});
  document.addEventListener('pointerdown',function(e){if(isLive&&!win.contains(e.target))live(false)});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')live(false)});

  /* ---- carregamento: só baixa a landing quando o bloco está perto da tela ---- */
  var started=false;
  function start(){
    if(started)return;started=true;
    fr.addEventListener('load',function(){
      view.classList.add('ok');
      /* links externos da landing abrem em nova aba (não "dentro" da janelinha). Só funciona quando o arquivo é do mesmo site. */
      try{
        fr.contentDocument.addEventListener('click',function(e){
          var a=e.target.closest&&e.target.closest('a[href]');if(!a)return;
          var h=a.getAttribute('href');
          if(!h||h.charAt(0)==='#'||/^(javascript:)/i.test(h))return;
          e.preventDefault();window.open(a.href,'_blank','noopener');
        });
      }catch(x){}
    });
    fr.src=src;
  }
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){start();io.disconnect()}},{rootMargin:'600px 0px'});io.observe(bw);
  }else start();

  layout();
  if(window.ResizeObserver)new ResizeObserver(function(){if(win.clientWidth!==lastW)layout()}).observe(win);
  else addEventListener('resize',layout);
  /* fontes/imagens da página podem mudar a largura útil (barra de rolagem): reajusta ao terminar de carregar */
  addEventListener('load',layout);
});
})();
