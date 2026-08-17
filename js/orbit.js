// Deriva Orbital — partículas orbitando poços gravitacionais
class OrbitSim {
  static title = "Deriva Orbital";
  static hintExtra = "clique: cria um poço gravitacional · arraste: empurra as partículas";

  static PALETTE = ['#7fe7dc', '#ff6b9d', '#ffd166', '#8b7cf6', '#5ec8ff'];

  constructor(ctx, w, h){
    this.ctx = ctx;
    this.resize(w, h);
    this.reset();
  }

  resize(w, h){
    this.w = w;
    this.h = h;
  }

  reset(){
    const cx = this.w / 2, cy = this.h / 2;
    this.wells = [
      this._makeWell(cx - this.w * 0.18, cy, 2400, OrbitSim.PALETTE[0], true),
      this._makeWell(cx + this.w * 0.18, cy, 2400, OrbitSim.PALETTE[1], true),
    ];

    const count = Math.min(420, Math.floor((this.w * this.h) / 2600));
    this.particles = [];
    for (let i = 0; i < count; i++) this.particles.push(this._makeParticle());

    this.ctx.fillStyle = '#05060a';
    this.ctx.fillRect(0, 0, this.w, this.h);
  }

  _makeWell(x, y, mass, color, permanent){
    return {
      x, y, mass, color,
      age: 0,
      life: permanent ? Infinity : 900 + Math.random() * 600,
      pulsePhase: Math.random() * Math.PI * 2,
    };
  }

  _makeParticle(){
    const angle = Math.random() * Math.PI * 2;
    const r = 60 + Math.random() * Math.min(this.w, this.h) * 0.35;
    const speed = 0.6 + Math.random() * 1.2;
    return {
      x: this.w / 2 + Math.cos(angle) * r,
      y: this.h / 2 + Math.sin(angle) * r,
      vx: -Math.sin(angle) * speed,
      vy: Math.cos(angle) * speed,
      color: OrbitSim.PALETTE[Math.floor(Math.random() * OrbitSim.PALETTE.length)],
      size: 0.8 + Math.random() * 1.6,
      trail: [],
      maxTrail: 6,
    };
  }

  onClick(x, y){
    const color = OrbitSim.PALETTE[Math.floor(Math.random() * OrbitSim.PALETTE.length)];
    this.wells.push(this._makeWell(x, y, 1800, color, false));
  }

  onPointerMove(x, y, down){
    if (!down) return;
    for (const p of this.particles){
      const dx = p.x - x, dy = p.y - y;
      const d = Math.max(Math.hypot(dx, dy), 20);
      if (d < 160){
        const f = (1 - d / 160) * 2.2;
        p.vx += (dx / d) * f;
        p.vy += (dy / d) * f;
      }
    }
  }

  step(){
    const ctx = this.ctx, W = this.w, H = this.h;

    ctx.fillStyle = 'rgba(5,6,10,0.16)';
    ctx.fillRect(0, 0, W, H);

    for (const w of this.wells) w.age++;
    this.wells = this.wells.filter(w => w.age < w.life);

    for (const w of this.wells){
      const s = this._strength(w);
      if (s <= 0) continue;
      const pulse = 0.85 + 0.15 * Math.sin(performance.now() / 600 + w.pulsePhase);
      const r = 3 + s * 6 * pulse;

      const grad = ctx.createRadialGradient(w.x, w.y, 0, w.x, w.y, r * 10);
      grad.addColorStop(0, w.color + 'aa');
      grad.addColorStop(1, w.color + '00');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(w.x, w.y, r * 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(w.x, w.y, r, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    for (const p of this.particles){
      this._updateParticle(p);
      this._drawParticle(p);
    }
  }

  _strength(w){
    if (w.life === Infinity) return w.mass;
    const fadeIn = Math.min(w.age / 60, 1);
    const fadeOut = Math.max(0, Math.min((w.life - w.age) / 120, 1));
    return w.mass * fadeIn * fadeOut;
  }

  _updateParticle(p){
    let ax = 0, ay = 0;
    for (const w of this.wells){
      const dx = w.x - p.x, dy = w.y - p.y;
      const dist = Math.hypot(dx, dy) || 1;
      const d = Math.max(dist, 24);
      const force = this._strength(w) / (d * d);
      ax += (dx / dist) * force;
      ay += (dy / dist) * force;
    }
    p.vx += ax * 0.06;
    p.vy += ay * 0.06;

    const speed = Math.hypot(p.vx, p.vy);
    const maxSpeed = 6;
    if (speed > maxSpeed){
      p.vx = (p.vx / speed) * maxSpeed;
      p.vy = (p.vy / speed) * maxSpeed;
    }

    p.x += p.vx;
    p.y += p.vy;

    p.trail.push({ x: p.x, y: p.y });
    if (p.trail.length > p.maxTrail) p.trail.shift();

    const margin = 40;
    if (p.x < -margin) { p.x = this.w + margin; p.trail = []; }
    if (p.x > this.w + margin) { p.x = -margin; p.trail = []; }
    if (p.y < -margin) { p.y = this.h + margin; p.trail = []; }
    if (p.y > this.h + margin) { p.y = -margin; p.trail = []; }

    if (Math.random() < 0.0006) Object.assign(p, this._makeParticle());
  }

  _drawParticle(p){
    const ctx = this.ctx;
    ctx.beginPath();
    for (let i = 0; i < p.trail.length; i++){
      const t = p.trail[i];
      if (i === 0) ctx.moveTo(t.x, t.y); else ctx.lineTo(t.x, t.y);
    }
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = p.color;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = p.size;
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

window.OrbitSim = OrbitSim;
