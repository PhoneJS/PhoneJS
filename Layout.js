(function () {
  const HISTORICO_ALVO = "188x188,133x24,97x24,24x24,22x22";

  const tamanhosAlvo = HISTORICO_ALVO.split(',').map(t => {
    const [w, h] = t.split('x').map(n => parseInt(n.trim()));
    return { largura: w, altura: h };
  });

  const classesDetectadas = new Set();

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

  // Etapa 1: Detectar classes de elementos com tamanho alvo
  document.querySelectorAll('*').forEach(el => {
    const rect = el.getBoundingClientRect();
    const largura = Math.round(rect.width);
    const altura = Math.round(rect.height);

    const corresponde = tamanhosAlvo.some(t => t.largura === largura && t.altura === altura);
    if (corresponde) {
      const classes = getClassList(el);
      classes.forEach(cls => classesDetectadas.add(cls));
    }
  });

  // Etapa 2: Forçar edição de estilo para todos os que têm classes detectadas
  document.querySelectorAll('*').forEach(el => {
    const classes = getClassList(el);
    const match = classes.some(cls => classesDetectadas.has(cls));

    if (match) {
      // Estilo visual
      el.style.setProperty('width', '1px', 'important');
      el.style.setProperty('height', '1px', 'important');
      el.style.setProperty('overflow', 'hidden', 'important');
      el.style.setProperty('min-width', '1px', 'important');
      el.style.setProperty('min-height', '1px', 'important');
      el.style.setProperty('max-width', '1px', 'important');
      el.style.setProperty('max-height', '1px', 'important');
      el.style.setProperty('display', 'block', 'important'); // força modo redimensionável

      // Ajuste direto no SVG (se aplicável)
      if (el.tagName.toLowerCase() === 'svg') {
        el.setAttribute('width', '1');
        el.setAttribute('height', '1');
      }
    }
  });

  alert('✅ Elementos com classes detectadas foram forçados a 1px!');
})();





(function () {
  const CLASSE_ALVO = "[object SVGAnimatedString]"; // ⬅️ coloque aqui o nome real da classe

  document.querySelectorAll(`svg.${CLASSE_ALVO}`).forEach(svg => {
    svg.style.setProperty('width', '1px', 'important');
    svg.style.setProperty('height', '1px', 'important');
    svg.style.setProperty('overflow', 'hidden', 'important');
    svg.style.setProperty('display', 'block', 'important');
    svg.style.setProperty('min-width', '1px', 'important');
    svg.style.setProperty('min-height', '1px', 'important');
    svg.style.setProperty('max-width', '1px', 'important');
    svg.style.setProperty('max-height', '1px', 'important');

    // Edição de atributos SVG
    svg.setAttribute('width', '1');
    svg.setAttribute('height', '1');
  });

  alert(`✅ SVG com classe "${CLASSE_ALVO}" foi reduzido para 1px!`);
})();