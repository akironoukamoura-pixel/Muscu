'use strict';
/* ================= ÉTAT & SAUVEGARDE (localStorage) ================= */
const KEY = 'muscu_v1';
let S = { done:{}, rec:{}, tgt:{}, bonus:0, badges:{}, seq:0, maxStreak:0 };
try { Object.assign(S, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
const $ = s => document.querySelector(s);

/* ================= PROGRAMME (modifie ici les exercices) ================= */
// x(id, nom, séries, objectif, repos(s), type 'r'=reps / 't'=secondes, pose, consigne, record)
const x = (id,n,s,r,rest,t,p,tip,rec) => ({id,n,s,r,rest,t,p,tip,rec});
const E = {
  pompes: x('pompes','Pompes',4,12,60,'r','push','Corps gainé, poitrine au sol, poussée franche.','pompes'),
  pexp:   x('pexp','Pompes explosives',3,6,75,'r','push','Pousse fort : les mains décollent du sol.'),
  dips:   x('dips','Dips sur chaise',3,10,60,'r','push','Descends à 90°, remonte fort.','dips'),
  tract:  x('tract','Tractions',4,5,90,'r','pull','Menton au-dessus de la barre, descente contrôlée.','tractions'),
  rows:   x('rows','Rows inversés',4,10,60,'r','pull','Sous une table solide, tire la poitrine vers elle.'),
  super:  x('super','Supermans',3,15,45,'r','core','Ventre au sol, lève bras et jambes, serre le dos.'),
  squat:  x('squat','Squats sautés',4,12,60,'r','jump','Descends bas, saute le plus haut possible.','squat'),
  fentes: x('fentes','Fentes',3,12,60,'r','squat','Genou arrière près du sol, buste droit.'),
  banc:   x('banc','Montées sur banc',3,10,60,'r','squat','Monte avec une jambe, pousse dans le talon.'),
  burpee: x('burpee','Burpees',3,10,60,'r','jump','Pompe, saut, enchaîne sans pause.'),
  jambes: x('jambes','Relevés de jambes',3,15,45,'r','core','Lombaires plaquées au sol, jambes tendues.'),
  crunch: x('crunch','Crunchs',3,20,30,'r','core','Enroule le haut du dos, souffle en montant.'),
  bike:   x('bike','Crunchs vélo',3,30,30,'r','core','Coude vers genou opposé, sans à-coup.'),
  mont:   x('mont','Mountain climbers',3,30,45,'r','plank','Genoux vers la poitrine, rythme rapide.'),
  gaine:  x('gaine','Gainage (planche)',3,30,45,'t','plank','Corps aligné, ventre serré, respire.','gainage'),
  gaine2: x('gaine2','Gainage (planche)',3,45,45,'t','plank','Corps aligné, ventre serré, respire.','gainage')
};
const ORDER = ['A','B','C','D','E'];
const DAYS = {
  A: { n:'Pousser',          e:[E.pompes,E.pexp,E.dips,E.jambes,E.gaine] },
  B: { n:'Tirer',            e:[E.tract,E.rows,E.super,E.jambes,E.bike] },
  C: { n:'Jambes explosives',e:[E.squat,E.fentes,E.banc,E.crunch,E.gaine] },
  D: { n:'Full body + abdos',e:[E.burpee,E.pompes,E.tract,E.jambes,E.gaine2] },
  E: { n:'Abdos et gainage', e:[E.crunch,E.jambes,E.gaine2,E.bike,E.mont] }
};
const tgt = e => S.tgt[e.id] || e.r;           // objectif actuel (progression auto)
const unit = e => e.t === 't' ? ' s' : '';

/* ================= TROPHÉES ================= */
const BG = [];
[['tractions','Tractions',[1,5,10,15,20],'🧗'],['pompes','Pompes',[10,25,50,75,100],'💪'],
 ['dips','Dips',[10,20,30],'🪑'],['gainage','Gainage',[60,120,180],'🧱'],
 ['squat','Squats sautés',[20,40,60],'🦵']].forEach(([k,l,vals,i]) => vals.forEach(v =>
  BG.push({ id:k+v, i, t: k==='gainage' ? `${l} ${v/60} min` : `${l} × ${v}`,
            d: k==='gainage' ? 'tenu sans pause' : "d'affilée", ok:() => (S.rec[k]||0) >= v })));
[3,7,30,100].forEach(v => BG.push({ id:'s'+v, i:'🔥', t:`${v} jours`, d:'de série', ok:() => S.maxStreak >= v }));
BG.push({ id:'expl', i:'⚡', t:'Explosif', d:'10 bonus faits', ok:() => S.bonus >= 10 });

function check() {                              // débloque les nouveaux badges
  const n = BG.filter(b => !S.badges[b.id] && b.ok());
  n.forEach(b => S.badges[b.id] = 1); save();
  n.forEach((b,i) => setTimeout(() => toast('🏆 ' + b.t), i * 2300));
  return n;
}
function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 2000); }

/* ================= OUTILS ================= */
const pad = n => String(n).padStart(2,'0');
const ds = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
function streak() {
  const d = new Date(); let n = 0;
  if (!S.done[ds(d)]) d.setDate(d.getDate() - 1);
  while (S.done[ds(d)]) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
const QUOTES = ['La discipline bat la motivation.','Un pas de plus. Une rep de plus.','Le corps réussit ce que l\'esprit croit.',
 'Fort aujourd\'hui, plus fort demain.','Ne compte pas les jours, fais-les compter.','La constance fait les champions.',
 'Chaque rep te rapproche de ta meilleure version.','Pas d\'excuses, juste du travail.','Sois explosif. Reste patient.',
 'Le confort ne construit rien.','Tu n\'as pas à être parfait, juste présent.','Sueur aujourd\'hui, fierté ce soir.',
 'Ce que tu fais chaque jour compte plus que ce que tu fais parfois.','Bats l\'homme que tu étais hier.'];
const quote = () => QUOTES[Math.floor(new Date() / 864e5) % QUOTES.length];
const buzz = () => { try { navigator.vibrate && navigator.vibrate(200); } catch (e) {} };

// Illustrations SVG minimalistes (bonhomme filaire) : [tête x, tête y, tracé]
const POSES = {
  push:  [84,25,'M12 46L76 30M76 30L78 48M12 46L6 50'],
  pull:  [50,18,'M15 5H85M42 5L48 26M58 5L52 26M50 26V46M50 46L44 58M50 46L56 58'],
  squat: [48,12,'M48 18L44 34L62 38L58 56M48 22L68 26'],
  plank: [86,28,'M20 42L80 32M80 32V46M20 42L12 48'],
  core:  [10,44,'M16 48H58L74 28M58 48L80 40'],
  jump:  [50,10,'M50 16V36L38 56M50 36L62 56M50 20L34 6M50 20L66 6']
};
const svg = p => { const [a,b,d] = POSES[p]; return `<svg viewBox="0 0 100 62"><circle cx="${a}" cy="${b}" r="6"/><path d="${d}"/></svg>`; };

/* ================= NAVIGATION ================= */
let view = 'home', W = null, B = null, tm = null, hm = 0;
const stop = () => clearInterval(tm);
function go(v) { stop(); view = v; draw(); }
function count(sec, end) {                      // compte à rebours
  let t = sec;
  tm = setInterval(() => {
    t--; const el = $('#t'); if (el) el.textContent = t;
    if (t <= 0) { stop(); buzz(); end(); }
  }, 1000);
}
function draw() {
  $('#nav').style.display = ['home','hist','troph'].includes(view) ? 'flex' : 'none';
  document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('on', b.dataset.v === view));
  $('#app').innerHTML = ({ home, hist, troph, work, rest, bonus, fin })[view]();
  $('#app').scrollTop = 0;
  if (view === 'rest') count(W.r, () => go('work'));
}
document.querySelectorAll('#nav button').forEach(b => b.onclick = () => go(b.dataset.v));

/* ================= ÉCRANS ================= */
function home() {
  const k = ORDER[S.seq % 5], D = DAYS[k], fait = !!S.done[ds(new Date())];
  return `<header><div><small>Niveau ${Math.floor(S.seq/5)+1}</small><h1>Muscu</h1></div>
    <div class="st">🔥 <b>${streak()}</b><small>jours de suite</small></div></header>
    <p class="quote">« ${quote()} »</p>
    <section class="card"><small>${fait ? 'Prochaine séance' : 'Séance du jour'} (jour ${k})</small><h2>${D.n}</h2>
    <ul>${D.e.map(e => `<li>${e.n}<span>${e.s} × ${tgt(e)}${unit(e)}</span></li>`).join('')}</ul></section>
    <button class="big" onclick="start()">${fait ? 'Refaire une séance' : 'Commencer'}</button>
    <button class="ghost" onclick="startBonus()">⚡ Brûler le réservoir (facultatif)</button>`;
}
function start() { W = { k:ORDER[S.seq % 5], i:0, s:0, v:null, miss:false, up:[], r:0 }; go('work'); }
const cur = () => DAYS[W.k].e[W.i];

function work() {
  const D = DAYS[W.k], e = cur(), g = tgt(e); if (W.v == null) W.v = g;
  return `<small>${D.n} · exercice ${W.i+1}/${D.e.length}</small>
    <div class="bar"><i style="width:${W.i / D.e.length * 100}%"></i></div>
    <div class="fig">${svg(e.p)}</div><h2>${e.n}</h2><p class="tip">${e.tip}</p>
    <p class="set">Série ${W.s+1}/${e.s} · objectif ${g}${unit(e)}</p>
    <div class="step"><button onclick="adj(-1)">−</button><b>${W.v}</b><button onclick="adj(1)">+</button></div>
    <button class="big" onclick="setDone()">Série faite</button>`;
}
function adj(d) { W.v = Math.max(0, W.v + d * (cur().t === 't' ? 5 : 1)); draw(); }
function setDone() {
  const e = cur(), g = tgt(e);
  if (e.rec && W.v > (S.rec[e.rec] || 0)) S.rec[e.rec] = W.v;   // record d'une série
  if (W.v < g) W.miss = true;
  W.v = null;
  if (++W.s >= e.s) {                                            // exercice terminé
    if (!W.miss) { S.tgt[e.id] = g + (e.t === 't' ? 5 : 1); W.up.push(`${e.n} → ${S.tgt[e.id]}${unit(e)}`); }
    W.miss = false; W.s = 0; W.i++;
    if (W.i >= DAYS[W.k].e.length) return finish();
  }
  save(); W.r = e.rest; go('rest');
}
function rest() {
  return `<div class="center"><small>Repos</small><div class="timer" id="t">${W.r}</div>
    <p>Ensuite : ${cur().n}</p><button class="big" onclick="go('work')">Passer</button></div>`;
}
function finish() {
  S.done[ds(new Date())] = W.k; S.seq++;
  S.maxStreak = Math.max(S.maxStreak, streak()); save(); check(); go('fin');
}
function fin() {
  return `<div class="center"><div style="font-size:72px">💪</div><h1>Séance terminée</h1>
    ${W.up.length ? `<p class="tip">Objectifs relevés :<br>${W.up.join('<br>')}</p>` : '<p class="tip">Bien joué. Vise plus haut la prochaine fois.</p>'}
    <button class="big" onclick="startBonus()">⚡ Bonus : brûler le réservoir</button>
    <button class="ghost" onclick="go('home')">Terminer</button></div>`;
}

/* Bonus : 10 s à fond, 4 à 8 rounds */
function startBonus() { B = { r:0, run:false }; go('bonus'); }
function bonus() {
  return `<div class="center"><small>Brûler le réservoir</small>
    <p>10 s à fond : assault bike<br><small>(ou sprint sur place / burpees)</small></p>
    <div class="timer" id="t">${B.run ? 10 : B.r + '/8'}</div><p>${B.r} round(s) fait(s) · vise 4 à 8</p>
    ${B.run ? '' : `<button class="big" onclick="go10()">${B.r ? 'Encore 10 s' : 'GO !'}</button>`}
    <button class="ghost" onclick="endBonus()">${B.r >= 4 ? 'Terminer' : 'Passer'}</button></div>`;
}
function go10() { B.run = true; draw(); count(10, () => { B.r++; B.run = false; B.r >= 8 ? endBonus() : draw(); }); }
function endBonus() { if (B.r >= 4) { S.bonus++; save(); check(); } go('home'); }

function hist() {
  const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + hm);
  const y = d.getFullYear(), m = d.getMonth(), off = (d.getDay() + 6) % 7, nd = new Date(y, m + 1, 0).getDate();
  let c = '<i></i>'.repeat(off);
  for (let i = 1; i <= nd; i++) { const k = ds(new Date(y, m, i)); c += `<i class="${S.done[k] ? 'ok' : ''}">${S.done[k] || i}</i>`; }
  return `<header><h1>Historique</h1></header>
    <div class="mon"><button onclick="hm--;draw()">‹</button><b>${d.toLocaleDateString('fr-FR',{month:'long',year:'numeric'})}</b><button onclick="hm++;draw()">›</button></div>
    <div class="cal">${'LMMJVSD'.split('').map(l => `<span>${l}</span>`).join('')}${c}</div>
    <p class="tip">${S.seq} séances · meilleure série : ${S.maxStreak} jours</p>`;
}
function troph() {
  const n = BG.filter(b => S.badges[b.id]).length;
  return `<header><h1>Trophées</h1><small>${n}/${BG.length}</small></header><div class="grid">
    ${BG.map(b => `<div class="bd ${S.badges[b.id] ? 'on' : ''}"><span>${S.badges[b.id] ? b.i : '🔒'}</span><b>${b.t}</b><small>${b.d}</small></div>`).join('')}</div>`;
}

draw();
