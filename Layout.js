(function () {
  const alvoLargura = 188;
  const alvoAltura = 188;

  const classesDetectadas = new Set();

  // Etapa 1: Encontrar elementos visíveis com tamanho 188x188 e salvar as classes
  document.querySelectorAll('*').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (Math.round(rect.width) === alvoLargura && Math.round(rect.height) === alvoAltura) {
      if (el.className && typeof el.className === 'string') {
        el.className.trim().split(/\s+/).forEach(cls => classesDetectadas.add(cls));
      }
    }
  });

  // Etapa 2: Editar elementos com classes detectadas
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

  alert('Elementos 188x188 detectados e reduzidos para 1px via classe!');
})();