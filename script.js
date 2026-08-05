(function(){
  var d=document;
  function tick(){var t=new Date(),h=('0'+t.getHours()).slice(-2),m=('0'+t.getMinutes()).slice(-2);
    var el=d.getElementById('clock');if(el)el.innerHTML='<b>'+h+':'+m+'</b>';}
  tick();setInterval(tick,10000);

  var desk=d.querySelector('.desk');
  var win={main:d.getElementById('main'),projects:d.getElementById('projects'),lab:d.getElementById('labwin'),social:d.getElementById('socwin')};
  var wsLinks=d.querySelectorAll('.ws a');
  function focusWin(id){for(var k in win){win[k].classList.toggle('focus',k===id);}
    wsLinks.forEach(function(l){l.classList.toggle('on',l.getAttribute('data-win')===id);});}
  function markLive(id){wsLinks.forEach(function(l){if(l.getAttribute('data-win')===id)l.classList.add('live');});}
  wsLinks.forEach(function(l){l.addEventListener('click',function(e){
    var id=l.getAttribute('data-win');focusWin(id);
    if(window.innerWidth<=820){e.preventDefault();(win[id]).scrollIntoView({behavior:'smooth',block:'center'});}
  });});

  // Clicking a terminal window focuses/highlights it
  Object.keys(win).forEach(function(id){
    win[id].addEventListener('click', function(e){
      if(e.target.closest('a')) return;
      focusWin(id);
    });
  });

  function grab(id){var s=d.getElementById(id);return {el:s,nodes:Array.prototype.slice.call(s.children)};}
  var M=grab('mainscr'),P=grab('projscr'),L=grab('labscr'),S=grab('socscr');

  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var cancelled=false;

  function setStage(n){
    desk.classList.remove('stage-2','stage-3','stage-4','tiled');
    if(n>=2) desk.classList.add('stage-'+n);
    if(n>=4) desk.classList.add('tiled');
  }

  function restore(prog){prog.el.innerHTML='';prog.nodes.forEach(function(n){prog.el.appendChild(n.cloneNode(true));});}
  function finishAll(){
    if(cancelled)return;cancelled=true;
    restore(M);restore(P);restore(L);restore(S);
    setStage(4);
    win.lab.classList.add('open');
    win.social.classList.add('open');
    markLive('projects');markLive('lab');markLive('social');focusWin('main');
  }
  d.addEventListener('keydown',finishAll);
  desk.addEventListener('click',function(e){if(!e.target.closest('a'))finishAll();});

  if(reduce){
    setStage(4);
    win.lab.classList.add('open');
    win.social.classList.add('open');
    markLive('projects');markLive('lab');markLive('social');
    return;
  }

  // clear the screens; side windows stay collapsed until spawned
  [M,P,L,S].forEach(function(p){p.el.innerHTML='';});

  function play(prog,onDone){
    var i=0;
    (function next(){
      if(cancelled)return;
      if(i>=prog.nodes.length){onDone&&onDone();return;}
      var node=prog.nodes[i].cloneNode(true);
      var cmd=node.querySelector&&node.querySelector('.cmdtext');
      if(cmd){
        var full=cmd.textContent;cmd.textContent='';
        var caret=d.createElement('span');caret.className='caret';cmd.after(caret);
        prog.el.appendChild(node);
        var j=0;
        (function type(){
          if(cancelled)return;
          if(j<full.length){cmd.textContent+=full.charAt(j++);setTimeout(type,24+Math.random()*30);}
          else{caret.remove();i++;setTimeout(next,240);}
        })();
      }else{
        prog.el.appendChild(node);i++;
        setTimeout(next,node.classList&&node.classList.contains('finalprompt')?0:150);
      }
    })();
  }

  // Progressive tiling boot:
  // 1. main full-screen
  // 2. projects splits vertically (50/50)
  // 3. social takes full bottom half
  // 4. lab splits bottom → classic 2×2
  setTimeout(function(){
    play(M,function(){
      if(cancelled)return;
      setTimeout(function(){
        if(cancelled)return;
        setStage(2);markLive('projects');
        setTimeout(function(){
          if(cancelled)return;
          play(P,function(){
            if(cancelled)return;
            setTimeout(function(){
              if(cancelled)return;
              setStage(3);win.social.classList.add('open');markLive('social');
              setTimeout(function(){
                if(cancelled)return;
                play(S,function(){
                  if(cancelled)return;
                  setTimeout(function(){
                    if(cancelled)return;
                    setStage(4);win.lab.classList.add('open');markLive('lab');
                    setTimeout(function(){ if(!cancelled) play(L); },480);
                  },260);
                });
              },480);
            },260);
          });
        },520);
      },360);
    });
  },360);
})();
