javascript:(function () {
  const STORAGE_KEY = 'historico_elementos_pag';
  const oldOverlay = document.getElementById('floating-black-overlay');
  if (oldOverlay) oldOverlay.remove();

  const overlay = document.createElement('div');
  overlay.id = 'floating-black-overlay';
  overlay.style = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background-color: black; opacity: 0.9; z-index: 999999;
    display: flex; justify-content: center; align-items: center;
  `;
  overlay.innerHTML = `<div style="color:white;font-size:18px;font-family:sans-serif;text-align:center;">⏳ Analisando página...</div>`;
  document.body.appendChild(overlay);

  const tamanhosAlvo = [
    { largura: 188, altura: 188, acao: 'ocultar' },
    { largura: 188, altura: 188, acao: 'ocultar' },
    { largura: 188, altura: 188, acao: 'ocultar' }
  ];

  const margemErro = 1;
  const historico = [];
  let tentativas = 0;
  let elementosModificados = 0;
  const maxTentativas = 10;

  const acoes = {
    ocultar: el => {
      el.style.setProperty('display', 'none', 'important');
    },
    centralizar: el => {
      Object.assign(el.style, {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: '9999'
      });
    },
    ajustar: el => {
      Object.assign(el.style, {
        width: 'auto',
        height: 'auto',
        maxWidth: '100vw',
        maxHeight: '100vh'
      });
    },
    destacar: el => {
      el.style.setProperty('outline', '3px solid red', 'important');
      el.style.transition = 'outline 0.3s';
    }
  };

  function registrarHistorico(el, w, h, acao = 'nenhuma') {
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

  function salvarHistorico() {
    const dominio = location.hostname;
    const dados = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    dados[dominio] = dados[dominio] || [];
    dados[dominio].push(...historico);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    console.log('🔍 Histórico salvo com', historico.length, 'entradas.');
  }

  function aplicarModificacoes() {
    let totalAfetados = 0;
    const elementos = Array.from(document.querySelectorAll('body *'));

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

          // Tenta várias abordagens para modificar
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
          totalAfetados++;
        }
      });

      registrarHistorico(el, w, h, acaoAplicada);
    });

    if (totalAfetados > 0 && elementosModificados === 0) {
      elementosModificados = totalAfetados;
      if (observer) observer.disconnect();
      salvarHistorico();
      overlay.remove();
    }

    tentativas++;
    if (tentativas >= maxTentativas && elementosModificados === 0) {
      if (observer) observer.disconnect();
      salvarHistorico();
      overlay.remove();
    }
  }

  let observer;

  const iniciar = () => {
    aplicarModificacoes();
    observer = new MutationObserver(() => aplicarModificacoes());
    observer.observe(document.body, { childList: true, subtree: true });

    const intervalo = setInterval(() => {
      aplicarModificacoes();
      if (elementosModificados > 0 || tentativas >= maxTentativas) {
        clearInterval(intervalo);
      }
    }, 2000);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();