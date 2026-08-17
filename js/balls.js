// Colisões — bolas com gravidade, atrito de parede e colisão elástica entre pares
class BallsSim {
  static title = "Colisões";
  static hintExtra = "clique: solta uma bola nova · arraste: empurra as bolas";

  static PALETTE = ['#ff6b9d', '#ffd166', '#7fe7dc', '#8b7cf6', '#5ec8ff', '#ff9f6b'];

  constructor(ctx, w, h){
    this.ctx = ctx;
    this.gravity = 0.28;
    this.restitution = 0.82;
    this.resize(w, h);
    this.reset();
  }

  resize(w, h){
    this.w = w;
    this.h = h;
  }

  reset(){
    this.balls = [];
    const count = Math.max(18, Math.min(46, Math.floor((this.w * this.h) / 45000)));
    for (let i = 0; i < count; i++) this.balls.push(this._makeBall());
    this.ctx.fillStyle = '#07060c';
    this.ctx.fillRect(0, 0, this.w, this.h);
  }

  _makeBall(x, y){
    const r = 10 + Math.random() * 18;
    return {
      x: x ?? Math.random() * this.w,
      y: y ?? Math.random() * this.h * 0.5,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 2,
      r,
      mass: r * r,
      color: BallsSim.PALETTE[Math.floor(Math.random() * BallsSim.PALETTE.length)],
    };
  }

  onClick(x, y){
    if (this.balls.length < 90) this.balls.push(this._makeBall(x, y));
  }

  onPointerMove(x, y, down){
    if (!down) return;
    for (const b of this.balls){
      const dx = b.x - x, dy = b.y - y;
      const d = Math.max(Math.hypot(dx, dy), 20);
      if (d < 140){
        const f = (1 - d / 140) * 1.6;
        b.vx += (dx / d) * f;
        b.vy += (dy / d) * f;
      }
    }
  }

  step(){
    const ctx = this.ctx, W = this.w, H = this.h;
    ctx.fillStyle = 'rgba(7,6,12,0.28)';
    ctx.fillRect(0, 0, W, H);

    for (const b of this.balls) this._integrate(b);
    this._resolveCollisions();
    for (const b of this.balls) this._draw(b);
  }

  _integrate(b){
    b.vy += this.gravity;
    b.vx *= 0.999;
    b.vy *= 0.999;
    b.x += b.vx;
    b.y += b.vy;

    if (b.x - b.r < 0){ b.x = b.r; b.vx = -b.vx * this.restitution; }
    if (b.x + b.r > this.w){ b.x = this.w - b.r; b.vx = -b.vx * this.restitution; }
    if (b.y - b.r < 0){ b.y = b.r; b.vy = -b.vy * this.restitution; }
    if (b.y + b.r > this.h){
      b.y = this.h - b.r;
      b.vy = -b.vy * this.restitution;
      b.vx *= 0.985; // floor friction
    }
  }

  _resolveCollisions(){
    const balls = this.balls;
    for (let i = 0; i < balls.length; i++){
      for (let j = i + 1; j < balls.length; j++){
        const a = balls[i], b = balls[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 0.0001;
        const minDist = a.r + b.r;
        if (dist >= minDist) continue;

        const nx = dx / dist, ny = dy / dist;
        const overlap = (minDist - dist) / 2;
        a.x -= nx * overlap; a.y -= ny * overlap;
        b.x += nx * overlap; b.y += ny * overlap;

        const rvx = b.vx - a.vx, rvy = b.vy - a.vy;
        const velAlongNormal = rvx * nx + rvy * ny;
        if (velAlongNormal > 0) continue;

        const e = this.restitution;
        const jImp = -(1 + e) * velAlongNormal / (1 / a.mass + 1 / b.mass);
        const ix = jImp * nx, iy = jImp * ny;

        a.vx -= ix / a.mass; a.vy -= iy / a.mass;
        b.vx += ix / b.mass; b.vy += iy / b.mass;
      }
    }
  }

  _draw(b){
    const ctx = this.ctx;
    const grad = ctx.createRadialGradient(
      b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.1,
      b.x, b.y, b.r
    );
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.25, b.color);
    grad.addColorStop(1, b.color);

    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.shadowColor = b.color;
    ctx.shadowBlur = 14;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

window.BallsSim = BallsSim;
