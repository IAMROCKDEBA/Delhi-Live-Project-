/* ═══════════════════════════════════════════════════════
   Smart Seat & Luggage OS — Application Logic (app.js)
   AI-powered seat management + luggage scanner PWA
   All intelligence runs 100% client-side — zero API keys
   ═══════════════════════════════════════════════════════ */

// ─── SERVICE WORKER ───
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => { });

// ─── FLIGHT CONFIG ───
const FLIGHT = { id: 'OS-2026', layout: '737-800', rows: 30, cols: ['A', 'B', 'C', 'D', 'E', 'F'], bins: 12, boardingGroups: 5 };
const PREMIUM_ROWS = [1, 2, 3, 4, 5];
const EXIT_ROWS = [10, 20];

// ─── SEAT DATA GENERATOR ───
class SeatManager {
    constructor() {
        this.seats = [];
        this.selected = null;
        this._generate();
    }
    _generate() {
        const names = ['A. Chen', 'B. Patel', 'C. Smith', 'D. Johnson', 'E. Williams', 'F. Brown', 'G. Davis', 'H. Miller', 'I. Wilson', 'J. Moore', 'K. Taylor', 'L. Anderson', 'M. Thomas', 'N. Garcia', 'O. Martinez', 'P. Robinson', 'Q. Clark', 'R. Lewis', 'S. Lee', 'T. Walker'];
        let ni = 0;
        for (let r = 1; r <= FLIGHT.rows; r++) {
            for (const c of FLIGHT.cols) {
                const occupied = Math.random() < 0.45;
                const isPremium = PREMIUM_ROWS.includes(r);
                const isExit = EXIT_ROWS.includes(r);
                const features = [];
                if (c === 'A' || c === 'F') features.push('window');
                if (c === 'C' || c === 'D') features.push('aisle');
                if (isPremium) features.push('premium', 'extraLegroom');
                if (isExit) features.push('exitRow', 'extraLegroom');
                this.seats.push({
                    id: `${r}${c}`, row: r, col: c, status: occupied ? 'occupied' : 'available',
                    occupant: occupied ? {
                        name: names[ni++ % names.length],
                        tier: Math.random() < 0.15 ? 'gold' : Math.random() < 0.3 ? 'silver' : 'standard',
                        medicalNeeds: Math.random() < 0.05 ? 'wheelchair' : null,
                        luggageVolume: Math.round(20 + Math.random() * 40)
                    } : null,
                    features, binProximity: [Math.max(1, r - 1), Math.min(FLIGHT.bins, r + 1)]
                });
            }
        }
    }
    select(id) {
        const s = this.seats.find(s => s.id === id);
        if (!s || s.status === 'occupied') return null;
        if (this.selected) { const p = this.seats.find(x => x.id === this.selected); if (p) p.status = 'available'; }
        s.status = 'selected'; this.selected = id;
        return s;
    }
    getStats() {
        const total = this.seats.length;
        const occ = this.seats.filter(s => s.status === 'occupied' || s.status === 'selected').length;
        return { total, occupied: occ, available: total - occ, fillPct: Math.round(occ / total * 100) };
    }
}

// ─── LUGGAGE AI ───
class LuggageAI {
    constructor() {
        this.items = [
            { id: 1, label: 'Carry-on Roller', dims: { h: 22, w: 14, d: 9 }, weight: 18, material: 'hardshell', binId: '12A', confidence: 94 },
            { id: 2, label: 'Laptop Bag', dims: { h: 16, w: 12, d: 5 }, weight: 8, material: 'nylon', binId: '12A', confidence: 91 },
            { id: 3, label: 'Duffel Bag', dims: { h: 18, w: 11, d: 10 }, weight: 22, material: 'leather', binId: '12A', confidence: 88 },
        ];
        this.binCapacity = { w: 24, h: 14, d: 36 }; // inches
        this.nextId = 4;
    }
    addItem(label, dims, weight, material) {
        const item = { id: this.nextId++, label, dims, weight, material: material || 'nylon', binId: '12A', confidence: Math.floor(75 + Math.random() * 20) };
        this.items.push(item);
        return item;
    }
    getVolume(d) { return d.h * d.w * d.d; }
    getTotalVolume() { return this.items.reduce((s, i) => s + this.getVolume(i.dims), 0); }
    getBinVolume() { return this.binCapacity.w * this.binCapacity.h * this.binCapacity.d; }
    getCapacityPct() { return Math.min(100, Math.round(this.getTotalVolume() / this.getBinVolume() * 100)); }
    // First-Fit Decreasing bin packing
    optimizePacking() {
        const sorted = [...this.items].sort((a, b) => this.getVolume(b.dims) - this.getVolume(a.dims));
        const result = sorted.map((item, i) => ({
            ...item, position: { x: (i % 3) * 33, y: Math.floor(i / 3) * 50, rotation: item.dims.w > item.dims.h ? 90 : 0 },
            recommendation: i === 0 ? 'Place wheels-first against left wall' : i === 1 ? 'Slide flat on top' : 'Tuck in remaining space'
        }));
        return result;
    }
    weightStatus(w) { return w <= 15 ? 'green' : w <= 25 ? 'amber' : 'red'; }
}

// ─── PREDICTION ENGINE ───
class PredictionEngine {
    constructor() { this.history = Array.from({ length: 20 }, (_, i) => 30 + Math.sin(i * 0.5) * 15 + Math.random() * 10); }
    forecast(periods = 5) {
        const alpha = 0.3;
        let level = this.history[0];
        for (const v of this.history) level = alpha * v + (1 - alpha) * level;
        return Array.from({ length: periods }, (_, i) => Math.min(100, Math.round(level + i * 3 + Math.random() * 5)));
    }
    addDataPoint(v) { this.history.push(v); if (this.history.length > 50) this.history.shift(); }
}

// ─── CONFLICT RESOLVER ───
class ConflictResolver {
    constructor(seats) { this.seats = seats; }
    findConflicts() {
        // Simulated conflict: two passengers want same premium seat
        return {
            passengerA: { name: 'Sarah Chen', tier: 'gold', avatar: '👩‍💼', seat: '3A', reason: 'Loyalty upgrade request', medicalNeeds: null },
            passengerB: { name: 'Mark Johnson', tier: 'standard', avatar: '👨‍💻', seat: '3A', reason: 'Pre-booked window seat', medicalNeeds: null },
            compatibilityScore: 72
        };
    }
    suggestSwaps() {
        return [
            { pair: ['3A', '4A'], benefit: 'Same row class, window maintained', score: 92 },
            { pair: ['3A', '5F'], benefit: 'Upgrade to exit row window', score: 88 },
            { pair: ['3A', '2C'], benefit: 'Better legroom, aisle access', score: 78 },
        ];
    }
}

// ─── UI RENDERER ───
class UIRenderer {
    constructor() {
        this.seatMgr = new SeatManager();
        this.luggage = new LuggageAI();
        this.predict = new PredictionEngine();
        this.conflict = new ConflictResolver(this.seatMgr.seats);
        this.currentPage = 'dashboard';
        this._initNav();
        this._initParticles();
        this._initTicker();
        this._renderDashboard();
        this._renderSeatMap();
        this._renderLuggage();
        this._renderConflicts();
        this._initScanner();
        this._initButtons();
        this._initVoice();
        this._initModal();
    }

    // ── NAVIGATION ──
    _initNav() {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const page = tab.dataset.page;
                document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
                const el = document.getElementById(`page-${page}`);
                if (el) { el.classList.add('active'); el.style.animation = 'none'; el.offsetHeight; el.style.animation = ''; }
                this.currentPage = page;
            });
        });
    }

    // ── PARTICLES ──
    _initParticles() {
        const c = document.getElementById('particles');
        for (let i = 0; i < 30; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.cssText = `left:${Math.random() * 100}%;animation-delay:${Math.random() * 10}s;animation-duration:${8 + Math.random() * 8}s;width:${1 + Math.random() * 2}px;height:${1 + Math.random() * 2}px`;
            c.appendChild(p);
        }
    }

    // ── TICKER ──
    _initTicker() {
        const data = [
            `<span class="hl">✈ OS-2026</span> LAX → NRT`,
            `Gate <span class="hl">B42</span> — On Time`,
            `Boarding Group <span class="hl">3</span> Now Boarding`,
            `Weather: <span class="hl">Clear</span> 72°F`,
            `Bins 1-6: <span class="hl">82%</span> capacity`,
            `<span class="warn">⚠ Bin 12A</span> nearing capacity`,
            `Sustainability Score: <span class="hl">94/100</span> 🌿`,
            `Passengers boarded: <span class="hl">${this.seatMgr.getStats().occupied}</span>/${this.seatMgr.getStats().total}`
        ];
        document.getElementById('ticker').innerHTML = data.map(d => `<span>${d}</span>`).join('') + data.map(d => `<span>${d}</span>`).join('');
    }

    // ── DASHBOARD ──
    _renderDashboard() {
        const stats = this.seatMgr.getStats();
        const forecast = this.predict.forecast();
        const grid = document.getElementById('dashboardGrid');
        const sparkPts = this.predict.history.map((v, i) => `${i * (100 / (this.predict.history.length - 1))},${100 - v}`).join(' ');
        grid.innerHTML = `
      <div class="glass-card metric-card span-2">
        <div class="metric-label">Cabin Fill Rate</div>
        <div class="metric-value">${stats.fillPct}%</div>
        <div class="metric-sub"><span class="trend-up">▲ 12%</span> vs avg boarding velocity</div>
        <div class="sparkline"><svg viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs><linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(0,217,255,.3)"/><stop offset="100%" stop-color="rgba(0,217,255,0)"/></linearGradient></defs>
          <polyline class="area" points="${sparkPts} 100,100 0,100"/><polyline points="${sparkPts}" fill="none" stroke="var(--cyan)" stroke-width="2"/>
        </svg></div>
      </div>
      <div class="glass-card metric-card">
        <div class="metric-label">Seats Available</div>
        <div class="metric-value">${stats.available}</div>
        <div class="metric-sub">of ${stats.total} total</div>
      </div>
      <div class="glass-card metric-card">
        <div class="metric-label">Active Alerts</div>
        <div class="metric-value" style="background:linear-gradient(135deg,var(--rose),#ff6b6b);-webkit-background-clip:text;-webkit-text-fill-color:transparent">3</div>
        <div class="metric-sub"><span class="trend-down">1 urgent</span></div>
      </div>
      <div class="glass-card metric-card span-2 row-2">
        <div class="metric-label">Bin Capacity Forecast</div>
        <div style="display:flex;gap:16px;margin-top:16px;align-items:flex-end;height:120px">
          ${forecast.map((v, i) => `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px">
            <span style="font-family:var(--font-mono);font-size:11px;color:#94a3b8">${v}%</span>
            <div style="width:100%;height:${v}%;max-height:100px;background:linear-gradient(to top,${v > 80 ? 'var(--rose)' : v > 60 ? '#d97706' : 'var(--cyan)'},transparent);border-radius:6px 6px 0 0;transition:height .6s var(--smooth);min-height:8px"></div>
            <span style="font-family:var(--font-mono);font-size:10px;color:#475569">+${(i + 1) * 2}m</span>
          </div>`).join('')}
        </div>
      </div>
      <div class="glass-card metric-card">
        <div class="metric-label">AI Confidence</div>
        <div class="metric-value" style="background:linear-gradient(135deg,var(--green),#06b6d4);-webkit-background-clip:text;-webkit-text-fill-color:transparent">96%</div>
        <div class="metric-sub">Model accuracy</div>
      </div>
      <div class="glass-card metric-card">
        <div class="metric-label">Sustainability</div>
        <div class="metric-value" style="background:linear-gradient(135deg,#10b981,#34d399);-webkit-background-clip:text;-webkit-text-fill-color:transparent">A+</div>
        <div class="metric-sub">🌿 Optimal distribution</div>
      </div>
      <div class="glass-card metric-card span-2">
        <div class="metric-label">Boarding Progress</div>
        <div style="margin-top:12px">
          ${[1, 2, 3, 4, 5].map(g => {
            const pct = g <= 2 ? 100 : g === 3 ? 65 : 0;
            return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
              <span style="font-family:var(--font-mono);font-size:11px;color:#64748b;width:60px">Group ${g}</span>
              <div style="flex:1;height:6px;border-radius:3px;background:rgba(255,255,255,.08);overflow:hidden">
                <div style="height:100%;width:${pct}%;border-radius:3px;background:${pct === 100 ? 'var(--green)' : pct > 0 ? 'var(--cyan)' : 'transparent'};transition:width 1s var(--smooth)"></div>
              </div>
              <span style="font-family:var(--font-mono);font-size:11px;color:#94a3b8">${pct}%</span>
            </div>`;
        }).join('')}
        </div>
      </div>
      <div class="glass-card metric-card span-2">
        <div class="metric-label">Weight Distribution</div>
        <div style="display:flex;justify-content:space-between;margin-top:16px;gap:8px">
          ${['Fwd', 'Mid', 'Aft'].map((z, i) => {
            const w = [34, 42, 24][i];
            return `<div style="text-align:center;flex:1">
              <div style="font-family:var(--font-mono);font-size:24px;font-weight:700;color:${w > 40 ? 'var(--rose)' : 'var(--cyan)'}">${w}%</div>
              <div style="font-size:11px;color:#64748b;margin-top:4px">${z} Section</div>
            </div>`;
        }).join('<div style="width:1px;background:var(--glass-border)"></div>')}
        </div>
      </div>
    `;
    }

    // ── SEAT MAP ──
    _renderSeatMap() {
        const legend = document.getElementById('seatLegend');
        legend.innerHTML = [
            ['Available', 'var(--avail-bg)'], ['Occupied', 'var(--occupied-bg)'],
            ['Selected', 'rgba(0,217,255,.3)'], ['Premium', 'rgba(255,215,0,.2)']
        ].map(([l, c]) => `<div class="legend-item"><div class="legend-dot" style="background:${c}"></div>${l}</div>`).join('');

        const grid = document.getElementById('seatmapGrid');
        let html = '';
        for (let r = 1; r <= FLIGHT.rows; r++) {
            html += '<div class="seat-row">';
            html += `<span class="row-num">${r}</span>`;
            FLIGHT.cols.forEach((c, ci) => {
                if (ci === 3) html += '<div class="aisle"></div>';
                const seat = this.seatMgr.seats.find(s => s.row === r && s.col === c);
                const cls = [seat.status];
                if (seat.features.includes('premium')) cls.push('premium');
                html += `<button class="seat ${cls.join(' ')}" data-id="${seat.id}" aria-label="Seat ${seat.id} ${seat.status}" tabindex="0">${seat.id}</button>`;
            });
            html += '</div>';
        }
        grid.innerHTML = html;

        grid.addEventListener('click', e => {
            const btn = e.target.closest('.seat');
            if (!btn) return;
            const id = btn.dataset.id;
            const seat = this.seatMgr.select(id);
            if (!seat) return;
            // Shockwave animation
            const sw = document.createElement('div');
            sw.className = 'shockwave';
            btn.appendChild(sw);
            setTimeout(() => sw.remove(), 600);
            // Re-render seats
            grid.querySelectorAll('.seat').forEach(s => {
                const sd = this.seatMgr.seats.find(x => x.id === s.dataset.id);
                s.className = 'seat ' + sd.status + (sd.features.includes('premium') ? ' premium' : '');
            });
            // Show details
            this._showSeatDetails(seat);
            this._renderDashboard(); // update stats
            // Confetti
            this._confetti(e.clientX, e.clientY);
        });
    }

    _showSeatDetails(seat) {
        const d = document.getElementById('seatDetails');
        d.innerHTML = `
      <div class="glass-card result-card" style="max-width:400px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div>
            <div style="font-family:var(--font-head);font-size:22px;font-weight:700;color:var(--cyan)">Seat ${seat.id}</div>
            <div style="font-family:var(--font-mono);font-size:12px;color:#64748b">${seat.features.join(' • ')}</div>
          </div>
          <div style="font-size:32px">💺</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px">
          <div style="color:#64748b">Row</div><div style="font-family:var(--font-mono);color:#e2e8f0">${seat.row}</div>
          <div style="color:#64748b">Column</div><div style="font-family:var(--font-mono);color:#e2e8f0">${seat.col}</div>
          <div style="color:#64748b">Nearest Bin</div><div style="font-family:var(--font-mono);color:#e2e8f0">${seat.binProximity.join('-')}</div>
          <div style="color:#64748b">Status</div><div style="font-family:var(--font-mono);color:var(--green)">✓ Reserved</div>
        </div>
        <div style="margin-top:12px">
          <button class="btn btn-primary" style="width:100%">✈ Confirm Reservation</button>
        </div>
      </div>`;
    }

    // ── SCANNER ──
    _initScanner() {
        const startBtn = document.getElementById('startCamBtn');
        const video = document.getElementById('camVideo');
        let stream = null;
        startBtn.addEventListener('click', async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } });
                video.srcObject = stream;
                startBtn.textContent = '⏹ Stop Camera';
                startBtn.onclick = () => { stream.getTracks().forEach(t => t.stop()); video.srcObject = null; startBtn.textContent = '▶ Activate Camera'; startBtn.onclick = null; this._initScanner(); };
            } catch { this._showScanResult({ error: 'Camera access denied. Using demo mode.' }); this._demoScan(); }
        });
        document.getElementById('shutterBtn').addEventListener('click', () => this._demoScan());
    }

    _demoScan() {
        const results = document.getElementById('scanResults');
        results.innerHTML = `<div class="glass-card shimmer" style="height:120px;display:flex;align-items:center;justify-content:center;color:#64748b"><div style="text-align:center"><div style="font-size:24px;margin-bottom:8px">🔍</div>Scanning... Analyzing dimensions</div></div>`;
        setTimeout(() => {
            const dims = { h: 20 + Math.floor(Math.random() * 6), w: 12 + Math.floor(Math.random() * 5), d: 7 + Math.floor(Math.random() * 5) };
            const vol = dims.h * dims.w * dims.d;
            const weight = Math.round(vol * 0.012 + Math.random() * 5);
            const materials = ['Hardshell Polycarbonate', 'Ballistic Nylon', 'Full-grain Leather'];
            const mat = materials[Math.floor(Math.random() * materials.length)];
            const conf = 85 + Math.floor(Math.random() * 13);
            results.innerHTML = `
        <div class="glass-card result-card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
            <div style="font-family:var(--font-head);font-size:18px;font-weight:600;color:var(--cyan)">📦 Luggage Detected</div>
            <div style="font-family:var(--font-mono);font-size:12px;padding:4px 10px;border-radius:20px;background:rgba(57,255,20,.1);color:var(--green);border:1px solid rgba(57,255,20,.2)">${conf}% match</div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;text-align:center;margin-bottom:16px">
            ${[['H', dims.h], ['W', dims.w], ['D', dims.d]].map(([l, v]) => `
              <div style="padding:12px;border-radius:10px;background:rgba(0,217,255,.05);border:1px solid rgba(0,217,255,.1)">
                <div style="font-family:var(--font-mono);font-size:24px;font-weight:700;color:var(--cyan)">${v}"</div>
                <div style="font-size:11px;color:#64748b;margin-top:2px">${l === 'H' ? 'Height' : l === 'W' ? 'Width' : 'Depth'}</div>
              </div>`).join('')}
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px">
            <div style="color:#64748b">Volume</div><div style="font-family:var(--font-mono)">${vol.toLocaleString()} in³</div>
            <div style="color:#64748b">Est. Weight</div><div style="font-family:var(--font-mono)">${weight} lbs</div>
            <div style="color:#64748b">Material</div><div style="font-family:var(--font-mono)">${mat}</div>
            <div style="color:#64748b">Compliance</div><div style="font-family:var(--font-mono);color:${dims.h <= 22 && dims.w <= 14 && dims.d <= 9 ? 'var(--green)' : 'var(--rose)'}">${dims.h <= 22 && dims.w <= 14 && dims.d <= 9 ? '✓ Carry-on OK' : '✗ Gate check'}</div>
          </div>
          <div style="margin-top:16px;display:flex;gap:8px">
            <button class="btn btn-primary" style="flex:1" onclick="document.querySelector('[data-page=luggage]').click()">Add to Bin</button>
            <button class="btn btn-success" style="flex:1">Save Result</button>
          </div>
        </div>`;
        }, 1800);
    }

    _showScanResult(data) {
        const results = document.getElementById('scanResults');
        if (data.error) results.innerHTML = `<div class="glass-card" style="border-color:rgba(217,119,6,.3)"><div style="color:#d97706">⚠ ${data.error}</div></div>`;
    }

    // ── LUGGAGE ──
    _renderLuggage() {
        const list = document.getElementById('luggageList');
        const items = this.luggage.items;
        list.innerHTML = items.map(item => {
            const wc = this.luggage.weightStatus(item.weight);
            const colors = { green: '#10b981', amber: '#d97706', red: '#ef4444' };
            return `<div class="glass-card" style="margin-bottom:8px;padding:14px;display:flex;align-items:center;gap:14px">
        <div style="width:40px;height:40px;border-radius:10px;background:${item.material === 'hardshell' ? 'linear-gradient(135deg,#1e40af,#3b82f6)' : item.material === 'leather' ? 'linear-gradient(135deg,#8B4513,#A0522D)' : 'linear-gradient(135deg,#2d3748,#4a5568)'};display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">${item.material === 'hardshell' ? '🧳' : '👜'}</div>
        <div style="flex:1">
          <div style="font-family:var(--font-head);font-weight:600;font-size:14px">${item.label}</div>
          <div style="font-family:var(--font-mono);font-size:11px;color:#64748b">${item.dims.h}×${item.dims.w}×${item.dims.d}" · ${item.weight}lbs</div>
        </div>
        <div style="width:40px;height:8px;border-radius:4px;background:rgba(255,255,255,.1);overflow:hidden">
          <div style="height:100%;width:${Math.min(100, item.weight * 3)}%;background:${colors[wc]};border-radius:4px"></div>
        </div>
      </div>`;
        }).join('');

        // Update capacity
        const pct = this.luggage.getCapacityPct();
        document.getElementById('capVal').textContent = pct;
        const arc = document.getElementById('capArc');
        if (arc) arc.style.strokeDashoffset = 452 - (452 * pct / 100);

        // Bin visualization
        this._renderBinViz();
    }

    _renderBinViz() {
        const viz = document.getElementById('binViz');
        const packed = this.luggage.optimizePacking();
        const colors = { hardshell: ['#1e40af', '#3b82f6', '#60a5fa'], leather: ['#8B4513', '#A0522D', '#D2691E'], nylon: ['#2d3748', '#4a5568', '#718096'] };
        viz.innerHTML = `
      <div style="position:relative;width:320px;height:200px;border:1px solid rgba(0,217,255,.15);border-radius:8px;background:rgba(0,217,255,.02);">
        ${packed.map((item, i) => {
            const c = colors[item.material] || colors.nylon;
            const w = Math.min(100, item.dims.w * 4); const h = Math.min(80, item.dims.h * 3);
            return `<div style="position:absolute;left:${item.position.x}%;top:${item.position.y}%;width:${w}px;height:${h}px;background:linear-gradient(135deg,${c[0]},${c[1]});border:1px solid ${c[2]};border-radius:6px;display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:9px;color:rgba(255,255,255,.7);transition:all .4s var(--smooth);cursor:pointer" title="${item.label}">${item.label.split(' ')[0]}</div>`;
        }).join('')}
      </div>`;

        const advice = document.getElementById('packAdvice');
        if (packed.length > 0) {
            advice.innerHTML = `<div class="glass-card" style="padding:14px;border-color:rgba(57,255,20,.15)">
        <div style="font-family:var(--font-label);font-size:10px;letter-spacing:.2em;color:var(--green);margin-bottom:8px">AI RECOMMENDATION</div>
        <div style="font-family:var(--font-mono);font-size:12px;color:#94a3b8">"${packed[0].recommendation} for maximum space efficiency. Estimated ${100 - this.luggage.getCapacityPct()}% remaining capacity."</div>
      </div>`;
        }
    }

    // ── CONFLICTS ──
    _renderConflicts() {
        const c = this.conflict.findConflicts();
        const swaps = this.conflict.suggestSwaps();
        const area = document.getElementById('conflictArea');
        area.innerHTML = `
      <div class="glass-card profile-card">
        <div class="avatar-ring vip"><span style="font-size:36px">${c.passengerA.avatar}</span></div>
        <div class="profile-name">${c.passengerA.name}</div>
        <div class="profile-tier" style="color:gold">★ ${c.passengerA.tier.toUpperCase()}</div>
        <div style="font-family:var(--font-mono);font-size:12px;color:#94a3b8;margin-top:8px">Seat ${c.passengerA.seat}</div>
        <div style="font-size:12px;color:#64748b;margin-top:4px">${c.passengerA.reason}</div>
        <div class="compat-bar"><div class="fill" style="width:${c.compatibilityScore}%"></div></div>
        <div style="font-family:var(--font-mono);font-size:11px;color:#64748b">Compatibility: ${c.compatibilityScore}%</div>
      </div>
      <div style="text-align:center"><div class="vs-badge">VS</div></div>
      <div class="glass-card profile-card">
        <div class="avatar-ring standard"><span style="font-size:36px">${c.passengerB.avatar}</span></div>
        <div class="profile-name">${c.passengerB.name}</div>
        <div class="profile-tier">● ${c.passengerB.tier.toUpperCase()}</div>
        <div style="font-family:var(--font-mono);font-size:12px;color:#94a3b8;margin-top:8px">Seat ${c.passengerB.seat}</div>
        <div style="font-size:12px;color:#64748b;margin-top:4px">${c.passengerB.reason}</div>
        <div class="compat-bar"><div class="fill" style="width:${c.compatibilityScore}%"></div></div>
        <div style="font-family:var(--font-mono);font-size:11px;color:#64748b">Priority Score: ${c.passengerB.tier === 'gold' ? 92 : 64}%</div>
      </div>`;

        const carousel = document.getElementById('swapCarousel');
        carousel.innerHTML = swaps.map((s, i) => `
      <div class="glass-card swap-option" style="padding:16px;cursor:pointer;border-color:${i === 0 ? 'rgba(0,217,255,.2)' : 'var(--glass-border)'}">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <span style="font-family:var(--font-mono);font-size:16px;color:var(--cyan)">${s.pair[0]}</span>
          <span style="color:#64748b">⇄</span>
          <span style="font-family:var(--font-mono);font-size:16px;color:var(--cyan)">${s.pair[1]}</span>
        </div>
        <div style="font-size:12px;color:#94a3b8;margin-bottom:8px">${s.benefit}</div>
        <div style="display:flex;align-items:center;gap:6px">
          <div style="flex:1;height:4px;border-radius:2px;background:rgba(255,255,255,.08);overflow:hidden"><div style="height:100%;width:${s.score}%;background:var(--green);border-radius:2px"></div></div>
          <span style="font-family:var(--font-mono);font-size:11px;color:var(--green)">${s.score}%</span>
        </div>
      </div>`).join('');
    }

    // ── BUTTONS & INTERACTIONS ──
    _initButtons() {
        // Add luggage
        document.getElementById('addLuggageBtn')?.addEventListener('click', () => {
            const dims = { h: 18 + Math.floor(Math.random() * 6), w: 10 + Math.floor(Math.random() * 5), d: 6 + Math.floor(Math.random() * 5) };
            const mats = ['hardshell', 'nylon', 'leather'];
            this.luggage.addItem(`Bag #${this.luggage.nextId}`, dims, 10 + Math.floor(Math.random() * 15), mats[Math.floor(Math.random() * 3)]);
            this._renderLuggage();
        });
        // Optimize
        document.getElementById('optimizeBtn')?.addEventListener('click', () => {
            this._renderLuggage();
            this._confetti(window.innerWidth / 2, window.innerHeight / 2);
        });
        // Swap
        document.getElementById('initiateSwapBtn')?.addEventListener('click', () => this._showModal('Swap Initiated', 'AI is processing the optimal seat exchange. Both passengers will receive notifications.', 'success'));
        document.getElementById('incentiveBtn')?.addEventListener('click', () => this._showModal('Incentive Offered', '$50 travel credit has been offered to facilitate the seat exchange.', 'success'));
        document.getElementById('escalateBtn')?.addEventListener('click', () => this._showModal('Escalated', 'Conflict has been escalated to the cabin supervisor for manual resolution.', 'urgent'));

        // Magnetic button effect + ripple
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mousemove', e => {
                const r = btn.getBoundingClientRect();
                const x = (e.clientX - r.left - r.width / 2) * 0.15;
                const y = (e.clientY - r.top - r.height / 2) * 0.15;
                btn.style.transform = `translate(${x}px,${y}px)`;
            });
            btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
            btn.addEventListener('click', e => {
                const ripple = document.createElement('div');
                ripple.className = 'ripple';
                const r = btn.getBoundingClientRect();
                ripple.style.left = (e.clientX - r.left) + 'px';
                ripple.style.top = (e.clientY - r.top) + 'px';
                btn.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            });
        });
    }

    // ── CONFETTI ──
    _confetti(cx, cy) {
        const colors = ['#00D9FF', '#FF3864', '#39FF14', '#FFD700', '#818cf8'];
        for (let i = 0; i < 40; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.cssText = `left:${cx}px;top:${cy}px;background:${colors[i % colors.length]};border-radius:${Math.random() > .5 ? '50%' : '2px'};transform:rotate(${Math.random() * 360}deg);animation-delay:${Math.random() * .3}s;--dx:${(Math.random() - .5) * 300}px`;
            piece.style.animationName = 'confettiFall';
            piece.style.left = `${cx + (Math.random() - .5) * 200}px`;
            document.body.appendChild(piece);
            setTimeout(() => piece.remove(), 2000);
        }
    }

    // ── VOICE ──
    _initVoice() {
        const btn = document.getElementById('voiceBtn');
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) { btn.style.opacity = '.4'; return; }
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        btn.addEventListener('click', () => {
            const rec = new SR();
            rec.lang = 'en-US'; rec.interimResults = false;
            rec.onresult = e => {
                const text = e.results[0][0].transcript.toLowerCase();
                if (text.includes('seat') || text.includes('map')) document.querySelector('[data-page=seatmap]').click();
                else if (text.includes('scan')) document.querySelector('[data-page=scanner]').click();
                else if (text.includes('luggage') || text.includes('bag')) document.querySelector('[data-page=luggage]').click();
                else if (text.includes('conflict') || text.includes('swap')) document.querySelector('[data-page=conflicts]').click();
                else if (text.includes('dashboard') || text.includes('home')) document.querySelector('[data-page=dashboard]').click();
                else this._showModal('Voice Command', `Heard: "${text}". Try "show seat map", "open scanner", or "go to luggage".`, 'info');
            };
            rec.start();
            btn.style.color = 'var(--rose)';
            rec.onend = () => { btn.style.color = ''; };
        });
    }

    // ── MODAL ──
    _initModal() {
        const overlay = document.getElementById('modal');
        overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('active'); });
    }
    _showModal(title, message, type = 'info') {
        const overlay = document.getElementById('modal');
        const card = document.getElementById('modalCard');
        card.className = 'modal-card' + (type === 'urgent' ? ' urgent' : '');
        card.innerHTML = `
      <div style="font-family:var(--font-head);font-size:20px;font-weight:700;margin-bottom:12px;color:${type === 'urgent' ? 'var(--rose)' : type === 'success' ? 'var(--green)' : 'var(--cyan)'}">${title}</div>
      <div style="font-size:14px;color:#94a3b8;line-height:1.6">${message}</div>
      <button class="btn btn-primary" style="width:100%;margin-top:20px" onclick="document.getElementById('modal').classList.remove('active')">Dismiss</button>`;
        overlay.classList.add('active');
    }
}

// ─── INIT ───
document.addEventListener('DOMContentLoaded', () => new UIRenderer());
