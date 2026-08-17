// Bateria — fonte de partículas pulsante inspirada no plugin "Battery" do Windows Media Player
class BatterySim {
  static title = "Bateria";
  static hintExtra = "clique: dispara uma explosão · arraste: mira o jato";

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
    this.particles = [];
    this.t = 0;
    this.direction = -Math.PI / 2; // jato para cima por padrão
    this.ctx.fillStyle = '#020204';
    this.ctx.fillRect(0, 0, this.w, this.h);
  }

  onClick(x, y){
    for (let i = 0; i < 70; i++) this._spawn(x, y, true);
  }

  onPointerMove(x, y, down){
    if (!down) return;
    const cx = this.w / 2, cy = this.h;
    this.direction = Math.atan2(y - cy, x - cx);
  }

  _spawn(x, y, burst){
    const angle = burst
      ? Math.random() * Math.PI * 2
      : this.direction + (Math.random() - 0.5) * 0.5;
    const speed = burst ? 2 + Math.random() * 6 : 4 + Math.random() * 5;
    this.particles.push({
      x: x ?? this.w / 2,
      y: y ?? this.h,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      maxLife: 60 + Math.random() * 60,
      hue: Math.random() * 360,
      size: 1.5 + Math.random() * 2.5,
    });
  }

  step(){
    const ctx = this.ctx, W = this.w, H = this.h;
    this.t += 1;

    ctx.fillStyle = 'rgba(2,2,4,0.18)';
    ctx.fillRect(0, 0, W, H);

    // simulated "beat" pulse driving spawn rate — no real audio input
    const beat = Math.pow(Math.sin(this.t * 0.05) * 0.5 + 0.5, 3);
    if (Math.random() < 0.15 + beat * 0.45){
      for (let i = 0; i < 3; i++){
        this._spawn(this.w / 2 + (Math.random() - 0.5) * 60, this.h, false);
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--){
      const p = this.particles[i];
      p.vy += 0.05; // gravidade
      p.x += p.vx;
      p.y += p.vy;
      p.life++;
      if (p.life > p.maxLife || p.y > H + 20){
        this.particles.splice(i, 1);
        continue;
      }
      const alpha = 1 - p.life / p.maxLife;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue},90%,65%,${alpha})`;
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 8;
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // cap runaway particle counts on long idle sessions
    if (this.particles.length > 1400) this.particles.splice(0, this.particles.length - 1400);
  }
}

window.BatterySim = BatterySim;
