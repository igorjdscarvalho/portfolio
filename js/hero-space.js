/* Hero de exploração: campo de busca local com destinos predefinidos e céu de estrelas quadradas. */
(function(){
  const root=document.documentElement;

  const hero=document.querySelector('.hero-space');
  const canvas=document.getElementById('space-stars');
  const form=document.getElementById('hero-assistant');
  const input=document.getElementById('hero-query');
  const result=document.getElementById('hero-assistant-result');
  const cursorSvg=document.getElementById('hero-constellation-lines');
  const cursorPointer=document.getElementById('hero-collab-pointer');
  const cursorMedia=matchMedia('(hover:hover) and (pointer:fine) and (min-width:821px)');
  const svgNS='http://www.w3.org/2000/svg';
  if(!hero||!canvas||!form||!input||!result)return;

  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx=canvas.getContext('2d');
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const say=(pt,en)=>window.I18N&&window.I18N.lang==='en'?en:pt;
  let width=0,height=0,dpr=1,stars=[],constellations=[],cursorRoutes=[],cursorRouteIndex=0,cursorRouteStart=0,cursorTransit=null,cursorProtectedRects=[],cursorStartProtectedRects=[],cursorBlurRects=[],cursorSafePoints=[],comets=[],visible=true,raf=0,last=0,nextComet=0;

  function measureCursorBlurRects(heroRect=hero.getBoundingClientRect()){
    cursorBlurRects=[];
    if(!cursorPointer||!cursorMedia.matches)return;
    const textElements=[...document.querySelectorAll('.hero-space-role,.hero-space-copy h1,.hero-space-copy p')];
    textElements.forEach(element=>{
      const range=document.createRange();range.selectNodeContents(element);
      [...range.getClientRects()].forEach(rect=>{
        if(rect.width>0&&rect.height>0)cursorBlurRects.push({left:rect.left-heroRect.left,right:rect.right-heroRect.left,top:rect.top-heroRect.top,bottom:rect.bottom-heroRect.top});
      });
    });
    document.querySelectorAll('.hero-space-ctas .btn').forEach(element=>{
      const rect=element.getBoundingClientRect();
      cursorBlurRects.push({left:rect.left-heroRect.left,right:rect.right-heroRect.left,top:rect.top-heroRect.top,bottom:rect.bottom-heroRect.top});
    });
  }
  function placeCursor(x,y){
    cursorPointer.style.left=x+'px';cursorPointer.style.top=y+'px';cursorPointer.style.opacity='1';
    const arrow={left:x-2,top:y-1.5,right:x+14,bottom:y+18.5},arrowArea=(arrow.right-arrow.left)*(arrow.bottom-arrow.top);
    const overlapArea=(a,b)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
    cursorPointer.classList.toggle('is-soft',cursorBlurRects.some(rect=>overlapArea(arrow,rect)>=arrowArea*.55));
  }

  function buildConstellations(){
    constellations=[];
    const clusterCount=clamp(Math.round(width/360),3,5);
    const radius=clamp(width*.19,88,195);
    const maxEdge=clamp(width*.22,130,250);
    for(let cluster=0;cluster<clusterCount;cluster++){
      const center={x:width*(.12+Math.random()*.76),y:height*(.12+Math.random()*.67)};
      const points=stars.map(star=>({star,distance:Math.hypot(star.x-center.x,star.y-center.y)}))
        .filter(item=>item.distance<radius).sort((a,b)=>a.distance-b.distance).slice(0,4).map(item=>item.star);
      if(points.length<3)continue;
      const ordered=[points.shift()];
      while(points.length){
        const lastPoint=ordered[ordered.length-1];
        let nearestIndex=0,nearestDistance=Infinity;
        points.forEach((point,index)=>{const distance=Math.hypot(point.x-lastPoint.x,point.y-lastPoint.y);if(distance<nearestDistance){nearestDistance=distance;nearestIndex=index}});
        const next=points.splice(nearestIndex,1)[0];
        if(nearestDistance<=maxEdge)ordered.push(next);
      }
      for(let i=1;i<ordered.length;i++){
        const a=ordered[i-1],b=ordered[i];
        constellations.push({x1:a.x,y1:a.y,x2:b.x,y2:b.y,accent:Math.random()<.2,alpha:.16+Math.random()*.09});
      }
      if(ordered.length>=4&&Math.random()<.55){
        const a=ordered[0],b=ordered[2];
        if(Math.hypot(a.x-b.x,a.y-b.y)<=maxEdge*1.25)constellations.push({x1:a.x,y1:a.y,x2:b.x,y2:b.y,accent:false,alpha:.12});
      }
    }
  }
  function drawConstellations(){
    ctx.save();ctx.lineWidth=.85;ctx.lineCap='butt';
    constellations.forEach(line=>{
      ctx.globalAlpha=line.alpha*fadeAt((line.y1+line.y2)/2);
      ctx.strokeStyle=line.accent?'#ca271c':'#f4f3ef';ctx.beginPath();ctx.moveTo(line.x1,line.y1);ctx.lineTo(line.x2,line.y2);ctx.stroke();
    });
    ctx.restore();
  }

  function buildCursorRoutes(){
    cursorRoutes=[];cursorRouteIndex=0;cursorRouteStart=0;cursorTransit=null;cursorProtectedRects=[];cursorStartProtectedRects=[];cursorBlurRects=[];cursorSafePoints=[];
    if(!cursorSvg)return;
    cursorSvg.replaceChildren();cursorSvg.setAttribute('viewBox',`0 0 ${width} ${height}`);
    if(reduce||!cursorMedia.matches){if(cursorPointer)cursorPointer.style.opacity='0';return}

    const heroRect=hero.getBoundingClientRect();measureCursorBlurRects(heroRect);
    const rules=[
      {selector:'nav',padding:8},
      {selector:'.hero-space-role',padding:12},
      {selector:'.hero-space-copy h1',padding:{left:24,right:24,top:16,bottom:16}},
      {selector:'.hero-space-copy p',padding:16},
      {selector:'.hero-space-ctas',padding:14},
      {selector:'.hero-assistant-status',padding:10},
      {selector:'.hero-assistant-label',padding:10},
      {selector:'.hero-assistant-help',padding:10},
      {selector:'.hero-assistant-input-wrap',padding:{left:18,right:18,top:14,bottom:14}},
      {selector:'.hero-suggestions',padding:10},
      {selector:'.hero-assistant-result',padding:10}
    ];
    cursorProtectedRects=rules.map(rule=>{
      const element=document.querySelector(rule.selector);if(!element)return null;
      const rect=element.getBoundingClientRect(),pad=typeof rule.padding==='number'?{left:rule.padding,right:rule.padding,top:rule.padding,bottom:rule.padding}:rule.padding;
      return{left:rect.left-heroRect.left-pad.left,right:rect.right-heroRect.left+pad.right,top:rect.top-heroRect.top-pad.top,bottom:rect.bottom-heroRect.top+pad.bottom};
    }).filter(Boolean);
    const pointIsSafe=point=>cursorProtectedRects.every(rect=>point.x<rect.left||point.x>rect.right||point.y<rect.top||point.y>rect.bottom);
    const startRules=[
      {selector:'nav',padding:12},
      {selector:'.hero-space-copy',padding:34},
      {selector:'.hero-assistant',padding:34}
    ];
    cursorStartProtectedRects=startRules.map(rule=>{
      const element=document.querySelector(rule.selector);if(!element)return null;
      const rect=element.getBoundingClientRect(),pad=typeof rule.padding==='number'?{left:rule.padding,right:rule.padding,top:rule.padding,bottom:rule.padding}:rule.padding;
      return{left:rect.left-heroRect.left-pad.left,right:rect.right-heroRect.left+pad.right,top:rect.top-heroRect.top-pad.top,bottom:rect.bottom-heroRect.top+pad.bottom};
    }).filter(Boolean);
    const pointIsStartSafe=point=>cursorStartProtectedRects.every(rect=>point.x<rect.left||point.x>rect.right||point.y<rect.top||point.y>rect.bottom);
    const insetX=clamp(width*.06,42,82),insetY=clamp(height*.08,48,78);
    cursorSafePoints=stars.filter(pointIsSafe).filter(point=>point.x>=insetX&&point.x<=width-insetX-58&&point.y>=insetY&&point.y<=height-insetY-52);
    const centralPoints=cursorSafePoints.filter(point=>point.x>=width*.18&&point.x<=width*.82&&point.y>=height*.12&&point.y<=height*.88);
    let preferredPoints=centralPoints.length>=12?centralPoints:cursorSafePoints;
    if(!preferredPoints.some(pointIsStartSafe))preferredPoints=cursorSafePoints;
    const remaining=preferredPoints.slice();
    const maxEdge=clamp(width*.25,145,320);
    let attempts=0;
    while(cursorRoutes.length<5&&remaining.length>=3&&attempts<stars.length){
      attempts++;
      const startOptions=remaining.filter(pointIsStartSafe);
      if(!startOptions.length)break;
      const startPoint=startOptions[Math.floor(Math.random()*startOptions.length)];
      const seedIndex=remaining.indexOf(startPoint);
      const route=[remaining.splice(seedIndex,1)[0]];
      while(route.length<4&&remaining.length){
        const lastPoint=route[route.length-1];
        const options=remaining.map((point,index)=>({point,index,distance:Math.hypot(point.x-lastPoint.x,point.y-lastPoint.y)}))
          .filter(item=>item.distance>38&&item.distance<maxEdge&&edgeIsSafe(lastPoint,item.point)).sort((a,b)=>a.distance-b.distance);
        if(!options.length)break;
        route.push(remaining.splice(options[0].index,1)[0]);
      }
      if(route.length<3)continue;
      const path=document.createElementNS(svgNS,'path');
      path.setAttribute('class','');cursorSvg.appendChild(path);
      cursorRoutes.push({points:route,path});
    }
    orderCursorRoutes();
  }

  function segmentTouchesRect(a,b,rect){
    const dx=b.x-a.x,dy=b.y-a.y,p=[-dx,dx,-dy,dy],q=[a.x-rect.left,rect.right-a.x,a.y-rect.top,rect.bottom-a.y];
    let minT=0,maxT=1;
    for(let i=0;i<4;i++){
      if(Math.abs(p[i])<1e-7){if(q[i]<0)return false;continue}
      const t=q[i]/p[i];
      if(p[i]<0){if(t>maxT)return false;if(t>minT)minT=t}
      else{if(t<minT)return false;if(t<maxT)maxT=t}
    }
    return minT<=maxT;
  }
  function edgeIsSafe(a,b){return cursorProtectedRects.every(rect=>!segmentTouchesRect(a,b,rect))}
  function pathLength(points){let total=0;for(let i=1;i<points.length;i++)total+=Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y);return total}
  function orderCursorRoutes(){
    if(!cursorRoutes.length)return;
    if(cursorRoutes.length===1)return;
    const ordered=[cursorRoutes[0]],remaining=cursorRoutes.slice(1);
    while(remaining.length){
      const from=ordered[ordered.length-1].points.at(-1);
      let best=null;
      remaining.forEach((route,index)=>{
        const points=route.points,distance=Math.hypot(points[0].x-from.x,points[0].y-from.y);
        if(!best||distance<best.distance)best={index,route,points,distance};
      });
      const chosen=remaining.splice(best.index,1)[0];chosen.points=best.points;ordered.push(chosen);
    }
    cursorRoutes=ordered;
  }

  function routePath(points,lastPoint){
    const coords=points.map(point=>`${point.x.toFixed(1)} ${point.y.toFixed(1)}`);
    if(lastPoint)coords.push(`${lastPoint.x.toFixed(1)} ${lastPoint.y.toFixed(1)}`);
    return coords.length?`M ${coords[0]}${coords.slice(1).map(point=>` L ${point}`).join('')}`:'';
  }
  function resetCursorRoutes(){
    cursorRouteIndex=0;cursorRouteStart=0;cursorTransit=null;
    cursorRoutes.forEach(route=>{route.path.setAttribute('d','');route.path.setAttribute('class','')});
    if(cursorPointer){cursorPointer.style.opacity='0';cursorPointer.classList.remove('is-soft')}
  }
  function updateCollaboratorCursor(time){
    if(!cursorPointer||!cursorSvg||reduce||!cursorMedia.matches||!cursorRoutes.length){if(cursorPointer){cursorPointer.style.opacity='0';cursorPointer.classList.remove('is-soft')}return}
    if(!cursorRouteStart)cursorRouteStart=time;
    const moveMs=880,stepMs=1120,dwellMs=780;
    if(cursorTransit){
      const transit=cursorTransit,progress=clamp((time-transit.started)/transit.duration,0,1),eased=.5-Math.cos(Math.PI*progress)/2,distance=pathLength(transit.points)*eased;
      let remaining=distance,x=transit.points[0].x,y=transit.points[0].y,segmentIndex=0;
      for(let i=1;i<transit.points.length;i++){
        const a=transit.points[i-1],b=transit.points[i],segmentLength=Math.hypot(b.x-a.x,b.y-a.y);
        if(remaining<=segmentLength||i===transit.points.length-1){const t=segmentLength?clamp(remaining/segmentLength,0,1):1;x=a.x+(b.x-a.x)*t;y=a.y+(b.y-a.y)*t;segmentIndex=i-1;break}
        remaining-=segmentLength;
      }
      placeCursor(x,y);
      if(progress>=1){
        if(transit.resetCycle)cursorRoutes.forEach(route=>{route.path.setAttribute('d','');route.path.setAttribute('class','')});
        cursorRouteIndex=transit.nextRoute;cursorRouteStart=time;cursorTransit=null;
      }
      return;
    }

    const route=cursorRoutes[cursorRouteIndex],points=route.points;
    let elapsed=time-cursorRouteStart;
    const travelDuration=(points.length-1)*stepMs;
    if(elapsed>=travelDuration+dwellMs){
      route.path.setAttribute('d',routePath(points));route.path.setAttribute('class','complete');
      const nextRoute=(cursorRouteIndex+1)%cursorRoutes.length,next=cursorRoutes[nextRoute];
      const connector=[points.at(-1),next.points[0]];
      cursorTransit={points:connector,started:time,duration:clamp(pathLength(connector)*2.5,900,2500),nextRoute,resetCycle:nextRoute===0};
      placeCursor(points.at(-1).x,points.at(-1).y);
      return;
    }

    let x=points[0].x,y=points[0].y;
    if(elapsed>=travelDuration){
      const lastPoint=points[points.length-1];x=lastPoint.x;y=lastPoint.y;
      route.path.setAttribute('d',routePath(points));route.path.setAttribute('class','complete');
      cursorPointer.style.opacity='1';
    }else{
      const segmentIndex=Math.min(points.length-2,Math.floor(elapsed/stepMs));
      const segmentTime=elapsed-segmentIndex*stepMs,progress=clamp(segmentTime/moveMs,0,1);
      const eased=.5-Math.cos(Math.PI*progress)/2,a=points[segmentIndex],b=points[segmentIndex+1];
      x=a.x+(b.x-a.x)*eased;y=a.y+(b.y-a.y)*eased;
      route.path.setAttribute('d',routePath(points.slice(0,segmentIndex+1),{x,y}));
      route.path.setAttribute('class','active');
      cursorPointer.style.opacity='1';
    }
    placeCursor(x,y);
  }

  function resize(){
    const rect=hero.getBoundingClientRect();
    width=rect.width;height=rect.height;dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    canvas.style.width=width+'px';canvas.style.height=height+'px';ctx.setTransform(dpr,0,0,dpr,0,0);
    const count=Math.round(clamp(width*height/7400,65,185));
    stars=Array.from({length:count},()=>({x:Math.random()*width,y:Math.random()*height,size:Math.random()<.82?2:3,alpha:.2+Math.random()*.65,phase:Math.random()*Math.PI*2,twinkleSpeed:.0007+Math.random()*.006,twinkleDepth:.25+Math.random()*.6,red:Math.random()<.15}));
    buildConstellations();
    buildCursorRoutes();
    paintStatic();
  }

  function fadeAt(y){return 1-clamp((y/Math.max(1,height)-.72)/.28,0,1)}
  function paintStatic(){
    ctx.clearRect(0,0,width,height);
    drawConstellations();
    stars.forEach(s=>{ctx.globalAlpha=s.alpha*fadeAt(s.y);ctx.fillStyle=s.red?'#e45c50':'#f4f3ef';ctx.fillRect(Math.round(s.x),Math.round(s.y),s.size,s.size)});
    ctx.globalAlpha=1;
  }
  function launchComet(){
    const hot=Math.random()<.32,speed=hot?3.5+Math.random()*2.2:6.8+Math.random()*3.2,angle=(18+Math.random()*54)*Math.PI/180,dxSign=Math.random()<.5?-1:1;
    const dx=Math.cos(angle)*speed*dxSign,dy=Math.sin(angle)*speed;
    const x=dx>0?Math.random()*width*.42:width-Math.random()*width*.42,y=Math.random()*height*.5+height*.04;
    const length=hot?120+Math.random()*70:48+Math.random()*72;
    const flame=hot?Array.from({length:14},(_,i)=>({back:(.08+i/14*.88)*length,side:(Math.random()-.5)*(6+i*.34),size:3.3+Math.random()*3.5,alpha:.35+Math.random()*.55,color:['#fff0b0','#ffd080','#ff9b60','#f2674e','#ca271c'][Math.min(4,Math.floor(i/3))]})):[];
    comets.push({x,y,dx,dy,speed,life:0,max:hot?58+Math.random()*26:36+Math.random()*16,length,alpha:.55+Math.random()*.45,hot,flame});
  }
  function frame(time){
    raf=0;if(!visible)return;
    const dt=Math.min(2.5,(time-last)/16.67||1);last=time;
    ctx.clearRect(0,0,width,height);
    drawConstellations();
    stars.forEach(s=>{
      const twinkle=1-s.twinkleDepth/2+Math.sin(time*s.twinkleSpeed+s.phase)*s.twinkleDepth/2;
      ctx.globalAlpha=s.alpha*twinkle*fadeAt(s.y);ctx.fillStyle=s.red?'#e45c50':'#f4f3ef';ctx.fillRect(Math.round(s.x),Math.round(s.y),s.size,s.size);
    });
    updateCollaboratorCursor(time);
    if(time>nextComet){launchComet();if(Math.random()<.28)launchComet();nextComet=time+1500+Math.random()*1300}
    comets=comets.filter(c=>c.life<c.max);
    comets.forEach(c=>{
      c.x+=c.dx*dt;c.y+=c.dy*dt;c.life=Math.min(c.max,c.life+dt);
      const rawLife=clamp(1-c.life/c.max,0,1),tailProgress=clamp(rawLife/.18,0,1),life=rawLife*tailProgress*tailProgress*(3-2*tailProgress),tailX=c.x-c.dx*c.length/5,tailY=c.y-c.dy*c.length/5;
      const trail=ctx.createLinearGradient(tailX,tailY,c.x,c.y);trail.addColorStop(0,`rgba(${c.hot?'202,39,28':'244,243,239'},0)`);trail.addColorStop(.72,`rgba(${c.hot?'202,39,28':'244,243,239'},${c.alpha*life*(c.hot ? .82 : .38)})`);trail.addColorStop(1,`rgba(${c.hot?'255,178,105':'244,243,239'},${c.alpha*life})`);
      ctx.globalAlpha=fadeAt(c.y)*life;ctx.strokeStyle=trail;ctx.lineWidth=c.hot?3:1.65;ctx.lineCap='butt';ctx.shadowColor=c.hot?'rgba(202,39,28,.78)':'transparent';ctx.shadowBlur=c.hot?9:0;ctx.beginPath();ctx.moveTo(tailX,tailY);ctx.lineTo(c.x,c.y);ctx.stroke();ctx.shadowBlur=0;
      if(c.hot){
        const ux=c.dx/c.speed,uy=c.dy/c.speed,nx=-uy,ny=ux;
        c.flame.forEach(p=>{const fx=c.x-ux*p.back+nx*p.side,fy=c.y-uy*p.back+ny*p.side;ctx.globalAlpha=fadeAt(fy)*c.alpha*life*p.alpha;ctx.fillStyle=p.color;ctx.fillRect(Math.round(fx-p.size/2),Math.round(fy-p.size/2),p.size,p.size)});
        ctx.globalAlpha=fadeAt(c.y)*c.alpha*life*.24;ctx.fillStyle='#ca271c';ctx.fillRect(Math.round(c.x-8),Math.round(c.y-8),16,16);
        ctx.globalAlpha=fadeAt(c.y)*c.alpha*life;ctx.fillStyle='#fff0b0';ctx.fillRect(Math.round(c.x-4),Math.round(c.y-4),8,8);
      }else{ctx.globalAlpha=fadeAt(c.y)*c.alpha*life;ctx.fillStyle='#f4f3ef';ctx.fillRect(Math.round(c.x-2),Math.round(c.y-2),4,4)}
    });
    ctx.globalAlpha=1;raf=requestAnimationFrame(frame);
  }
  function start(){if(reduce){paintStatic();return}if(visible&&!raf){last=performance.now();nextComet=last+700;raf=requestAnimationFrame(frame)}}
  function stop(){if(raf){cancelAnimationFrame(raf);raf=0}resetCursorRoutes();paintStatic()}
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();else stop()},{threshold:.02}).observe(hero);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else start()});
  addEventListener('resize',resize,{passive:true});
  addEventListener('langchange',()=>measureCursorBlurRects(),{passive:true});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>measureCursorBlurRects());
  resize();start();

  /* Sugestões preenchem o campo letra a letra; o visitante decide quando enviar. */
  let typingTimer=0;
  input.addEventListener('input',()=>{clearInterval(typingTimer);result.textContent=''});
  document.querySelectorAll('[data-hero-suggestion]').forEach(button=>button.addEventListener('click',()=>{
    clearInterval(typingTimer);result.textContent='';input.value='';input.focus({preventScroll:true});
    const text=button.textContent.trim();let i=0;
    typingTimer=setInterval(()=>{input.value=text.slice(0,++i);if(i>=text.length)clearInterval(typingTimer)},23);
  }));

  function normalize(text){return text.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim()}
  function containsTerm(query,term){return(' '+query+' ').includes(' '+normalize(term)+' ')}
  const destinations=[
    {terms:['identidade visual','visual identity','identity','branding','marca','logo','identidade','brand identity'],selector:'#project-serenia'},
    {terms:['landing page','landingpage','landing','site','sites','website','websites','interface','ui','ui design','user interface'],selector:'#project-lopes'},
    {terms:['redes sociais','rede social','social media','instagram','posts','conteudo social'],selector:'#project-prop'},
    {terms:['video','videos','video editing','editor de video','edicao','edicao de video','edicao de videos','editar video','editar videos'],selector:'#servico-edicao-video'},
    {terms:['naming','nome de marca','nome para marca'],selector:'#servicos'},
    {terms:['direcao de arte','art direction','direcao visual','digital'],selector:'#project-algum'},
    {terms:['serenia','aromas'],selector:'#project-serenia'},
    {terms:['lopes arq','lopes'],selector:'#project-lopes'},
    {terms:['algum criativo'],selector:'#project-algum'},
    {terms:['prop'],selector:'#project-prop'},
    {terms:['dani ferri','dani'],selector:'#project-dani'},
    {terms:['botigelli'],selector:'#project-botigelli'},
    {terms:['prudem','pruden quimica'],selector:'#project-prudem'},
    {terms:['min obras'],selector:'#project-min-obras'},
    {terms:['gm imobiliaria','gm'],selector:'#project-gm'},
    {terms:['servico','servicos','service','services','motion','motion design','reels','estruturação de perfil','profile setup','gestao de redes sociais','o que voce faz','o que voce oferece','contratar'],selector:'#servicos'},
    {terms:['projeto','projetos','projects','portfolio','portfólio','trabalhos','work'],selector:'#projetos'},
    {terms:['processo','como voce trabalha','etapas'],selector:'#processo'},
    {terms:['sobre','about','quem e voce','quem sou'],selector:'#sobre'},
    {terms:['contato','contact','whatsapp','conversar','agendar','orcamento','orçamento'],selector:'#contato'}
  ];
  const stopWords=new Set(['a','as','o','os','de','da','do','das','dos','e','para','em']);
  const projectNames=[...document.querySelectorAll('#project-list .pc')].map(card=>({selector:'#'+card.id,words:normalize(card.querySelector('.pc-title')?.textContent||'').split(' ').filter(word=>word&&!stopWords.has(word))}));
  function findProjectNameDestination(query){
    const tokens=query.split(' ').filter(word=>!stopWords.has(word));
    const matches=projectNames.filter(project=>tokens.some(token=>project.words.includes(token)));
    if(matches.length===1)return{selector:matches[0].selector};
    if(matches.length>1)return{selector:'#projetos'};
    return null;
  }
  const projectSegments=[...document.querySelectorAll('#project-list .pc[data-segment]')].map(card=>{
    const segment=normalize(card.dataset.segment),destination=destinations.find(item=>item.selector==='#'+card.id);
    return destination?{...destination,segment,words:segment.split(' ')}:null;
  }).filter(Boolean);
  function findSegmentDestination(query){
    const tokens=query.split(' '),meaningful=tokens.filter(word=>!stopWords.has(word));
    const phraseMatches=projectSegments.filter(item=>containsTerm(query,item.segment));
    if(phraseMatches.length===1)return phraseMatches[0];
    if(phraseMatches.length>1)return{selector:'#projetos'};
    const scores=projectSegments.map(item=>({item,score:meaningful.filter(word=>item.words.includes(word)).length}));
    const best=Math.max(0,...scores.map(entry=>entry.score));
    if(best){const matches=scores.filter(entry=>entry.score===best);return matches.length===1?matches[0].item:{selector:'#projetos'}}
    if(projectSegments.some(item=>tokens.some(word=>item.words.includes(word))))return{selector:'#projetos'};
    return null;
  }
  form.addEventListener('submit',event=>{
    event.preventDefault();clearInterval(typingTimer);
    const query=normalize(input.value);
    if(!query){result.textContent='';input.focus();return}
    const match=destinations.find(item=>item.terms.some(term=>containsTerm(query,term)))||findProjectNameDestination(query)||findSegmentDestination(query);
    const target=match&&document.querySelector(match.selector);
    if(!target){result.textContent=say('Não encontrei esse atalho. Tente um serviço, projeto ou segmento.','I could not match that shortcut. Try a service, project or industry.');return}
    result.textContent='';
    history.pushState(null,'',match.selector);
    target.scrollIntoView({behavior:reduce?'instant':'smooth',block:match.selector.startsWith('#project-')||match.selector==='#servico-edicao-video'?'center':'start'});
  });

  const navClearThreshold=30;
  let navScrolled=scrollY>navClearThreshold,previousScrollY=scrollY;
  root.classList.toggle('nav-scrolled',navScrolled);
  const updateNav=()=>{
    const y=scrollY;
    if(y<previousScrollY){if(y<=navClearThreshold)navScrolled=false}
    else if(y>1)navScrolled=true;
    previousScrollY=y;
    root.classList.toggle('nav-scrolled',navScrolled);
  };
  addEventListener('scroll',updateNav,{passive:true});
  updateNav();
})();
