// Alquimia — mandala giratória inspirada no plugin "Alchemy" do Windows Media Player
class AlchemySim {
  static title = "Alquimia";
  static hintExtra = "clique: nova simetria e cor · arraste: gira o padrão";

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
    this.symmetry = 5 + Math.floor(Math.random() * 6); // 5 a 10 dobras
    this.t = 0;
    this.rot = 0;
    this.hue = Math.random() * 360;
    this.aFreq = 2 + Math.random() * 2;
    this.bFreq = 2 + Math.random() * 2;
    this.ctx.fillStyle = '#020103';
    this.ctx.fillRect(0, 0, this.w, this.h);
  }

  onClick(){
    this.symmetry = 4 + Math.floor(Math.random() * 9);
    this.hue = Math.random() * 360;
    this.aFreq = 2 + Math.random() * 3;
    this.bFreq = 2 + Math.random() * 3;
  }

  onPointerMove(x, y, down){
    if (!down) return;
    this.rot += (x / this.w - 0.5) * 0.06;
  }

  step(){
    const ctx = this.ctx, W = this.w, H = this.h;
    this.t += 0.02;

    // slow fade instead of hard clear — builds up the trailing pattern
    ctx.fillStyle = 'rgba(2,1,3,0.06)';
    ctx.fillRect(0, 0, W, H);

    const cx = W / 2, cy = H / 2;
    const R = Math.min(W, H) * 0.42;

    // Lissajous-style locus that slowly drifts, giving an evolving mandala
    const a = this.aFreq + Math.sin(this.t * 0.05) * 0.8;
    const b = this.bFreq + Math.cos(this.t * 0.037) * 0.8;
    const px = R * Math.sin(a * this.t * 0.6);
    const py = R * Math.sin(b * this.t * 0.6 + Math.PI / 3);

    const hue = (this.hue + this.t * 25) % 360;
    ctx.fillStyle = `hsla(${hue},90%,65%,0.85)`;
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 14;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.rot + this.t * 0.04);

    const slice = (Math.PI * 2) / this.symmetry;
    for (let s = 0; s < this.symmetry; s++){
      ctx.save();
      ctx.rotate(slice * s);
      this._dot(px, py);
      ctx.scale(1, -1); // mirror each slice for extra symmetry
      this._dot(px, py);
      ctx.restore();
    }
    ctx.restore();
    ctx.shadowBlur = 0;
  }

  _dot(x, y){
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.arc(x, y, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

window.AlchemySim = AlchemySim;
