/* Shared behaviour for every page. No dependencies. */
(function () {
  const root = document.documentElement;
  root.classList.remove("no-js");

  /* ---- Theme toggle (remembers choice when storage is available) ---- */
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } },
  };
  const themeBtn = document.querySelector("[data-theme-toggle]");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const current = root.dataset.theme ||
        (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      const next = current === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      store.set("theme", next);
    });
  }

  /* ---- Nav: border on scroll + mobile menu ---- */
  const nav = document.querySelector(".nav");
  const onScroll = () => nav && nav.classList.toggle("scrolled", scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const menuBtn = document.querySelector("[data-menu]");
  const links = document.querySelector(".nav-links");
  if (menuBtn && links) {
    menuBtn.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open);
    });
    links.addEventListener("click", (e) => {
      if (e.target.closest("a")) { links.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); }
    });
  }

  /* ---- Reveal on scroll ---- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  /* ---- Hero: "Show my thinking" ---- */
  const think = document.querySelector("[data-think]");
  const thinkInput = document.querySelector("[data-think-toggle]");
  if (think && thinkInput) {
    thinkInput.addEventListener("change", () => think.classList.toggle("on", thinkInput.checked));
  }

  /* ---- Copy email ---- */
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = btn.dataset.copy;
      const label = btn.querySelector("span");
      const original = label ? label.textContent : "";
      try {
        await navigator.clipboard.writeText(text);
        btn.classList.add("copied");
        if (label) label.textContent = "Copied!";
      } catch (e) {
        location.href = "mailto:" + text;
      }
      setTimeout(() => { btn.classList.remove("copied"); if (label) label.textContent = original; }, 1800);
    });
  });

  /* ---- Case study table of contents: highlight current section ---- */
  const tocLinks = document.querySelectorAll(".toc a");
  if (tocLinks.length && "IntersectionObserver" in window) {
    const map = new Map();
    tocLinks.forEach((a) => {
      const sec = document.querySelector(a.getAttribute("href"));
      if (sec) map.set(sec, [...(map.get(sec) || []), a]);
    });
    const tio = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          tocLinks.forEach((l) => l.classList.remove("active"));
          map.get(en.target).forEach((l) => l.classList.add("active"));
        }
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    map.forEach((_, sec) => tio.observe(sec));
  }

  /* ---- Year in footer ---- */
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
})();
