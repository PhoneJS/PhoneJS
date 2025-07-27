javascript:(function () {
  const oldOverlay = document.getElementById('floating-black-overlay');
  if (oldOverlay) oldOverlay.remove();

  // Criar tela preta full
  const overlay = document.createElement('div');
  overlay.id = 'floating-black-overlay';
  Object.assign(overlay.style, {
    position: 'fixed',
    top: '0', left: '0',
    width: '100vw', height: '100vh',
    backgroundColor: 'black',
    opacity: '0.95',
    zIndex: '999999',
  });
  document.body.appendChild(overlay);

  // Tamanhos alvo e ações automáticas
  const tamanhosAlvo = [
    { largura: 188, altura: 188, acao: 'ocultar' },
    { largura: 24, altura: 24, acao: 'ocultar' },
    { largura: 75, altura: 50, acao: 'ocultar' }
  ];
  const margemErro = 1;
  const acoes = {
    ocultar: el => el.style.setProperty('display', 'none', 'important'),
    centralizar: el => Object.assign(el.style, {
      position: 'fixed',
      top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: '9999'
    }),
    ajustar: el => Object.assign(el.style, {
      width: 'auto', height: 'auto',
      maxWidth: '100vw', maxHeight: '100vh'
    }),
    destacar: el => {
      el.style.outline = '3px solid red';
      el.style.transition = 'outline 0.3s';
    }
  };

  // Processa elementos da página
  function processarElementos() {
    const elementos = Array.from(document.querySelectorAll('body *'));
    let modificouAlgum = false;

    elementos.forEach(el => {
      if (!(el.offsetWidth > 0 && el.offsetHeight > 0)) return;

      const rect = el.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);

      for (const tam of tamanhosAlvo) {
        const matchL = Math.abs(w - tam.largura) <= margemErro;
        const matchA = Math.abs(h - tam.altura) <= margemErro;
        if (matchL && matchA) {
          const acaoFunc = acoes[tam.acao] || (() => {});
          acaoFunc(el);
          modificouAlgum = true;
          break;
        }
      }
    });

    return modificouAlgum;
  }

  let tentativas = 0;
  const maxTentativas = 10;

  const intervalo = setInterval(() => {
    const feito = processarElementos();
    tentativas++;

    if (feito || tentativas >= maxTentativas) {
      clearInterval(intervalo);
      overlay.remove(); // Remove a tela preta ao finalizar
    }
  }, 1000);
})();