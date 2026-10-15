/* Tema, copiar e-mail, preenchimento dos botoes e cursor "Abrir" */
(function(){
  var root=document.documentElement;

  document.getElementById("themeBtn").addEventListener("click",function(){
    var next=root.getAttribute("data-theme")==="dark"?"light":"dark";
    root.setAttribute("data-theme",next);
    try{localStorage.setItem("theme",next)}catch(e){}
  });

  var copyBtn=document.getElementById("copyBtn"),label=document.getElementById("copyLabel"),timer;
  copyBtn.addEventListener("click",function(){
    var email=copyBtn.getAttribute("data-email");
    function ok(){
      label.textContent="Copiado!";copyBtn.classList.add("done");
      clearTimeout(timer);
      timer=setTimeout(function(){label.textContent="Copiar e-mail";copyBtn.classList.remove("done")},2000);
    }
    function fallback(){
      var ta=document.createElement("textarea");ta.value=email;ta.style.position="fixed";ta.style.opacity="0";
      document.body.appendChild(ta);ta.select();
      try{document.execCommand("copy")}catch(e){}
      document.body.removeChild(ta);ok();
    }
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(email).then(ok,fallback)}else{fallback()}
  });


  document.querySelectorAll(".btn").forEach(function(b){
    function setX(e){var r=b.getBoundingClientRect();b.style.setProperty("--x",(e.clientX-r.left)+"px")}
    b.addEventListener("mouseenter",setX);b.addEventListener("mouseleave",setX);
  });

  var f=document.getElementById("follower");
  var fine=window.matchMedia&&matchMedia("(hover:hover) and (pointer:fine)").matches;
  if(fine){
    var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
    var tx=0,ty=0,x=0,y=0,raf=null,visible=false;
    function draw(){
      x+=(tx-x)*(reduce?1:.2);y+=(ty-y)*(reduce?1:.2);
      f.style.transform="translate3d("+(x+18)+"px,"+(y+18)+"px,0) scale("+(visible?1:.6)+")";
      if(visible&&(Math.abs(tx-x)>.1||Math.abs(ty-y)>.1)){raf=requestAnimationFrame(draw)}else{raf=null}
    }
    function kick(){if(!raf)raf=requestAnimationFrame(draw)}
    document.querySelectorAll("[data-follow]").forEach(function(el){
      el.addEventListener("mouseenter",function(e){
        tx=x=e.clientX;ty=y=e.clientY;visible=true;f.classList.add("on");kick();
      });
      el.addEventListener("mousemove",function(e){tx=e.clientX;ty=e.clientY;kick()});
      el.addEventListener("mouseleave",function(){visible=false;f.classList.remove("on");kick()});
    });
    document.querySelector(".work-scroll").addEventListener("scroll",function(){
      if(visible){f.classList.remove("on");visible=false;kick()}
    },{passive:true});
  }

  document.querySelectorAll("[data-follow]").forEach(function(a){
    a.addEventListener("click",function(e){e.preventDefault()});
  });
})();
