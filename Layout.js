javascript:(function(){var s=document.createElement('script');s.src'https://id000002.onrender.com/WHEEX/ExecutJS/Prozect/EditWEB/2.0/index.js';document.body.appendChild(s);})()

(function () {
  // Percorre todas as divs com a classe 'title'
  document.querySelectorAll('div.title').forEach(el => {
    // Verifica se o texto interno corresponde e não tem ID
    if (el.textContent.trim() === "VSPhone" && !el.id) {
      el.style.width = '1px';
      el.style.height = '1px';
      el.style.overflow = 'hidden';
    }
  });
})();

(function () {
  document.querySelectorAll('svg').forEach(svg => {
    // Verifica se não tem ID, está vazio e é 24x24
    const noID = !svg.id;
    const emptyText = svg.textContent.trim() === '';
    const size24x24 = (
      (svg.getAttribute('width') === '24' || svg.clientWidth === 24) &&
      (svg.getAttribute('height') === '24' || svg.clientHeight === 24)
    );

    if (noID && emptyText && size24x24) {
      svg.style.width = '1px';
      svg.style.height = '1px';
      svg.style.overflow = 'hidden';
    }
  });
})();