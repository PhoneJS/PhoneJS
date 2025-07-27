(function () {
  const dominioAtual = location.hostname;
  const chaveStorage = 'modificacaoAplicada_' + dominioAtual;

  if (localStorage.getItem(chaveStorage)) {
    console.log('✅ Modificação já aplicada neste domínio. Ignorando...');
    return;
  }

  // Cria a tela preta de carregamento
  const overlay = document.createElement('div');
  overlay.id = 'tela-preta-carregando';
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: black; color: white;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; z-index: 999999;
    flex-direction: column; transition: opacity 0.5s ease;
  `;
  overlay.innerHTML = `<div>🔧 Carregando modificação...</div><div style="font-size:14px;margin-top:10px;" id="status-text">Aguardando elementos...</div>`;
  document.body.appendChild(overlay);

  const statusText = () => document.getElementById('status-text');

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

  function tentarModificar() {
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

    if (totalAfetados > 0) {
      console.log(`✅ ${totalAfetados} elemento(s) modificados.`);
      localStorage.setItem(chaveStorage, 'true');

      // Remove a tela preta com suavidade
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 500);
    } else {
      console.log('⏳ Nenhum elemento correspondente encontrado ainda...');
      if (statusText()) statusText().innerText = 'Nenhum elemento encontrado... tentando novamente';

      // Tenta de novo em 1 segundo
      setTimeout(tentarModificar, 1000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(tentarModificar, 1000);
    });
  } else {
    setTimeout(tentarModificar, 1000);
  }
})();