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
      // don't steal focus from links inside
      if(e.target.closest('a')) return;
      focusWin(id);
    });
  });

  // capture each transcript, then (if animating) clear for replay
  function grab(id){var s=d.getElementById(id);return {el:s,nodes:Array.prototype.slice.call(s.children)};}
  var M=grab('mainscr'),P=grab('projscr'),L=grab('labscr'),S=grab('socscr');

  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var cancelled=false;

  function restore(prog){prog.el.innerHTML='';prog.nodes.forEach(function(n){prog.el.appendChild(n.cloneNode(true));});}
  function finishAll(){
    if(cancelled)return;cancelled=true;
    restore(M);restore(P);restore(L);restore(S);
    desk.classList.add('tiled');
    win.lab.classList.add('open');
    win.social.classList.add('open');
    markLive('projects');markLive('lab');markLive('social');focusWin('main');
  }
  d.addEventListener('keydown',finishAll);
  desk.addEventListener('click',function(e){if(!e.target.closest('a'))finishAll();});

  if(reduce){
    // no animation: show everything tiled
    desk.classList.add('tiled');
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

  // boot sequence: main → projects → lab → social
  setTimeout(function(){
    play(M,function(){
      if(cancelled)return;
      setTimeout(function(){
        if(cancelled)return;
        desk.classList.add('tiled');markLive('projects');
        setTimeout(function(){
          if(cancelled)return;
          play(P,function(){
            if(cancelled)return;
            setTimeout(function(){
              if(cancelled)return;
              win.lab.classList.add('open');markLive('lab');
              setTimeout(function(){
                if(cancelled)return;
                play(L,function(){
                  if(cancelled)return;
                  setTimeout(function(){
                    if(cancelled)return;
                    win.social.classList.add('open');markLive('social');
                    setTimeout(function(){ if(!cancelled) play(S); },500);
                  },280);
                });
              },520);
            },280);
          });
        },580);
      },380);
    });
  },380);
})();
