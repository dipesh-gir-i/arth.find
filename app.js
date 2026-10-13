(function () {
  "use strict";
  var C = window.ARTH_CONFIG || {};
  var THEMES = [
    { id: "warm-calm", name: "Warm Calm Light", s: "#f8f4e8", a: "#b17a57" },
    { id: "fresh-calm", name: "Fresh Calm Light", s: "#f1f8f3", a: "#6b8f71" },
    { id: "soft-natural", name: "Soft Natural Light", s: "#eaf4ff", a: "#4a90a4" },
    { id: "warm-friendly", name: "Warm Friendly Light", s: "#fff7e6", a: "#d9825b" },
    { id: "warm-calm-dark", name: "Warm Calm Dark", s: "#2a2723", a: "#c08b63" },
    { id: "fresh-calm-dark", name: "Fresh Calm Dark", s: "#1f2723", a: "#7fa987" },
    { id: "soft-natural-dark", name: "Soft Natural Dark", s: "#1e262e", a: "#5fa7bc" },
    { id: "warm-friendly-dark", name: "Warm Friendly Dark", s: "#2b2520", a: "#d9825b" }
  ];
  var KEY = "arth-site-theme";
  var root = document.documentElement;

  /* Links from config */
  document.querySelectorAll("[data-link]").forEach(function (el) {
    var k = el.getAttribute("data-link");
    var v = k === "mailto" ? (C.contactEmail ? "mailto:" + C.contactEmail : "") : C[k];
    if (v) el.setAttribute("href", v);
  });

  /* Video: privacy-enhanced domain, no autoplay */
  var yt = document.getElementById("ytFrame");
  if (yt && C.youtubeId) {
    yt.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(C.youtubeId) + "?rel=0";
  }

  /* Theme selector */
  var btn = document.getElementById("themeBtn");
  var panel = document.getElementById("themePanel");
  var grid = document.getElementById("themeGrid");
  var label = document.getElementById("themeName");
  var meta = document.querySelector('meta[name="theme-color"]');
  var current = root.getAttribute("data-theme");
  var NS = "http://www.w3.org/2000/svg";

  function apply(id, persist) {
    var t = THEMES.filter(function (x) { return x.id === id; })[0] || THEMES[0];
    current = t.id;
    root.setAttribute("data-theme", t.id);
    if (meta) meta.setAttribute("content", t.s);
    if (persist) { try { localStorage.setItem(KEY, t.id); } catch (e) {} }
    grid.querySelectorAll(".swatch").forEach(function (b) {
      var on = b.dataset.id === t.id;
      b.setAttribute("aria-checked", String(on));
      b.tabIndex = on ? 0 : -1;
    });
    label.textContent = t.name;
  }

  THEMES.forEach(function (t) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "swatch";
    b.dataset.id = t.id;
    b.setAttribute("role", "radio");
    b.setAttribute("aria-label", t.name);
    b.title = t.name;
    b.style.setProperty("--s", t.s);
    b.style.setProperty("--a", t.a);
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    var p = document.createElementNS(NS, "path");
    p.setAttribute("d", "M5 12.5l4.5 4.5L19 7.5");
    p.setAttribute("fill", "none");
    p.setAttribute("stroke", "#fff");
    p.setAttribute("stroke-width", "3");
    p.setAttribute("stroke-linecap", "round");
    p.setAttribute("stroke-linejoin", "round");
    svg.appendChild(p);
    b.appendChild(svg);
    b.addEventListener("click", function () { apply(t.id, true); close(true); });
    b.addEventListener("mouseenter", function () { label.textContent = t.name; });
    b.addEventListener("focus", function () { label.textContent = t.name; });
    b.addEventListener("mouseleave", function () { label.textContent = nameOf(current); });
    grid.appendChild(b);
  });

  function nameOf(id) { return THEMES.filter(function (x) { return x.id === id; })[0].name; }

  function open() {
    panel.hidden = false;
    btn.setAttribute("aria-expanded", "true");
    var sel = grid.querySelector('[aria-checked="true"]');
    if (sel) sel.focus();
  }
  function close(returnFocus) {
    panel.hidden = true;
    btn.setAttribute("aria-expanded", "false");
    if (returnFocus) btn.focus();
  }
  btn.addEventListener("click", function () { panel.hidden ? open() : close(false); });
  document.addEventListener("click", function (e) {
    if (!panel.hidden && !document.getElementById("theme").contains(e.target)) close(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !panel.hidden) close(true);
  });
  grid.addEventListener("keydown", function (e) {
    var items = Array.prototype.slice.call(grid.querySelectorAll(".swatch"));
    var i = items.indexOf(document.activeElement);
    if (i < 0) return;
    var n = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") n = (i + 1) % items.length;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = (i - 1 + items.length) % items.length;
    if (e.key === "Home") n = 0;
    if (e.key === "End") n = items.length - 1;
    if (n !== null) { e.preventDefault(); items[n].focus(); }
  });

  apply(current, false);
})();
