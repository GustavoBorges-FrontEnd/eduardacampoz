/* =========================================================
   campoz.co — script.js (JS puro, sem dependências)
   ========================================================= */
(() => {
  "use strict";

  // ---------- CONFIG ----------
  const WHATSAPP = "5521968502898"; // número usado pelo formulário (DDI + DDD + número)
  // "auto"   = o vídeo roda sozinho ao abrir, vai até o fim e volta de trás
  //            para frente, em loop infinito (usa assets/hero-loop.mp4)
  // "scroll" = o vídeo avança/volta conforme a rolagem (versão anterior)
  const MODE = "auto";
  const VIDEO_END = 0.8;            // (modo scroll) % do scroll em que o vídeo termina
  const SMOOTH = 0.16;              // (modo scroll) suavização

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* =======================================================
     1. HERO — vídeo + transição para a seção 2
     ======================================================= */
  const hero = $(".hero");
  const video = $("#heroVideo");
  const media = $("#heroMedia");
  const content = $("#heroContent");
  const curtain = $("#heroCurtain");
  const nav = $("#nav");

  document.documentElement.classList.add(`hero-${MODE}`);

  let duration = 0;
  const setDuration = () => { if (video.duration && isFinite(video.duration)) duration = video.duration; };
  video.addEventListener("loadedmetadata", setDuration);
  setDuration();

  function heroProgress() {
    const rect = hero.getBoundingClientRect();
    const total = hero.offsetHeight - window.innerHeight;
    return total > 0 ? clamp(-rect.top / total) : 0;
  }

  // cortina: no modo auto ocupa todo o scroll do hero; no modo scroll só o final
  function curtainProgress(p) {
    if (MODE === "auto") return clamp(p);
    return clamp((p - VIDEO_END - 0.02) / (1 - VIDEO_END - 0.02));
  }

  let targetTime = 0;
  let currentTime = 0;

  function updateHero() {
    const p = heroProgress();
    const c = curtainProgress(p);
    const ease = 1 - Math.pow(1 - c, 3);

    if (MODE === "scroll" && duration) targetTime = clamp(p / VIDEO_END) * (duration - 0.05);

    curtain.style.transform = `translateY(${(1 - ease) * 100}%)`;
    curtain.style.borderRadius = `${(1 - ease) * 48}px ${(1 - ease) * 48}px 0 0`;
    media.style.transform = `scale(${1 - ease * 0.1})`;
    media.style.filter = `brightness(${1 - ease * 0.6})`;
    content.style.opacity = String(1 - clamp(c * 2.2));
    content.style.transform = `translateY(${-c * 80}px)`;

    nav.classList.toggle("is-solid", p >= 1);
  }
  window.addEventListener("scroll", updateHero, { passive: true });
  window.addEventListener("resize", updateHero);
  updateHero();

  // Celular em pé usa a versão vertical do vídeo (logo inteira, sem cortes)
  const portraitMQ = window.matchMedia("(orientation: portrait) and (max-width: 900px)");
  const SOURCES = {
    auto:   { desktop: "assets/hero-loop.mp4", mobile: "assets/hero-loop-mobile.mp4" },
    scroll: { desktop: "assets/hero.mp4",      mobile: "assets/hero-mobile.mp4" },
    poster: { desktop: "assets/hero-poster.jpg", mobile: "assets/hero-poster-mobile.jpg" }
  };
  const pickSources = () => {
    const k = portraitMQ.matches ? "mobile" : "desktop";
    video.poster = SOURCES.poster[k];
    video.src = SOURCES[MODE][k];
  };
  pickSources();

  if (MODE === "auto") {
    // ---- loop infinito: o vídeo vai até o fim e volta de trás para frente ----
    // hero-loop.mp4 já contém o vídeo normal + o mesmo vídeo invertido,
    // então o loop nativo fica perfeitamente liso (sem engasgos).
    video.loop = true;

    const play = () => { const pr = video.play(); if (pr && pr.catch) pr.catch(() => {}); };

    // girou o celular / redimensionou → troca para a versão certa do vídeo
    portraitMQ.addEventListener("change", () => { pickSources(); play(); });

    // pausa quando o hero sai da tela (economiza bateria) e volta a tocar ao reaparecer
    new IntersectionObserver(entries => {
      entries.forEach(e => (e.isIntersecting ? play() : video.pause()));
    }, { threshold: 0.05 }).observe(hero.querySelector(".hero__stage"));

    // se o navegador bloquear o autoplay, começa no primeiro toque/clique
    window.addEventListener("touchstart", play, { once: true, passive: true });
    window.addEventListener("click", play, { once: true });
    play();
  } else {
    // ---- modo scroll: o vídeo acompanha a rolagem (usa assets/hero.mp4) ----
    if (location.protocol.startsWith("http") && window.fetch) {
      fetch(video.currentSrc || video.src)
        .then(r => (r.ok ? r.blob() : Promise.reject()))
        .then(blob => {
          const t = video.currentTime;
          video.src = URL.createObjectURL(blob);
          video.addEventListener("loadedmetadata", () => { video.currentTime = t; }, { once: true });
        })
        .catch(() => {});
    }
    const unlock = () => {
      const pr = video.play();
      if (pr && pr.then) pr.then(() => video.pause()).catch(() => {});
      window.removeEventListener("touchstart", unlock);
    };
    window.addEventListener("touchstart", unlock, { passive: true });
    video.pause();

    const tick = () => {
      if (duration) {
        const diff = targetTime - currentTime;
        currentTime = Math.abs(diff) < 0.001 ? targetTime : currentTime + diff * SMOOTH;
        if (Math.abs(video.currentTime - currentTime) > 0.008 && !video.seeking) {
          if (typeof video.fastSeek === "function") video.fastSeek(currentTime);
          else video.currentTime = currentTime;
        }
      }
      requestAnimationFrame(tick);
    };
    updateHero();
    requestAnimationFrame(tick);
  }

  /* =======================================================
     Loops infinitos (prints e colunas do portfólio)
     Duplica o conteúdo para o translate de -50% fechar o loop sem emenda
     ======================================================= */
  function duplicate(track) {
    $$(":scope > *", track).forEach(el => {
      const clone = el.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      $$("img", clone).forEach(i => (i.alt = ""));
      if (clone.tagName === "IMG") clone.alt = "";
      track.appendChild(clone);
    });
  }

  const printsTrack = $(".prints__track");
  if (printsTrack) {
    const n = printsTrack.children.length;
    duplicate(printsTrack);
    printsTrack.style.setProperty("--prints-speed", `${n * 7}s`);
  }

  $$(".col__track").forEach((track, i) => {
    const n = track.children.length;
    duplicate(track);
    track.style.setProperty("--col-speed", `${n * (8 + i * 1.5)}s`);
  });

  /* =======================================================
     Processo — linha do tempo que fica rosa com o scroll
     ======================================================= */
  const timeline = $("#timeline");
  if (timeline) {
    const fill = $(".timeline__fill", timeline);
    const steps = $$(".step", timeline);
    const onTimeline = () => {
      const r = timeline.getBoundingClientRect();
      const mid = window.innerHeight * 0.6;               // ponto de leitura: 60% da tela
      const p = clamp((mid - r.top) / r.height);
      fill.style.transform = `scaleY(${p})`;
      steps.forEach(st => {
        const dot = $(".step__dot", st).getBoundingClientRect();
        st.classList.toggle("is-active", dot.top + dot.height / 2 <= mid);
      });
    };
    window.addEventListener("scroll", onTimeline, { passive: true });
    window.addEventListener("resize", onTimeline);
    onTimeline();
  }

  /* =======================================================
     Reveal ao rolar
     ======================================================= */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
  $$(".reveal").forEach(el => io.observe(el));

  /* =======================================================
     Parallax suave na foto da CEO
     ======================================================= */
  const ceoImg = $(".about__photo img");
  if (ceoImg) {
    const onParallax = () => {
      const r = ceoImg.parentElement.getBoundingClientRect();
      const p = clamp((window.innerHeight - r.top) / (window.innerHeight + r.height));
      ceoImg.style.transform = `scale(1.12) translateY(${(p - 0.5) * -8}%)`;
    };
    window.addEventListener("scroll", onParallax, { passive: true });
    onParallax();
  }

  /* =======================================================
     FAQ — acordeão (um aberto por vez)
     ======================================================= */
  $$(".faq__q").forEach(btn => {
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") === "true";
      $$(".faq__q").forEach(b => b.setAttribute("aria-expanded", "false"));
      btn.setAttribute("aria-expanded", String(!open));
    });
  });

  /* =======================================================
     Menu mobile
     ======================================================= */
  const burger = $("#burger");
  const menu = $("#mobileMenu");
  const setMenu = open => {
    burger.setAttribute("aria-expanded", String(open));
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", String(!open));
    document.body.style.overflow = open ? "hidden" : "";
  };
  burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  $$("a", menu).forEach(a => a.addEventListener("click", () => setMenu(false)));

  /* =======================================================
     Formulário → abre o WhatsApp com a mensagem pronta
     ======================================================= */
  const form = $("#contactForm");
  const note = $("#formNote");
  form.addEventListener("submit", e => {
    e.preventDefault();
    const data = new FormData(form);
    const nome = (data.get("nome") || "").trim();
    const field = $("#f-nome").parentElement;
    if (!nome) {
      field.classList.add("is-error");
      note.textContent = "Conta pra gente seu nome 💗";
      $("#f-nome").focus();
      return;
    }
    field.classList.remove("is-error");

    const servicos = data.getAll("servico");
    const marca = (data.get("marca") || "").trim();
    const msg = (data.get("mensagem") || "").trim();

    const texto = [
      `Oi, campoz.co! Me chamo ${nome}.`,
      marca && `Minha marca: ${marca}.`,
      servicos.length && `Tenho interesse em: ${servicos.join(", ")}.`,
      msg && `\n${msg}`
    ].filter(Boolean).join(" ");

    const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank", "noopener");
    note.innerHTML = 'Abrindo o WhatsApp com a sua mensagem… <a href="' + url + '" target="_blank" rel="noopener">Clique aqui</a> se não abrir.';
    form.reset();
  });

  /* ano no rodapé */
  $("#year").textContent = new Date().getFullYear();
})();
