(function(){
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');
  const hint = document.getElementById('hint');
  const hintExtra = document.getElementById('hint-extra');
  const label = document.getElementById('label');

  const SIMS = [OrbitSim, WaterSim, BallsSim, BarsWaveSim, AlchemySim, BatterySim];

  let W, H, DPR;
  let sim, paused = false;
  let mouse = { x: 0, y: 0, down: false };
  let hintHidden = false;

  function resize(){
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (sim) sim.resize(W, H);
  }

  function pickRandom(exclude){
    let pool = SIMS;
    if (exclude && SIMS.length > 1) pool = SIMS.filter(S => S !== exclude);
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function loadSim(SimClass){
    W = window.innerWidth;
    H = window.innerHeight;
    sim = new SimClass(ctx, W, H);
    label.textContent = SimClass.title;
    hintExtra.textContent = SimClass.hintExtra;
    revealHint();
  }

  function revealHint(){
    hintHidden = false;
    hint.classList.remove('fade-out');
    label.classList.remove('fade-out');
    clearTimeout(revealHint._t);
    revealHint._t = setTimeout(hideHint, 6000);
  }

  function hideHint(){
    if (hintHidden) return;
    hintHidden = true;
    hint.classList.add('fade-out');
    label.classList.add('fade-out');
  }

  // pointer interaction
  canvas.addEventListener('click', (e) => {
    sim.onClick && sim.onClick(e.clientX, e.clientY);
    hideHint();
  });
  canvas.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY;
    sim.onPointerMove && sim.onPointerMove(mouse.x, mouse.y, mouse.down);
  });
  canvas.addEventListener('mousedown', () => mouse.down = true);
  canvas.addEventListener('mouseup', () => mouse.down = false);

  // touch support
  canvas.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    if (!t) return;
    sim.onClick && sim.onClick(t.clientX, t.clientY);
    mouse.down = true;
    hideHint();
  }, { passive: true });
  canvas.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    if (!t) return;
    mouse.x = t.clientX; mouse.y = t.clientY;
    sim.onPointerMove && sim.onPointerMove(mouse.x, mouse.y, true);
  }, { passive: true });
  canvas.addEventListener('touchend', () => mouse.down = false);

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space'){ paused = !paused; e.preventDefault(); }
    if (e.key === 'f' || e.key === 'F'){
      if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(()=>{});
      else document.exitFullscreen();
    }
    if (e.key === 'r' || e.key === 'R'){
      sim.reset();
    }
    if (e.key === 'n' || e.key === 'N'){
      loadSim(pickRandom(sim.constructor));
    }
  });

  window.addEventListener('resize', resize);

  function frame(){
    requestAnimationFrame(frame);
    if (paused) return;
    sim.step();
  }

  // boot: pick a random simulation each time the page loads
  resize();
  loadSim(pickRandom());
  frame();
})();
