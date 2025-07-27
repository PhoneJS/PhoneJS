
(function () {
  // Lista de tamanhos alvo e a ação que será aplicada
  const tamanhosAlvo = [
    { largura: 188, altura: 188, acao: 'ocultar' },
    { largura: 25, altura: 24, acao: 'ocultar' },
    { largura: 48, altura: 48, acao: 'ocultar' },
    // Adicione outros tamanhos e ações aqui
  ];

  const margemErro = 1; // tolerância em pixels para evitar erro de arredondamento
  const elementos = Array.from(document.querySelectorAll('body *'));

  const acoes = {
    ocultar: el => el.style.display = 'none',

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
      el.style.outline = '3px solid red';
      el.style.transition = 'outline 0.3s';
    }
  };

  // Função que verifica e aplica ação nos elementos
  function aplicarAcoesAutomatica() {
    let totalAfetados = 0;

    elementos.forEach(el => {
      if (!el.offsetParent) return; // ignora elementos invisíveis

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

    console.log(`✅ ${totalAfetados} elemento(s) modificados automaticamente.`);
  }

  // Aguarda a página carregar completamente
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', aplicarAcoesAutomatica);
  } else {
    aplicarAcoesAutomatica();
  }
})();
