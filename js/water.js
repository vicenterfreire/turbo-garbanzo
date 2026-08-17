// Água — simulação de ondas por equação de onda 2D num grid de baixa resolução
class WaterSim {
  static title = "Superfície";
  static hintExtra = "clique: joga uma pedra · arraste: cria ondas";

  constructor(ctx, w, h){
    this.ctx = ctx;
    this.resize(w, h);
    this.reset();
  }

  resize(w, h){
    this.w = w;
    this.h = h;
    this.cols = 168;
    this.rows = Math.max(40, Math.round(this.cols * (h / w)));

    this.buf = new Float32Array(this.cols * this.rows);
    this.prev = new Float32Array(this.cols * this.rows);

    this.off = document.createElement('canvas');
    this.off.width = this.cols;
    this.off.height = this.rows;
    this.offCtx = this.off.getContext('2d');
    this.imgData = this.offCtx.createImageData(this.cols, this.rows);
  }

  reset(){
    this.buf.fill(0);
    this.prev.fill(0);
    this.tick = 0;
    this.ctx.fillStyle = '#031018';
    this.ctx.fillRect(0, 0, this.w, this.h);
  }

  _idx(cx, cy){ return cy * this.cols + cx; }

  _toGrid(x, y){
    return [
      Math.max(1, Math.min(this.cols - 2, Math.round((x / this.w) * this.cols))),
      Math.max(1, Math.min(this.rows - 2, Math.round((y / this.h) * this.rows))),
    ];
  }

  _splash(x, y, strength, radius){
    const [gx, gy] = this._toGrid(x, y);
    const r = radius;
    for (let dy = -r; dy <= r; dy++){
      for (let dx = -r; dx <= r; dx++){
        const cx = gx + dx, cy = gy + dy;
        if (cx < 1 || cx >= this.cols - 1 || cy < 1 || cy >= this.rows - 1) continue;
        const dist = Math.hypot(dx, dy);
        if (dist > r) continue;
        const falloff = 1 - dist / r;
        this.buf[this._idx(cx, cy)] += strength * falloff;
      }
    }
  }

  onClick(x, y){
    this._splash(x, y, 3.2, 4);
  }

  onPointerMove(x, y, down){
    if (!down) return;
    this._splash(x, y, 1.1, 2);
  }

  step(){
    this.tick++;

    // occasional ambient raindrop so the surface never fully settles
    if (Math.random() < 0.045){
      this._splash(Math.random() * this.w, Math.random() * this.h, 1.4, 3);
    }

    this._propagate();
    this._render();
  }

  _propagate(){
    const { cols, rows, buf, prev } = this;
    const damping = 0.985;
    const next = prev; // reuse prev buffer as scratch for next state

    for (let y = 1; y < rows - 1; y++){
      const row = y * cols;
      const rowUp = row - cols;
      const rowDown = row + cols;
      for (let x = 1; x < cols - 1; x++){
        const i = row + x;
        const sum = buf[i - 1] + buf[i + 1] + buf[rowUp + x] + buf[rowDown + x];
        let v = sum / 2 - next[i];
        v *= damping;
        next[i] = v;
      }
    }

    this.prev = buf;
    this.buf = next;
  }

  _render(){
    const { cols, rows, buf } = this;
    const data = this.imgData.data;

    // deep-sea base gradient tones
    const baseR = 6, baseG = 26, baseB = 46;
    const litR = 130, litG = 220, litB = 235;

    for (let y = 0; y < rows; y++){
      for (let x = 0; x < cols; x++){
        const i = y * cols + x;
        const h = buf[i];

        // approximate surface normal via neighboring heights for a glint effect
        const hl = x > 0 ? buf[i - 1] : h;
        const hr = x < cols - 1 ? buf[i + 1] : h;
        const hu = y > 0 ? buf[i - cols] : h;
        const hd = y < rows - 1 ? buf[i + cols] : h;
        const nx = (hl - hr) * 8;
        const ny = (hu - hd) * 8;
        const light = Math.max(0, nx * 0.5 + ny * 0.5 + h * 3);

        const t = Math.min(1, light);
        const p = i * 4;
        data[p]     = baseR + (litR - baseR) * t;
        data[p + 1] = baseG + (litG - baseG) * t;
        data[p + 2] = baseB + (litB - baseB) * t;
        data[p + 3] = 255;
      }
    }

    this.offCtx.putImageData(this.imgData, 0, 0);

    this.ctx.imageSmoothingEnabled = true;
    this.ctx.drawImage(this.off, 0, 0, this.w, this.h);
  }
}

window.WaterSim = WaterSim;
