/* Team page: a draggable 3D sphere of team members.
   Plain CSS 3D transforms, no libraries.

   Geometry: 12 members sit on the 12 vertices of an icosahedron, so every
   member is the same distance from all of their neighbours.
   Rotation: the globe is rotated by rotateX(pitch) rotateY(yaw). */
(function () {
  "use strict";

  var C = window.ARTH_CONFIG || {};
  document.querySelectorAll("[data-link]").forEach(function (el) {
    var k = el.getAttribute("data-link");
    var v = k === "mailto" ? (C.contactEmail ? "mailto:" + C.contactEmail : "") : C[k];
    if (v) el.setAttribute("href", v);
  });

  var TEAM = [
    { name: "Yash Anand", photo: "yash-anand", linkedin: "https://www.linkedin.com/in/yashanand-574677371/" },
    { name: "Kazima Fatima", photo: "kazima-fatima", linkedin: "https://www.linkedin.com/in/kazima-fatima-754614368/" },
    { name: "Gargee Kakaty", photo: "gargee-kakaty", linkedin: "https://www.linkedin.com/in/gargee-kakaty-b20124323/" },
    { name: "Dipesh Giri", photo: "dipesh-giri", linkedin: "https://www.linkedin.com/in/dipesh-giri-26188b323/" },
    { name: "Rajuram D", photo: "rajuram-d", linkedin: "https://www.linkedin.com/in/rajuram14/" },
    { name: "Hemant Dubey", photo: "hemant-dubey", linkedin: "https://www.linkedin.com/in/hemant-dubey-96233b419/" },
    { name: "Mahak Jaiswal", photo: "mahak-jaiswal", linkedin: "https://www.linkedin.com/in/mahak-jaiswal-200b47439" },
    { name: "Soniya Limbu", photo: "soniya-limbu", linkedin: "https://www.linkedin.com/in/soniya-limbu-854835418/" },
    { name: "Harshit Dwivedi", photo: "harshit-dwivedi", linkedin: "https://www.linkedin.com/in/harshit-dwivedi-aa8804434/" },
    { name: "Sahel Sasmal", photo: "sahel-sasmal", linkedin: "https://www.linkedin.com/in/sahel-sasmal-8706b4332/" },
    { name: "Nilesh", photo: "nilesh", linkedin: "https://www.linkedin.com/in/nilesh-9683a42b8" },
    { name: "Sagarika Chatterjee", photo: "sagarika-chatterjee", linkedin: "https://www.linkedin.com/in/sagarika-chatterjee-a30b2534b/" }
  ];

  var stage = document.getElementById("stage");
  var globe = document.getElementById("globe");
  var hint = document.getElementById("hint");
  var panel = document.getElementById("member");
  var nameEl = document.getElementById("memberName");
  var linkEl = document.getElementById("memberLink");
  var liveEl = document.getElementById("live");
  var prevBtn = document.getElementById("prevBtn");
  var nextBtn = document.getElementById("nextBtn");
  if (!stage || !globe) return;

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DEG = Math.PI / 180;
  var N = TEAM.length;

  /* Rotate who sits where each day so nobody is always the first one you meet. */
  var shift = Math.floor(Date.now() / 86400000) % N;
  var members = TEAM.slice(shift).concat(TEAM.slice(0, shift));

  /* Vertex positions as [longitude, latitude] in degrees, ordered as a zigzag
     path so that neighbours in the list are neighbours on the sphere
     (Previous / Next then travel a short distance). */
  var RING_LAT = Math.atan(0.5) / DEG; /* 26.565 degrees */
  var spots = [[0, 90]];
  for (var j = 0; j < 5; j++) {
    spots.push([72 * j, RING_LAT]);
    spots.push([72 * j + 36, -RING_LAT]);
  }
  spots.push([0, -90]);

  /* Build tiles */
  var tiles = members.map(function (m, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "tile";
    b.setAttribute("aria-label", m.name);
    b.tabIndex = -1;
    b.style.setProperty("--lon", spots[i][0] + "deg");
    b.style.setProperty("--lat", spots[i][1] + "deg");
    var img = document.createElement("img");
    img.src = "assets/team/" + m.photo + ".jpg";
    img.width = 400;
    img.height = 400;
    img.alt = "";
    img.draggable = false;
    b.appendChild(img);
    b.addEventListener("click", function () { goTo(i, true); });
    globe.appendChild(b);
    return b;
  });

  /* Wireframe: drawn as a flat SVG projected by hand (same rotation and
     perspective as the CSS globe). 3D-positioned ring elements would
     intersect the photo planes and make the browser slice the photos. */
  var NS = "http://www.w3.org/2000/svg";
  var wire = document.createElementNS(NS, "svg");
  wire.setAttribute("class", "wire");
  wire.setAttribute("aria-hidden", "true");
  var wireBack = document.createElementNS(NS, "path");
  var wireFront = document.createElementNS(NS, "path");
  wireBack.setAttribute("class", "wire-back");
  wireFront.setAttribute("class", "wire-front");
  wire.appendChild(wireBack);
  wire.appendChild(wireFront);
  stage.insertBefore(wire, globe);

  /* Circles on the unit sphere: equator, the two latitudes the members sit on,
     and three meridians. Points are [x, y, z] in CSS axes (y points down). */
  var ringPts = [];
  (function () {
    var STEPS = 96, t, k, lat, lon;
    function pt(la, lo) { return [Math.cos(la) * Math.sin(lo), -Math.sin(la), Math.cos(la) * Math.cos(lo)]; }
    [0, RING_LAT * DEG, -RING_LAT * DEG].forEach(function (la) {
      var pts = [];
      for (t = 0; t <= STEPS; t++) pts.push(pt(la, (t / STEPS) * 2 * Math.PI));
      ringPts.push(pts);
    });
    [0, 60, 120].forEach(function (lo) {
      var pts = [];
      for (t = 0; t <= STEPS; t++) pts.push(pt((t / STEPS) * 2 * Math.PI, lo * DEG));
      ringPts.push(pts);
    });
  })();

  function drawWire() {
    var cy = Math.cos(yaw * DEG), sy = Math.sin(yaw * DEG);
    var cp = Math.cos(pitch * DEG), sp = Math.sin(pitch * DEG);
    var P = R * 5, r = R * 0.985;
    var dFront = "", dBack = "";
    ringPts.forEach(function (pts) {
      var prevSide = null, seg = "";
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        var x1 = p[0] * cy + p[2] * sy;
        var z1 = -p[0] * sy + p[2] * cy;
        var y2 = p[1] * cp - z1 * sp;
        var z2 = p[1] * sp + z1 * cp;
        var s = P / (P - z2 * r);
        var sx = (x1 * r * s).toFixed(1), sY = (y2 * r * s).toFixed(1);
        var side = z2 >= 0;
        if (prevSide === null) {
          seg = "M" + sx + " " + sY;
        } else if (side !== prevSide) {
          /* close the current run, start the next one at the same point */
          if (prevSide) dFront += seg + "L" + sx + " " + sY; else dBack += seg + "L" + sx + " " + sY;
          seg = "M" + sx + " " + sY;
        } else {
          seg += "L" + sx + " " + sY;
        }
        prevSide = side;
      }
      if (prevSide) dFront += seg; else dBack += seg;
    });
    wireFront.setAttribute("d", dFront);
    wireBack.setAttribute("d", dBack);
  }

  /* State */
  var yaw = 0, pitch = 0;           /* degrees */
  var vYaw = 0, vPitch = 0;         /* degrees per ms (inertia) */
  var tYaw = 0, tPitch = 0;         /* snap targets */
  var tau = 110;                    /* snap easing time constant, ms */
  var mode = "idle";                /* idle | drag | inertia | snap */
  var raf = 0, last = 0;
  var R = 200;
  var front = -1;                   /* member currently facing the viewer */
  var settled = -1;                 /* member last announced */
  var liveTimer = 0;

  function clampPitch(p) { return Math.max(-90, Math.min(90, p)); }

  /* Depth (z toward the viewer, -1..1) of every member for the current rotation. */
  function depths() {
    var cy = Math.cos(yaw * DEG), sy = Math.sin(yaw * DEG);
    var cp = Math.cos(pitch * DEG), sp = Math.sin(pitch * DEG);
    return spots.map(function (s) {
      var lon = s[0] * DEG, lat = s[1] * DEG;
      var x = Math.cos(lat) * Math.sin(lon);
      var y = -Math.sin(lat);
      var z = Math.cos(lat) * Math.cos(lon);
      var z1 = -x * sy + z * cy;
      return y * sp + z1 * cp;
    });
  }

  function render() {
    globe.style.transform = "rotateX(" + pitch.toFixed(3) + "deg) rotateY(" + yaw.toFixed(3) + "deg)";
    drawWire();
    var d = depths(), best = 0, i;
    for (i = 1; i < N; i++) if (d[i] > d[best]) best = i;
    for (i = 0; i < N; i++) {
      /* Fade members toward the rim so depth reads clearly. */
      tiles[i].style.opacity = String(Math.max(0, Math.min(1, 0.35 + 0.75 * d[i])).toFixed(2));
    }
    if (best !== front) setFront(best);
  }

  function setFront(i) {
    if (front > -1) {
      tiles[front].classList.remove("is-front");
      tiles[front].tabIndex = -1;
    }
    front = i;
    tiles[i].classList.add("is-front");
    tiles[i].tabIndex = 0;
    var m = members[i];
    nameEl.textContent = m.name;
    linkEl.href = m.linkedin;
    linkEl.setAttribute("aria-label", m.name + " on LinkedIn (opens in a new tab)");
  }

  function announce() {
    clearTimeout(liveTimer);
    liveTimer = setTimeout(function () {
      if (front !== settled) { settled = front; liveEl.textContent = members[front].name; }
    }, 250);
  }

  /* Animation loop: runs only while something is moving. */
  function start() {
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
  }
  function stop() { cancelAnimationFrame(raf); raf = 0; }

  function tick(now) {
    var dt = Math.min(40, now - last);
    last = now;
    if (mode === "inertia") {
      yaw += vYaw * dt;
      var np = pitch + vPitch * dt;
      pitch = clampPitch(np);
      if (pitch !== np) vPitch = 0;
      var f = Math.exp(-dt / 320);
      vYaw *= f; vPitch *= f;
      if (Math.hypot(vYaw, vPitch) < 0.012) { vYaw = vPitch = 0; goTo(nearest(), false); }
    } else if (mode === "snap") {
      var k = 1 - Math.exp(-dt / tau);
      yaw += (tYaw - yaw) * k;
      pitch += (tPitch - pitch) * k;
      if (Math.abs(tYaw - yaw) < 0.04 && Math.abs(tPitch - pitch) < 0.04) {
        yaw = tYaw; pitch = tPitch; mode = "idle";
        render(); announce(); stop(); return;
      }
    } else { stop(); return; }
    render();
    raf = requestAnimationFrame(tick);
  }

  function nearest() {
    var d = depths(), best = 0;
    for (var i = 1; i < N; i++) if (d[i] > d[best]) best = i;
    return best;
  }

  /* Rotate so member i faces the viewer, along the shortest path. */
  function goTo(i, focusTile, slow) {
    i = ((i % N) + N) % N;
    var lon = spots[i][0], lat = spots[i][1];
    tYaw = -lon + 360 * Math.round((yaw + lon) / 360);
    tPitch = -lat;
    tau = slow ? 320 : 110;
    vYaw = vPitch = 0;
    if (focusTile) pendingFocus = i;
    if (reduceMotion) {
      yaw = tYaw; pitch = tPitch; mode = "idle"; render(); announce(); stop();
      if (focusTile) { tiles[i].focus({ preventScroll: true }); pendingFocus = -1; }
      return;
    }
    mode = "snap";
    start();
  }
  var pendingFocus = -1;
  /* Move keyboard focus once the chosen member has arrived at the front. */
  var focusWatch = setInterval(function () {
    if (pendingFocus > -1 && mode === "idle") {
      tiles[pendingFocus].focus({ preventScroll: true });
      pendingFocus = -1;
    }
  }, 120);
  window.addEventListener("pagehide", function () { clearInterval(focusWatch); });

  /* Pointer: drag to rotate, with inertia. */
  var drag = null, suppressClick = false;

  function degPerPx() { return (180 / Math.PI) / R; }

  stage.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    suppressClick = false;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY,
             t: performance.now(), moved: false, vx: 0, vy: 0 };
    mode = "idle"; stop(); vYaw = vPitch = 0;
  });

  stage.addEventListener("pointermove", function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    var now = performance.now();
    if (!drag.moved) {
      if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 6) return;
      drag.moved = true;
      mode = "drag";
      try { stage.setPointerCapture(e.pointerId); } catch (err) {}
      stage.classList.add("dragging", "touched");
    }
    var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    var dt = Math.max(1, now - drag.t);
    var k = degPerPx();
    yaw += dx * k;
    pitch = clampPitch(pitch - dy * k);
    /* Smoothed velocity in degrees per ms */
    drag.vx = 0.7 * (dx * k / dt) + 0.3 * drag.vx;
    drag.vy = 0.7 * (-dy * k / dt) + 0.3 * drag.vy;
    drag.x = e.clientX; drag.y = e.clientY; drag.t = now;
    render();
  });

  function release(e) {
    if (!drag || e.pointerId !== drag.id) return;
    var d = drag; drag = null;
    stage.classList.remove("dragging");
    if (d.moved) {
      suppressClick = true;
      setTimeout(function () { suppressClick = false; }, 60);
      var fresh = performance.now() - d.t < 90;
      if (!reduceMotion && fresh && Math.hypot(d.vx, d.vy) > 0.03) {
        vYaw = d.vx; vPitch = d.vy; mode = "inertia"; start();
      } else {
        goTo(nearest(), false);
      }
    } else if (!(e.target.closest && e.target.closest(".tile"))) {
      goTo(nearest(), false);
    }
  }
  stage.addEventListener("pointerup", release);
  stage.addEventListener("pointercancel", release);

  /* A drag must not also count as a click on the member under the pointer. */
  stage.addEventListener("click", function (e) {
    if (suppressClick) { e.preventDefault(); e.stopPropagation(); }
  }, true);

  /* Keyboard and buttons */
  function step(n) {
    stage.classList.add("touched");
    goTo((front > -1 ? front : 0) + n, false);
  }
  prevBtn.addEventListener("click", function () { step(-1); });
  nextBtn.addEventListener("click", function () { step(1); });
  stage.addEventListener("keydown", function (e) {
    var n = 0;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") n = 1;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = -1;
    else if (e.key === "Home") { e.preventDefault(); stage.classList.add("touched"); goTo(0, true); return; }
    else if (e.key === "End") { e.preventDefault(); stage.classList.add("touched"); goTo(N - 1, true); return; }
    if (!n) return;
    e.preventDefault();
    stage.classList.add("touched");
    goTo((front > -1 ? front : 0) + n, true);
  });
  /* Tabbing to a member brings them to the front. */
  stage.addEventListener("focusin", function (e) {
    var t = e.target.closest && e.target.closest(".tile");
    if (!t || drag) return;
    var i = tiles.indexOf(t);
    if (i > -1 && i !== front && mode === "idle") goTo(i, false);
  });

  /* Size the sphere to its container. */
  function size() {
    var w = stage.clientWidth;
    if (!w) return;
    R = Math.round(w * 0.36);
    wire.setAttribute("viewBox", (-w / 2) + " " + (-w / 2) + " " + w + " " + w);
    stage.style.setProperty("--R", R + "px");
    stage.style.setProperty("--tile", Math.round(R * 0.62) + "px");
    if (front > -1) drawWire();
  }
  size();
  if (window.ResizeObserver) new ResizeObserver(size).observe(stage);
  else window.addEventListener("resize", size);

  /* Intro: spin in from the side and settle on the first member. */
  var startAt = 1; /* a ring vertex, so several neighbours are visible at once */
  yaw = reduceMotion ? 0 : -spots[startAt][0] - 200;
  pitch = reduceMotion ? 0 : -spots[startAt][1] + 25;
  render();
  panel.hidden = false;
  goTo(startAt, false, true);
})();
