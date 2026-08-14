/**
 * Genera easing `linear()` campionando una vera equazione di molla.
 *
 *   m x'' + c x' + k x = 0,  con x(0) = -1, x'(0) = 0
 *
 * ζ (zeta) = smorzamento normalizzato:
 *   ζ = 1   → criticamente smorzata: arriva e si ferma, MAI oltre il bersaglio
 *   ζ < 1   → sotto-smorzata: supera il bersaglio e torna (il "rimbalzo")
 *   ζ > 1   → sovra-smorzata: lenta e molle
 */

function valore(zeta, omega, t) {
  if (zeta < 1) {
    const wd = omega * Math.sqrt(1 - zeta * zeta);
    return 1 - Math.exp(-zeta * omega * t) * (Math.cos(wd * t) + ((zeta * omega) / wd) * Math.sin(wd * t));
  }
  return 1 - Math.exp(-omega * t) * (1 + omega * t);
}

function spring(zeta, omega, steps) {
  /*
    La durata si CERCA, non si stima. Nel caso critico il residuo è
    e^(-ωt)(1+ωt): il fattore lineare lo tiene alto molto più a lungo di
    quanto suggerisca la sola esponenziale, e una formula chiusa presa a
    occhio (6/ω) faceva fermare l'elemento all'1,7% dal bersaglio — cioè
    visibilmente corto.
  */
  let settle = 0;
  const dt = 0.001;
  for (let t = dt; t < 5; t += dt) {
    if (Math.abs(valore(zeta, omega, t) - 1) < 0.0005) {
      // deve restare sotto soglia, non solo toccarla passando per 1
      let stabile = true;
      for (let u = t; u < t + 0.15; u += dt) {
        if (Math.abs(valore(zeta, omega, u) - 1) >= 0.0005) { stabile = false; break; }
      }
      if (stabile) { settle = t; break; }
    }
  }

  const pts = [];
  for (let i = 0; i <= steps; i++) {
    pts.push(valore(zeta, omega, (i / steps) * settle));
  }
  // L'ultimo punto è il bersaglio per definizione: `linear()` non deve
  // lasciare l'elemento a un decimale di distanza da dove deve stare.
  pts[pts.length - 1] = 1;
  return { pts, durata: settle };
}

function toLinear(pts) {
  return "linear(" + pts.map((v, i) =>
    `${v.toFixed(4)} ${((i / (pts.length - 1)) * 100).toFixed(1)}%`
  ).join(", ") + ")";
}

const RICETTE = [
  { nome: "ferma",     zeta: 1.00, omega: 22, steps: 22 }, // nessun sorpasso
  { nome: "tattile",   zeta: 0.78, omega: 26, steps: 26 }, // ~2% di sorpasso
  { nome: "rimbalzo",  zeta: 0.50, omega: 24, steps: 30 }, // ~16% di sorpasso
];

for (const r of RICETTE) {
  const { pts, durata } = spring(r.zeta, r.omega, r.steps);
  const max = Math.max(...pts);
  console.log(`\n/* --- ${r.nome} — ζ=${r.zeta}, sorpasso ${((max - 1) * 100).toFixed(1)}%, ~${Math.round(durata * 1000)}ms --- */`);
  console.log(`--molla-${r.nome}: ${toLinear(pts)};`);
  console.log(`--molla-${r.nome}-durata: ${Math.round(durata * 1000)}ms;`);
}
