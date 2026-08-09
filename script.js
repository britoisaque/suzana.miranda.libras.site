/* ==========================================================================
   Painel do Curso — script.js
   Toda a lógica das 7 abas, usando Firebase Firestore como banco de dados.
   ========================================================================== */

/* ---------------------------------------------------------------------- */
/* 0. Inicialização do Firebase                                           */
/* ---------------------------------------------------------------------- */

let db = null;
let FIREBASE_OK = false;

try{
  if (typeof firebaseConfig === "undefined") {
    throw new Error("firebase-config.js não foi carregado antes do script.js");
  }
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes("SUA_API_KEY")) {
    throw new Error("firebase-config.js ainda está com os valores de exemplo");
  }
  if (!firebase.apps || !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  db = firebase.firestore();
  FIREBASE_OK = true;
}catch(err){
  console.error("Firebase não inicializado:", err.message);
}

const FieldValue = () => firebase.firestore.FieldValue;

/* ---------------------------------------------------------------------- */
/* 1. Helpers gerais                                                      */
/* ---------------------------------------------------------------------- */

const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

function esc(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function currentMonthValue() {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
}

function fmtDateBR(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/* Ícones (SVG inline, sem dependências externas) --------------------------- */

const ICONS = {
  hand: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2.5a1 1 0 0 0-2 0v8.7L9.2 9.1a1.1 1.1 0 1 0-1.6 1.5l3.2 3.6a1 1 0 0 0 .2.17V16H8a1 1 0 1 0 0 2h8.5a3.5 3.5 0 0 0 3.5-3.5V10a1 1 0 1 0-2 0v2H17V8.2a1 1 0 1 0-2 0V10h-.6V6a1 1 0 1 0-2 0v5.4H13V2.5Z"/></svg>`,
  copy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M4 16V5a1 1 0 0 1 1-1h11" stroke-linecap="round"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4h6v3m-8 0 1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13"/></svg>`,
  info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01" stroke-linecap="round"/></svg>`,
  film: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 5v14M16 5v14M3 10h5M16 10h5M3 15h5M16 15h5"/></svg>`,
  book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z"/><path d="M4 18a2.5 2.5 0 0 1 2.5-2.5H20"/></svg>`,
  file: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3h8l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M14 3v5h5"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2" stroke-linecap="round"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>`,
  users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="8" r="3.2"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16.5 6a3.2 3.2 0 0 1 0 6.3M21.5 20a6 6 0 0 0-5-6"/></svg>`,
  cart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/><path d="M2.5 3h2l2.4 12.2a2 2 0 0 0 2 1.6h7.4a2 2 0 0 0 2-1.6L20.5 7H6"/></svg>`,
  mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 6.5 8 6 8-6"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6.5 3h3l1.5 5-2.3 1.6a12 12 0 0 0 5.7 5.7L16 13l5 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.5 5.2 2 2 0 0 1 6.5 3Z"/></svg>`,
  graduation: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m2 8 10-4 10 4-10 4-10-4Z"/><path d="M6 10.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-5.5M22 8v6" stroke-linecap="round"/></svg>`,
  pencil: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 9-8 9 8"/><path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10"/></svg>`,
};

/* Módulos do curso (usados nos vídeos, presença e na base de alunos) -------
   Agora os módulos são cadastrados e editados na aba "Painel de Módulos"
   e ficam guardados no Firestore (coleção "modulos"). Na primeira vez que
   o site roda, semeamos os 5 módulos padrão automaticamente. */

function gerarAulasPadrao(qtd) {
  return Array.from({ length: qtd }, (_, i) => ({ numero: i + 1, nome: `Aula ${i + 1}` }));
}

const MODULOS_SEED = [
  { id: "basico",          nome: "Básico",           ordem: 1, duracaoSemanas: 10, aulas: gerarAulasPadrao(10) },
  { id: "intermediario",   nome: "Intermediário",    ordem: 2, duracaoSemanas: 12, aulas: gerarAulasPadrao(12) },
  { id: "avancado",        nome: "Avançado",         ordem: 3, duracaoSemanas: 14, aulas: gerarAulasPadrao(14) },
  { id: "contextoCristao", nome: "Contexto Cristão", ordem: 4, duracaoSemanas: 8,  aulas: gerarAulasPadrao(8)  },
  { id: "louvores",        nome: "Louvores",         ordem: 5, duracaoSemanas: 8,  aulas: gerarAulasPadrao(8)  },
];

let MODULOS_CACHE = [];
const MODULOS_LISTENERS = [];
let _modulosListenerIniciado = false;

function subscribeModulos(callback) {
  MODULOS_LISTENERS.push(callback);
  if (MODULOS_CACHE.length) callback(MODULOS_CACHE);
  iniciarListenerModulos();
}

function iniciarListenerModulos() {
  if (_modulosListenerIniciado || !FIREBASE_OK) return;
  _modulosListenerIniciado = true;
  db.collection("modulos").orderBy("ordem", "asc").onSnapshot((snap) => {
    if (snap.empty) {
      const batch = db.batch();
      MODULOS_SEED.forEach((m) => {
        const { id, ...dados } = m;
        batch.set(db.collection("modulos").doc(id), dados);
      });
      batch.commit().catch((err) => console.error(err));
      return;
    }
    MODULOS_CACHE = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    MODULOS_LISTENERS.forEach(cb => cb(MODULOS_CACHE));
  }, (err) => console.error(err));
}

function modulosNomes() {
  return MODULOS_CACHE.map(m => m.nome);
}

function moduloPorNome(nome) {
  return MODULOS_CACHE.find(m => m.nome === nome) || null;
}

function calcularDataFim(dataInicioISO, duracaoSemanas) {
  if (!dataInicioISO || !duracaoSemanas) return "";
  const d = new Date(dataInicioISO + "T00:00:00");
  d.setDate(d.getDate() + Math.round(Number(duracaoSemanas) * 7));
  return d.toISOString().slice(0, 10);
}

/* Toast --------------------------------------------------------------------- */

function toast(msg) {
  let el = $("#toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    document.body.appendChild(el);
  }
  el.innerHTML = `${ICONS.check}<span>${esc(msg)}</span>`;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 2200);
}

/* Copiar para a área de transferência --------------------------------------- */

function copyText(text, msg = "Copiado!") {
  if (!text) { toast("Nada para copiar"); return; }
  const done = () => toast(msg);
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
  } else {
    fallbackCopy(text, done);
  }
}

function fallbackCopy(text, done) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand("copy"); done(); }
  catch { toast("Não foi possível copiar"); }
  document.body.removeChild(ta);
}

/* ---------------------------------------------------------------------- */
/* 2. Navegação lateral                                                    */
/* ---------------------------------------------------------------------- */

const NAV_ITEMS = [
  { href: "index.html",      label: "Início",              icon: "home" },
  { href: "videos.html",     label: "Vídeos",              icon: "film" },
  { href: "apoio.html",      label: "Material de Apoio",   icon: "book" },
  { href: "doc.html",        label: "Documentos",          icon: "file" },
  { href: "presenca.html",   label: "Presença e Reposição",icon: "clock" },
  { href: "modulos.html",    label: "Painel de Módulos",   icon: "graduation" },
  { href: "cronograma.html", label: "Cronograma de Aulas", icon: "calendar" },
  { href: "alunos.html",     label: "Base de Alunos",      icon: "users" },
  { href: "hot.html",        label: "Links Hotmart",       icon: "cart" },
];

function injectNav() {
  const root = $("#nav-root");
  if (!root) return;
  const current = location.pathname.split("/").pop() || "videos.html";

  root.innerHTML = `
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark"></div>
        <div class="brand-text">
          <strong>Painel do Curso</strong>
          <span>Libras · Uso pessoal</span>
        </div>
      </div>
      <ul class="nav-list">
        ${NAV_ITEMS.map(it => `
          <li>
            <a class="nav-link ${it.href === current ? "active" : ""}" href="${it.href}">
              <span class="ic">${ICONS[it.icon]}</span> ${it.label}
            </a>
          </li>`).join("")}
      </ul>
      <div class="sidebar-foot" id="sync-status">
        ${FIREBASE_OK ? "🟡 Conectando ao Firebase…" : "🔴 Firebase não configurado — edite firebase-config.js"}
      </div>
    </aside>`;

  if (FIREBASE_OK && db) {
    db.collection("_ping").limit(1).get()
      .then(() => { const s = $("#sync-status"); if (s) s.textContent = "🟢 Sincronizado com o Firebase"; })
      .catch((e) => { const s = $("#sync-status"); if (s) s.textContent = "🔴 Erro de conexão — veja o console (F12)"; console.error(e); });
  }
}

/* ---------------------------------------------------------------------- */
/* 3. Símbolos de Libras flutuantes (decoração)                            */
/* ---------------------------------------------------------------------- */

function renderLibrasField() {
  if ($("#libras-field")) return;
  const field = document.createElement("div");
  field.id = "libras-field";
  document.body.appendChild(field);

  const COUNT = 14;
  for (let i = 0; i < COUNT; i++) {
    const size = 26 + Math.random() * 46;
    const el = document.createElement("div");
    el.className = "libras-icon";
    el.style.left = `${Math.random() * 96}%`;
    el.style.top = `${Math.random() * 92}%`;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.setProperty("--r", `${(Math.random() * 16 - 8).toFixed(1)}deg`);
    el.style.animationDuration = `${7 + Math.random() * 8}s`;
    el.style.animationDelay = `${(Math.random() * -10).toFixed(1)}s`;
    el.innerHTML = ICONS.hand;
    field.appendChild(el);
  }
}

/* ---------------------------------------------------------------------- */
/* 3b. Brilho que segue o cursor                                          */
/* ---------------------------------------------------------------------- */

function initCursorGlow() {
  if ($("#cursor-glow")) return;
  if (window.matchMedia && (
    window.matchMedia("(hover: none), (pointer: coarse)").matches ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )) return;

  const glow = document.createElement("div");
  glow.id = "cursor-glow";
  document.body.appendChild(glow);

  let raf = null;
  document.addEventListener("mousemove", (e) => {
    glow.classList.add("active");
    if (raf) return;
    raf = requestAnimationFrame(() => {
      glow.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      raf = null;
    });
  });
  document.addEventListener("mouseleave", () => glow.classList.remove("active"));
}

/* ---------------------------------------------------------------------- */
/* 4. Aba: Vídeos                                                         */
/* ---------------------------------------------------------------------- */

function initVideos() {
  const listEl = $("#videos-list");
  const tabsEl = $("#videos-tabs");
  if (!listEl || !FIREBASE_OK) return;

  const form = $("#video-form");
  const nomeInput = $("#video-nome");
  const numInput = $("#video-numero");
  const linkInput = $("#video-link");
  const moduloInput = $("#video-modulo");
  const descInput = $("#video-descricao");

  subscribeModulos(() => {
    if (moduloInput) {
      const atual = moduloInput.value;
      moduloInput.innerHTML = modulosNomes().map(m => `<option>${esc(m)}</option>`).join("");
      if (atual && modulosNomes().includes(atual)) moduloInput.value = atual;
    }
    render();
  });

  let allVideos = [];
  let activeModulo = "todos";
  let editingId = null;

  function moduloDe(v) { return v.modulo || "Geral"; }

  function suggestNumero() {
    if (!numInput || numInput.dataset.touched) return;
    const modAtual = moduloInput ? moduloInput.value : null;
    let max = 0;
    allVideos
      .filter(v => !modAtual || moduloDe(v) === modAtual)
      .forEach(v => { const n = Number(v.numero) || 0; if (n > max) max = n; });
    numInput.value = max + 1;
  }

  function render() {
    if (tabsEl) {
      if (!allVideos.length) {
        tabsEl.innerHTML = "";
      } else {
        const counts = {};
        allVideos.forEach(v => { const m = moduloDe(v); counts[m] = (counts[m] || 0) + 1; });
        const modulosComVideo = modulosNomes().filter(m => counts[m]);
        if (counts["Geral"]) modulosComVideo.push("Geral");

        const tabBtn = (modulo, label, count) => `
          <button type="button" class="video-tab ${activeModulo === modulo ? "active" : ""}" data-modulo="${esc(modulo)}">
            ${esc(label)} <span class="video-tab-count">${count}</span>
          </button>`;

        tabsEl.innerHTML = tabBtn("todos", "Todos", allVideos.length)
          + modulosComVideo.map(m => tabBtn(m, m, counts[m])).join("");
      }
    }

    if (!allVideos.length) {
      listEl.innerHTML = emptyState("Nenhuma aula cadastrada ainda. Adicione a primeira aula ao lado.");
      return;
    }

    const filtradas = allVideos
      .filter(v => activeModulo === "todos" || moduloDe(v) === activeModulo)
      .sort((a, b) => (Number(a.numero) || 0) - (Number(b.numero) || 0));

    if (!filtradas.length) {
      listEl.innerHTML = emptyState("Nenhuma aula neste módulo ainda.");
      return;
    }

    listEl.innerHTML = "";
    filtradas.forEach((v) => {
      const card = editingId === v.id
        ? buildVideoEditCard(v.id, v, () => { editingId = null; render(); })
        : buildVideoCard(v.id, v, {
            onEdit: () => { editingId = v.id; render(); },
            onDelete: () => db.collection("videos").doc(v.id).delete(),
          });
      listEl.appendChild(card);
    });
  }

  db.collection("videos").orderBy("numero", "asc")
    .onSnapshot((snap) => {
      allVideos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      suggestNumero();
      render();
    }, (err) => console.error(err));

  tabsEl?.addEventListener("click", (e) => {
    const btn = e.target.closest(".video-tab");
    if (!btn) return;
    activeModulo = btn.dataset.modulo;
    render();
  });

  if (numInput) numInput.addEventListener("input", () => { numInput.dataset.touched = "1"; });
  if (moduloInput) moduloInput.addEventListener("change", () => { numInput.dataset.touched = ""; suggestNumero(); });

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const nome = nomeInput.value.trim();
    const numero = Number(numInput.value) || 0;
    const link = linkInput.value.trim();
    const modulo = moduloInput ? moduloInput.value : "";
    const descricao = descInput ? descInput.value.trim() : "";
    if (!nome || !link) return;
    db.collection("videos").add({
      nome, numero, link, modulo, descricao,
      criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
    }).then(() => {
      form.reset();
      if (moduloInput) moduloInput.selectedIndex = 0;
      numInput.dataset.touched = "";
      toast("Aula adicionada!");
    });
  });
}

/* Monta a mensagem explicativa que é copiada ao clicar na aula ------------- */

function buildVideoMessage(v) {
  const linhas = [`🖐️ Aula ${v.numero ?? ""} — ${v.nome || "(sem nome)"}`];
  if (v.modulo) linhas.push(`📚 Módulo: ${v.modulo}`);
  if (v.descricao) linhas.push("", v.descricao);
  linhas.push("", `🔗 Assista aqui: ${v.link || ""}`);
  return linhas.join("\n");
}

function buildVideoCard(id, v, { onEdit, onDelete }) {
  const card = document.createElement("div");
  card.className = "video-card";

  card.innerHTML = `
    <div class="video-card-top">
      <div class="copy-num">${esc(v.numero ?? "•")}</div>
      <div class="copy-body">
        <div class="copy-title">${esc(v.nome || "(sem nome)")}</div>
        ${v.modulo ? `<div class="copy-sub">${esc(v.modulo)}</div>` : ""}
      </div>
      <div class="video-card-actions">
        <button type="button" class="edit-x" title="Editar aula">${ICONS.pencil}</button>
        <button type="button" class="remove-x" title="Remover">${ICONS.trash}</button>
      </div>
    </div>
    ${v.descricao ? `<p class="video-desc">${esc(v.descricao)}</p>` : ""}
    <button type="button" class="btn btn-primary btn-block video-copy-btn">
      ${ICONS.copy} Copiar mensagem da aula
    </button>
  `;

  $(".edit-x", card).addEventListener("click", onEdit);
  $(".remove-x", card).addEventListener("click", () => {
    if (confirm("Remover esta aula?")) onDelete && onDelete();
  });
  $(".video-copy-btn", card).addEventListener("click", () => {
    copyText(buildVideoMessage(v), "Mensagem da aula copiada!");
  });

  return card;
}

function buildVideoEditCard(id, v, onDone) {
  const card = document.createElement("div");
  card.className = "video-card video-card-editing";

  const moduloOpts = modulosNomes().map(m =>
    `<option ${v.modulo === m ? "selected" : ""}>${esc(m)}</option>`).join("");

  card.innerHTML = `
    <div class="grid-2">
      <div class="field">
        <label>Nome da aula</label>
        <input class="e-nome" type="text" value="${esc(v.nome || "")}">
      </div>
      <div class="field">
        <label>Número da aula</label>
        <input class="e-numero" type="number" min="0" step="1" value="${esc(v.numero ?? 0)}">
      </div>
    </div>
    <div class="field">
      <label>Módulo</label>
      <select class="e-modulo">${moduloOpts}</select>
    </div>
    <div class="field">
      <label>Link do YouTube</label>
      <input class="e-link" type="url" value="${esc(v.link || "")}">
    </div>
    <div class="field">
      <label>Descrição da aula (usada na mensagem copiada)</label>
      <textarea class="e-descricao" rows="3">${esc(v.descricao || "")}</textarea>
    </div>
    <div class="student-edit-buttons">
      <button type="button" class="btn btn-sm e-cancel">Cancelar</button>
      <button type="button" class="btn btn-primary btn-sm e-save">Salvar alterações</button>
    </div>
  `;

  $(".e-cancel", card).addEventListener("click", () => onDone());
  $(".e-save", card).addEventListener("click", () => {
    const nome = $(".e-nome", card).value.trim();
    const link = $(".e-link", card).value.trim();
    if (!nome || !link) { toast("Preencha nome e link"); return; }
    db.collection("videos").doc(id).set({
      nome,
      numero: Number($(".e-numero", card).value) || 0,
      modulo: $(".e-modulo", card).value,
      link,
      descricao: $(".e-descricao", card).value.trim(),
    }, { merge: true }).then(() => {
      toast("Aula atualizada!");
      onDone();
    });
  });

  return card;
}

/* Upload de arquivo para o Cloudinary (grátis, sem cartão de crédito) ------- */

function uploadToCloudinary(file, onProgress) {
  return new Promise((resolve, reject) => {
    if (typeof CLOUD_CONFIG === "undefined"
        || !CLOUD_CONFIG.cloudName
        || CLOUD_CONFIG.cloudName.includes("SEU_")
        || !CLOUD_CONFIG.uploadPreset
        || CLOUD_CONFIG.uploadPreset.includes("SEU_")) {
      reject(new Error("cloud-config.js ainda não foi configurado com as chaves do Cloudinary."));
      return;
    }

    const url = `https://api.cloudinary.com/v1_1/${CLOUD_CONFIG.cloudName}/auto/upload`;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", CLOUD_CONFIG.uploadPreset);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      let data;
      try { data = JSON.parse(xhr.responseText); } catch { data = null; }
      if (xhr.status >= 200 && xhr.status < 300 && data && data.secure_url) {
        resolve(data);
      } else {
        reject(new Error((data && data.error && data.error.message) || "Falha no upload do arquivo."));
      }
    };
    xhr.onerror = () => reject(new Error("Erro de rede durante o upload."));
    xhr.send(fd);
  });
}

/* ---------------------------------------------------------------------- */
/* 5. Aba: Material de Apoio                                              */
/* ---------------------------------------------------------------------- */

function initApoio() {
  const listEl = $("#apoio-list");
  if (!listEl || !FIREBASE_OK) return;

  const form = $("#apoio-form");
  const moduloInput = $("#apoio-modulo");
  const filterSel = $("#apoio-filter");

  let allApoio = [];

  subscribeModulos(() => {
    if (moduloInput) {
      const atual = moduloInput.value;
      moduloInput.innerHTML = `<option value="">Nenhum específico</option>` + modulosNomes().map(m => `<option>${esc(m)}</option>`).join("");
      if (atual && modulosNomes().includes(atual)) moduloInput.value = atual;
    }
    if (filterSel) {
      const atualF = filterSel.value;
      filterSel.innerHTML = `<option value="">Todos os módulos</option>` + modulosNomes().map(m => `<option>${esc(m)}</option>`).join("");
      if (atualF && modulosNomes().includes(atualF)) filterSel.value = atualF;
    }
    render();
  });

  function render() {
    const f = filterSel ? filterSel.value : "";
    const items = f ? allApoio.filter(({ data }) => data.modulo === f) : allApoio;
    if (!items.length) {
      listEl.innerHTML = emptyState(f ? "Nenhum material desse módulo ainda." : "Nenhum material de apoio cadastrado ainda.");
      return;
    }
    listEl.innerHTML = "";
    items.forEach(({ id, data: m }) => {
      const wrap = document.createElement("div");
      wrap.style.display = "flex";
      wrap.style.flexDirection = "column";
      wrap.style.gap = "6px";

      wrap.appendChild(buildCopyItem({
        icon: "book",
        title: m.nome || "(sem nome)",
        sub: m.origem === "upload" ? (m.arquivoNome || "arquivo hospedado") : (m.link || ""),
        tag: m.modulo || (m.origem === "upload" ? "Arquivo hospedado" : (m.tipo || "Material")),
        copyValue: m.link || "",
        onDelete: () => db.collection("apoio").doc(id).delete(),
      }));

      const credit = document.createElement("div");
      credit.className = "credit-note";
      credit.innerHTML = `${ICONS.info}<span>Este material é de <b>terceiros</b>. Sempre credite o autor ao enviar: <b>${esc(m.autor || "autor não informado")}</b>${m.origem !== "upload" && m.link ? ` — fonte: ${esc(m.link)}` : ""}.</span>`;
      wrap.appendChild(credit);

      listEl.appendChild(wrap);
    });
  }

  db.collection("apoio").orderBy("criadoEm", "desc")
    .onSnapshot((snap) => {
      allApoio = snap.docs.map(d => ({ id: d.id, data: d.data() }));
      render();
    }, (err) => console.error(err));

  filterSel?.addEventListener("change", render);

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const nome = $("#apoio-nome").value.trim();
    const autor = $("#apoio-autor").value.trim();
    const tipo = $("#apoio-tipo").value;
    const link = $("#apoio-link").value.trim();
    const modulo = moduloInput ? moduloInput.value : "";
    if (!nome || !autor || !link) return;
    db.collection("apoio").add({
      nome, autor, tipo, link, modulo,
      origem: "link",
      criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
    }).then(() => { form.reset(); toast("Material adicionado!"); });
  });
}

/* ---------------------------------------------------------------------- */
/* 6. Aba: Documentos                                                     */
/* ---------------------------------------------------------------------- */

function initDocs() {
  const listEl = $("#docs-list");
  if (!listEl || !FIREBASE_OK) return;

  const form = $("#doc-form");
  const filterSel = $("#doc-filter");
  const filterModuloSel = $("#doc-filter-modulo");
  const moduloInput = $("#doc-modulo");
  let allDocs = [];

  subscribeModulos(() => {
    if (moduloInput) {
      const atual = moduloInput.value;
      moduloInput.innerHTML = `<option value="">Nenhum específico</option>` + modulosNomes().map(m => `<option>${esc(m)}</option>`).join("");
      if (atual && modulosNomes().includes(atual)) moduloInput.value = atual;
    }
    if (filterModuloSel) {
      const atualF = filterModuloSel.value;
      filterModuloSel.innerHTML = `<option value="">Todos os módulos</option>` + modulosNomes().map(m => `<option>${esc(m)}</option>`).join("");
      if (atualF && modulosNomes().includes(atualF)) filterModuloSel.value = atualF;
    }
    render();
  });

  function render() {
    const f = filterSel ? filterSel.value : "";
    const fm = filterModuloSel ? filterModuloSel.value : "";
    let items = allDocs;
    if (f) items = items.filter(d => d.data.categoria === f);
    if (fm) items = items.filter(d => d.data.modulo === fm);
    if (!items.length) {
      listEl.innerHTML = emptyState("Nenhum documento encontrado com esse(s) filtro(s).");
      return;
    }
    listEl.innerHTML = "";
    items.forEach(({ id, data }) => {
      listEl.appendChild(buildCopyItem({
        icon: "file",
        title: data.nome || "(sem nome)",
        sub: data.linkOuLocal || data.obs || "",
        tag: data.modulo || data.categoria || "Outro",
        copyValue: data.linkOuLocal || data.obs || "",
        onDelete: () => db.collection("documentos").doc(id).delete(),
      }));
    });
  }

  db.collection("documentos").orderBy("criadoEm", "desc")
    .onSnapshot((snap) => {
      allDocs = snap.docs.map(d => ({ id: d.id, data: d.data() }));
      render();
    }, (err) => console.error(err));

  filterSel?.addEventListener("change", render);
  filterModuloSel?.addEventListener("change", render);

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const nome = $("#doc-nome").value.trim();
    const categoria = $("#doc-categoria").value;
    const linkOuLocal = $("#doc-link").value.trim();
    const obs = $("#doc-obs").value.trim();
    const modulo = moduloInput ? moduloInput.value : "";
    if (!nome) return;
    db.collection("documentos").add({
      nome, categoria, linkOuLocal, obs, modulo,
      criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
    }).then(() => { form.reset(); toast("Documento adicionado!"); });
  });
}

/* ---------------------------------------------------------------------- */
/* 7. Aba: Presença e Reposição                                           */
/* ---------------------------------------------------------------------- */

const STATUS_LABEL_PRESENCA = { presente: "Presente", faltou: "Faltou", reposicao: "Reposição" };

function gerarIdRegistroPresenca() {
  return (window.crypto && crypto.randomUUID)
    ? crypto.randomUUID()
    : `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function initPresenca() {
  const tbody = $("#presenca-body");
  if (!tbody || !FIREBASE_OK) return;

  const monthInput = $("#presenca-mes");
  const dateInput = $("#presenca-data");
  monthInput.value = currentMonthValue();
  dateInput.value = todayISO();

  // Se a data escolhida for de outro mês, acompanha o seletor de mês automaticamente.
  dateInput.addEventListener("change", () => {
    if (!dateInput.value) return;
    const mesDaData = dateInput.value.slice(0, 7);
    if (mesDaData !== monthInput.value) {
      monthInput.value = mesDaData;
      subscribeMonth(monthInput.value);
    }
  });

  let alunos = [];
  let registros = {}; // alunoId -> data
  let editandoId = null; // id do registro (dentro do log) que está em edição agora

  let unsubReg = null;

  function subscribeMonth(mes) {
    if (unsubReg) unsubReg();
    editandoId = null;
    unsubReg = db.collection("presenca").where("mes", "==", mes)
      .onSnapshot((snap) => {
        registros = {};
        snap.forEach(d => { registros[d.data().alunoId] = { id: d.id, ...d.data() }; });
        render();
      }, (err) => console.error(err));
  }

  // Os totais (Presente/Faltou/Reposição) são sempre calculados a partir do
  // próprio log de registros — assim, editar ou excluir um registro atualiza
  // o total automaticamente, sem precisar mexer em contadores separados.
  function contarStatus(log) {
    const c = { presente: 0, faltou: 0, reposicao: 0 };
    (log || []).forEach(l => { if (c[l.status] !== undefined) c[l.status]++; });
    return c;
  }

  function aulasDoAluno(aluno) {
    const mod = moduloPorNome(aluno.curso);
    return (mod && mod.aulas) ? mod.aulas.slice().sort((a, b) => a.numero - b.numero) : [];
  }

  function render() {
    if (!alunos.length) {
      tbody.innerHTML = `<tr><td colspan="4"><div class="empty-state">${ICONS.users}<div>Nenhum aluno cadastrado ainda. Adicione alunos na aba "Base de Alunos".</div></div></td></tr>`;
      return;
    }
    tbody.innerHTML = "";
    alunos.forEach((aluno) => {
      const reg = registros[aluno.id] || { log: [] };
      const log = (reg.log || []).slice().sort((a, b) => (a.data < b.data ? 1 : a.data > b.data ? -1 : 0));
      const counts = contarStatus(log);
      const aulas = aulasDoAluno(aluno);
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>
          <div class="att-name att-name-click" role="button" tabindex="0" title="Clique para ver/marcar as aulas concluídas">${esc(aluno.nome)}<span>${esc(aluno.curso || "")}</span></div>
        </td>
        <td>
          <div class="att-counts">
            <span class="att-pill presente">Presente ${counts.presente}</span>
            <span class="att-pill faltou">Faltou ${counts.faltou}</span>
            <span class="att-pill reposicao">Reposição ${counts.reposicao}</span>
          </div>
        </td>
        <td>
          <div class="att-mark-row">
            <select class="att-aula-select" title="Qual aula é esse registro?">
              <option value="">Aula (opcional)</option>
              ${aulas.map(a => `<option value="${esc(String(a.numero))}">${esc(String(a.numero))} — ${esc(a.nome)}</option>`).join("")}
            </select>
            <div class="att-actions">
              <button class="att-btn presente" data-status="presente">+ Presente</button>
              <button class="att-btn faltou" data-status="faltou">+ Faltou</button>
              <button class="att-btn reposicao" data-status="reposicao">+ Reposição</button>
            </div>
          </div>
        </td>
        <td>
          <div class="att-log" data-log-list></div>
        </td>`;

      $(".att-name-click", tr).addEventListener("click", () => abrirChecklistAulas(aluno, aulas));
      $(".att-name-click", tr).addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrirChecklistAulas(aluno, aulas); }
      });

      $$(".att-btn", tr).forEach(btn => {
        btn.addEventListener("click", () => {
          const aulaSel = $(".att-aula-select", tr);
          const numero = aulaSel && aulaSel.value ? Number(aulaSel.value) : null;
          const aulaInfo = numero ? aulas.find(a => a.numero === numero) : null;
          markAttendance(aluno, btn.dataset.status, aulaInfo);
        });
      });

      renderLogList($("[data-log-list]", tr), aluno, log, aulas);

      tbody.appendChild(tr);
    });
  }

  function abrirChecklistAulas(aluno, aulas) {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = `
      <div class="modal-box">
        <div class="modal-head">
          <h3>Aulas de ${esc(aluno.nome)}</h3>
          <button type="button" class="modal-close" title="Fechar">✕</button>
        </div>
        <p class="panel-sub" style="margin-top:-4px;">Módulo: ${esc(aluno.curso || "não definido")}. Marque as aulas que ${esc((aluno.nome || "").split(" ")[0] || "o aluno")} já concluiu.</p>
        <div class="checklist" id="modal-checklist">
          ${aulas.length ? "" : emptyState("Este módulo ainda não tem aulas cadastradas no Painel de Módulos.")}
        </div>
      </div>`;
    document.body.appendChild(overlay);

    const fechar = () => overlay.remove();
    $(".modal-close", overlay).addEventListener("click", fechar);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) fechar(); });
    document.addEventListener("keydown", function onEsc(e) {
      if (e.key === "Escape") { fechar(); document.removeEventListener("keydown", onEsc); }
    });

    if (!aulas.length) return;
    const listEl = $("#modal-checklist", overlay);
    db.collection("aulasConcluidas").doc(aluno.id).get().then((doc) => {
      const feitas = new Set((doc.exists && doc.data().feitas) || []);
      listEl.innerHTML = aulas.map(a => `
        <label class="checklist-item">
          <input type="checkbox" data-numero="${esc(String(a.numero))}" ${feitas.has(a.numero) ? "checked" : ""}>
          <span>Aula ${esc(String(a.numero))} — ${esc(a.nome)}</span>
        </label>`).join("");
      $$("input[type=checkbox]", listEl).forEach((cb) => {
        cb.addEventListener("change", () => {
          marcarAulaConcluida(aluno.id, Number(cb.dataset.numero), cb.checked);
        });
      });
    }).catch((err) => { console.error(err); listEl.innerHTML = emptyState("Não foi possível carregar o checklist."); });
  }

  function marcarAulaConcluida(alunoId, numero, concluida) {
    db.collection("aulasConcluidas").doc(alunoId).set({
      feitas: concluida
        ? firebase.firestore.FieldValue.arrayUnion(numero)
        : firebase.firestore.FieldValue.arrayRemove(numero),
    }, { merge: true }).catch((err) => console.error(err));
  }

  function renderLogList(container, aluno, log, aulas) {
    if (!log.length) {
      container.innerHTML = `<span class="att-log-empty">Sem registros</span>`;
      return;
    }
    container.innerHTML = "";
    const visiveis = log.slice(0, 8);
    visiveis.forEach((entry) => {
      if (entry.id && entry.id === editandoId) {
        container.appendChild(buildLogEditor(aluno, entry, log, aulas));
        return;
      }
      const row = document.createElement("div");
      row.className = "att-log-entry";
      const aulaTxt = entry.aulaNumero ? ` (Aula ${esc(String(entry.aulaNumero))}${entry.aulaNome ? ": " + esc(entry.aulaNome) : ""})` : "";
      const repTxt = entry.dataReposicao ? ` · reposta em ${fmtDateBR(entry.dataReposicao)}` : "";
      row.innerHTML = `
        <span>${fmtDateBR(entry.data)} — ${STATUS_LABEL_PRESENCA[entry.status] || entry.status}${aulaTxt}${repTxt}</span>
        <button class="att-log-edit-btn" title="Editar este registro">${ICONS.pencil}</button>`;
      $(".att-log-edit-btn", row).addEventListener("click", () => {
        if (!entry.id) {
          toast("Este registro é antigo e não pode ser editado — apenas registros novos são editáveis");
          return;
        }
        editandoId = entry.id;
        render();
      });
      container.appendChild(row);
    });
    if (log.length > visiveis.length) {
      const more = document.createElement("div");
      more.className = "att-log-more";
      more.textContent = `+${log.length - visiveis.length} registro(s) mais antigo(s)`;
      container.appendChild(more);
    }
  }

  function buildLogEditor(aluno, entry, log, aulas) {
    const wrap = document.createElement("div");
    wrap.className = "att-log-editor";
    wrap.innerHTML = `
      <select class="le-status">
        <option value="presente">Presente</option>
        <option value="faltou">Faltou</option>
        <option value="reposicao">Reposição</option>
      </select>
      <select class="le-aula">
        <option value="">Aula (opcional)</option>
        ${(aulas || []).map(a => `<option value="${esc(String(a.numero))}" ${entry.aulaNumero === a.numero ? "selected" : ""}>${esc(String(a.numero))} — ${esc(a.nome)}</option>`).join("")}
      </select>
      <input type="date" class="le-data" value="${entry.data}">
      <input type="date" class="le-data-rep" value="${entry.dataReposicao || ""}" title="Data da reposição" style="display:${entry.status === "reposicao" ? "" : "none"};">
      <div class="att-log-editor-actions">
        <button class="le-save" title="Salvar alterações">${ICONS.check}</button>
        <button class="le-delete" title="Excluir registro">${ICONS.trash}</button>
        <button class="le-cancel" title="Cancelar">✕</button>
      </div>`;
    $(".le-status", wrap).value = entry.status;
    const repInput = $(".le-data-rep", wrap);
    $(".le-status", wrap).addEventListener("change", (e) => {
      repInput.style.display = e.target.value === "reposicao" ? "" : "none";
    });

    $(".le-cancel", wrap).addEventListener("click", () => { editandoId = null; render(); });

    $(".le-save", wrap).addEventListener("click", () => {
      const novaData = $(".le-data", wrap).value || entry.data;
      const novoStatus = $(".le-status", wrap).value;
      const aulaNumero = $(".le-aula", wrap).value ? Number($(".le-aula", wrap).value) : null;
      const aulaInfo = aulaNumero ? (aulas || []).find(a => a.numero === aulaNumero) : null;
      const dataReposicao = novoStatus === "reposicao" ? (repInput.value || "") : "";
      const novoLog = log.map(l => (l.id === entry.id ? {
        ...l,
        data: novaData,
        status: novoStatus,
        aulaNumero: aulaInfo ? aulaInfo.numero : null,
        aulaNome: aulaInfo ? aulaInfo.nome : null,
        dataReposicao: dataReposicao || null,
      } : l));
      salvarLog(aluno, novoLog, "Registro atualizado!");
    });

    $(".le-delete", wrap).addEventListener("click", () => {
      if (!confirm("Excluir este registro de presença?")) return;
      const novoLog = log.filter(l => l.id !== entry.id);
      salvarLog(aluno, novoLog, "Registro excluído!");
    });

    return wrap;
  }

  function salvarLog(aluno, novoLog, msgSucesso) {
    const mes = monthInput.value;
    const id = `${mes}_${aluno.id}`;
    db.collection("presenca").doc(id).update({ log: novoLog })
      .then(() => { editandoId = null; toast(msgSucesso); })
      .catch((err) => { console.error(err); toast("Não foi possível salvar — veja o console (F12)"); });
  }

  function markAttendance(aluno, status, aulaInfo) {
    const dataEscolhida = dateInput.value || todayISO();
    const mes = dataEscolhida.slice(0, 7);
    const id = `${mes}_${aluno.id}`;
    const entry = { id: gerarIdRegistroPresenca(), data: dataEscolhida, status };
    if (aulaInfo) { entry.aulaNumero = aulaInfo.numero; entry.aulaNome = aulaInfo.nome; }

    if (status === "reposicao") {
      const dataRep = prompt("Em que dia a reposição foi (ou será) feita? (AAAA-MM-DD)", dataEscolhida);
      if (dataRep === null) return; // cancelado
      if (dataRep.trim()) entry.dataReposicao = dataRep.trim();
    }

    db.collection("presenca").doc(id).set({
      mes, alunoId: aluno.id, alunoNome: aluno.nome,
      log: firebase.firestore.FieldValue.arrayUnion(entry),
    }, { merge: true }).then(() => toast(`Marcado: ${status} em ${fmtDateBR(dataEscolhida)}`));

    if (status === "presente" && aulaInfo) {
      marcarAulaConcluida(aluno.id, aulaInfo.numero, true);
    }
  }

  db.collection("alunos").orderBy("nome", "asc").onSnapshot((snap) => {
    alunos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    render();
  }, (err) => console.error(err));

  subscribeModulos(() => render());

  monthInput.addEventListener("change", () => subscribeMonth(monthInput.value));
  subscribeMonth(monthInput.value);
}

/* ---------------------------------------------------------------------- */
/* 8. Aba: Cronograma de Aulas (módulos)                                  */
/* ---------------------------------------------------------------------- */

function textoPadraoCronograma(m) {
  const aulas = (m.aulas || []).slice().sort((a, b) => a.numero - b.numero);
  const qtd = aulas.length;
  const linhas = [
    `Módulo ${m.nome}`,
    "",
    `Aulas: ${qtd ? `1 a ${qtd} (${qtd} aula${qtd === 1 ? "" : "s"})` : "nenhuma aula cadastrada ainda"}`,
    `Duração do curso: ${m.duracaoSemanas || 0} semana${m.duracaoSemanas === 1 ? "" : "s"}`,
  ];
  if (qtd) {
    linhas.push("", "Conteúdo das aulas:");
    aulas.forEach(a => linhas.push(`  ${a.numero}. ${a.nome}`));
  }
  return linhas.join("\n");
}

function initCronograma() {
  const grid = $("#modulos-grid");
  if (!grid || !FIREBASE_OK) return;

  const texts = {};
  const listenersAtivos = new Set();

  function renderGrid(lista) {
    if (!lista.length) {
      grid.innerHTML = emptyState("Nenhum módulo cadastrado ainda. Crie módulos no Painel de Módulos.");
      return;
    }
    const ordenados = lista.slice().sort((a, b) => (a.ordem || 0) - (b.ordem || 0));

    grid.innerHTML = ordenados.map((m, i) => `
      <div class="module-card" data-id="${esc(m.id)}" tabindex="0" role="button">
        <div class="module-index">Módulo ${String(i + 1).padStart(2, "0")}</div>
        <div class="module-name">${esc(m.nome)}</div>
        <div class="module-meta" data-preview>Carregando…</div>
        <div class="module-edit-hint">${ICONS.copy} Clique para copiar · ${ICONS.pencil} clique duplo para editar</div>
      </div>`).join("");

    ordenados.forEach((m) => {
      if (!listenersAtivos.has(m.id)) {
        listenersAtivos.add(m.id);
        db.collection("cronograma").doc(m.id).onSnapshot((doc) => {
          const modAtual = MODULOS_CACHE.find(x => x.id === m.id) || m;
          const texto = doc.exists && doc.data().texto ? doc.data().texto : textoPadraoCronograma(modAtual);
          texts[m.id] = texto;
          const card = $(`.module-card[data-id="${m.id}"]`);
          if (card) {
            const preview = $("[data-preview]", card);
            const linha = texto.split("\n").find(l => l.startsWith("Aulas:")) || "";
            preview.textContent = linha || "Clique para copiar o texto completo";
          }
        }, (err) => console.error(err));
      } else {
        // Já existe listener; garante que o preview seja preenchido de imediato com o cache atual.
        const texto = texts[m.id] || textoPadraoCronograma(m);
        const card = $(`.module-card[data-id="${m.id}"]`);
        if (card) {
          const preview = $("[data-preview]", card);
          const linha = texto.split("\n").find(l => l.startsWith("Aulas:")) || "";
          preview.textContent = linha || "Clique para copiar o texto completo";
        }
      }
    });
  }

  subscribeModulos((lista) => renderGrid(lista));

  grid.addEventListener("click", (e) => {
    const card = e.target.closest(".module-card");
    if (!card) return;
    copyText(texts[card.dataset.id] || "", "Texto do módulo copiado!");
  });

  grid.addEventListener("dblclick", (e) => {
    const card = e.target.closest(".module-card");
    if (!card) return;
    const id = card.dataset.id;
    const atual = texts[id] || "";
    const novo = prompt("Editar texto do módulo (será salvo para todos os dispositivos):", atual);
    if (novo !== null && novo.trim() !== "") {
      db.collection("cronograma").doc(id).set({ texto: novo }, { merge: true })
        .then(() => toast("Módulo atualizado!"));
    }
  });
}

/* ---------------------------------------------------------------------- */
/* 9. Aba: Base de Dados de Alunos                                        */
/* ---------------------------------------------------------------------- */

function initAlunos() {
  const grid = $("#alunos-grid");
  if (!grid || !FIREBASE_OK) return;

  const form = $("#aluno-form");
  const contratoSubmitBtn = $("#aluno-submit-btn");
  const contratoOriginalBtnHTML = contratoSubmitBtn ? contratoSubmitBtn.innerHTML : "";
  const contratoProgressWrap = $("#aluno-contrato-progress");
  const contratoBarFill = $("#aluno-contrato-bar-fill");
  const contratoPercentLabel = $("#aluno-contrato-percent");

  let editingId = null; // id do aluno atualmente em modo de edição
  let currentDocs = [];  // último snapshot recebido, guardado para re-render local

  const cursoSel = $("#aluno-curso");
  const inicioInput = $("#aluno-data-inicio");
  const fimPreview = $("#aluno-data-fim-preview");

  function atualizarPreviewFim() {
    if (!fimPreview) return;
    const mod = cursoSel ? moduloPorNome(cursoSel.value) : null;
    const fim = inicioInput ? calcularDataFim(inicioInput.value, mod ? mod.duracaoSemanas : 0) : "";
    fimPreview.textContent = fim
      ? `Previsão de término: ${fmtDateBR(fim)} (${mod ? mod.duracaoSemanas : 0} semana(s) de curso)`
      : "Escolha o módulo e a data de início para ver a previsão de término.";
  }

  subscribeModulos(() => {
    if (cursoSel) {
      const atual = cursoSel.value;
      cursoSel.innerHTML = modulosNomes().map(m => `<option>${esc(m)}</option>`).join("");
      if (atual && modulosNomes().includes(atual)) cursoSel.value = atual;
    }
    atualizarPreviewFim();
  });
  cursoSel?.addEventListener("change", atualizarPreviewFim);
  inicioInput?.addEventListener("change", atualizarPreviewFim);

  function render() {
    if (!currentDocs.length) {
      grid.innerHTML = emptyState("Nenhum aluno cadastrado ainda. Use o formulário acima.");
      return;
    }
    grid.innerHTML = "";
    currentDocs.forEach(({ id, data: a }) => {
      const card = editingId === id
        ? buildStudentEditCard(id, a, () => { editingId = null; render(); })
        : buildStudentViewCard(id, a, {
            onEdit: () => { editingId = id; render(); },
            onDelete: () => {
              if (confirm(`Remover ${a.nome} da base de alunos?`)) {
                db.collection("alunos").doc(id).delete();
              }
            },
          });
      grid.appendChild(card);
    });
  }

  db.collection("alunos").orderBy("nome", "asc")
    .onSnapshot((snap) => {
      currentDocs = snap.docs.map(d => ({ id: d.id, data: d.data() }));
      render();
    }, (err) => console.error(err));

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nome = $("#aluno-nome").value.trim();
    const email = $("#aluno-email").value.trim();
    const telefone = $("#aluno-telefone").value.trim();
    const curso = $("#aluno-curso").value;
    const diaHorario = $("#aluno-dia").value.trim();
    const dataInicio = inicioInput ? inicioInput.value : "";
    if (!nome) return;

    const mod = moduloPorNome(curso);
    const dataFimPrevista = calcularDataFim(dataInicio, mod ? mod.duracaoSemanas : 0);

    const dadosBase = {
      nome, email, telefone, curso, diaHorario, dataInicio, dataFimPrevista,
      criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
    };

    const fileInput = $("#aluno-contrato-arquivo");
    const file = fileInput.files[0];

    if (!file) {
      // Contrato é opcional: cadastra o aluno mesmo sem arquivo anexado.
      db.collection("alunos").add(dadosBase).then(() => {
        form.reset();
        toast("Aluno cadastrado!");
        atualizarPreviewFim();
      });
      return;
    }

    contratoSubmitBtn.disabled = true;
    contratoSubmitBtn.textContent = "Enviando contrato…";
    contratoProgressWrap.style.display = "flex";
    contratoBarFill.style.width = "0%";
    contratoPercentLabel.textContent = "0%";

    try {
      const result = await uploadToCloudinary(file, (pct) => {
        contratoBarFill.style.width = pct + "%";
        contratoPercentLabel.textContent = pct + "%";
      });
      await db.collection("alunos").add({
        ...dadosBase,
        contrato: result.secure_url,
        contratoArquivoNome: file.name,
        contratoOrigem: "upload",
      });
      form.reset();
      contratoProgressWrap.style.display = "none";
      toast("Aluno cadastrado e contrato enviado!");
      atualizarPreviewFim();
    } catch (err) {
      console.error(err);
      toast("Falha no upload do contrato — veja o console (F12) ou o INSTRUCOES.md");
    } finally {
      contratoSubmitBtn.disabled = false;
      contratoSubmitBtn.innerHTML = contratoOriginalBtnHTML;
    }
  });
}

function buildStudentViewCard(id, a, { onEdit, onDelete }) {
  const initials = (a.nome || "?").trim().split(/\s+/).slice(0, 2).map(p => p[0]).join("").toUpperCase();
  const card = document.createElement("div");
  card.className = "student-card";
  card.innerHTML = `
    <div class="student-card-actions">
      <button class="edit-x" title="Editar aluno">${ICONS.pencil}</button>
      <button class="remove-x" title="Remover aluno">${ICONS.trash}</button>
    </div>
    <div class="student-avatar">${esc(initials)}</div>
    <div class="student-name">${esc(a.nome)}</div>
    <div class="student-detail">${ICONS.mail} ${esc(a.email || "—")}</div>
    <div class="student-detail">${ICONS.phone} ${esc(a.telefone || "—")}</div>
    <div class="student-detail">${ICONS.clock} ${esc(a.diaHorario || "—")}</div>
    ${a.curso ? `<span class="student-course-badge">${esc(a.curso)}</span>` : ""}
    ${a.dataInicio ? `<div class="student-detail">${ICONS.calendar} Início: ${fmtDateBR(a.dataInicio)}</div>` : ""}
    ${a.dataFimPrevista ? `<div class="student-detail">${ICONS.calendar} Previsão de término: ${fmtDateBR(a.dataFimPrevista)}</div>` : ""}
    ${a.contrato
      ? `<div class="student-detail student-contrato" role="button" tabindex="0" title="Clique para abrir o contrato">
           <span class="student-contrato-ic">${ICONS.file}</span>
           <span>${a.contratoOrigem === "upload" ? esc(a.contratoArquivoNome || "Contrato (PDF)") : "Contrato assinado"}</span>
           <span class="tag">${a.contratoOrigem === "upload" ? "PDF" : "Link"}</span>
         </div>`
      : `<div class="student-detail student-contrato-missing">${ICONS.info} Contrato não anexado</div>`}
  `;
  $(".edit-x", card).addEventListener("click", onEdit);
  $(".remove-x", card).addEventListener("click", onDelete);
  const contratoRow = $(".student-contrato", card);
  if (contratoRow) {
    const doOpen = () => window.open(a.contrato, "_blank", "noopener");
    contratoRow.addEventListener("click", doOpen);
    contratoRow.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); doOpen(); }
    });
  }
  return card;
}

function buildStudentEditCard(id, a, onDone) {
  const card = document.createElement("div");
  card.className = "student-card student-card-editing";

  const cursoOpts = modulosNomes().map(c =>
    `<option ${a.curso === c ? "selected" : ""}>${esc(c)}</option>`).join("");

  card.innerHTML = `
    <div class="field">
      <label>Nome completo</label>
      <input class="e-nome" type="text" value="${esc(a.nome || "")}">
    </div>
    <div class="field">
      <label>Email</label>
      <input class="e-email" type="email" value="${esc(a.email || "")}">
    </div>
    <div class="field">
      <label>Telefone</label>
      <input class="e-telefone" type="tel" value="${esc(a.telefone || "")}">
    </div>
    <div class="field">
      <label>Curso / módulo</label>
      <select class="e-curso">${cursoOpts}</select>
    </div>
    <div class="field">
      <label>Dia e horário</label>
      <input class="e-dia" type="text" value="${esc(a.diaHorario || "")}">
    </div>
    <div class="field">
      <label>Data de início do curso</label>
      <input class="e-data-inicio" type="date" value="${esc(a.dataInicio || "")}">
      <span class="hint e-data-fim-hint">${a.dataFimPrevista ? `Previsão de término: ${fmtDateBR(a.dataFimPrevista)}` : "Sem previsão de término calculada ainda."}</span>
    </div>
    <div class="field">
      <label>Contrato assinado (opcional)</label>
      ${a.contrato ? `<div class="hint">Atual: ${a.contratoOrigem === "upload" ? esc(a.contratoArquivoNome || "arquivo enviado") : esc(a.contrato)}</div>` : ""}
      <div class="e-contrato-upload-wrap">
        <input class="e-contrato-arquivo" type="file" accept="application/pdf">
      </div>
      <div class="e-contrato-progress contrato-progress" style="display:none;">
        <div class="contrato-progress-bar"><div class="e-contrato-bar-fill contrato-progress-fill"></div></div>
        <span class="e-contrato-percent">0%</span>
      </div>
      <span class="hint">Deixe em branco para manter o contrato atual (ou não anexar nenhum).</span>
    </div>
    <div class="student-edit-buttons">
      <button type="button" class="btn btn-sm e-cancel">Cancelar</button>
      <button type="button" class="btn btn-primary btn-sm e-save">Salvar alterações</button>
    </div>
  `;

  function atualizarHintFim() {
    const mod = moduloPorNome($(".e-curso", card).value);
    const fim = calcularDataFim($(".e-data-inicio", card).value, mod ? mod.duracaoSemanas : 0);
    const hint = $(".e-data-fim-hint", card);
    if (hint) hint.textContent = fim ? `Previsão de término: ${fmtDateBR(fim)}` : "Sem previsão de término calculada ainda.";
  }
  $(".e-curso", card).addEventListener("change", atualizarHintFim);
  $(".e-data-inicio", card).addEventListener("change", atualizarHintFim);

  $(".e-cancel", card).addEventListener("click", () => onDone());
  $(".e-save", card).addEventListener("click", async () => {
    const nome = $(".e-nome", card).value.trim();
    if (!nome) { toast("O nome não pode ficar vazio"); return; }

    const cursoVal = $(".e-curso", card).value;
    const dataInicioVal = $(".e-data-inicio", card).value;
    const modSel = moduloPorNome(cursoVal);
    const dataFimPrevista = calcularDataFim(dataInicioVal, modSel ? modSel.duracaoSemanas : 0);

    const dadosBase = {
      nome,
      email: $(".e-email", card).value.trim(),
      telefone: $(".e-telefone", card).value.trim(),
      curso: cursoVal,
      diaHorario: $(".e-dia", card).value.trim(),
      dataInicio: dataInicioVal,
      dataFimPrevista,
    };

    const saveBtn = $(".e-save", card);
    const originalHTML = saveBtn.innerHTML;

    const file = $(".e-contrato-arquivo", card).files[0];
    if (!file) {
      // Nenhum arquivo novo selecionado: mantém o contrato atual (ou nenhum — o contrato é opcional).
      db.collection("alunos").doc(id).set(dadosBase, { merge: true }).then(() => {
        toast("Dados do aluno atualizados!");
        onDone();
      });
      return;
    }
    const progressWrap = $(".e-contrato-progress", card);
    const barFill = $(".e-contrato-bar-fill", card);
    const percentLabel = $(".e-contrato-percent", card);
    saveBtn.disabled = true;
    saveBtn.textContent = "Enviando contrato…";
    progressWrap.style.display = "flex";
    try {
      const result = await uploadToCloudinary(file, (pct) => {
        barFill.style.width = pct + "%";
        percentLabel.textContent = pct + "%";
      });
      await db.collection("alunos").doc(id).set({
        ...dadosBase,
        contrato: result.secure_url,
        contratoArquivoNome: file.name,
        contratoOrigem: "upload",
      }, { merge: true });
      toast("Dados e contrato atualizados!");
      onDone();
    } catch (err) {
      console.error(err);
      toast("Falha no upload do contrato — veja o console (F12)");
      saveBtn.disabled = false;
      saveBtn.innerHTML = originalHTML;
    }
  });

  return card;
}

/* ---------------------------------------------------------------------- */
/* 9b. Aba: Base de Alunos — Importar de planilha (Excel/CSV)            */
/* ---------------------------------------------------------------------- */

const IMPORT_CAMPOS = {
  nome: ["nome", "nome completo", "aluno", "nome do aluno"],
  email: ["email", "e mail"],
  telefone: ["telefone", "celular", "whatsapp", "fone", "contato"],
  curso: ["curso", "modulo", "curso modulo", "curso e modulo", "turma"],
  diaHorario: ["dia e horario", "dia horario", "horario", "dia"],
  dataInicio: ["data de inicio", "data inicio", "inicio", "data de entrada"],
};

function normalizarChave(str) {
  return String(str || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function mapearColunasImportacao(cabecalho) {
  const normalizados = cabecalho.map(normalizarChave);
  const mapa = {};
  Object.entries(IMPORT_CAMPOS).forEach(([campo, candidatos]) => {
    const idx = normalizados.findIndex(h => candidatos.includes(h));
    if (idx !== -1) mapa[campo] = idx;
  });
  return mapa;
}

function excelSerialParaISO(serial) {
  // O Excel conta os dias a partir de 30/12/1899.
  const ms = Math.round((Number(serial) - 25569) * 86400 * 1000);
  const d = new Date(ms);
  return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

function parseDataFlexivel(valor) {
  if (valor === null || valor === undefined || valor === "") return "";
  if (typeof valor === "number") return excelSerialParaISO(valor);
  const str = String(valor).trim();
  let m = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = str.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return "";
}

function encontrarModuloParecido(nomeCurso) {
  if (!nomeCurso) return "";
  const alvo = normalizarChave(nomeCurso);
  const exato = MODULOS_CACHE.find(m => normalizarChave(m.nome) === alvo);
  if (exato) return exato.nome;
  const parcial = MODULOS_CACHE.find(m => normalizarChave(m.nome).includes(alvo) || alvo.includes(normalizarChave(m.nome)));
  return parcial ? parcial.nome : "";
}

function initImportAlunos() {
  const fileInput = $("#import-arquivo");
  const btn = $("#import-btn");
  const statusEl = $("#import-status");
  if (!fileInput || !btn || !FIREBASE_OK) return;

  btn.addEventListener("click", () => {
    const file = fileInput.files[0];
    if (!file) { toast("Escolha um arquivo primeiro"); return; }
    if (typeof XLSX === "undefined") {
      statusEl.textContent = "Não foi possível carregar o leitor de planilhas — verifique sua conexão e recarregue a página.";
      return;
    }

    statusEl.textContent = "Lendo arquivo…";
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const linhas = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: true });

        if (!linhas.length) { statusEl.textContent = "A planilha está vazia."; return; }

        const cabecalho = linhas[0];
        const mapa = mapearColunasImportacao(cabecalho);
        if (mapa.nome === undefined) {
          statusEl.textContent = 'Não encontrei uma coluna de nome na planilha. Renomeie a coluna para "Nome" e tente de novo.';
          return;
        }

        const registros = linhas.slice(1)
          .filter(row => row.some(c => String(c).trim() !== ""))
          .map((row) => {
            const nome = String(row[mapa.nome] ?? "").trim();
            const email = mapa.email !== undefined ? String(row[mapa.email] ?? "").trim() : "";
            const telefone = mapa.telefone !== undefined ? String(row[mapa.telefone] ?? "").trim() : "";
            const cursoBruto = mapa.curso !== undefined ? String(row[mapa.curso] ?? "").trim() : "";
            const diaHorario = mapa.diaHorario !== undefined ? String(row[mapa.diaHorario] ?? "").trim() : "";
            const dataInicio = mapa.dataInicio !== undefined ? parseDataFlexivel(row[mapa.dataInicio]) : "";
            const curso = encontrarModuloParecido(cursoBruto);
            const mod = curso ? moduloPorNome(curso) : null;
            const dataFimPrevista = calcularDataFim(dataInicio, mod ? mod.duracaoSemanas : 0);
            return { nome, email, telefone, curso, cursoBruto, diaHorario, dataInicio, dataFimPrevista };
          })
          .filter(r => r.nome);

        if (!registros.length) {
          statusEl.textContent = "Nenhum aluno com nome preenchido foi encontrado nessa planilha.";
          return;
        }
        statusEl.textContent = "";
        abrirPreviewImportacao(registros);
      } catch (err) {
        console.error(err);
        statusEl.textContent = "Não foi possível ler esse arquivo — confira se é um .xlsx, .xls ou .csv válido.";
      }
    };
    reader.onerror = () => { statusEl.textContent = "Erro ao ler o arquivo."; };
    reader.readAsArrayBuffer(file);
  });
}

function abrirPreviewImportacao(registros) {
  const semModulo = registros.filter(r => r.cursoBruto && !r.curso).length;

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal-box" style="max-width:720px;">
      <div class="modal-head">
        <h3>Pré-visualizar importação</h3>
        <button type="button" class="modal-close" title="Fechar">✕</button>
      </div>
      <p class="panel-sub" style="margin-top:-4px;">
        ${registros.length} aluno(s) encontrado(s) na planilha.
        ${semModulo ? `<br>⚠️ ${semModulo} com o curso da planilha não reconhecido entre os módulos cadastrados — serão importados sem módulo definido, e dá pra ajustar depois editando o cadastro.` : ""}
      </p>
      <div style="max-height:360px; overflow:auto; border:1px solid var(--border, var(--gold-line)); border-radius:10px;">
        <table class="att-table" style="width:100%;">
          <thead><tr><th>Nome</th><th>Curso</th><th>Início</th><th>Contato</th></tr></thead>
          <tbody>
            ${registros.map(r => `
              <tr>
                <td>${esc(r.nome)}</td>
                <td>${r.curso ? esc(r.curso) : (r.cursoBruto ? `"${esc(r.cursoBruto)}" (não reconhecido)` : "—")}</td>
                <td>${r.dataInicio ? esc(fmtDateBR(r.dataInicio)) : "—"}</td>
                <td>${esc(r.email || r.telefone || "—")}</td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
      <div class="student-edit-buttons" style="margin-top:16px;">
        <button type="button" class="btn btn-sm imp-cancel">Cancelar</button>
        <button type="button" class="btn btn-primary btn-sm imp-confirm">Importar ${registros.length} aluno(s)</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  const fechar = () => overlay.remove();
  $(".modal-close", overlay).addEventListener("click", fechar);
  $(".imp-cancel", overlay).addEventListener("click", fechar);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) fechar(); });

  $(".imp-confirm", overlay).addEventListener("click", async () => {
    const confirmBtn = $(".imp-confirm", overlay);
    confirmBtn.disabled = true;
    confirmBtn.textContent = "Importando…";
    try {
      await salvarAlunosEmLote(registros);
      toast(`${registros.length} aluno(s) importado(s)!`);
      fechar();
    } catch (err) {
      console.error(err);
      toast("Erro ao importar — veja o console (F12)");
      confirmBtn.disabled = false;
      confirmBtn.textContent = `Importar ${registros.length} aluno(s)`;
    }
  });
}

async function salvarAlunosEmLote(registros) {
  const TAMANHO_LOTE = 400; // o Firestore permite no máximo 500 operações por lote
  for (let i = 0; i < registros.length; i += TAMANHO_LOTE) {
    const fatia = registros.slice(i, i + TAMANHO_LOTE);
    const batch = db.batch();
    fatia.forEach((r) => {
      const ref = db.collection("alunos").doc();
      batch.set(ref, {
        nome: r.nome,
        email: r.email,
        telefone: r.telefone,
        curso: r.curso,
        diaHorario: r.diaHorario,
        dataInicio: r.dataInicio,
        dataFimPrevista: r.dataFimPrevista,
        criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
      });
    });
    await batch.commit();
  }
}

/* ---------------------------------------------------------------------- */
/* 9c. Aba: Painel de Módulos                                             */
/* ---------------------------------------------------------------------- */

function initModulosPanel() {
  const grid = $("#modulos-panel-grid");
  if (!grid || !FIREBASE_OK) return;

  const form = $("#modulo-form");
  let editingId = null;

  function render(lista) {
    if (!lista.length) {
      grid.innerHTML = emptyState("Nenhum módulo cadastrado ainda. Crie o primeiro ao lado.");
      return;
    }
    grid.innerHTML = "";
    lista.slice().sort((a, b) => (a.ordem || 0) - (b.ordem || 0)).forEach((m) => {
      const card = editingId === m.id
        ? buildModuloEditCard(m, () => { editingId = null; render(MODULOS_CACHE); })
        : buildModuloViewCard(m, {
            onEdit: () => { editingId = m.id; render(MODULOS_CACHE); },
            onDelete: () => {
              if (confirm(`Remover o módulo "${m.nome}"? Vídeos e alunos que já usam esse nome continuam salvos, mas o módulo deixará de aparecer nas listas.`)) {
                db.collection("modulos").doc(m.id).delete();
              }
            },
          });
      grid.appendChild(card);
    });
  }

  subscribeModulos((lista) => render(lista));

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const nome = $("#modulo-nome").value.trim();
    const duracaoSemanas = Number($("#modulo-duracao").value) || 0;
    const qtdAulas = Number($("#modulo-qtd-aulas").value) || 0;
    if (!nome) return;
    const ordem = MODULOS_CACHE.reduce((max, m) => Math.max(max, m.ordem || 0), 0) + 1;
    const aulas = gerarAulasPadrao(qtdAulas);
    db.collection("modulos").add({
      nome, duracaoSemanas, aulas, ordem,
      criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
    }).then(() => { form.reset(); toast("Módulo criado!"); });
  });
}

function buildModuloViewCard(m, { onEdit, onDelete }) {
  const card = document.createElement("div");
  card.className = "modulo-card";
  const aulasOrdenadas = (m.aulas || []).slice().sort((a, b) => a.numero - b.numero);
  const qtd = aulasOrdenadas.length;
  card.innerHTML = `
    <div class="modulo-card-top">
      <div class="modulo-card-name">${esc(m.nome)}</div>
      <div class="modulo-card-actions">
        <button type="button" class="edit-x" title="Editar módulo">${ICONS.pencil}</button>
        <button type="button" class="remove-x" title="Remover módulo">${ICONS.trash}</button>
      </div>
    </div>
    <div class="modulo-card-meta">
      <span class="tag">${qtd} aula${qtd === 1 ? "" : "s"}</span>
      <span class="tag">${esc(String(m.duracaoSemanas || 0))} semana${m.duracaoSemanas === 1 ? "" : "s"}</span>
    </div>
    <div class="modulo-aulas-preview">
      ${qtd
        ? aulasOrdenadas.slice(0, 6).map(a => `<div class="modulo-aula-line">Aula ${esc(String(a.numero))} — ${esc(a.nome)}</div>`).join("")
          + (qtd > 6 ? `<div class="modulo-aula-line modulo-aula-more">+${qtd - 6} aula(s)…</div>` : "")
        : `<div class="modulo-aula-line modulo-aula-more">Nenhuma aula cadastrada ainda.</div>`}
    </div>
  `;
  $(".edit-x", card).addEventListener("click", onEdit);
  $(".remove-x", card).addEventListener("click", onDelete);
  return card;
}

function buildModuloEditCard(m, onDone) {
  const card = document.createElement("div");
  card.className = "modulo-card modulo-card-editing";

  let aulas = (m.aulas || []).slice().sort((a, b) => a.numero - b.numero).map(a => ({ ...a }));

  function aulasRowsHTML() {
    if (!aulas.length) return `<div class="modulo-aula-line modulo-aula-more">Nenhuma aula ainda — use "Adicionar aula".</div>`;
    return aulas.map((a, idx) => `
      <div class="modulo-aula-row" data-idx="${idx}">
        <input type="number" class="ma-numero" min="0" step="1" value="${esc(String(a.numero))}" title="Número da aula">
        <input type="text" class="ma-nome" value="${esc(a.nome || "")}" placeholder="Nome da aula">
        <button type="button" class="ma-remove" title="Remover aula">${ICONS.trash}</button>
      </div>`).join("");
  }

  card.innerHTML = `
    <div class="field">
      <label>Nome do módulo</label>
      <input class="e-nome" type="text" value="${esc(m.nome || "")}">
    </div>
    <div class="field">
      <label>Duração do curso (semanas)</label>
      <input class="e-duracao" type="number" min="0" step="1" value="${esc(String(m.duracaoSemanas ?? 0))}">
    </div>
    <div class="field">
      <label>Aulas do módulo (número e nome)</label>
      <div class="modulo-aula-list" id="modulo-aula-list-${esc(m.id)}">${aulasRowsHTML()}</div>
      <button type="button" class="btn btn-sm ma-add" style="margin-top:8px;">${ICONS.plus} Adicionar aula</button>
    </div>
    <div class="student-edit-buttons">
      <button type="button" class="btn btn-sm e-cancel">Cancelar</button>
      <button type="button" class="btn btn-primary btn-sm e-save">Salvar módulo</button>
    </div>
  `;

  const listEl = $(`#modulo-aula-list-${m.id}`, card);
  function refreshList() { listEl.innerHTML = aulasRowsHTML(); }

  listEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".ma-remove");
    if (!btn) return;
    const idx = Number(btn.closest(".modulo-aula-row").dataset.idx);
    aulas.splice(idx, 1);
    refreshList();
  });

  $(".ma-add", card).addEventListener("click", () => {
    const proxNum = aulas.reduce((max, a) => Math.max(max, Number(a.numero) || 0), 0) + 1;
    aulas.push({ numero: proxNum, nome: `Aula ${proxNum}` });
    refreshList();
  });

  $(".e-cancel", card).addEventListener("click", () => onDone());
  $(".e-save", card).addEventListener("click", () => {
    const nome = $(".e-nome", card).value.trim();
    if (!nome) { toast("O nome do módulo não pode ficar vazio"); return; }
    const duracaoSemanas = Number($(".e-duracao", card).value) || 0;
    const linhas = $$(".modulo-aula-row", listEl);
    const novasAulas = linhas.map((row) => ({
      numero: Number($(".ma-numero", row).value) || 0,
      nome: $(".ma-nome", row).value.trim() || "Aula",
    })).sort((a, b) => a.numero - b.numero);

    db.collection("modulos").doc(m.id).set({ nome, duracaoSemanas, aulas: novasAulas }, { merge: true })
      .then(() => { toast("Módulo atualizado!"); onDone(); });
  });

  return card;
}

/* ---------------------------------------------------------------------- */
/* 10. Aba: Links Hotmart                                                 */
/* ---------------------------------------------------------------------- */

function initHotmart() {
  const listEl = $("#hotmart-list");
  if (!listEl || !FIREBASE_OK) return;

  const form = $("#hotmart-form");
  const moduloSel = $("#hotmart-nome");

  subscribeModulos(() => {
    if (moduloSel) {
      const atual = moduloSel.value;
      moduloSel.innerHTML = modulosNomes().map(m => `<option>${esc(m)}</option>`).join("");
      if (atual && modulosNomes().includes(atual)) moduloSel.value = atual;
    }
  });

  db.collection("hotmart").orderBy("criadoEm", "desc")
    .onSnapshot((snap) => {
      if (snap.empty) {
        listEl.innerHTML = emptyState("Nenhum link da Hotmart cadastrado ainda.");
        return;
      }
      listEl.innerHTML = "";
      snap.forEach((doc) => {
        const h = doc.data();
        listEl.appendChild(buildCopyItem({
          icon: "cart",
          title: h.nomeModulo || "(sem nome)",
          sub: h.link || "",
          copyValue: h.link || "",
          onDelete: () => db.collection("hotmart").doc(doc.id).delete(),
        }));
      });
    }, (err) => console.error(err));

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const nomeModulo = moduloSel ? moduloSel.value : "";
    const link = $("#hotmart-link").value.trim();
    if (!nomeModulo || !link) return;
    db.collection("hotmart").add({
      nomeModulo, link,
      criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
    }).then(() => { form.reset(); toast("Link adicionado!"); });
  });
}

/* ---------------------------------------------------------------------- */
/* 11. Componentes reutilizáveis                                          */
/* ---------------------------------------------------------------------- */

function emptyState(msg) {
  return `<div class="empty-state">${ICONS.info}<div>${esc(msg)}</div></div>`;
}

function buildCopyItem({ numLabel, icon, title, sub, tag, copyValue, onDelete }) {
  const item = document.createElement("div");
  item.className = "copy-item";
  item.setAttribute("role", "button");
  item.setAttribute("tabindex", "0");

  const badge = numLabel !== undefined
    ? `<div class="copy-num">${esc(String(numLabel))}</div>`
    : `<div class="copy-ic" style="background:var(--bg-input)">${ICONS[icon] || ICONS.file}</div>`;

  item.innerHTML = `
    ${badge}
    <div class="copy-body">
      <div class="copy-title">${esc(title)}</div>
      ${sub ? `<div class="copy-sub">${esc(sub)}</div>` : ""}
    </div>
    ${tag ? `<span class="tag">${esc(tag)}</span>` : ""}
    <div class="copy-ic">${ICONS.copy}</div>
    <button class="remove-x" title="Remover">${ICONS.trash}</button>
  `;

  const doCopy = () => copyText(copyValue, "Link copiado!");
  item.addEventListener("click", (e) => {
    if (e.target.closest(".remove-x")) return;
    doCopy();
  });
  item.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); doCopy(); }
  });
  $(".remove-x", item).addEventListener("click", (e) => {
    e.stopPropagation();
    if (confirm("Remover este item?")) onDelete && onDelete();
  });

  return item;
}

/* ---------------------------------------------------------------------- */
/* 12. Boot                                                                */
/* ---------------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  function boot() {
    renderLibrasField();
    injectNav();
    initCursorGlow();

    if (!FIREBASE_OK) {
      const main = $(".main");
      if (main) {
        const warn = document.createElement("div");
        warn.className = "panel";
        warn.style.borderColor = "#4a2422";
        warn.innerHTML = `<h2 style="color:var(--red)">⚠ Firebase não configurado</h2>
          <p class="panel-sub">Abra o arquivo <b>firebase-config.js</b> e cole as chaves do seu projeto Firebase.
          Veja o passo a passo em <b>INSTRUCOES.md</b>.</p>`;
        main.prepend(warn);
      }
      return;
    }

    initVideos();
    initApoio();
    initDocs();
    initPresenca();
    initModulosPanel();
    initCronograma();
    initAlunos();
    initImportAlunos();
    initHotmart();
  }

  // Só inicia o app depois que o auth-guard.js confirmar um login autorizado.
  // Se o login já tiver sido confirmado antes deste script rodar, inicia na hora.
  if (window.__PAINEL_AUTH_USER__) {
    boot();
  } else {
    window.addEventListener("painel:auth-ready", boot, { once: true });
  }
});
