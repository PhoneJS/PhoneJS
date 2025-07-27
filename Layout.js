(function () {
  const HISTORICO_ALVO = "188x188,133x24,97x24,24x24,22x22";

  const tamanhosAlvo = HISTORICO_ALVO.split(',').map(t => {
    const [w, h] = t.split('x').map(n => parseInt(n.trim()));
    return { largura: w, altura: h };
  });

  const classesDetectadas = new Set();
  const elementosOcultados = [];
  const vistos = new Set();

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

  // Etapa 1: Coleta classes com base em tamanho específico
  document.querySelectorAll('*').forEach(el => {
    const rect = el.getBoundingClientRect();
    const largura = Math.round(rect.width);
    const altura = Math.round(rect.height);
    const area = largura * altura;

    if (area < 100) return;

    const match = tamanhosAlvo.some(t => t.largura === largura && t.altura === altura);
    if (match) {
      getClassList(el).forEach(cls => classesDetectadas.add(cls));
    }
  });

  // Etapa 2: Oculta elementos com classes detectadas (evita duplicados por tag+id+tamanho)
  document.querySelectorAll('*').forEach(el => {
    const rect = el.getBoundingClientRect();
    const largura = Math.round(rect.width);
    const altura = Math.round(rect.height);
    const id = el.id || '__no_id__';
    const chave = `${el.tagName}::${id}::${largura}x${altura}`;
    if (vistos.has(chave)) return;
    vistos.add(chave);

    const classes = getClassList(el);
    const match = classes.some(cls => classesDetectadas.has(cls));

    if (match) {
      el.style.setProperty('display', 'none', 'important');
      elementosOcultados.push(`${el.tagName}${id !== '__no_id__' ? '#' + id : ''} (${largura}x${altura})`);
    }
  });

  alert(`✅ ${elementosOcultados.length} elementos ocultados com base no histórico!\n\nExemplos:\n` + elementosOcultados.slice(0, 5).join('\n'));
})();