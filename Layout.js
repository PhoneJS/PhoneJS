(function () {
  const HISTORICO_ALVO = "188x188,97x24,24x24"; // ← Defina os tamanhos aqui

  const tamanhosAlvo = HISTORICO_ALVO.split(',').map(t => {
    const [w, h] = t.split('x').map(n => parseInt(n.trim()));
    return { largura: w, altura: h };
  });

  const classesDetectadas = new Set();

  // Etapa 1: Identificar elementos com tamanho correspondente e coletar classes
  document.querySelectorAll('*').forEach(el => {
    const rect = el.getBoundingClientRect();
    const largura = Math.round(rect.width);
    const altura = Math.round(rect.height);

    const corresponde = tamanhosAlvo.some(t => t.largura === largura && t.altura === altura);

    if (corresponde && el.className && typeof el.className === 'string') {
      el.className.trim().split(/\s+/).forEach(cls => classesDetectadas.add(cls));
    }
  });

  // Etapa 2: Reduzir todos os elementos que tenham as classes detectadas
  document.querySelectorAll('*').forEach(el => {
    if (el.className && typeof el.className === 'string') {
      const classList = el.className.trim().split(/\s+/);
      const match = classList.some(cls => classesDetectadas.has(cls));
      if (match) {
        el.style.width = '1px';
        el.style.height = '1px';
        el.style.overflow = 'hidden';
      }
    }
  });

  alert('Elementos com tamanhos alvo foram reduzidos para 1px via classes!');
})();