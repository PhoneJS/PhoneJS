javascript:(function () {
  // Remove antigos menus
  const oldMenu = document.getElementById('debug-menu');
  if (oldMenu) oldMenu.remove();
  const oldToggle = document.getElementById('menu-toggle');
  if (oldToggle) oldToggle.remove();

  // Tamanhos e ações automáticas
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

  // Criar painel invisível (log oculto)
  const menu = document.createElement('div');
  menu.id = 'debug-menu';
  Object.assign(menu.style, {
    position: 'fixed', top: '10px', right: '10px',
    width: '90vw', maxWidth: '300px', maxHeight: '80vh',
    background: 'rgba(255,255,255,0.95)', color: 'black',
    padding: '10px', fontSize: '12px', overflowY: 'auto',
    borderRadius: '8px', boxShadow: '0 0 10px gray',
    backdropFilter: 'blur(4px)', zIndex: '99999',
    display: 'none' // ← invisível por padrão
  });
  menu.innerHTML = '<b>🧠 Elementos Modificados</b><br><br>';

  // Verificação automática
  const seen = new Set();
  const elems = Array.from(document.body.getElementsByTagName('*'));
  let count = 1;
  elems.forEach(el => {
    const rect = el.getBoundingClientRect();
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    const area = w * h;
    if (area < 100) return;

    const key = el.tagName + '::' + (el.id || '') + '::' + w + 'x' + h;
    if (seen.has(key)) return;
    seen.add(key);

    // Verifica se combina com algum tamanho alvo
    let acaoAplicada = null;
    for (const tam of tamanhosAlvo) {
      const matchL = Math.abs(w - tam.largura) <= margemErro;
      const matchA = Math.abs(h - tam.altura) <= margemErro;
      if (matchL && matchA) {
        (acoes[tam.acao] || acoes.destacar)(el);
        acaoAplicada = tam.acao;
        break;
      }
    }

    // Apenas registra se foi modificável
    if (acaoAplicada) {
      const item = document.createElement('div');
      item.style.marginBottom = '8px';
      item.style.borderBottom = '1px solid #ccc';
      item.innerHTML = `<b>#${count++}</b> - Tag: ${el.tagName} ${el.id ? `#${el.id}` : '(sem id)'} [${w}×${h}] → <b>${acaoAplicada}</b>`;
      menu.appendChild(item);
    }
  });

  // Adiciona painel invisível (log técnico)
  document.body.appendChild(menu);

  // O menu não será exibido ao usuário, mas o log fica no DOM (caso deseje inspecionar depois)
})();