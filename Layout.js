(function () {
  const HISTORICO_ALVO = "491x48,";

  const tamanhosAlvo = HISTORICO_ALVO.split(',').map(t => {
    const [w, h] = t.split('x').map(n => parseInt(n.trim()));
    return { largura: w, altura: h };
  });

  const vistos = new Set();
  const elementosModificados = [];

  function getClassList(el) {
    if (!el) return [];
    try {
      if (typeof el.className === 'string') {
        return el.className.trim().split(/\s+/);
      } else if (typeof el.className === 'object' && el.className.baseVal) {
        return el.className.baseVal.trim().split(/\s+/);
      }
    } catch (e) {}
    return [];
  }

  function reduzirElemento(el) {
    // Reduz visualmente para 1px sem ocultar
    el.style.setProperty('width', '1px', 'important');
    el.style.setProperty('height', '1px', 'important');
    el.style.setProperty('overflow', 'hidden', 'important');
    el.style.setProperty('min-width', '1px', 'important');
    el.style.setProperty('min-height', '1px', 'important');
    el.style.setProperty('max-width', '1px', 'important');
    el.style.setProperty('max-height', '1px', 'important');
    el.style.setProperty('display', 'block', 'important'); // Força exibição controlada

    // Caso seja SVG
    if (el.tagName.toLowerCase() === 'svg') {
      el.setAttribute('width', '1');
      el.setAttribute('height', '1');
    }
  }

  document.querySelectorAll('*').forEach(el => {
    const rect = el.getBoundingClientRect();
    const largura = Math.round(rect.width);
    const altura = Math.round(rect.height);
    const area = largura * altura;

    if (area < 50) return;

    const match = tamanhosAlvo.some(t => t.largura === largura && t.altura === altura);
    if (!match) return;

    const id = el.id || '';
    const classes = getClassList(el);
    const chave = `${el.tagName}::${id || classes.join('.') || 'noid'}::${largura}x${altura}`;
    if (vistos.has(chave)) return;
    vistos.add(chave);

    // Primeiro tenta por ID
    if (id) {
      const alvo = document.getElementById(id);
      if (alvo) {
        reduzirElemento(alvo);
        elementosModificados.push(`#${id} (${largura}x${altura})`);
        return;
      }
    }

    // Depois tenta por classes
    for (const cls of classes) {
      const candidatos = document.getElementsByClassName(cls);
      if (candidatos.length > 0) {
        for (const alvo of candidatos) {
          reduzirElemento(alvo);
        }
        elementosModificados.push(`.${cls} (${largura}x${altura})`);
        return;
      }
    }

    // Se nada deu certo, aplica direto
    reduzirElemento(el);
    elementosModificados.push(`${el.tagName} (${largura}x${altura})`);
  });

  alert(`🧠 ${elementosModificados.length} elementos reduzidos para 1px!\n\nExemplos:\n` + elementosModificados.slice(0, 5).join('\n'));
})();










(function () {
  const HISTORICO_ALVO = "480x480";

  const tamanhosAlvo = HISTORICO_ALVO.split(',').map(t => {
    const [w, h] = t.split('x').map(n => parseInt(n.trim()));
    return { largura: w, altura: h };
  });

  const vistos = new Set();
  const elementosModificados = [];

  function getClassList(el) {
    if (!el) return [];
    try {
      if (typeof el.className === 'string') {
        return el.className.trim().split(/\s+/);
      } else if (typeof el.className === 'object' && el.className.baseVal) {
        return el.className.baseVal.trim().split(/\s+/);
      }
    } catch (e) {}
    return [];
  }

  function ajustarElemento(el) {
    // Em vez de reduzir para 1px fixo, ajusta o estilo para layout fluido e invisível visualmente
    el.style.setProperty('width', '0', 'important');
    el.style.setProperty('height', '0', 'important');
    el.style.setProperty('padding', '0', 'important');
    el.style.setProperty('margin', '0', 'important');
    el.style.setProperty('border', 'none', 'important');
    el.style.setProperty('opacity', '0', 'important'); // invisível sem quebrar layout
    el.style.setProperty('visibility', 'hidden', 'important');
    el.style.setProperty('display', 'inline-block', 'important');
    el.style.setProperty('overflow', 'hidden', 'important');

    // Caso seja SVG
    if (el.tagName.toLowerCase() === 'svg') {
      el.setAttribute('width', '0');
      el.setAttribute('height', '0');
    }
  }

  document.querySelectorAll('*').forEach(el => {
    const rect = el.getBoundingClientRect();
    const largura = Math.round(rect.width);
    const altura = Math.round(rect.height);
    const area = largura * altura;

    if (area < 50) return;

    const match = tamanhosAlvo.some(t => t.largura === largura && t.altura === altura);
    if (!match) return;

    const id = el.id || '';
    const classes = getClassList(el);
    const chave = `${el.tagName}::${id || classes.join('.') || 'noid'}::${largura}x${altura}`;
    if (vistos.has(chave)) return;
    vistos.add(chave);

    // Primeiro tenta por ID
    if (id) {
      const alvo = document.getElementById(id);
      if (alvo) {
        ajustarElemento(alvo);
        elementosModificados.push(`#${id} (${largura}x${altura})`);
        return;
      }
    }

    // Depois tenta por classes
    for (const cls of classes) {
      const candidatos = document.getElementsByClassName(cls);
      if (candidatos.length > 0) {
        for (const alvo of candidatos) {
          ajustarElemento(alvo);
        }
        elementosModificados.push(`.${cls} (${largura}x${altura})`);
        return;
      }
    }

    // Se nada deu certo, aplica direto
    ajustarElemento(el);
    elementosModificados.push(`${el.tagName} (${largura}x${altura})`);
  });

  alert(`🧠 ${elementosModificados.length} elementos ajustados!\n\nExemplos:\n` + elementosModificados.slice(0, 5).join('\n'));
})();