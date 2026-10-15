/* Igor C. - tema, copiar e-mail, hover dos botões, cursor "Abrir" e indicação de scroll.
   Tudo usa "delegação de eventos": funciona em qualquer página sem precisar editar este arquivo. */
(function(){
  var root=document.documentElement;

  /* tema claro/escuro (a escolha fica salva) */
  document.addEventListener("click",function(e){
    if(!e.target.closest("[data-theme-toggle]"))return;
    var next=root.getAttribute("data-theme")==="dark"?"light":"dark";
    root.setAttribute("data-theme",next);
    try{localStorage.setItem("theme",next)}catch(err){}
  });

  /* copiar e-mail */
  var timer;
  document.addEventListener("click",function(e){
    var btn=e.target.closest("[data-copy]");if(!btn)return;
    var label=btn.querySelector(".lbl"),email=btn.getAttribute("data-copy");
    function ok(){label.textContent="Copiado!";btn.classList.add("done");clearTimeout(timer);
      timer=setTimeout(function(){label.textContent="Copiar e-mail";btn.classList.remove("done")},2000)}
    function fallback(){var t=document.createElement("textarea");t.value=email;t.style.cssText="position:fixed;opacity:0";
      document.body.appendChild(t);t.select();try{document.execCommand("copy")}catch(err){}document.body.removeChild(t);ok()}
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(email).then(ok,fallback)}else{fallback()}
  });

  /* bolinha dos botões nasce no ponto por onde o mouse entrou/saiu */
  function setX(e){var b=e.target.closest&&e.target.closest(".fx");
    if(!b||b.contains(e.relatedTarget))return;
    b.style.setProperty("--x",(e.clientX-b.getBoundingClientRect().left)+"px")}
  document.addEventListener("mouseover",setX);document.addEventListener("mouseout",setX);

  /* cursor "Abrir" sobre a imagem dos cards (só com mouse) */
  var f=document.getElementById("follower");
  if(f&&window.matchMedia&&matchMedia("(hover:hover) and (pointer:fine)").matches){
    var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches,tx=0,ty=0,x=0,y=0,raf=null,show=false;
    function draw(){x+=(tx-x)*(reduce?1:.2);y+=(ty-y)*(reduce?1:.2);
      f.style.transform="translate3d("+(x+18)+"px,"+(y+18)+"px,0) scale("+(show?1:.6)+")";
      raf=(show&&(Math.abs(tx-x)>.1||Math.abs(ty-y)>.1))?requestAnimationFrame(draw):null}
    function kick(){if(!raf)raf=requestAnimationFrame(draw)}
    document.addEventListener("mouseover",function(e){var m=e.target.closest(".card-media");
      if(m&&!m.contains(e.relatedTarget)){tx=x=e.clientX;ty=y=e.clientY;show=true;f.classList.add("on");kick()}});
    document.addEventListener("mouseout",function(e){var m=e.target.closest(".card-media");
      if(m&&!m.contains(e.relatedTarget)){show=false;f.classList.remove("on");kick()}});
    document.addEventListener("mousemove",function(e){tx=e.clientX;ty=e.clientY;if(show)kick()});
    document.addEventListener("scroll",function(){if(show){show=false;f.classList.remove("on");kick()}},true);
  }

  /* indicação de scroll: fade nas bordas + seta enquanto houver conteúdo escondido */
  function initScrollers(){
    document.querySelectorAll("[data-scroller]").forEach(function(el){
      if(el._sc)return;el._sc=1;
      var panel=el.closest(".panel"),cue=panel&&panel.querySelector(".cue"),touched=false;
      function update(){
        var can=getComputedStyle(el).overflowY==="auto"&&el.scrollHeight>el.clientHeight+4;
        var up=can&&el.scrollTop>4,down=can&&el.scrollTop+el.clientHeight<el.scrollHeight-4;
        el.toggleAttribute("data-up",up);el.toggleAttribute("data-down",down);
        if(cue)cue.classList.toggle("on",down&&!touched);
      }
      el.addEventListener("scroll",function(){if(el.scrollTop>24)touched=true;update()},{passive:true});
      if(window.ResizeObserver){var ro=new ResizeObserver(update);ro.observe(el);if(el.firstElementChild)ro.observe(el.firstElementChild)}
      window.addEventListener("resize",update);
      if(cue)cue.addEventListener("click",function(){el.scrollBy({top:el.clientHeight*.7,behavior:"smooth"})});
      update();
    });
  }
  window.initPage=initScrollers;
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initScrollers);else initScrollers();
})();
