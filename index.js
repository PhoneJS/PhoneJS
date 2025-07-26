
javascript:(async () => {
  try {
    const showError = (t, m) => {
      let b = document.createElement("div");
      b.style = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;color:#000;padding:20px;box-shadow:0 0 10px rgba(0,0,0,0.5);border-radius:10px;z-index:99999;max-width:90%;text-align:center;font-family:sans-serif";
      b.innerHTML = `<h3 style="margin:0 0 10px;color:red;">${t}</h3><div>${m}</div>`;
      document.body.appendChild(b);
    };

    const base = "https://phonejs-8157f-default-rtdb.firebaseio.com/List";
    const now = new Date();
    const p = n => n.toString().padStart(2, "0");
    const getTimestamp = () =>
      p(now.getDate()) + p(now.getMonth() + 1) + now.getFullYear().toString().slice(-2) + p(now.getHours()) + p(now.getMinutes());

    const getIP = async () => {
      try {
        return (await (await fetch("https://api.ipify.org?format=json")).json()).ip;
      } catch (e) {
        showError("Erro ao obter IP", e.message || "Falha ao buscar IP público.");
      }
    };

    const get = async u => {
      try {
        return await (await fetch(u)).json();
      } catch (e) {
        showError("Erro de leitura", `Erro ao acessar ${u}: ${e.message}`);
      }
    };

    const set = async (u, v) => {
      try {
        await fetch(u, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(v),
        });
      } catch (e) {
        showError("Erro ao salvar", `Erro ao enviar para ${u}`);
      }
    };

    const ip = await getIP();
    if (!ip) return;

    const timeNow = getTimestamp();
    let numeroComIP = null;
    let urlParaRedirecionar = null;

    // Primeiro: tenta achar se o IP atual já está em algum número
    for (let n = 1; n <= 999; n++) {
      const path = `${base}/${n}`;
      const [savedIP, savedTMP, url] = await Promise.all([
        get(`${path}/IP.json`),
        get(`${path}/TMP.json`),
        get(`${path}/URL.json`)
      ]);

      if (url === null || url === "") break;

      if (savedIP === ip) {
        numeroComIP = n;
        if (timeNow > savedTMP) await set(`${path}/TMP.json`, timeNow);
        urlParaRedirecionar = url;
        break;
      }
    }

    // Se o IP não foi encontrado, procura um número com TMP expirado e sobrescreve o IP mesmo que já exista
    if (!numeroComIP) {
      for (let n = 1; n <= 999; n++) {
        const path = `${base}/${n}`;
        const [savedTMP, url] = await Promise.all([
          get(`${path}/TMP.json`),
          get(`${path}/URL.json`)
        ]);

        if (url === null || url === "") break;

        if (!savedTMP || timeNow > savedTMP) {
          await set(`${path}/IP.json`, ip);
          await set(`${path}/TMP.json`, timeNow);
          urlParaRedirecionar = url;
          break;
        }
      }
    }

    if (urlParaRedirecionar) location.href = urlParaRedirecionar;

  } catch (e) {
    showError("Erro inesperado", e.message || "Falha geral no script");
  }
})();