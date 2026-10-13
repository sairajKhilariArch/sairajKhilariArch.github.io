(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Small-screen navigation
  const navToggle = document.getElementById("nav-toggle");
  const navLinks = document.getElementById("nav-links");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    navLinks.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      navLinks.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Filter project cards by topic
  const filterButtons = [...document.querySelectorAll(".filter-button")];
  const projectCards = [...document.querySelectorAll(".project-card")];
  filterButtons.forEach(button => button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach(item => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    projectCards.forEach(card => {
      const categories = (card.dataset.category || "").split(/\s+/);
      card.hidden = filter !== "all" && !categories.includes(filter);
    });
  }));
  filterButtons.forEach(button => button.setAttribute("aria-pressed", String(button.classList.contains("is-active"))));

  // Subtle section entrance animation; content remains visible without IntersectionObserver.
  const revealTargets = document.querySelectorAll(".section-heading, .about-copy, .fact-card, .project-card, .stack-group, .spec-terminal, .contact-section > *");
  if (!reduceMotion && "IntersectionObserver" in window) {
    revealTargets.forEach(element => element.classList.add("reveal"));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach(element => observer.observe(element));
  }

  // Keep navigation's active section in sync with scroll position.
  const sections = [...document.querySelectorAll("main section[id]")];
  const navAnchors = [...document.querySelectorAll(".nav-links a[href^='#']")];
  if ("IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navAnchors.forEach(anchor => {
            if (anchor.getAttribute("href") === `#${entry.target.id}`) anchor.classList.add("active");
            else anchor.classList.remove("active");
          });
        }
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    sections.forEach(section => navObserver.observe(section));
  }

  // Lightweight ambient particle field. It is decorative and respects reduced-motion settings.
  const canvas = document.getElementById("ambient-canvas");
  const ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;
  if (canvas && ctx && !reduceMotion) {
    let width = 0, height = 0, dpr = 1, particles = [], frame = 0;
    const makeParticles = () => {
      const count = Math.min(75, Math.floor((width * height) / 19000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width, y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.4 + 0.35
      }));
    };
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.7);
      width = window.innerWidth; height = window.innerHeight;
      canvas.width = Math.floor(width * dpr); canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      makeParticles();
    };
    const draw = () => {
      frame = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]; p.x += p.vx; p.y += p.vy;
        if (p.x < -5) p.x = width + 5; if (p.x > width + 5) p.x = -5;
        if (p.y < -5) p.y = height + 5; if (p.y > height + 5) p.y = -5;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(128,231,243,0.42)"; ctx.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j], dx = p.x - q.x, dy = p.y - q.y, distance = Math.hypot(dx, dy);
          if (distance < 105) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(128,231,243,${0.075 * (1 - distance / 105)})`;
            ctx.lineWidth = 0.7; ctx.stroke();
          }
        }
      }
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });
    draw();
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(frame);
      else draw();
    });
  }

  // Rotating focus line: short, human-readable topics rather than a fake live status.
  const role = document.getElementById("role-text");
  if (role && !reduceMotion) {
    const phrases = ["Rust & systems programming", "Linux and OS internals", "Python & automation", "Game engine concepts"];
    let index = 0;
    window.setInterval(() => {
      index = (index + 1) % phrases.length;
      role.animate([{ opacity: 0, transform: "translateY(5px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 320, easing: "ease-out" });
      role.textContent = phrases[index];
    }, 3200);
  }
})();
