(() => {
  'use strict';

  const app = document.querySelector('#flux-app');
  if (!app) return;

  const els = {
    canvas: document.querySelector('#flux-canvas'),
    id: document.querySelector('#flux-id'),
    novelty: document.querySelector('#flux-novelty'),
    title: document.querySelector('#flux-title'),
    subtitle: document.querySelector('#flux-subtitle'),
    kicker: document.querySelector('#flux-kicker'),
    services: document.querySelector('#flux-services'),
    statement: document.querySelector('#flux-statement'),
    next: document.querySelector('#flux-next'),
    permalink: document.querySelector('#flux-permalink')
  };

  const HISTORY_KEY = 'uebey-flux-history-v1';
  const DEVICE_KEY = 'uebey-flux-device-v1';
  const MAX_HISTORY = 60;
  const CANDIDATES = 48;

  const topologies = ['left','center','right','split','vertical','frame','diagonal','columns','stacked'];
  const typeFamilies = [
    { name:'neo-grotesk', stack:'Arial, Helvetica, sans-serif', weight:[620,900], scale:[.86,1.08], track:[-.09,-.045] },
    { name:'editorial', stack:'Georgia, "Times New Roman", serif', weight:[400,700], scale:[.92,1.06], track:[-.065,-.015] },
    { name:'mono', stack:'"Courier New", Courier, monospace', weight:[500,800], scale:[.82,1.0], track:[-.055,.01] },
    { name:'condensed', stack:'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif', weight:[700,900], scale:[.62,.84], track:[-.045,.015] },
    { name:'humanist', stack:'Trebuchet MS, Arial, sans-serif', weight:[560,800], scale:[.9,1.08], track:[-.075,-.025] },
    { name:'system', stack:'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', weight:[580,880], scale:[.88,1.06], track:[-.085,-.035] },
    { name:'classic', stack:'Palatino Linotype, Book Antiqua, Palatino, serif', weight:[400,700], scale:[.9,1.08], track:[-.055,.008] }
  ];
  const geometryFamilies = ['orbits','rays','lattice','contours','constellation','arcs','blocks','threads','waves','glyphs'];
  const surfaces = ['flat','flat','paper','grid','bands'];
  const harmonies = ['complement','analogous','triad','split','mono','duo'];
  const kickerOptions = [
    'uma presença digital que nunca chega igual',
    'interfaces vivas para negócios reais',
    'a mesma marca. outra manifestação.',
    'design calculado no instante da visita',
    'um site que se recusa a repetir a si mesmo',
    'identidade fixa. experiência variável.',
    'cada acesso começa do zero',
    'serviços digitais em estado generativo'
  ];
  const statementOptions = [
    'A identidade permanece. A interface se reinventa.',
    'Você não está escolhendo um tema. Está vendo uma composição nascer.',
    'Esta tela foi selecionada por ser diferente das que vieram antes.',
    'Random gera. Regras filtram. Novidade escolhe.',
    'O próximo clique não troca a roupa da página. Ele recalcula a página.',
    'Reconheça a marca sem reconhecer a tela.',
    'Cada versão existe como um ponto único dentro de um espaço visual enorme.'
  ];

  function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function map(v, a, b, c, d) { return c + ((v-a)/(b-a))*(d-c); }
  function wrapHue(h) { return ((h % 360) + 360) % 360; }
  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function range(rng, min, max) { return lerp(min, max, rng()); }
  function int(rng, min, max) { return Math.floor(range(rng, min, max + 1)); }

  function randomSeed128() {
    const a = new Uint32Array(4);
    if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(a);
    else for (let i=0;i<4;i++) a[i] = Math.floor(Math.random() * 0xffffffff);
    return Array.from(a, n => n.toString(16).padStart(8,'0')).join('');
  }

  function normalizeSeed(raw) {
    const clean = String(raw || '').toLowerCase().replace(/[^a-f0-9]/g,'').slice(0,32);
    return clean.length === 32 ? clean : null;
  }

  function xmur3(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = h << 13 | h >>> 19;
    }
    return function() {
      h = Math.imul(h ^ h >>> 16, 2246822507);
      h = Math.imul(h ^ h >>> 13, 3266489909);
      return (h ^= h >>> 16) >>> 0;
    };
  }

  function sfc32(a,b,c,d) {
    return function() {
      a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
      let t = (a + b) | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = (c << 21 | c >>> 11);
      d = d + 1 | 0;
      t = t + d | 0;
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
    };
  }

  function rngFromSeed(seed, salt='') {
    const h = xmur3(seed + salt);
    return sfc32(h(), h(), h(), h());
  }

  function hsl(h,s,l) { return `hsl(${Math.round(wrapHue(h))} ${Math.round(s)}% ${Math.round(l)}%)`; }

  function paletteFrom(rng) {
    const mode = pick(rng, ['light','light','dark','dark','ink']);
    const harmony = pick(rng, harmonies);
    const hue = range(rng,0,360);
    const sat = range(rng,52,88);
    const lightBg = range(rng,91,98);
    const darkBg = range(rng,3.5,11);
    const isDark = mode === 'dark';
    const isInk = mode === 'ink';
    const bg = isInk ? (rng() < .5 ? '#f2efe6' : '#0a0a0a') : hsl(hue, isDark ? range(rng,7,24) : range(rng,7,20), isDark ? darkBg : lightBg);
    const fg = isDark || (isInk && bg === '#0a0a0a') ? hsl(hue + range(rng,-15,15), range(rng,4,18), range(rng,89,97)) : hsl(hue + range(rng,-15,15), range(rng,8,22), range(rng,5,13));
    let h2 = hue + 180;
    let h3 = hue + 60;
    if (harmony === 'analogous') { h2 = hue + range(rng,25,48); h3 = hue - range(rng,25,48); }
    if (harmony === 'triad') { h2 = hue + 120; h3 = hue + 240; }
    if (harmony === 'split') { h2 = hue + 150; h3 = hue + 210; }
    if (harmony === 'mono') { h2 = hue; h3 = hue; }
    if (harmony === 'duo') { h2 = hue + 180; h3 = h2; }
    const accL = isDark || (isInk && bg === '#0a0a0a') ? range(rng,54,72) : range(rng,40,58);
    const accent = hsl(h2, sat, accL);
    const accent2 = hsl(h3, clamp(sat - range(rng,0,18),40,90), clamp(accL + range(rng,-10,12),34,78));
    return { mode, harmony, hue, bg, fg, accent, accent2 };
  }

  function topologyVector(name) {
    const idx = topologies.indexOf(name);
    return topologies.map((_,i) => i === idx ? 1 : 0);
  }
  function geometryVector(name) {
    const idx = geometryFamilies.indexOf(name);
    return geometryFamilies.map((_,i) => i === idx ? 1 : 0);
  }
  function typeVector(name) {
    const idx = typeFamilies.findIndex(x => x.name === name);
    return typeFamilies.map((_,i) => i === idx ? 1 : 0);
  }

  function candidateFromSeed(seed) {
    const rng = rngFromSeed(seed, ':candidate');
    const topology = pick(rng, topologies);
    const type = pick(rng, typeFamilies);
    const geometry = pick(rng, geometryFamilies);
    const palette = paletteFrom(rng);
    const surface = pick(rng, surfaces);
    const titleWeight = Math.round(range(rng, type.weight[0], type.weight[1]));
    const titleScaleX = range(rng, type.scale[0], type.scale[1]);
    const titleTrack = range(rng, type.track[0], type.track[1]);
    const titleSize = range(rng, 11.5, 20.5);
    const subtitleSize = range(rng, 1.55, 3.9);
    const density = range(rng, .28, .92);
    const asymmetry = range(rng, 0, 1);
    const xBias = range(rng, -0.08, 0.08);
    const yBias = range(rng, -0.035, 0.035);
    const angle = range(rng, -7.5, 7.5);
    const radius = pick(rng, [0,0,0,2,6,12,24,999]);
    const stroke = pick(rng, [1,1,1,2,3]);
    const motion = range(rng, 12, 34);
    const gridSize = range(rng, 24, 78);
    const bandAngle = range(rng, 0, 180);
    const bandGap = range(rng, 22, 62);
    const panelAlpha = range(rng, .025, .095);
    const kickerIndex = int(rng,0,kickerOptions.length-1);
    const statementIndex = int(rng,0,statementOptions.length-1);

    const fp = [
      ...topologyVector(topology).map(x=>x*.9),
      ...geometryVector(geometry).map(x=>x*.75),
      ...typeVector(type.name).map(x=>x*.68),
      palette.hue/360,
      palette.mode === 'dark' ? 1 : 0,
      palette.harmony === 'mono' ? 1 : 0,
      density,
      asymmetry,
      map(titleScaleX,.6,1.1,0,1),
      map(titleTrack,-.1,.02,0,1),
      map(titleWeight,400,900,0,1),
      map(titleSize,11.5,20.5,0,1),
      Math.abs(angle)/7.5,
      radius === 999 ? 1 : radius/24,
      stroke/3,
      map(motion,12,34,0,1),
      surfaces.indexOf(surface)/(surfaces.length-1),
      kickerIndex/(kickerOptions.length-1),
      statementIndex/(statementOptions.length-1)
    ].map(v => clamp(Number(v)||0,0,1));

    return {
      seed, topology, type, geometry, palette, surface,
      titleWeight, titleScaleX, titleTrack, titleSize, subtitleSize,
      density, asymmetry, xBias, yBias, angle, radius, stroke, motion,
      gridSize, bandAngle, bandGap, panelAlpha, kickerIndex, statementIndex,
      fp
    };
  }

  function euclidean(a,b) {
    const n = Math.min(a.length,b.length);
    let sum = 0;
    for (let i=0;i<n;i++) { const d=a[i]-b[i]; sum += d*d; }
    return Math.sqrt(sum / Math.max(1,n));
  }

  function perceptualDistance(a,b) {
    const base = euclidean(a.fp,b.fp);
    const categorical = (
      (a.topology !== b.topology ? .24 : 0) +
      (a.geometry !== b.geometry ? .18 : 0) +
      (a.type.name !== b.typeName ? .16 : 0) +
      (a.palette.mode !== b.paletteMode ? .10 : 0)
    );
    return clamp(base * 1.9 + categorical, 0, 1);
  }

  function loadHistory() {
    try {
      const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      return Array.isArray(raw) ? raw.filter(x => x && Array.isArray(x.fp)).slice(0,MAX_HISTORY) : [];
    } catch { return []; }
  }

  function saveHistory(history) {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0,MAX_HISTORY))); } catch {}
  }

  function getDeviceId() {
    try {
      let id = localStorage.getItem(DEVICE_KEY);
      if (!id) { id = randomSeed128(); localStorage.setItem(DEVICE_KEY,id); }
      return id;
    } catch { return randomSeed128(); }
  }

  function noveltyAgainst(candidate, history) {
    if (!history.length) return 1;
    let min = 1;
    for (const h of history) min = Math.min(min, perceptualDistance(candidate,h));
    return min;
  }

  function signatureOf(candidate) {
    return [candidate.topology, candidate.geometry, candidate.type.name, candidate.palette.mode, candidate.surface].join('|');
  }

  function recencyPenalty(candidate, history) {
    let penalty = 0;
    const recent = history.slice(0, 8);
    recent.forEach((h, i) => {
      const decay = (8 - i) / 8;
      if (candidate.topology === h.topology) penalty += .14 * decay;
      if (candidate.geometry === h.geometry) penalty += .12 * decay;
      if (candidate.type.name === h.typeName) penalty += .08 * decay;
      if (candidate.palette.mode === h.paletteMode) penalty += .025 * decay;
      if (typeof h.paletteHue === 'number') {
        const delta = Math.abs(candidate.palette.hue - h.paletteHue);
        const hueDistance = Math.min(delta, 360 - delta);
        if (hueDistance < 24) penalty += .05 * decay * (1 - hueDistance / 24);
      }
    });
    if (history.some(h => h.signature === signatureOf(candidate))) penalty += .32;
    return penalty;
  }

  function generateNovel(history) {
    const device = getDeviceId();
    const batchEntropy = randomSeed128();
    let best = null;
    for (let i=0;i<CANDIDATES;i++) {
      const seedSource = `${device}:${batchEntropy}:${i}:${randomSeed128()}`;
      const h = xmur3(seedSource);
      const seed = [h(),h(),h(),h()].map(n=>n.toString(16).padStart(8,'0')).join('');
      const c = candidateFromSeed(seed);
      c.novelty = noveltyAgainst(c, history);
      c.penalty = recencyPenalty(c, history);
      c.score = c.novelty - c.penalty + (c.density > .42 && c.density < .86 ? .018 : 0) + (Math.abs(c.angle)<6.8 ? .008 : 0);
      if (!best || c.score > best.score) best = c;
    }
    return best;
  }

  function remember(candidate, history) {
    const compact = {
      seed: candidate.seed,
      fp: candidate.fp,
      topology: candidate.topology,
      geometry: candidate.geometry,
      typeName: candidate.type.name,
      paletteMode: candidate.palette.mode,
      paletteHue: candidate.palette.hue,
      surface: candidate.surface,
      signature: signatureOf(candidate)
    };
    const next = [compact, ...history.filter(h => h.seed !== compact.seed)].slice(0,MAX_HISTORY);
    saveHistory(next);
    return next;
  }

  function svgEl(name, attrs={}) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', name);
    for (const [k,v] of Object.entries(attrs)) el.setAttribute(k,String(v));
    return el;
  }

  function renderGeometry(c) {
    const rng = rngFromSeed(c.seed, ':geometry');
    const svg = svgEl('svg',{viewBox:'0 0 1600 1000',preserveAspectRatio:'xMidYMid slice','aria-hidden':'true'});
    const defs = svgEl('defs');
    const clip = svgEl('clipPath',{id:'clip'});
    clip.appendChild(svgEl('rect',{x:0,y:0,width:1600,height:1000}));
    defs.appendChild(clip);
    svg.appendChild(defs);
    const g = svgEl('g',{'clip-path':'url(#clip)'});
    svg.appendChild(g);
    const fg = 'var(--fg)', a='var(--accent)', b='var(--accent-2)';
    const lineOpacity = clamp(c.density*.7,.18,.72);
    const add = node => g.appendChild(node);
    const n = int(rng, 9, 26);

    if (c.geometry === 'orbits') {
      const group=svgEl('g',{class:'motion-b'}); g.appendChild(group);
      const cx=range(rng,420,1180), cy=range(rng,300,700);
      for(let i=0;i<n;i++) group.appendChild(svgEl('ellipse',{cx,cy,rx:range(rng,80,720),ry:range(rng,40,420),fill:'none',stroke:i%4===0?a:fg,'stroke-width':range(rng,.7,3.2),opacity:range(rng,.12,lineOpacity),transform:`rotate(${range(rng,-55,55)} ${cx} ${cy})`}));
    }

    if (c.geometry === 'rays') {
      const group=svgEl('g',{class:'motion-a'}); g.appendChild(group);
      const cx=range(rng,200,1400), cy=range(rng,120,880);
      const count=int(rng,18,62);
      for(let i=0;i<count;i++) {
        const ang=(Math.PI*2*i/count)+range(rng,-.03,.03), len=range(rng,400,1500);
        group.appendChild(svgEl('line',{x1:cx,y1:cy,x2:cx+Math.cos(ang)*len,y2:cy+Math.sin(ang)*len,stroke:i%7===0?a:fg,'stroke-width':range(rng,.6,2.6),opacity:range(rng,.08,lineOpacity)}));
      }
    }

    if (c.geometry === 'lattice') {
      const group=svgEl('g',{class:'motion-a'}); g.appendChild(group);
      const step=range(rng,55,135), rot=range(rng,-24,24);
      for(let x=-300;x<1900;x+=step) group.appendChild(svgEl('line',{x1:x,y1:-200,x2:x,y2:1200,stroke:fg,'stroke-width':range(rng,.6,1.7),opacity:range(rng,.08,.32)}));
      for(let y=-300;y<1300;y+=step) group.appendChild(svgEl('line',{x1:-200,y1:y,x2:1800,y2:y,stroke:fg,'stroke-width':range(rng,.6,1.7),opacity:range(rng,.08,.32)}));
      group.setAttribute('transform',`rotate(${rot} 800 500)`);
      add(svgEl('circle',{cx:range(rng,200,1400),cy:range(rng,100,900),r:range(rng,70,230),fill:a,opacity:range(rng,.45,.92)}));
    }

    if (c.geometry === 'contours') {
      const group=svgEl('g',{class:'motion-a'}); g.appendChild(group);
      const cx=range(rng,300,1300), cy=range(rng,200,800);
      for(let i=0;i<int(rng,12,34);i++) {
        const r=50+i*range(rng,18,36), pts=[];
        const count=60;
        for(let j=0;j<=count;j++) {
          const t=Math.PI*2*j/count;
          const wob=1+Math.sin(t*int(rng,2,6)+i*.23)*range(rng,.02,.14)+Math.sin(t*7+i)*.025;
          pts.push(`${j?'L':'M'} ${cx+Math.cos(t)*r*wob} ${cy+Math.sin(t)*r*wob}`);
        }
        group.appendChild(svgEl('path',{d:pts.join(' '),fill:'none',stroke:i%6===0?a:fg,'stroke-width':range(rng,.7,2),opacity:range(rng,.09,.45)}));
      }
    }

    if (c.geometry === 'constellation') {
      const points=[];
      for(let i=0;i<int(rng,18,46);i++) points.push([range(rng,40,1560),range(rng,40,960),range(rng,2,8)]);
      for(let i=0;i<points.length;i++) {
        const [x,y]=points[i];
        const nearest=points.map((p,j)=>({j,d:Math.hypot(x-p[0],y-p[1])})).filter(v=>v.j!==i).sort((m,n)=>m.d-n.d).slice(0,int(rng,1,3));
        nearest.forEach(({j,d})=>{ if(d<390) add(svgEl('line',{x1:x,y1:y,x2:points[j][0],y2:points[j][1],stroke:fg,'stroke-width':1,opacity:range(rng,.07,.22)})); });
      }
      points.forEach(([x,y,r],i)=>add(svgEl('circle',{cx:x,cy:y,r,fill:i%8===0?a:(i%11===0?b:fg),opacity:range(rng,.35,.92),class:i%5===0?'motion-c':''})));
    }

    if (c.geometry === 'arcs') {
      const group=svgEl('g',{class:'motion-b'}); g.appendChild(group);
      const cx=range(rng,380,1220),cy=range(rng,240,760);
      for(let i=0;i<int(rng,8,22);i++) {
        const r=range(rng,90,760), start=range(rng,0,Math.PI*2), span=range(rng,.3,2.5);
        const x1=cx+Math.cos(start)*r,y1=cy+Math.sin(start)*r,x2=cx+Math.cos(start+span)*r,y2=cy+Math.sin(start+span)*r;
        add(svgEl('path',{d:`M ${x1} ${y1} A ${r} ${r} 0 ${span>Math.PI?1:0} 1 ${x2} ${y2}`,fill:'none',stroke:i%5===0?a:fg,'stroke-width':range(rng,2,18),opacity:range(rng,.08,.48)}));
      }
    }

    if (c.geometry === 'blocks') {
      for(let i=0;i<int(rng,10,28);i++) {
        const w=range(rng,40,380),h=range(rng,20,260),x=range(rng,-80,1560),y=range(rng,-60,980);
        add(svgEl('rect',{x,y,width:w,height:h,rx:pick(rng,[0,0,0,8,24,90]),fill:i%5===0?a:(i%7===0?b:'none'),stroke:fg,'stroke-width':range(rng,.7,4),opacity:range(rng,.08,.55),transform:`rotate(${range(rng,-24,24)} ${x+w/2} ${y+h/2})`}));
      }
    }

    if (c.geometry === 'threads') {
      const group=svgEl('g',{class:'motion-a'}); g.appendChild(group);
      for(let i=0;i<int(rng,8,24);i++) {
        const y=range(rng,0,1000), c1x=range(rng,200,700), c2x=range(rng,900,1400), c1y=y+range(rng,-260,260), c2y=y+range(rng,-260,260);
        group.appendChild(svgEl('path',{d:`M -100 ${y} C ${c1x} ${c1y}, ${c2x} ${c2y}, 1700 ${y+range(rng,-180,180)}`,fill:'none',stroke:i%6===0?a:fg,'stroke-width':range(rng,.8,8),opacity:range(rng,.08,.42)}));
      }
    }

    if (c.geometry === 'waves') {
      const group=svgEl('g',{class:'motion-a'}); g.appendChild(group);
      for(let i=0;i<int(rng,9,24);i++) {
        const y0=range(rng,40,960),amp=range(rng,18,130),freq=range(rng,.006,.024),phase=range(rng,0,Math.PI*2),pts=[];
        for(let x=-50;x<=1650;x+=28) pts.push(`${x===-50?'M':'L'} ${x} ${y0+Math.sin(x*freq+phase)*amp}`);
        group.appendChild(svgEl('path',{d:pts.join(' '),fill:'none',stroke:i%6===0?a:fg,'stroke-width':range(rng,.7,3.4),opacity:range(rng,.08,.42)}));
      }
    }

    if (c.geometry === 'glyphs') {
      const glyphs=['+','×','○','□','/','↗','·','—'];
      for(let i=0;i<int(rng,14,42);i++) {
        const t=svgEl('text',{x:range(rng,0,1550),y:range(rng,20,980),fill:i%6===0?a:fg,'font-size':range(rng,20,180),'font-family':'Arial, sans-serif','font-weight':int(rng,300,900),opacity:range(rng,.08,.45),transform:`rotate(${range(rng,-80,80)} 800 500)`});
        t.textContent=pick(rng,glyphs); add(t);
      }
    }

    return svg;
  }

  function render(c, fixed=false) {
    const root = document.documentElement;
    root.style.setProperty('--bg', c.palette.bg);
    root.style.setProperty('--fg', c.palette.fg);
    root.style.setProperty('--accent', c.palette.accent);
    root.style.setProperty('--accent-2', c.palette.accent2);
    root.style.setProperty('--display', c.type.stack);
    root.style.setProperty('--body', c.type.name === 'mono' ? c.type.stack : 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif');
    root.style.setProperty('--title-weight', c.titleWeight);
    root.style.setProperty('--title-scale-x', c.titleScaleX.toFixed(3));
    root.style.setProperty('--title-track', `${c.titleTrack.toFixed(4)}em`);
    root.style.setProperty('--title-size', `clamp(5rem, ${c.titleSize.toFixed(2)}vw, 17rem)`);
    root.style.setProperty('--subtitle-size', `clamp(1.1rem, ${c.subtitleSize.toFixed(2)}vw, 3.8rem)`);
    root.style.setProperty('--hero-x', `${(c.xBias*100).toFixed(2)}%`);
    root.style.setProperty('--hero-y', `${(c.yBias*100).toFixed(2)}%`);
    root.style.setProperty('--title-rotate', `${c.angle.toFixed(2)}deg`);
    root.style.setProperty('--radius', `${c.radius}px`);
    root.style.setProperty('--stroke', `${c.stroke}px`);
    root.style.setProperty('--density-opacity', c.density.toFixed(3));
    root.style.setProperty('--motion-speed', `${c.motion.toFixed(2)}s`);
    root.style.setProperty('--grid-size', `${c.gridSize.toFixed(1)}px`);
    root.style.setProperty('--band-angle', `${c.bandAngle.toFixed(1)}deg`);
    root.style.setProperty('--band-gap', `${c.bandGap.toFixed(1)}px`);
    root.style.setProperty('--panel-alpha', c.panelAlpha.toFixed(3));
    root.style.setProperty('--diagonal', `${c.angle.toFixed(2)}deg`);

    app.dataset.topology = c.topology;
    app.dataset.surface = c.surface;
    app.dataset.type = c.type.name;
    app.dataset.geometry = c.geometry;
    app.dataset.palette = c.palette.mode;

    els.kicker.textContent = kickerOptions[c.kickerIndex];
    els.statement.textContent = statementOptions[c.statementIndex];
    els.subtitle.textContent = 'serviços digitais';
    els.services.textContent = 'sites · design · conteúdo · vídeo';

    els.canvas.replaceChildren(renderGeometry(c));
    els.id.textContent = `interface #${c.seed.slice(0,8)} · ${c.topology}/${c.geometry}`;
    const noveltyPct = fixed ? 'fixada' : `${Math.round(clamp(c.novelty ?? 1,0,1)*100)} / 100`;
    els.novelty.textContent = `novidade ${noveltyPct}`;
    els.permalink.href = `${location.pathname}?seed=${c.seed}`;
    els.permalink.textContent = fixed ? 'Versão fixada' : 'Fixar esta versão';

    app.classList.remove('is-entering');
    void app.offsetWidth;
    app.classList.add('is-entering');

    document.title = `UEBEY Flux #${c.seed.slice(0,8)} — serviços digitais`;
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.setAttribute('content', c.palette.bg);
  }

  let history = loadHistory();
  let current = null;

  function nextExperience() {
    current = generateNovel(history);
    render(current, false);
    history = remember(current, history);
  }

  const params = new URLSearchParams(location.search);
  const fixedSeed = normalizeSeed(params.get('seed'));
  if (fixedSeed) {
    current = candidateFromSeed(fixedSeed);
    current.novelty = noveltyAgainst(current, history);
    render(current, true);
  } else {
    nextExperience();
  }

  els.next.addEventListener('click', () => {
    if (fixedSeed) history = loadHistory();
    nextExperience();
    if (location.search) window.history.replaceState({}, '', location.pathname);
  });
})();
