(function () {
  // Remove menu anterior se existir
  const oldBox = document.getElementById('loading-float-box');
  if (oldBox) oldBox.remove();

  // Criação do menu flutuante (substitui tela preta)
  const floatBox = document.createElement('div');
  floatBox.id = 'loading-float-box';
  floatBox.style.position = 'fixed';
  floatBox.style.bottom = '20px';
  floatBox.style.right = '20px';
  floatBox.style.width = '250px';
  floatBox.style.background = 'black';
  floatBox.style.color = 'white';
  floatBox.style.padding = '15px';
  floatBox.style.borderRadius = '10px';
  floatBox.style.fontSize = '13px';
  floatBox.style.zIndex = '9999999';
  floatBox.style.boxShadow = '0 0 15px rgba(0,0,0,0.5)';
  floatBox.style.backdropFilter = 'blur(3px)';
  floatBox.innerHTML = `
    <div style="font-size:16px;margin-bottom:8px;">🔧 Modificando Página...</div>
    <div id="status-loading" style="font-size:12px;opacity:0.7;">Procurando elementos-alvo...</div>
    <button id="close-float" style="margin-top:10px;background:red;color:white;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;width:100%;">Fechar</button>
  `;
  document.body.appendChild(floatBox);

  document.getElementById('close-float').onclick = () => floatBox.remove();

  const updateStatus = msg => {
    const status = document.getElementById('status-loading');
    if (status) status.innerText = msg;
  };

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

    updateStatus(`✅ ${totalAfetados} elemento(s) modificados`);
  }

  // Iniciar com verificação contínua + observador
  const iniciar = () => {
    aplicarModificacoes();

    const observer = new MutationObserver(() => {
      aplicarModificacoes();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setInterval(aplicarModificacoes, 2500);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();