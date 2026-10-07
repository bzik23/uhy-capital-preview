/* UHY Capital - site behaviour. Each block is its own IIFE. */
(function(){ // nav scrolled state
  var nav=document.getElementById('nav'); if(!nav) return;
  var on=function(){ nav.classList.toggle('scrolled', window.scrollY>24); };
  on(); window.addEventListener('scroll', on, {passive:true});
})();

(function(){ // services dropdown (hover, touch, keyboard)
  var items=document.querySelectorAll('.menu .has-sub');
  var touch=window.matchMedia('(hover:none)').matches;
  items.forEach(function(li){
    var a=li.querySelector(':scope > a'); var t;
    function open(){ clearTimeout(t); li.classList.add('open'); a.setAttribute('aria-expanded','true'); }
    function close(){ t=setTimeout(function(){ li.classList.remove('open'); a.setAttribute('aria-expanded','false'); },120); }
    li.addEventListener('mouseenter', open); li.addEventListener('mouseleave', close);
    li.addEventListener('focusin', open); li.addEventListener('focusout', function(e){ if(!li.contains(e.relatedTarget)) close(); });
    a.addEventListener('click', function(e){ if(touch && !li.classList.contains('open')){ e.preventDefault(); open(); } });
    a.addEventListener('keydown', function(e){ if(e.key==='ArrowDown'){ e.preventDefault(); open(); var f=li.querySelector('.sub a'); if(f) f.focus(); } });
    li.addEventListener('keydown', function(e){ if(e.key==='Escape'){ li.classList.remove('open'); a.focus(); } });
  });
  document.addEventListener('click', function(e){ items.forEach(function(li){ if(!li.contains(e.target)) li.classList.remove('open'); }); });
})();

(function(){ // hamburger + full-screen menu
  var b=document.querySelector('.burger'), m=document.getElementById('mnav'); if(!b||!m) return;
  function set(o){ b.setAttribute('aria-expanded', o?'true':'false'); m.classList.toggle('open', o); document.documentElement.style.overflow=o?'hidden':''; }
  b.addEventListener('click', function(){ set(b.getAttribute('aria-expanded')!=='true'); });
  m.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ set(false); }); });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') set(false); });
})();

(function(){ // active nav link (compares decoded paths, so Hebrew slugs work)
  function norm(p){ try{ p=decodeURIComponent(p); }catch(e){} return p.replace(/\/+$/,'') || '/'; }
  var here=norm(location.pathname);
  document.querySelectorAll('.menu li').forEach(function(li){
    var hrefs=[].map.call(li.querySelectorAll('a'), function(a){ try{ return norm(new URL(a.getAttribute('href'), location.href).pathname); }catch(e){ return ''; } });
    if(hrefs.indexOf(here)>-1) li.classList.add('active');
  });
})();

(function(){ // scroll reveal
  var els=document.querySelectorAll('[data-rv]'); if(!els.length) return;
  if(!('IntersectionObserver' in window)){ els.forEach(function(e){ e.classList.add('in'); }); return; }
  var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); }, {rootMargin:'0px 0px -8% 0px', threshold:.08});
  els.forEach(function(e){ io.observe(e); });
})();

(function(){ // auto-stagger siblings inside grids
  document.querySelectorAll('.bento,.team,.pillars,.caps,.why-grid2,.items,.posts,.rows,.paths').forEach(function(g){
    [].forEach.call(g.children, function(c,i){ if(c.hasAttribute('data-rv') && !c.style.getPropertyValue('--d')) c.style.setProperty('--d', (i*0.08)+'s'); });
  });
})();

(function(){ // count-up stats
  var els=document.querySelectorAll('[data-count]'); if(!els.length) return;
  function run(el){ var to=parseFloat(el.getAttribute('data-count')), pre=el.getAttribute('data-pre')||'', suf=el.getAttribute('data-suf')||'', t0=null, dur=1600;
    function step(ts){ if(!t0) t0=ts; var p=Math.min(1,(ts-t0)/dur); p=1-Math.pow(1-p,3); el.firstChild.nodeValue=pre+Math.round(to*p)+suf; if(p<1) requestAnimationFrame(step); }
    requestAnimationFrame(step); }
  var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ run(e.target); io.unobserve(e.target); } }); },{threshold:.5});
  els.forEach(function(e){ io.observe(e); });
})();

(function(){ // bio dialogs
  document.querySelectorAll('[data-bio]').forEach(function(b){
    b.addEventListener('click', function(){ var d=document.getElementById('bio-'+b.getAttribute('data-bio')); if(d && d.showModal){ d.showModal(); } });
  });
  document.querySelectorAll('dialog.bio').forEach(function(d){
    d.querySelector('.bio-x').addEventListener('click', function(){ d.close(); });
    d.addEventListener('click', function(e){ if(e.target===d) d.close(); });
  });
})();

(function(){ // story nav highlight (about page)
  var links=document.querySelectorAll('.story-nav a'); if(!links.length) return;
  var secs=[].map.call(links, function(a){ return document.querySelector(a.getAttribute('href')); });
  var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ links.forEach(function(a,i){ a.classList.toggle('on', secs[i]===e.target); }); } }); },{rootMargin:'-30% 0px -60% 0px'});
  secs.forEach(function(s){ if(s) io.observe(s); });
})();

(function(){ // forms: AJAX to the WordPress endpoint when present, demo success otherwise
  document.querySelectorAll('form[data-form]').forEach(function(f){
    f.addEventListener('submit', function(e){
      e.preventDefault();
      var msg=f.querySelector('.form-msg'), btn=f.querySelector('button[type=submit]');
      var ep=f.getAttribute('data-endpoint') || (window.UHY && window.UHY.endpoint);
      var done=function(ok,text){ msg.textContent=text; msg.classList.toggle('err',!ok); if(ok){ f.classList.add('sent'); f.reset(); } else { msg.style.display='block'; } if(btn) btn.disabled=false; };
      if(btn) btn.disabled=true;
      if(!ep){ setTimeout(function(){ done(true, f.getAttribute('data-thanks')||'Thank you. We will be in touch shortly.'); }, 600); return; }
      var fd=new FormData(f); fd.append('action','uhy_lead'); fd.append('kind', f.getAttribute('data-form'));
      fd.append('lang', (document.documentElement.lang||'en').slice(0,2));
      if(window.UHY && window.UHY.nonce) fd.append('_wpnonce', window.UHY.nonce);
      fetch(ep,{method:'POST',body:fd,credentials:'same-origin'}).then(function(r){ return r.json(); })
        .then(function(j){ done(!!(j&&j.success), (j&&j.data&&j.data.message)||(j&&j.success?'Thank you. We will be in touch shortly.':'Something went wrong. Please email us directly.')); })
        .catch(function(){ done(false,'Something went wrong. Please email us directly.'); });
    });
  });
})();

(function(){ // magnetic buttons (desktop only)
  if(window.matchMedia('(hover:none)').matches) return;
  document.querySelectorAll('.btn').forEach(function(b){
    b.addEventListener('mousemove', function(e){ var r=b.getBoundingClientRect(); var x=(e.clientX-r.left-r.width/2)/r.width, y=(e.clientY-r.top-r.height/2)/r.height; b.style.transform='translate('+(x*6)+'px,'+(y*6)+'px)'; });
    b.addEventListener('mouseleave', function(){ b.style.transform=''; });
  });
})();

(function(){ // marquee: duplicate content for a seamless loop
  document.querySelectorAll('.marq').forEach(function(m){ m.innerHTML+=m.innerHTML; });
})();

(function(){ // lotus: start drawing when visible (hero draws at once)
  var ls=document.querySelectorAll('.lotus[data-draw]'); if(!ls.length) return;
  var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('draw'); io.unobserve(e.target); } }); },{threshold:.2});
  ls.forEach(function(l){ io.observe(l); });
})();
