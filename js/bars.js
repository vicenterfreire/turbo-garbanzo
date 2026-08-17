// Barras e Onda — equalizador clássico estilo Windows Media Player
class BarsWaveSim {
  static title = "Barras e Onda";
  static hintExtra = "clique: muda a paleta de cor · arraste: distorce a onda";

  constructor(ctx, w, h){
    this.ctx = ctx;
    this.resize(w, h);
    this.reset();
  }

  resize(w, h){
    this.w = w;
    this.h = h;
    this.bars = Math.max(32, Math.min(96, Math.round(w / 14)));
  }

  reset(){
    this.hueOffset = Math.random() * 360;
    this.seed = Math.random() * 1000;
    this.t = 0;
    this.warp = 0;
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.w, this.h);
  }

  onClick(){
    this.hueOffset = Math.random() * 360;
    this.seed = Math.random() * 1000;
  }

  onPointerMove(x, y, down){
    if (!down) return;
    this.warp = (x / this.w - 0.5) * 2; // -1..1
  }

  // simulated spectrum band (no real audio input — driven by layered sine waves)
  _band(i, t){
    const f1 = Math.sin(t * 0.9 + i * 0.3) * 0.5 + 0.5;
    const f2 = Math.sin(t * 0.37 + i * 0.7 + this.seed) * 0.5 + 0.5;
    const f3 = Math.sin(t * 1.7 + i * 0.13 - this.seed * 0.5) * 0.5 + 0.5;
    return Math.pow(f1 * 0.5 + f2 * 0.35 + f3 * 0.15, 1.6);
  }

  step(){
    const ctx = this.ctx, W = this.w, H = this.h;
    this.t += 0.035;

    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(0, 0, W, H);

    const n = this.bars;
    const bw = W / n;

    for (let i = 0; i < n; i++){
      const v = this._band(i, this.t);
      const barH = v * H * 0.5;
      const hue = (this.hueOffset + (i * 360) / n + this.t * 22) % 360;
      ctx.fillStyle = `hsl(${hue},85%,60%)`;
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 10;
      ctx.fillRect(i * bw + 1, H / 2 - barH, bw - 2, barH * 2);
    }
    ctx.shadowBlur = 0;

    // oscilloscope-style waveform on top
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 2;
    const step = Math.max(1, Math.floor(W / 240));
    for (let x = 0; x <= W; x += step){
      const p = x / W;
      const band = this._band(Math.floor(p * n), this.t);
      const y = H * 0.16
        + Math.sin(p * 18 + this.t * 3 + this.warp * 4) * 22 * band
        + Math.sin(p * 4 + this.t + this.warp * 2) * 10;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

window.BarsWaveSim = BarsWaveSim;
