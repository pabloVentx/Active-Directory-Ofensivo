/* ============================================================
   AD OFENSIVO — app.js
   SPA estática sin build step. Todo el contenido se sirve como
   markdown plano + content/manifest.json. Añadir una técnica
   nueva = crear el .md con la plantilla + añadir una línea al
   manifest. No hace falta tocar este fichero.
   ============================================================ */

(function () {
  "use strict";

  const state = {
    manifest: null,
    /** id -> {id, kind:'tecnica'|'herramienta', faseId, title, resumen, tags, body, file} */
    index: new Map(),
    loaded: false,
  };

  const $sidebarTree = document.getElementById("sidebar-tree");
  const $main = document.getElementById("main");
  const $searchInput = document.getElementById("search-input");
  const $searchResults = document.getElementById("search-results");
  const $sidebar = document.getElementById("sidebar");
  const $scrim = document.getElementById("scrim");
  const $menuBtn = document.getElementById("menu-btn");

  // ---------- boot ----------

  async function boot() {
    try {
      const res = await fetch("content/manifest.json");
      state.manifest = await res.json();
    } catch (e) {
      $main.innerHTML = `<p style="color:#e2574c">No se ha podido cargar content/manifest.json. Si estás abriendo el archivo directamente (file://), sírvelo con un servidor local (ej. <code>python3 -m http.server</code>) porque el navegador bloquea fetch() sobre file://.</p>`;
      return;
    }

    document.title = state.manifest.sitio.titulo;
    const brandTitle = document.getElementById("brand-title");
    const brandSub = document.getElementById("brand-sub");
    if (brandTitle) brandTitle.textContent = state.manifest.sitio.titulo;
    if (brandSub) brandSub.textContent = state.manifest.sitio.subtitulo;

    await loadAllContent();
    buildSidebar();
    window.addEventListener("hashchange", render);
    render();
    state.loaded = true;
  }

  async function loadAllContent() {
    const jobs = [];
    for (const fase of state.manifest.fases) {
      for (const t of fase.tecnicas) {
        jobs.push(loadEntry(t.id, "tecnica", t.file, fase.id));
      }
    }
    for (const h of state.manifest.herramientas) {
      jobs.push(loadEntry(h.id, "herramienta", h.file, null));
    }
    await Promise.all(jobs);
  }

  async function loadEntry(id, kind, file, faseId) {
    try {
      const res = await fetch(file);
      const raw = await res.text();
      const { meta, body } = parseFrontmatter(raw);
      state.index.set(id, {
        id,
        kind,
        faseId,
        file,
        title: meta.title || id,
        resumen: meta.resumen || "",
        tags: (meta.tags || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        body,
      });
    } catch (e) {
      state.index.set(id, {
        id,
        kind,
        faseId,
        file,
        title: id,
        resumen: "",
        tags: [],
        body: `*No se pudo cargar \`${file}\`.*`,
      });
    }
  }

  // ---------- frontmatter parsing ----------

  function parseFrontmatter(raw) {
    const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
    if (!m) return { meta: {}, body: raw };
    const meta = {};
    m[1].split("\n").forEach((line) => {
      const idx = line.indexOf(":");
      if (idx === -1) return;
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();
      meta[key] = val;
    });
    return { meta, body: m[2] };
  }

  // ---------- sidebar ----------

  function buildSidebar() {
    const frag = document.createDocumentFragment();

    // Fases (each fase is an OU group; introduccion special-cased as single link)
    state.manifest.fases.forEach((fase, i) => {
      const group = document.createElement("div");
      group.className = "ou-group";
      group.dataset.faseId = fase.id;

      const toggle = document.createElement("button");
      toggle.className = "ou-toggle";
      toggle.innerHTML = `<span class="chevron"></span><span>${String(i).padStart(2, "0")} · ${escapeHtml(
        fase.titulo
      )}</span>`;
      toggle.addEventListener("click", () => group.classList.toggle("open"));
      group.appendChild(toggle);

      const ul = document.createElement("ul");
      ul.className = "ou-items";
      fase.tecnicas.forEach((t) => {
        const entry = state.index.get(t.id);
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = `#/t/${t.id}`;
        a.dataset.id = t.id;
        a.textContent = entry ? entry.title : t.id;
        li.appendChild(a);
        ul.appendChild(li);
      });
      group.appendChild(ul);
      frag.appendChild(group);
    });

    // Herramientas
    const toolLabel = document.createElement("div");
    toolLabel.className = "sidebar-section-label";
    toolLabel.textContent = "HERRAMIENTAS";
    frag.appendChild(toolLabel);

    const toolGroup = document.createElement("div");
    toolGroup.className = "ou-group";
    toolGroup.dataset.faseId = "__herramientas";
    const toolToggle = document.createElement("button");
    toolToggle.className = "ou-toggle";
    toolToggle.innerHTML = `<span class="chevron"></span><span>OU=Herramientas</span>`;
    toolToggle.addEventListener("click", () => toolGroup.classList.toggle("open"));
    toolGroup.appendChild(toolToggle);

    const toolUl = document.createElement("ul");
    toolUl.className = "ou-items";
    state.manifest.herramientas.forEach((h) => {
      const entry = state.index.get(h.id);
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `#/h/${h.id}`;
      a.dataset.id = h.id;
      a.textContent = entry ? entry.title : h.id;
      li.appendChild(a);
      toolUl.appendChild(li);
    });
    toolGroup.appendChild(toolUl);
    frag.appendChild(toolGroup);

    $sidebarTree.innerHTML = "";
    $sidebarTree.appendChild(frag);
  }

  function highlightActiveLink(id) {
    document.querySelectorAll("nav.tree a").forEach((a) => {
      a.classList.toggle("active", a.dataset.id === id);
    });
    // open the group containing the active link
    document.querySelectorAll(".ou-group").forEach((g) => {
      if (g.querySelector(`a[data-id="${CSS.escape(id || "")}"]`)) {
        g.classList.add("open");
      }
    });
  }

  // ---------- router ----------

  function render() {
    const hash = location.hash.replace(/^#\/?/, "");
    const parts = hash.split("/").filter(Boolean);
    closeMobileSidebar();

    if (parts.length === 0) {
      renderHome();
      highlightActiveLink(null);
      return;
    }
    if (parts[0] === "fase" && parts[1]) {
      renderFase(parts[1]);
      highlightActiveLink(null);
      return;
    }
    if ((parts[0] === "t" || parts[0] === "h") && parts[1]) {
      renderEntry(parts[1]);
      highlightActiveLink(parts[1]);
      return;
    }
    renderHome();
  }

  function renderHome() {
    const m = state.manifest;
    let html = `
      <div class="dn-path"><span class="seg-cn">CN=Bienvenido</span>,<span class="seg">${escapeHtml(
        m.sitio.dominio
      )}</span></div>
      <h1>${escapeHtml(m.sitio.titulo)}</h1>
      <p class="resumen">${escapeHtml(m.sitio.subtitulo)}. Organizado por fases, siguiendo el ciclo de vida real de un ataque a un dominio: de la enumeración inicial a la persistencia.</p>
      <div class="phase-grid">
    `;
    m.fases.forEach((fase, i) => {
      html += `
        <a class="phase-card" href="#/fase/${fase.id}">
          <span class="idx">OU=${escapeHtml(fase.ou.replace("OU=", ""))}</span>
          <h3>${String(i).padStart(2, "0")} · ${escapeHtml(fase.titulo)}</h3>
          <p>${escapeHtml(fase.descripcion)}</p>
          <span class="count">${fase.tecnicas.length} técnica${fase.tecnicas.length === 1 ? "" : "s"}</span>
        </a>
      `;
    });
    html += `</div>`;
    $main.innerHTML = html;
    window.scrollTo(0, 0);
  }

  function renderFase(faseId) {
    const fase = state.manifest.fases.find((f) => f.id === faseId);
    if (!fase) return renderHome();
    let html = `
      <div class="dn-path"><span class="seg-cn">OU=${escapeHtml(fase.ou.replace("OU=", ""))}</span>,<span class="seg">${escapeHtml(
      state.manifest.sitio.dominio
    )}</span></div>
      <h1>${escapeHtml(fase.titulo)}</h1>
      <p class="resumen">${escapeHtml(fase.descripcion)}</p>
      <ul class="technique-list">
    `;
    fase.tecnicas.forEach((t) => {
      const entry = state.index.get(t.id);
      html += `
        <li><a href="#/t/${t.id}">
          <span class="t-title">${escapeHtml(entry.title)}</span>
          <span class="t-resumen">${escapeHtml(entry.resumen)}</span>
        </a></li>
      `;
    });
    html += `</ul>`;
    $main.innerHTML = html;
    window.scrollTo(0, 0);
  }

  function renderEntry(id) {
    const entry = state.index.get(id);
    if (!entry) {
      $main.innerHTML = `<p>No existe la entrada <code>${escapeHtml(id)}</code>.</p>`;
      return;
    }
    const fase = entry.faseId ? state.manifest.fases.find((f) => f.id === entry.faseId) : null;
    const dn =
      entry.kind === "tecnica"
        ? `<span class="seg-cn">CN=${escapeHtml(entry.title)}</span>,<span class="seg">OU=${escapeHtml(
            (fase && fase.ou.replace("OU=", "")) || ""
          )}</span>,<span class="seg">${escapeHtml(state.manifest.sitio.dominio)}</span>`
        : `<span class="seg-cn">CN=${escapeHtml(entry.title)}</span>,<span class="seg">OU=Herramientas</span>,<span class="seg">${escapeHtml(
            state.manifest.sitio.dominio
          )}</span>`;

    const chips = entry.tags.length
      ? `<div class="chips-row">${entry.tags
          .map((tag) => {
            const t = state.index.get(tag);
            if (t) {
              const prefix = t.kind === "herramienta" ? "h" : "t";
              return `<a class="tool-chip" href="#/${prefix}/${tag}">⚙ ${escapeHtml(t.title)}</a>`;
            }
            return `<span class="tool-chip">${escapeHtml(tag)}</span>`;
          })
          .join("")}</div>`
      : "";

    const bodyHtml = renderMarkdown(entry.body);

    $main.innerHTML = `
      <div class="dn-path">${dn}</div>
      <h1>${escapeHtml(entry.title)}</h1>
      ${entry.resumen ? `<p class="resumen">${escapeHtml(entry.resumen)}</p>` : ""}
      ${chips}
      <article>${bodyHtml}</article>
    `;
    enhanceArticle($main.querySelector("article"));
    window.scrollTo(0, 0);
  }

  // ---------- markdown rendering ----------

  function renderMarkdown(md) {
    // resolve [[id]] and [[id|Label]] wikilinks before handing off to marked
    const withLinks = md.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (m, id, label) => {
      const cleanId = id.trim();
      const target = state.index.get(cleanId);
      const text = (label || (target ? target.title : cleanId)).trim();
      if (target) {
        const prefix = target.kind === "herramienta" ? "h" : "t";
        return `[${text}](#/${prefix}/${cleanId} "wikilink")`;
      }
      return `[${text}](#/broken/${cleanId} "wikilink-broken")`;
    });

    if (window.marked) {
      window.marked.setOptions({
        breaks: false,
        gfm: true,
        highlight: function (code, lang) {
          if (window.hljs) {
            try {
              return lang && window.hljs.getLanguage(lang)
                ? window.hljs.highlight(code, { language: lang }).value
                : window.hljs.highlightAuto(code).value;
            } catch (e) {
              return escapeHtml(code);
            }
          }
          return escapeHtml(code);
        },
      });
      return window.marked.parse(withLinks);
    }
    return `<pre>${escapeHtml(withLinks)}</pre>`;
  }

  function enhanceArticle(article) {
    if (!article) return;

    // mark wikilinks visually + broken state
    article.querySelectorAll('a[title="wikilink"], a[title="wikilink-broken"]').forEach((a) => {
      a.classList.add("wikilink");
      if (a.getAttribute("title") === "wikilink-broken") a.classList.add("broken");
      a.removeAttribute("title");
    });

    // copy buttons on code blocks
    article.querySelectorAll("pre").forEach((pre) => {
      const btn = document.createElement("button");
      btn.className = "copy-btn";
      btn.type = "button";
      btn.textContent = "copiar";
      btn.addEventListener("click", () => {
        const code = pre.querySelector("code");
        const text = code ? code.textContent : pre.textContent;
        navigator.clipboard.writeText(text).then(() => {
          btn.textContent = "¡copiado!";
          setTimeout(() => (btn.textContent = "copiar"), 1400);
        });
      });
      pre.appendChild(btn);
    });
  }

  // ---------- search ----------

  function runSearch(query) {
    const q = query.trim().toLowerCase();
    if (!q) {
      $searchResults.classList.remove("open");
      $searchResults.innerHTML = "";
      return;
    }
    const results = [];
    state.index.forEach((entry) => {
      const haystack = (
        entry.title +
        " " +
        entry.resumen +
        " " +
        entry.tags.join(" ") +
        " " +
        entry.body
      ).toLowerCase();
      if (haystack.includes(q)) {
        results.push(entry);
      }
    });
    results.sort((a, b) => a.title.localeCompare(b.title));

    if (!results.length) {
      $searchResults.innerHTML = `<div class="sr-empty">Sin resultados para "${escapeHtml(query)}"</div>`;
    } else {
      $searchResults.innerHTML = results
        .slice(0, 25)
        .map((r) => {
          const prefix = r.kind === "herramienta" ? "h" : "t";
          const kindLabel = r.kind === "herramienta" ? "HERRAMIENTA" : "TÉCNICA";
          return `<a href="#/${prefix}/${r.id}"><span class="sr-kind">${kindLabel}</span>${escapeHtml(r.title)}</a>`;
        })
        .join("");
    }
    $searchResults.classList.add("open");
  }

  $searchInput?.addEventListener("input", (e) => runSearch(e.target.value));
  $searchInput?.addEventListener("focus", (e) => {
    if (e.target.value) runSearch(e.target.value);
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-box")) {
      $searchResults.classList.remove("open");
    }
  });
  $searchResults?.addEventListener("click", () => {
    $searchInput.value = "";
    $searchResults.classList.remove("open");
  });

  // ---------- mobile sidebar ----------

  function openMobileSidebar() {
    $sidebar.classList.add("open");
    $scrim.classList.add("open");
  }
  function closeMobileSidebar() {
    $sidebar.classList.remove("open");
    $scrim.classList.remove("open");
  }
  $menuBtn?.addEventListener("click", openMobileSidebar);
  $scrim?.addEventListener("click", closeMobileSidebar);

  // ---------- utils ----------

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  boot();
})();
