(function(){
  var d=document;
  function tick(){var t=new Date(),h=('0'+t.getHours()).slice(-2),m=('0'+t.getMinutes()).slice(-2);
    var el=d.getElementById('clock');if(el)el.innerHTML='<b>'+h+':'+m+'</b>';}
  tick();setInterval(tick,10000);

  var desk=d.querySelector('.desk');
  var win={main:d.getElementById('main'),projects:d.getElementById('projects'),social:d.getElementById('socwin'),lab:d.getElementById('labwin')};
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

  function reveal(id){win[id].classList.add('open');}
  function splitCols(){desk.classList.add('split-cols');}
  function splitRows(){desk.classList.add('split-rows');}
  function openLab(){
    var bottom=d.getElementById('bottom');
    if(bottom) bottom.classList.add('lab-open');
    reveal('lab');
  }

  function restore(prog){prog.el.innerHTML='';prog.nodes.forEach(function(n){prog.el.appendChild(n.cloneNode(true));});}
  function finishAll(){
    if(cancelled)return;cancelled=true;
    restore(M);restore(P);restore(L);restore(S);
    splitCols();splitRows();
    var bottom=d.getElementById('bottom');
    if(bottom) bottom.classList.add('lab-open');
    reveal('projects');reveal('social');reveal('lab');
    markLive('projects');markLive('social');markLive('lab');focusWin('main');
  }
  d.addEventListener('keydown',finishAll);
  desk.addEventListener('click',function(e){if(!e.target.closest('a'))finishAll();});

  if(reduce){
    splitCols();splitRows();
    var bottom=d.getElementById('bottom');
    if(bottom) bottom.classList.add('lab-open');
    reveal('projects');reveal('social');reveal('lab');
    markLive('projects');markLive('social');markLive('lab');
    return;
  }

  // clear the screens; spawning panes stay collapsed/hidden until opened
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

  // Progressive tiling boot (tracks animate → panes grow in smoothly):
  //  1. main fills the desk and types
  //  2. right column grows → projects spawns, then types
  //  3. bottom row grows → social full-width, types its links
  //  4. lab splits in beside social, then types
  var GROW=520;   // ~matches the .5s track transition so a re-tile settles first
  setTimeout(function(){
    play(M,function(){
      if(cancelled)return;
      setTimeout(function(){
        if(cancelled)return;
        splitCols();reveal('projects');markLive('projects');
        setTimeout(function(){
          if(cancelled)return;
          play(P,function(){
            if(cancelled)return;
            setTimeout(function(){
              if(cancelled)return;
              splitRows();reveal('social');markLive('social');  // social full bottom
              setTimeout(function(){
                if(cancelled)return;
                play(S,function(){
                  if(cancelled)return;
                  setTimeout(function(){
                    if(cancelled)return;
                    openLab();markLive('lab');                 // lab splits in
                    setTimeout(function(){ if(!cancelled) play(L); },GROW);
                  },280);
                });
              },GROW);
            },300);
          });
        },GROW);
      },380);
    });
  },360);
})();
