javascript:(function () {
  // Evita duplicação
  const oldOverlay = document.getElementById('floating-black-overlay');
  if (oldOverlay) oldOverlay.remove();

  // Criação da tela preta flutuante
  const overlay = document.createElement('div');
  overlay.id = 'floating-black-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.backgroundColor = 'black';
  overlay.style.opacity = '0.9';
  overlay.style.zIndex = '999999';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.innerHTML = `<div style="color:white;font-size:18px;font-family:sans-serif;text-align:center;">⏳ Modificando página...</div>`;
  document.body.appendChild(overlay);

  // Tamanhos e ações
  const tamanhosAlvo = [
    { largura: 188, altura: 188, acao: 'ocultar' },
    { largura: 24, altura: 24, acao: 'ocultar' },
    { largura: 75, altura: 50, acao: 'ocultar' }
  ];
  const margemErro = 1;
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
    destacar: el => {
      el.style.outline = '3px solid red';
      el.style.transition = 'outline 0.3s';
    }
  };

  let elementosModificados = 0;

  function aplicarModificacoes() {
    let totalAfetados = 0;
    const elementos = Array.from(document.querySelectorAll('body *'));

    elementos.forEach(el => {
      if (!(el.offsetWidth > 0 && el.offsetHeight > 0)) return;

      const rect = el.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);

      tamanhosAlvo.forEach(tam => {
        const larguraMatch = Math.abs(w - tam.largura) <= margemErro;
        const alturaMatch = Math.abs(h - tam.altura) <= margemErro;

        if (larguraMatch && alturaMatch) {
          const acaoFunc = acoes[tam.acao] || acoes.destacar;
          acaoFunc(el);
          totalAfetados++;
        }
      });
    });

    if (totalAfetados > 0 && elementosModificados === 0) {
      elementosModificados = totalAfetados;
      overlay.remove(); // Remove a tela preta
    }
  }

  // Iniciar observador e loop
  const iniciar = () => {
    aplicarModificacoes();

    const observer = new MutationObserver(() => aplicarModificacoes());
    observer.observe(document.body, { childList: true, subtree: true });

    const intervalo = setInterval(() => {
      aplicarModificacoes();
      if (elementosModificados > 0) clearInterval(intervalo);
    }, 2000);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();