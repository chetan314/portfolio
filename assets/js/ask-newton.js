/* Ask Newton — scripted interactive prototype.
   No AI model runs here: answers are pre-written for one lecture so the
   UX (hint-first flow, citations, auto-pause, hand-off, analytics) can be tested. */
(function () {
  const proto = document.querySelector("[data-proto]");
  if (!proto) return;

  const $ = (s) => proto.querySelector(s);
  const DURATION = 32 * 60;
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const parse = (t) => { const [m, s] = t.split(":").map(Number); return m * 60 + s; };

  /* ---------- Lecture data ---------- */
  const transcript = [
    { t: "16:20", text: "So far we've used binary search to find an element in a sorted array.", line: 0 },
    { t: "16:58", text: "Today's twist: we binary search over the answer itself, not over the array.", line: 0 },
    { t: "17:30", text: "Example: what's the minimum capacity a ship needs to deliver all packages in D days?", line: 1 },
    { t: "17:55", text: "Our check, ok(mid), asks: can we finish within D days if the capacity is mid?", line: 3 },
    { t: "18:20", text: "If ok(mid) is true, mid might be the answer, so we keep it: hi = mid.", line: 4 },
    { t: "18:40", text: "If it's false, mid is definitely too small, so we skip past it: lo = mid + 1.", line: 5 },
    { t: "19:15", text: "The loop ends when lo meets hi, and that's our minimum capacity.", line: 7 },
    { t: "20:05", text: "Time complexity: log of the search range, times the cost of one check.", line: 2 },
  ].map((x) => ({ ...x, s: parse(x.t) }));

  const intents = {
    mid: {
      q: "Why lo = mid + 1 and not mid?",
      cite: { label: "18:20–18:40", seek: "18:40" },
      hints: [
        "Imagine <code>lo = 4</code> and <code>hi = 5</code>. What's <code>mid</code>? Now suppose <code>ok(mid)</code> is false. What happens to <code>lo</code> if we write <code>lo = mid</code>?",
        "With <code>lo = mid</code>, lo stays at 4 forever and the loop never ends. So what does <code>ok(mid) = false</code> tell you about mid itself?",
      ],
      answer: "<code>ok(mid) = false</code> means capacity <code>mid</code> can't deliver in time, so mid is <b>definitely not</b> the answer. <code>lo = mid + 1</code> throws it away, which guarantees the range shrinks every iteration. With <code>lo = mid</code>, the loop can get stuck forever when <code>hi = lo + 1</code>.",
      check: { q: "lo = 7, hi = 8, ok(7) is false. What happens next?", opts: ["lo becomes 8, loop ends", "lo stays 7", "hi becomes 7"], correct: 0 },
    },
    when: {
      q: "When do I use binary search on the answer?",
      cite: { label: "16:58–17:55", seek: "16:58" },
      hints: [
        "Think about the ship. If capacity 50 can deliver in time, can capacity 60 too?",
        "That \"once it works, everything bigger works too\" property is called <b>monotonic</b>. What two things would a problem need for you to search over its answers?",
      ],
      answer: "Use it when <b>(1)</b> the answer lies in a known range (here, <code>max(weights)</code> to <code>sum(weights)</code>), and <b>(2)</b> there's a yes/no check that's <b>monotonic</b>: once true, it stays true. Phrases like <i>minimum capacity</i>, <i>maximum distance</i> or <i>smallest time such that…</i> are strong signals.",
      check: { q: "Which of these is a good fit for binary search on the answer?", opts: ["Minimum days to make m bouquets", "Count the vowels in a string", "Reverse a linked list"], correct: 0 },
    },
    complexity: {
      q: "What's the time complexity?",
      cite: { label: "20:05", seek: "20:05" },
      hints: [
        "How many times does the <code>while</code> loop run if the range is <code>lo…hi</code>?",
        "Right, about <code>log(hi − lo)</code> times. Now, what does one call to <code>ok(mid)</code> cost for <code>n</code> packages?",
      ],
      answer: "<b>O(n · log(sum − max))</b>. The loop halves the range each time, so it runs <code>log(range)</code> times, and each <code>ok(mid)</code> walks through all <code>n</code> weights once.",
    },
  };

  function matchIntent(text) {
    const t = text.toLowerCase();
    if (/mid\s*\+\s*1|lo\s*=\s*mid|infinite|never end|stuck in (the )?loop|kyu|kyon|why.*mid/.test(t)) return "mid";
    if (/complex|big ?o|how fast|run ?time|time ?taken|\blog\b/.test(t)) return "complexity";
    if (/when|which problem|identify|recogni|monoton|use (binary|this)|kab/.test(t)) return "when";
    return null;
  }

  /* ---------- Player ---------- */
  const screen = $("[data-screen]");
  const timeEl = $("[data-time]");
  const ctxTime = $("[data-ctx-time]");
  const fill = $("[data-fill]");
  const knob = $("[data-knob]");
  const track = $("[data-track]");
  const playBtn = $("[data-play]");
  const iconPlay = $("[data-icon-play]");
  const iconPause = $("[data-icon-pause]");
  const tWrap = $("[data-transcript]");
  const codeLines = proto.querySelectorAll("[data-code] [data-line]");

  let now = parse("18:12");
  let playing = false;
  let timer = null;
  let askedAt = null;

  transcript.forEach((row, i) => {
    const el = document.createElement("div");
    el.className = "tline";
    el.dataset.i = i;
    el.innerHTML = `<span>${row.t}</span><div>${row.text}</div>`;
    el.addEventListener("click", () => { seek(row.s); log("transcript_seek", { to: row.t }); });
    tWrap.appendChild(el);
  });
  const tLines = tWrap.querySelectorAll(".tline");

  function currentIndex() {
    let idx = 0;
    transcript.forEach((r, i) => { if (now >= r.s) idx = i; });
    return idx;
  }

  function render() {
    const pct = (now / DURATION) * 100;
    fill.style.width = pct + "%";
    knob.style.left = pct + "%";
    timeEl.textContent = fmt(now);
    ctxTime.textContent = fmt(now);
    track.setAttribute("aria-valuenow", Math.round(now));
    track.setAttribute("aria-valuetext", fmt(now));
    const idx = currentIndex();
    tLines.forEach((l, i) => l.classList.toggle("now", i === idx));
    codeLines.forEach((c) => c.classList.toggle("hl", Number(c.dataset.line) === transcript[idx].line));
  }

  function scrollTranscriptTo(i, instant) {
    const line = tLines[i];
    if (!line) return;
    const delta = line.getBoundingClientRect().top - tWrap.getBoundingClientRect().top;
    tWrap.scrollTo({ top: tWrap.scrollTop + delta - 40, behavior: instant ? "auto" : "smooth" });
  }

  function setPlaying(p, reason) {
    playing = p;
    iconPlay.style.display = p ? "none" : "";
    iconPause.style.display = p ? "" : "none";
    playBtn.setAttribute("aria-label", p ? "Pause" : "Play");
    screen.classList.toggle("paused", !p && reason === "ask");
    clearInterval(timer);
    if (p) {
      screen.classList.remove("paused");
      timer = setInterval(() => {
        now = Math.min(DURATION, now + 1);
        const before = currentIndex();
        render();
        if (currentIndex() !== before) scrollTranscriptTo(currentIndex());
        if (now >= DURATION) setPlaying(false);
      }, 1000);
    }
  }

  function seek(s) {
    now = Math.max(0, Math.min(DURATION, s));
    render();
    const i = currentIndex();
    scrollTranscriptTo(i);
    tLines[i].classList.add("flash");
    setTimeout(() => tLines[i].classList.remove("flash"), 1200);
  }

  playBtn.addEventListener("click", () => {
    const next = !playing;
    setPlaying(next);
    if (next && askedAt !== null) {
      log("lecture_resumed", { time_to_unblock_s: Math.round((Date.now() - askedAt) / 1000) });
      askedAt = null;
    } else {
      log(next ? "lecture_play" : "lecture_pause", { at: fmt(now) });
    }
  });
  track.addEventListener("click", (e) => {
    const r = track.getBoundingClientRect();
    seek(((e.clientX - r.left) / r.width) * DURATION);
    log("scrub", { to: fmt(now) });
  });
  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { seek(now + 5); e.preventDefault(); }
    if (e.key === "ArrowLeft") { seek(now - 5); e.preventDefault(); }
  });
  track.setAttribute("aria-valuemin", 0);
  track.setAttribute("aria-valuemax", DURATION);

  /* ---------- Analytics log ---------- */
  const evList = $("[data-ev-list]");
  const evCount = $("[data-ev-count]");
  let evN = 0;
  function log(name, props) {
    if (evN === 0) evList.innerHTML = "";
    evN++;
    evCount.textContent = evN;
    const li = document.createElement("li");
    const clock = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    li.innerHTML = `<span>${clock}</span><div><b>${name}</b> ${escapeHtml(JSON.stringify(props || {}))}</div>`;
    evList.prepend(li);
  }
  function escapeHtml(s) { return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

  /* ---------- Chat ---------- */
  const msgs = $("[data-msgs]");
  const form = $("[data-composer]");
  const input = $("[data-input]");
  let mode = "hint";
  let busy = false;

  proto.querySelectorAll("[data-mode]").forEach((b) => {
    b.addEventListener("click", () => {
      mode = b.dataset.mode;
      proto.querySelectorAll("[data-mode]").forEach((x) => x.setAttribute("aria-pressed", x === b));
      log("mode_changed", { mode });
    });
  });

  function addMsg(cls, html) {
    const m = document.createElement("div");
    m.className = "msg " + cls;
    m.innerHTML = html;
    msgs.appendChild(m);
    msgs.scrollTop = msgs.scrollHeight;
    return m;
  }

  function citeBtn(intent) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "cite";
    b.innerHTML = `▶ Grounded in ${intent.cite.label}`;
    b.addEventListener("click", () => { seek(parse(intent.cite.seek)); log("citation_clicked", { ts: intent.cite.seek }); });
    return b;
  }

  function feedback(msg, key) {
    const fb = document.createElement("div");
    fb.className = "fb";
    fb.innerHTML = `Helpful? <button type="button" aria-label="Helpful">👍</button><button type="button" aria-label="Not helpful">👎</button>`;
    const [up, down] = fb.querySelectorAll("button");
    up.onclick = () => { up.classList.add("sel"); down.classList.remove("sel"); log("feedback", { intent: key, helpful: true }); };
    down.onclick = () => { down.classList.add("sel"); up.classList.remove("sel"); log("feedback", { intent: key, helpful: false }); };
    msg.appendChild(fb);
  }

  function actions(msg, list) {
    const wrap = document.createElement("div");
    wrap.className = "acts";
    list.forEach(({ label, pri, onClick }) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = label;
      if (pri) b.className = "pri";
      b.addEventListener("click", () => { wrap.querySelectorAll("button").forEach((x) => (x.disabled = true)); onClick(); });
      wrap.appendChild(b);
    });
    msg.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function thinking(label, ms) {
    return new Promise((res) => {
      const m = addMsg("bot", `<span class="thinking"><i></i><i></i><i></i> ${label}</span>`);
      setTimeout(() => { m.remove(); res(); }, ms);
    });
  }

  async function ask(text, source) {
    if (busy || !text.trim()) return;
    busy = true;
    addMsg("user", escapeHtml(text));
    const key = matchIntent(text);
    if (playing) { setPlaying(false, "ask"); log("lecture_autopaused", { at: fmt(now) }); }
    else screen.classList.add("paused");
    askedAt = Date.now();
    log("doubt_asked", { mode, source, at: fmt(now), intent: key || "unknown" });

    await thinking("Searching Lecture 14 transcript…", 900);

    if (!key) { unknown(text); busy = false; return; }
    const intent = intents[key];
    if (mode === "direct") showAnswer(key, 0);
    else showHint(key, 0);
    busy = false;
  }

  function showHint(key, n) {
    const intent = intents[key];
    const m = addMsg("bot", `<span class="lbl">Hint ${n + 1} of ${intent.hints.length}</span>${intent.hints[n]}`);
    m.appendChild(document.createElement("br"));
    m.appendChild(citeBtn(intent));
    log("hint_viewed", { intent: key, n: n + 1 });
    const acts = [];
    if (n + 1 < intent.hints.length) acts.push({ label: "Next hint", pri: true, onClick: () => showHint(key, n + 1) });
    acts.push({ label: "Got it, thanks!", pri: n + 1 >= intent.hints.length, onClick: () => solved(key, n + 1) });
    acts.push({ label: "Just show the answer", onClick: () => showAnswer(key, n + 1) });
    actions(m, acts);
  }

  function solved(key, hints) {
    log("solved_after_hint", { intent: key, hints_seen: hints });
    const m = addMsg("bot", `Nice, you got there yourself. That sticks better than reading an answer. ▶ Press play to pick up where you left off.`);
    if (intents[key].check) quickCheck(key);
    else feedback(m, key);
  }

  function showAnswer(key, hintsSeen) {
    const intent = intents[key];
    const m = addMsg("bot", `<span class="lbl">Answer</span>${intent.answer}`);
    m.appendChild(document.createElement("br"));
    m.appendChild(citeBtn(intent));
    log("answer_revealed", { intent: key, after_hints: hintsSeen, mode });
    feedback(m, key);
    actions(m, [
      ...(intent.check ? [{ label: "Check my understanding", pri: true, onClick: () => quickCheck(key) }] : []),
      { label: "Still stuck? Ask a TA", onClick: () => escalate(intent.q, hintsSeen) },
    ]);
  }

  function quickCheck(key) {
    const c = intents[key].check;
    const m = addMsg("bot", `<span class="lbl">Quick check</span>${c.q}`);
    const wrap = document.createElement("div");
    wrap.className = "acts";
    c.opts.forEach((o, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = o;
      b.onclick = () => {
        wrap.querySelectorAll("button").forEach((x) => (x.disabled = true));
        const ok = i === c.correct;
        b.classList.add("pri");
        log("quick_check_answered", { intent: key, correct: ok });
        addMsg("bot", ok
          ? "✅ Exactly. You've got it. Press ▶ to continue the lecture."
          : `Not quite. The answer is "<b>${c.opts[c.correct]}</b>". Want to rewatch the explanation? Tap the timestamp above.`);
      };
      wrap.appendChild(b);
    });
    m.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function unknown(text) {
    const m = addMsg("bot", `<span class="lbl warn">Not confident</span>I couldn't find this in Lecture 14, and I'd rather not guess. A teaching assistant can help. I'll send them your question and where you are in the lecture, so you won't have to explain it twice.`);
    log("low_confidence", { at: fmt(now) });
    actions(m, [
      { label: "Ask a TA", pri: true, onClick: () => escalate(text, 0) },
      { label: "Rephrase my doubt", onClick: () => input.focus() },
    ]);
  }

  function escalate(q, hints) {
    log("escalated_to_ta", { hints_seen: hints, at: fmt(now) });
    const m = addMsg("bot", `<span class="lbl">Sent to a TA</span>Done. You'll get a notification when they reply, usually within a couple of hours. Here's what they'll see:`);
    const t = document.createElement("div");
    t.className = "ticket";
    t.innerHTML = `<b>DOUBT #4821 · AUTO-FILLED CONTEXT</b>Lecture 14 @ ${fmt(now)} · "${escapeHtml(q)}"<br>Hints viewed: ${hints} · Mode: ${mode === "hint" ? "Hint first" : "Just answer"}`;
    m.appendChild(t);
    msgs.scrollTop = msgs.scrollHeight;
  }

  proto.querySelectorAll("[data-q]").forEach((b) => b.addEventListener("click", () => ask(intents[b.dataset.q].q, "suggested")));
  form.addEventListener("submit", (e) => { e.preventDefault(); const v = input.value; input.value = ""; ask(v, "typed"); });

  render();
  scrollTranscriptTo(currentIndex(), true);
})();
