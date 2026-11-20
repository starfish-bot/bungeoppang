(function(){
  var KEY = "bungeoppang-v1";
  var UPS = [
    {id:"dough", name:"진한 반죽", desc:"클릭당 +1개", base:15,   click:1, auto:0},
    {id:"part",  name:"알바생",    desc:"초당 +1개",   base:60,   click:0, auto:1},
    {id:"mold",  name:"두 번째 틀", desc:"초당 +8개",   base:500,  click:0, auto:8},
    {id:"chain", name:"프랜차이즈", desc:"초당 +60개",  base:4000, click:0, auto:60}
  ];
  var S = {n:0, owned:{}};
  try{
    var raw = localStorage.getItem(KEY);
    if(raw){ var p = JSON.parse(raw); if(p && typeof p.n === "number"){ S.n = p.n; S.owned = p.owned || {}; } }
  }catch(e){}

  function owned(id){ return S.owned[id] || 0; }
  function cost(u){ return Math.ceil(u.base * Math.pow(1.35, owned(u.id))); }
  function perClick(){ var v = 1; UPS.forEach(function(u){ v += u.click * owned(u.id); }); return v; }
  function perSec(){ var v = 0; UPS.forEach(function(u){ v += u.auto * owned(u.id); }); return v; }

  function fmt(x){
    x = Math.floor(x);
    if(x >= 1e8) return (x/1e8).toFixed(2).replace(/\.?0+$/,"") + "억";
    if(x >= 1e4) return (x/1e4).toFixed(1).replace(/\.0$/,"") + "만";
    return x.toLocaleString("ko-KR");
  }

  var elScore = document.getElementById("score");
  var elRate = document.getElementById("rate");
  var elList = document.getElementById("list");
  var elStage = document.getElementById("stage");
  var elFish = document.getElementById("fish");
  var rows = {};

  UPS.forEach(function(u){
    var b = document.createElement("button");
    b.className = "up";
    b.innerHTML = '<span><b>' + u.name + '</b> <span class="own"></span></span><span class="c"></span><span class="d">' + u.desc + '</span>';
    b.addEventListener("click", function(){
      var c = cost(u);
      if(S.n >= c){ S.n -= c; S.owned[u.id] = owned(u.id) + 1; render(); save(); }
    });
    elList.appendChild(b);
    rows[u.id] = {btn:b, own:b.querySelector(".own"), c:b.querySelector(".c")};
  });

  function render(){
    elScore.textContent = fmt(S.n) + "개";
    elRate.textContent = "클릭당 " + fmt(perClick()) + "개 · 초당 " + fmt(perSec()) + "개";
    UPS.forEach(function(u){
      var r = rows[u.id], c = cost(u), o = owned(u.id);
      r.own.textContent = o ? "(" + o + "개 보유)" : "";
      r.c.innerHTML = fmt(c) + "개";
      r.btn.disabled = S.n < c;
    });
  }

  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  elFish.addEventListener("click", function(e){
    var v = perClick();
    S.n += v;
    if(!reduce){
      var r = elStage.getBoundingClientRect();
      var x = e.clientX ? e.clientX - r.left : r.width/2;
      var y = e.clientY ? e.clientY - r.top : r.height/2;
      var s = document.createElement("span");
      s.className = "pop"; s.textContent = "+" + fmt(v);
      s.style.left = (x - 12) + "px"; s.style.top = (y - 20) + "px";
      elStage.appendChild(s);
      setTimeout(function(){ s.remove(); }, 800);
    }
    render();
  });

  var last = Date.now();
  setInterval(function(){
    var now = Date.now(), dt = (now - last) / 1000; last = now;
    var ps = perSec();
    if(ps > 0){ S.n += ps * dt; render(); }
  }, 100);

  function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }
  setInterval(save, 5000);
  document.addEventListener("visibilitychange", function(){ if(document.hidden) save(); });

  document.getElementById("reset").addEventListener("click", function(){
    if(confirm("저장된 기록이 모두 지워져요. 처음부터 다시 시작할까요?")){
      S = {n:0, owned:{}}; render(); save();
    }
  });

  render();
})();
