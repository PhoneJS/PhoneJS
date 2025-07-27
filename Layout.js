javascript:(function () {
  const STORAGE_KEY = 'historico_elementos_pag';
  const DOMINIO = location.hostname;

  const statusExecucao = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  if (statusExecucao[DOMINIO]?.executado) {
    console.log('⚠️ Execução já feita nesse domínio.');
  }

  const oldOverlay = document.getElementById('floating-black-overlay');
  if (oldOverlay) oldOverlay.remove();

  if (!statusExecucao[DOMINIO]?.executado) {
    const overlay = document.createElement('div');
    overlay.id = 'floating-black-overlay';
    overlay.style = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background-color: #000; opacity: 1; z-index: 999999;
      display: flex; justify-content: center; align-items: center;
    `;
    overlay.innerHTML = `<div style="color:white;font-size:18px;font-family:sans-serif;text-align:center;">⏳ Analisando página...</div>`;
    document.body.appendChild(overlay);
  }

  const tamanhosAlvo = [
    { largura: 188, altura: 188, acao: 'ocultar' },
    { largura: 24, altura: 24, acao: 'ocultar' },
    { largura: 75, altura: 50, acao: 'ocultar' }
  ];

  const margemErro = 1;
  const elementosModificados = new Set();
  const historico = [];

  const acoes = {
    ocultar: el => el.style.setProperty('display', 'none', 'important'),
    centralizar: el => Object.assign(el.style, {
      position: 'fixed', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)', zIndex: '9999'
    }),
    ajustar: el => Object.assign(el.style, {
      width: 'auto', height: 'auto',
      maxWidth: '100vw', maxHeight: '100vh'
    }),
    destacar: el => el.style.setProperty('outline', '3px solid red', 'important')
  };

  function registrarHistorico(el, w, h, acao = 'nenhuma') {
    const key = `${el.tagName}|${el.id || ''}|${el.className || ''}|${w}x${h}`;
    if (elementosModificados.has(key)) return;

    elementosModificados.add(key);
    historico.push({
      tag: el.tagName,
      id: el.id || null,
      classes: el.className || null,
      largura: w,
      altura: h,
      acao: acao,
      hora: new Date().toLocaleString()
    });
  }

  function salvarHistoricoFinal() {
    const dados = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    dados[DOMINIO] = dados[DOMINIO] || {};
    dados[DOMINIO].executado = true;
    dados[DOMINIO].historico = dados[DOMINIO].historico || [];
    dados[DOMINIO].historico.push(...historico);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    console.log('✅ Histórico salvo:', historico.length, 'ações.');
  }

  function aplicarModificacoes() {
    const elementos = Array.from(document.querySelectorAll('body *'));
    let encontrou = false;

    elementos.forEach(el => {
      if (!(el.offsetWidth > 0 && el.offsetHeight > 0)) return;

      const rect = el.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);

      let acaoAplicada = 'nenhuma';

      tamanhosAlvo.forEach(tam => {
        const larguraMatch = Math.abs(w - tam.largura) <= margemErro;
        const alturaMatch = Math.abs(h - tam.altura) <= margemErro;

        if (larguraMatch && alturaMatch) {
          const acaoFunc = acoes[tam.acao] || acoes.destacar;
          try { acaoFunc(el); } catch {}
          try { if (el.id) acaoFunc(document.getElementById(el.id)); } catch {}
          try {
            const classes = el.className?.split(/\s+/).filter(Boolean);
            if (classes?.length) {
              classes.forEach(cls => {
                document.querySelectorAll('.' + cls).forEach(e => {
                  try { acaoFunc(e); } catch {}
                });
              });
            }
          } catch {}

          acaoAplicada = tam.acao;
          encontrou = true;
        }
      });

      if (acaoAplicada !== 'nenhuma') {
        registrarHistorico(el, w, h, acaoAplicada);
      }
    });

    if (encontrou) {
      const overlay = document.getElementById('floating-black-overlay');
      if (overlay) overlay.remove();
    }
  }

  // Inicia com aplicação imediata e continua monitorando
  function iniciarAnalise() {
    aplicarModificacoes();

    // Observer para alterações DOM
    const observer = new MutationObserver(() => aplicarModificacoes());
    observer.observe(document.body, { childList: true, subtree: true });

    // Aplicação periódica caso falhe algum observer
    setInterval(() => aplicarModificacoes(), 1500);

    // Salvamento regular de histórico
    setInterval(() => {
      if (historico.length > 0) {
        salvarHistoricoFinal();
      }
    }, 5000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarAnalise);
  } else {
    iniciarAnalise();
  }
})();