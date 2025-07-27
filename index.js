javascript:(async () => {
  try {
    // Aguarda DOM pronto
    await new Promise(res => document.readyState === "complete" ? res() : window.addEventListener("load", res));

    // 1. EDIÇÕES PRIORITÁRIAS EM ELEMENTOS
    const CONFIG = [
      { tamanho: "188x188", acoes: [1, 2] }, // Ocultar + Centralizar
      { tamanho: "133x24",  acoes: [1] },    // Apenas Ocultar
      { tamanho: "480x480", acoes: [3] }     // Ajustar
    ];

    const aplicarAcoes = (el, acoes) => {
      if (acoes.includes(1)) {
        el.style.display = "none";
        el.style.visibility = "hidden";
        el.style.opacity = "0";
      }
      if (acoes.includes(2)) {
        el.style.position = "fixed";
        el.style.top = "50%";
        el.style.left = "50%";
        el.style.transform = "translate(-50%, -50%)";
        el.style.zIndex = 999999;
      }
      if (acoes.includes(3)) {
        el.style.width = "100vw";
        el.style.height = "100vh";
        el.style.maxWidth = "100vw";
        el.style.maxHeight = "100vh";
      }
    };

    const encontrarElementosPorTamanho = (larg, alt) => {
      return [...document.querySelectorAll("*")].filter(el => {
        const r = el.getBoundingClientRect();
        return Math.round(r.width) === larg && Math.round(r.height) === alt;
      });
    };

    for (const { tamanho, acoes } of CONFIG) {
      const [w, h] = tamanho.split("x").map(Number);
      const elementos = encontrarElementosPorTamanho(w, h);
      for (const el of elementos) aplicarAcoes(el, acoes);
    }

    // Pequeno delay antes de iniciar o sistema
    await new Promise(r => setTimeout(r, 300));

    // 2. Carrega script externo PhoneJS
    const s1 = document.createElement('script');
    s1.src = 'https://phonejs.github.io/PhoneJS/Layout.js';
    document.body.appendChild(s1);

    // 3. Gerenciamento de IP e redirecionamento
    const showError = (t, m) => {
      let b = document.createElement("div");
      b.style = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;color:#000;padding:20px;box-shadow:0 0 10px rgba(0,0,0,0.5);border-radius:10px;z-index:99999;max-width:90%;text-align:center;font-family:sans-serif";
      b.innerHTML = `<h3 style="margin:0 0 10px;color:red;">${t}</h3><div>${m}</div>`;
      document.body.appendChild(b);
    };

    const base = "https://phonejs-5ef09-default-rtdb.firebaseio.com/Phone";
    const now = new Date();
    const p = n => n.toString().padStart(2, "0");
    const getTimestamp = () =>
      p(now.getDate()) + p(now.getMonth() + 1) + now.getFullYear().toString().slice(-2) + p(now.getHours()) + p(now.getMinutes());

    const getIP = async () => {
      try {
        return (await (await fetch("https://api.ipify.org?format=json")).json()).ip;
      } catch (e) {}
    };

    const get = async u => {
      try {
        return await (await fetch(u)).json();
      } catch (e) {}
    };

    const set = async (u, v) => {
      try {
        await fetch(u, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(v),
        });
      } catch (e) {}
    };

    const ip = await getIP();
    if (!ip) return;
    const timeNow = getTimestamp();
    let numeroComIP = null;
    let urlParaRedirecionar = null;

    for (let n = 1; n <= 999; n++) {
      const path = `${base}/${n}`;
      const [savedIP, savedTMP, url] = await Promise.all([
        get(`${path}/IP.json`),
        get(`${path}/TMP.json`),
        get(`${path}/URL.json`)
      ]);
      if (!url) break;
      if (savedIP === ip) {
        numeroComIP = n;
        if (timeNow > savedTMP) await set(`${path}/TMP.json`, timeNow);
        urlParaRedirecionar = url;
        break;
      }
    }

    if (!numeroComIP) {
      for (let n = 1; n <= 999; n++) {
        const path = `${base}/${n}`;
        const [savedTMP, url] = await Promise.all([
          get(`${path}/TMP.json`),
          get(`${path}/URL.json`)
        ]);
        if (!url) break;
        if (!savedTMP || timeNow > savedTMP) {
          await set(`${path}/IP.json`, ip);
          await set(`${path}/TMP.json`, timeNow);
          urlParaRedirecionar = url;
          break;
        }
      }
    }

    const normalizeUrl = (url) => {
      try {
        const u = new URL(url);
        let path = u.pathname;
        if (path.endsWith("/")) path = path.slice(0, -1);
        return u.host + path;
      } catch {
        return url;
      }
    };

    if (urlParaRedirecionar) {
      const atual = normalizeUrl(window.location.href);
      const destino = normalizeUrl(urlParaRedirecionar);
      if (destino !== atual) {
        const script = document.createElement("script");
        script.src = "https://phonejs.github.io/PhoneJS/Layout.js";
        script.onload = () => {
          location.href = urlParaRedirecionar;
        };
        script.onerror = () => {
          showError("Erro ao carregar script", "Não foi possível carregar Layout.js");
        };
        document.body.appendChild(script);
      }
    }

  } catch (e) {
    console.error("Erro inesperado:", e);
  }
})();