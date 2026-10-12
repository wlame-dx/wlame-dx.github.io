/* =========================================================
   Wlâme · GitHub Vitrini
   Public repoları canlı olarak GitHub REST API'den çeker.
   TR/EN dil desteği: tarayıcı dili TR değilse varsayılan EN.
   ========================================================= */

const USERNAME = "wlame-dx";
const API = `https://api.github.com`;
const PROFILE_REPO = USERNAME; // Profil README'sini barındıran repo

/* ---------- Çeviriler ---------- */
const I18N = {
  tr: {
    "nav.home": "Ana sayfa",
    "nav.language": "Dil / Language",
    "nav.about": "Hakkında",
    "nav.projects": "Projeler",
    "hero.stat.repo": "Repo",
    "hero.stat.stars": "Yıldız",
    "hero.stat.followers": "Takipçi",
    "about.title": "Hakkında",
    "readme.loading": "README yükleniyor...",
    "readme.more": "Devamını oku",
    "readme.collapse": "Daralt",
    "readme.error": "README yüklenemedi ({err}). GitHub profilinden görüntüleyebilirsin.",
    "projects.title": "Projeler",
    "search.placeholder": "Proje ara...",
    "sort.label": "Sıralama",
    "sort.updated": "Son güncellenen",
    "sort.stars": "En çok yıldız",
    "sort.name": "İsim (A-Z)",
    "sort.created": "En yeni",
    "filter.all": "Tümü",
    "filter.other": "Diğer",
    "state.loading": "Projeler yükleniyor...",
    "state.empty.none": "Hiç public proje bulunamadı.",
    "state.empty.search": "Aramanla eşleşen proje yok.",
    "state.empty.lang": "Bu dilde hiç proje yok.",
    "card.noDesc": "Açıklama yok.",
    "card.fork": "Fork",
    "card.archived": "Arşiv",
    "card.updated": "Güncellendi {n} {unit} önce",
    "card.site": "Site",
    "refreshBtn": "Yenile",
    "time.justNow": "az önce",
    "error.title": "Veriler yüklenemedi",
    "error.viewProfile": "Doğrudan GitHub profilini görüntüle:",
    "api.rateLimit": "GitHub API istek limiti aşıldı. Lütfen biraz sonra tekrar deneyin.",
    "api.notFound": "Kullanıcı bulunamadı.",
    "api.error": "GitHub API hatası ({code}).",
    "api.readmeNotFound": "README bulunamadı.",
    "title.suffix": "GitHub Projeleri",
    "meta.description": "Wlâme'nin tüm public GitHub projeleri — siyah-gri geçişli modern bir vitrin.",
    "footer.api": "Canlı GitHub API · GitHub Pages",
  },
  en: {
    "nav.home": "Home",
    "nav.language": "Language",
    "nav.about": "About",
    "nav.projects": "Projects",
    "hero.stat.repo": "Repos",
    "hero.stat.stars": "Stars",
    "hero.stat.followers": "Followers",
    "about.title": "About",
    "readme.loading": "Loading README...",
    "readme.more": "Read more",
    "readme.collapse": "Collapse",
    "readme.error": "Couldn't load README ({err}). You can view it on the GitHub profile.",
    "projects.title": "Projects",
    "search.placeholder": "Search projects...",
    "sort.label": "Sort",
    "sort.updated": "Recently updated",
    "sort.stars": "Most stars",
    "sort.name": "Name (A-Z)",
    "sort.created": "Newest",
    "filter.all": "All",
    "filter.other": "Other",
    "state.loading": "Loading projects...",
    "state.empty.none": "No public projects found.",
    "state.empty.search": "No projects match your search.",
    "state.empty.lang": "No projects in this language.",
    "card.noDesc": "No description.",
    "card.fork": "Fork",
    "card.archived": "Archived",
    "card.updated": "Updated {n} {unit} ago",
    "card.site": "Site",
    "refreshBtn": "Refresh",
    "time.justNow": "just now",
    "error.title": "Failed to load data",
    "error.viewProfile": "View the GitHub profile directly:",
    "api.rateLimit": "GitHub API rate limit exceeded. Please try again later.",
    "api.notFound": "User not found.",
    "api.error": "GitHub API error ({code}).",
    "api.readmeNotFound": "README not found.",
    "title.suffix": "GitHub Projects",
    "meta.description": "All of Wlâme's public GitHub projects — a modern showcase with black-to-gray gradients.",
    "footer.api": "Live GitHub API · GitHub Pages",
  },
};

function currentLang() {
  const saved = localStorage.getItem("wlame-lang");
  if (saved === "tr" || saved === "en") return saved;
  return (navigator.language || "en").toLowerCase().startsWith("tr") ? "tr" : "en";
}

let lang = currentLang();
const t = (key, vars = {}) => {
  let s = (I18N[lang] || I18N.en)[key];
  if (s === undefined) s = key;
  for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v);
  return s;
};

const els = {
  avatar: document.getElementById("avatar"),
  displayName: document.getElementById("displayName"),
  bio: document.getElementById("bio"),
  repoCount: document.getElementById("repoCount"),
  starCount: document.getElementById("starCount"),
  followerCount: document.getElementById("followerCount"),
  profileLink: document.getElementById("profileLink"),
  grid: document.getElementById("repoGrid"),
  stateBox: document.getElementById("stateBox"),
  search: document.getElementById("search"),
  sort: document.getElementById("sort"),
  langFilters: document.getElementById("langFilters"),
  readme: document.getElementById("readme"),
  readmeWrap: document.getElementById("readmeWrap"),
  readmeToggle: document.getElementById("readmeToggle"),
  refreshBtn: document.getElementById("refreshBtn"),
};

/* ---------- Durum ---------- */
const state = {
  user: null,
  repos: [],
  query: "",
  sort: "updated",
  lang: "all", // repo dili filtresi (state.lang; diller üstündeki uiLang'den ayrı)
  pages: {}, // repo → live Pages cache'i (promise'lar)
};
let lastError = null; // dil değişince hatayı yeniden görmek için

const LANG_COLORS = {
  JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5", HTML: "#e34c26",
  CSS: "#563d7c", "C#": "#178600", "C++": "#f34b7d", C: "#555555", Java: "#b07219",
  Go: "#00ADD8", Rust: "#dea584", Ruby: "#701516", PHP: "#4F5D95",
  Shell: "#89e051", PowerShell: "#012456", Dockerfile: "#384d54", Vue: "#41b883",
  Svelte: "#ff3e00", Kotlin: "#A97BFF", Swift: "#F05138", Dart: "#00B4AB",
  Lua: "#000080", Perl: "#0298c3", R: "#198CE7", Scala: "#c22d40", Haskell: "#5e5086",
  Elixir: "#6e4a7e", Clojure: "#db5855", Zig: "#ec915c", Nim: "#ffc200",
  "Jupyter Notebook": "#DA5B0B", SCSS: "#c6538c", Less: "#1d365d", Astro: "#ff5a03",
  Makefile: "#427819", Batchfile: "#C1F12E", "F#": "#b845fc", Objective_C: "#438eff",
  GLSL: "#5686a5", ShaderLab: "#222c37", HLSL: "#aace60", Assembly: "#6E4C13",
};
const langColor = (l) => LANG_COLORS[l] || "#8a8f98";
const NONE_LANG = "__none__";

function escapeHtml(str = "") {
  return String(str).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

const UNITS_TR = [["yıl", 31536000], ["ay", 2592000], ["gün", 86400], ["saat", 3600], ["dk", 60]];
const UNITS_EN = [["year", 31536000], ["month", 2592000], ["day", 86400], ["hour", 3600], ["min", 60]];

function timeAgo(iso) {
  const diffSec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diffSec < 60) return t("time.justNow");
  const units = lang === "tr" ? UNITS_TR : UNITS_EN;
  for (const [label, sec] of units) {
    if (diffSec >= sec) {
      const val = Math.floor(diffSec / sec);
      const unit = lang === "en" && val > 1 ? label + "s" : label;
      return lang === "tr" ? `${val} ${unit} önce` : `${val} ${unit} ago`;
    }
  }
  return t("time.justNow");
}

/* ---------- Dil ---------- */
class AppError extends Error {
  constructor(key, vars) {
    super(key);
    this.key = key;
    this.vars = vars;
  }
}

function applyStaticI18n() {
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.setAttribute("placeholder", t(el.dataset.i18nPlaceholder));
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    el.setAttribute("aria-label", t(el.dataset.i18nAria));
  });
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute("content", t("meta.description"));
  document.querySelectorAll(".lang-btn").forEach((b) => {
    const active = b.dataset.lang === lang;
    b.classList.toggle("active", active);
    b.setAttribute("aria-pressed", String(active));
  });
}

function setLanguage(newLang) {
  if (!I18N[newLang]) return;
  lang = newLang;
  localStorage.setItem("wlame-lang", lang);
  applyStaticI18n();

  if (state.user) {
    renderProfile();
    buildLangFilters();
    render();
    updateReadmeToggleText();
  }
  if (lastError) showError(lastError);
}

/* ---------- Veri çekme ---------- */
async function fetchJson(url) {
  const res = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
  if (!res.ok) {
    if (res.status === 403 || res.status === 429) throw new AppError("api.rateLimit");
    if (res.status === 404) throw new AppError("api.notFound");
    throw new AppError("api.error", { code: res.status });
  }
  return res.json();
}

async function load() {
  try {
    const [user, repos] = await Promise.all([
      fetchJson(`${API}/users/${USERNAME}`),
      fetchJson(`${API}/users/${USERNAME}/repos?per_page=100&sort=updated`),
    ]);

    state.user = user;
    state.repos = repos.filter((r) => !r.private).sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));

    renderProfile();
    buildLangFilters();
    render();
  } catch (err) {
    showError(err);
  }

  // README ayrı yükleniyor: hata olsa bile repolar etkilenmesin
  loadReadme();
}

/* ---------- Profil README'si ---------- */
async function loadReadme() {
  if (!els.readme) return;
  try {
    const res = await fetch(`${API}/repos/${USERNAME}/${PROFILE_REPO}/readme`, {
      headers: { Accept: "application/vnd.github.html+json" },
    });
    if (!res.ok) throw new AppError("api.readmeNotFound");
    const html = await res.text();
    els.readme.innerHTML = sanitizeReadme(html);
    absolutizeReadmeLinks();
    setupReadmeToggle();

    const src = document.getElementById("readmeSource");
    if (src) src.href = `https://github.com/${USERNAME}/${PROFILE_REPO}`;
  } catch (err) {
    const msg = err instanceof AppError ? t(err.key, err.vars) : String(err.message || err);
    els.readme.innerHTML = `<p class="readme-error">${escapeHtml(t("readme.error", { err: msg }))}</p>`;
    els.readmeWrap.classList.remove("collapsed");
  }
}

// README uzunsa katla ve "Devamını oku" düğmesini göster.
function updateReadmeToggleText() {
  const btn = els.readmeToggle;
  const txt = btn && btn.querySelector(".readme-toggle-text");
  if (!btn || !txt || btn.hidden) return;
  txt.textContent = els.readmeWrap.classList.contains("collapsed")
    ? t("readme.more")
    : t("readme.collapse");
}

function setupReadmeToggle() {
  const wrap = els.readmeWrap;
  const btn = els.readmeToggle;
  if (!wrap || !btn) return;

  if (els.readme.scrollHeight <= 620) {
    wrap.classList.remove("collapsed");
    btn.hidden = true;
    return;
  }

  btn.hidden = false;
  btn.classList.toggle("open", !wrap.classList.contains("collapsed"));
  updateReadmeToggleText();

  btn.addEventListener("click", () => {
    const collapsed = wrap.classList.toggle("collapsed");
    btn.classList.toggle("open", !collapsed);
    updateReadmeToggleText();
    if (collapsed) document.getElementById("about").scrollIntoView({ block: "start" });
  });
}

// GitHub'ın döndürdüğü HTML'i alır, sarmalayıcıyı çıkarır ve zararlı olabilecek
// etkileri temizleyip içeriği döndürür.
function sanitizeReadme(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const body = doc.querySelector(".markdown-body") || doc.body;

  body.querySelectorAll("script, style, iframe, object, embed, form, link, meta").forEach((n) => n.remove());
  body.querySelectorAll("*").forEach((el) => {
    [...el.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      if (name.startsWith("on")) el.removeAttribute(attr.name);
      if ((name === "href" || name === "src") && /^\s*javascript:/i.test(attr.value)) {
        el.removeAttribute(attr.name);
      }
    });
  });
  return body.innerHTML;
}

// README içindeki göreli bağlantı ve görselleri mutlak adreslere çevirir.
function absolutizeReadmeLinks() {
  const base = `https://github.com/${USERNAME}/${PROFILE_REPO}`;
  const raw = `https://raw.githubusercontent.com/${USERNAME}/${PROFILE_REPO}/HEAD`;
  els.readme.querySelectorAll("a[href]").forEach((a) => {
    const href = a.getAttribute("href");
    if (/^(https?:|mailto:|#)/i.test(href)) return;
    a.href = `${base}/${href.replace(/^\.?\//, "")}`;
  });
  els.readme.querySelectorAll("img[src]").forEach((img) => {
    const src = img.getAttribute("src");
    if (/^(https?:|data:)/i.test(src)) return;
    img.src = `${raw}/${src.replace(/^\.?\//, "")}`;
  });
}

/* ---------- Profil ---------- */
function renderProfile() {
  const u = state.user;
  if (u.avatar_url) els.avatar.src = u.avatar_url;
  els.displayName.textContent = u.name || u.login;
  els.bio.textContent = u.bio || `@${u.login}`;
  els.profileLink.href = u.html_url;
  document.title = `${u.name || u.login} · ${t("title.suffix")}`;

  const totalStars = state.repos.reduce((sum, r) => sum + r.stargazers_count, 0);
  els.repoCount.textContent = state.repos.length;
  els.starCount.textContent = totalStars;
  els.followerCount.textContent = u.followers ?? "–";
}

/* ---------- Dil filtreleri ---------- */
function buildLangFilters() {
  const counts = new Map();
  for (const r of state.repos) {
    const key = r.language || NONE_LANG;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  const langs = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  els.langFilters.innerHTML = "";
  els.langFilters.appendChild(makeChip("all", t("filter.all"), state.repos.length, null));
  for (const [key, count] of langs) {
    const label = key === NONE_LANG ? t("filter.other") : key;
    els.langFilters.appendChild(makeChip(key, label, count, key === NONE_LANG ? null : langColor(key)));
  }
}

function makeChip(value, label, count, color) {
  const btn = document.createElement("button");
  btn.className = "chip" + (value === state.lang ? " active" : "");
  btn.dataset.lang = value;
  btn.innerHTML = `${color ? `<span class="dot" style="background:${color}"></span>` : ""}${escapeHtml(label)} <span style="opacity:.6">${count}</span>`;
  btn.addEventListener("click", () => {
    state.lang = value;
    [...els.langFilters.children].forEach((c) => c.classList.toggle("active", c.dataset.lang === value));
    render();
  });
  return btn;
}

/* ---------- Listeleme ---------- */
function getVisibleRepos() {
  let list = [...state.repos];

  if (state.lang !== "all") {
    list = list.filter((r) => (r.language || NONE_LANG) === state.lang);
  }

  const q = state.query.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.description || "").toLowerCase().includes(q) ||
        (r.language || "").toLowerCase().includes(q) ||
        (r.topics || []).some((t) => t.toLowerCase().includes(q))
    );
  }

  const sorters = {
    updated: (a, b) => new Date(b.pushed_at) - new Date(a.pushed_at),
    created: (a, b) => new Date(b.created_at) - new Date(a.created_at),
    stars: (a, b) => b.stargazers_count - a.stargazers_count || new Date(b.pushed_at) - new Date(a.pushed_at),
    name: (a, b) => a.name.localeCompare(b.name),
  };
  return list.sort(sorters[state.sort] || sorters.updated);
}

function render() {
  const list = getVisibleRepos();
  els.grid.innerHTML = "";

  if (!state.repos.length) {
    showEmpty(t("state.empty.none"));
    return;
  }
  if (!list.length) {
    showEmpty(state.query ? t("state.empty.search") : t("state.empty.lang"));
    return;
  }
  hideState();

  list.forEach((repo, i) => {
    els.grid.appendChild(makeCard(repo, i));
  });
}

function makeCard(repo, index) {
  const card = document.createElement("div");
  card.className = "card";
  card.dataset.repo = repo.name;
  card.style.animationDelay = `${Math.min(index * 45, 500)}ms`;

  const desc = repo.description
    ? escapeHtml(repo.description)
    : `<span class="empty">${escapeHtml(t("card.noDesc"))}</span>`;
  const langName = repo.language;

  card.innerHTML = `
    <div class="card-top">
      <a class="card-name" href="${repo.html_url}" target="_blank" rel="noopener">
        <svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"/></svg>
        ${escapeHtml(repo.name)}
      </a>
      ${repo.fork ? `<span class="badge">${escapeHtml(t("card.fork"))}</span>` : repo.archived ? `<span class="badge">${escapeHtml(t("card.archived"))}</span>` : ""}
    </div>
    <p class="card-desc ${repo.description ? "" : "empty"}">${desc}</p>
    <div class="card-meta">
      ${langName ? `<span class="meta-item"><span class="dot" style="background:${langColor(langName)}"></span>${escapeHtml(langName)}</span>` : ""}
      ${repo.stargazers_count > 0 ? `<span class="meta-item">★ ${repo.stargazers_count}</span>` : ""}
      ${repo.forks_count > 0 ? `<span class="meta-item">⑂ ${repo.forks_count}</span>` : ""}
      <span class="meta-item">${lang === "tr" ? "Güncellendi " : "Updated "}${timeAgo(repo.pushed_at)}</span>
    </div>
  `;

  // Fare takip eden ışık efekti
  card.addEventListener("mousemove", (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  });

  // Kartın boş kısmına tıklayınca repoyu aç (içteki linkler normal çalışır)
  card.addEventListener("click", (e) => {
    if (e.target.closest("a")) return;
    window.open(repo.html_url, "_blank", "noopener");
  });

  // Repo canlı bir GitHub Pages sitesine sahipse "Site" düğmesi ekle
  pageCheck(card, repo);

  return card;
}

/* ---------- GitHub Pages tespiti ---------- */
function pagesUrl(repo) {
  const lower = USERNAME.toLowerCase();
  if (repo.name.toLowerCase() === `${lower}.github.io`) {
    return `https://${lower}.github.io/`;
  }
  return `https://${lower}.github.io/${repo.name}/`;
}

// GitHub Pages doğrulaması: site yaşıyor mu? İlk veri yığınını okuyup boyutuna
// bakarız — 404'ler ya da boş yanıtlar (3 bayt gibi) gerçek site sayılmaz.
// force=true ise önbelleği atlayıp yeniden kontrol eder (yeni açılan Pages siteleri).
function hasLiveSite(url, force) {
  if (force) delete state.pages[url];
  if (!(url in state.pages)) {
    state.pages[url] = (async () => {
      try {
        const res = await fetch(url, { mode: "cors" });
        if (!res.ok) return false;
        const reader = res.body && res.body.getReader ? res.body.getReader() : null;
        if (reader) {
          const { value } = await reader.read();
          reader.cancel().catch(() => {});
          return !!(value && value.length > 500);
        }
        const text = await res.text();
        return text.length > 500;
      } catch {
        return false;
      }
    })();
  }
  return state.pages[url];
}

async function pageCheck(card, repo, force) {
  const url = pagesUrl(repo);
  const live = await hasLiveSite(url, force).catch(() => false);
  if (!live || !card.isConnected) return;

  const meta = card.querySelector(".card-meta");
  if (!meta) return;

  const link = document.createElement("a");
  link.className = "site-chip";
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener";
  link.textContent = `🌐 ${t("card.site")}`;
  meta.insertBefore(link, meta.firstChild);
}

// Görünür kartlarda henüz düğmesi olmayanlar için Pages kontrolünü zorla tazele.
// Yeni açılan bir Pages sitesi bu sayede sayfayı yenilemeden belirir.
function refreshPageStatus() {
  if (document.visibilityState === "hidden") return;
  document.querySelectorAll(".card").forEach((card) => {
    const name = card.dataset.repo;
    if (!name || card.querySelector(".site-chip")) return;
    const repo = state.repos.find((r) => r.name === name);
    if (repo) pageCheck(card, repo, true);
  });
}

// Repo listesini GitHub'dan tazele (elle tetiklenir — API limitine saygı).
let refreshing = false;
async function refreshData() {
  if (refreshing) return;
  refreshing = true;
  els.refreshBtn.classList.add("loading");
  try {
    const [user, repos] = await Promise.all([
      fetchJson(`${API}/users/${USERNAME}`),
      fetchJson(`${API}/users/${USERNAME}/repos?per_page=100&sort=updated`),
    ]);
    state.user = user;
    state.repos = repos.filter((r) => !r.private).sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));
    renderProfile();
    buildLangFilters();
    render();
    refreshPageStatus();
  } catch (err) {
    showError(err);
  } finally {
    refreshing = false;
    els.refreshBtn.classList.remove("loading");
  }
}

/* ---------- Durum ekranları ---------- */
function hideState() {
  els.stateBox.classList.add("hidden");
  els.grid.style.display = "";
}
function showEmpty(msg) {
  els.grid.innerHTML = "";
  els.stateBox.classList.remove("hidden", "error");
  els.stateBox.innerHTML = `<p>${escapeHtml(msg)}</p>`;
}
function showError(err) {
  lastError = err;
  const msg = err instanceof AppError ? t(err.key, err.vars) : String(err.message || err);
  els.stateBox.classList.remove("hidden");
  els.stateBox.classList.add("error");
  els.stateBox.innerHTML = `
    <p><strong>${escapeHtml(t("error.title"))}</strong></p>
    <p>${escapeHtml(msg)}</p>
    <p style="font-size:12px">${escapeHtml(t("error.viewProfile"))} <a href="https://github.com/${USERNAME}" target="_blank" rel="noopener" style="color:#fff;text-decoration:underline">github.com/${USERNAME}</a></p>
  `;
}

/* ---------- Olaylar ---------- */
let searchTimer;
els.search.addEventListener("input", (e) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.query = e.target.value;
    render();
  }, 140);
});
els.sort.addEventListener("change", (e) => {
  state.sort = e.target.value;
  render();
});
document.querySelectorAll(".lang-btn").forEach((b) => {
  b.addEventListener("click", () => setLanguage(b.dataset.lang));
});
els.refreshBtn && els.refreshBtn.addEventListener("click", refreshData);

// Yeni açılan Pages sitelerinin düğmesini sayfayı yenilemeden göstermek için
// periyodik kontrol (github.io istekleri API limiti yemez).
setInterval(refreshPageStatus, 60000);

/* ---------- Başlat ---------- */
applyStaticI18n();
load();